document.addEventListener("DOMContentLoaded", function () {
  // Load footer and sidebar
  fetch("../assets/pages/footer.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector("footer").innerHTML = data;
    });

  fetch("../assets/pages/sidebar.html")
    .then((response) => response.text())
    .then((data) => {
      document.querySelector(".sidebar").innerHTML = data;
    });

  // Fetch and display command info
  fetch("/api/commands")
    .then((response) => response.json())
    .then((commands) => {
      const commandsList = document.getElementById("commands-list");
      commands.forEach((command) => {
        const commandCard = document.createElement("div");
        commandCard.className = "command-card";

        const commandHeader = document.createElement("div");
        commandHeader.className = "command-header";
        commandHeader.innerHTML = `
            <h2>${command.name}</h2>
            <p><strong>Usage:</strong> ${command.usage}</p>
          `;

        const commandDetails = document.createElement("div");
        commandDetails.className = "command-details";
        commandDetails.style.display = "none"; // Initially hidden
        commandDetails.innerHTML = `
            <p><strong>Description:</strong> ${command.description}</p>
            <p><strong>Category:</strong> ${command.category}</p>
          `;

        commandHeader.addEventListener("click", () => {
          // Toggle the details visibility with animation
          if (commandDetails.style.display === "none") {
            commandDetails.style.display = "block";
            commandDetails.style.maxHeight = commandDetails.scrollHeight + "px";
          } else {
            commandDetails.style.maxHeight = "0";
            setTimeout(() => {
              commandDetails.style.display = "none";
            }, 300); // Matches the duration of the animation
          }
        });

        commandCard.appendChild(commandHeader);
        commandCard.appendChild(commandDetails);
        commandsList.appendChild(commandCard);
      });
    })
    .catch(console.error);
});
