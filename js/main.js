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
    if(isIOS()){
      openIOS();
      return;
    }
    if(deferred){
      try{
        deferred.prompt();
        const choice = await deferred.userChoice;
        const hint = document.getElementById('pwaHint');
        if(hint){
          hint.textContent = choice.outcome === 'accepted' ? 'Installing… check home screen' : 'Install dismissed';
          setTimeout(()=>hint.textContent='Works offline after install', 3000);
        }
      }catch{}
      deferred = null;
      updateButtons();
      return;
    }
    // Fallback for browsers without deferred
    const hint = document.getElementById('pwaHint');
    if(hint){
      hint.textContent = 'Use browser menu → Install / Add to Home Screen';
      setTimeout(()=>hint.textContent='Works offline after install', 4000);
    } else {
      // No hint element on header — show iOS modal as generic help on desktop Firefox etc.
      if(!isIOS()) openIOS();
    }
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
      // fallback to local defaults
      Object.keys(FALLBACK_PRICES).forEach(code=>{
        const el = document.getElementById("price-" + code);
        if(el){
          const p = FALLBACK_PRICES[code];
          el.textContent = formatPrice(p.price, p.currency) + "/mo";
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
