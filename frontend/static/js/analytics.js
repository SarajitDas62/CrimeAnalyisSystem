// Chart.js visualizations for the Analytics Dashboard

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/analytics/') {
        loadCategoryChart();
        loadAreaChart();
        loadHourlyTrendChart();
        loadWeekdayChart();
    }
});

async function loadCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;

    try {
        const data = await API.request('/analytics/by-category/');
        if (!data || data.length === 0) {
            showNoDataMessage('category-chart-container');
            return;
        }

        const labels = data.map(item => item.category);
        const counts = data.map(item => item.count);

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: counts,
                    backgroundColor: [
                        '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', 
                        '#F59E0B', '#EF4444', '#6366F1', '#14B8A6'
                    ],
                    borderWidth: 1,
                    borderColor: '#0E132B'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#F3F4F6', font: { family: 'Inter' } }
                    }
                }
            }
        });
    } catch (e) {
        console.error('Failed to load category chart:', e);
    }
}

async function loadAreaChart() {
    const ctx = document.getElementById('area-chart');
    if (!ctx) return;

    try {
        const data = await API.request('/analytics/by-area/');
        if (!data || data.length === 0) {
            showNoDataMessage('area-chart-container');
            return;
        }

        const labels = data.map(item => item.area);
        const counts = data.map(item => item.count);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Crime Reports',
                    data: counts,
                    backgroundColor: 'rgba(139, 92, 246, 0.75)',
                    borderColor: '#8B5CF6',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CA3AF' } },
                    y: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
                }
            }
        });
    } catch (e) {
        console.error('Failed to load area chart:', e);
    }
}

async function loadHourlyTrendChart() {
    const ctx = document.getElementById('hourly-chart');
    if (!ctx) return;

    try {
        const data = await API.request('/analytics/by-hour/');
        if (!data || data.length === 0) {
            showNoDataMessage('hourly-chart-container');
            return;
        }

        const labels = data.map(item => `${item.hour}:00`);
        const counts = data.map(item => item.count);

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reports by Hour',
                    data: counts,
                    borderColor: '#EC4899',
                    backgroundColor: 'rgba(236, 72, 153, 0.12)',
                    borderWidth: 2.5,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#EC4899'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
                    y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CA3AF' } }
                }
            }
        });
    } catch (e) {
        console.error('Failed to load hourly chart:', e);
    }
}

async function loadWeekdayChart() {
    const ctx = document.getElementById('weekday-chart');
    if (!ctx) return;

    try {
        const data = await API.request('/analytics/by-day/');
        if (!data || data.length === 0) {
            showNoDataMessage('weekday-chart-container');
            return;
        }

        const labels = data.map(item => item.day);
        const counts = data.map(item => item.count);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Crime Reports',
                    data: counts,
                    backgroundColor: 'rgba(59, 130, 246, 0.75)',
                    borderColor: '#3B82F6',
                    borderWidth: 1,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { grid: { display: false }, ticks: { color: '#9CA3AF' } },
                    y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#9CA3AF' } }
                }
            }
        });
    } catch (e) {
        console.error('Failed to load weekday chart:', e);
    }
}

function showNoDataMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="d-flex flex-column align-items-center justify-content-center h-100 py-5">
                <i class="bi bi-bar-chart text-muted" style="font-size: 2.5rem;"></i>
                <p class="text-muted mt-2">Insufficient historical data to render chart.</p>
            </div>
        `;
    }
}
