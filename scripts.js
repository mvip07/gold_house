function openNav() {
    document.getElementById("mySidenav").classList.add("translate-x-0");
    document.getElementById("mySidenav").classList.remove("-translate-x-full");
}

function closeNav() {
    document.getElementById("mySidenav").classList.remove("translate-x-0");
    document.getElementById("mySidenav").classList.add("-translate-x-full");
}

document.addEventListener("click", function (event) {
    const sidenav = document.getElementById("mySidenav");
    const toggleButton = document.querySelector("button[onclick='openNav()']");
    if (!sidenav.contains(event.target) && !toggleButton.contains(event.target)) {
        closeNav();
    }
});

document.getElementById("theme-toggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});