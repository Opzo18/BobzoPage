document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Fetch bot stats from your bot API or a local endpoint
    const response = await fetch("/api/bot-stats");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();

    // Check if the data object contains the expected properties
    if (data.overview && data.metrics) {
      // Update the statistics on the page
      document.getElementById("total-servers").textContent = data.overview.totalServers;
      document.getElementById("total-users").textContent = data.overview.totalUsers;
      document.getElementById("total-channels").textContent = data.overview.totalChannels;
      document.getElementById("bot-ping").textContent = data.metrics.ping;
      document.getElementById("bot-uptime").textContent = data.metrics.uptime;
    } else {
      console.error("Unexpected data format:", data);
      // Handle unexpected data format
      document.getElementById("total-servers").textContent = "N/A";
      document.getElementById("total-users").textContent = "N/A";
      document.getElementById("total-channels").textContent = "N/A";
      document.getElementById("bot-ping").textContent = "N/A";
      document.getElementById("bot-uptime").textContent = "N/A";
    }
  } catch (error) {
    console.error("Error fetching bot stats:", error);
    // Handle fetch error
    document.getElementById("total-servers").textContent = "Error";
    document.getElementById("total-users").textContent = "Error";
    document.getElementById("total-channels").textContent = "Error";
    document.getElementById("bot-ping").textContent = "Error";
    document.getElementById("bot-uptime").textContent = "Error";
  }
});
