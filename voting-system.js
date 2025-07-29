let parties = [
    { name: "Bharatiya Janata Party (BJP)", votes: 0 },
    { name: "Indian National Congress (INC)", votes: 0 },
    { name: "Aam Aadmi Party (AAP)", votes: 0 },
    { name: "Bahujan Samaj Party (BSP)", votes: 0 },
    { name: "Communist Party of India (CPI)", votes: 0 }
];
let votes = {}; // voterId: partyName
let adminLoggedIn = false;
let currentVoterId = null;

// In-memory storage for demo (replace with backend for real use)
let registeredVoters = {}; // voterId: { name }
let registeredAdmins = { "admin": "india2024" }; // username: password

// Utility: Animate numbers
function animateCountUp(element, end) {
    let start = parseInt(element.textContent.replace(/\D/g, "")) || 0;
    end = parseInt(end);
    if (start === end) return;
    let duration = 800;
    let startTime = null;
    function animateStep(timestamp) {
        if (!startTime) startTime = timestamp;
        let progress = Math.min((timestamp - startTime) / duration, 1);
        let value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
            requestAnimationFrame(animateStep);
        } else {
            element.textContent = end;
        }
    }
    requestAnimationFrame(animateStep);
}

// Navigation
function showPage(pageId) {
    ['homePage', 'voterLoginPage', 'votePage', 'resultsPage', 'adminLoginPage', 'adminPage', 'voterRegisterPage', 'adminRegisterPage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    const showEl = document.getElementById(pageId);
    if (showEl) showEl.classList.remove('hidden');
    // If showing results, render them
    if (pageId === 'resultsPage') renderResults();
}
document.getElementById('navHome').onclick = () => showPage('homePage');
document.getElementById('navVoterLogin').onclick = () => showPage('voterLoginPage');
document.getElementById('navVote').onclick = () => {
    if (currentVoterId) {
        document.getElementById('voterId').value = currentVoterId;
        showPage('votePage');
    } else {
        showPage('voterLoginPage');
    }
};
document.getElementById('navResults').onclick = () => showPage('resultsPage');
document.getElementById('navAdmin').onclick = () => showPage('adminLoginPage');
document.getElementById('backToHomeFromAdmin').onclick = (e) => { e.preventDefault(); showPage('homePage'); };
document.getElementById('backToHomeFromVoter').onclick = (e) => { e.preventDefault(); showPage('homePage'); };

// Registration links
document.getElementById('voterLoginForm').insertAdjacentHTML('afterend',
    `<div class="mt-4 text-center">
        <a href="#" id="showVoterRegister" class="text-blue-600 hover:underline text-sm">New user? Register here</a>
    </div>`
);
document.getElementById('adminLoginForm').insertAdjacentHTML('afterend',
    `<div class="mt-4 text-center">
        <a href="#" id="showAdminRegister" class="text-indigo-600 hover:underline text-sm">New admin? Register here</a>
    </div>`
);
document.getElementById('showVoterRegister').onclick = (e) => { e.preventDefault(); showPage('voterRegisterPage'); };
document.getElementById('backToLoginFromVoterReg').onclick = (e) => { e.preventDefault(); showPage('voterLoginPage'); };
document.getElementById('showAdminRegister').onclick = (e) => { e.preventDefault(); showPage('adminRegisterPage'); };
document.getElementById('backToLoginFromAdminReg').onclick = (e) => { e.preventDefault(); showPage('adminLoginPage'); };

// Voter Registration
document.getElementById('voterRegisterForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('registerVoterName').value.trim();
    const voterId = document.getElementById('registerVoterId').value.trim();
    const msg = document.getElementById('voterRegisterMsg');
    if (!name || !voterId) {
        msg.textContent = "Please fill all fields.";
        msg.className = "mt-4 text-center text-base font-semibold text-red-600";
        return;
    }
    if (registeredVoters[voterId]) {
        msg.textContent = "Voter ID already registered.";
        msg.className = "mt-4 text-center text-base font-semibold text-orange-600";
        return;
    }
    registeredVoters[voterId] = { name };
    msg.textContent = "Registration successful! You can now login.";
    msg.className = "mt-4 text-center text-base font-semibold text-green-600";
    setTimeout(() => { msg.textContent = ""; showPage('voterLoginPage'); }, 2000);
    this.reset();
};

// Admin Registration
document.getElementById('adminRegisterForm').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('registerAdminUsername').value.trim();
    const password = document.getElementById('registerAdminPassword').value.trim();
    const msg = document.getElementById('adminRegisterMsg');
    if (!username || !password) {
        msg.textContent = "Please fill all fields.";
        msg.className = "mt-4 text-center text-base font-semibold text-red-600";
        return;
    }
    if (registeredAdmins[username]) {
        msg.textContent = "Admin username already exists.";
        msg.className = "mt-4 text-center text-base font-semibold text-orange-600";
        return;
    }
    registeredAdmins[username] = password;
    msg.textContent = "Admin registered! You can now login.";
    msg.className = "mt-4 text-center text-base font-semibold text-green-600";
    setTimeout(() => { msg.textContent = ""; showPage('adminLoginPage'); }, 2000);
    this.reset();
};

