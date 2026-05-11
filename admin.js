let queue = {
  registrar: [],
  cashier: []
};

let windowSlots = {
  cashier: [null, null, null, null]
};

let counterSlots = {
  registrar: {
    A1: null,
    A2: null,
    B: null,
    C: null,
    D: null
  }
};

// COUNTER SERIES (FOR NUMBERING)
let counterSeries = {
  A1: 0,
  A2: 0,
  B: 0,
  C: 0,
  D: 0
};

// START
window.addEventListener("load", loadQueue);

// LOAD
function loadQueue() {

  const saved =
    JSON.parse(localStorage.getItem("queueList")) || [];

  queue.registrar =
    saved.filter(q => q.dept === "registrar");

  queue.cashier =
    saved.filter(q => q.dept === "cashier");

  const savedWindows =
    JSON.parse(localStorage.getItem("windowSlots"));

  const savedCounters =
    JSON.parse(localStorage.getItem("counterSlots"));

  const savedSeries =
    JSON.parse(localStorage.getItem("counterSeries"));

  if (savedWindows) windowSlots = savedWindows;
  if (savedCounters) counterSlots = savedCounters;
  if (savedSeries) counterSeries = savedSeries;

  refreshAll();
}

// SAVE
function saveAll() {

  const all = [
    ...queue.registrar,
    ...queue.cashier
  ];

  localStorage.setItem("queueList", JSON.stringify(all));
  localStorage.setItem("windowSlots", JSON.stringify(windowSlots));
  localStorage.setItem("counterSlots", JSON.stringify(counterSlots));
  localStorage.setItem("counterSeries", JSON.stringify(counterSeries));
}

// GET DEPARTMENT
function getDept() {
  return document.getElementById("department").value;
}

// COUNTER MAP
function getCounter(service) {

  const map = {
    "Realising": "A1",
    "Authentication": "A1",
    "Requesting": "A2",
    "Inquiry": "A2",
    "CCJE": "B",
    "CHS": "B",
    "CAS": "B",
    "CTED": "C",
    "CBM": "C",
    "CCS": "D",
    "COE": "D"
  };

  return map[service] || "A2";
}

// REFRESH
function refreshAll() {
  updateUI();
  renderServiceArea();
}

// UPDATE UI
function updateUI() {

  const dept = getDept();

  const queueBox =
    document.getElementById("queueBox");

  const currentBox =
    document.getElementById("currentNumber");

  if (!dept) {
    queueBox.innerHTML = "Select department";
    currentBox.innerText = "------";
    return;
  }

  const waiting =
    queue[dept].filter(q => q.status === "Waiting");

  queueBox.innerHTML =
    waiting.length === 0
      ? "No one waiting"
      : waiting.map((q, i) =>
          `<div>${i + 1}. ${q.queueNo}</div>`
        ).join("");

  let active = null;

  if (dept === "cashier") {
    for (let i = 0; i < 4; i++) {
      if (windowSlots.cashier[i]) {
        active = windowSlots.cashier[i].queueNo;
        break;
      }
    }
  }

  if (dept === "registrar") {
    Object.values(counterSlots.registrar)
      .forEach(v => {
        if (v && !active) active = v.queueNo;
      });
  }

  currentBox.innerText = active || "------";
}

// RENDER SERVICE AREA
function renderServiceArea() {

  const dept = getDept();

  const area =
    document.getElementById("serviceArea");

  const title =
    document.getElementById("serviceTitle");

  if (dept === "cashier") {

    title.innerText = "Service Windows";
    area.innerHTML = "";

    for (let i = 0; i < 4; i++) {

      const slot = windowSlots.cashier[i];

      area.innerHTML += `
        <div class="window">
          WINDOW ${i + 1}
          <div class="line">
            ${slot ? slot.queueNo : "--------"}
          </div>
        </div>
      `;
    }

  } else if (dept === "registrar") {

    title.innerText = "Registrar Counters";
    area.innerHTML = "";

    const counters = ["A1", "A2", "B", "C", "D"];

    counters.forEach(counter => {

      const slot =
        counterSlots.registrar[counter];

      area.innerHTML += `
        <div class="window">
          COUNTER ${counter}
          <div class="line">
            ${slot ? slot.queueNo : "--------"}
          </div>
        </div>
      `;
    });

  } else {

    title.innerText = "Service Area";
    area.innerHTML = `
      <div class="window">
        Select Department
      </div>
    `;
  }
}

