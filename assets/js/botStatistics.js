document.addEventListener("DOMContentLoaded", () => {
  // Function to fetch and update bot stats
  const updateBotStats = async () => {
    try {
      // Fetch bot stats from your bot API or a local endpoint
      const response = await fetch("/api/bot-stats");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Check if the data object contains the expected properties
      if (data.overview) {
        // Update the statistics on the page
        document.getElementById("total-servers").textContent = data.overview.totalServers || "N/A";
        document.getElementById("total-users").textContent = data.overview.totalUsers || "N/A";
        document.getElementById("total-channels").textContent = data.overview.totalChannels || "N/A";
      } else {
        console.error("Unexpected data format:", data);
        // Handle unexpected data format
        document.getElementById("total-servers").textContent = "N/A";
        document.getElementById("total-users").textContent = "N/A";
        document.getElementById("total-channels").textContent = "N/A";
      }
    } catch (error) {
      console.error("Error fetching bot stats:", error);
      // Handle fetch error
      document.getElementById("total-servers").textContent = "Error";
      document.getElementById("total-users").textContent = "Error";
      document.getElementById("total-channels").textContent = "Error";
    }
  };

  // Function to update uptime value
  const updateUptime = async () => {
    try {
      const response = await fetch("/api/bot-stats");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Check if the data object contains the expected properties
      if (data.metrics) {
        // Update the uptime value on the page
        document.getElementById("bot-uptime").textContent = data.metrics.uptime || "N/A";
      } else {
        console.error("Unexpected data format:", data);
        document.getElementById("bot-uptime").textContent = "N/A";
      }
    } catch (error) {
      console.error("Error fetching bot uptime:", error);
      document.getElementById("bot-uptime").textContent = "Error";
    }
  };

  // Function to update ping value
  const updatePing = async () => {
    try {
      const response = await fetch("/api/bot-stats");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Check if the data object contains the expected properties
      if (data.metrics) {
        // Update the ping value on the page
        document.getElementById("bot-ping").textContent = data.metrics.ping || "N/A";
      } else {
        console.error("Unexpected data format:", data);
        document.getElementById("bot-ping").textContent = "N/A";
      }
    } catch (error) {
      console.error("Error fetching bot ping:", error);
      document.getElementById("bot-ping").textContent = "Error";
    }
  };

  // Function to update database latency value
  const updateDbLatency = async () => {
    try {
      const response = await fetch("/api/bot-stats");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();

      // Check if the data object contains the expected properties
      if (data.metrics) {
        // Update the database latency value on the page
        document.getElementById("db-latency").textContent = data.metrics.dbLatency || "N/A";
      } else {
        console.error("Unexpected data format:", data);
        document.getElementById("db-latency").textContent = "N/A";
      }
    } catch (error) {
      console.error("Error fetching bot database latency:", error);
      document.getElementById("db-latency").textContent = "Error";
    }
  };

  // Initial fetch
  updateBotStats();
  updateUptime();
  updatePing();
  updateDbLatency();

  // Refresh stats
  setInterval(updateBotStats, 300000); // Every 5 minutes
  setInterval(updatePing, 20000); // Every 20 seconds
  setInterval(updateUptime, 1000); // Every second
  setInterval(updateDbLatency, 300000); // Every 5 minutes
});
