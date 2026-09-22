(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  var tensioSelect = $("#tensio");
  var typeSelect = $("#spokeType");
  var countSelect = $("#spokeCount");
  var targetL = $("#targetL");
  var targetR = $("#targetR");
  var leftBox = $("#leftSpokesInputs");
  var rightBox = $("#rightSpokesInputs");

  var labels = [];
  var chart = null;
  var currentLeft = [];
  var currentRight = [];
  var state = { left: [], right: [] };
  var stepValue = 0.5;
  var minReading = 0;
  var maxReading = 32;

  var LS_CONFIG = "spokeTension.v1.config";
  var LS_DATA = "spokeTension.v1.data";

  Object.keys(TENSIO).forEach(function (name) {
    var opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    tensioSelect.appendChild(opt);
  });

  function tensioKeys() {
    return Object.keys(TENSIO[tensioSelect.value]);
  }

  function selectedTable() {
    return TENSIO[tensioSelect.value][typeSelect.value];
  }

  function refreshTypeOptions() {
    var prev = typeSelect.value;
    typeSelect.innerHTML = "";
    tensioKeys().forEach(function (key) {
      var opt = document.createElement("option");
      opt.value = key;
      opt.textContent = key + " мм";
      typeSelect.appendChild(opt);
    });
    if (tensioKeys().indexOf(prev) !== -1) typeSelect.value = prev;
  }

  function refreshRange() {
    var readings = selectedTable().map(function (p) { return p[0]; });
    minReading = Math.min.apply(null, readings);
    maxReading = Math.max.apply(null, readings);
    stepValue = maxReading >= 20 ? 0.5 : 0.1;
    var isPark = tensioSelect.value.indexOf("ParkTool") !== -1;
    $("#unitHintText").textContent = isPark ? "поділки шкали (крок 0.5)" : "мм прогину (крок 0.1)";
  }

  function convertToKgf(reading) {
    if (!isFinite(reading) || reading <= 0) return 0;
    var table = selectedTable();
    if (reading <= table[0][0]) return table[0][1];
    if (reading >= table[table.length - 1][0]) return table[table.length - 1][1];
    for (var i = 0; i < table.length - 1; i++) {
      var r1 = table[i][0], k1 = table[i][1];
      var r2 = table[i + 1][0], k2 = table[i + 1][1];
      if (reading >= r1 && reading <= r2) {
        return k1 + ((reading - r1) * (k2 - k1)) / (r2 - r1);
      }
    }
    return 0;
  }

  function createRow(container, label, side) {
    var div = document.createElement("div");
    div.className = "spoke-row spoke-row-" + side;
    var span = document.createElement("span");
    span.className = "spoke-label";
    span.textContent = label;
    var wrap = document.createElement("div");
    wrap.className = "spoke-input-wrap";
    var input = document.createElement("input");
    input.type = "number";
    input.className = "spoke-input";
    input.step = stepValue;
    input.min = 0;
    input.max = maxReading;
    input.value = "0";
    input.dataset.label = label;
    wrap.appendChild(input);
    div.appendChild(span);
    div.appendChild(wrap);
    container.appendChild(div);
    return input;
  }

  function perSide() {
    return parseInt(countSelect.value, 10) / 2;
  }

  function captureInputs() {
    if (currentLeft.length) state.left = currentLeft.map(function (i) { return i.value; });
    if (currentRight.length) state.right = currentRight.map(function (i) { return i.value; });
  }

  function resizeState() {
    var n = perSide();
    while (state.left.length < n) state.left.push("0");
    while (state.right.length < n) state.right.push("0");
    state.left = state.left.slice(0, n);
    state.right = state.right.slice(0, n);
  }

  function rebuildInputs() {
    captureInputs();
    resizeState();
    var n = perSide();
    leftBox.innerHTML = "";
    rightBox.innerHTML = "";
    currentLeft = [];
    currentRight = [];
    for (var i = 0; i < n; i++) {
      var il = createRow(leftBox, "L" + (i + 1), "cyan");
      il.value = state.left[i];
      currentLeft.push(il);
      var ir = createRow(rightBox, "R" + (i + 1), "emerald");
      ir.value = state.right[i];
      currentRight.push(ir);
    }
    initChart(n);
  }

  function kgf(arr) {
    return arr.map(function (v) { return Number(v) || 0; }).map(convertToKgf);
  }

  function readAll() {
    captureInputs();
    return { left: kgf(state.left), right: kgf(state.right) };
  }

  function targetDs(value, color, label) {
    return {
      label: label,
      data: labels.map(function () { return value; }),
      borderColor: color,
      borderDash: [6, 4],
      borderWidth: 1.5,
      pointRadius: 0,
      backgroundColor: "rgba(0,0,0,0)",
      fill: false
    };
  }

  function initChart(n) {
    labels = [];
    for (var i = 1; i <= n; i++) labels.push("Спиця " + i);
    var ctx = $("#tensionChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          targetDs(Number(targetL.value) || 0, "rgba(34,211,238,0.55)", "Ціль: ліва"),
          { label: "Ліва (кгс)", data: labels.map(function () { return 0; }), borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.10)", borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: "#22d3ee" },
          targetDs(Number(targetR.value) || 0, "rgba(52,211,153,0.55)", "Ціль: права"),
          { label: "Права (кгс)", data: labels.map(function () { return 0; }), borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.10)", borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: "#34d399" }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            suggestedMin: 0,
            suggestedMax: 180,
            grid: { color: "rgba(255,255,255,0.08)" },
            angleLines: { color: "rgba(255,255,255,0.08)" },
            pointLabels: { color: "#94a3b8", font: { size: 10 } },
            ticks: { color: "#64748b", stepSize: 30, backdropColor: "transparent" }
          }
        },
        plugins: {
          legend: { labels: { color: "#e2e8f0", font: { size: 11 } } }
        }
      }
    });
  }

  function updateData() {
    if (!chart) return;
    var d = readAll();
    var tL = Number(targetL.value) || 0;
    var tR = Number(targetR.value) || 0;

    chart.data.datasets[0].data = labels.map(function () { return tL; });
    chart.data.datasets[1].data = d.left;
    chart.data.datasets[2].data = labels.map(function () { return tR; });
    chart.data.datasets[3].data = d.right;

    var peak = Math.max(
      d.left.length ? Math.max.apply(null, d.left) : 0,
      d.right.length ? Math.max.apply(null, d.right) : 0,
      tL, tR
    );
    chart.options.scales.r.suggestedMax = Math.max(20, Math.ceil((peak * 1.15) / 30) * 30);
    chart.update();

    renderSide("leftAvg", "leftStatus", d.left, tL);
    renderSide("rightAvg", "rightStatus", d.right, tR);
    save();
  }

  function renderSide(avgId, statusId, kgf, target) {
    var avgEl = document.getElementById(avgId);
    var stEl = document.getElementById(statusId);
    var valid = kgf.filter(function (v) { return v > 0; });

    if (!valid.length) {
      avgEl.innerHTML = '0 <span class="unit">кгс сер.</span>';
      stEl.textContent = "Немає даних";
      stEl.className = "stat-line neutral";
      return;
    }

    var sum = 0;
    valid.forEach(function (v) { sum += v; });
    var avg = sum / valid.length;

    var maxDev = 0, maxOff = 0;
    valid.forEach(function (v) {
      maxDev = Math.max(maxDev, Math.abs((v - avg) / avg) * 100);
      if (target > 0) maxOff = Math.max(maxOff, Math.abs((v - target) / target) * 100);
    });

    avgEl.innerHTML = avg.toFixed(1) + ' <span class="unit">кгс сер.</span>';

    var offAvg = target > 0 ? ((avg - target) / target) * 100 : NaN;
    var txt = "Розкид ±" + Math.round(maxDev) + "%";
    if (target > 0) txt += " · до цілі " + (offAvg >= 0 ? "+" : "") + Math.round(offAvg) + "%";
    stEl.textContent = txt;

    var pct = target > 0 ? maxOff : maxDev;
    if (pct > 20) stEl.className = "stat-line bad";
    else if (pct > 10) stEl.className = "stat-line warn";
    else stEl.className = "stat-line good " + (avgId === "leftAvg" ? "cyan" : "emerald");
  }

  function save() {
    try {
      localStorage.setItem(LS_CONFIG, JSON.stringify({
        tensio: tensioSelect.value,
        type: typeSelect.value,
        count: countSelect.value,
        targetL: targetL.value,
        targetR: targetR.value
      }));
      localStorage.setItem(LS_DATA, JSON.stringify({
        tensio: tensioSelect.value,
        type: typeSelect.value,
        count: countSelect.value,
        left: state.left,
        right: state.right
      }));
    } catch (e) { /* quota/private mode: ignore */ }
  }

  function load() {
    var cfg = null;
    try { cfg = JSON.parse(localStorage.getItem(LS_CONFIG)); } catch (e) { }

    if (cfg && TENSIO[cfg.tensio]) tensioSelect.value = cfg.tensio;
    refreshTypeOptions();
    if (cfg && tensioKeys().indexOf(cfg.type) !== -1) typeSelect.value = cfg.type;
    if (cfg && cfg.count) countSelect.value = cfg.count;
    if (cfg && cfg.targetL) targetL.value = cfg.targetL;
    if (cfg && cfg.targetR) targetR.value = cfg.targetR;

    var d = null;
    try { d = JSON.parse(localStorage.getItem(LS_DATA)); } catch (e) { }
    if (d && d.tensio === tensioSelect.value && d.type === typeSelect.value &&
        d.count === countSelect.value && Array.isArray(d.left) && Array.isArray(d.right)) {
      state.left = d.left.slice();
      state.right = d.right.slice();
    } else {
      state.left = [];
      state.right = [];
    }

    refreshRange();
    rebuildInputs();
    updateData();
  }

  function exportState() {
    var payload = {
      app: "spoke-tension",
      version: 1,
      tensio: tensioSelect.value,
      type: typeSelect.value,
      count: countSelect.value,
      targetL: targetL.value,
      targetR: targetR.value,
      left: state.left,
      right: state.right
    };
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "spoke-tension-" + tensioSelect.value.replace(/\s+/g, "-").toLowerCase() + ".json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function applyState(payload) {
    if (!payload || !TENSIO[payload.tensio]) return;
    tensioSelect.value = payload.tensio;
    refreshTypeOptions();
    if (tensioKeys().indexOf(payload.type) !== -1) typeSelect.value = payload.type;
    if (payload.count) countSelect.value = payload.count;
    if (payload.targetL) targetL.value = payload.targetL;
    if (payload.targetR) targetR.value = payload.targetR;
    state.left = Array.isArray(payload.left) ? payload.left.slice() : [];
    state.right = Array.isArray(payload.right) ? payload.right.slice() : [];
    refreshRange();
    rebuildInputs();
    updateData();
  }

  function importState(file) {
    var reader = new FileReader();
    reader.onload = function () {
      try {
        applyState(JSON.parse(reader.result));
      } catch (e) {
        alert("Не вдалося розпізнати файл імпорту");
      }
    };
    reader.readAsText(file);
  }

  function resetAll() {
    state.left = state.left.map(function () { return "0"; });
    state.right = state.right.map(function () { return "0"; });
    currentLeft.forEach(function (i) { i.value = "0"; });
    currentRight.forEach(function (i) { i.value = "0"; });
    updateData();
  }

  function bind() {
    tensioSelect.addEventListener("change", function () {
      refreshTypeOptions();
      refreshRange();
      rebuildInputs();
      updateData();
    });
    typeSelect.addEventListener("change", function () {
      refreshRange();
      updateData();
    });
    countSelect.addEventListener("change", function () {
      rebuildInputs();
      updateData();
    });
    targetL.addEventListener("input", updateData);
    targetR.addEventListener("input", updateData);
    leftBox.addEventListener("input", updateData);
    rightBox.addEventListener("input", updateData);
    $("#btnReset").addEventListener("click", resetAll);
    $("#btnExport").addEventListener("click", exportState);
    $("#btnImport").addEventListener("click", function () { $("#importFile").click(); });
    $("#importFile").addEventListener("change", function (e) {
      if (e.target.files && e.target.files[0]) importState(e.target.files[0]);
      e.target.value = "";
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    bind();
    load();
  });

  window.TensionApp = {
    setReading: function (side, idx, value) {
      var inputs = side === "right" ? currentRight : currentLeft;
      if (inputs[idx] && String(inputs[idx].value) !== String(value)) {
        inputs[idx].value = value;
        updateData();
      }
    },
    getState: function () {
      var d = readAll();
      return {
        leftKgf: d.left,
        rightKgf: d.right,
        rawLeft: state.left,
        rawRight: state.right
      };
    }
  };
})();