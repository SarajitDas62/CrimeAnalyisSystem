// Dashboard Stats & Data Loading

document.addEventListener('DOMContentLoaded', () => {
    // Only load if on dashboard index
    if (window.location.pathname === '/') {
        loadDashboardStats();
        loadRecentReports();
    }
});

async function loadDashboardStats() {
    try {
        const stats = await API.request('/analytics/summary/');
        if (!stats) return;

        // Populate KPI numbers with animations
        animateNumber('kpi-total-reports', stats.total_reports);
        animateNumber('kpi-resolved-reports', stats.resolved_reports);
        animateNumber('kpi-pending-reports', stats.pending_reports);
        animateNumber('kpi-total-categories', stats.total_categories);
        animateNumber('kpi-total-locations', stats.total_locations);

        // Compute resolution rate
        const rate = stats.total_reports > 0 ? Math.round((stats.resolved_reports / stats.total_reports) * 100) : 0;
        document.getElementById('kpi-resolution-rate').textContent = `${rate}%`;

    } catch (e) {
        console.error('Failed to load dashboard statistics:', e);
    }
}

let dashboardMap;

function initDashboardMap(reports) {
    const mapContainer = document.getElementById('dashboard-map');
    if (!mapContainer) return;

    // Center map around Los Angeles (default for our seed data)
    dashboardMap = L.map('dashboard-map').setView([34.0522, -118.2437], 11);

    // Dark Theme Leaflet Map tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(dashboardMap);

    // Add marker pins for each report
    reports.forEach(report => {
        const lat = parseFloat(report.location.latitude);
        const lon = parseFloat(report.location.longitude);
        if (isNaN(lat) || isNaN(lon)) return;

        let markerColor = '#10B981'; // Low (Green)
        if (report.category.severity_level === 'High') {
            markerColor = '#EF4444'; // Red
        } else if (report.category.severity_level === 'Medium') {
            markerColor = '#F59E0B'; // Yellow/Orange
        }

        const dateStr = new Date(report.date_occurred).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const popupContent = `
            <div style="font-family: 'Inter', sans-serif; min-width: 180px; color: #FFFFFF;">
                <h6 class="fw-bold mb-1" style="color: #FFFFFF; font-size: 14px;">${report.category.name}</h6>
                <div class="mb-1 text-white-50" style="font-size: 11px;">
                    <strong>Location:</strong> ${report.location.area_name}<br>
                    <strong>Occurred:</strong> ${dateStr}<br>
                    <strong>Status:</strong> <span class="badge ${report.status === 'Resolved' ? 'bg-success' : report.status === 'Investigating' ? 'bg-warning text-dark' : 'bg-danger'}" style="font-size: 9px; padding: 2px 5px;">${report.status}</span>
                </div>
                <div class="mt-2 text-white-50" style="font-size: 11px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; max-height: 80px; overflow-y: auto;">
                    ${report.description || 'No description provided.'}
                </div>
            </div>
        `;

        // Custom HTML pin for visual appeal
        const markerHtml = `<div style="
            background-color: ${markerColor};
            width: 14px;
            height: 14px;
            border-radius: 50%;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 0 10px ${markerColor}, 0 0 4px rgba(0,0,0,0.8);
        "></div>`;

        const customIcon = L.divIcon({
            html: markerHtml,
            className: 'custom-map-pin',
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        const marker = L.marker([lat, lon], { icon: customIcon }).addTo(dashboardMap);
        marker.bindPopup(popupContent);
    });
}

async function loadRecentReports() {
    const tableBody = document.getElementById('recent-reports-table-body');
    if (!tableBody) return;

    try {
        const reports = await API.request('/crime/reports/');
        if (!reports) return;

        // Populate Dashboard Map
        initDashboardMap(reports);

        tableBody.innerHTML = '';
        const limit = reports.slice(0, 5); // Take 5 recent items

        if (limit.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No crime reports found in system.</td></tr>`;
            return;
        }

        limit.forEach(report => {
            const dateStr = new Date(report.date_occurred).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
            
            let statusBadge = '';
            if (report.status === 'Resolved') {
                statusBadge = `<span class="badge bg-success">Resolved</span>`;
            } else if (report.status === 'Investigating') {
                statusBadge = `<span class="badge bg-warning text-dark">Investigating</span>`;
            } else {
                statusBadge = `<span class="badge bg-danger">Pending</span>`;
            }

            const row = document.createElement('tr');
            row.className = 'fade-up';
            row.innerHTML = `
                <td><strong>#${report.id}</strong></td>
                <td>${report.category.name}</td>
                <td>${report.location.area_name}</td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (e) {
        console.error('Failed to load recent crime reports:', e);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Failed to load reports.</td></tr>`;
    }
}

function animateNumber(elementId, targetValue) {
    const el = document.getElementById(elementId);
    if (!el) return;

    let start = 0;
    const duration = 1000; // 1 second
    const stepTime = Math.abs(Math.floor(duration / targetValue));
    
    if (targetValue === 0) {
        el.textContent = 0;
        return;
    }

    const timer = setInterval(() => {
        start += 1;
        el.textContent = start;
        if (start >= targetValue) {
            clearInterval(timer);
            el.textContent = targetValue.toLocaleString();
        }
    }, Math.max(stepTime, 15));
}
