/**
 * 한빛증권 데모 — 시세 / 매수·매도 폼 / AI 요약 / 음성 화면 이동
 */

const STORAGE_KEY = "stock-app-watchlist";
const AUTH_KEY = "stock-app-auth";
const DEFAULT_SYMBOLS = ["005930.KS", "000660.KS", "035420.KS", "035720.KS", "AAPL"];

const TITLES = {
  home: "시세",
  buy: "매수",
  sell: "매도",
  ai: "AI 인사이트",
};

/** 음성 → 화면 (한국어 위주) */
const VOICE_ROUTES = [
  { id: "home", keys: ["시세", "현재가", "종목", "홈", "메인", "차트", "호가", "시장"] },
  { id: "buy", keys: ["매수", "사줘", "살래", "구매", "살게", "담아"] },
  { id: "sell", keys: ["매도", "팔아", "팔래", "매각", "팔게", "정리"] },
  { id: "ai", keys: ["ai", "에이아이", "인공지능", "분석", "인사이트", "요약", "코멘트"] },
];

const els = {
  viewLogin: document.getElementById("view-login"),
  appShell: document.getElementById("appShell"),
  loginForm: document.getElementById("loginForm"),
  loginId: document.getElementById("loginId"),
  btnLogout: document.getElementById("btnLogout"),
  screenTitle: document.getElementById("screenTitle"),
  userGreeting: document.getElementById("userGreeting"),
  views: {
    home: document.getElementById("view-home"),
    buy: document.getElementById("view-buy"),
    sell: document.getElementById("view-sell"),
    ai: document.getElementById("view-ai"),
  },
  tabs: document.querySelectorAll(".tab[data-go]"),
  watchlist: document.getElementById("watchlist"),
  status: document.getElementById("status"),
  form: document.getElementById("addForm"),
  input: document.getElementById("symbolInput"),
  buyForm: document.getElementById("buyForm"),
  sellForm: document.getElementById("sellForm"),
  buyLimitWrap: document.getElementById("buyLimitWrap"),
  sellLimitWrap: document.getElementById("sellLimitWrap"),
  aiContent: document.getElementById("aiContent"),
  btnAiRefresh: document.getElementById("btnAiRefresh"),
  toast: document.getElementById("toast"),
  btnVoice: document.getElementById("btnVoice"),
  voiceHint: document.getElementById("voiceHint"),
};

let symbols = loadSymbols();
let refreshTimer = null;
/** @type {{ symbol: string, quote: object }[]} */
let lastQuotes = [];

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

function getAuth() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && typeof o.user === "string") return o;
  } catch {
    /* ignore */
  }
  return null;
}

function setAuth(user) {
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({ user }));
}

function clearAuth() {
  sessionStorage.removeItem(AUTH_KEY);
}

function showToast(msg, ms = 2600) {
  els.toast.textContent = msg;
  els.toast.hidden = false;
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    els.toast.hidden = true;
  }, ms);
}

function navigate(viewId, { fromVoice = false } = {}) {
  if (!getAuth() && viewId !== "login") return;
  const ids = ["home", "buy", "sell", "ai"];
  if (!ids.includes(viewId)) return;

  for (const id of ids) {
    const el = els.views[id];
    if (!el) continue;
    el.hidden = id !== viewId;
  }
  els.screenTitle.textContent = TITLES[viewId] || "";
  els.tabs.forEach((tab) => {
    const go = tab.getAttribute("data-go");
    tab.setAttribute("aria-current", go === viewId ? "page" : "false");
  });
  if (viewId === "ai") renderAiInsight();
  if (fromVoice) showToast(`「${TITLES[viewId]}」화면으로 이동했습니다.`);
}

function applyAuthUi() {
  const auth = getAuth();
  if (auth) {
    els.viewLogin.hidden = true;
    els.appShell.hidden = false;
    els.userGreeting.textContent = `${auth.user}님`;
    navigate("home");
  } else {
    els.viewLogin.hidden = false;
    els.appShell.hidden = true;
    els.userGreeting.textContent = "";
  }
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
  const r = await fetch(
    `/api/history?symbol=${encodeURIComponent(symbol)}&range=1mo&interval=1d`
  );
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
    li.remove();
    lastQuotes = lastQuotes.filter((x) => x.symbol !== symbol);
    if (!symbols.length) setStatus("관심 종목이 없습니다. 위에서 심볼을 추가하세요.");
    renderAiInsight();
  });

  return li;
}

