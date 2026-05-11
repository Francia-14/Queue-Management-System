function login() {
  const user = document.getElementById("username")?.value;
  const pass = document.getElementById("password")?.value;

  if (user && pass) {
    window.location.href = "dashboard.html";
  } else {
    alert("Please enter username and password");
  }
}

/* =========================
   SERVICE DROPDOWN
========================= */
function updateService() {

  const dept = document.getElementById("department");
  const service = document.getElementById("service");

  if (!dept || !service) return;

  service.innerHTML = '<option value="">Select Service</option>';

  if (dept.value === "registrar") {

    ["TOR", "Enrollment", "Good Moral", "Add/Drop", "Inquiry", "Authentication"]
    .forEach(item => {
      let opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      service.appendChild(opt);
    });

  } else if (dept.value === "cashier") {

    ["Tuition Fee", "Misc Payment", "Clearance", "ID Replacement"]
    .forEach(item => {
      let opt = document.createElement("option");
      opt.value = item;
      opt.textContent = item;
      service.appendChild(opt);
    });
  }
}

/* =========================
   COUNTER SERIES (REGISTRAR)
========================= */
let counterSeries =
  JSON.parse(localStorage.getItem("counterSeries")) || {
    A1: 0,
    A2: 0,
    B: 0,
    C: 0,
    D: 0
  };

/* =========================
   COUNTER MAP
========================= */
function getCounter(service) {

  const map = {
    "TOR": "A1",
    "Enrollment": "A1",
    "Inquiry": "A1",
    "Authentication": "A1",

    "Add/Drop": "A2",
    "Good Moral": "A2"
  };

  return map[service] || "A2";
}

/* =========================
   ADD TO QUEUE
========================= */
function addToQueue() {

  const name =
    document.getElementById("name").value.trim();

  const id =
    document.getElementById("studentId").value.trim();

  const dept =
    document.getElementById("department").value;

  const service =
    document.getElementById("service").value;

  if (!name || !id || !dept || !service) {
    alert("Please complete all fields");
    return;
  }

  let queueNo = "";

  /* CASHIER */
  if (dept === "cashier") {

    let cashierCount =
      JSON.parse(localStorage.getItem("cashierCount")) || 0;

    cashierCount++;
    localStorage.setItem("cashierCount", cashierCount);

    queueNo =
      "C-" + String(cashierCount).padStart(3, "0");
  }

  /* REGISTRAR (NEW SYSTEM) */
  if (dept === "registrar") {

    const counter = getCounter(service);

    counterSeries[counter]++;

    localStorage.setItem(
      "counterSeries",
      JSON.stringify(counterSeries)
    );

    const num =
      String(counterSeries[counter]).padStart(3, "0");

    queueNo = `${counter}-${num}`;
  }

  /* SAVE DATA */
  let saved =
    JSON.parse(localStorage.getItem("queueList")) || [];

  saved.push({
    queueNo,
    name,
    dept,
    service,
    status: "Waiting",
    timeCreated: Date.now(),
    timeCompleted: null
  });

  localStorage.setItem("queueList", JSON.stringify(saved));

  renderTable();
  clearForm();
  updateDashboardStats();
  updateAvgTime();
}

/* =========================
   TABLE
========================= */
function renderTable() {

  const table = document.getElementById("queueTable");
  if (!table) return;

  let saved =
    JSON.parse(localStorage.getItem("queueList")) || [];

  let html = `
    <tr>
      <th>Queue No.</th>
      <th>Name</th>
      <th>Department</th>
      <th>Service</th>
      <th>Status</th>
    </tr>
  `;

  if (saved.length === 0) {
    html += `<tr><td colspan="5" class="center-text">No queue entries yet</td></tr>`;
  } else {
    saved.forEach(q => {
      html += `
        <tr>
          <td>${q.queueNo}</td>
          <td>${q.name}</td>
          <td>${q.dept}</td>
          <td>${q.service}</td>
          <td>${q.status}</td>
        </tr>
      `;
    });
  }

  table.innerHTML = html;
}

/* =========================
   CLEAR FORM
========================= */
function clearForm() {
  document.getElementById("name").value = "";
  document.getElementById("studentId").value = "";
  document.getElementById("department").value = "";
  document.getElementById("service").innerHTML =
    "<option value=''>Select Service</option>";
}

/* =========================
   STATS
========================= */
function updateDashboardStats() {

  let data =
    JSON.parse(localStorage.getItem("queueList")) || [];

  let waiting =
    data.filter(q => q.status === "Waiting").length;

  let serving =
    data.filter(q => q.status === "Serving").length;

  let completed =
    data.filter(q => q.status === "Completed").length;

  let boxes =
    document.querySelectorAll(".box");

  if (boxes.length >= 3) {
    boxes[0].innerHTML = waiting + "<br><small>Waiting</small>";
    boxes[1].innerHTML = serving + "<br><small>Serving</small>";
    boxes[2].innerHTML = completed + "<br><small>Completed</small>";
  }
}

/* =========================
   AVERAGE WAIT TIME
========================= */
function updateAvgTime() {

  let data =
    JSON.parse(localStorage.getItem("queueList")) || [];

  let completed =
    data.filter(q => q.status === "Completed" && q.timeCompleted);

  let boxes =
    document.querySelectorAll(".box");

  if (completed.length === 0) {
    if (boxes.length >= 4) {
      boxes[3].innerHTML = "0m<br><small>Avg Wait</small>";
    }
    return;
  }

  let total = 0;

  completed.forEach(q => {
    total += (q.timeCompleted - q.timeCreated);
  });

  let avg = total / completed.length;
  let minutes = Math.round(avg / 60000);

  if (boxes.length >= 4) {
    boxes[3].innerHTML = minutes + "m<br><small>Avg Wait</small>";
  }
}

/* =========================
   INIT
========================= */
window.onload = function () {
  renderTable();
  updateDashboardStats();
  updateAvgTime();
};

setInterval(() => {
  updateDashboardStats();
  updateAvgTime();
}, 2000);