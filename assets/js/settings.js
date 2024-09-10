document.addEventListener("DOMContentLoaded", () => {
  const themeLink = document.getElementById("theme-link");
  const themeToggleButton = document.getElementById("theme-toggle");

  // Load theme from localStorage
  const currentTheme = localStorage.getItem("theme") || "light";
  themeLink.setAttribute("href", currentTheme === "dark" ? "../assets/css/dark-theme.css" : "../assets/css/light-theme.css");
  themeToggleButton.textContent = currentTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode";

  themeToggleButton.addEventListener("click", () => {
    const isDarkMode = themeLink.getAttribute("href").includes("dark-theme.css");
    themeLink.setAttribute("href", isDarkMode ? "../assets/css/light-theme.css" : "../assets/css/dark-theme.css");
    themeToggleButton.textContent = isDarkMode ? "Switch to Dark Mode" : "Switch to Light Mode";
    localStorage.setItem("theme", isDarkMode ? "light" : "dark");
  });
});
