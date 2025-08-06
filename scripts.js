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

let initialHeight = window.innerHeight;

window.addEventListener("resize", () => {
  const currentHeight = window.innerHeight;
  const footer = document.querySelector("footer");
  if (!footer) return;
  if (currentHeight < initialHeight - 100) {
    footer.style.display = "none";
  } else {
    footer.style.display = "flex";
  }
});

function openNav() {
  document.getElementById("mySidenav").style.width = "85%";
  document.getElementById("container").style.opacity = "0.3";
  setTimeout(() => {
    document.getElementById("container").setAttribute("onclick", "closeNav()");
  },);
}

function closeNav() {
  document.getElementById("mySidenav").style.width = "0";
  document.getElementById("container").style.opacity = "1";
  document.getElementById("container").removeAttribute("onclick");
}