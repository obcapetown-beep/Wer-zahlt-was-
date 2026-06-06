import { useState, useEffect, useMemo, useRef } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore, collection, doc, onSnapshot,
  addDoc, deleteDoc, setDoc, getDocs
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAH574JePsJAaq3Am-jlQd525hcWcEzpFg",
  authDomain: "reisekasse-oltatoju.firebaseapp.com",
  projectId: "reisekasse-oltatoju",
  storageBucket: "reisekasse-oltatoju.firebasestorage.app",
  messagingSenderId: "85584453814",
  appId: "1:85584453814:web:1016ed2e47d017659e8617",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const DEFAULT_CURRENCIES = [
  { code: "EUR", symbol: "€",  name: "Euro",                  rate: 1        },
  { code: "VND", symbol: "₫",  name: "Vietnamesischer Dong",  rate: 0.000038 },
  { code: "ZAR", symbol: "R",  name: "Südafrik. Rand",        rate: 0.051    },
  { code: "PLN", symbol: "zł", name: "Polnischer Zloty",      rate: 0.232    },
  { code: "USD", symbol: "$",  name: "US-Dollar",             rate: 0.92     },
  { code: "GBP", symbol: "£",  name: "Britisches Pfund",      rate: 1.17     },
  { code: "THB", symbol: "฿",  name: "Thaibaht",              rate: 0.027    },
  { code: "JPY", symbol: "¥",  name: "Japanischer Yen",       rate: 0.006    },
  { code: "CHF", symbol: "Fr", name: "Schweizer Franken",     rate: 1.05     },
  { code: "CZK", symbol: "Kč", name: "Tschechische Krone",    rate: 0.040    },
  { code: "HUF", symbol: "Ft", name: "Ungarischer Forint",    rate: 0.0026   },
  { code: "NOK", symbol: "kr", name: "Norwegische Krone",     rate: 0.086    },
  { code: "SEK", symbol: "kr", name: "Schwedische Krone",     rate: 0.086    },
  { code: "DKK", symbol: "kr", name: "Dänische Krone",        rate: 0.134    },
  { code: "TRY", symbol: "₺",  name: "Türkische Lira",        rate: 0.028    },
  { code: "MXN", symbol: "$",  name: "Mexikanischer Peso",    rate: 0.052    },
  { code: "BRL", symbol: "R$", name: "Brasilianischer Real",  rate: 0.175    },
  { code: "AUD", symbol: "A$", name: "Australischer Dollar",  rate: 0.60     },
  { code: "CAD", symbol: "C$", name: "Kanadischer Dollar",    rate: 0.68     },
  { code: "SGD", symbol: "S$", name: "Singapur-Dollar",       rate: 0.68     },
  { code: "IDR", symbol: "Rp", name: "Indonesische Rupiah",   rate: 0.000060 },
  { code: "MYR", symbol: "RM", name: "Malaysischer Ringgit",  rate: 0.21     },
  { code: "PHP", symbol: "₱",  name: "Philippinischer Peso",  rate: 0.016    },
  { code: "KRW", symbol: "₩",  name: "Südkoreanischer Won",   rate: 0.00068  },
  { code: "INR", symbol: "₹",  name: "Indische Rupie",        rate: 0.011    },
  { code: "EGP", symbol: "£",  name: "Ägyptisches Pfund",     rate: 0.019    },
  { code: "MAD", symbol: "د.م", name: "Marokkanischer Dirham", rate: 0.093   },
  { code: "HRK", symbol: "kn", name: "Kroatische Kuna",       rate: 0.133    },
  { code: "RON", symbol: "lei",name: "Rumänischer Leu",       rate: 0.201    },
];

const SEED_TRIPS = [
  { id: "vietnam",    name: "Vietnam 🇻🇳",         currency: "VND", family1: "Graben", family2: "Bergmann", order: 0 },
  { id: "suedafrika", name: "Südafrika 🇿🇦",        currency: "ZAR", family1: "Graben", family2: "Bergmann", order: 1 },
  { id: "polen",      name: "Polen & Baltikum 🇵🇱", currency: "PLN", family1: "Graben", family2: "Bergmann", order: 2 },
];

