(function () {
  "use strict";

  var $ = function (sel) { return document.querySelector(sel); };

  var tensioSelect = $("#tensio");
  var typeSelect = $("#spokeType");
  var countSelect = $("#spokeCount");
  var varSelect = $("#varLimit");
  var targetL = $("#targetL");
  var targetR = $("#targetR");
  var leftBox = $("#leftSpokesInputs");
  var rightBox = $("#rightSpokesInputs");
  var btnLang = $("#btnLang");

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
  var LS_LANG = "spokeTension.v1.lang";

  var currentLang = "uk";

  var STR = {
    uk: {
      docTitle: "SpokeTension — налаштування колеса з тензометром",
      cfgTitle: "Конфігурація колеса",
      cfgHint: "Виберіть тензометр, таблицю спиці та кількість спиць.",
      tensioLabel: "Тензометр",
      spokeTypeLabel: "Тип спиці (таблиця калібрування)",
      countLabel: "Кількість спиць (усього)",
      count24: "24 (12 ліва / 12 права)",
      count28: "28 (14 ліва / 14 права)",
      count32: "32 (16 ліва / 16 права)",
      count36: "36 (18 ліва / 18 права)",
      varLabel: "Допуск розкиду",
      targetLLabel: "Цільовий натяг, ліва (кгс)",
      targetRLabel: "Цільовий натяг, права (кгс)",
      readingsTitle: "Покази тензометра",
      unitIntro: "Одиниці показів:",
      unitBody: "Вводьте показ для кожної спиці обох сторін колеса.",
      unitDial: "поділки шкали (крок 0.5)",
      unitMm: "мм прогину (крок 0.1)",
      readingsChangeHint: "Зміна тензометра чи таблиці спиці очищає введені покази — вони дійсні лише для вибраної шкали.",
      guideTitle: "Інструкція: що робити і що вводити",
      guideIntro: "Крок за кроком — як користуватися калькулятором.",
      guideStep1: "Виберіть тензометр. ParkTool TM-1: показ — у поділках шкали (крок 0.5). ZTTO TC-02: показ — у міліметрах прогину (крок 0.1).",
      guideStep2: "Виберіть таблицю спиці, що відповідає вашим спицям (товщина/профіль, напр. 2.0 мм). Вона визначає перерахунок «показ → кгс».",
      guideStep3: "Вкажіть загальну кількість спиць колеса: 24 / 28 / 32 / 36.",
      guideStep4: "Задайте допуск розкиду (5–20%) — це межі «в нормі» відносно середнього по стороні; позначається крапкою біля кожної спиці.",
      guideStep5: "Впишіть цільовий натяг для лівої та правої сторони (кгс) — зі специфікації обода (типово 100–120 кгс для алюмінієвих) або свій орієнтир. На радарі цілі — пунктиром.",
      guideStep6: "Міряйте тензометром кожну спицю та вводьте показ — радар і статистика оновлюються миттєво. Крапка: зелена — в межах допуску, жовта — близько до межі, червона — поза.",
      guideStep7: "Слідкуйте за картками статистики: середній натяг, стандартне відхилення (σ), нижня/верхня межа з відповідними показами тензометра, розкид ±% і відхилення від цілі.",
      guideStep8: "Після балансування заповніть блок «Збірка» (ім'я, обід, втулок, нотатки) і натисніть «Друк аркуша» для документації. Дані зберігаються автоматично; для перенесення користуйтесь експортом/імпортом JSON.",
      guideTip1: "Покази дійсні лише для вибраної шкали — зміна тензометра або таблиці очищає введені значення.",
      guideTip2: "На задньому колесі з касетою праві спиці (фланець ближче до центру) натягуються вище за ліві — це нормальна асиметрія «дишу».",
      guideDisclaimer: "Результати — орієнтир для збалансування; остаточний натяг визначається під час центрування колеса.",
      colLeft: "Ліва сторона",
      colRight: "Права сторона",
      btnReset: "Скинути",
      btnExport: "Експорт JSON",
      btnImport: "Імпорт JSON",
      chartTitle: "Радарний графік натягу (кгс)",
      chartHint: "Пунктирні полігони — цільовий натяг кожної сторони.",
      statusLeft: "Статус: ліва сторона",
      statusRight: "Статус: права сторона",
      noData: "Немає даних",
      unitAvg: "кгс сер.",
      spreadTpl: "Розкид {n}%",
      vsTargetTpl: " · до цілі {s}{n}%",
      flagOk: "У межах допуску",
      flagWarn: "Близько до межі допуску",
      flagFail: "Поза межами допуску",
      spokeTpl: "Спиця {n}",
      chartTargetL: "Ціль: ліва",
      chartLeft: "Ліва (кгс)",
      chartTargetR: "Ціль: права",
      chartRight: "Права (кгс)",
      stdLine: "σ {n} кгс",
      limLine: "±{v}%: {lo}–{hi} кгс",
      readLine: "покази {rlo}–{rhi}",
      note: "Покази автоматично зберігаються у браузері (localStorage). Таблиці калібрування — від виробників, інтерполяція лінійна, значення за межами шкали клампуються. Крапка біля спиці: зелена — у межах допуску, жовта — близько до межі, червона — поза межами (відносно середнього по стороні). Джерела даних — у README цього репозиторію.",
      metaTitle: "Збірка",
      metaName: "Ім'я збірки",
      metaType: "Тип",
      metaFront: "Переднє",
      metaRear: "Заднє",
      metaRim: "Обід",
      metaHub: "Втулок",
      metaNotes: "Нотатки",
      btnPrint: "Друк аркуша",
      prTitle: "Вимірювання натягу спиць",
      prDate: "Дата",
      prVar: "Допуск",
      prAvg: "Середнє",
      prStd: "σ",
      prLower: "Нижня межа",
      prUpper: "Верхня межа",
      prReading: "показ",
      prColNo: "№",
      prColReading: "Показ",
      prColKgf: "Натяг (кгс)",
      prColOk: "±{v}%?",
      prYes: "ТАК",
      prNo: "НІ",
      prNotes: "Нотатки",
      prWheelset: "Збірка",
      prType: "Тип",
      prRim: "Обід",
      prHub: "Втулок",
      prSpokes: "Спиць",
      importErr: "Не вдалося розпізнати файл імпорту"
    },
    en: {
      docTitle: "SpokeTension — wheel tensioning with a tensiometer",
      cfgTitle: "Wheel configuration",
      cfgHint: "Choose tensiometer, spoke table and spoke count.",
      tensioLabel: "Tensiometer",
      spokeTypeLabel: "Spoke type (calibration table)",
      countLabel: "Spoke count (total)",
      count24: "24 (12 left / 12 right)",
      count28: "28 (14 left / 14 right)",
      count32: "32 (16 left / 16 right)",
      count36: "36 (18 left / 18 right)",
      varLabel: "Variance limit",
      targetLLabel: "Target tension, left (kgf)",
      targetRLabel: "Target tension, right (kgf)",
      readingsTitle: "Tensiometer readings",
      unitIntro: "Reading units:",
      unitBody: "Enter a reading for every spoke on both sides of the wheel.",
      unitDial: "dial graduations (step 0.5)",
      unitMm: "mm deflection (step 0.1)",
      readingsChangeHint: "Changing the tensiometer or spoke table clears the entered readings — they are only valid for the selected scale.",
      guideTitle: "Instructions: what to do and what to enter",
      guideIntro: "Step by step — how to use the calculator.",
      guideStep1: "Choose your tensiometer. Park Tool TM-1: the reading is in dial graduations (step 0.5). ZTTO TC-02: the reading is in millimetres of deflection (step 0.1).",
      guideStep2: "Choose the spoke table that matches your spokes (gauge/profile, e.g. 2.0 mm). It defines the reading → kgf conversion.",
      guideStep3: "Set the total number of spokes in the wheel: 24 / 28 / 32 / 36.",
      guideStep4: "Set the variance tolerance (5–20%) — the 'in-spec' band relative to the side average; shown as a dot next to every spoke.",
      guideStep5: "Enter the target tension for the left and right sides (kgf) — from your rim spec (typically 100–120 kgf for aluminium rims) or your own goal. Targets are dashed polygons on the radar.",
      guideStep6: "Measure every spoke with the tensiometer and enter the reading — radar and statistics update instantly. Dot: green — within tolerance, amber — near the limit, red — out of tolerance.",
      guideStep7: "Watch the stat cards: average tension, standard deviation (σ), lower/upper limits with matching tensiometer readings, spread ±% and deviation from the target.",
      guideStep8: "When balanced, fill in the Wheelset block (name, rim, hub, notes) and press 'Print sheet' for the documentation. Data is saved automatically; use Export/Import JSON to move it.",
      guideTip1: "Readings are only valid for the selected scale — changing the tensiometer or table clears them.",
      guideTip2: "On a rear wheel with a cassette the right-side spokes (flange closer to the centre) run higher than the left side — that dish asymmetry is expected.",
      guideDisclaimer: "Results are a balancing guideline; the final tension is set while the wheel is trued and centred.",
      colLeft: "Left side",
      colRight: "Right side",
      btnReset: "Reset",
      btnExport: "Export JSON",
      btnImport: "Import JSON",
      chartTitle: "Tension radar chart (kgf)",
      chartHint: "Dashed polygons — target tension of each side.",
      statusLeft: "Status: left side",
      statusRight: "Status: right side",
      noData: "No data",
      unitAvg: "kgf avg",
      spreadTpl: "Spread {n}%",
      vsTargetTpl: " · vs target {s}{n}%",
      flagOk: "Within tolerance",
      flagWarn: "Near tolerance limit",
      flagFail: "Out of tolerance",
      spokeTpl: "Spoke {n}",
      chartTargetL: "Target: left",
      chartLeft: "Left (kgf)",
      chartTargetR: "Target: right",
      chartRight: "Right (kgf)",
      stdLine: "σ {n} kgf",
      limLine: "±{v}%: {lo}–{hi} kgf",
      readLine: "readings {rlo}–{rhi}",
      note: "Readings are saved automatically in your browser (localStorage). Calibration tables come from manufacturers; interpolation is linear, values beyond the scale are clamped. The dot next to a spoke: green — within tolerance, amber — near the limit, red — out of tolerance (relative to the side average). Data sources in the README of this repository.",
      metaTitle: "Wheelset",
      metaName: "Wheelset name",
      metaType: "Type",
      metaFront: "Front",
      metaRear: "Rear",
      metaRim: "Rim",
      metaHub: "Hub",
      metaNotes: "Notes",
      btnPrint: "Print sheet",
      prTitle: "Spoke tension measurement",
      prDate: "Date",
      prVar: "Tolerance",
      prAvg: "Average",
      prStd: "σ",
      prLower: "Lower limit",
      prUpper: "Upper limit",
      prReading: "reading",
      prColNo: "#",
      prColReading: "Reading",
      prColKgf: "Tension (kgf)",
      prColOk: "±{v}%?",
      prYes: "YES",
      prNo: "NO",
      prNotes: "Notes",
      prWheelset: "Wheelset",
      prType: "Type",
      prRim: "Rim",
      prHub: "Hub",
      prSpokes: "Spokes",
      importErr: "Could not parse the import file"
    }
  };

  function t(key) {
    var d = STR[currentLang] || STR.uk;
    if (key in d) return d[key];
    if (key in STR.uk) return STR.uk[key];
    return key;
  }

  function tpl(key, map) {
    var s = t(key);
    for (var k in map) s = s.split("{" + k + "}").join(String(map[k]));
    return s;
  }

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

  function detectLang() {
    try {
      var saved = localStorage.getItem(LS_LANG);
      if (saved === "en" || saved === "uk") return saved;
    } catch (e) { /* private mode */ }
    return (navigator.language || "").toLowerCase().indexOf("en") === 0 ? "en" : "uk";
  }

  function applyLang() {
    document.documentElement.lang = currentLang === "en" ? "en" : "uk";
    btnLang.textContent = currentLang === "en" ? "UK" : "EN";

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }
    document.title = t("docTitle");

    refreshRange();
    for (var j = 1; j <= labels.length; j++) {
      labels[j - 1] = tpl("spokeTpl", { n: String(j) });
    }
    if (chart) {
      chart.data.labels = labels.slice();
      chart.data.datasets[0].label = t("chartTargetL");
      chart.data.datasets[1].label = t("chartLeft");
      chart.data.datasets[2].label = t("chartTargetR");
      chart.data.datasets[3].label = t("chartRight");
      chart.update();
      updateData();
    } else {
      renderStatus();
    }
    renderPrintSheet();
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
    var table = selectedTable();
    if (!table) return;
    var readings = table.map(function (p) { return p[0]; });
    minReading = Math.min.apply(null, readings);
    maxReading = Math.max.apply(null, readings);
    stepValue = maxReading >= 20 ? 0.5 : 0.1;
    var isPark = tensioSelect.value.indexOf("ParkTool") !== -1;
    $("#unitHintText").textContent = isPark ? t("unitDial") : t("unitMm");
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

  function readingForKgf(kgf) {
    if (!isFinite(kgf) || kgf <= 0) return null;
    var table = selectedTable();
    if (kgf <= table[0][1]) return table[0][0];
    if (kgf >= table[table.length - 1][1]) return table[table.length - 1][0];
    for (var i = 0; i < table.length - 1; i++) {
      var k1 = table[i][1], r1 = table[i][0];
      var k2 = table[i + 1][1], r2 = table[i + 1][0];
      if (kgf >= k1 && kgf <= k2) {
        return r1 + ((kgf - k1) * (r2 - r1)) / (k2 - k1);
      }
    }
    return null;
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
    var flag = document.createElement("span");
    flag.className = "status-dot";
    flag.style.display = "none";
    input._flag = flag;
    wrap.appendChild(input);
    wrap.appendChild(flag);
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

  function rebuildInputs(zero) {
    if (zero) {
      state.left = state.left.map(function () { return "0"; });
      state.right = state.right.map(function () { return "0"; });
      currentLeft.forEach(function (i) { i.value = "0"; });
      currentRight.forEach(function (i) { i.value = "0"; });
    }
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
    for (var i = 1; i <= n; i++) labels.push(tpl("spokeTpl", { n: String(i) }));
    var ctx = $("#tensionChart").getContext("2d");
    if (chart) chart.destroy();
    chart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: labels,
        datasets: [
          targetDs(Number(targetL.value) || 0, "rgba(34,211,238,0.55)", t("chartTargetL")),
          { label: t("chartLeft"), data: labels.map(function () { return 0; }), borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.10)", borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: "#22d3ee" },
          targetDs(Number(targetR.value) || 0, "rgba(52,211,153,0.55)", t("chartTargetR")),
          { label: t("chartRight"), data: labels.map(function () { return 0; }), borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.10)", borderWidth: 2, pointRadius: 2.5, pointBackgroundColor: "#34d399" }
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

  function stdDev(arr) {
    if (!Array.isArray(arr) || arr.length < 2) return 0;
    var sum = 0;
    arr.forEach(function (v) { sum += v; });
    var m = sum / arr.length;
    var s = 0;
    arr.forEach(function (v) { s += (v - m) * (v - m); });
    return Math.sqrt(s / (arr.length - 1));
  }

  function setFlags(inputs, kgfArr, varl) {
    var valid = kgfArr.filter(function (v) { return v > 0; });
    var sum = 0;
    valid.forEach(function (v) { sum += v; });
    var avg = valid.length ? sum / valid.length : 0;
    var enough = valid.length >= 2 && avg > 0;

    for (var i = 0; i < inputs.length; i++) {
      var f = inputs[i]._flag;
      if (!f) continue;
      var v = kgfArr[i] || 0;
      if (!enough || v <= 0) {
        f.className = "status-dot";
        f.style.display = "none";
        continue;
      }
      var dev = Math.abs((v - avg) / avg);
      f.style.display = "";
      if (dev <= varl) { f.className = "status-dot ok"; f.title = t("flagOk"); }
      else if (dev <= varl * 2) { f.className = "status-dot warn"; f.title = t("flagWarn"); }
      else { f.className = "status-dot fail"; f.title = t("flagFail"); }
    }
  }

  function renderSide(avgId, statusId, detailId, kgf, target, varl) {
    var avgEl = document.getElementById(avgId);
    var stEl = document.getElementById(statusId);
    var dtEl = document.getElementById(detailId);
    var valid = kgf.filter(function (v) { return v > 0; });

    if (!valid.length) {
      avgEl.innerHTML = '0 <span class="unit">' + t("unitAvg") + '</span>';
      stEl.textContent = t("noData");
      stEl.className = "stat-line neutral";
      dtEl.innerHTML = "";
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

    avgEl.innerHTML = avg.toFixed(1) + ' <span class="unit">' + t("unitAvg") + '</span>';

    var offAvg = target > 0 ? ((avg - target) / target) * 100 : NaN;
    var txt = tpl("spreadTpl", { n: String(Math.round(maxDev)) });
    if (target > 0) txt += tpl("vsTargetTpl", { s: offAvg >= 0 ? "+" : "", n: String(Math.round(offAvg)) });
    stEl.textContent = txt;

    var sd = stdDev(valid);
    var lo = avg * (1 - varl), hi = avg * (1 + varl);
    var rlo = readingForKgf(lo), rhi = readingForKgf(hi);
    var parts = [
      tpl("stdLine", { n: sd.toFixed(1) }),
      tpl("limLine", { v: String(Math.round(varl * 100)), lo: lo.toFixed(0), hi: hi.toFixed(0) })
    ];
    if (rlo !== null && rhi !== null) {
      parts.push(tpl("readLine", { rlo: rlo.toFixed(1), rhi: rhi.toFixed(1) }));
    }
    dtEl.innerHTML = parts.join(" · ");

    var pct = target > 0 ? maxOff : maxDev;
    if (pct > varl * 100 * 2) stEl.className = "stat-line bad";
    else if (pct > varl * 100) stEl.className = "stat-line warn";
    else stEl.className = "stat-line good " + (avgId === "leftAvg" ? "cyan" : "emerald");
  }

  function renderStatus() {
    var d = readAll();
    var varl = (Number(varSelect.value) || 20) / 100;
    var tL = Number(targetL.value) || 0;
    var tR = Number(targetR.value) || 0;
    setFlags(currentLeft, d.left, varl);
    setFlags(currentRight, d.right, varl);
    renderSide("leftAvg", "leftStatus", "leftDetail", d.left, tL, varl);
    renderSide("rightAvg", "rightStatus", "rightDetail", d.right, tR, varl);
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function readingFmt(v) {
    return v === null ? "—" : v.toFixed(1);
  }

  function sideRows(readingArr, kgfArr, varl) {
    var valid = kgfArr.filter(function (v) { return v > 0; });
    var sum = 0;
    valid.forEach(function (v) { sum += v; });
    var avg = valid.length ? sum / valid.length : 0;
    var enough = valid.length >= 2 && avg > 0;
    var tr = "";
    for (var i = 0; i < kgfArr.length; i++) {
      var v = kgfArr[i] || 0;
      var ok = "";
      if (enough && v > 0) ok = Math.abs((v - avg) / avg) <= varl ? t("prYes") : t("prNo");
      tr += "<tr><td>" + (i + 1) + "</td><td>" + escapeHtml(String(readingArr[i])) + "</td><td>"
        + (v > 0 ? v.toFixed(1) : "—") + "</td><td>" + ok + "</td></tr>";
    }
    return tr;
  }

  function summaryRow(title, kgfArr, varl) {
    var valid = kgfArr.filter(function (v) { return v > 0; });
    if (!valid.length) {
      return "<tr><th>" + title + "</th><td>—</td><td>—</td><td>—</td><td>—</td></tr>";
    }
    var sum = 0;
    valid.forEach(function (v) { sum += v; });
    var avg = sum / valid.length;
    var sd = stdDev(valid);
    var lo = avg * (1 - varl), hi = avg * (1 + varl);
    return "<tr><th>" + title + "</th><td>" + avg.toFixed(1) + "</td><td>" + sd.toFixed(1) + "</td><td>"
      + lo.toFixed(0) + " (" + readingFmt(readingForKgf(lo)) + ")</td><td>"
      + hi.toFixed(0) + " (" + readingFmt(readingForKgf(hi)) + ")</td></tr>";
  }

  function renderPrintSheet() {
    var sheet = $("#printSheet");
    if (!sheet) return;
    var d = readAll();
    var varl = (Number(varSelect.value) || 20) / 100;
    var name = $("#metaName").value;
    var type = $("#metaType").value;
    var rim = $("#metaRim").value;
    var hub = $("#metaHub").value;
    var notes = $("#metaNotes").value;

    var bits = [];
    if (name) bits.push(t("prWheelset") + ": " + escapeHtml(name));
    bits.push(t("prType") + ": " + (type === "rear" ? t("metaRear") : t("metaFront")));
    if (rim) bits.push(t("prRim") + ": " + escapeHtml(rim));
    if (hub) bits.push(t("prHub") + ": " + escapeHtml(hub));
    bits.push(t("prSpokes") + ": " + countSelect.value);
    bits.push(t("prVar") + ": ±" + Math.round(varl * 100) + "%");

    var html = "";
    html += '<div class="ps-head"><strong>' + t("prTitle") + '</strong><span>' + t("prDate") + ": " + new Date().toLocaleDateString() + '</span></div>';
    html += '<p class="ps-meta">' + bits.join(" · ") + "</p>";

    html += '<table class="ps-summary"><tr><th></th><th>' + t("prAvg") + '</th><th>' + t("prStd") + '</th><th>'
      + t("prLower") + ' (' + t("prReading") + ')</th><th>' + t("prUpper") + ' (' + t("prReading") + ')</th></tr>'
      + summaryRow(t("colLeft"), d.left, varl)
      + summaryRow(t("colRight"), d.right, varl)
      + "</table>";

    html += '<div class="ps-tables">';
    html += '<div class="ps-table"><h4>' + t("colLeft") + '</h4><table><tr><th>' + t("prColNo") + '</th><th>'
      + t("prColReading") + '</th><th>' + t("prColKgf") + '</th><th>' + tpl("prColOk", { v: String(Math.round(varl * 100)) }) + '</th></tr>'
      + sideRows(state.left, d.left, varl) + "</table></div>";
    html += '<div class="ps-table"><h4>' + t("colRight") + '</h4><table><tr><th>' + t("prColNo") + '</th><th>'
      + t("prColReading") + '</th><th>' + t("prColKgf") + '</th><th>' + tpl("prColOk", { v: String(Math.round(varl * 100)) }) + '</th></tr>'
      + sideRows(state.right, d.right, varl) + "</table></div>";
    html += "</div>";

    if (notes) html += '<p class="ps-notes"><strong>' + t("prNotes") + ":</strong> " + escapeHtml(notes) + "</p>";

    sheet.innerHTML = html;
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

    renderStatus();
    renderPrintSheet();
    save();
  }

  function save() {
    try {
      localStorage.setItem(LS_CONFIG, JSON.stringify({
        tensio: tensioSelect.value,
        type: typeSelect.value,
        count: countSelect.value,
        varLimit: varSelect.value,
        targetL: targetL.value,
        targetR: targetR.value,
        metaName: $("#metaName").value,
        metaType: $("#metaType").value,
        metaRim: $("#metaRim").value,
        metaHub: $("#metaHub").value,
        metaNotes: $("#metaNotes").value
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
    if (cfg && cfg.varLimit) varSelect.value = cfg.varLimit;
    if (cfg && cfg.targetL) targetL.value = cfg.targetL;
    if (cfg && cfg.targetR) targetR.value = cfg.targetR;
    if (cfg && cfg.metaName) $("#metaName").value = cfg.metaName;
    if (cfg && cfg.metaType) $("#metaType").value = cfg.metaType;
    if (cfg && cfg.metaRim) $("#metaRim").value = cfg.metaRim;
    if (cfg && cfg.metaHub) $("#metaHub").value = cfg.metaHub;
    if (cfg && cfg.metaNotes) $("#metaNotes").value = cfg.metaNotes;

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
      varLimit: varSelect.value,
      targetL: targetL.value,
      targetR: targetR.value,
      metaName: $("#metaName").value,
      metaType: $("#metaType").value,
      metaRim: $("#metaRim").value,
      metaHub: $("#metaHub").value,
      metaNotes: $("#metaNotes").value,
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
    if (payload.varLimit) varSelect.value = payload.varLimit;
    if (payload.targetL) targetL.value = payload.targetL;
    if (payload.targetR) targetR.value = payload.targetR;
    if (payload.metaName) $("#metaName").value = payload.metaName;
    if (payload.metaType) $("#metaType").value = payload.metaType;
    if (payload.metaRim) $("#metaRim").value = payload.metaRim;
    if (payload.metaHub) $("#metaHub").value = payload.metaHub;
    if (payload.metaNotes) $("#metaNotes").value = payload.metaNotes;
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
        alert(t("importErr"));
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
      rebuildInputs(true);
      updateData();
    });
    typeSelect.addEventListener("change", function () {
      refreshRange();
      rebuildInputs(true);
      updateData();
    });
    countSelect.addEventListener("change", function () {
      rebuildInputs();
      updateData();
    });
    varSelect.addEventListener("change", function () {
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

    btnLang.addEventListener("click", function () {
      currentLang = currentLang === "en" ? "uk" : "en";
      try { localStorage.setItem(LS_LANG, currentLang); } catch (e) { }
      applyLang();
    });

    var metaIds = ["metaName", "metaRim", "metaHub", "metaNotes"];
    for (var i = 0; i < metaIds.length; i++) {
      (function (id) {
        $("#" + id).addEventListener("input", function () {
          save();
          renderPrintSheet();
        });
      })(metaIds[i]);
    }
    $("#metaType").addEventListener("change", function () {
      save();
      renderPrintSheet();
    });

    $("#btnPrint").addEventListener("click", function () {
      renderPrintSheet();
      window.print();
    });
  }

  window.addEventListener("DOMContentLoaded", function () {
    bind();
    load();
    currentLang = detectLang();
    applyLang();
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