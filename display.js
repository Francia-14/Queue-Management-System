function loadDisplay(department) {
  updateTime();
  setInterval(updateTime, 1000);

  updateDisplay(department);
  setInterval(() => updateDisplay(department), 1000);
}

// ---------------- TIME ----------------
function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString() + "\n" + now.toDateString();
}

// ---------------- MAIN DISPLAY ----------------
function updateDisplay(dept) {
  let data = JSON.parse(localStorage.getItem("queueList")) || [];

  let filtered = data.filter(q => q.dept === dept);

  let waiting = filtered.filter(q => q.status === "Waiting");
  let serving = filtered.filter(q => q.status === "Serving");
  let completed = filtered.filter(q => q.status === "Completed");

  document.getElementById("waiting").innerText = waiting.length;
  document.getElementById("serving").innerText = serving.length;
  document.getElementById("completed").innerText = completed.length;

  // RESET ALL FIRST
  resetUI(dept);

  // ---------------- CASHIER (WINDOWS) ----------------
  if (dept === "cashier") {
    serving.forEach((q, i) => {
      if (i < 4) {
        const el = document.getElementById("window" + i);
        if (el) {
          el.innerHTML = `
            WINDOW ${i + 1}
            <span>${q.queueNo}</span>
            <p>NOW SERVING</p>
          `;
        }
      }
    });
  }

  // ---------------- REGISTRAR (COUNTERS) ----------------
  if (dept === "registrar") {

    const map = {
      A1: null,
      A2: null,
      B: null,
      C: null,
      D: null
    };

    serving.forEach(q => {
      const service = q.service;

      let counter =
        ["Realising", "Authentication"].includes(service) ? "A1" :
        ["Requesting", "Inquiry"].includes(service) ? "A2" :
        ["CCJE", "CHS", "CAS"].includes(service) ? "B" :
        ["CTED", "CBM"].includes(service) ? "C" :
        ["CCS", "COE"].includes(service) ? "D" :
        "A2";

      map[counter] = q.queueNo;
    });

    Object.keys(map).forEach(counter => {
      const el = document.getElementById(counter);
      if (el) {
        el.innerHTML = `
          COUNTER ${counter}
          <span>${map[counter] || "-----"}</span>
          <p>${map[counter] ? "NOW SERVING" : "AVAILABLE"}</p>
        `;
      }
    });
  }
}

// ---------------- RESET UI ----------------
function resetUI(dept) {

  if (dept === "cashier") {
    for (let i = 0; i < 4; i++) {
      const el = document.getElementById("window" + i);
      if (el) {
        el.innerHTML = `WINDOW ${i + 1}<span>-----</span><p>AVAILABLE</p>`;
      }
    }
  }

  if (dept === "registrar") {
    ["A1", "A2", "B", "C", "D"].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.innerHTML = `COUNTER ${id}<span>-----</span><p>AVAILABLE</p>`;
      }
    });
  }
}