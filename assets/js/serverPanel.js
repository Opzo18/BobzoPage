document.addEventListener("DOMContentLoaded", () => {
  const serverId = getServerIdFromUrl();

  if (serverId) {
    fetchServerDetails(serverId);
  }

  // Fetch and display server details
  async function fetchServerDetails(serverId) {
    try {
      const response = await fetch(`/api/server/${serverId}`);
      const serverSettings = await response.json();

      // Populate the prefix input
      document.getElementById("prefixInput").value = serverSettings.prefix || "";

      // Populate welcome, leave, counting, associations, last letter, log channels
      populateChannelSelect("welcomeChannelSelect", serverSettings.welcomeChannel);
      populateChannelSelect("leaveChannelSelect", serverSettings.leaveChannel);
      populateChannelSelect("countingChannelSelect", serverSettings.countingChannel);
      populateChannelSelect("associationsChannelSelect", serverSettings.associationsChannel);
      populateChannelSelect("lastLetterChannelSelect", serverSettings.lastLetterChannel);
      populateChannelSelect("logChannelSelect", serverSettings.logChannel);

      // Set voice channel creator toggle
      document.getElementById("voiceChannelCreatorToggle").checked = serverSettings.voiceChannelCreatorEnabled;
    } catch (error) {
      console.error("Failed to fetch server details:", error);
    }
  }

  // Helper function to populate channel dropdowns
  function populateChannelSelect(selectId, selectedChannel) {
    const selectElement = document.getElementById(selectId);

    // Fetch server channels from API (replace with actual call to get channels)
    fetch(`/api/user/servers`) // Example, adapt as needed
      .then((response) => response.json())
      .then((channels) => {
        channels.forEach((channel) => {
          const option = document.createElement("option");
          option.value = channel.id;
          option.textContent = channel.name;

          if (channel.id === selectedChannel) {
            option.selected = true;
          }

          selectElement.appendChild(option);
        });
      })
      .catch((error) => console.error("Error fetching channels:", error));
  }

  // Save button listeners
  document.getElementById("savePrefixBtn").addEventListener("click", () => {
    const newPrefix = document.getElementById("prefixInput").value;
    saveSettings({ prefix: newPrefix });
  });

  document.getElementById("saveWelcomeChannelBtn").addEventListener("click", () => {
    const welcomeChannel = document.getElementById("welcomeChannelSelect").value;
    saveSettings({ welcomeChannel });
  });

  // Repeat for other settings...

  // Function to save server settings
  async function saveSettings(settings) {
    try {
      const response = await fetch(`/api/server/${serverId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        alert("Settings updated successfully");
      } else {
        alert("Failed to update settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  }

  function getServerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("serverId"); // Ensure serverId is passed in URL
  }
});
