function loadDisplay(department) {
  updateTime();
  setInterval(updateTime, 1000);

  updateDisplay(department);
  setInterval(() => updateDisplay(department), 1000);
}

function updateTime() {
  const now = new Date();
  document.getElementById("time").innerText =
    now.toLocaleTimeString() + "\n" + now.toDateString();
}

function updateDisplay(dept) {
  let data = JSON.parse(localStorage.getItem("queueList")) || [];

  let filtered = data.filter(q => q.dept === dept);

  let waiting = filtered.filter(q => q.status === "Waiting");
  let serving = filtered.filter(q => q.status === "Serving");
  let completed = filtered.filter(q => q.status === "Completed");

  document.getElementById("waiting").innerText = waiting.length;
  document.getElementById("serving").innerText = serving.length;
  document.getElementById("completed").innerText = completed.length;

  // RESET WINDOWS
  for (let i = 1; i <= 4; i++) {
    document.getElementById("window" + i).innerHTML =
      `WINDOW ${i}<span>-----</span><p>AVAILABLE</p>`;
  }

  // SHOW CURRENT SERVING
  serving.forEach((q, i) => {
    if (i < 4) {
      document.getElementById("window" + (i + 1)).innerHTML =
        `WINDOW ${i + 1}<span>${q.queueNo}</span><p>NOW SERVING</p>`;
    }
  });
}