const SEED_ENTRIES = {
  vietnam: [
    {desc:"Bus",payer:"Graben",amount:80},{desc:"Abendessen",payer:"Graben",amount:560},{desc:"Coconut",payer:"Graben",amount:250},{desc:"Pizza",payer:"Graben",amount:2800},{desc:"Auto",payer:"Graben",amount:1000},{desc:"Frühstück",payer:"Graben",amount:1150},{desc:"Essen Strand",payer:"Graben",amount:390},{desc:"Essen Red Snapper",payer:"Graben",amount:1030},{desc:"Essen Kinder Strand",payer:"Graben",amount:320},{desc:"Frühstück",payer:"Graben",amount:1100},{desc:"Roller",payer:"Graben",amount:100},{desc:"Tanken",payer:"Graben",amount:620},{desc:"Pepper",payer:"Graben",amount:200},{desc:"Abendessen",payer:"Graben",amount:1300},{desc:"Roller",payer:"Graben",amount:500},{desc:"Flug Gebühr",payer:"Graben",amount:756},{desc:"Pepper",payer:"Graben",amount:400},{desc:"Frühstück",payer:"Graben",amount:1200},{desc:"Übernachtung Hoi An",payer:"Graben",amount:5900},{desc:"Einkauf Hoi An",payer:"Graben",amount:720},{desc:"Essen Hoi An",payer:"Graben",amount:2400},{desc:"Einkauf",payer:"Graben",amount:1400},{desc:"Hoi An",payer:"Graben",amount:335},{desc:"Hoi An",payer:"Graben",amount:40},{desc:"Frühstück und Obst",payer:"Graben",amount:470},{desc:"Abendessen Nachbar",payer:"Graben",amount:700},{desc:"Tanken Roller",payer:"Graben",amount:280},{desc:"Bier",payer:"Graben",amount:160},{desc:"Scooter",payer:"Graben",amount:500},{desc:"Essen An Ban",payer:"Graben",amount:680},{desc:"Abendessen",payer:"Graben",amount:1400},{desc:"Croissants",payer:"Graben",amount:420},{desc:"Einkauf Hoi An",payer:"Graben",amount:1200},{desc:"Essen Hue",payer:"Graben",amount:1300},{desc:"T-Shirt",payer:"Graben",amount:500},{desc:"Smoothies",payer:"Graben",amount:270},{desc:"Scooter",payer:"Graben",amount:300},{desc:"Bach Ma Auto",payer:"Graben",amount:160},{desc:"Pizza",payer:"Graben",amount:895},{desc:"Bach Ma Kekse, Wasser",payer:"Graben",amount:90},{desc:"Croissant Brot Sonntag",payer:"Graben",amount:460},{desc:"Essen Hue nach Bach Ma",payer:"Graben",amount:1100},{desc:"Fahrrad",payer:"Graben",amount:80},{desc:"Cocktails",payer:"Graben",amount:840},{desc:"Bach Ma Auto",payer:"Graben",amount:100},{desc:"Einkauf Ninh Binh",payer:"Graben",amount:350},{desc:"Eintritt",payer:"Graben",amount:340},{desc:"Smoothies am Fluss",payer:"Graben",amount:700},{desc:"Getränke",payer:"Graben",amount:268},{desc:"Abendessen Hotpot",payer:"Graben",amount:1600},{desc:"Kaffee Halong",payer:"Graben",amount:770},{desc:"Essen Halong",payer:"Graben",amount:1300},{desc:"Getränke Hafen",payer:"Graben",amount:360},{desc:"Drinks Boot",payer:"Graben",amount:460},{desc:"Bier Boot",payer:"Graben",amount:200},{desc:"Getränke Inseln",payer:"Graben",amount:360},{desc:"Essen Hanoi",payer:"Graben",amount:1400},{desc:"Fahrt nach Halong",payer:"Graben",amount:300},{desc:"Trainstreet",payer:"Graben",amount:500},{desc:"Frühstück",payer:"Graben",amount:700},{desc:"Cocktail",payer:"Graben",amount:1100},{desc:"Harry Potter Cafe",payer:"Graben",amount:485},{desc:"Abendessen",payer:"Graben",amount:1200},{desc:"Moon Cactus",payer:"Graben",amount:5515},{desc:"Abendessen",payer:"Graben",amount:500},
    {desc:"Essen",payer:"Bergmann",amount:610},{desc:"Bier",payer:"Bergmann",amount:150},{desc:"Starbucks",payer:"Bergmann",amount:535},{desc:"Fahrt",payer:"Bergmann",amount:800},{desc:"Auto",payer:"Bergmann",amount:800},{desc:"Wäscherei",payer:"Bergmann",amount:400},{desc:"Frühstück",payer:"Bergmann",amount:1100},{desc:"Abendessen",payer:"Bergmann",amount:1370},{desc:"Flug Gebühr",payer:"Bergmann",amount:65},{desc:"Frühstück",payer:"Bergmann",amount:100},{desc:"Übernachtung Phu Quoc",payer:"Bergmann",amount:5260},{desc:"Bus Da Nang Airport",payer:"Bergmann",amount:450},{desc:"Übernachtung Da Nang",payer:"Bergmann",amount:4500},{desc:"Scooter",payer:"Bergmann",amount:720},
  ],
  suedafrika: [
    {desc:"Flug JHB to CPT",payer:"Graben",amount:730},{desc:"Flug CPT to JHB",payer:"Graben",amount:585},{desc:"Auto",payer:"Graben",amount:390},{desc:"Haus",payer:"Graben",amount:500},{desc:"Spar",payer:"Graben",amount:30},{desc:"Tops Getränke",payer:"Graben",amount:130},{desc:"Tops Getränke",payer:"Graben",amount:56},
    {desc:"Einkauf Frühstück",payer:"Bergmann",amount:54},{desc:"Einkauf Grillen",payer:"Bergmann",amount:55},{desc:"Einkauf Foodlovers",payer:"Bergmann",amount:114},{desc:"Einkauf Spar",payer:"Bergmann",amount:17},{desc:"Woolies",payer:"Bergmann",amount:118},{desc:"Dunes",payer:"Bergmann",amount:79},{desc:"Ostersachen",payer:"Bergmann",amount:25},
  ],
  polen: [
    {desc:"Übernachtung 1",payer:"Graben",amount:71},{desc:"Einkauf",payer:"Graben",amount:140},{desc:"Camping Leba",payer:"Graben",amount:145},{desc:"Camping Danzig",payer:"Graben",amount:55},{desc:"Einkauf Lidl 1",payer:"Graben",amount:84},{desc:"Räder",payer:"Graben",amount:17},{desc:"Einkauf Lidl nach Danzig",payer:"Graben",amount:217},{desc:"Leba Kebap",payer:"Graben",amount:73},{desc:"Bootsfahrt",payer:"Graben",amount:93},{desc:"Einkauf Lidl Ilawa",payer:"Graben",amount:66},{desc:"Camping Ilawa",payer:"Graben",amount:368},{desc:"Camping Natur",payer:"Graben",amount:100},{desc:"Essen",payer:"Graben",amount:130},{desc:"Frühstück Kinder",payer:"Graben",amount:40},{desc:"Essen Kaunas",payer:"Graben",amount:85},{desc:"Lidl",payer:"Graben",amount:110},{desc:"Wohnung Kaunas",payer:"Graben",amount:115},{desc:"Penny Gauting",payer:"Graben",amount:97},{desc:"Essen Riga",payer:"Graben",amount:175},{desc:"Einkauf vor Strand",payer:"Graben",amount:32},{desc:"Camping Kolka",payer:"Graben",amount:85},{desc:"Einkauf Kuldiga",payer:"Graben",amount:70},{desc:"Einkauf nach Strand",payer:"Graben",amount:105},{desc:"Einkauf",payer:"Graben",amount:43},{desc:"Ljepaja Snacks",payer:"Graben",amount:40},{desc:"Kaffee Fähre",payer:"Graben",amount:30},{desc:"Brötchen HH",payer:"Graben",amount:28},{desc:"Camping Rügen",payer:"Graben",amount:56},
    {desc:"Übernachtung 1",payer:"Bergmann",amount:46},{desc:"Camping 1",payer:"Bergmann",amount:80},{desc:"Camping Leba",payer:"Bergmann",amount:84},{desc:"Kebap",payer:"Bergmann",amount:20},{desc:"Einkauf Oli & Tom",payer:"Bergmann",amount:91},{desc:"Erster Einkauf",payer:"Bergmann",amount:100},{desc:"Bier Tretboot",payer:"Bergmann",amount:14},{desc:"Einkauf Fisch Wasser",payer:"Bergmann",amount:20},{desc:"Essen + Firewood",payer:"Bergmann",amount:25},{desc:"Bäckerei",payer:"Bergmann",amount:11},{desc:"Camping Kuldiga",payer:"Bergmann",amount:90},{desc:"Einkauf vor Fähre",payer:"Bergmann",amount:60},
  ],
};

