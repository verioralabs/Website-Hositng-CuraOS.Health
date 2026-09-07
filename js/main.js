// CuraOS Website — PWA install + mobile nav
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
    // Show buttons: if we have deferred, show; else still show for iOS (will open modal)
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
    document.getElementById('iosModal').classList.add('open');
    document.getElementById('iosModal').setAttribute('aria-hidden','false');
  }
  function closeIOS(){
    document.getElementById('iosModal').classList.remove('open');
    document.getElementById('iosModal').setAttribute('aria-hidden','true');
  }

  async function handleInstall(){
    // Marketing site: redirect to SaaS portal where true PWA engine lives (app.curaos.health)
    // This prevents installing the static marketing landing page and ensures the
    // operational OS dashboard is installed instead.
    const SAAS_URL = "https://app.curaos.health/?install=true";
    // Keep iOS guidance but redirect after guidance? For marketing, always redirect first.
    if(isIOS()){
      // For iOS marketing visitors, show one-tap redirect hint then go to app
      window.location.href = SAAS_URL;
      return;
    }
    // For all other browsers, navigate to SaaS portal where deferred prompt will fire
    window.location.href = SAAS_URL;
    return;
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

  // ---- Dynamic regional pricing (Platform Admin → Public API → GeoIP) ----
  const API_BASE = (window.__CURAOS_API__ || "https://api.curaos.health") + "/api/v1/public/pricing/";
  const currencySelect = document.getElementById('currencySelect');
  const FALLBACK_PRICES = {
    "cura-rx": {price:"49.00", currency:"USD"},
    "cura-doctor": {price:"49.00", currency:"USD"},
    "cura-labs": {price:"49.00", currency:"USD"},
    "cura-waitlist": {price:"49.00", currency:"USD"},
    "cura-ihms": {price:"5000.00", currency:"USD"}
  };
  const REGIONAL_FALLBACK = {
    "JP": {rx:"7000.00", doctor:"7000.00", labs:"7000.00", waitlist:"7000.00", ihms:"750000.00", currency:"JPY"},
    "CA": {rx:"68.00", doctor:"68.00", labs:"68.00", waitlist:"68.00", ihms:"6800.00", currency:"CAD"},
    "AU": {rx:"75.00", doctor:"75.00", labs:"75.00", waitlist:"75.00", ihms:"7500.00", currency:"AUD"},
    "NZ": {rx:"80.00", doctor:"80.00", labs:"80.00", waitlist:"80.00", ihms:"8200.00", currency:"NZD"},
    "SG": {rx:"65.00", doctor:"65.00", labs:"65.00", waitlist:"65.00", ihms:"6800.00", currency:"SGD"},
    "AE": {rx:"180.00", doctor:"180.00", labs:"180.00", waitlist:"180.00", ihms:"18300.00", currency:"AED"},
    "SA": {rx:"185.00", doctor:"185.00", labs:"185.00", waitlist:"185.00", ihms:"18750.00", currency:"SAR"},
    "MY": {rx:"200.00", doctor:"200.00", labs:"200.00", waitlist:"200.00", ihms:"22000.00", currency:"MYR"},
    "TH": {rx:"1750.00", doctor:"1750.00", labs:"1750.00", waitlist:"1750.00", ihms:"180000.00", currency:"THB"},
    "ZA": {rx:"900.00", doctor:"900.00", labs:"900.00", waitlist:"900.00", ihms:"90000.00", currency:"ZAR"},
    "NG": {rx:"75000.00", doctor:"75000.00", labs:"75000.00", waitlist:"75000.00", ihms:"7500000.00", currency:"NGN"},
    "KE": {rx:"6500.00", doctor:"6500.00", labs:"6500.00", waitlist:"6500.00", ihms:"650000.00", currency:"KES"},
    "BD": {rx:"3500.00", doctor:"3500.00", labs:"3500.00", waitlist:"3500.00", ihms:"450000.00", currency:"BDT"},
    "IN": {rx:"4000.00", doctor:"4000.00", labs:"4000.00", waitlist:"4000.00", ihms:"400000.00", currency:"INR"},
    "GB": {rx:"39.00", doctor:"39.00", labs:"39.00", waitlist:"39.00", ihms:"4000.00", currency:"GBP"},
    "DE": {rx:"45.00", doctor:"45.00", labs:"45.00", waitlist:"45.00", ihms:"4500.00", currency:"EUR"},
    "EU": {rx:"45.00", doctor:"45.00", labs:"45.00", waitlist:"45.00", ihms:"4500.00", currency:"EUR"}
  };
  function formatPrice(amount, currency){
    try{
      return new Intl.NumberFormat(undefined, {style:"currency", currency}).format(Number(amount));
    }catch{ return currency + " " + amount; }
  }
  async function loadPricing(country){
    const url = country && country !== "auto" ? API_BASE + "?country=" + encodeURIComponent(country) : API_BASE;
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
      if(note) note.textContent = (data.country || country || "US") + " pricing · " + (data.currency || "USD") + " · Auto-detected region · Switch currency above";
      return;
    }catch(e){
      // Fallback: use regional offline map if country selected, else USD globals — ensures Intl handles all new currencies
      const fallbackMap = (country && REGIONAL_FALLBACK[country]) ? REGIONAL_FALLBACK[country] : null;
      Object.keys(FALLBACK_PRICES).forEach(code=>{
        const el = document.getElementById("price-" + code);
        if(el){
          if (fallbackMap) {
            const key = { "cura-rx":"rx","cura-doctor":"doctor","cura-labs":"labs","cura-waitlist":"waitlist","cura-ihms":"ihms" }[code] || code;
            el.textContent = formatPrice(fallbackMap[key] || FALLBACK_PRICES[code].price, fallbackMap.currency) + "/mo";
          } else {
            const p = FALLBACK_PRICES[code];
            el.textContent = formatPrice(p.price, p.currency) + "/mo";
          }
        }
      });
    }
  }
  // initial load
  loadPricing();
  if(currencySelect){
    currencySelect.addEventListener('change', ()=> loadPricing(currencySelect.value));
  }
})();
