document.addEventListener("DOMContentLoaded", () => {
  const serverId = getServerIdFromUrl();

  if (serverId) {
    fetchServerDetails(serverId);
  }

  async function fetchServerDetails(serverId) {
    try {
      const serverSettings = await fetchApi(`/api/server/${serverId}`);
      populateSettings(serverSettings);
    } catch (error) {
      displayFeedback("Failed to fetch server details.", true);
    }
  }

  function populateSettings(settings) {
    document.getElementById("prefixInput").value = settings.prefix || "";
    populateChannelSelect("welcomeChannelSelect", settings.welcomeChannel);
    populateChannelSelect("leaveChannelSelect", settings.leaveChannel);
    populateChannelSelect("countingChannelSelect", settings.countingChannel);
    populateChannelSelect("associationsChannelSelect", settings.associationsChannel);
    populateChannelSelect("lastLetterChannelSelect", settings.lastLetterChannel);
    populateChannelSelect("logChannelSelect", settings.logChannel);
    document.getElementById("voiceChannelCreatorToggle").checked = settings.voiceChannelCreatorEnabled;
  }

  async function fetchApi(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok.");
    }
    return await response.json();
  }

  function populateChannelSelect(selectId, selectedChannel) {
    const selectElement = document.getElementById(selectId);
    fetchApi("/api/user/servers")
      .then((channels) => {
        channels.forEach((channel) => {
          const option = document.createElement("option");
          option.value = channel.id;
          option.textContent = channel.name;
          option.selected = channel.id === selectedChannel;
          selectElement.appendChild(option);
        });
      })
      .catch((error) => console.error("Error fetching channels:", error));
  }

  // Event listeners for save buttons
  document.getElementById("savePrefixBtn").addEventListener("click", () => {
    const newPrefix = document.getElementById("prefixInput").value;
    saveSettings({ prefix: newPrefix });
  });

  document.getElementById("saveWelcomeChannelBtn").addEventListener("click", () => {
    const welcomeChannel = document.getElementById("welcomeChannelSelect").value;
    saveSettings({ welcomeChannel });
  });

  document.getElementById("saveLeaveChannelBtn").addEventListener("click", () => {
    const leaveChannel = document.getElementById("leaveChannelSelect").value;
    saveSettings({ leaveChannel });
  });

  document.getElementById("saveCountingChannelBtn").addEventListener("click", () => {
    const countingChannel = document.getElementById("countingChannelSelect").value;
    saveSettings({ countingChannel });
  });

  document.getElementById("saveAssociationsChannelBtn").addEventListener("click", () => {
    const associationsChannel = document.getElementById("associationsChannelSelect").value;
    saveSettings({ associationsChannel });
  });

  document.getElementById("saveLastLetterChannelBtn").addEventListener("click", () => {
    const lastLetterChannel = document.getElementById("lastLetterChannelSelect").value;
    saveSettings({ lastLetterChannel });
  });

  document.getElementById("saveLogChannelBtn").addEventListener("click", () => {
    const logChannel = document.getElementById("logChannelSelect").value;
    saveSettings({ logChannel });
  });

  document.getElementById("saveVoiceChannelCreatorBtn").addEventListener("click", () => {
    const voiceChannelCreatorEnabled = document.getElementById("voiceChannelCreatorToggle").checked;
    saveSettings({ voiceChannelCreator: voiceChannelCreatorEnabled });
  });

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
        displayFeedback("Settings updated successfully.");
      } else {
        displayFeedback("Failed to update settings.", true);
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      displayFeedback("Error saving settings.", true);
    }
  }

  function displayFeedback(message, isError = false) {
    const feedbackDiv = document.getElementById("feedback");
    feedbackDiv.textContent = message;
    feedbackDiv.style.color = isError ? "red" : "green";
  }

  function getServerIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("serverId");
  }
});
