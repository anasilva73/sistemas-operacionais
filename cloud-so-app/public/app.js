const $ = (id) => document.getElementById(id);

const formatBytes = (bytes) => {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }
    return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const formatDuration = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const parts = [];
    if (days) parts.push(`${days}d`);
    if (hours || days) parts.push(`${hours}h`);
    if (minutes || hours || days) parts.push(`${minutes}min`);
    parts.push(`${secs}s`);
    return parts.join(" ");
};

const formatDate = (date) => new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "medium"
}).format(new Date(date));

async function loadSystemInfo() {
    try {
        const response = await fetch("/api/system");
        if (!response.ok) throw new Error("Falha ao consultar a API");
        const info = await response.json();

        const usedMemory = info.totalMemory - info.freeMemory;
        const usedPercent = (usedMemory / info.totalMemory) * 100;
        const freePercent = (info.freeMemory / info.totalMemory) * 100;

        $("cpu-count").textContent = `${info.cpuCount} núcleos`;
        $("cpu-model").textContent = info.cpuModel;
        $("total-memory").textContent = formatBytes(info.totalMemory);
        $("free-memory").textContent = formatBytes(info.freeMemory);
        $("memory-percent").textContent = `${freePercent.toFixed(1)}% disponível`;
        $("memory-usage").textContent = `${usedPercent.toFixed(1)}%`;
        $("memory-bar").style.width = `${usedPercent}%`;
        $("memory-details").textContent = `${formatBytes(usedMemory)} utilizados de ${formatBytes(info.totalMemory)}`;

        $("hostname").textContent = info.hostname;
        $("platform").textContent = info.platform;
        $("platform-name").textContent = info.platformName;
        $("architecture").textContent = info.architecture;
        $("hero-platform").textContent = `${info.platform} • ${info.architecture}`;
        $("uptime").textContent = formatDuration(info.uptime);
        $("node-version").textContent = info.nodeVersion;
        $("process-uptime").textContent = formatDuration(info.processUptime);
        $("load-average").textContent = info.loadAverage.map(value => value.toFixed(2)).join(" / ");
        $("last-update").textContent = formatDate(info.capturedAt);
    } catch (error) {
        console.error(error);
        $("hostname").textContent = "Indisponível";
        $("last-update").textContent = "Erro de comunicação";
    }
}

const themeButton = $("theme-toggle");

function updateThemeIcon() {
    const isLight = document.body.classList.contains("light");
    themeButton.textContent = isLight ? "🌙" : "☀️";
}

function loadTheme() {
    const savedTheme = localStorage.getItem("cloud-so-theme");
    if (savedTheme === "light") document.body.classList.add("light");
    updateThemeIcon();
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const theme = document.body.classList.contains("light") ? "light" : "dark";
    localStorage.setItem("cloud-so-theme", theme);
    updateThemeIcon();
});

$("refresh-button").addEventListener("click", async () => {
    const button = $("refresh-button");
    button.style.transform = "rotate(360deg)";
    await loadSystemInfo();
    setTimeout(() => { button.style.transform = ""; }, 400);
});

loadTheme();
loadSystemInfo();
setInterval(loadSystemInfo, 10000);