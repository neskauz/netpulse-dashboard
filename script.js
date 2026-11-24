let devices = [];
let currentFilter = "all";
let isDemoMode = false;

let history = JSON.parse(
    localStorage.getItem("netpulse-real-history") || "[]"
);

// Dados ilustrativos usados somente quando o projeto está no GitHub Pages.
const demoDevices = [
    { name: "Servidor Principal", ip: "192.168.1.1", status: "online", latency: 12 },
    { name: "Servidor DNS", ip: "192.168.1.2", status: "online", latency: 18 },
    { name: "Roteador Principal", ip: "192.168.18.1", status: "online", latency: 8 },
    { name: "Switch Sala 1", ip: "192.168.1.10", status: "offline", latency: null },
    { name: "Access Point", ip: "192.168.1.20", status: "online", latency: 25 },
    { name: "Servidor Backup", ip: "192.168.1.3", status: "offline", latency: null }
];

async function updateDevices() {
    const button = document.getElementById("refresh-btn");
    const lastUpdate = document.getElementById("last-update");

    button.disabled = true;

    try {
        const response = await fetch("/api/devices", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API indisponível (HTTP " + response.status + ")");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Resposta inválida da API");
        }

        devices = data;
        isDemoMode = false;

        const measurable = devices.filter(
            device => device.status === "online"
                && typeof device.latency === "number"
                && Number.isFinite(device.latency)
        );

        if (measurable.length > 0) {
            const average = Math.round(
                measurable.reduce((sum, device) => sum + device.latency, 0)
                / measurable.length
            );

            history.push({
                time: new Date().toLocaleTimeString("pt-BR"),
                latency: average
            });

            history = history.slice(-50);
            localStorage.setItem(
                "netpulse-real-history",
                JSON.stringify(history)
            );
        }

        lastUpdate.textContent =
            "Monitoramento local ativo • " +
            new Date().toLocaleTimeString("pt-BR");

    } catch (error) {
        console.info("NETPULSE: exibindo dados demonstrativos.", error);
        devices = demoDevices;
        isDemoMode = true;
        lastUpdate.textContent =
            "Modo demonstração — dados ilustrativos; execute monitor.py para monitoramento real.";
    } finally {
        renderDashboard();
        button.disabled = false;
    }
}

function renderDashboard() {
    const online = devices.filter(device => device.status === "online");
    const offline = devices.filter(device => device.status === "offline");

    const measurable = online.filter(
        device => typeof device.latency === "number"
            && Number.isFinite(device.latency)
    );

    const average = measurable.length
        ? Math.round(
            measurable.reduce((sum, device) => sum + device.latency, 0)
            / measurable.length
        )
        : null;

    document.getElementById("devices").textContent = devices.length;
    document.getElementById("online").textContent = online.length;
    document.getElementById("offline").textContent = offline.length;
    document.getElementById("latency").textContent =
        average === null ? "—" : average + " ms";

    const list = document.getElementById("device-list");
    list.innerHTML = "";

    devices
        .filter(device =>
            currentFilter === "all" || device.status === currentFilter
        )
        .forEach(device => {
            const item = document.createElement("div");
            item.className = "device";

            const info = document.createElement("div");

            const name = document.createElement("strong");
            name.textContent = device.name;

            const ip = document.createElement("p");
            ip.textContent = device.ip;

            info.append(name, ip);

            const status = document.createElement("div");

            const indicator = document.createElement("span");
            indicator.className = device.status;
            indicator.textContent = device.status === "online"
                ? "● Online"
                : "● Offline";

            const latency = document.createElement("p");
            latency.textContent =
                device.status === "online"
                && typeof device.latency === "number"
                && Number.isFinite(device.latency)
                    ? device.latency + " ms"
                    : "—";

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
        item.textContent = entry.time + " — " + entry.latency + " ms";
        container.appendChild(item);
    });

    drawChart();
}

function drawChart() {
    const canvas = document.getElementById("latency-chart");
    const ctx = canvas.getContext("2d");

    const width = canvas.clientWidth || 600;
    const height = 240;

    canvas.width = width;
    canvas.height = height;
    ctx.clearRect(0, 0, width, height);

    const data = history.slice(-10);

    if (data.length === 0) {
        ctx.fillStyle = "#999";
        ctx.font = "14px Arial";
        ctx.fillText("Aguardando medições reais...", 15, 35);
        return;
    }

    const max = Math.max(...data.map(entry => entry.latency), 10) * 1.2;
    const padding = 30;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.strokeStyle = "#30213f";
    ctx.lineWidth = 1;

    for (let i = 0; i < 4; i++) {
        const y = padding + (chartHeight / 3) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    ctx.strokeStyle = "#a855f7";
    ctx.lineWidth = 3;
    ctx.beginPath();

    data.forEach((entry, index) => {
        const x = data.length === 1
            ? width / 2
            : padding + (chartWidth / (data.length - 1)) * index;

        const y = height - padding
            - (entry.latency / max) * chartHeight;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}

document.getElementById("refresh-btn").addEventListener(
    "click",
    updateDevices
);

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter").forEach(filter => {
            filter.classList.remove("active");
        });

        button.classList.add("active");
        renderDashboard();
    });
});

updateDevices();
setInterval(updateDevices, 10000);