// CALL NEXT
function callNext() {

  const dept = getDept();
  if (!dept) return;

  // CASHIER (NORMAL FIFO)
  if (dept === "cashier") {

    const waiting =
      queue.cashier.filter(q => q.status === "Waiting");

    if (!waiting.length) return;

    const empty =
      windowSlots.cashier.findIndex(w => w === null);

    if (empty === -1) return;

    const next = waiting[0];
    next.status = "Serving";

    windowSlots.cashier[empty] = {
      queueNo: next.queueNo
    };
  }

  // REGISTRAR (FIXED COUNTER + NUMBERING)
  if (dept === "registrar") {

    const waiting =
      queue.registrar.filter(q => q.status === "Waiting");

    if (!waiting.length) return;

    const next = waiting[0];

    const counter =
      getCounter(next.service);

    // increment per counter
    counterSeries[counter]++;

    const padded =
      String(counterSeries[counter]).padStart(3, "0");

    next.queueNo = `${counter}-${padded}`;
    next.status = "Serving";

    counterSlots.registrar[counter] = {
      queueNo: next.queueNo
    };
  }

  saveAll();
  refreshAll();
}

// RECALL
function recall() {

  const dept = getDept();
  if (!dept) return;

  let current = null;

  if (dept === "cashier") {
    for (let i = 0; i < 4; i++) {
      if (windowSlots.cashier[i]) {
        current = windowSlots.cashier[i];
        break;
      }
    }
  }

  if (dept === "registrar") {
    Object.values(counterSlots.registrar)
      .forEach(slot => {
        if (slot && !current) current = slot;
      });
  }

  if (current) {
    console.log("Recall:", current.queueNo);
  }
}

// SKIP
function skipQueue() {

  const dept = getDept();
  if (!dept) return;

  if (dept === "cashier") {

    for (let i = 0; i < 4; i++) {

      if (windowSlots.cashier[i]) {

        const skipped = windowSlots.cashier[i];
        windowSlots.cashier[i] = null;

        const q =
          queue.cashier.find(
            item => item.queueNo === skipped.queueNo
          );

        if (q) q.status = "Waiting";
        break;
      }
    }
  }

  if (dept === "registrar") {

    Object.keys(counterSlots.registrar)
      .forEach(counter => {

        const slot = counterSlots.registrar[counter];

        if (slot) {

          const q =
            queue.registrar.find(
              item => item.queueNo === slot.queueNo
            );

          if (q) q.status = "Waiting";

          counterSlots.registrar[counter] = null;
        }
      });
  }

  saveAll();
  refreshAll();
  callNext();
}

// COMPLETE
function completeQueue() {

  const dept = getDept();
  if (!dept) return;

  if (dept === "cashier") {

    for (let i = 0; i < 4; i++) {

      if (windowSlots.cashier[i]) {

        const served = windowSlots.cashier[i];

        const q =
          queue.cashier.find(
            item => item.queueNo === served.queueNo
          );

        if (q) q.status = "Completed";

        windowSlots.cashier[i] = null;
        break;
      }
    }
  }

  if (dept === "registrar") {

    Object.keys(counterSlots.registrar)
      .forEach(counter => {

        const slot = counterSlots.registrar[counter];

        if (slot) {

          const q =
            queue.registrar.find(
              item => item.queueNo === slot.queueNo
            );

          if (q) q.status = "Completed";

          counterSlots.registrar[counter] = null;
        }
      });
  }

  saveAll();
  refreshAll();
  callNext();
}

// RESET
function resetSystem() {

  const dept = getDept();
  if (!dept) return;

  queue[dept] = [];

  if (dept === "cashier") {
    windowSlots.cashier = [null, null, null, null];
  }

  if (dept === "registrar") {
    counterSlots.registrar = {
      A1: null,
      A2: null,
      B: null,
      C: null,
      D: null
    };

    counterSeries = {
      A1: 0,
      A2: 0,
      B: 0,
      C: 0,
      D: 0
    };
  }

  saveAll();
  refreshAll();
}