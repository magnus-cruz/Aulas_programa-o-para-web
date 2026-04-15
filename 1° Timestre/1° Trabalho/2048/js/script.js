const themeToggle = document.getElementById("input");
const themeLabel = document.getElementById("themeLabel");
const root = document.documentElement;
const loading = document.getElementById("loadingScreen");

function applyTheme(isDark) {
	root.setAttribute("data-theme", isDark ? "dark" : "light");
	themeLabel.textContent = isDark ? "Tema escuro" : "Tema claro";
	localStorage.setItem("caraCaraTheme", isDark ? "dark" : "light");
}

const savedTheme = localStorage.getItem("caraCaraTheme");
if (savedTheme === "dark") {
	themeToggle.checked = true;
	applyTheme(true);
}

themeToggle.addEventListener("change", () => {
	applyTheme(themeToggle.checked);
});

window.addEventListener("load", () => {
	setTimeout(() => {
		loading.classList.add("hidden");
	}, 1300);
});
