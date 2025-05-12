// Function to initialize all dashboard components
function initDashboard() {
    // Initialize charts
    initCharts();
    
    // Initialize map
    initMap();
    
    // Start data updates
    startDataUpdates();
}

// Chart initialization
function initCharts() {
    window.tempChart = createChart('tempChart', 'Temperature (°C)', '#ef4444');
    window.pressureChart = createChart('pressureChart', 'Pressure (hPa)', '#f59e0b');
    window.altitudeChart = createChart('altitudeChart', 'Altitude (m)', '#3b82f6');
    window.humidityChart = createChart('humidityChart', 'Humidity (%)', '#10b981');
}

function createChart(canvasId, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [{
            label: label,
            data: [],
            borderColor: color,
            backgroundColor: `${color}20`,
            tension: 0.4,
            borderWidth: 2
        }]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255,255,255,0.1)' } }
            },
            elements: { point: { radius: 0 } }
        }
    });
}

// Map initialization
function initMap() {
    window.map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(window.map);
    
    window.pathLayer = L.layerGroup().addTo(window.map);
    window.marker = L.marker([0, 0]).addTo(window.pathLayer);
}

// Data updates
function startDataUpdates() {
    fetchData();
    setInterval(fetchData, 3000);
}

function fetchData() {
    fetch('/api/data')
        .then(response => response.json())
        .then(data => {
            if (data.error) throw new Error(data.error);
            updateCharts(data);
            updateMap(data);
        })
        .catch(error => console.error('Error:', error));
}

function updateCharts(data) {
    updateChart(window.tempChart, data, 'BMP_Temp(C)');
    updateChart(window.pressureChart, data, 'BMP_Pressure(hPa)');
    updateChart(window.altitudeChart, data, 'BMP_Altitude(m)');
    updateChart(window.humidityChart, data, 'DHT_Humidity(%)');
}

function updateChart(chart, data, field) {
    const validData = data.filter(d => !isNaN(d[field]));
    chart.data.labels = validData.map(d => d.time_seconds || 0);
    chart.data.datasets[0].data = validData.map(d => d[field]);
    chart.update();
}

function updateMap(data) {
    const gpsData = data.filter(d => !isNaN(d.GPS_Lat) && !isNaN(d.GPS_Lon));
    if (gpsData.length > 0) {
        const latest = gpsData[gpsData.length - 1];
        window.map.setView([latest.GPS_Lat, latest.GPS_Lon], 15);
        window.marker.setLatLng([latest.GPS_Lat, latest.GPS_Lon]);
        
        window.pathLayer.clearLayers();
        window.marker.addTo(window.pathLayer);
        
        const path = gpsData.map(d => [d.GPS_Lat, d.GPS_Lon]);
        L.polyline(path, {color: '#6d28d9'}).addTo(window.pathLayer);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initDashboard);