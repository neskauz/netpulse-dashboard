
const devices = [
    { name: "Servidor Principal", ip: "192.168.1.1", status: "online", latency: 12 },
    { name: "Servidor DNS", ip: "192.168.1.2", status: "online", latency: 18 },
    { name: "Roteador Principal", ip: "192.168.1.254", status: "online", latency: 8 },
    { name: "Switch Sala 1", ip: "192.168.1.10", status: "offline", latency: 0 },
    { name: "Access Point", ip: "192.168.1.20", status: "online", latency: 25 },
    { name: "Servidor Backup", ip: "192.168.1.3", status: "offline", latency: 0 }
];

let currentFilter = "all";
let history = [];

history = JSON.parse(localStorage.getItem("netpulse-history")) || [];

function renderDashboard() {
    const online = devices.filter(d => d.status === "online");
    const offline = devices.filter(d => d.status === "offline");

    const average = online.length
        ? Math.round(online.reduce((sum, d) => sum + d.latency, 0) / online.length)
        : 0;

    document.getElementById("devices").textContent = devices.length;
    document.getElementById("online").textContent = online.length;
    document.getElementById("offline").textContent = offline.length;
    document.getElementById("latency").textContent = average + " ms";

    const list = document.getElementById("device-list");
    list.innerHTML = "";

    const filtered = devices.filter(device =>
        currentFilter === "all" || device.status === currentFilter
    );

    filtered.forEach(device => {
        const item = document.createElement("div");
        item.className = "device";

        const info = document.createElement("div");
        const name = document.createElement("strong");
        const ip = document.createElement("p");

        name.textContent = device.name;
        ip.textContent = device.ip;

        info.append(name, ip);

        const status = document.createElement("div");
        const indicator = document.createElement("span");
        const latency = document.createElement("p");

        indicator.className = device.status;
        indicator.textContent = device.status === "online" ? "● Online" : "● Offline";
        latency.textContent = device.status === "online" ? device.latency + " ms" : "—";

        status.append(indicator, latency);
        item.append(info, status);
        list.appendChild(item);
    });

    renderHistory();
}

function renderHistory() {
    const container = document.getElementById("latency-history");
    container.innerHTML = "";

    history.slice(-8).forEach(entry => {
        const item = document.createElement("div");
        item.className = "history-item";
        item.textContent = `${entry.time} — ${entry.latency} ms`;
        container.appendChild(item);
    });
}

document.getElementById("refresh-btn").addEventListener("click", () => {
    const online = devices.filter(d => d.status === "online");

    // Simulação: gera pequenas variações de latência.
    online.forEach(device => {
        device.latency = Math.max(1, device.latency + Math.round(Math.random() * 10 - 5));
    });

    const average = online.length
        ? Math.round(online.reduce((sum, d) => sum + d.latency, 0) / online.length)
        : 0;

    history.push({
        time: new Date().toLocaleTimeString("pt-BR"),
        latency: average
    });

if (history.length > 50) {
    history = history.slice(-50);
}

    
localStorage.setItem("netpulse-history", JSON.stringify(history));
    
    document.getElementById("last-update").textContent =
        "Última atualização: " + new Date().toLocaleTimeString("pt-BR");

    renderDashboard();
});

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
        button.classList.add("active");

        renderDashboard();
    });
});

renderDashboard();

