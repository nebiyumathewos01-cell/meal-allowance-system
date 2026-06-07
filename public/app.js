// ============================================================
// app.js — Frontend JavaScript
// Connects the HTML page to the backend using Fetch API
// Every function sends an HTTP request to Express routes
// ============================================================

// If deployed online, the frontend and backend are on the same server
// so we use empty string. Locally it uses port 3000.
const API = window.location.hostname === 'localhost' ? 'http://localhost:4000' : '';

// ============================================================
// LOGIN
// ============================================================
async function doLogin() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();

    if (!username || !password) {
        showMsg('login-msg', 'Please enter username and password.', 'error');
        return;
    }

    try {
        const res  = await fetch(API + '/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            document.getElementById('login-page').style.display = 'none';
            document.getElementById('main-app').style.display   = 'block';
            document.getElementById('admin-name').textContent   = '👤 ' + data.admin.fullName;
            loadDashboard();
        } else {
            showMsg('login-msg', data.error, 'error');
        }
    } catch (err) {
        showMsg('login-msg', 'Server error. Make sure the backend is running.', 'error');
    }
}

// Allow pressing Enter key to login
document.addEventListener('DOMContentLoaded', () => {
    const pwInput = document.getElementById('login-password');
    if (pwInput) pwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') doLogin();
    });
});

// ============================================================
// LOGOUT
// ============================================================
function doLogout() {
    if (confirm('Are you sure you want to logout?')) {
        document.getElementById('login-page').style.display  = 'flex';
        document.getElementById('main-app').style.display    = 'none';
        document.getElementById('login-username').value      = '';
        document.getElementById('login-password').value      = '';
    }
}

// ============================================================
// TAB SWITCHING
// Shows the selected tab and hides all others
// ============================================================
function showTab(tabName, btn) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    btn.classList.add('active');

    if (tabName === 'dashboard')    loadDashboard();
    if (tabName === 'students')     loadStudents();
    if (tabName === 'applications') loadApplications();
    if (tabName === 'payments')     loadPayments();
    if (tabName === 'admin')        loadAdminApps();
}

// ============================================================
// SHOW MESSAGE HELPER
// Displays success or error message in a given element
// ============================================================
function showMsg(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className   = 'msg ' + type;
    // Auto-hide after 4 seconds
    setTimeout(() => { el.className = 'msg'; }, 4000);
}

// ============================================================
// DASHBOARD — Load Summary Stats
// ============================================================
async function loadDashboard() {
    try {
        const res  = await fetch(API + '/dashboard');
        const data = await res.json();

        document.getElementById('dash-students').textContent     = data.totalStudents;
        document.getElementById('dash-applications').textContent = data.totalApplications;
        document.getElementById('dash-approved').textContent     = data.approved;
        document.getElementById('dash-rejected').textContent     = data.rejected;
        document.getElementById('dash-pending').textContent      = data.pending;
        document.getElementById('dash-budget').textContent       = data.totalBudget.toLocaleString() + ' Birr';
    } catch (err) {
        console.error('Dashboard error:', err);
    }
}

// ============================================================
// STUDENTS — Register a New Student
// ============================================================
async function registerStudent() {
    // Collect form values
    const studentId  = document.getElementById('s-id').value.trim();
    const fullName   = document.getElementById('s-name').value.trim();
    const gender     = document.getElementById('s-gender').value;
    const department = document.getElementById('s-dept').value.trim();
    const yearOfStudy= document.getElementById('s-year').value;
    const email      = document.getElementById('s-email').value.trim();
    const phone      = document.getElementById('s-phone').value.trim();
    const address    = document.getElementById('s-address').value.trim();

    // Basic frontend check before sending to backend
    if (!studentId || !fullName || !gender || !department || !yearOfStudy || !email || !phone) {
        showMsg('s-msg', 'Please fill in all required fields.', 'error');
        return;
    }

    try {
        // POST request to backend
        const res  = await fetch(API + '/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, fullName, gender, department, yearOfStudy, email, phone, address })
        });
        const data = await res.json();

        if (res.ok) {
            showMsg('s-msg', data.message, 'success');
            clearStudentForm();
            loadStudents(); // Refresh the table
        } else {
            showMsg('s-msg', data.error, 'error');
        }
    } catch (err) {
        showMsg('s-msg', 'Server error. Make sure the backend is running.', 'error');
    }
}

