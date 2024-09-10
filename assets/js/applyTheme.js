document.addEventListener("DOMContentLoaded", () => {


  // Apply theme from localStorage
  const themeLink = document.getElementById("theme-link");
  const currentTheme = localStorage.getItem("theme") || "light";
  themeLink.setAttribute("href", currentTheme === "dark" ? "../assets/css/dark-theme.css" : "../assets/css/light-theme.css");
});
