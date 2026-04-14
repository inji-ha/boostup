const STORAGE_KEY = "stock-app-watchlist";
const SESSION_KEY = "stock-app-session";
const DEFAULT_SYMBOLS = ["005930.KS", "000660.KS", "035420.KS", "AAPL"];

const RANK_ROWS = [
  { symbol: "005930.KS", label: "삼성전자" },
  { symbol: "000660.KS", label: "SK하이닉스" },
  { symbol: "035420.KS", label: "NAVER" },
  { symbol: "005380.KS", label: "현대차" },
  { symbol: "051910.KS", label: "LG화학" },
];

const els = {
  viewLogin: document.getElementById("view-login"),
  mainShell: document.getElementById("mainShell"),
  loginForm: document.getElementById("loginForm"),
  watchlist: document.getElementById("watchlist"),
  rankList: document.getElementById("rankList"),
  status: document.getElementById("status"),
  symbolInput: document.getElementById("symbolInput"),
  btnAddSymbol: document.getElementById("btnAddSymbol"),
  userChip: document.getElementById("userChip"),
  profileName: document.getElementById("profileName"),
  btnLogout: document.getElementById("btnLogout"),
  buyForm: document.getElementById("buyForm"),
  sellForm: document.getElementById("sellForm"),
  buySymbol: document.getElementById("buySymbol"),
  sellSymbol: document.getElementById("sellSymbol"),
  buyResult: document.getElementById("buyResult"),
  sellResult: document.getElementById("sellResult"),
  aiSymbol: document.getElementById("aiSymbol"),
  btnAiAnalyze: document.getElementById("btnAiAnalyze"),
  aiOutput: document.getElementById("aiOutput"),
  btnVoice: document.getElementById("btnVoice"),
  voiceHint: document.getElementById("voiceHint"),
  btnVoiceHint: document.getElementById("btnVoiceHint"),
  toast: document.getElementById("toast"),
  orderPaneBuy: document.getElementById("orderPaneBuy"),
  orderPaneSell: document.getElementById("orderPaneSell"),
};

const panels = {
  home: document.getElementById("view-home"),
  watch: document.getElementById("view-watch"),
  order: document.getElementById("view-order"),
  balance: document.getElementById("view-balance"),
  quick: document.getElementById("view-quick"),
  ai: document.getElementById("view-ai"),
  menu: document.getElementById("view-menu"),
};

let symbols = loadSymbols();
let refreshTimer = null;
let recognition = null;
let listening = false;

/** @type {Record<string, object>} */
const quoteCache = {};

function loadSymbols() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_SYMBOLS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed.map(String);
  } catch {
    /* ignore */
  }
  return [...DEFAULT_SYMBOLS];
}

function saveSymbols(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && typeof o.name === "string") return o;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(name) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name, at: Date.now() }));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function showToast(msg, ms = 2600) {
  els.toast.textContent = msg;
  els.toast.classList.remove("hidden");
  els.toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.classList.remove("show");
    els.toast.classList.add("hidden");
  }, ms);
}

function setStatus(msg, isError = false) {
  els.status.textContent = msg || "";
  els.status.classList.toggle("error", Boolean(isError && msg));
}

