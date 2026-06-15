// Crime Management CRUD Operations

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/crime-management/') {
        loadReportFormDropdowns();
        loadCrimeReportsTable();

        const form = document.getElementById('crime-report-form');
        if (form) {
            form.addEventListener('submit', handleReportSubmit);
        }
    }
});

async function loadReportFormDropdowns() {
    const categorySelect = document.getElementById('report-category');
    const locationSelect = document.getElementById('report-location');

    if (!categorySelect || !locationSelect) return;

    try {
        // Load categories
        const categories = await API.request('/crime/categories/');
        if (categories) {
            categorySelect.innerHTML = '<option value="" disabled selected>Select Crime Type</option>';
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat.id;
                opt.textContent = `${cat.name} (${cat.severity_level} Severity)`;
                categorySelect.appendChild(opt);
            });
        }

        // Load locations
        const locations = await API.request('/crime/locations/');
        if (locations) {
            locationSelect.innerHTML = '<option value="" disabled selected>Select Incident Location</option>';
            locations.forEach(loc => {
                const opt = document.createElement('option');
                opt.value = loc.id;
                opt.textContent = `${loc.area_name} (${loc.district || 'District'})`;
                locationSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Failed to load form options:', e);
    }
}

async function loadCrimeReportsTable() {
    const tableBody = document.getElementById('reports-table-body');
    if (!tableBody) return;

    try {
        const reports = await API.request('/crime/reports/');
        if (!reports) return;

        tableBody.innerHTML = '';
        if (reports.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No crime reports registered in database.</td></tr>';
            return;
        }

        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        const isAnalystOrAdmin = user && user.profile && (user.profile.role === 'Admin' || user.profile.role === 'Analyst');

        reports.forEach(report => {
            const dateStr = new Date(report.date_occurred).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });

            let statusBadge = '';
            if (isAnalystOrAdmin) {
                statusBadge = `
                    <select class="form-select form-select-sm" style="max-width: 140px; background-color: rgba(14, 19, 43, 0.85); color: #FFFFFF; border: 1px solid var(--card-border);" onchange="updateReportStatus(${report.id}, this.value)">
                        <option value="Pending" ${report.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Investigating" ${report.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
                        <option value="Resolved" ${report.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                    </select>
                `;
            } else {
                if (report.status === 'Resolved') {
                    statusBadge = `<span class="badge bg-success">Resolved</span>`;
                } else if (report.status === 'Investigating') {
                    statusBadge = `<span class="badge bg-warning text-dark">Investigating</span>`;
                } else {
                    statusBadge = `<span class="badge bg-danger">Pending</span>`;
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${report.id}</strong></td>
                <td>${report.category.name}</td>
                <td>${report.location.area_name}</td>
                <td>${dateStr}</td>
                <td>${statusBadge}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteReport(${report.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        console.error('Failed to load reports table:', e);
    }
}

async function updateReportStatus(reportId, newStatus) {
    try {
        const result = await API.request(`/crime/reports/${reportId}/`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        if (result) {
            console.log(`Report #${reportId} status updated successfully to ${newStatus}`);
        }
    } catch (e) {
        console.error('Failed to update report status:', e);
        alert(e.data?.error || 'You do not have permission to update the status of this report.');
        // Reload reports table to revert status
        loadCrimeReportsTable();
    }
}
window.updateReportStatus = updateReportStatus;

async function handleReportSubmit(e) {
    e.preventDefault();
    const categoryId = document.getElementById('report-category').value;
    const locationId = document.getElementById('report-location').value;
    const dateOccurred = document.getElementById('report-date').value;
    const description = document.getElementById('report-description').value.trim();
    const status = document.getElementById('report-status').value;

    if (!categoryId || !locationId || !dateOccurred) return;

    try {
        await API.request('/crime/reports/', {
            method: 'POST',
            body: JSON.stringify({
                category_id: categoryId,
                location_id: locationId,
                date_occurred: dateOccurred,
                status: status,
                description: description
            })
        });

        // Clear form
        document.getElementById('crime-report-form').reset();
        
        // Reload reports
        loadCrimeReportsTable();
    } catch (e) {
        console.error('Failed to report crime:', e);
        alert(e.data?.detail || 'Validation failed. Check input formats.');
    }
}

async function deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this crime report?')) return;

    try {
        await API.request(`/crime/reports/${reportId}/`, {
            method: 'DELETE'
        });
        loadCrimeReportsTable();
    } catch (e) {
        console.error('Delete failed:', e);
        alert(e.data?.error || 'You do not have permission to delete this report.');
    }
}
window.deleteReport = deleteReport; // Expose to HTML
