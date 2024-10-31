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

  // Fetch and populate server prefixes
  try {
    const serverSettings = await fetchServerDetails(serverId);
    const prefix = serverSettings?.prefix || config.prefix;
    if (prefix) {
      const prefixInput = document.getElementById("prefixInput");
      prefixInput.value = prefix;
    }
  } catch (error) {
    console.error("Error fetching server prefixes:", error);
  }

  // Fetch and populate server channels
  try {
    const channels = await fetchServerChannels(serverId);
    if (channels) {
      populateSelectOptions(channels);
    }
  } catch (error) {
    console.error("Error fetching server channels:", error);
  }

  // Fetch and populate server roles
  try {
    const roles = await fetchServerRoles(serverId);
    if (roles) {
      populateRoleSelectOptions(roles);
    }
  } catch (error) {
    console.error("Error fetching server roles:", error);
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

// Function to fetch roles
async function fetchServerRoles(serverId) {
  const response = await fetch(`/api/server/${serverId}/roles`);
  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }
  const data = await response.json();
  console.log("Fetched Roles:", data); // Log fetched data to inspect
  return data.roles;
}

// Function to populate all channel and role select elements
function populateSelectOptions(data) {
  const welcomeChannelSelect = document.getElementById("welcomeChannelSelect");
  const leaveChannelSelect = document.getElementById("leaveChannelSelect");
  const countingChannelSelect = document.getElementById("countingChannelSelect");
  const associationsChannelSelect = document.getElementById("associationsChannelSelect");
  const lastLetterChannelSelect = document.getElementById("lastLetterChannelSelect");
  const logChannelSelect = document.getElementById("logChannelSelect");
  const partnerChannelSelect = document.getElementById("partnerChannelSelect");

  const voiceChannelCreatorSelect = document.getElementById("voiceChannelCreatorSelect");

  const textChannels = data.textChannels || [];
  const voiceChannels = data.voiceChannels || [];

  // Clear existing options for text channel select elements
  const textSelects = [
    welcomeChannelSelect,
    leaveChannelSelect,
    countingChannelSelect,
    associationsChannelSelect,
    lastLetterChannelSelect,
    logChannelSelect,
    partnerChannelSelect,
  ];

  textSelects.forEach((select) => {
    select.innerHTML = "";
    textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;
      select.appendChild(option);
    });
  });

  // Populate voice channels for the voice channel creator
  voiceChannelCreatorSelect.innerHTML = "";
  voiceChannels.forEach((channel) => {
    const option = document.createElement("option");
    option.value = channel.id;
    option.text = channel.name;
    voiceChannelCreatorSelect.appendChild(option);
  });
}

// Function to populate role select elements
function populateRoleSelectOptions(roles) {
  const partnershipRoleSelect = document.getElementById("partnershipRoleSelect");
  const partnerPingRoleSelect = document.getElementById("partnerPingRoleSelect");
  const partnerRoleSelect = document.getElementById("partnerRoleSelect");
  const muteRoleSelect = document.getElementById("muteRoleSelect");

  [partnershipRoleSelect, partnerPingRoleSelect, muteRoleSelect, partnerRoleSelect].forEach((select) => {
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
  document.getElementById("savePartnershipRoleBtn").addEventListener("click", () => saveSetting(serverId, "partnershipRole"));
  document.getElementById("savePartnerPingRoleBtn").addEventListener("click", () => saveSetting(serverId, "partnerPingRole"));
  document.getElementById("saveMuteRoleBtn").addEventListener("click", () => saveSetting(serverId, "muteRole"));
}

// Function to save a setting
async function saveSetting(serverId, setting) {
  let settingValue;

  if (setting === "prefix") {
    settingValue = document.getElementById("prefixInput").value;
    if (!settingValue) {
      alert("Prefix cannot be empty!");
      return;
    }
  } else if (setting === "voiceChannelCreator") {
    settingValue = document.getElementById("voiceChannelCreatorSelect").value;
  } else {
    settingValue = document.getElementById(`${setting}Select`).value;
  }

  const settings = { [setting]: settingValue };

  // Simulate saving settings (you can add your API call here)
  console.log(`Saving ${setting} with value:`, settingValue);
  alert(`${setting} saved successfully!`);
}

// Helper function to get serverId from URL
function getServerIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}
