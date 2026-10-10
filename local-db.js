const fs = require("fs");
const path = require("path");

const TABLES = ["users", "signals", "settings"];

function createEmptyState() {
  return {
    users: [],
    signals: [],
    settings: [],
    counters: {
      users: 0,
      signals: 0,
      settings: 0
    }
  };
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object, key);
}

function normalizeState(raw) {
  const state = raw && typeof raw === "object" ? raw : createEmptyState();
  for (const table of TABLES) {
    if (!Array.isArray(state[table])) state[table] = [];
  }
  if (!state.counters || typeof state.counters !== "object") state.counters = {};
  for (const table of TABLES) {
    const maxId = state[table].reduce((max, row) => Math.max(max, Number(row.id) || 0), 0);
    state.counters[table] = Math.max(Number(state.counters[table]) || 0, maxId);
  }
  return state;
}

function parseFields(fields) {
  if (!fields || fields === "*") return null;
  return String(fields)
    .split(",")
    .map(field => field.trim())
    .filter(Boolean);
}

function projectRow(row, fields) {
  if (!row || !fields) return clone(row);
  const output = {};
  for (const field of fields) output[field] = row[field];
  return output;
}

function compareValues(left, right) {
  if (left === right) return 0;
  const leftTime = typeof left === "string" ? Date.parse(left) : NaN;
  const rightTime = typeof right === "string" ? Date.parse(right) : NaN;
  if (Number.isFinite(leftTime) && Number.isFinite(rightTime)) return leftTime - rightTime;
  if (left == null) return -1;
  if (right == null) return 1;
  return left > right ? 1 : -1;
}

class LocalQuery {
  constructor(database, table) {
    this.database = database;
    this.table = table;
    this.operation = null;
    this.filters = [];
    this.selectedFields = null;
    this.countMode = false;
    this.head = false;
    this.limitSize = null;
    this.orderBy = null;
    this.insertRows = null;
    this.updateValues = null;
    this.singleMode = null;
  }

  select(fields = "*", options = {}) {
    if (!this.operation) this.operation = "select";
    this.selectedFields = parseFields(fields);
    this.countMode = options?.count === "exact";
    this.head = Boolean(options?.head);
    return this;
  }

  insert(rows) {
    this.operation = "insert";
    this.insertRows = Array.isArray(rows) ? rows : [rows];
    return this;
  }

  update(values) {
    this.operation = "update";
    this.updateValues = values && typeof values === "object" ? values : {};
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  eq(column, value) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }

  neq(column, value) {
    this.filters.push({ type: "neq", column, value });
    return this;
  }

  in(column, values) {
    this.filters.push({ type: "in", column, values: Array.isArray(values) ? values : [] });
    return this;
  }

  order(column, options = {}) {
    this.orderBy = { column, ascending: options.ascending !== false };
    return this;
  }

  limit(count) {
    const parsed = Number(count);
    this.limitSize = Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
    return this;
  }

  single() {
    this.singleMode = "single";
    return this.execute();
  }

  maybeSingle() {
    this.singleMode = "maybeSingle";
    return this.execute();
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  async execute() {
    return this.database.run(this);
  }
}

class LocalDb {
  constructor(filePath) {
    this.filePath = filePath;
    this.state = this.load();
    this.queue = Promise.resolve();
  }

  from(table) {
    if (!TABLES.includes(table)) throw new Error(`Unknown table: ${table}`);
    return new LocalQuery(this, table);
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) return createEmptyState();
      const raw = JSON.parse(fs.readFileSync(this.filePath, "utf8"));
      return normalizeState(raw);
    } catch (error) {
      console.error("LOCAL DB LOAD ERROR:", error);
      return createEmptyState();
    }
  }

  save() {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    const tempPath = `${this.filePath}.tmp`;
    fs.writeFileSync(tempPath, `${JSON.stringify(this.state, null, 2)}\n`);
    fs.renameSync(tempPath, this.filePath);
  }

  async run(query) {
    this.queue = this.queue.then(() => this.execute(query));
    return this.queue;
  }

  execute(query) {
    try {
      const result = this.executeUnsafe(query);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.resolve({ data: null, error, count: null });
    }
  }

  executeUnsafe(query) {
    if (query.operation === "insert") return this.insert(query);
    if (query.operation === "update") return this.update(query);
    if (query.operation === "delete") return this.delete(query);
    return this.select(query);
  }

  tableRows(table) {
    if (!Array.isArray(this.state[table])) this.state[table] = [];
    return this.state[table];
  }

  matches(row, filters) {
    return filters.every(filter => {
      if (filter.type === "eq") return row[filter.column] === filter.value;
      if (filter.type === "neq") return row[filter.column] !== filter.value;
      if (filter.type === "in") return filter.values.includes(row[filter.column]);
      return true;
    });
  }

  filteredRows(query) {
    let rows = this.tableRows(query.table).filter(row => this.matches(row, query.filters));
    if (query.orderBy) {
      const { column, ascending } = query.orderBy;
      rows = [...rows].sort((a, b) => {
        const result = compareValues(a[column], b[column]);
        return ascending ? result : -result;
      });
    } else {
      rows = [...rows];
    }
    if (query.limitSize !== null) rows = rows.slice(0, query.limitSize);
    return rows;
  }

  formatRows(rows, query) {
    const projected = rows.map(row => projectRow(row, query.selectedFields));
    if (query.singleMode === "single") {
      if (projected.length !== 1) return { data: null, error: new Error("Expected a single row"), count: null };
      return { data: projected[0], error: null, count: null };
    }
    if (query.singleMode === "maybeSingle") {
      if (projected.length > 1) return { data: null, error: new Error("Expected one row or no rows"), count: null };
      return { data: projected[0] || null, error: null, count: null };
    }
    return { data: query.head ? null : projected, error: null, count: query.countMode ? rows.length : null };
  }

  select(query) {
    const rows = this.filteredRows(query);
    return this.formatRows(rows, query);
  }

  insert(query) {
    const rows = this.tableRows(query.table);
    const inserted = query.insertRows.map(input => {
      const row = clone(input) || {};
      this.state.counters[query.table] = (Number(this.state.counters[query.table]) || 0) + 1;
      if (!hasOwn(row, "id") || row.id == null) row.id = this.state.counters[query.table];
      if (!hasOwn(row, "created_at") || !row.created_at) row.created_at = new Date().toISOString();
      rows.push(row);
      return row;
    });
    this.save();
    return this.formatRows(inserted, query);
  }

  update(query) {
    const rows = this.tableRows(query.table);
    const updated = [];
    for (const row of rows) {
      if (this.matches(row, query.filters)) {
        Object.assign(row, clone(query.updateValues));
        updated.push(row);
      }
    }
    this.save();
    return this.formatRows(updated, query);
  }

  delete(query) {
    const rows = this.tableRows(query.table);
    const kept = [];
    let removed = 0;
    for (const row of rows) {
      if (this.matches(row, query.filters)) {
        removed += 1;
      } else {
        kept.push(row);
      }
    }
    this.state[query.table] = kept;
    if (removed) this.save();
    return { data: null, error: null, count: null };
  }
}

function createLocalDb(filePath) {
  return new LocalDb(filePath);
}

module.exports = { createLocalDb };
