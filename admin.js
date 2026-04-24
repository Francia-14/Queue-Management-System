let queue = {
  registrar: [],
  cashier: []
};

let windowSlots = {
  registrar: [null, null, null, null],
  cashier: [null, null, null, null]
};

function loadQueue() {
  const savedQueue = JSON.parse(localStorage.getItem("queueList")) || [];
  const savedWindows = JSON.parse(localStorage.getItem("windowSlots"));

  queue.registrar = savedQueue.filter(q => q.dept === "registrar");
  queue.cashier = savedQueue.filter(q => q.dept === "cashier");

  if (savedWindows) {
    windowSlots = savedWindows;
  }

  refreshAll();
}

function saveAll() {
  const all = [...queue.registrar, ...queue.cashier];

  localStorage.setItem("queueList", JSON.stringify(all));
  localStorage.setItem("windowSlots", JSON.stringify(windowSlots));
}

function getDept() {
  return document.getElementById("department").value;
}

function refreshAll() {
  updateUI();
  updateWindows();
}

function updateUI() {
  const dept = getDept();

  const queueBox = document.getElementById("queueBox");
  const currentBox = document.getElementById("currentNumber");

  if (!dept) {
    queueBox.innerHTML = "Select department";
    currentBox.innerText = "------";
    return;
  }

  const waiting = queue[dept].filter(q => q.status === "Waiting");

  let activeNumber = null;

  for (let i = 0; i < 4; i++) {
    if (windowSlots[dept][i]) {
      activeNumber = windowSlots[dept][i].queueNo;
      break;
    }
  }

  currentBox.innerText = activeNumber || "------";

  queueBox.innerHTML =
    waiting.length === 0
      ? "No one waiting"
      : waiting.map((q, i) => `<div>${i + 1}. ${q.queueNo}</div>`).join("");
}

function updateWindows() {
  const dept = getDept();
  if (!dept) return;

  for (let i = 0; i < 4; i++) {
    const slot = windowSlots[dept][i];

    const value = slot ? slot.queueNo : null;

    document.getElementById("window" + i).innerHTML =
      `Window ${i + 1}<div class="line">${value || "--------"}</div>`;
  }
}

function callNext() {
  const dept = getDept();
  if (!dept) return;

  const waiting = queue[dept].filter(q => q.status === "Waiting");

  if (waiting.length === 0) {
    alert("No one in queue");
    return;
  }

  const emptyIndex = windowSlots[dept].findIndex(w => w === null);

  if (emptyIndex === -1) {
    alert("All windows are occupied");
    return;
  }

  const next = waiting[0];
  next.status = "Serving";

  windowSlots[dept][emptyIndex] = {
    queueNo: next.queueNo,
    calledAt: Date.now()
  };

  saveAll();
  refreshAll();
}

function complete() {
  const dept = getDept();
  if (!dept) return;

  for (let i = 0; i < 4; i++) {
    if (windowSlots[dept][i] !== null) {
      const queueNo = windowSlots[dept][i].queueNo;

      const item = queue[dept].find(q => q.queueNo === queueNo);

      if (item) {
        item.status = "Completed";
        item.timeCompleted = Date.now();
      }

      windowSlots[dept][i] = null;

      saveAll();
      refreshAll();
      return;
    }
  }

  alert("No active number");
}

function skip() {
  const dept = getDept();
  if (!dept) return;

  const waiting = queue[dept].filter(q => q.status === "Waiting");

  for (let i = 0; i < 4; i++) {
    if (windowSlots[dept][i] !== null) {
      windowSlots[dept][i] = null;

      if (waiting.length > 0) {
        const next = waiting[0];
        next.status = "Serving";

        windowSlots[dept][i] = {
          queueNo: next.queueNo,
          calledAt: Date.now()
        };
      }

      saveAll();
      refreshAll();
      return;
    }
  }
}

function recall() {
  const dept = getDept();
  if (!dept) return;

  for (let i = 0; i < 4; i++) {
    const slot = windowSlots[dept][i];

    if (slot !== null) {
      alert("RECALL: " + slot.queueNo);
      return;
    }
  }

  alert("No active number");
}

function resetSystem() {
  const dept = getDept();
  if (!dept) return;

  queue[dept] = [];
  windowSlots[dept] = [null, null, null, null];

  saveAll();
  refreshAll();
}

document.getElementById("department").addEventListener("change", () => {
  refreshAll();
});

window.onload = loadQueue;