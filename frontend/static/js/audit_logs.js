// Audit logs rendering

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/audit-logs/') {
        loadAuditLogs();
    }
});

async function loadAuditLogs() {
    const tableBody = document.getElementById('audit-logs-table-body');
    if (!tableBody) return;

    try {
        const logs = await API.request('/crime/audit-logs/');
        if (!logs) return;

        tableBody.innerHTML = '';
        if (logs.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No audit log records found.</td></tr>';
            return;
        }

        logs.forEach(log => {
            const timeStr = new Date(log.timestamp).toLocaleDateString(undefined, {
                year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
            });

            let actionBadge = '';
            if (log.action === 'CREATE') {
                actionBadge = '<span class="badge bg-success">CREATE</span>';
            } else if (log.action === 'UPDATE') {
                actionBadge = '<span class="badge bg-warning text-dark">UPDATE</span>';
            } else {
                actionBadge = '<span class="badge bg-danger">DELETE</span>';
            }

            const username = log.user ? log.user.username : 'System';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${timeStr}</td>
                <td><strong>${username}</strong></td>
                <td>${actionBadge}</td>
                <td><code>${log.table_name}</code></td>
                <td><code>#${log.row_id}</code></td>
                <td class="text-white-50">${log.details || ''}</td>
            `;
            tableBody.appendChild(row);
        });
    } catch (e) {
        console.error('Failed to load audit logs:', e);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Failed to load system logs. Check permissions.</td></tr>';
    }
}
