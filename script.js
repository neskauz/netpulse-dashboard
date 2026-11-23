
const devices = [
    { name: "Servidor Principal", ip: "192.168.1.1", status: "online", latency: 12 },
    { name: "Servidor DNS", ip: "192.168.1.2", status: "online", latency: 18 },
    { name: "Roteador Principal", ip: "192.168.1.254", status: "online", latency: 8 },
    { name: "Switch Sala 1", ip: "192.168.1.10", status: "offline", latency: 0 },
    { name: "Access Point", ip: "192.168.1.20", status: "online", latency: 25 },
    { name: "Servidor Backup", ip: "192.168.1.3", status: "offline", latency: 0 }
];

function renderDashboard() {
    const online = devices.filter(device => device.status === "online").length;
    const offline = devices.length - online;

    const latencies = devices
        .filter(device => device.status === "online")
        .map(device => device.latency);

    const average = latencies.length
        ? Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length)
        : 0;

    document.getElementById("devices").textContent = devices.length;
    document.getElementById("online").textContent = online;
    document.getElementById("offline").textContent = offline;
    document.getElementById("latency").textContent = average + " ms";

    const list = document.getElementById("device-list");
    list.innerHTML = "";

    devices.forEach(device => {
        const item = document.createElement("div");
        item.className = "device";

        item.innerHTML = `
            <div>
                <strong>${device.name}</strong>
                <p>${device.ip}</p>
            </div>
            <div>
                <span class="${device.status}">
                    ${device.status === "online" ? "● Online" : "● Offline"}
                </span>
                <p>${device.status === "online" ? device.latency + " ms" : "—"}</p>
            </div>
        `;

        list.appendChild(item);
    });
}

renderDashboard();


const refreshButton = document.getElementById("refresh-btn");
const lastUpdate = document.getElementById("last-update");

refreshButton.addEventListener("click", () => {
    renderDashboard();

    const now = new Date();

    lastUpdate.textContent =
        "Última atualização: " +
        now.toLocaleTimeString("pt-BR");
});