// Clear student form after successful registration
function clearStudentForm() {
    ['s-id','s-name','s-dept','s-email','s-phone','s-address'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('s-gender').value = '';
    document.getElementById('s-year').value   = '';
}

// ============================================================
// STUDENTS — Load and Display All Students
// ============================================================
async function loadStudents() {
    try {
        const res      = await fetch(API + '/students');
        const students = await res.json();
        renderStudents(students);
    } catch (err) {
        console.error('Load students error:', err);
    }
}

function renderStudents(students) {
    const tbody = document.getElementById('student-tbody');
    tbody.innerHTML = '';

    if (students.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999">No students registered yet.</td></tr>';
        return;
    }

    students.forEach(s => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${s.studentId}</td>
            <td>${s.fullName}</td>
            <td>${s.gender}</td>
            <td>${s.department}</td>
            <td>Year ${s.yearOfStudy}</td>
            <td>${s.email}</td>
            <td>${s.phone}</td>
            <td>
                <button class="btn btn-red btn-small" onclick="deleteStudent('${s.studentId}')">🗑 Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// STUDENTS — Search
// ============================================================
async function searchStudents() {
    const query = document.getElementById('search-student').value.trim().toLowerCase();
    if (!query) { loadStudents(); return; }

    const res      = await fetch(API + '/students');
    const students = await res.json();
    const filtered = students.filter(s =>
        s.studentId.toLowerCase().includes(query) ||
        s.fullName.toLowerCase().includes(query)
    );
    renderStudents(filtered);
}

// ============================================================
// STUDENTS — Delete
// ============================================================
async function deleteStudent(id) {
    if (!confirm('Are you sure you want to delete student ' + id + '?')) return;

    const res  = await fetch(API + '/students/' + id, { method: 'DELETE' });
    const data = await res.json();

    if (res.ok) {
        loadStudents();
    } else {
        alert(data.error);
    }
}

// ============================================================
// APPLICATIONS — Submit New Application
// ============================================================
async function submitApplication() {
    const studentId = document.getElementById('a-sid').value.trim();
    const reason    = document.getElementById('a-reason').value.trim();

    if (!studentId || !reason) {
        showMsg('a-msg', 'Student ID and reason are required.', 'error');
        return;
    }

    try {
        const res  = await fetch(API + '/applications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, reason })
        });
        const data = await res.json();

        if (res.ok) {
            showMsg('a-msg', data.message, 'success');
            document.getElementById('a-sid').value    = '';
            document.getElementById('a-reason').value = '';
            loadApplications();
        } else {
            showMsg('a-msg', data.error, 'error');
        }
    } catch (err) {
        showMsg('a-msg', 'Server error.', 'error');
    }
}

// ============================================================
// APPLICATIONS — Load All
// ============================================================
async function loadApplications() {
    const res  = await fetch(API + '/applications');
    const apps = await res.json();
    renderApplications(apps);
}

function renderApplications(apps) {
    const tbody = document.getElementById('app-tbody');
    tbody.innerHTML = '';

    if (apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#999">No applications found.</td></tr>';
        return;
    }

    apps.forEach(a => {
        const badge = getBadge(a.status);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.applicationId}</td>
            <td>${a.studentId}</td>
            <td>${a.reason.substring(0, 60)}...</td>
            <td>${a.applicationDate}</td>
            <td>${badge}</td>
            <td>
                <button class="btn btn-red btn-small" onclick="deleteApp('${a.applicationId}')">🗑</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// APPLICATIONS — Filter
// ============================================================
async function filterApplications() {
    const studentId = document.getElementById('search-app-id').value.trim();
    const status    = document.getElementById('filter-status').value;

    let url = API + '/applications?';
    if (studentId) url += 'studentId=' + studentId + '&';
    if (status)    url += 'status=' + status;

    const res  = await fetch(url);
    const apps = await res.json();
    renderApplications(apps);
}

// ============================================================
// APPLICATIONS — Delete
// ============================================================
async function deleteApp(id) {
    if (!confirm('Delete this application?')) return;
    const res = await fetch(API + '/applications/' + id, { method: 'DELETE' });
    if (res.ok) loadApplications();
}

// ============================================================
// ADMIN — Load All Applications with Approve/Reject buttons
// ============================================================
async function loadAdminApps() {
    const res  = await fetch(API + '/applications');
    const apps = await res.json();

    const tbody = document.getElementById('admin-tbody');
    tbody.innerHTML = '';

    if (apps.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999">No applications.</td></tr>';
        return;
    }

    // Get students for name display
    const sRes      = await fetch(API + '/students');
    const students  = await sRes.json();

    apps.forEach(a => {
        const student = students.find(s => s.studentId === a.studentId);
        const name    = student ? student.fullName : 'Unknown';
        const badge   = getBadge(a.status);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${a.applicationId}</td>
            <td>${a.studentId}</td>
            <td>${name}</td>
            <td>${a.reason.substring(0, 50)}...</td>
            <td>${a.applicationDate}</td>
            <td>${badge}</td>
            <td>
                ${a.status === 'Pending' ? `
                    <button class="btn btn-green btn-small" onclick="approveApp('${a.applicationId}')">✅ Approve</button>
                    <button class="btn btn-red btn-small" onclick="rejectApp('${a.applicationId}')">❌ Reject</button>
                ` : '<span style="color:#999;font-size:12px">Reviewed</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// ADMIN — Approve Application
// ============================================================
async function approveApp(id) {
    const res  = await fetch(API + '/applications/' + id + '/approve', { method: 'PUT' });
    const data = await res.json();
    showMsg('admin-msg', data.message || data.error, res.ok ? 'success' : 'error');
    loadAdminApps();
    loadDashboard();
}

// ============================================================
// ADMIN — Reject Application
// ============================================================
async function rejectApp(id) {
    const res  = await fetch(API + '/applications/' + id + '/reject', { method: 'PUT' });
    const data = await res.json();
    showMsg('admin-msg', data.message || data.error, res.ok ? 'success' : 'error');
    loadAdminApps();
    loadDashboard();
}

// ============================================================
// PAYMENTS — Record New Payment
// ============================================================
async function recordPayment() {
    const studentId = document.getElementById('p-sid').value.trim();
    const month     = document.getElementById('p-month').value;
    const year      = document.getElementById('p-year').value.trim();

    if (!studentId || !month || !year) {
        showMsg('p-msg', 'All fields are required.', 'error');
        return;
    }

    try {
        const res  = await fetch(API + '/payments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ studentId, month, year })
        });
        const data = await res.json();

        if (res.ok) {
            showMsg('p-msg', data.message + ' — Amount: 3,000 Birr', 'success');
            loadPayments();
        } else {
            showMsg('p-msg', data.error, 'error');
        }
    } catch (err) {
        showMsg('p-msg', 'Server error.', 'error');
    }
}

// ============================================================
// PAYMENTS — Load All Payments
// ============================================================
async function loadPayments() {
    const res      = await fetch(API + '/payments');
    const payments = await res.json();
    renderPayments(payments);
}

function renderPayments(payments) {
    const tbody = document.getElementById('pay-tbody');
    tbody.innerHTML = '';

    if (payments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#999">No payments recorded yet.</td></tr>';
        return;
    }

    payments.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.paymentId}</td>
            <td>${p.studentId}</td>
            <td>${p.month}</td>
            <td>${p.year}</td>
            <td><strong>${p.amount.toLocaleString()} Birr</strong></td>
            <td><span class="badge badge-paid">${p.status}</span></td>
            <td>${p.paidAt.split('T')[0]}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ============================================================
// PAYMENTS — Search by Student ID
// ============================================================
async function searchPayments() {
    const studentId = document.getElementById('search-pay-id').value.trim();
    if (!studentId) { loadPayments(); return; }

    const res      = await fetch(API + '/payments?studentId=' + studentId);
    const payments = await res.json();
    renderPayments(payments);
}

// ============================================================
// HELPER — Get Status Badge HTML
// ============================================================
function getBadge(status) {
    if (status === 'Approved') return '<span class="badge badge-approved">Approved</span>';
    if (status === 'Rejected') return '<span class="badge badge-rejected">Rejected</span>';
    return '<span class="badge badge-pending">Pending</span>';
}

// ============================================================
// AUTO LOAD — Load dashboard on page start
// ============================================================
window.onload = function () {
    loadDashboard();
};
