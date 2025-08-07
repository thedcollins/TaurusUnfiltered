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
  
          roastEl.innerHTML = `
            <p>${roastText}</p>
            <p style="margin-top: 1rem; cursor: pointer; color: #80331a; font-weight: bold;" id="toggleMonthly">
              Read your monthly horoscope here
            </p>
            <div id="monthlyHoroscope" style="margin-top: 1rem; display: none; text-align: left; font-style: italic; color: #4a3c31;">
              ${monthlyText}
            </div>
          `;
  
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