async function refreshAll() {
  els.watchlist.innerHTML = "";
  if (!symbols.length) {
    setStatus("관심 종목이 없습니다. 위에서 심볼을 추가하세요.");
    lastQuotes = [];
    renderAiInsight();
    return;
  }
  setStatus("불러오는 중…");
  const frag = document.createDocumentFragment();
  let errors = 0;
  const collected = [];

  for (const sym of symbols) {
    try {
      const [quote, hist] = await Promise.all([fetchQuote(sym), fetchHistory(sym)]);
      const points = hist.points || [];
      collected.push({ symbol: sym, quote });
      frag.appendChild(renderCard(sym, quote, points));
    } catch (e) {
      errors += 1;
      const li = document.createElement("li");
      li.className = "card";
      li.innerHTML = `<p class="card-name">${sym}</p><p class="hint" style="margin:0;color:var(--down)">${e.message || "오류"}</p>`;
      frag.appendChild(li);
    }
  }
  els.watchlist.appendChild(frag);
  lastQuotes = collected;
  const t = new Date().toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  if (errors === symbols.length) {
    setStatus(`모든 요청 실패 (${t}). 서버(python server.py)를 켜 주세요.`, true);
  } else if (errors) {
    setStatus(`일부 종목을 불러오지 못했습니다. ${t}`);
  } else {
    setStatus(`마지막 갱신: ${t}`);
  }
  renderAiInsight();
}

function scheduleRefresh() {
  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (getAuth() && !els.views.home.hidden) refreshAll();
  }, 60_000);
}

/** 규칙 기반 AI 스타일 요약 (외부 API 없음) */
function renderAiInsight() {
  if (els.views.ai.hidden) return;
  if (!lastQuotes.length) {
    els.aiContent.innerHTML = `<p class="muted">시세 탭에서 종목을 불러오면 요약이 생성됩니다.</p>`;
    return;
  }

  const ups = lastQuotes.filter((x) => (x.quote.change ?? 0) > 0);
  const downs = lastQuotes.filter((x) => (x.quote.change ?? 0) < 0);
  const flat = lastQuotes.filter((x) => (x.quote.change ?? 0) === 0 || x.quote.change == null);

  const top = [...lastQuotes].sort(
    (a, b) => (b.quote.changePct ?? 0) - (a.quote.changePct ?? 0)
  )[0];
  const bottom = [...lastQuotes].sort(
    (a, b) => (a.quote.changePct ?? 0) - (b.quote.changePct ?? 0)
  )[0];

  const mood =
    ups.length > downs.length ? "순조로운 편" : downs.length > ups.length ? "조정 국면에 가깝게" : "혼조세에 가깝게";

  const blocks = [];

  blocks.push(`
    <div class="ai-block">
      <h3>오늘의 톤</h3>
      <p>관심 종목 ${lastQuotes.length}개 중 상승 ${ups.length} · 하락 ${downs.length} · 보합/데이터 부족 ${flat.length}개로, 전체적으로 <strong>${mood}</strong> 보입니다. 실제 투자 결정은 뉴스·재무·리스크를 함께 보세요.</p>
    </div>
  `);

  if (top?.quote?.changePct != null) {
    blocks.push(`
      <div class="ai-block">
        <h3>상대적으로 강한 종목</h3>
        <p><strong>${top.quote.name || top.symbol}</strong>은(는) 전일 대비 <strong>${top.quote.changePct > 0 ? "+" : ""}${top.quote.changePct.toFixed(2)}%</strong>입니다. 단기 변동에 과도하게 반응하지 않도록 포지션 비중을 점검해 보세요.</p>
      </div>
    `);
  }

  if (bottom && bottom !== top && bottom?.quote?.changePct != null) {
    blocks.push(`
      <div class="ai-block">
        <h3>주목이 필요한 종목</h3>
        <p><strong>${bottom.quote.name || bottom.symbol}</strong>은(는) <strong>${bottom.quote.changePct.toFixed(2)}%</strong> 흐름입니다. 손절·분할 매수 등 사전에 정한 규칙이 있는지 확인하는 것이 좋습니다.</p>
      </div>
    `);
  }

  blocks.push(`
    <div class="ai-block">
      <h3>한 줄 체크</h3>
      <p>변동성이 큰 날일수록 거래 빈도를 줄이고, 수수료·슬리피지를 함께 고려하세요. 이 메시지는 교육용 데모이며 투자 권유가 아닙니다.</p>
    </div>
  `);

  els.aiContent.innerHTML = blocks.join("");
}

