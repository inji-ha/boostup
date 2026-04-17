import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

// ─────────────────────────────────────────────────────────────
// LOGO_MAP (base64 원본 유지)
// ─────────────────────────────────────────────────────────────
const LOGO_MAP = {
  "003530": "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAARCAEYARgDASIAAhEBAxEB/8QAHAABAAIDAQEBAAAAAAAAAAAAAAYHBAUIAwEC/8QAQxAAAgEDAgMFBQUECQIHAAAAAAECAwQFBhEHITESQVFhcRMigZGhFCMyscFCYpLRJDNDUnKCosLxFTRTY3Oy0uHw/9oADAMBAAIRAxEAPwCTAA4kdoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9APgNzi9LahyajKzxN1OEuk5R7EX/AJlbIkFpwu1JWSdadjbeU6rb/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaap/Z",
  "005930": "data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/wAARCAEYARgDASIAAhEBAxEB/8QAHQABAAIDAQEBAQAAAAAAAAAAAAcIBAUGCQMCAf/EAE4QAAEDAwIEAQgDCA4LAQAAAAABAgMEBREGBwgSITFREyIyQWFxgZEUI3IVM0NzgqGishY1NjdCUlNidYSSscHDFzRUY3R2g5OztNPS/8QAGwEBAAIDAQEAAAAAAAAAAAAAAAQFAQIDBgf/xAA5EQABAwIDBAcGBQQDAAAAAAAAAQIDBBEFITESMkGRBhNhcYGhBhUiQlGx4RQzQ8HwFiMkYlJy8f/aAAwDAQACEQMRAD8AoMBUFMwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+tLTVFXO2Clglnld6LI2K5y+5ECrYyfIHeaf2e3JvatWl0pXQRr564iKnQqPde5PSqJz8yIp9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/Z",
};

const HANWHA_ORANGE  = '#F37321';
const TWELVE_API_KEY = '9e1b88b33cce2ffc990acb3a2dcbedb7e91a34612f9cb7d75c955d7429635227';
const TWELVE_BASE    = 'https://api.twelvedata.com';

