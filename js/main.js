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
      return new Intl.NumberFormat(undefined, {style:"currency", currency, minimumFractionDigits:0, maximumFractionDigits:2}).format(Number(amount));
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
        const formatted = formatPrice(t.monthly_price, t.currency_code) + "/mo";
        const el = document.getElementById("price-" + t.module_code);
        if(el) el.textContent = formatted;
        // Mirror IHMS (flagship) price onto the Modules-grid hospital badge too
        if(t.module_code === 'cura-ihms'){
          const hospitalEl = document.getElementById('price-cura-hospital');
          if(hospitalEl) hospitalEl.textContent = formatted;
        }
      });
      const note = document.getElementById("ihmsCountryNote");
      if(note) note.textContent = (data.country || cleanCountry || "US") + " pricing · " + (data.currency || "USD") + " · Auto-detected region · Switch currency above";
      return;
    }catch(e){
      const fallbackMap = (cleanCountry && REGIONAL_FALLBACK[cleanCountry]) ? REGIONAL_FALLBACK[cleanCountry] : null;
      Object.keys(FALLBACK_PRICES).forEach(code=>{
        const els = [document.getElementById("price-" + code)];
        if(code === 'cura-ihms') els.push(document.getElementById('price-cura-hospital'));
        els.filter(Boolean).forEach(el=>{
          if (fallbackMap) {
            const key = { "cura-rx":"rx","cura-doctor":"doctor","cura-labs":"labs","cura-waitlist":"waitlist","cura-clinic":"clinic","cura-ihms":"ihms" }[code] || code;
            el.textContent = formatPrice(fallbackMap[key] || FALLBACK_PRICES[code].price, fallbackMap.currency) + "/mo";
          } else {
            const p = FALLBACK_PRICES[code];
            el.textContent = formatPrice(p.price, p.currency) + "/mo";
          }
        });
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

  // ---- Scroll-reveal for [data-reveal] elements ----
  // Primary: IntersectionObserver (efficient, GPU-friendly).
  // Backup: manual rect-check on scroll/resize/load so content can never stay
  // stuck invisible for a real user due to an observer edge case.
  const revealEls = Array.from(document.querySelectorAll('[data-reveal]'));
  if(revealEls.length){
    const reveal = (el)=> el.classList.add('is-visible');
    let revealObserver = null;
    if('IntersectionObserver' in window){
      revealObserver = new IntersectionObserver((entries, obs)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            reveal(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, {threshold:0.1, rootMargin:'0px 0px -10% 0px'});
      revealEls.forEach(el=>revealObserver.observe(el));
    }

    function manualRevealPass(){
      const vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(el=>{
        if(el.classList.contains('is-visible')) return;
        const r = el.getBoundingClientRect();
        if(r.top < vh * 1.05 && r.bottom > -vh * 0.05){
          reveal(el);
          if(revealObserver) revealObserver.unobserve(el);
        }
      });
    }
    let manualRevealScheduled = false;
    function scheduleManualReveal(){
      if(manualRevealScheduled) return;
      manualRevealScheduled = true;
      requestAnimationFrame(()=>{ manualRevealScheduled = false; manualRevealPass(); });
    }
    window.addEventListener('scroll', scheduleManualReveal, {passive:true});
    window.addEventListener('resize', scheduleManualReveal);
    window.addEventListener('load', manualRevealPass);

    // Self-terminating safety poll: guarantees every [data-reveal] element
    // resolves within ~500ms of entering the viewport even in edge cases
    // where neither IntersectionObserver nor scroll/resize events fire
    // (e.g. programmatic scroll, some in-app browsers/automation).
    manualRevealPass();
    const safetyPoll = setInterval(()=>{
      manualRevealPass();
      if(revealEls.every(el=>el.classList.contains('is-visible'))){
        clearInterval(safetyPoll);
      }
    }, 150);
    // Hard stop after 20s regardless, so we never leave a stray interval running.
    setTimeout(()=>clearInterval(safetyPoll), 20000);
  }

  // ---- Hero metric count-up (runs once when hero scrolls into view) ----
  const countEls = Array.from(document.querySelectorAll('[data-countup]'));
  function animateCount(el){
    const target = parseInt(el.getAttribute('data-countup'), 10) || 0;
    const duration = 1200;
    const start = performance.now();
    function tick(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased).toString();
      if(progress < 1) requestAnimationFrame(tick);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(tick);
  }
  if(countEls.length){
    if('IntersectionObserver' in window){
      const countObserver = new IntersectionObserver((entries, obs)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            animateCount(entry.target);
            obs.unobserve(entry.target);
          }
        });
      }, {threshold:0.4});
      countEls.forEach(el=>countObserver.observe(el));
    }else{
      countEls.forEach(el=>{ el.textContent = el.getAttribute('data-countup'); });
    }
  }

  // ---- Hero product mockup — interactive tab preview ----
  const mockupTabs = Array.from(document.querySelectorAll('.mockup-tab'));
  const mockupUrl = document.getElementById('mockupUrl');
  if(mockupTabs.length){
    mockupTabs.forEach(tab=>{
      tab.addEventListener('click', ()=>{
        const panelId = tab.getAttribute('data-panel');
        mockupTabs.forEach(t=>{
          const active = t === tab;
          t.classList.toggle('is-active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        document.querySelectorAll('.mockup-panel').forEach(panel=>{
          const active = panel.id === panelId;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });
        if(mockupUrl && tab.getAttribute('data-url')) mockupUrl.textContent = tab.getAttribute('data-url');
      });
    });
  }

  // ---- Pricing — monthly / annual billing toggle ----
  const billingMonthlyBtn = document.getElementById('billingMonthly');
  const billingAnnualBtn = document.getElementById('billingAnnual');
  const ANNUAL_FACTOR = 10 / 12; // ~2 months free when billed annually
  function formatUsdLike(amount, template){
    // Preserve original formatting style (commas, no decimals) based on template string
    const hasComma = /,/.test(template);
    const rounded = Math.round(amount);
    let str = rounded.toString();
    if(hasComma) str = rounded.toLocaleString('en-US');
    return '$' + str;
  }
  function applyBillingPeriod(period){
    document.querySelectorAll('[data-plan-amount]').forEach(el=>{
      const monthly = parseFloat(el.getAttribute('data-monthly'));
      if(Number.isNaN(monthly)) return;
      if(!el.dataset.original) el.dataset.original = el.textContent;
      if(period === 'annual'){
        el.textContent = formatUsdLike(monthly * ANNUAL_FACTOR, el.dataset.original);
      }else{
        el.textContent = el.dataset.original;
      }
    });
    document.querySelectorAll('[data-plan-period]').forEach(el=>{
      if(!el.dataset.original) el.dataset.original = el.textContent;
      if(period === 'annual'){
        el.textContent = el.dataset.original.replace('/ mo', '/ mo, billed annually').replace('/ module / mo', '/ module / mo, billed annually');
      }else{
        el.textContent = el.dataset.original;
      }
    });
    if(billingMonthlyBtn){
      billingMonthlyBtn.classList.toggle('is-active', period === 'monthly');
      billingMonthlyBtn.setAttribute('aria-pressed', period === 'monthly' ? 'true' : 'false');
    }
    if(billingAnnualBtn){
      billingAnnualBtn.classList.toggle('is-active', period === 'annual');
      billingAnnualBtn.setAttribute('aria-pressed', period === 'annual' ? 'true' : 'false');
    }
  }
  if(billingMonthlyBtn && billingAnnualBtn){
    billingMonthlyBtn.addEventListener('click', ()=>applyBillingPeriod('monthly'));
    billingAnnualBtn.addEventListener('click', ()=>applyBillingPeriod('annual'));
  }
})();