async function seedIfEmpty() {
  const snap = await getDocs(collection(db, "trips"));
  if (!snap.empty) return;
  for (const t of SEED_TRIPS) {
    await setDoc(doc(db, "trips", t.id), { name: t.name, currency: t.currency, family1: t.family1, family2: t.family2, order: t.order });
    for (const e of (SEED_ENTRIES[t.id] || [])) {
      await addDoc(collection(db, "trips", t.id, "entries"), { ...e, createdAt: Date.now() });
    }
  }
}

function getCur(code, rates) {
  const base = DEFAULT_CURRENCIES.find(c => c.code === code) || DEFAULT_CURRENCIES[0];
  return { ...base, rate: rates[code] ?? base.rate };
}
function fmtEuro(n) { return n.toLocaleString("de-DE",{minimumFractionDigits:2,maximumFractionDigits:2})+" €"; }
function fmtNum(n)  { return n.toLocaleString("de-DE",{maximumFractionDigits:0}); }

// Convert entry amount to EUR — supports both old format (tripCurrency) and new format (amountEur stored)
function entryToEur(entry, tripCurrency, rates) {
  if (entry.amountEur !== undefined) return entry.amountEur;
  // legacy: amount is in trip's native currency
  const base = DEFAULT_CURRENCIES.find(c => c.code === tripCurrency) || DEFAULT_CURRENCIES[0];
  const rate = rates[tripCurrency] ?? base.rate;
  return entry.amount * rate;
}

