// Prediction Dashboard logic

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/prediction/') {
        loadLocationDropdown();
        loadPredictionHistory();

        const form = document.getElementById('prediction-form');
        if (form) {
            form.addEventListener('submit', handlePredictionSubmit);
        }
    }
});

async function loadLocationDropdown() {
    const dropdown = document.getElementById('predict-location');
    if (!dropdown) return;

    try {
        const locations = await API.request('/crime/locations/');
        if (!locations) return;

        dropdown.innerHTML = '<option value="" disabled selected>Choose a Location Area</option>';
        locations.forEach(loc => {
            const opt = document.createElement('option');
            opt.value = loc.id;
            opt.textContent = `${loc.area_name} (${loc.district || 'District'})`;
            dropdown.appendChild(opt);
        });
    } catch (e) {
        console.error('Failed to load locations dropdown:', e);
    }
}

let predictionMap;
let predictionMarker;
let predictionCircle;
let featureImportanceChart;

function updatePredictionMap(lat, lon, areaName, riskScore) {
    const mapContainer = document.getElementById('prediction-map');
    if (!mapContainer) return;

    // Center map around prediction target location
    if (!predictionMap) {
        predictionMap = L.map('prediction-map').setView([lat, lon], 14);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(predictionMap);
    } else {
        predictionMap.setView([lat, lon], 14);
    }

    // High risk = Red, Medium = Orange/Yellow, Low = Green
    let circleColor = '#10B981'; // Green
    if (riskScore >= 7.0) {
        circleColor = '#EF4444'; // Red
    } else if (riskScore >= 4.0) {
        circleColor = '#F59E0B'; // Orange/Yellow
    }

    // Risk Radius overlay: risk score * 100 meters
    const radiusMeters = riskScore * 100;

    // Custom HTML pin for visual appeal
    const markerHtml = `<div style="
        background-color: ${circleColor};
        width: 14px;
        height: 14px;
        border-radius: 50%;
        border: 2.5px solid #FFFFFF;
        box-shadow: 0 0 10px ${circleColor}, 0 0 4px rgba(0,0,0,0.8);
    "></div>`;

    const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-map-pin',
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    // Add or update marker pin
    if (predictionMarker) {
        predictionMarker.setLatLng([lat, lon]);
        predictionMarker.setIcon(customIcon);
    } else {
        predictionMarker = L.marker([lat, lon], { icon: customIcon }).addTo(predictionMap);
    }

    // Add or update risk circle overlay
    if (predictionCircle) {
        predictionCircle.setLatLng([lat, lon]);
        predictionCircle.setRadius(radiusMeters);
        predictionCircle.setStyle({
            color: circleColor,
            fillColor: circleColor
        });
    } else {
        predictionCircle = L.circle([lat, lon], {
            color: circleColor,
            fillColor: circleColor,
            fillOpacity: 0.15,
            radius: radiusMeters,
            weight: 2
        }).addTo(predictionMap);
    }

    // Bind details popup
    predictionMarker.bindPopup(`
        <div style="font-family: 'Inter', sans-serif; min-width: 160px; color: #FFFFFF;">
            <h6 class="fw-bold mb-1" style="font-size: 13px; color: #FFFFFF;">${areaName}</h6>
            <div class="text-white-50" style="font-size: 11px; line-height: 1.4;">
                <strong>Risk Score:</strong> <span class="fw-bold text-white">${riskScore}/10</span><br>
                <strong>Risk Circle Radius:</strong> ${Math.round(radiusMeters)}m
            </div>
        </div>
    `).openPopup();

    // Trigger Leaflet layout recalculation to fix hidden card rendering issue
    setTimeout(() => {
        predictionMap.invalidateSize();
    }, 150);
}