const INITIAL_STOCKS = [
  { id:'003530', ticker:'003530', exchange:'KRX',    name:'한화투자증권', type:'domestic', currentPrice:3850,   shareCount:1168, profitRate:15.2, logoKey:'003530' },
  { id:'005930', ticker:'005930', exchange:'KRX',    name:'삼성전자',     type:'domestic', currentPrice:78400,  shareCount:750,  profitRate:32.1, logoKey:'005930' },
  { id:'000660', ticker:'000660', exchange:'KRX',    name:'SK하이닉스',  type:'domestic', currentPrice:196500, shareCount:50,   profitRate:24.5, logoUrl:'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/SK_Hynix_logo.svg/512px-SK_Hynix_logo.svg.png' },
  { id:'000270', ticker:'000270', exchange:'KRX',    name:'기아',         type:'domestic', currentPrice:115500, shareCount:30,   profitRate:8.4,  logoUrl:'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Kia_logo2.svg/512px-Kia_logo2.svg.png' },
  { id:'AAPL',   ticker:'AAPL',   exchange:'NASDAQ', name:'애플',         type:'overseas', currentPrice:211.5,  shareCount:191,  profitRate:12.5, logoUrl:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/512px-Apple_logo_black.svg.png' },
];

const MARKET_DATA = {
  '국내':   [{ name:'코스피',       value:'2,642.48',  rate:'+0.93%' }, { name:'코스닥',    value:'853.91',   rate:'+1.86%' }],
  '해외':   [{ name:'나스닥',       value:'19,210.00', rate:'+0.42%' }, { name:'S&P 500',  value:'5,254.35', rate:'+0.38%' }],
  '금리':   [{ name:'CD금리(91일)', value:'3.640',     rate:'0.00%'  }, { name:'국고채 3년',value:'3.342',   rate:'-0.62%' }],
  '환율':   [{ name:'원/달러',      value:'1,352.40',  rate:'-0.38%' }, { name:'엔/달러',  value:'151.25',   rate:'+0.08%' }],
  '원자재': [{ name:'금',           value:'2,345.40',  rate:'+0.53%' }, { name:'WTI',      value:'82.42',    rate:'+0.33%' }],
};

const DIVIDEND_HISTORY = [
  {month:'1월',amount:0},{month:'2월',amount:0},{month:'3월',amount:450000},
  {month:'4월',amount:1250000},{month:'5월',amount:0},{month:'6월',amount:320000},
  {month:'7월',amount:0},{month:'8월',amount:0},{month:'9월',amount:510000},
  {month:'10월',amount:0},{month:'11월',amount:0},{month:'12월',amount:0},
];

const DIVIDEND_LIST = [
  { id:1, date:'09.25', name:'삼성전자',     amount:'361,000원',   status:'입금완료', logoKey:'005930' },
  { id:2, date:'09.12', name:'애플',         amount:'149,200원',   status:'입금완료', initial:'A' },
  { id:3, date:'06.28', name:'삼성전자',     amount:'320,000원',   status:'입금완료', logoKey:'005930' },
  { id:4, date:'04.15', name:'한화투자증권', amount:'1,250,000원', status:'입금완료', logoKey:'003530' },
];

// ─── 아이콘 ───────────────────────────────────────────────────
const Icon = {
  OrangeMic:     ({c})=><svg viewBox="0 0 24 24" fill="none" stroke={c||'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
  Search:        ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Star:          ({f})=><svg viewBox="0 0 24 24" fill={f||'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  ChevLeft:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polyline points="15 18 9 12 15 6"/></svg>,
  ChevRight:     ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polyline points="9 18 15 12 9 6"/></svg>,
  ChevDown:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><polyline points="6 9 12 15 18 9"/></svg>,
  Grid:          ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  Compass:       ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  Msg:           ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  Fingerprint:   ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M2 12a10 10 0 0 1 18-6"/><path d="M5 19a10 10 0 0 1 15-7"/><path d="M7 15a10 10 0 0 1 12-2"/><path d="M9 11a10 10 0 0 1 6-1"/><path d="M12 12v.01"/></svg>,
  Bell:          ({badge})=><div style={{position:'relative',display:'inline-flex'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>{badge&&<span style={{position:'absolute',top:-4,right:-4,width:8,height:8,background:'#f43f5e',borderRadius:'50%'}}/>}</div>,
  X:             ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Help:          ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Calendar:      ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Globe:         ()=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:'100%',height:'100%'}}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
};

// 아이콘 래퍼
const Ico = ({name, size=20, color, badge, fill}) => (
  <span style={{display:'inline-flex',width:size,height:size,color:color||'currentColor',flexShrink:0}}>
    {name==='mic'        && <Icon.OrangeMic c={color||'currentColor'}/>}
    {name==='search'     && <Icon.Search/>}
    {name==='star'       && <Icon.Star f={fill}/>}
    {name==='chevLeft'   && <Icon.ChevLeft/>}
    {name==='chevRight'  && <Icon.ChevRight/>}
    {name==='chevDown'   && <Icon.ChevDown/>}
    {name==='grid'       && <Icon.Grid/>}
    {name==='compass'    && <Icon.Compass/>}
    {name==='msg'        && <Icon.Msg/>}
    {name==='finger'     && <Icon.Fingerprint/>}
    {name==='bell'       && <Icon.Bell badge={badge}/>}
    {name==='x'          && <Icon.X/>}
    {name==='help'       && <Icon.Help/>}
    {name==='calendar'   && <Icon.Calendar/>}
    {name==='globe'      && <Icon.Globe/>}
  </span>
);

// ─── 로고 컴포넌트 ────────────────────────────────────────────
const StockLogo = ({logoKey, logoUrl, name, initial, size=40}) => {
  const src = LOGO_MAP[logoKey] || logoUrl;
  const [err, setErr] = useState(false);
  const s = {width:size,height:size,borderRadius:'50%',flexShrink:0,overflow:'hidden',border:'1px solid #f1f5f9',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 1px 4px rgba(0,0,0,.06)'};
  if (src && !err) return <div style={s}><img src={src} alt={name} style={{width:'100%',height:'100%',objectFit:'contain',padding:5}} onError={()=>setErr(true)}/></div>;
  return <div style={{...s,background:HANWHA_ORANGE}}><span style={{color:'#fff',fontWeight:900,fontSize:14}}>{initial||name?.[0]||'?'}</span></div>;
};

// ─── Twelve Data 실시간 시세 훅 ───────────────────────────────
const useRealTimePrice = (ticker, exchange, enabled=true) => {
  const [state, setState] = useState({price:null,change:null,pct:null,loading:false,error:null,updated:null});
  const fetch_ = useCallback(async()=>{
    if(!ticker||!enabled) return;
    setState(s=>({...s,loading:true,error:null}));
    try {
      const p = new URLSearchParams({symbol:ticker, exchange:exchange||'', apikey:TWELVE_API_KEY});
      const res  = await fetch(`${TWELVE_BASE}/quote?${p}`, {signal:AbortSignal.timeout(10000)});
      const data = await res.json();
      if(data.status==='error'||data.code) throw new Error(data.message||'오류');
      const price=parseFloat(data.close), prev=parseFloat(data.previous_close);
      const change=parseFloat(data.change), pct=parseFloat(data.percent_change);
      if(!isNaN(price)) setState({price,change:isNaN(change)?price-prev:change,pct:isNaN(pct)?0:pct,loading:false,error:null,updated:new Date()});
      else throw new Error('파싱 실패');
    } catch(e) { setState(s=>({...s,loading:false,error:e.message})); }
  },[ticker,exchange,enabled]);
  useEffect(()=>{ fetch_(); const t=setInterval(fetch_,60000); return()=>clearInterval(t); },[fetch_]);
  return {...state,refetch:fetch_};
};

// ─── 음성인식 훅 ──────────────────────────────────────────────
const useSpeech = (onResult) => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recRef = useRef(null);
  const txRef  = useRef('');
  const start  = useCallback(()=>{
    const SR = window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR) return;
    try{ recRef.current?.stop(); } catch{}
    const r = new SR();
    r.lang='ko-KR';
    r.onstart  = ()=>setListening(true);
    r.onresult = e=>{ const t=e.results[0][0].transcript; setTranscript(t); txRef.current=t; };
    r.onend    = ()=>{ setListening(false); onResult(txRef.current); };
    r.onerror  = ()=>setListening(false);
    recRef.current=r; r.start();
  },[onResult]);
  return {listening,transcript,start};
};

// ─── 메인 앱 ──────────────────────────────────────────────────
const App = () => {
  const [view,           setView]           = useState('home');
  const [stockId,        setStockId]        = useState('003530');
  const [marketTab,      setMarketTab]      = useState('국내');
  const [priceMode,      setPriceMode]      = useState('평가금'); // ✅ FIX1
  const [orderOpen,      setOrderOpen]      = useState(false);
  const [bioOpen,        setBioOpen]        = useState(false);
  const [divPopup,       setDivPopup]       = useState(false);
  const [tooltip,        setTooltip]        = useState(null);

  const stocks = INITIAL_STOCKS;
  const stock  = stocks.find(s=>s.id===stockId)||stocks[0];

  const analyzeIntent = useCallback((text)=>{
    if(text.includes('배당금')){ setView('dividend'); return; }
    const m = stocks.find(s=>text.includes(s.name));
    if(m){ setStockId(m.id); setView('chart'); if(text.includes('사줘')||text.includes('매수')) setTimeout(()=>setOrderOpen(true),500); }
  },[stocks]);

  const {listening, transcript, start} = useSpeech(analyzeIntent);

  // 가격 표시 헬퍼
  const displayVal = (s) => {
    const qty = priceMode==='평가금' ? s.shareCount : 1;
    return s.type==='overseas'
      ? `$${(s.currentPrice*qty).toLocaleString(undefined,{maximumFractionDigits:2})}`
      : `${(s.currentPrice*qty).toLocaleString()}원`;
  };

  // ── 배당 차트 ──────────────────────────────────────────────
  const maxDiv = Math.max(...DIVIDEND_HISTORY.map(d=>d.amount));
  const DivChart = () => (
    <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',height:140,padding:'12px 8px 0',background:'#fff',borderRadius:16,marginTop:16,border:'1px solid #f8fafc',boxShadow:'0 1px 4px rgba(0,0,0,.04)',position:'relative',overflow:'visible'}}>
      {DIVIDEND_HISTORY.map((d,i)=>{
        const h = d.amount>0 ? (d.amount/maxDiv)*100 : 4;
        return (
          <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,position:'relative'}}>
            {tooltip===d.month && d.amount>0 && (
              <div style={{position:'absolute',top:-40,background:'#1e293b',color:'#fff',fontSize:10,padding:'4px 8px',borderRadius:8,whiteSpace:'nowrap',zIndex:50,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>
                {d.amount.toLocaleString()}원
                <div style={{position:'absolute',bottom:-4,left:'50%',transform:'translateX(-50%) rotate(45deg)',width:8,height:8,background:'#1e293b'}}/>
              </div>
            )}
            <div onClick={()=>setTooltip(tooltip===d.month?null:d.month)}
              style={{width:16,height:h,borderRadius:'4px 4px 0 0',background:d.amount>0?HANWHA_ORANGE:'#f1f5f9',cursor:'pointer',transition:'filter .2s'}}/>
            <span style={{fontSize:9,fontWeight:700,color:'#94a3b8'}}>{d.month.replace('월','')}</span>
          </div>
        );
      })}
    </div>
  );

  // ── 배당금 화면 ────────────────────────────────────────────
  if (view==='dividend') return (
    <div style={{width:360,height:800,background:'#F8F9FB',fontFamily:'-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.2)',border:'1px solid #e2e8f0'}}>
      {/* 티커 */}
      <div style={{background:'#F2F4F7',height:36,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:'1px solid #e2e8f0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,background:'#f43f5e',borderRadius:'50%'}}/><span style={{fontSize:10,fontWeight:700,color:'#475569'}}>🇰🇷 한국 정규장 운영 중</span></div>
        <span style={{fontSize:10,fontWeight:700,color:'#94a3b8'}}>15:30 종료</span>
      </div>

      <div style={{background:'#fff',padding:'24px 20px 16px',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <button onClick={()=>setView('home')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:4,display:'flex'}}><Ico name="chevLeft" size={24}/></button>
          <button style={{display:'flex',alignItems:'center',gap:4,padding:'6px 12px',background:'#f8fafc',border:'1px solid #f1f5f9',borderRadius:999,fontSize:12,fontWeight:900,color:'#1e293b',cursor:'pointer'}}>
            2024년 <Ico name="chevDown" size={12}/>
          </button>
          <div style={{width:32}}/>
        </div>
        <p style={{fontSize:13,fontWeight:700,color:'#94a3b8',marginBottom:4}}>올해 받은 배당금</p>
        <h2 style={{fontSize:26,fontWeight:900,color:'#0f172a',marginBottom:8}}>2,530,200원</h2>
        <DivChart/>
      </div>

      <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>
        {/* 요약 카드 */}
        <div style={{display:'flex',gap:12,padding:'16px 20px'}}>
          {[{label:'총 배당금',value:'2,530,200원',sub:null,accent:false},{label:'예상 배당금',value:'842,000원',sub:'연말 정산 예정',accent:true}].map((c,i)=>(
            <div key={i} style={{flex:1,background:'#fff',borderRadius:16,padding:16,border:'1px solid #f1f5f9',boxShadow:'0 1px 4px rgba(0,0,0,.04)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                <span style={{fontSize:11,fontWeight:700,color:'#94a3b8'}}>{c.label}</span>
                {i===1
                  ? <button onClick={()=>setDivPopup(true)} style={{background:'#fff7ed',border:'none',borderRadius:8,padding:4,cursor:'pointer',color:HANWHA_ORANGE,display:'flex'}}><Ico name="help" size={12} color={HANWHA_ORANGE}/></button>
                  : <button style={{background:'#f8fafc',border:'none',borderRadius:8,padding:4,cursor:'pointer',color:'#94a3b8',display:'flex'}}><Ico name="calendar" size={12}/></button>
                }
              </div>
              <p style={{fontSize:15,fontWeight:900,color:c.accent?HANWHA_ORANGE:'#0f172a'}}>{c.value}</p>
              {c.sub
                ? <p style={{fontSize:10,fontWeight:700,color:'#cbd5e1',marginTop:12,fontStyle:'italic'}}>{c.sub}</p>
                : <button style={{marginTop:12,width:'100%',padding:'6px 0',background:'#f8fafc',border:'none',borderRadius:12,fontSize:10,fontWeight:900,color:'#64748b',cursor:'pointer'}}>입금내역 보기</button>
              }
            </div>
          ))}
        </div>

        <div style={{height:10,background:'#f1f5f9'}}/>

        <div style={{padding:'24px 20px 80px'}}>
          <h3 style={{fontSize:15,fontWeight:900,color:'#1e293b',marginBottom:20}}>월별 배당 내역</h3>
          <div style={{display:'flex',flexDirection:'column',gap:24}}>
            {DIVIDEND_LIST.map(item=>(
              <div key={item.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <StockLogo logoKey={item.logoKey} name={item.name} initial={item.initial} size={42}/>
                  <div>
                    <p style={{fontSize:14,fontWeight:900,color:'#1e293b'}}>{item.name}</p>
                    <p style={{fontSize:11,fontWeight:700,color:'#94a3b8'}}>{item.date} · {item.status}</p>
                  </div>
                </div>
                <p style={{fontSize:14,fontWeight:900,color:'#1e293b'}}>+{item.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 네비 */}
      <nav style={{height:70,background:'#fff',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 8px',flexShrink:0}}>
        <NavBtn icon="grid" label="증권" active={false} onClick={()=>setView('home')}/>
        <NavBtn icon="calendar" label="배당금" active={true} color={HANWHA_ORANGE} onClick={()=>setView('dividend')}/>
        <div style={{position:'relative',bottom:20}}>
          <button onClick={start} style={{width:56,height:56,borderRadius:'50%',background:HANWHA_ORANGE,border:'4px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 8px 24px rgba(243,115,33,.4)`}}>
            <Ico name="mic" size={28} color="#fff"/>
          </button>
        </div>
        <NavBtn icon="compass" label="발견" active={false} onClick={()=>{}}/>
        <NavBtn icon="msg" label="피드" active={false} onClick={()=>{}}/>
      </nav>

      {listening && <ListeningOverlay transcript={transcript} stop={()=>{}}/>}
      {divPopup  && <DivDetailPopup onClose={()=>setDivPopup(false)}/>}
    </div>
  );

  // ── 차트 화면 ──────────────────────────────────────────────
  if (view==='chart') return (
    <div style={{width:360,height:800,background:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.2)',border:'1px solid #e2e8f0'}}>
      <div style={{background:'#F2F4F7',height:36,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:'1px solid #e2e8f0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,background:'#f43f5e',borderRadius:'50%'}}/><span style={{fontSize:10,fontWeight:700,color:'#475569'}}>🇰🇷 한국 정규장 운영 중</span></div>
        <span style={{fontSize:10,fontWeight:700,color:'#94a3b8'}}>15:30 종료</span>
      </div>
      <header style={{padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <button onClick={()=>setView('home')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',padding:4,display:'flex'}}><Ico name="chevLeft" size={24}/></button>
        <h2 style={{fontSize:16,fontWeight:900}}>{stock.name}</h2>
        <div style={{display:'flex',gap:16,color:'#cbd5e1'}}><Ico name="star" size={20}/><Ico name="bell" size={20}/></div>
      </header>
      <div style={{padding:'0 20px 12px'}}>
        <p style={{fontSize:32,fontWeight:900,letterSpacing:'-1px'}}>
          {stock.type==='overseas' ? `$${stock.currentPrice.toFixed(2)}` : `${stock.currentPrice.toLocaleString()}원`}
        </p>
        <p style={{fontSize:14,fontWeight:700,color:'#f43f5e'}}>+1,200 (0.42%)</p>
      </div>
      <div style={{flex:1,margin:'0 20px 12px',background:'#f8fafc',borderRadius:24,display:'flex',alignItems:'center',justifyContent:'center',border:'1px dashed #e2e8f0'}}>
        <p style={{color:'#cbd5e1',fontWeight:700,fontSize:13,textAlign:'center'}}>캔들 차트 영역<br/>{stock.ticker} · {stock.exchange}</p>
      </div>
      <div style={{padding:'0 16px 16px',display:'flex',gap:12}}>
        <button onClick={()=>setOrderOpen(true)} style={{flex:1,height:54,background:'#f43f5e',color:'#fff',border:'none',borderRadius:16,fontWeight:900,fontSize:16,cursor:'pointer',boxShadow:'0 8px 20px rgba(244,63,94,.3)'}}>구매하기</button>
        <button style={{flex:1,height:54,background:'#2563eb',color:'#fff',border:'none',borderRadius:16,fontWeight:900,fontSize:16,cursor:'pointer',boxShadow:'0 8px 20px rgba(37,99,235,.3)'}}>판매하기</button>
      </div>
      {listening && <ListeningOverlay transcript={transcript} stop={()=>{}}/>}
      {orderOpen && <OrderPopup stock={stock} onClose={()=>setOrderOpen(false)} onConfirm={()=>{ setOrderOpen(false); setBioOpen(true); }}/>}
      {bioOpen   && <BioPopup onClose={()=>setBioOpen(false)}/>}
    </div>
  );

  // ── 홈 화면 ────────────────────────────────────────────────
  const domestic = stocks.filter(s=>s.type==='domestic');
  const overseas = stocks.filter(s=>s.type==='overseas');

  return (
    <div style={{width:360,height:800,background:'#fff',fontFamily:'-apple-system,BlinkMacSystemFont,"Noto Sans KR",sans-serif',display:'flex',flexDirection:'column',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,.2)',border:'1px solid #e2e8f0'}}>
      {/* 티커 */}
      <div style={{background:'#F2F4F7',height:36,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',borderBottom:'1px solid #e2e8f0',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:6,height:6,background:'#f43f5e',borderRadius:'50%'}}/><span style={{fontSize:10,fontWeight:700,color:'#475569'}}>🇰🇷 한국 정규장 운영 중</span></div>
        <span style={{fontSize:10,fontWeight:700,color:'#94a3b8'}}>15:30 종료</span>
      </div>

      {/* 헤더 */}
      <header style={{padding:'40px 20px 24px',background:'#fff',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <span style={{fontSize:11,fontWeight:900,letterSpacing:'2px',color:'#94a3b8',textTransform:'uppercase'}}>내 자산 현황</span>
          <div style={{display:'flex',gap:16,color:'#94a3b8'}}><Ico name="search" size={20}/><Ico name="bell" size={20} badge={true}/></div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:4}}>
          <h2 style={{fontSize:30,fontWeight:900,color:'#0f172a',letterSpacing:'-1px'}}>281,059,700원</h2>
          <Ico name="chevRight" size={24} color="#e2e8f0"/>
        </div>
        <p style={{fontSize:14,fontWeight:700,color:'#f43f5e'}}>+60,620,720원 (27.5%) 오늘</p>
      </header>

      {/* 스크롤 영역 */}
      <div style={{flex:1,overflowY:'auto',scrollbarWidth:'none'}}>

        {/* ── 국내주식 ── */}
        <section style={{padding:'0 20px 8px'}}>
          {/* ✅ FIX1: '편집' → 현재가/평가금 토글 */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <span style={{fontSize:13,fontWeight:900,color:'#1e293b'}}>국내주식</span>
            <div style={{display:'flex',background:'#f1f5f9',padding:3,borderRadius:12}}>
              {['현재가','평가금'].map(m=>(
                <button key={m} onClick={()=>setPriceMode(m)} style={{
                  padding:'5px 12px',borderRadius:9,border:'none',cursor:'pointer',fontSize:10,fontWeight:900,transition:'all .18s',
                  background: priceMode===m ? '#fff' : 'transparent',
                  color: priceMode===m ? '#0f172a' : '#94a3b8',
                  boxShadow: priceMode===m ? '0 1px 4px rgba(0,0,0,.1)' : 'none',
                }}>{m}</button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {domestic.map(s=>(
              <div key={s.id} onClick={()=>{ setStockId(s.id); setView('chart'); }}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <StockLogo logoKey={s.logoKey} logoUrl={s.logoUrl} name={s.name} size={40}/>
                  <div>
                    <p style={{fontSize:15,fontWeight:900,color:'#1e293b'}}>{s.name}</p>
                    <p style={{fontSize:11,fontWeight:700,color:'#94a3b8'}}>{s.shareCount.toLocaleString()}주</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:15,fontWeight:900,color:'#1e293b'}}>{displayVal(s)}</p>
                  <p style={{fontSize:11,fontWeight:700,color:s.profitRate>=0?'#f43f5e':'#3b82f6'}}>{s.profitRate>=0?'+':''}{s.profitRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{height:10,background:'#f8fafc',margin:'12px 0'}}/>

        {/* ✅ FIX2: 해외주식 복구 */}
        <section style={{padding:'0 20px 8px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <span style={{color:'#94a3b8',display:'flex'}}><Ico name="globe" size={16}/></span>
              <span style={{fontSize:13,fontWeight:900,color:'#1e293b'}}>해외주식</span>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:'#cbd5e1',background:'#f8fafc',padding:'3px 10px',borderRadius:999}}>
              {priceMode}
            </span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:20}}>
            {overseas.map(s=>(
              <div key={s.id} onClick={()=>{ setStockId(s.id); setView('chart'); }}
                style={{display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer'}}>
                <div style={{display:'flex',alignItems:'center',gap:16}}>
                  <StockLogo logoUrl={s.logoUrl} name={s.name} size={40}/>
                  <div>
                    <p style={{fontSize:15,fontWeight:900,color:'#1e293b'}}>{s.name}</p>
                    <p style={{fontSize:11,fontWeight:700,color:'#94a3b8'}}>{s.shareCount.toLocaleString()}주</p>
                  </div>
                </div>
                <div style={{textAlign:'right'}}>
                  <p style={{fontSize:15,fontWeight:900,color:'#1e293b'}}>{displayVal(s)}</p>
                  <p style={{fontSize:11,fontWeight:700,color:s.profitRate>=0?'#f43f5e':'#3b82f6'}}>{s.profitRate>=0?'+':''}{s.profitRate}%</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{height:10,background:'#f8fafc',margin:'12px 0'}}/>

        {/* 시장종합 */}
        <section style={{padding:'0 20px 80px'}}>
          <h3 style={{fontSize:16,fontWeight:900,color:'#1e293b',marginBottom:20}}>시장종합</h3>
          <div style={{display:'flex',gap:8,overflowX:'auto',scrollbarWidth:'none',marginBottom:20}}>
            {Object.keys(MARKET_DATA).map(tab=>(
              <button key={tab} onClick={()=>setMarketTab(tab)} style={{
                flexShrink:0,padding:'6px 16px',borderRadius:999,fontSize:11,fontWeight:900,border:'none',cursor:'pointer',transition:'all .2s',
                background:marketTab===tab?'#0f172a':'#f8fafc', color:marketTab===tab?'#fff':'#94a3b8',
                boxShadow:marketTab===tab?'0 4px 12px rgba(0,0,0,.18)':'none',
              }}>{tab}</button>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {MARKET_DATA[marketTab].map((item,i)=>(
              <div key={i} style={{background:'#f8fafc',padding:16,borderRadius:16,border:'1px solid #f1f5f9'}}>
                <p style={{fontSize:10,fontWeight:700,color:'#94a3b8',marginBottom:4}}>{item.name}</p>
                <p style={{fontSize:16,fontWeight:900,color:'#1e293b',letterSpacing:'-0.5px'}}>{item.value}</p>
                <span style={{fontSize:11,fontWeight:700,color:item.rate.startsWith('+')?'#f43f5e':item.rate.startsWith('-')?'#3b82f6':'#94a3b8'}}>{item.rate}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* 하단 네비 */}
      <nav style={{height:70,background:'#fff',borderTop:'1px solid #f1f5f9',display:'flex',alignItems:'center',justifyContent:'space-around',padding:'0 8px',flexShrink:0,position:'relative'}}>
        <NavBtn icon="grid"     label="증권"   active={view==='home'}     onClick={()=>setView('home')}/>
        <NavBtn icon="calendar" label="배당금" active={view==='dividend'} color={HANWHA_ORANGE} onClick={()=>setView('dividend')}/>
        <div style={{position:'relative',bottom:20}}>
          <button onClick={start} style={{width:56,height:56,borderRadius:'50%',background:HANWHA_ORANGE,border:'4px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 8px 24px rgba(243,115,33,.4)`}}>
            <Ico name="mic" size={28} color="#fff"/>
          </button>
        </div>
        <NavBtn icon="compass" label="발견" active={false} onClick={()=>{}}/>
        <NavBtn icon="msg"     label="피드"  active={false} onClick={()=>{}}/>
      </nav>

      {listening && <ListeningOverlay transcript={transcript} stop={()=>{}}/>}
      {orderOpen && <OrderPopup stock={stock} onClose={()=>setOrderOpen(false)} onConfirm={()=>{ setOrderOpen(false); setBioOpen(true); }}/>}
      {bioOpen   && <BioPopup onClose={()=>setBioOpen(false)}/>}
      {divPopup  && <DivDetailPopup onClose={()=>setDivPopup(false)}/>}
    </div>
  );
};

// ─── 서브 컴포넌트 ────────────────────────────────────────────
const NavBtn = ({icon,label,active,color,onClick}) => (
  <button onClick={onClick} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,background:'none',border:'none',cursor:'pointer',color:active?(color||'#0f172a'):'#cbd5e1'}}>
    <Ico name={icon} size={20} color={active?(color||'#0f172a'):'#cbd5e1'}/>
    <span style={{fontSize:9,fontWeight:900}}>{label}</span>
  </button>
);

const ListeningOverlay = ({transcript}) => (
  <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,.97)',backdropFilter:'blur(12px)',zIndex:100,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:32}}>
    <div style={{width:80,height:80,borderRadius:'50%',background:HANWHA_ORANGE,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:32,boxShadow:`0 12px 32px rgba(243,115,33,.4)`,position:'relative'}}>
      <Ico name="mic" size={36} color="#fff"/>
      <div style={{position:'absolute',inset:0,borderRadius:'50%',background:HANWHA_ORANGE,opacity:.2,animation:'ping 1s infinite'}}/>
    </div>
    <h3 style={{fontSize:20,fontWeight:900,marginBottom:8}}>오렌지니가 듣고 있어요</h3>
    <p style={{color:HANWHA_ORANGE,fontWeight:900,fontSize:18,textAlign:'center',fontStyle:'italic',marginBottom:16}}>"{transcript||'명령을 기다리고 있습니다'}"</p>
    <p style={{color:'#94a3b8',fontSize:13,textAlign:'center',lineHeight:1.6}}>배당금 조회, 주식 매수/매도,<br/>차트 확인 등 무엇이든 말씀하세요.</p>
    <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
  </div>
);

const OrderPopup = ({stock, onClose, onConfirm}) => (
  <div style={{position:'absolute',inset:0,zIndex:200,display:'flex',alignItems:'flex-end'}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.7)'}}/>
    <div style={{width:'100%',background:'#fff',borderRadius:'48px 48px 0 0',padding:'32px 32px 48px',position:'relative',boxShadow:'0 -8px 40px rgba(0,0,0,.15)'}}>
      <div style={{width:48,height:4,background:'#e2e8f0',borderRadius:2,margin:'0 auto 32px'}}/>
      <div style={{display:'flex',alignItems:'center',gap:16,marginBottom:24}}>
        <StockLogo logoKey={stock.logoKey} logoUrl={stock.logoUrl} name={stock.name} size={50}/>
        <div>
          <h3 style={{fontSize:20,fontWeight:900}}>{stock.name}</h3>
          <p style={{fontSize:13,color:'#94a3b8',fontWeight:700}}>현재가 {stock.type==='overseas'?`$${stock.currentPrice.toFixed(2)}`:`${stock.currentPrice.toLocaleString()}원`}</p>
        </div>
      </div>
      <div style={{background:'#f8fafc',borderRadius:24,padding:24,marginBottom:32}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}><span style={{color:'#94a3b8',fontWeight:700}}>주문수량</span><span style={{fontWeight:900}}>10주</span></div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #e2e8f0',paddingTop:16}}>
          <span style={{color:'#94a3b8',fontWeight:700}}>총 주문금액</span>
          <span style={{fontSize:20,fontWeight:900,color:'#f43f5e'}}>{stock.type==='overseas'?`$${(stock.currentPrice*10).toFixed(2)}`:`${(stock.currentPrice*10).toLocaleString()}원`}</span>
        </div>
      </div>
      <button onClick={onConfirm} style={{width:'100%',height:64,background:'#f43f5e',color:'#fff',border:'none',borderRadius:20,fontWeight:900,fontSize:17,cursor:'pointer',boxShadow:'0 12px 24px rgba(244,63,94,.3)'}}>주문하기</button>
    </div>
  </div>
);

const BioPopup = ({onClose}) => (
  <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
    <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.82)',backdropFilter:'blur(4px)'}}/>
    <div style={{width:'100%',background:'#fff',borderRadius:40,padding:36,position:'relative',textAlign:'center',boxShadow:'0 32px 80px rgba(0,0,0,.3)'}}>
      <div style={{width:80,height:80,background:'#eff6ff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 24px',color:'#2563eb',boxShadow:'0 0 0 12px rgba(37,99,235,.08)'}}>
        <Ico name="finger" size={40} color="#2563eb"/>
      </div>
      <h3 style={{fontSize:20,fontWeight:900,marginBottom:8}}>생체 인증</h3>
      <p style={{fontSize:13,color:'#94a3b8',fontWeight:700,lineHeight:1.6,marginBottom:32}}>등록된 지문으로 안전하게<br/>주문을 완료합니다.</p>
      <button onClick={onClose} style={{width:'100%',padding:'16px 0',background:'#2563eb',color:'#fff',border:'none',borderRadius:16,fontWeight:900,fontSize:15,cursor:'pointer',boxShadow:'0 8px 20px rgba(37,99,235,.3)'}}>인증 완료 ✓</button>
    </div>
  </div>
);

const DivDetailPopup = ({onClose}) => (
  <div style={{position:'absolute',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
    <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,.6)',backdropFilter:'blur(4px)'}}/>
    <div style={{width:'100%',background:'#fff',borderRadius:40,padding:32,position:'relative',boxShadow:'0 24px 60px rgba(0,0,0,.2)',overflow:'hidden'}}>
      <div style={{position:'absolute',top:0,right:0,width:128,height:128,background:'#fff7ed',borderRadius:'50%',transform:'translate(50%,-50%)'}}/>
      <h3 style={{fontSize:20,fontWeight:900,marginBottom:8}}>예상 배당금 상세</h3>
      <p style={{fontSize:13,color:'#94a3b8',fontWeight:700,lineHeight:1.6,marginBottom:24}}>보유 주식의 지난 배당 실적을 바탕으로<br/>계산된 올해 예상 수령액입니다.</p>
      <div style={{display:'flex',flexDirection:'column',gap:12,marginBottom:32}}>
        {[{name:'삼성전자 (12월)',amount:'482,000원'},{name:'한화투자증권 (12월)',amount:'360,000원'}].map((r,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'#f8fafc',borderRadius:16,padding:16}}>
            <span style={{fontSize:13,fontWeight:700,color:'#475569'}}>{r.name}</span>
            <span style={{fontWeight:900,color:HANWHA_ORANGE}}>{r.amount}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{width:'100%',padding:'16px 0',background:'#0f172a',color:'#fff',border:'none',borderRadius:16,fontWeight:900,fontSize:15,cursor:'pointer'}}>확인</button>
    </div>
  </div>
);

export default App;
