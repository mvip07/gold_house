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

tailwind.config = {
    darkMode: 'class',
};

const toggleBtn = document.getElementById('theme-toggle');
const html = document.documentElement;

if (localStorage.theme === 'dark') {
    html.classList.add('dark');
    html.classList.remove('light');
}
toggleBtn.addEventListener('click', () => {
    const isDark = html.classList.toggle('dark');
    localStorage.theme = isDark ? 'dark' : 'light';
});