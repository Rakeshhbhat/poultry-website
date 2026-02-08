/* ================= HELPERS ================= */
const el = id => document.getElementById(id);

/* ================= INIT ================= */
el("billDate").valueAsDate = new Date();
el("billNo").value = "AUTO"; // replace later with bill-number logic

/* ================= WEIGHT TABLE ================= */
const weightBody = el("weightBody");
const addWeightRowBtn = el("addWeightRow");

function addWeightRow() {
  const sl = weightBody.children.length + 1;

  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>${sl}</td>
    <td><input type="number" class="ekg"></td>
    <td><input type="number" class="eg"></td>
    <td><input type="number" class="gkg"></td>
    <td><input type="number" class="gg"></td>
  `;

  weightBody.appendChild(tr);
  tr.querySelectorAll("input").forEach(i => i.oninput = calcWeights);
}

addWeightRowBtn.onclick = addWeightRow;

// start with 5 rows
for (let i = 0; i < 5; i++) addWeightRow();

/* ================= CRATE / BIRD LOGIC ================= */
const crateBody = el("crateBody");
const addCrateRowBtn = el("addCrateRow");

function addCrateRow() {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td><input type="number" class="crate"></td>
    <td><input type="number" class="birds"></td>
    <td class="rowTotal">0</td>
    <td><button class="btn-danger">✕</button></td>
  `;

  crateBody.appendChild(tr);

  const c = tr.querySelector(".crate");
  const b = tr.querySelector(".birds");
  const t = tr.querySelector(".rowTotal");

  function recalc() {
    t.innerText = (Number(c.value || 0) * Number(b.value || 0));
    calcBirds();
  }

  c.oninput = recalc;
  b.oninput = recalc;
  tr.querySelector("button").onclick = () => { tr.remove(); calcBirds(); };
}

addCrateRowBtn.onclick = addCrateRow;
addCrateRow();

/* ================= CALCULATIONS ================= */
function calcWeights() {
  let gross = 0, empty = 0;

  weightBody.querySelectorAll("tr").forEach(tr => {
    const ekg = Number(tr.querySelector(".ekg").value || 0);
    const eg  = Number(tr.querySelector(".eg").value || 0);
    const gkg = Number(tr.querySelector(".gkg").value || 0);
    const gg  = Number(tr.querySelector(".gg").value || 0);

    empty += ekg * 1000 + eg;
    gross += gkg * 1000 + gg;
  });

  el("grossTotal").innerText = (gross / 1000).toFixed(3);
  el("emptyTotal").innerText = (empty / 1000).toFixed(3);
  el("netTotal").innerText   = ((gross - empty) / 1000).toFixed(3);
}

function calcBirds() {
  let total = 0;
  crateBody.querySelectorAll(".rowTotal").forEach(td => {
    total += Number(td.innerText || 0);
  });
  el("totalBirds").innerText = total;
}

/* ================= SAVE / SHARE ================= */
el("saveBill").onclick = () => {
  alert("Bill saved (Firebase integration next)");
};

el("shareBill").onclick = () => {
  alert("PDF share logic will be same as chart PDF");
};
