if (localStorage.getItem("token") && localStorage.getItem("dealer")) {
    window.location.href = "index.html";
}

document.getElementById("loginForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    fetch("http://185.105.91.97:8080/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            username: username,
            password: password
        })
    })
        .then((res) => {
            if (!res.ok) {
                throw new Error("Login failed");
            }
            return res.json();
        })
        .then((data) => {
            console.log(data)
            localStorage.setItem("token", data.token || "");
            localStorage.setItem("dealer", JSON.stringify(data.dealer || {}));
            window.location.href = "index.html";
        })
        .catch((err) => {
            console.error(err);
        });
});
