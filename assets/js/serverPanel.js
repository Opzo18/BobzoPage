document.addEventListener("DOMContentLoaded", async () => {
  const serverId = getServerIdFromUrl();

  // Fetch server details and populate UI
  try {
    const serverDetails = await fetchServerDetails(serverId);
    if (serverDetails) {
      updateServerName(serverDetails.name); // Populate server name in the UI
    }
  } catch (error) {
    console.error("Error fetching server details:", error);
  }

  // Fetch and populate server channels
  try {
    const channels = await fetchServerChannels(serverId);
    if (channels) {
      populateChannelSelectOptions(channels);
    }
  } catch (error) {
    console.error("Error fetching server channels:", error);
  }

  // Add event listener for save buttons for each setting
  addSaveListeners(serverId);
});

// Function to fetch server details (e.g., server name)
async function fetchServerDetails(serverId) {
  const response = await fetch(`/api/server/${serverId}`);
  const data = await response.json();
  return data;
}

// Function to fetch channels
async function fetchServerChannels(serverId) {
  const response = await fetch(`/api/server/${serverId}/channels`);
  if (!response.ok) {
    throw new Error("Failed to fetch channels");
  }
  const data = await response.json();
  console.log("Fetched Channels:", data); // Log fetched data to inspect
  return data;
}

// Function to populate the channel select elements
function populateChannelSelectOptions(data) {
  const welcomeChannelSelect = document.getElementById("welcomeChannelSelect");
  const leaveChannelSelect = document.getElementById("leaveChannelSelect");
  const countingChannelSelect = document.getElementById("countingChannelSelect");
  const associationsChannelSelect = document.getElementById("associationsChannelSelect");
  const lastLetterChannelSelect = document.getElementById("lastLetterChannelSelect");
  const logChannelSelect = document.getElementById("logChannelSelect");

  // Populate channels for each dropdown (this example focuses on text channels)
  const selects = [
    welcomeChannelSelect,
    leaveChannelSelect,
    countingChannelSelect,
    associationsChannelSelect,
    lastLetterChannelSelect,
    logChannelSelect,
  ];

  selects.forEach((select) => {
    select.innerHTML = ""; // Clear previous options

    if (data.textChannels && data.textChannels.length > 0) {
      data.textChannels.forEach((channel) => {
        const option = document.createElement("option");
        option.value = channel.id;
        option.text = channel.name;
        select.appendChild(option);
      });
    } else {
      const option = document.createElement("option");
      option.value = "";
      option.text = "No channels available";
      select.appendChild(option);
    }
  });
}

// Function to add event listeners to all the save buttons
function addSaveListeners(serverId) {
  document.getElementById("savePrefixBtn").addEventListener("click", () => saveSetting(serverId, "prefix"));
  document.getElementById("saveWelcomeChannelBtn").addEventListener("click", () => saveSetting(serverId, "welcomeChannel"));
  document.getElementById("saveLeaveChannelBtn").addEventListener("click", () => saveSetting(serverId, "leaveChannel"));
  document.getElementById("saveCountingChannelBtn").addEventListener("click", () => saveSetting(serverId, "countingChannel"));
  document.getElementById("saveAssociationsChannelBtn").addEventListener("click", () => saveSetting(serverId, "associationsChannel"));
  document.getElementById("saveLastLetterChannelBtn").addEventListener("click", () => saveSetting(serverId, "lastLetterChannel"));
  document.getElementById("saveLogChannelBtn").addEventListener("click", () => saveSetting(serverId, "logChannel"));
}

// Function to save settings (depending on which setting you're saving)
async function saveSetting(serverId, setting) {
  let settingValue;

  // Handle the prefix case separately since it's an input, not a select
  if (setting === "prefix") {
    settingValue = document.getElementById("prefixInput").value;
  } else {
    settingValue = document.getElementById(`${setting}Select`).value;
  }

  const settings = { [setting]: settingValue };

  try {
    const response = await fetch(`/api/server/${serverId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(settings),
    });

    if (response.ok) {
      alert("Settings saved successfully!");
    } else {
      throw new Error("Failed to save settings");
    }
  } catch (error) {
    console.error(`Error saving ${setting} setting:`, error);
    alert(`Failed to save ${setting} setting. Please try again.`);
  }
}

// Utility function to update the server name in the UI
function updateServerName(serverName) {
  const serverNameElement = document.querySelector("h1"); // You may want a more specific selector
  if (serverNameElement) {
    serverNameElement.textContent = `Server Settings for ${serverName}`;
  } else {
    console.error("Server name element not found in the HTML.");
  }
}

// Utility function to get the server ID from the URL
function getServerIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