function normalizeVoiceText(raw) {
  return String(raw || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

function routeFromSpeech(transcript) {
  const n = normalizeVoiceText(transcript);
  if (!n) return null;
  if (n.includes("로그아웃") || n.includes("로그아웃해") || n.includes("로그아웃하")) {
    return "logout";
  }
  for (const row of VOICE_ROUTES) {
    for (const k of row.keys) {
      const kn = normalizeVoiceText(k);
      if (n.includes(kn)) return row.id;
    }
  }
  return null;
}

function setupVoice() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    els.btnVoice.disabled = true;
    els.voiceHint.textContent = "이 브라우저는 음성 인식을 지원하지 않습니다. Chrome 권장.";
    return;
  }

  const rec = new SR();
  rec.lang = "ko-KR";
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  rec.continuous = false;

  let listening = false;

  function stopListening() {
    listening = false;
    els.btnVoice.setAttribute("aria-pressed", "false");
    try {
      rec.stop();
    } catch {
      /* already stopped */
    }
  }

  rec.onresult = (ev) => {
    const text = ev.results[0]?.[0]?.transcript ?? "";
    els.voiceHint.textContent = `인식: 「${text}」`;
    const route = routeFromSpeech(text);
    if (route === "logout") {
      clearAuth();
      applyAuthUi();
      showToast("로그아웃했습니다.");
      stopListening();
      return;
    }
    if (route) {
      navigate(route, { fromVoice: true });
    } else {
      showToast("인식했지만 화면을 찾지 못했습니다. 시세·매수·매도·AI를 말해 보세요.");
    }
    stopListening();
  };

  rec.onerror = (ev) => {
    stopListening();
    if (ev.error === "not-allowed") {
      els.voiceHint.textContent = "마이크 권한을 허용해 주세요.";
    } else if (ev.error === "no-speech") {
      els.voiceHint.textContent = "음성이 감지되지 않았습니다. 다시 눌러 말해 주세요.";
    } else {
      els.voiceHint.textContent = `음성 오류: ${ev.error}`;
    }
  };

  rec.onend = () => {
    if (listening) {
      listening = false;
      els.btnVoice.setAttribute("aria-pressed", "false");
    }
  };

  els.btnVoice.addEventListener("click", () => {
    if (!getAuth()) {
      showToast("로그인 후 사용할 수 있습니다.");
      return;
    }
    if (listening) {
      stopListening();
      els.voiceHint.textContent = "음성 입력을 취소했습니다.";
      return;
    }
    listening = true;
    els.btnVoice.setAttribute("aria-pressed", "true");
    els.voiceHint.textContent = "듣고 있습니다… 화면 이름을 말하세요.";
    try {
      rec.start();
    } catch {
      listening = false;
      els.btnVoice.setAttribute("aria-pressed", "false");
      els.voiceHint.textContent = "다시 눌러 시작해 주세요.";
    }
  });
}

/* 이벤트 */
els.loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const id = els.loginId.value.trim() || "고객";
  setAuth(id);
  applyAuthUi();
  refreshAll();
  scheduleRefresh();
  showToast(`환영합니다, ${id}님`);
});

els.btnLogout.addEventListener("click", () => {
  clearAuth();
  applyAuthUi();
  if (refreshTimer) clearInterval(refreshTimer);
});

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const go = tab.getAttribute("data-go");
    if (go) navigate(go);
  });
});

els.form.addEventListener("submit", (e) => {
  e.preventDefault();
  const raw = els.input.value.trim().toUpperCase();
  if (!raw) return;
  if (symbols.includes(raw)) {
    setStatus("이미 목록에 있습니다.");
    els.input.value = "";
    return;
  }
  symbols.push(raw);
  saveSymbols(symbols);
  els.input.value = "";
  refreshAll();
});

function toggleLimit(wrap, typeRadios, name) {
  const t = [...typeRadios].find((r) => r.checked)?.value;
  wrap.hidden = t !== "limit";
}

els.buyForm.querySelectorAll('input[name="buyType"]').forEach((r) => {
  r.addEventListener("change", () =>
    toggleLimit(els.buyLimitWrap, els.buyForm.querySelectorAll('input[name="buyType"]'))
  );
});
els.sellForm.querySelectorAll('input[name="sellType"]').forEach((r) => {
  r.addEventListener("change", () =>
    toggleLimit(els.sellLimitWrap, els.sellForm.querySelectorAll('input[name="sellType"]'))
  );
});

els.buyForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(els.buyForm);
  const sym = String(fd.get("symbol") || "").trim();
  const qty = fd.get("qty");
  const type = fd.get("buyType");
  showToast(`[데모] ${sym} ${qty}주 ${type === "limit" ? "지정가" : "시장가"} 매수 주문이 접수되었습니다.`);
  els.buyForm.reset();
  els.buyForm.querySelector('input[name="buyType"][value="market"]').checked = true;
  els.buyLimitWrap.hidden = true;
});

els.sellForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(els.sellForm);
  const sym = String(fd.get("symbol") || "").trim();
  const qty = fd.get("qty");
  const type = fd.get("sellType");
  showToast(`[데모] ${sym} ${qty}주 ${type === "limit" ? "지정가" : "시장가"} 매도 주문이 접수되었습니다.`);
  els.sellForm.reset();
  els.sellForm.querySelector('input[name="sellType"][value="market"]').checked = true;
  els.sellLimitWrap.hidden = true;
});

els.btnAiRefresh.addEventListener("click", () => {
  renderAiInsight();
  showToast("AI 요약을 갱신했습니다.");
});

/* 초기화 */
applyAuthUi();
setupVoice();
if (getAuth()) {
  refreshAll();
  scheduleRefresh();
}