export default function App() {
  const [trips, setTrips]             = useState([]);
  const [entries, setEntries]         = useState({});
  const [activeIdx, setActiveIdx]     = useState(0);
  const [loading, setLoading]         = useState(true);
  const [syncDot, setSyncDot]         = useState(false);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [view, setView]               = useState("home"); // "home" | "table" | "newtrip"
  const [rates, setRates]             = useState(Object.fromEntries(DEFAULT_CURRENCIES.map(c=>[c.code,c.rate])));
  const [editRates, setEditRates]     = useState(false);
  const [newName, setNewName]         = useState("");
  const [newCur, setNewCur]           = useState("EUR");
  const [newF1, setNewF1]             = useState("");
  const [newF2, setNewF2]             = useState("");
  const [newDesc, setNewDesc]         = useState("");
  const [newAmt, setNewAmt]           = useState("");
  const [newPayer, setNewPayer]       = useState("f1");
  const [entryCurrency, setEntryCurrency] = useState("EUR");  // currency chosen for each new entry
  const initialized = useRef(false);

  // ── Fetch live exchange rates on startup ──
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/EUR")
      .then(r => r.json())
      .then(data => {
        if (data.result === "success" && data.rates) {
          const newRates = { EUR: 1 };
          DEFAULT_CURRENCIES.forEach(c => {
            if (c.code !== "EUR" && data.rates[c.code]) {
              newRates[c.code] = 1 / data.rates[c.code]; // 1 unit of currency → EUR
            }
          });
          setRates(prev => ({ ...prev, ...newRates }));
          setRatesLoaded(true);
        }
      })
      .catch(() => {}); // silently fall back to hardcoded defaults
  }, []);

  // ── Load trips from Firebase ──
  useEffect(() => {
    seedIfEmpty().then(() => {
      onSnapshot(collection(db, "trips"), snap => {
        const t = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.order??0)-(b.order??0));
        setTrips(t);
        // On first load: auto-select the newest trip (highest order = last in sorted array)
        if (!initialized.current && t.length > 0) {
          setActiveIdx(t.length - 1);
          initialized.current = true;
        }
        setLoading(false);
        flash();
      });
    });
  }, []);

  useEffect(() => {
    if (!trips.length) return;
    const unsubs = trips.map(t =>
      onSnapshot(collection(db,"trips",t.id,"entries"), snap => {
        const es = snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(a.createdAt??0)-(b.createdAt??0));
        setEntries(prev=>({...prev,[t.id]:es})); flash();
      })
    );
    return () => unsubs.forEach(u=>u());
  }, [trips.map(t=>t.id).join(",")]);

  function flash() { setSyncDot(true); setTimeout(()=>setSyncDot(false),800); }

  const trip        = trips[activeIdx] || null;
  const tripEntries = trip ? (entries[trip.id]||[]) : [];
  const cur         = trip ? getCur(trip.currency, rates) : DEFAULT_CURRENCIES[0];
  const entryCur    = getCur(entryCurrency, rates);

  const stats = useMemo(() => {
    if (!trip) return null;
    let t1=0, t2=0;
    tripEntries.forEach(e=>{
      const eur = entryToEur(e, trip.currency, rates);
      if (e.payer===trip.family1) t1+=eur; else t2+=eur;
    });
    const total=t1+t2, diff1Euro=t1-total/2;
    return {t1,t2,total,diff1Euro};
  }, [trip, tripEntries, rates]);

  async function addEntry() {
    if (!newDesc.trim()||!newAmt||!trip) return;
    const payer = newPayer==="f1" ? trip.family1 : trip.family2;
    const amount = parseFloat(newAmt);
    const amountEur = amount * entryCur.rate;
    await addDoc(collection(db,"trips",trip.id,"entries"),{
      desc: newDesc.trim(),
      payer,
      amount,
      currency: entryCurrency,
      amountEur,
      createdAt: Date.now()
    });
    setNewDesc(""); setNewAmt("");
    // keep entryCurrency as-is so user doesn't have to re-select every time
  }

  async function deleteEntry(tripId, entryId) {
    await deleteDoc(doc(db,"trips",tripId,"entries",entryId));
  }

  async function addTrip() {
    if (!newName.trim()||!newF1.trim()||!newF2.trim()) return;
    const id = newName.toLowerCase().replace(/[^a-z0-9]/g,"_")+"_"+Date.now();
    await setDoc(doc(db,"trips",id),{name:newName.trim(),currency:newCur,family1:newF1.trim(),family2:newF2.trim(),order:trips.length});
    setActiveIdx(trips.length); setView("home"); setNewName(""); setNewF1(""); setNewF2("");
  }

  async function deleteTrip(tripId) {
    if (trips.length<=1) return;
    const snap = await getDocs(collection(db,"trips",tripId,"entries"));
    await Promise.all(snap.docs.map(d=>deleteDoc(d.ref)));
    await deleteDoc(doc(db,"trips",tripId));
    setActiveIdx(0);
  }

  const debtor   = stats&&stats.diff1Euro>0 ? trip?.family2 : trip?.family1;
  const creditor = stats&&stats.diff1Euro>0 ? trip?.family1 : trip?.family2;
  const debtEuro = stats ? Math.abs(stats.diff1Euro) : 0;
  const f1Entries = tripEntries.filter(e=>trip&&e.payer===trip.family1);
  const f2Entries = tripEntries.filter(e=>trip&&e.payer!==trip.family1);

  const BG   = "linear-gradient(160deg,#0a1520 0%,#152030 60%,#0a1520 100%)";
  const GOLD = "#d4af37";
  const inp  = { width:"100%", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(212,175,55,0.25)", borderRadius:12, color:"#f0e4c8", padding:"14px 16px", fontSize:17, fontFamily:"inherit", boxSizing:"border-box" };
  const lbl  = { display:"block", fontSize:11, letterSpacing:2, color:"#7a6a5a", textTransform:"uppercase", marginBottom:8 };

  // Currency picker: EUR always first, then trip's native currency (if different), then all others
  const currencyOptions = [
    DEFAULT_CURRENCIES[0], // EUR
    ...(trip && trip.currency !== "EUR" ? [getCur(trip.currency, rates)] : []),
    ...DEFAULT_CURRENCIES.filter(c => c.code !== "EUR" && (!trip || c.code !== trip.currency)),
  ];

  if (loading) return (
    <div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:20,fontFamily:"Georgia,serif"}}>
      <div style={{fontSize:48}}>✈️</div>
      <div style={{color:GOLD,fontSize:18,letterSpacing:2}}>Verbinde…</div>
    </div>
  );

  // ── NEW TRIP VIEW ──
  if (view==="newtrip") return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:"#f0e4c8",padding:24}}>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:GOLD,fontSize:28,cursor:"pointer",padding:0}}>←</button>
        <div style={{fontSize:22,fontWeight:"bold",color:"#f5e6c8"}}>Neuer Urlaub</div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:20,maxWidth:480,margin:"0 auto"}}>
        <div><label style={lbl}>Name</label><input placeholder="Griechenland 🇬🇷" value={newName} onChange={e=>setNewName(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Landeswährung</label>
          <select value={newCur} onChange={e=>setNewCur(e.target.value)} style={inp}>
            {DEFAULT_CURRENCIES.map(c=><option key={c.code} value={c.code}>{c.code} – {c.name} ({c.symbol})</option>)}
          </select>
        </div>
        <div><label style={lbl}>Familie 1</label><input placeholder="Graben" value={newF1} onChange={e=>setNewF1(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Familie 2</label><input placeholder="Bergmann" value={newF2} onChange={e=>setNewF2(e.target.value)} style={inp}/></div>
        <button onClick={addTrip} style={{background:`linear-gradient(135deg,${GOLD},#b8962e)`,border:"none",borderRadius:14,color:"#0a1520",fontWeight:"bold",fontSize:18,padding:"16px",cursor:"pointer",fontFamily:"inherit",marginTop:8}}>
          Urlaub erstellen
        </button>
      </div>
    </div>
  );

  // ── TABLE VIEW ──
  if (view==="table") return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:"#f0e4c8"}}>
      {/* Header */}
      <div style={{background:"rgba(0,0,0,0.4)",borderBottom:`1px solid rgba(212,175,55,0.2)`,padding:"16px 20px",display:"flex",alignItems:"center",gap:16,position:"sticky",top:0,zIndex:10}}>
        <button onClick={()=>setView("home")} style={{background:"none",border:"none",color:GOLD,fontSize:26,cursor:"pointer",padding:0}}>←</button>
        <div style={{flex:1}}>
          <div style={{fontSize:11,letterSpacing:3,color:GOLD,textTransform:"uppercase"}}>Übersicht</div>
          <div style={{fontSize:18,fontWeight:"bold",color:"#f5e6c8"}}>{trip?.name}</div>
        </div>
        <span style={{width:8,height:8,borderRadius:"50%",background:syncDot?"#4caf50":"#1a4a2a",display:"inline-block",transition:"background 0.4s"}}/>
      </div>

      {/* Trip selector */}
      <div style={{display:"flex",overflowX:"auto",padding:"0 16px",background:"rgba(0,0,0,0.2)",borderBottom:"1px solid rgba(212,175,55,0.15)"}}>
        {trips.map((t,i)=>(
          <div key={t.id} onClick={()=>setActiveIdx(i)}
            style={{padding:"12px 16px",cursor:"pointer",fontSize:14,borderBottom:i===activeIdx?`2px solid ${GOLD}`:"2px solid transparent",color:i===activeIdx?GOLD:"#6a5a4a",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:8}}>
            {t.name}
            {trips.length>1&&<span onClick={e=>{e.stopPropagation();if(window.confirm(`„${t.name}" löschen?`))deleteTrip(t.id)}} style={{fontSize:10,color:"#4a3a2a",cursor:"pointer"}}>✕</span>}
          </div>
        ))}
        <div onClick={()=>setView("newtrip")} style={{padding:"12px 16px",cursor:"pointer",fontSize:14,color:"#4a6a4a",whiteSpace:"nowrap"}}>+ Neu</div>
      </div>

      {trip&&stats&&(
        <div style={{padding:"16px 20px",maxWidth:800,margin:"0 auto"}}>
          {/* Summary — all values in EUR */}
          <div style={{background:"rgba(212,175,55,0.08)",border:`1px solid rgba(212,175,55,0.3)`,borderRadius:16,padding:"20px",marginBottom:20}}>
            <div style={{fontSize:10,letterSpacing:2,color:"#7a6a5a",textTransform:"uppercase",textAlign:"center",marginBottom:12}}>Alle Beträge in Euro</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:16}}>
              {[{label:trip.family1,val:stats.t1,color:"#5b9bd5"},{label:trip.family2,val:stats.t2,color:"#e8875a"},{label:"Gesamt",val:stats.total,color:GOLD}].map(s=>(
                <div key={s.label} style={{textAlign:"center"}}>
                  <div style={{fontSize:10,letterSpacing:2,color:"#7a6a5a",textTransform:"uppercase",marginBottom:4}}>{s.label}</div>
                  <div style={{fontSize:16,fontWeight:"bold",color:s.color}}>{fmtEuro(s.val)}</div>
                </div>
              ))}
            </div>
            <div style={{borderTop:"1px solid rgba(212,175,55,0.15)",paddingTop:14,textAlign:"center"}}>
              <span style={{color:"#e8875a",fontWeight:"bold",fontSize:16}}>{debtor}</span>
              <span style={{color:"#6a5a4a",margin:"0 10px",fontSize:16}}>schuldet</span>
              <span style={{color:"#5b9bd5",fontWeight:"bold",fontSize:16}}>{creditor}</span>
              <div style={{color:GOLD,fontSize:26,fontWeight:"bold",marginTop:4}}>{fmtEuro(debtEuro)}</div>
            </div>
          </div>

          {/* Wechselkurse */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>setEditRates(!editRates)} style={{background:"transparent",border:`1px solid rgba(212,175,55,0.2)`,borderRadius:10,color:GOLD,padding:"10px 16px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              {editRates?"✓ Kurse schließen":"⚙ Wechselkurse anpassen"}
            </button>
            {ratesLoaded && <span style={{fontSize:11,color:"#4a8a4a",letterSpacing:1}}>● Live-Kurse aktiv</span>}
          </div>
          {editRates&&(
            <div style={{background:"rgba(212,175,55,0.06)",border:`1px solid rgba(212,175,55,0.15)`,borderRadius:12,padding:"16px",marginBottom:16}}>
              <div style={{fontSize:10,letterSpacing:2,color:"#7a6a5a",textTransform:"uppercase",marginBottom:12}}>1 Einheit → € (lokal überschreibbar)</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:12}}>
                {DEFAULT_CURRENCIES.filter(c=>c.code!=="EUR").map(c=>(
                  <div key={c.code} style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{color:GOLD,fontSize:13,minWidth:36}}>{c.code}</span>
                    <input type="number" value={rates[c.code]} step="0.000001"
                      onChange={e=>setRates({...rates,[c.code]:parseFloat(e.target.value)||0})}
                      style={{...inp,width:90,fontSize:13,padding:"8px 10px"}}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Entry lists */}
          {[[trip.family1,f1Entries,"#5b9bd5"],[trip.family2,f2Entries,"#e8875a"]].map(([fam,ents,color])=>(
            <div key={fam} style={{background:"rgba(255,255,255,0.02)",border:`1px solid ${color}33`,borderRadius:14,overflow:"hidden",marginBottom:16}}>
              <div style={{background:`linear-gradient(90deg,${color}18,transparent)`,padding:"12px 18px",borderBottom:`1px solid ${color}22`,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontWeight:"bold",color,fontSize:16}}>{fam}</span>
                <span style={{color,fontSize:15}}>{fmtEuro(ents.reduce((s,e)=>s+entryToEur(e,trip.currency,rates),0))}</span>
              </div>
              {ents.map(e=>{
                const eurVal = entryToEur(e, trip.currency, rates);
                const showOrig = e.currency && e.currency !== "EUR";
                const origCur = e.currency ? getCur(e.currency, rates) : null;
                return (
                  <div key={e.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 18px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:14}}>
                    <span style={{color:"#c8b898",flex:1}}>{e.desc}</span>
                    <div style={{textAlign:"right",marginLeft:12}}>
                      {showOrig && <div style={{fontSize:11,color:"#6a5a4a"}}>{origCur?.symbol} {e.amount.toLocaleString("de-DE")}</div>}
                      <span style={{color:"#e8dcc8"}}>{fmtEuro(eurVal)}</span>
                    </div>
                    <button onClick={()=>deleteEntry(trip.id,e.id)} style={{background:"none",border:"none",color:"#4a3a2a",cursor:"pointer",marginLeft:10,fontSize:14,padding:"2px 6px"}}>✕</button>
                  </div>
                );
              })}
              {ents.length===0&&<div style={{padding:16,color:"#4a3a2a",textAlign:"center",fontSize:13}}>Keine Einträge</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ── HOME VIEW ──
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:"Georgia,serif",color:"#f0e4c8",display:"flex",flexDirection:"column"}}>

      {/* Top bar */}
      <div style={{background:"rgba(0,0,0,0.35)",borderBottom:`1px solid rgba(212,175,55,0.2)`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{fontSize:10,letterSpacing:4,color:GOLD,textTransform:"uppercase"}}>Reisekasse</div>
          <span style={{width:7,height:7,borderRadius:"50%",background:syncDot?"#4caf50":"#1a4a2a",display:"inline-block",transition:"background 0.4s"}}/>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>setView("newtrip")} style={{background:"transparent",border:`1px solid rgba(212,175,55,0.3)`,borderRadius:8,color:GOLD,padding:"8px 14px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Urlaub</button>
          <button onClick={()=>setView("table")} style={{background:`linear-gradient(135deg,${GOLD},#b8962e)`,border:"none",borderRadius:8,color:"#0a1520",padding:"8px 14px",fontSize:13,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit"}}>Übersicht</button>
        </div>
      </div>

      {/* Trip tabs — archived trips always accessible */}
      <div style={{display:"flex",overflowX:"auto",padding:"0 16px",background:"rgba(0,0,0,0.2)",borderBottom:"1px solid rgba(212,175,55,0.1)"}}>
        {trips.map((t,i)=>(
          <div key={t.id} onClick={()=>setActiveIdx(i)}
            style={{padding:"10px 16px",cursor:"pointer",fontSize:14,borderBottom:i===activeIdx?`2px solid ${GOLD}`:"2px solid transparent",color:i===activeIdx?GOLD:"#6a5a4a",whiteSpace:"nowrap",position:"relative"}}>
            {t.name}
            {/* Mark current trip (last) with a small dot */}
            {i===trips.length-1 && trips.length>1 && (
              <span style={{position:"absolute",top:6,right:4,width:5,height:5,borderRadius:"50%",background:"#4caf50"}}/>
            )}
          </div>
        ))}
      </div>

      {/* Main: big entry form */}
      {trip&&stats&&(
        <div style={{flex:1,padding:"28px 20px",maxWidth:560,margin:"0 auto",width:"100%",boxSizing:"border-box"}}>

          {/* Balance pill */}
          <div style={{background:"rgba(212,175,55,0.08)",border:`1px solid rgba(212,175,55,0.25)`,borderRadius:16,padding:"18px 20px",marginBottom:32,textAlign:"center"}}>
            <div style={{fontSize:11,letterSpacing:3,color:"#7a6a5a",textTransform:"uppercase",marginBottom:8}}>Aktueller Stand</div>
            <div style={{fontSize:16,marginBottom:4}}>
              <span style={{color:"#e8875a",fontWeight:"bold"}}>{debtor}</span>
              <span style={{color:"#6a5a4a",margin:"0 10px"}}>schuldet</span>
              <span style={{color:"#5b9bd5",fontWeight:"bold"}}>{creditor}</span>
            </div>
            <div style={{color:GOLD,fontSize:32,fontWeight:"bold"}}>{fmtEuro(debtEuro)}</div>
            {ratesLoaded && <div style={{fontSize:10,color:"#4a8a4a",marginTop:6,letterSpacing:1}}>● Live-Wechselkurse aktiv</div>}
          </div>

          {/* BIG entry form */}
          <div style={{display:"flex",flexDirection:"column",gap:18}}>
            <div>
              <label style={lbl}>Was wurde bezahlt?</label>
              <input
                placeholder="z.B. Abendessen"
                value={newDesc}
                onChange={e=>setNewDesc(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addEntry()}
                style={{...inp,fontSize:20,padding:"18px 20px"}}
                autoComplete="off"
              />
            </div>

            {/* Currency selector */}
            <div>
              <label style={lbl}>Währung</label>
              <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                {/* Quick toggle: EUR + trip native currency */}
                {[
                  DEFAULT_CURRENCIES[0],
                  ...(trip.currency !== "EUR" ? [getCur(trip.currency, rates)] : [])
                ].map(c => (
                  <button key={c.code} onClick={()=>setEntryCurrency(c.code)} style={{
                    padding:"10px 18px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", fontSize:15, fontWeight:"bold",
                    background: entryCurrency===c.code ? `linear-gradient(135deg,${GOLD},#b8962e)` : "rgba(255,255,255,0.06)",
                    border: `1.5px solid ${entryCurrency===c.code ? GOLD : "rgba(212,175,55,0.2)"}`,
                    color: entryCurrency===c.code ? "#0a1520" : "#c8a860",
                    transition:"all 0.15s"
                  }}>{c.symbol} {c.code}</button>
                ))}
                {/* "Andere" dropdown for more currencies */}
                <select
                  value={currencyOptions.slice(2).some(c=>c.code===entryCurrency) ? entryCurrency : ""}
                  onChange={e=>{ if(e.target.value) setEntryCurrency(e.target.value); }}
                  style={{...inp, width:"auto", padding:"10px 14px", fontSize:14, flex:"none",
                    border: currencyOptions.slice(2).some(c=>c.code===entryCurrency)
                      ? `1.5px solid ${GOLD}` : "1.5px solid rgba(212,175,55,0.2)",
                    color: currencyOptions.slice(2).some(c=>c.code===entryCurrency) ? GOLD : "#6a5a4a"
                  }}>
                  <option value="">Andere…</option>
                  {currencyOptions.slice(2).map(c=>(
                    <option key={c.code} value={c.code}>{c.code} – {c.name}</option>
                  ))}
                </select>
              </div>
              {entryCurrency !== "EUR" && (
                <div style={{fontSize:12,color:"#6a8a6a",letterSpacing:0.5}}>
                  1 {entryCurrency} = {(entryCur.rate).toFixed(6)} €
                  {ratesLoaded ? "  (Live-Kurs)" : "  (Schätzkurs)"}
                </div>
              )}
            </div>

            <div>
              <label style={lbl}>Betrag ({entryCur.symbol})</label>
              <input
                type="number"
                placeholder="0"
                value={newAmt}
                onChange={e=>setNewAmt(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&addEntry()}
                style={{...inp,fontSize:28,padding:"18px 20px",fontWeight:"bold",color:GOLD}}
              />
              {newAmt && entryCurrency !== "EUR" && (
                <div style={{fontSize:13,color:"#6a8a6a",marginTop:6}}>
                  ≈ {fmtEuro(parseFloat(newAmt) * entryCur.rate)}
                </div>
              )}
            </div>

            <div>
              <label style={lbl}>Bezahlt von</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                {["f1","f2"].map((v,i)=>{
                  const name = i===0 ? trip.family1 : trip.family2;
                  const sel = newPayer===v;
                  return (
                    <button key={v} onClick={()=>setNewPayer(v)} style={{
                      background: sel ? `linear-gradient(135deg,${i===0?"#2a4a7a":"#7a3a1a"},${i===0?"#1a3a6a":"#6a2a0a"})` : "rgba(255,255,255,0.04)",
                      border: sel ? `2px solid ${i===0?"#5b9bd5":"#e8875a"}` : "2px solid rgba(255,255,255,0.08)",
                      borderRadius:12, color: sel?(i===0?"#5b9bd5":"#e8875a"):"#6a5a4a",
                      padding:"16px",fontSize:18,fontWeight:"bold",cursor:"pointer",fontFamily:"inherit",
                      transition:"all 0.2s"
                    }}>{name}</button>
                  );
                })}
              </div>
            </div>
            <button onClick={addEntry} style={{
              background:`linear-gradient(135deg,${GOLD},#b8962e)`,
              border:"none",borderRadius:14,color:"#0a1520",
              fontWeight:"bold",fontSize:20,padding:"20px",
              cursor:"pointer",fontFamily:"inherit",marginTop:4,
              boxShadow:"0 4px 20px rgba(212,175,55,0.3)"
            }}>
              + Eintrag hinzufügen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
