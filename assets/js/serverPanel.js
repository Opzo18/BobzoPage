document.addEventListener("DOMContentLoaded", async () => {
  const serverId = getServerIdFromUrl();

  // Fetch server details and populate UI
  try {
    const serverDetails = await fetchServerDetails(serverId);
    if (serverDetails) {
      updateServerName(serverDetails.name);
      updateServerAvatar(serverId);
      updateServerPrefix(serverId);

      const channels = await fetchServerChannels(serverId);
      if (channels) {
        populateSelectOptions(channels, serverDetails);
      }

      const roles = await fetchServerRoles(serverId);
      if (roles) {
        populateRoleSelectOptions(roles, serverDetails);
      }
    }
  } catch (error) {
    console.error("Error initializing server settings:", error);
  }

  // Add save button listeners for each setting
  addSaveListeners(serverId);
});

// Fetch server details
async function fetchServerDetails(serverId) {
  try {
    const response = await fetch(`/api/server/${serverId}`);
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch server details:", error);
    return { error: "Failed to fetch server details" };
  }
}

// Fetch channels
async function fetchServerChannels(serverId) {
  const response = await fetch(`/api/server/${serverId}/channels`);
  if (!response.ok) throw new Error("Failed to fetch channels");
  return await response.json();
}

// Fetch roles
async function fetchServerRoles(serverId) {
  const response = await fetch(`/api/server/${serverId}/roles`);
  if (!response.ok) throw new Error("Failed to fetch roles");
  return (await response.json()).roles;
}

// Populate text and voice channel options
function populateSelectOptions(data, serverDetails) {
  const textSelects = [
    { select: "welcomeChannelSelect", defaultChannelId: serverDetails.welcomeChannel },
    { select: "leaveChannelSelect", defaultChannelId: serverDetails.leaveChannel },
    { select: "countingChannelSelect", defaultChannelId: serverDetails.countingChannel },
    { select: "associationsChannelSelect", defaultChannelId: serverDetails.associationsChannel },
    { select: "lastLetterChannelSelect", defaultChannelId: serverDetails.lastLetterChannel },
    { select: "logChannelSelect", defaultChannelId: serverDetails.logsChannel },
    { select: "partnerChannelSelect", defaultChannelId: serverDetails.partnerChannel }
  ];

  textSelects.forEach(({ select, defaultChannelId }) => {
    const selectElement = document.getElementById(select);
    selectElement.innerHTML = "";
    data.textChannels.forEach((channel) => {
      const option = document.createElement("option");
      option.value = channel.id;
      option.text = channel.name;
      if (channel.id === defaultChannelId) option.selected = true;
      selectElement.appendChild(option);
    });
  });

  const voiceChannelCreatorSelect = document.getElementById("voiceChannelCreatorSelect");
  voiceChannelCreatorSelect.innerHTML = "";
  data.voiceChannels.forEach((channel) => {
    const option = document.createElement("option");
    option.value = channel.id;
    option.text = channel.name;
    if (channel.id === serverDetails.voiceChannelCreator) option.selected = true;
    voiceChannelCreatorSelect.appendChild(option);
  });
}

// Populate roles with default roles
function populateRoleSelectOptions(roles, serverDetails) {
  const roleSelects = [
    { select: "partnershipRoleSelect", defaultRoleId: serverDetails.partnershipRole },
    { select: "partnerPingRoleSelect", defaultRoleId: serverDetails.partnerPingRole },
    { select: "partnerRoleSelect", defaultRoleId: serverDetails.partnerRole },
    { select: "muteRoleSelect", defaultRoleId: serverDetails.muteRole }
  ];

  roleSelects.forEach(({ select, defaultRoleId }) => {
    const selectElement = document.getElementById(select);
    selectElement.innerHTML = "";
    roles.forEach((role) => {
      const option = document.createElement("option");
      option.value = role.id;
      option.text = role.name;
      if (role.id === defaultRoleId) option.selected = true;
      selectElement.appendChild(option);
    });
  });
}

// Update server name, avatar, and prefix
function updateServerName(name) {
  document.getElementById("serverName").textContent = name;
}

async function updateServerAvatar(serverId) {
  try {
    const avatarData = await (await fetch(`/api/server/${serverId}/avatar`)).json();
    document.getElementById("serverAvatar").src = avatarData.avatar;
  } catch (error) {
    console.error("Error updating server avatar:", error);
  }
}

async function updateServerPrefix(serverId) {
  try {
    const prefixData = await (await fetch(`/api/server/${serverId}/prefix`)).json();
    document.getElementById("prefixInput").value = prefixData.prefix;
  } catch (error) {
    console.error("Error updating server prefix:", error);
  }
}

// Add 'click' event listeners to all save buttons
function addSaveListeners(serverId) {
  document.querySelectorAll(".save-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const setting = btn.id.replace("save", "").replace("Btn", "");
      saveSetting(serverId, setting.charAt(0).toLowerCase() + setting.slice(1));
    });
  });
}

// Save individual setting
async function saveSetting(serverId, setting) {
  const settingValue = document.getElementById(setting === "prefix" ? "prefixInput" : `${setting}Select`).value;

  if (setting === "prefix" && !settingValue) {
    alert("Prefix cannot be empty!");
    return;
  }

  const settings = { [setting]: settingValue };

  try {
    const response = await fetch(`/api/server/${serverId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    if (response.ok) {
      alert(`${setting} saved successfully!`);
    } else {
      throw new Error("Error saving the setting");
    }
  } catch (error) {
    console.error(`Error saving ${setting}:`, error);
    alert("Failed to save the setting.");
  }
}

// Helper function to get serverId from URL
function getServerIdFromUrl() {
  return new URLSearchParams(window.location.search).get("id");
}
