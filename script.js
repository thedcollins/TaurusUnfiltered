const video = document.getElementById("scrollVideo");
video.src = "/videos/angry.mp4";
video.loop = true;

let duration = 0;
let scrollVelocity = 0;
let isUserScrolling = false;
let lastScrollY = window.scrollY;
let lastUpdateTime = performance.now();

// Tune these values
const SCROLL_SENSITIVITY = 0.002; // how much scroll affects video
const VELOCITY_DECAY = 0.9;       // how quickly it slows down
const IDLE_RESUME_DELAY = 500;    // ms after scroll ends to resume looping

let idleTimeout;

video.addEventListener("loadedmetadata", () => {
  duration = video.duration;
  video.play();
});

// Scroll input → set scroll velocity
window.addEventListener("scroll", () => {
  const currentScrollY = window.scrollY;
  const deltaY = currentScrollY - lastScrollY;
  lastScrollY = currentScrollY;

  scrollVelocity += deltaY * SCROLL_SENSITIVITY;

  if (!isUserScrolling) {
    isUserScrolling = true;
    video.pause();
  }

  // Reset idle resume
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(() => {
    isUserScrolling = false;
    video.play();
  }, IDLE_RESUME_DELAY);
});

function animate() {
  const now = performance.now();
  const deltaTime = (now - lastUpdateTime) / 1000;
  lastUpdateTime = now;

  if (isUserScrolling || Math.abs(scrollVelocity) > 0.001) {
    let newTime = video.currentTime + scrollVelocity;

    // Wrap video time to loop continuously
    if (newTime < 0) {
      newTime = duration + (newTime % duration);
    }
    if (newTime > duration) {
      newTime = newTime % duration;
    }

    video.currentTime = newTime;

    // Apply decay to velocity
    scrollVelocity *= VELOCITY_DECAY;
  }

  requestAnimationFrame(animate);
}

animate();

const signs = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

async function loadHoroscope() {
  try {
    const res = await fetch('dailyHoroscopes.json');
    const data = await res.json();

    const today = new Date();
    const todayISO = today.toISOString().slice(0, 10);       // e.g. "2025-08-05"
    const monthKey = today.toISOString().slice(0, 7);       // e.g. "2025-08"

    const todayEntry = data[todayISO];

    const quoteEl = document.getElementById('dailyQuote');
    const roastEl = document.getElementById('signRoast');
    const signsContainer = document.getElementById('signsContainer');

    if (!todayEntry) {
      quoteEl.textContent = "Taurus is silent today. Unusual, but possible.";
      return;
    }

    // Show today's quote
    quoteEl.textContent = todayEntry.quote;

    // Clear any existing signs
    signsContainer.innerHTML = '';
    roastEl.innerHTML = '';

    signs.forEach(sign => {
      const btn = document.createElement('div');
      btn.className = 'sign';
      btn.setAttribute('data-sign', sign);

      const img = document.createElement('img');
      const fileName = `${sign}_symbol_(bold).svg`.replace(/\s+/g, '_');
      img.src = `images/${fileName}`;
      img.alt = sign;

      btn.appendChild(img);

      btn.onclick = () => {
        // Show daily roast for this sign
        const roastText = todayEntry.signRoasts[sign] || "Taurus has no comment for you today.";

        // Build the roast HTML with the monthly horoscope toggle link
        let monthlyText = "No monthly horoscope available.";

        if (data[monthKey] && data[monthKey].monthlyHoroscopes && data[monthKey].monthlyHoroscopes[sign]) {
          monthlyText = data[monthKey].monthlyHoroscopes[sign];
        }

        roastEl.textContent = roastText;

        // Add toggle functionality for monthly horoscope
        const toggleLink = document.getElementById('toggleMonthly');
        const monthlyDiv = document.getElementById('monthlyHoroscope');

        toggleLink.onclick = () => {
          if (monthlyDiv.style.display === 'none') {
            monthlyDiv.style.display = 'block';
            toggleLink.textContent = 'Hide monthly horoscope';
          } else {
            monthlyDiv.style.display = 'none';
            toggleLink.textContent = 'Read your monthly horoscope here';
          }
        };
      };

      signsContainer.appendChild(btn);
    });

  } catch (err) {
    document.getElementById('dailyQuote').textContent = "Taurus is annoyed. Something broke.";
    console.error(err);
  }
}

loadHoroscope();