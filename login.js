async function submit(){

let email = document.getElementById("email").value;
let password = document.getElementById("password").value;

if(!email || !password){
alert("Заповни поля");
return;
}

let API_URL = "https://cryptoapp-eqc5.onrender.com";

let url = isLogin
? API_URL + "/login"
: API_URL + "/register";

try {

let res = await fetch(url, {
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({email,password})
});

let data = await res.json();

console.log(data);

if(data.success){

// 🔥 ТЕПЕР ПРАВИЛЬНО (через token)
if(data.token){
localStorage.setItem("token", data.token);
} else {
alert("Нема токена");
return;
}

alert("Успіх");

window.location.href = "index.html";

} else {
alert("Невірні дані або акаунт вже є");
}

} catch(err){
console.log(err);
alert("Сервер не працює");
}

}
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "login.html"));
});