async function fetchQuote(symbol) {
  const r = await fetch(`/api/quote?symbol=${encodeURIComponent(symbol)}`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
}

async function fetchHistory(symbol) {
  const r = await fetch(`/api/history?symbol=${encodeURIComponent(symbol)}&range=1mo&interval=1d`);
  const data = await r.json();
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
}

function formatPrice(n, currency) {
  if (n == null || Number.isNaN(n)) return "—";
  const cur = (currency || "").toUpperCase();
  if (cur === "KRW" || cur === "") {
    return `${Math.round(n).toLocaleString("ko-KR")}원`;
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur || "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function formatChange(change, pct) {
  if (change == null && pct == null) return { text: "—", dir: "flat" };
  const sign = change > 0 ? "+" : change < 0 ? "" : "";
  const p = pct != null ? ` (${sign}${pct.toFixed(2)}%)` : "";
  const c =
    change != null
      ? `${sign}${typeof change === "number" ? change.toLocaleString("ko-KR", { maximumFractionDigits: 2 }) : change}`
      : "";
  const dir = change > 0 ? "up" : change < 0 ? "down" : "flat";
  return { text: `${c}${p}`.trim() || "—", dir };
}

function sparklinePath(points, width, height) {
  if (!points.length) return "";
  const vals = points.map((p) => p.c);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const pad = 4;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const span = max - min || 1;
  return points
    .map((p, i) => {
      const x = pad + (i / Math.max(points.length - 1, 1)) * w;
      const y = pad + h - ((p.c - min) / span) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function renderCard(symbol, quote, historyPoints) {
  const li = document.createElement("li");
  li.className = "card";
  li.dataset.symbol = symbol;

  const ch = formatChange(quote.change, quote.changePct);
  const dir =
    quote.change != null ? (quote.change > 0 ? "up" : quote.change < 0 ? "down" : "flat") : "flat";

  const svgNs = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNs, "svg");
  svg.setAttribute("class", `spark ${dir}`);
  svg.setAttribute("viewBox", "0 0 280 48");
  svg.setAttribute("preserveAspectRatio", "none");
  const path = document.createElementNS(svgNs, "path");
  path.setAttribute("d", sparklinePath(historyPoints, 280, 48));
  svg.appendChild(path);

  li.innerHTML = `
    <div class="card-top">
      <div>
        <p class="card-name"></p>
        <div class="card-symbol"></div>
      </div>
      <button type="button" class="card-remove" aria-label="목록에서 제거">×</button>
    </div>
    <div class="price-row">
      <span class="price"></span>
      <span class="change"></span>
    </div>
  `;
  li.querySelector(".card-name").textContent = quote.name || symbol;
  li.querySelector(".card-symbol").textContent = quote.symbol || symbol;
  li.querySelector(".price").textContent = formatPrice(quote.price, quote.currency);
  const changeEl = li.querySelector(".change");
  changeEl.textContent = ch.text;
  changeEl.classList.add("change", ch.dir);

  const sparkSlot = document.createElement("div");
  sparkSlot.appendChild(svg);
  li.appendChild(sparkSlot);

  li.querySelector(".card-remove").addEventListener("click", () => {
    symbols = symbols.filter((s) => s !== symbol);
    saveSymbols(symbols);
    delete quoteCache[symbol];
    syncSelects();
    li.remove();
    if (!symbols.length) setStatus("관심 종목이 없습니다. 위에서 심볼을 추가하세요.");
    renderRankList();
  });

  return li;
}

async function refreshAll() {
  els.watchlist.innerHTML = "";
  if (!symbols.length) {
    setStatus("관심 종목이 없습니다. 위에서 심볼을 추가하세요.");
    renderRankList();
    return;
  }
  setStatus("불러오는 중…");
  const frag = document.createDocumentFragment();
  let errors = 0;

  for (const sym of symbols) {
    try {
      const [quote, hist] = await Promise.all([fetchQuote(sym), fetchHistory(sym)]);
      quoteCache[sym] = quote;
      const points = hist.points || [];
      frag.appendChild(renderCard(sym, quote, points));
    } catch (e) {
      errors += 1;
      delete quoteCache[sym];
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `<p class="card-name">${sym}</p><p class="hint-text" style="margin:0;color:var(--down)">${e.message || "오류"}</p>`;
      frag.appendChild(li);
    }
  }
  els.watchlist.appendChild(frag);
  const t = new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  if (errors === symbols.length) {
    setStatus(`모든 요청 실패 (${t}). 서버(python server.py)가 켜져 있는지 확인하세요.`, true);
  } else if (errors) {
    setStatus(`일부 종목을 불러오지 못했습니다. ${t}`);
  } else {
    setStatus(`마지막 갱신: ${t}`);
  }
  syncSelects();
  renderRankList();
}

function scheduleRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    refreshAll();
    refreshHomeIndices();
    renderRankList();
  }, 60_000);
}

function syncSelects() {
  const opts = symbols.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
  [els.buySymbol, els.sellSymbol, els.aiSymbol].forEach((sel) => {
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = opts || '<option value="">종목 없음</option>';
    if (cur && symbols.includes(cur)) sel.value = cur;
    else if (symbols[0]) sel.value = symbols[0];
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

function formatIdx(n) {
  if (n == null || Number.isNaN(n)) return "—";
  return Number(n).toLocaleString("ko-KR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function refreshHomeIndices() {
  const rows = [
    { sym: "^KS11", val: "idxKospi", pct: "idxKospiPct", pt: "idxKospiPt" },
    { sym: "^KQ11", val: "idxKosdaq", pct: "idxKosdaqPct", pt: "idxKosdaqPt" },
  ];
  for (const { sym, val, pct, pt } of rows) {
    try {
      const q = await fetchQuote(sym);
      const elV = document.getElementById(val);
      const elP = document.getElementById(pct);
      const elT = document.getElementById(pt);
      if (elV) elV.textContent = formatIdx(q.price);
      if (elP && q.changePct != null) {
        const up = q.changePct > 0;
        const down = q.changePct < 0;
        elP.textContent = `${q.changePct > 0 ? "+" : ""}${q.changePct.toFixed(2)}%`;
        elP.className = up ? "up" : down ? "down" : "";
      }
      if (elT && q.change != null) {
        elT.textContent = `${q.change > 0 ? "+" : ""}${q.change.toFixed(2)}`;
      }
    } catch {
      const elV = document.getElementById(val);
      if (elV && elV.textContent === "—") continue;
    }
  }
}

async function renderRankList() {
  if (!els.rankList) return;
  els.rankList.innerHTML = "";
  const frag = document.createDocumentFragment();
  for (const row of RANK_ROWS) {
    const li = document.createElement("li");
    li.className = "rank-row";
    try {
      const q = await fetchQuote(row.symbol);
      const ch = q.changePct;
      const up = ch != null && ch > 0;
      const down = ch != null && ch < 0;
      const chCls = up ? "up" : down ? "down" : "";
      const price = q.price != null ? `${Math.round(q.price).toLocaleString("ko-KR")}` : "—";
      const pctStr = ch != null ? `${ch > 0 ? "+" : ""}${ch.toFixed(2)}%` : "—";
      li.innerHTML = `
        <div class="rank-logo" aria-hidden="true"></div>
        <div class="rank-mid">
          <p class="rank-name">${escapeHtml(q.name || row.label)}</p>
        </div>
        <div class="rank-price">
          <span class="p">${price}</span>
          <span class="ch ${chCls}">${pctStr}</span>
        </div>
        <button type="button" class="rank-star" aria-label="관심">☆</button>
      `;
    } catch {
      li.innerHTML = `
        <div class="rank-logo" aria-hidden="true"></div>
        <div class="rank-mid">
          <p class="rank-name">${escapeHtml(row.label)}</p>
        </div>
        <div class="rank-price">
          <span class="p">—</span>
          <span class="ch">—</span>
        </div>
        <button type="button" class="rank-star" aria-label="관심">☆</button>
      `;
    }
    frag.appendChild(li);
  }
  els.rankList.appendChild(frag);
}

function setOrderTab(which) {
  const buyOn = which === "buy";
  document.querySelectorAll(".order-seg-btn").forEach((b) => {
    b.classList.toggle("is-active", b.getAttribute("data-order-tab") === which);
  });
  if (els.orderPaneBuy) {
    els.orderPaneBuy.classList.toggle("hidden", !buyOn);
    els.orderPaneBuy.hidden = !buyOn;
  }
  if (els.orderPaneSell) {
    els.orderPaneSell.classList.toggle("hidden", buyOn);
    els.orderPaneSell.hidden = buyOn;
  }
}

function navigateTo(view) {
  const keys = Object.keys(panels);
  if (!keys.includes(view)) return;
  keys.forEach((k) => {
    const el = panels[k];
    const on = k === view;
    el.classList.toggle("hidden", !on);
    el.hidden = !on;
  });
  document.querySelectorAll(".nav-item").forEach((btn) => {
    const nav = btn.getAttribute("data-nav");
    const active = nav === view;
    btn.classList.toggle("active", active);
    if (active) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  if (view === "ai") runAiAnalysis();
  if (view === "home") {
    refreshHomeIndices();
    renderRankList();
  }
  if (view === "watch") refreshAll();
  if (view === "order") setOrderTab("buy");
}

function matchVoiceIntent(text) {
  const t = text.toLowerCase().replace(/\s+/g, "");

  if (["로그인", "로그인화면", "로그인해줘", "로그인으로", "로그인해"].some((k) => t.includes(k))) {
    return { kind: "login" };
  }
  if (["로그아웃", "로그아웃해", "로그아웃해줘", "로그아웃해주세요"].some((k) => t.includes(k))) {
    return { kind: "logout" };
  }

  const routes = [
    { keys: ["홈", "메인", "시장"], view: "home" },
    { keys: ["관심", "시세", "종목", "관심종목", "차트", "주가"], view: "watch" },
    { keys: ["주문", "매수", "매도", "살게", "팔아"], view: "order" },
    { keys: ["잔고", "평가", "자산"], view: "balance" },
    { keys: ["퀵", "퀵메뉴"], view: "quick" },
    { keys: ["전체", "메뉴", "마이", "프로필", "설정", "계정"], view: "menu" },
    { keys: ["ai", "에이아이", "인공지능", "분석", "인사이트", "브리핑"], view: "ai" },
  ];

  for (const { keys, view } of routes) {
    for (const k of keys) {
      if (t.includes(k.toLowerCase())) return { kind: "view", view };
    }
  }
  return null;
}

function getSpeechRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return null;
  const r = new SR();
  r.lang = "ko-KR";
  r.interimResults = false;
  r.maxAlternatives = 1;
  return r;
}

function setListening(on) {
  listening = on;
  els.btnVoice.classList.toggle("listening", on);
  els.btnVoice.setAttribute("aria-pressed", on ? "true" : "false");
  els.voiceHint.textContent = on
    ? "듣고 있어요… 원하는 화면 이름을 말해 주세요."
    : "마이크를 누른 뒤 “홈”, “관심”, “주문” 등으로 말해보세요.";
}

function startVoiceNavigation() {
  if (!els.mainShell.classList.contains("hidden")) {
    /* ok */
  } else {
    showToast("로그인 후 사용할 수 있어요.");
    return;
  }

  recognition = recognition || getSpeechRecognition();
  if (!recognition) {
    showToast("이 브라우저는 음성 인식을 지원하지 않습니다. Chrome을 권장합니다.");
    return;
  }

  if (listening) {
    try {
      recognition.abort();
    } catch {
      /* ignore */
    }
    setListening(false);
    return;
  }

  recognition.onstart = () => setListening(true);
  recognition.onend = () => setListening(false);
  recognition.onerror = (ev) => {
    setListening(false);
    if (ev.error === "not-allowed") showToast("마이크 권한을 허용해 주세요.");
    else if (ev.error === "no-speech") showToast("음성이 감지되지 않았어요. 다시 눌러 주세요.");
  };
  recognition.onresult = (ev) => {
    const said = ev.results[0]?.[0]?.transcript?.trim() || "";
    const intent = matchVoiceIntent(said);
    if (intent?.kind === "login") {
      clearSession();
      els.viewLogin.classList.remove("hidden");
      els.mainShell.classList.add("hidden");
      els.mainShell.hidden = true;
      if (refreshTimer) clearInterval(refreshTimer);
      showToast(`「${said}」 → 로그인 화면`);
    } else if (intent?.kind === "logout") {
      clearSession();
      els.viewLogin.classList.remove("hidden");
      els.mainShell.classList.add("hidden");
      els.mainShell.hidden = true;
      if (refreshTimer) clearInterval(refreshTimer);
      showToast("로그아웃했어요.");
    } else if (intent?.kind === "view" && intent.view) {
      navigateTo(intent.view);
      showToast(`「${said}」 → ${labelView(intent.view)}`);
    } else {
      showToast(`인식: ${said || "(빈 음성)"} — 키워드를 찾지 못했어요.`);
    }
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
  };

  try {
    recognition.start();
  } catch {
    showToast("음성을 시작할 수 없습니다. 잠시 후 다시 눌러 주세요.");
    setListening(false);
  }
}

function labelView(v) {
  const m = {
    home: "홈",
    watch: "관심",
    order: "주문",
    balance: "잔고",
    quick: "퀵메뉴",
    menu: "전체",
    ai: "AI",
  };
  return m[v] || v;
}

function buildAiHtml(quote) {
  const name = quote.name || quote.symbol;
  const price = formatPrice(quote.price, quote.currency);
  const ch = quote.change;
  const pct = quote.changePct;
  let tone = "보합권";
  if (ch != null) {
    if (ch > 0) tone = "상승 모멘텀";
    else if (ch < 0) tone = "조정 흐름";
  }
  const volHint =
    pct != null && Math.abs(pct) >= 3
      ? "당일 변동폭이 큽니다. 체결 분할·손절 기준을 미리 정리해 두면 좋습니다."
      : "변동폭이 비교적 완만한 편입니다. 뉴스·실적 일정과 함께 보는 것을 권합니다.";

  const others = symbols.filter((s) => s !== quote.symbol && quoteCache[s]);
  let basket = "";
  if (others.length) {
    const avg =
      others.reduce((acc, s) => acc + (quoteCache[s].changePct ?? 0), 0) / others.length;
    basket = `<p class="muted" style="margin-top:0.75rem">관심 바구니 힌트: 다른 관심 종목 평균 등락은 약 ${avg >= 0 ? "+" : ""}${avg.toFixed(2)}% 수준으로 추정됩니다 (캐시 기준).</p>`;
  }

  return `
    <h3>${escapeHtml(name)} 요약</h3>
    <p><strong>현재가</strong> ${escapeHtml(price)} · 전일 대비 변화는 수치 기준으로 표시됩니다.</p>
    <ul>
      <li>단기 국면: <strong>${tone}</strong>${pct != null ? ` (약 ${pct > 0 ? "+" : ""}${pct.toFixed(2)}%)` : ""}.</li>
      <li>${volHint}</li>
      <li>리스크: 본 분석은 데모용 규칙 기반이며 투자 권유가 아닙니다.</li>
    </ul>
    ${basket}
    <span class="tag">AI 데모 · 규칙 기반</span>
  `;
}

async function runAiAnalysis() {
  const sym = els.aiSymbol.value;
  if (!sym) {
    els.aiOutput.innerHTML = "<p>관심 종목을 먼저 추가해 주세요.</p>";
    return;
  }
  els.aiOutput.innerHTML = "<p>분석 중…</p>";
  try {
    const quote = await fetchQuote(sym);
    els.aiOutput.innerHTML = buildAiHtml(quote);
  } catch (e) {
    els.aiOutput.innerHTML = `<p class="status-line error">불러오기 실패: ${escapeHtml(e.message)}</p>`;
  }
}

function bindUi() {
  els.loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("loginId").value.trim();
    if (!id) return;
    const display = id.length > 8 ? `${id.slice(0, 6)}…` : id;
    const name = `${display}님`;
    saveSession(name);
    applySession(name);
  });

  els.btnLogout.addEventListener("click", () => {
    clearSession();
    els.viewLogin.classList.remove("hidden");
    els.mainShell.classList.add("hidden");
    els.mainShell.hidden = true;
  });

  els.btnAddSymbol.addEventListener("click", () => {
    const raw = els.symbolInput.value.trim().toUpperCase();
    if (!raw) return;
    if (symbols.includes(raw)) {
      setStatus("이미 목록에 있습니다.");
      els.symbolInput.value = "";
      return;
    }
    symbols.push(raw);
    saveSymbols(symbols);
    els.symbolInput.value = "";
    refreshAll();
  });

  els.symbolInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      els.btnAddSymbol.click();
    }
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const v = btn.getAttribute("data-nav");
      if (v) navigateTo(v);
    });
  });

  document.querySelectorAll(".order-seg-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tab = btn.getAttribute("data-order-tab");
      if (tab === "buy" || tab === "sell") setOrderTab(tab);
    });
  });

  document.querySelectorAll(".quick-tile[data-go], .menu-row[data-go]").forEach((el) => {
    el.addEventListener("click", () => {
      const go = el.getAttribute("data-go");
      if (go) navigateTo(go);
    });
  });

  const watchTabBtn = document.querySelector(".sub-tab--icon");
  if (watchTabBtn) {
    watchTabBtn.addEventListener("click", () => navigateTo("watch"));
  }

  els.buyForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sym = els.buySymbol.value;
    const qty = document.getElementById("buyQty").value;
    const type = document.getElementById("buyType").value;
    const price = document.getElementById("buyPrice").value;
    els.buyResult.textContent = `[데모] ${sym} 매수 ${qty}주 (${type === "market" ? "시장가" : "지정가"}${
      price ? ` ${Number(price).toLocaleString("ko-KR")}원` : ""
    }) 접수 시뮬레이션 완료. 실제 주문은 이루어지지 않습니다.`;
  });

  els.sellForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const sym = els.sellSymbol.value;
    const qty = document.getElementById("sellQty").value;
    const type = document.getElementById("sellType").value;
    const price = document.getElementById("sellPrice").value;
    els.sellResult.textContent = `[데모] ${sym} 매도 ${qty}주 (${type === "market" ? "시장가" : "지정가"}${
      price ? ` ${Number(price).toLocaleString("ko-KR")}원` : ""
    }) 접수 시뮬레이션 완료. 실제 주문은 이루어지지 않습니다.`;
  });

  els.btnAiAnalyze.addEventListener("click", () => runAiAnalysis());

  els.btnVoice.addEventListener("click", () => startVoiceNavigation());

  els.btnVoiceHint.addEventListener("click", () => {
    showToast("하단 마이크를 누른 뒤: 홈·관심·주문·잔고·퀵메뉴·전체·AI 등으로 말하면 해당 화면으로 이동합니다.", 4000);
  });
}

function applySession(name) {
  els.userChip.textContent = name;
  if (els.profileName) els.profileName.textContent = name;
  els.viewLogin.classList.add("hidden");
  els.mainShell.classList.remove("hidden");
  els.mainShell.hidden = false;
  navigateTo("home");
  refreshAll();
  refreshHomeIndices();
  renderRankList();
  scheduleRefresh();
}

function init() {
  bindUi();
  const sess = loadSession();
  if (sess?.name) applySession(sess.name);
  else {
    els.viewLogin.classList.remove("hidden");
    els.mainShell.classList.add("hidden");
    els.mainShell.hidden = true;
  }
}

init();
