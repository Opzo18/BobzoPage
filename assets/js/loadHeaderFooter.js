document.addEventListener("DOMContentLoaded", function () {
  // Load footer
  fetch("../assets/pages/footer.html")
    .then((response) => response.text())
    .then((data) => {
      const footer = document.querySelector("footer");
      if (footer) {
        footer.innerHTML = data;
      }
    });

  // Load navigation
  // fetch("../assets/pages/nav.html")
  //   .then((response) => response.text())
  //   .then((data) => {
  //     const header = document.querySelector("header");
  //     if (header) {
  //       header.innerHTML = data;

  //       // Load and initialize toggleMenu.js after nav.html is inserted
  //       const script = document.createElement("script");
  //       script.src = "../assets/js/toggleMenu.js";
  //       document.body.appendChild(script);
  //     }
  //   });

  // Load sidebar
  fetch("../assets/pages/sidebar.html")
    .then((response) => response.text())
    .then((data) => {
      const sidebar = document.querySelector(".sidebar");
      if (sidebar) {
        sidebar.innerHTML = data;
      }
    });

  // Fetch user info
  // fetch("/api/userinfo")
  //   .then((response) => response.json())
  //   .then((user) => {
  //     const avatarUrl = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  //     document.getElementById("avatar").src = avatarUrl;
  //   })
  //   .catch(console.error);
});
