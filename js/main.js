// CuraOS Website — PWA install + mobile nav + dynamic regional pricing + i18n
(function(){
  const installBtns = [document.getElementById('pwaInstallBtn'), document.getElementById('heroInstallBtn'), document.getElementById('pwaInstallInline')].filter(Boolean);
  let deferred = null;
  const isStandalone = () => (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent);

  function updateButtons(){
    if(isStandalone()){
      installBtns.forEach(b=>b.style.display='none');
      return;
    }
    installBtns.forEach(b=>b.style.display='inline-flex');
  }

  window.addEventListener('beforeinstallprompt', (e)=>{
    e.preventDefault();
    deferred = e;
    updateButtons();
  });
  window.addEventListener('appinstalled', ()=>{
    deferred = null;
    updateButtons();
  });
  updateButtons();

  function openIOS(){
    const modal = document.getElementById('iosModal');
    if(modal){
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
    }
  }
  function closeIOS(){
    const modal = document.getElementById('iosModal');
    if(modal){
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
    }
  }

  async function handleInstall(){
    if(deferred){
      deferred.prompt();
      const choice = await deferred.userChoice;
      if(choice.outcome === 'accepted'){
        deferred = null;
        updateButtons();
      }
      return;
    }
    if(isIOS()){
      openIOS();
      return;
    }
    window.location.href = "https://app.curaos.health/?install=true";
  }

  installBtns.forEach(b=>b.addEventListener('click', handleInstall));
  document.getElementById('iosClose')?.addEventListener('click', closeIOS);
  document.getElementById('iosGotIt')?.addEventListener('click', closeIOS);
  document.getElementById('iosModal')?.addEventListener('click', (e)=>{ if(e.target.id==='iosModal') closeIOS(); });

  // Mobile hamburger
  const ham = document.getElementById('hamburger');
  const mob = document.getElementById('mobileNav');
  ham?.addEventListener('click', ()=>{
    const open = mob.classList.toggle('open');
    ham.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mob?.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>mob.classList.remove('open')));

  // Register SW for PWA (if served via https / localhost)
  if('serviceWorker' in navigator && location.protocol.startsWith('http')){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('./sw.js').catch(()=>{});
    });
  }

  // ---- Dynamic regional pricing (Platform Admin -> Public API -> GeoIP) ----
  const API_BASE = (window.__CURAOS_API__ || "https://api.curaos.health") + "/api/v1/public/pricing/";
  const currencySelect = document.getElementById('currencySelect');
  const FALLBACK_PRICES = {
    "cura-rx": {price:"49.00", currency:"USD"},
    "cura-doctor": {price:"49.00", currency:"USD"},
    "cura-labs": {price:"49.00", currency:"USD"},
    "cura-waitlist": {price:"49.00", currency:"USD"},
    "cura-clinic": {price:"149.00", currency:"USD"},
    "cura-ihms": {price:"5000.00", currency:"USD"}
  };
  const REGIONAL_FALLBACK = {
    "JP": {rx:"7000.00", doctor:"7000.00", labs:"7000.00", waitlist:"7000.00", clinic:"21000.00", ihms:"750000.00", currency:"JPY"},
    "CA": {rx:"68.00", doctor:"68.00", labs:"68.00", waitlist:"68.00", clinic:"200.00", ihms:"6800.00", currency:"CAD"},
    "AU": {rx:"75.00", doctor:"75.00", labs:"75.00", waitlist:"75.00", clinic:"220.00", ihms:"7500.00", currency:"AUD"},
    "NZ": {rx:"80.00", doctor:"80.00", labs:"80.00", waitlist:"80.00", clinic:"240.00", ihms:"8200.00", currency:"NZD"},
    "SG": {rx:"65.00", doctor:"65.00", labs:"65.00", waitlist:"65.00", clinic:"195.00", ihms:"6800.00", currency:"SGD"},
    "AE": {rx:"180.00", doctor:"180.00", labs:"180.00", waitlist:"180.00", clinic:"550.00", ihms:"18300.00", currency:"AED"},
    "SA": {rx:"185.00", doctor:"185.00", labs:"185.00", waitlist:"185.00", clinic:"560.00", ihms:"18750.00", currency:"SAR"},
    "MY": {rx:"200.00", doctor:"200.00", labs:"200.00", waitlist:"200.00", clinic:"600.00", ihms:"22000.00", currency:"MYR"},
    "TH": {rx:"1750.00", doctor:"1750.00", labs:"1750.00", waitlist:"1750.00", clinic:"5200.00", ihms:"180000.00", currency:"THB"},
    "ZA": {rx:"900.00", doctor:"900.00", labs:"900.00", waitlist:"900.00", clinic:"2700.00", ihms:"90000.00", currency:"ZAR"},
    "NG": {rx:"75000.00", doctor:"75000.00", labs:"75000.00", waitlist:"75000.00", clinic:"225000.00", ihms:"7500000.00", currency:"NGN"},
    "KE": {rx:"6500.00", doctor:"6500.00", labs:"6500.00", waitlist:"6500.00", clinic:"19500.00", ihms:"650000.00", currency:"KES"},
    "BD": {rx:"3500.00", doctor:"3500.00", labs:"3500.00", waitlist:"3500.00", clinic:"10500.00", ihms:"450000.00", currency:"BDT"},
    "IN": {rx:"4000.00", doctor:"4000.00", labs:"4000.00", waitlist:"4000.00", clinic:"12000.00", ihms:"400000.00", currency:"INR"},
    "GB": {rx:"39.00", doctor:"39.00", labs:"39.00", waitlist:"39.00", clinic:"119.00", ihms:"4000.00", currency:"GBP"},
    "DE": {rx:"45.00", doctor:"45.00", labs:"45.00", waitlist:"45.00", clinic:"135.00", ihms:"4500.00", currency:"EUR"},
    "EU": {rx:"45.00", doctor:"45.00", labs:"45.00", waitlist:"45.00", clinic:"135.00", ihms:"4500.00", currency:"EUR"}
  };
  function formatPrice(amount, currency){
    try{
      return new Intl.NumberFormat(undefined, {style:"currency", currency}).format(Number(amount));
    }catch{ return currency + " " + amount; }
  }
  async function loadPricing(country){
    const cleanCountry = country && country !== "auto" ? country.replace(/[^\w]/g,'') : "auto";
    const url = cleanCountry && cleanCountry !== "auto" ? API_BASE + "?country=" + encodeURIComponent(cleanCountry) : API_BASE;
    try{
      const res = await fetch(url, {headers:{"Accept":"application/json"}});
      if(!res.ok) throw new Error("bad status");
      const data = await res.json();
      const tiers = data.tiers || [];
      tiers.forEach(t=>{
        const el = document.getElementById("price-" + t.module_code);
        if(el) el.textContent = formatPrice(t.monthly_price, t.currency_code) + "/mo";
      });
      const note = document.getElementById("ihmsCountryNote");
      if(note) note.textContent = (data.country || cleanCountry || "US") + " pricing · " + (data.currency || "USD") + " · Auto-detected region · Switch currency above";
      return;
    }catch(e){
      const fallbackMap = (cleanCountry && REGIONAL_FALLBACK[cleanCountry]) ? REGIONAL_FALLBACK[cleanCountry] : null;
      Object.keys(FALLBACK_PRICES).forEach(code=>{
        const el = document.getElementById("price-" + code) || (code==='cura-ihms' ? document.getElementById('price-cura-hospital') : null);
        if(el){
          if (fallbackMap) {
            const key = { "cura-rx":"rx","cura-doctor":"doctor","cura-labs":"labs","cura-waitlist":"waitlist","cura-clinic":"clinic","cura-ihms":"ihms" }[code] || code;
            el.textContent = formatPrice(fallbackMap[key] || FALLBACK_PRICES[code].price, fallbackMap.currency) + "/mo";
          } else {
            const p = FALLBACK_PRICES[code];
            el.textContent = formatPrice(p.price, p.currency) + "/mo";
          }
        }
      });
    }
  }
  loadPricing();
  if(currencySelect){
    currencySelect.addEventListener('change', ()=> loadPricing(currencySelect.value));
  }

  // ---- i18n Translation Dictionary ----
  const I18N_DICT = {
    en: { getStarted: "Get Started", heroTitle: "One operating<br>system for the<br>entire hospital.", heroDesc: "CuraOS — Intelligent Healthcare Operating System by Veriora Labs. A high-speed hospital operating system that chains every clinical action to live single-entry finance tracking.", exploreModules: "Explore Modules →", seePricing: "See pricing", hospitalTitle: "Enterprise Hospital Operating System", hospitalSub: "One platform for every department — run a 50-bed clinic or a 500-bed medical city on one OS." },
    ja: { getStarted: "始める", heroTitle: "病院全体のための<br>1つのOS。", heroDesc: "CuraOS — Veriora Labsによるインテリジェントなヘルスケアオペレーティングシステム。", exploreModules: "モジュールを見る →", seePricing: "価格を見る", hospitalTitle: "エンタープライズ病院OS", hospitalSub: "あらゆる部門を1つのプラットフォームで統合。" },
    ms: { getStarted: "Mula Sekarang", heroTitle: "Satu sistem operasi<br>untuk keseluruhan hospital.", heroDesc: "CuraOS — Sistem Operasi Kesihatan Pintar oleh Veriora Labs.", exploreModules: "Terokai Modul →", seePricing: "Lihat Harga", hospitalTitle: "Sistem Operasi Hospital Perusahaan", hospitalSub: "Satu platform untuk semua jabatan." },
    id: { getStarted: "Mulai Sekarang", heroTitle: "Satu sistem operasi<br>untuk seluruh rumah sakit.", heroDesc: "CuraOS — Sistem Operasi Kesehatan Pintar oleh Veriora Labs.", exploreModules: "Jelajahi Modul →", seePricing: "Lihat Harga", hospitalTitle: "Sistem Operasi Rumah Sakit Enterprise", hospitalSub: "Satu platform untuk semua departemen." },
    ar: { getStarted: "ابدأ الآن", heroTitle: "نظام تشغيل واحد<br>للمستشفى بأكمله.", heroDesc: "CuraOS — نظام تشغيل الرعاية الصحية الذكي من Veriora Labs.", exploreModules: "استكشف الوحدات →", seePricing: "عرض الأسعار", hospitalTitle: "نظام تشغيل المستشفيات للمؤسسات", hospitalSub: "منصة واحدة لجميع الأقسام." },
    es: { getStarted: "Empezar", heroTitle: "Un sistema operativo<br>para todo el hospital.", heroDesc: "CuraOS — Sistema Operativo de Salud Inteligente de Veriora Labs.", exploreModules: "Explorar Módulos →", seePricing: "Ver Precios", hospitalTitle: "Sistema Operativo Hospitalario Enterprise", hospitalSub: "Una plataforma para todos los departamentos." },
    de: { getStarted: "Loslegen", heroTitle: "Ein Betriebssystem<br>für das gesamte Krankenhaus.", heroDesc: "CuraOS — Intelligentes Gesundheits-Betriebssystem von Veriora Labs.", exploreModules: "Module erkunden →", seePricing: "Preise ansehen", hospitalTitle: "Enterprise Krankenhaus-Betriebssystem", hospitalSub: "Eine Plattform für alle Abteilungen." },
    bn: { getStarted: "শুরু করুন", heroTitle: "পুরো হাসপাতালের জন্য<br>একটি অপারেটিং সিস্টেম।", heroDesc: "CuraOS — ভেরিওরা ল্যাবসের তৈরি ইন্টেলিজেন্ট হেলথকেয়ার অপারেটিং সিস্টেম।", exploreModules: "মডিউল দেখুন →", seePricing: "মূল্য দেখুন", hospitalTitle: "এন্টারপ্রাইজ হাসপাতাল অপারেটিং সিস্টেম", hospitalSub: "সব বিভাগের জন্য একটি সমন্বিত প্ল্যাটফর্ম।" },
    hi: { getStarted: "शुरू करें", heroTitle: "पूरे अस्पताल के लिए<br>एक ऑपरेटिंग सिस्टम।", heroDesc: "CuraOS — वेरियोरा लैब्स द्वारा इंटेलिजेंट हेल्थकेयर ऑपरेटिंग सिस्टम।", exploreModules: "मॉड्यूल देखें →", seePricing: "मूल्य देखें", hospitalTitle: "एंटरप्राइज अस्पताल ऑपरेटिंग सिस्टम", hospitalSub: "सभी विभागों के लिए एक एकीकृत मंच।" },
    ur: { getStarted: "شروع کریں", heroTitle: "پورے ہسپتال کے لیے<br>ایک آپریٹنگ سسٹم۔", heroDesc: "CuraOS — ویریورا لیبز کا انٹیلی جنس ہیلتھ کیئر آپریٹنگ سسٹم۔", exploreModules: "ماڈیولز دیکھیں →", seePricing: "قیمت دیکھیں", hospitalTitle: "انٹرپرائز ہسپتال آپریٹنگ سسٹم", hospitalSub: "تمام شعبوں کے لیے ایک پلیٹ فارم۔" },
    sw: { getStarted: "Anza Sasa", heroTitle: "Mfumo mmoja wa uendeshaji<br>kwa hospitali nzima.", heroDesc: "CuraOS — Mfumo wa Afya wa Kina kutoka Veriora Labs.", exploreModules: "Tazama Moduli →", seePricing: "Tazama Bei", hospitalTitle: "Mfumo wa Hospitali wa Enterprise", hospitalSub: "Jukwaa moja kwa idara zote." }
  };

  const languageSelect = document.getElementById('languageSelect');
  if(languageSelect){
    languageSelect.addEventListener('change', (e)=>{
      const lang = e.target.value;
      const dict = I18N_DICT[lang] || I18N_DICT.en;
      Object.keys(dict).forEach(key=>{
        const el = document.getElementById('i18n-' + key);
        if(el) el.innerHTML = dict[key];
      });
      document.documentElement.lang = lang;
      document.documentElement.dir = (lang==='ar' || lang==='ur') ? 'rtl' : 'ltr';
    });
  }
})();