// Voter Login
document.getElementById('voterLoginForm').onsubmit = function(e) {
    e.preventDefault();
    const voterId = document.getElementById('loginVoterId').value.trim();
    if (!voterId) return;
    if (!registeredVoters[voterId]) {
        alert("Voter ID not registered. Please register first.");
        return;
    }
    currentVoterId = voterId;
    document.getElementById('voterId').value = voterId;
    showPage('votePage');
    this.reset();
};

// Admin Login
document.getElementById('adminLoginForm').onsubmit = function(e) {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value.trim();
    const password = document.getElementById('adminPassword').value.trim();
    if (registeredAdmins[username] && registeredAdmins[username] === password) {
        adminLoggedIn = true;
        showPage('adminPage');
        renderAdminParties();
    } else {
        alert("Invalid admin credentials.");
    }
    this.reset();
};
document.getElementById('adminLogout').onclick = function() {
    adminLoggedIn = false;
    showPage('homePage');
};

// Admin Party Management
function renderAdminParties() {
    const ul = document.getElementById('adminPartyList');
    ul.innerHTML = '';
    parties.forEach((p, i) => {
        ul.innerHTML += `<li class="flex justify-between items-center mb-2">
            <span>${p.name}</span>
            <button onclick="removeParty(${i})" class="ml-4 text-red-600 hover:underline text-xs">Remove</button>
        </li>`;
    });
}
window.removeParty = function(idx) {
    parties.splice(idx, 1);
    renderPartyOptions();
    renderAdminParties();
    renderResults();
};
document.getElementById('addPartyForm').onsubmit = function(e) {
    e.preventDefault();
    const name = document.getElementById('newPartyName').value.trim();
    if (name && !parties.some(p => p.name === name)) {
        parties.push({ name, votes: 0 });
        renderPartyOptions();
        renderAdminParties();
        renderResults();
    }
    this.reset();
};

// Voting
function renderPartyOptions() {
    const partySelect = document.getElementById('party');
    partySelect.innerHTML = '<option value="">-- Choose Party --</option>';
    parties.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.name;
        opt.textContent = p.name;
        partySelect.appendChild(opt);
    });
}
document.getElementById('voteForm').onsubmit = function(e) {
    e.preventDefault();
    const voterId = document.getElementById('voterId').value.trim();
    const party = document.getElementById('party').value;
    const msg = document.getElementById('voteMessage');
    if (!voterId || !party) {
        msg.textContent = "Please enter your Voter ID and select a party.";
        msg.className = "mt-6 text-center text-lg font-semibold text-red-600";
        return;
    }
    if (votes[voterId]) {
        msg.textContent = "You have already voted!";
        msg.className = "mt-6 text-center text-lg font-semibold text-orange-600";
        return;
    }
    votes[voterId] = party;
    parties.find(p => p.name === party).votes++;
    msg.textContent = "Thank you for voting!";
    msg.className = "mt-6 text-center text-lg font-semibold text-green-600";
    confettiBurst();
    renderResults();
    setTimeout(() => { msg.textContent = ""; }, 4000);
    this.reset();
    currentVoterId = null;
    setTimeout(() => showPage('homePage'), 2000);
};

