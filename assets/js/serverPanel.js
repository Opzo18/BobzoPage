document.addEventListener("DOMContentLoaded", async () => {
  const serverId = getServerIdFromUrl();

  // Fetch server details and populate UI
  try {
    const serverDetails = await fetchServerDetails(serverId);
    if (serverDetails) {
      // Populate server
      updateServerName(serverDetails.name);
      updateServerAvatar(serverId);
      updateServerPrefix(serverId);

      // Fetch and populate server channels with default channels
      const channels = await fetchServerChannels(serverId);
      if (channels) {
        populateSelectOptions(channels, serverDetails);
      }

      // Fetch and populate server roles
      const roles = await fetchServerRoles(serverId);
      if (roles) {
        populateRoleSelectOptions(roles);
      }
    }
  } catch (error) {
    console.error("Error initializing server settings:", error);
  }

  // Add event listener for save buttons for each setting
  addSaveListeners(serverId);
});

// Function to fetch server details
async function fetchServerDetails(serverId) {
  try {
    const response = await fetch(`/api/server/${serverId}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch server details:", error);
    return { error: "Failed to fetch server details" };
  }
}

// Function to fetch channels
async function fetchServerChannels(serverId) {
  const response = await fetch(`/api/server/${serverId}/channels`);
  if (!response.ok) {
    throw new Error("Failed to fetch channels");
  }
  const data = await response.json();
  return data;
}

// Function to fetch roles
async function fetchServerRoles(serverId) {
  const response = await fetch(`/api/server/${serverId}/roles`);
  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }
  const data = await response.json();
  return data.roles;
}

// Function to populate all channel and role select elements
function populateSelectOptions(data, serverDetails) {
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

  const textSelects = [
    { select: welcomeChannelSelect, defaultChannelId: serverDetails.welcomeChannel },
    { select: leaveChannelSelect, defaultChannelId: serverDetails.leaveChannel },
    { select: countingChannelSelect, defaultChannelId: serverDetails.countingChannel },
    { select: associationsChannelSelect, defaultChannelId: serverDetails.associationsChannel },
    { select: lastLetterChannelSelect, defaultChannelId: serverDetails.lastLetterChannel },
    { select: logChannelSelect, defaultChannelId: serverDetails.logsChannel },
    { select: partnerChannelSelect, defaultChannelId: serverDetails.partnerChannel },
  ];

  textSelects.forEach(({ select, defaultChannelId }) => {
    select.innerHTML = "";
    textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;

      // Set the default option if it matches the saved channel ID
      if (channel.id === defaultChannelId) {
        option.selected = true;
      }

      select.appendChild(option);
    });
  });

  // Populate voice channels for the voice channel creator
  voiceChannelCreatorSelect.innerHTML = "";
  voiceChannels.forEach((channel) => {
    const option = document.createElement("option");
    option.value = channel.id;
    option.text = channel.name;

    // Set default option for the voice channel creator if it matches
    if (channel.id === serverDetails.voiceChannelCreator) {
      option.selected = true;
    }

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

// Function to update the server name
function updateServerName(name) {
  document.getElementById("serverName").textContent = name;
}

// Update server avatar
async function updateServerAvatar(serverId) {
  const serverAvatar = document.getElementById("serverAvatar");
  try {
    const avatarResponse = await fetch(`/api/server/${serverId}/avatar`);
    const avatarData = await avatarResponse.json();
    serverAvatar.src = avatarData.avatar;
  } catch (error) {
    console.error("Error updating server avatar:", error);
  }
}

// Update server prefix
async function updateServerPrefix(serverId) {
  const serverPrefix = document.getElementById("prefixInput");
  try {
    const prefixResponse = await fetch(`/api/server/${serverId}/prefix`);
    const prefixData = await prefixResponse.json();
    serverPrefix.value = prefixData.prefix;
  } catch (error) {
    console.error("Error updating server prefix:", error);
  }
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
