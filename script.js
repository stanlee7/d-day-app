const eventNameInput = document.getElementById('event-name');
const targetDateInput = document.getElementById('target-date');
const setBtn = document.getElementById('set-btn');
const countdownEl = document.getElementById('countdown');
const messageEl = document.getElementById('message');
const themeToggle = document.getElementById('theme-toggle');
const bgToggle = document.getElementById('bg-toggle');
const mainTitle = document.getElementById('main-title');

const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const confettiCanvas = document.getElementById('confetti');

let countdownInterval;

const bgGradients = [
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)',
    'linear-gradient(to top, #cfd9df 0%, #e2ebf0 100%)',
    '#f4f6f8' // Default
];
let currentBgIndex = 0;

// Load saved data
function loadData() {
    const savedEventName = localStorage.getItem('dday-event-name');
    const savedTargetDate = localStorage.getItem('dday-target-date');
    const savedTheme = localStorage.getItem('dday-theme');

    if (savedEventName) {
        eventNameInput.value = savedEventName;
        mainTitle.textContent = savedEventName + " D-Day";
    }

    if (savedTargetDate) targetDateInput.value = savedTargetDate;

    if (savedTheme) {
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        // No icon update needed as it's static in menu
    }

    if (savedTargetDate) {
        startCountdown();
    }
}

// Save & Start
function handleSet() {
    const name = eventNameInput.value.trim();
    const date = targetDateInput.value;

    if (!name || !date) {
        alert('이벤트 이름과 날짜를 모두 입력해주세요.');
        return;
    }

    localStorage.setItem('dday-event-name', name);
    localStorage.setItem('dday-target-date', date);

    mainTitle.textContent = name + " D-Day";
    startCountdown();
}

// Theme handling
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('dday-theme', isDark ? 'dark' : 'light');
}

// Bg handling
function toggleBg() {
    currentBgIndex = (currentBgIndex + 1) % bgGradients.length;
    document.body.style.background = bgGradients[currentBgIndex];
}

// Countdown Logic
function startCountdown() {
    clearInterval(countdownInterval);
    updateCounter(); // Immediate update
    countdownInterval = setInterval(updateCounter, 1000);
}

function updateCounter() {
    const targetDate = new Date(targetDateInput.value).getTime();
    if (isNaN(targetDate)) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
        clearInterval(countdownInterval);
        // countdownEl.classList.add('hidden'); // Keep visible or dim? Let's keep visible but show message
        messageEl.textContent = `🎉 ${eventNameInput.value || 'D-Day'} 도착! 🎉`;
        messageEl.classList.remove('hidden');
        startConfetti();
        return;
    }

    countdownEl.classList.remove('hidden');
    messageEl.classList.add('hidden');
    stopConfetti();

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Initial check to avoid flash of 0 if data exists
    daysEl.textContent = days;
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

// Confetti Effect
let confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let confettiAnimationId;

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

function createParticles() {
    const colors = ['#a864fd', '#29cdff', '#78ff44', '#ff718d', '#fdff6a'];
    for (let i = 0; i < 100; i++) {
        confettiParticles.push({
            x: Math.random() * confettiCanvas.width,
            y: Math.random() * confettiCanvas.height - confettiCanvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            velocity: {
                x: Math.random() * 4 - 2,
                y: Math.random() * 5 + 2
            }
        });
    }
}

function drawConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach((p, index) => {
        confettiCtx.fillStyle = p.color;
        confettiCtx.beginPath();
        confettiCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        confettiCtx.fill();

        p.y += p.velocity.y;
        p.x += p.velocity.x;

        if (p.y > confettiCanvas.height) {
            confettiParticles[index] = {
                x: Math.random() * confettiCanvas.width,
                y: -10,
                color: p.color,
                size: p.size,
                velocity: p.velocity
            };
        }
    });

    confettiAnimationId = requestAnimationFrame(drawConfetti);
}

function startConfetti() {
    if (confettiAnimationId) return;
    resizeCanvas();
    createParticles();
    drawConfetti();
    window.addEventListener('resize', resizeCanvas);
}

function stopConfetti() {
    cancelAnimationFrame(confettiAnimationId);
    confettiAnimationId = null;
    confettiParticles = [];
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    window.removeEventListener('resize', resizeCanvas);
}


// Event Listeners
setBtn.addEventListener('click', handleSet);
themeToggle.addEventListener('click', toggleTheme);
bgToggle.addEventListener('click', toggleBg);

// Enter key support for input
eventNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSet();
});

// Initialize
loadData();