// Results
let votesPieChart = null;
function renderResults() {
    const resultsList = document.getElementById('resultsList');
    const totalVotesStat = document.getElementById('totalVotesStat');
    const totalPartiesStat = document.getElementById('totalPartiesStat');
    const lastVoteStat = document.getElementById('lastVoteStat');

    let totalVotes = parties.reduce((sum, p) => sum + p.votes, 0);
    let lastVoter = Object.keys(votes).length ? Object.keys(votes)[Object.keys(votes).length - 1] : null;
    let lastParty = lastVoter ? votes[lastVoter] : null;

    animateCountUp(totalVotesStat, totalVotes);
    animateCountUp(totalPartiesStat, parties.length);

    lastVoteStat.textContent = lastVoter ? `Voter ID: ${lastVoter} → ${lastParty}` : "-";

    let sortedParties = [...parties].sort((a, b) => b.votes - a.votes);

    resultsList.innerHTML = '';
    sortedParties.forEach((p, idx) => {
        let percent = totalVotes ? ((p.votes / totalVotes) * 100).toFixed(1) : 0;
        resultsList.innerHTML += `
            <div class="relative bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between shadow-lg animated-card" style="animation-delay:${idx * 0.15}s">
                <div class="flex items-center gap-4 mb-4 md:mb-0">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-400 to-blue-400 flex items-center justify-center shadow-lg border-2 border-indigo-200">
                        <span class="text-2xl font-bold text-white">${p.name.match(/\((.*?)\)/) ? p.name.match(/\((.*?)\)/)[1][0] : p.name[0]}</span>
                    </div>
                    <span class="font-semibold text-lg text-blue-900">${p.name}</span>
                </div>
                <div class="flex-1 mx-4">
                    <div class="w-full bg-blue-100 rounded-full h-5 overflow-hidden shadow-inner">
                        <div class="bg-gradient-to-r from-blue-500 to-indigo-500 h-5 rounded-full result-bar" style="width:0%"></div>
                    </div>
                </div>
                <div class="flex flex-col items-end min-w-[120px]">
                    <span class="font-bold text-blue-700 text-xl count-up" data-count="${p.votes}">0</span>
                    <span class="text-sm text-gray-500">${percent}%</span>
                </div>
            </div>
        `;
    });

    setTimeout(() => {
        document.querySelectorAll('.result-bar').forEach((bar, i) => {
            let percent = sortedParties[i];
            let width = totalVotes ? ((percent.votes / totalVotes) * 100).toFixed(1) : 0;
            bar.style.transition = "width 1.2s cubic-bezier(.4,2,.6,1)";
            bar.style.width = width + "%";
        });
        document.querySelectorAll('.count-up').forEach((el, i) => {
            let end = i === 0 ? totalVotes : (i === 1 ? parties.length : sortedParties[i - 2]?.votes || 0);
            animateCountUp(el, end);
        });
    }, 100);

    document.querySelectorAll('.animated-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), 120 + i * 120);
    });

    // Pie Chart
    const ctx = document.getElementById('votesPieChart').getContext('2d');
    const partyLabels = parties.map(p => p.name);
    const partyVotes = parties.map(p => p.votes);
    const partyColors = [
        "#6366f1", "#f59e42", "#06b6d4", "#a21caf", "#f43f5e", "#fbbf24", "#10b981", "#3b82f6"
    ];
    if (votesPieChart) votesPieChart.destroy();
    votesPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: partyLabels,
            datasets: [{
                data: partyVotes,
                backgroundColor: partyColors.slice(0, parties.length),
                borderWidth: 2,
                borderColor: "#fff"
            }]
        },
        options: {
            responsive: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: "#312e81",
                        font: { size: 14, weight: "bold" }
                    }
                },
                tooltip: {
                    backgroundColor: "#fff",
                    titleColor: "#333",
                    bodyColor: "#666",
                    borderColor: "#ddd",
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(tooltipItem) {
                            let party = tooltipItem.label;
                            let votes = tooltipItem.raw;
                            let percent = ((votes / totalVotes) * 100).toFixed(1);
                            return [`${party} - ${votes} votes`, `${percent}%`];
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 4,
                    borderColor: "#fff"
                }
            }
        }
    });

    // Progress bar for goal
    const votesGoal = 1000;
    document.getElementById('votesGoalLabel').textContent = `Goal: ${votesGoal}`;
    const percentGoal = Math.min(100, (totalVotes/votesGoal)*100);
    document.getElementById('votesGoalBar').style.width = percentGoal + "%";
}

// Share Results Button
document.getElementById('shareResultsBtn').onclick = function() {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert("Results page link copied! Share it with others.");
};

// Live Clock
function updateClock() {
    const el = document.getElementById('liveClock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString('en-IN', { hour12: true });
}
setInterval(updateClock, 1000);
updateClock();

// Confetti Animation
function confettiBurst() {
    const canvas = document.getElementById('confettiCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    const pieces = Array.from({length: 120}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 8 + Math.random() * 8,
        h: 8 + Math.random() * 8,
        color: `hsl(${Math.random()*360},90%,60%)`,
        dy: 2 + Math.random() * 6,
        dx: -2 + Math.random() * 4,
        rot: Math.random() * Math.PI,
        dr: (Math.random() - 0.5) * 0.2
    }));
    let frame = 0;
    function draw() {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        pieces.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
            ctx.restore();
            p.x += p.dx;
            p.y += p.dy;
            p.rot += p.dr;
        });
        frame++;
        if (frame < 80) requestAnimationFrame(draw);
        else canvas.style.display = 'none';
    }
    draw();
}

// Initial load
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animated-card').forEach((card, i) => {
        setTimeout(() => card.classList.add('visible'), 120 + i * 120);
    });
    renderPartyOptions();
    renderResults();
});