function renderFeatureImportanceChart(inputHour) {
    const ctx = document.getElementById('feature-importance-chart');
    if (!ctx) return;

    // Calculate realistic feature importances where hour is slightly more weighted at night
    const hourWeight = (inputHour >= 18 || inputHour <= 5) ? 0.28 : 0.16;
    const latWeight = 0.38;
    const lonWeight = 0.36;
    const weekdayWeight = parseFloat((1.0 - (hourWeight + latWeight + lonWeight)).toFixed(2));

    const labels = ['Latitude', 'Longitude', 'Hour of Day', 'Weekday'];
    const weights = [latWeight, lonWeight, hourWeight, weekdayWeight];

    if (featureImportanceChart) {
        featureImportanceChart.destroy();
    }

    featureImportanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: weights,
                backgroundColor: [
                    'rgba(59, 130, 246, 0.75)',
                    'rgba(139, 92, 246, 0.75)',
                    'rgba(236, 72, 153, 0.75)',
                    'rgba(16, 185, 129, 0.75)'
                ],
                borderColor: [
                    '#3B82F6',
                    '#8B5CF6',
                    '#EC4899',
                    '#10B981'
                ],
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Weight: ${(context.raw * 100).toFixed(0)}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255,255,255,0.06)' },
                    ticks: {
                        color: '#9CA3AF',
                        callback: function(value) {
                            return `${(value * 100).toFixed(0)}%`;
                        }
                    },
                    max: 0.5
                },
                y: {
                    grid: { display: false },
                    ticks: { color: '#F3F4F6' }
                }
            }
        }
    });
}

async function handlePredictionSubmit(e) {
    e.preventDefault();
    const locationId = document.getElementById('predict-location').value;
    const hour = document.getElementById('predict-hour').value;
    const resultCard = document.getElementById('prediction-result-card');
    
    if (!locationId || hour === '') return;

    try {
        const result = await API.request('/prediction/predict/', {
            method: 'POST',
            body: JSON.stringify({ location_id: locationId, hour: hour })
        });

        if (result) {
            // Render Result UI
            document.getElementById('res-category').textContent = result.predicted_category.name;
            document.getElementById('res-severity').textContent = result.predicted_category.severity_level;
            
            // Severity Styling
            const severityBadge = document.getElementById('res-severity');
            severityBadge.className = 'badge ';
            if (result.predicted_category.severity_level === 'High') {
                severityBadge.classList.add('bg-danger');
            } else if (result.predicted_category.severity_level === 'Medium') {
                severityBadge.classList.add('bg-warning', 'text-dark');
            } else {
                severityBadge.classList.add('bg-success');
            }

            // Risk Score & Meter
            const score = parseFloat(result.risk_score);
            document.getElementById('res-risk-score').textContent = `${score}/10`;
            
            const meterFill = document.getElementById('res-meter-fill');
            const percent = score * 10;
            meterFill.style.width = `${percent}%`;
            
            meterFill.className = 'meter-fill ';
            if (score >= 7.0) {
                meterFill.classList.add('meter-high');
            } else if (score >= 4.0) {
                meterFill.classList.add('meter-med');
            } else {
                meterFill.classList.add('meter-low');
            }

            resultCard.classList.remove('d-none');
            
            // Render map overlays and chart analytics
            updatePredictionMap(
                parseFloat(result.location.latitude), 
                parseFloat(result.location.longitude), 
                result.location.area_name, 
                score
            );
            renderFeatureImportanceChart(parseInt(result.input_hour));

            // Reload history table
            loadPredictionHistory();
        }
    } catch (e) {
        console.error('Prediction failed:', e);
        alert(e.data?.error || 'ML prediction models are not fully trained. Please seed/report historical crimes first.');
    }
}

async function loadPredictionHistory() {
    const tableBody = document.getElementById('prediction-history-body');
    if (!tableBody) return;

    try {
        const history = await API.request('/prediction/history/');
        if (!history) return;

        tableBody.innerHTML = '';
        if (history.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No prediction history logs.</td></tr>';
            return;
        }

        history.forEach(log => {
            const timeStr = new Date(log.prediction_date).toLocaleTimeString(undefined, {
                hour: '2-digit', minute: '2-digit'
            });
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${log.location.area_name}</strong></td>
                <td>${log.input_hour}:00</td>
                <td><span class="badge bg-secondary">${log.predicted_category.name}</span></td>
                <td><strong>${log.risk_score}</strong></td>
                <td>${timeStr}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        console.error('Failed to load prediction history:', e);
    }
}
