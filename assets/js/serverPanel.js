document.addEventListener("DOMContentLoaded", async () => {
  const serverId = getServerIdFromUrl();

  // Fetch server details and populate UI
  try {
    const serverDetails = await fetchServerDetails(serverId);
    if (serverDetails) {
      // Populate server name in the UI
      updateServerName(serverDetails.name);
    }
  } catch (error) {
    console.error("Error fetching server details:", error);
  }

  // Fetch and populate server channels
  try {
    const channels = await fetchServerChannels(serverId);
    if (channels) {
      populateChannelSelectOptions(channels);
      populateAdditionalSettingsSelectOptions(channels);
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

  const textChannels = data.textChannels || [];

  // Populate welcome and leave channels
  [welcomeChannelSelect, leaveChannelSelect, logChannelSelect].forEach((select) => {
    select.innerHTML = "";
    textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;
      select.appendChild(option);
    });
  });

  // Populate game channels
  [countingChannelSelect, associationsChannelSelect, lastLetterChannelSelect].forEach((select) => {
    select.innerHTML = "";
    textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;
      select.appendChild(option);
    });
  });
}

// Function to populate additional settings select options
function populateAdditionalSettingsSelectOptions(data) {
  const logsChannelSelect = document.getElementById("logsChannelSelect");
  const partnerChannelSelect = document.getElementById("partnerChannelSelect");
  const partnershipRoleSelect = document.getElementById("partnershipRoleSelect");
  const partnerPingRoleSelect = document.getElementById("partnerPingRoleSelect");
  const muteRoleSelect = document.getElementById("muteRoleSelect");

  const textChannels = data.textChannels || [];
  const roles = data.roles || []; // Assuming roles are fetched as well

  // Populate log and partner channels
  [logsChannelSelect, partnerChannelSelect].forEach((select) => {
    select.innerHTML = "";
    textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;
      select.appendChild(option);
    });
  });

  // Populate roles
  [partnershipRoleSelect, partnerPingRoleSelect, muteRoleSelect].forEach((select) => {
    select.innerHTML = "";
    roles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.text = role.name;
      select.appendChild(option);
    });
  });
}

// Function to update the server name in the UI
function updateServerName(name) {
  document.getElementById("serverName").textContent = name;
}

// Function to add save listeners for each setting
function addSaveListeners(serverId) {
  document.getElementById("savePrefixBtn").addEventListener("click", () => saveSetting(serverId, "prefix"));
  document.getElementById("saveWelcomeChannelBtn").addEventListener("click", () => saveSetting(serverId, "welcomeChannel"));
  document.getElementById("saveLeaveChannelBtn").addEventListener("click", () => saveSetting(serverId, "leaveChannel"));
  document.getElementById("saveCountingChannelBtn").addEventListener("click", () => saveSetting(serverId, "countingChannel"));
  document.getElementById("saveAssociationsChannelBtn").addEventListener("click", () => saveSetting(serverId, "associationsChannel"));
  document.getElementById("saveLastLetterChannelBtn").addEventListener("click", () => saveSetting(serverId, "lastLetterChannel"));
  document.getElementById("saveLogChannelBtn").addEventListener("click", () => saveSetting(serverId, "logChannel"));
  document.getElementById("saveVoiceChannelCreatorBtn").addEventListener("click", () => saveSetting(serverId, "voiceChannelCreator"));

  // New Listeners for additional settings
  document.getElementById("saveLogsChannelBtn").addEventListener("click", () => saveSetting(serverId, "logsChannel"));
  document.getElementById("savePartnerChannelBtn").addEventListener("click", () => saveSetting(serverId, "partnerChannel"));
  document.getElementById("savePartnershipRoleBtn").addEventListener("click", () => saveSetting(serverId, "partnershipRole"));
  document.getElementById("savePartnerPingRoleBtn").addEventListener("click", () => saveSetting(serverId, "partnerPingRole"));
  document.getElementById("saveMuteRoleBtn").addEventListener("click", () => saveSetting(serverId, "muteRole"));
}

// Function to save a setting
async function saveSetting(serverId, setting) {
  let settingValue;

  if (setting === "prefix") {
    settingValue = document.getElementById("prefixInput").value;
  } else if (setting === "voiceChannelCreator") {
    settingValue = document.getElementById("voiceChannelCreatorToggle").checked;
  } else {
    settingValue = document.getElementById(`${setting}Select`).value;
  }

  const settings = { [setting]: settingValue };

  // Simulate saving settings (you can add your API call here)
  console.log(`Saving ${setting} with value:`, settingValue);
  alert(`${setting} saved successfully!`); // Temporary alert for saving action
}

// Helper function to get serverId from URL
function getServerIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
