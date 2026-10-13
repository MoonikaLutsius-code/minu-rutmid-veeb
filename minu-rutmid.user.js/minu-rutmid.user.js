// ==UserScript==
// @name         Minu rütmid
// @namespace    moonika.musicca
// @version      4.5
// @description  27 rütminuppu ja helehall peatamisekraan
// @match        https://www.musicca.com/drum-machine*
// @grant        unsafeWindow
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const page = unsafeWindow;
  const tracks = [
    ['60-Disco2', '60-n-44-a--5aeghimop6em7aeim-5sa', 'disco'],
    ['68-Disco2', '68-n-44-a--5aeghimop6em7aeim-5sa', 'disco'],
    ['70-Disco2', '70-n-44-a--5aeghimop6em7aeim-5sa', 'disco'],
    ['80-Disco2', '80-n-44-a--5aeghimop6em7aeim-5sa', 'disco'],
    ['53-PopRock1', '53-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['60-PopRock1', '60-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['63-PopRock1', '63-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['65-PopRock1', '65-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['70-PopRock1', '70-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['75-PopRock1', '75-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['80-PopRock1', '80-n-44-a--5acegikmo6em7ai-', 'rock'],
    ['70-Jazz2', '70-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['100-Jazz2', '100-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['105-Jazz2', '105-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['110-Jazz2', '110-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['115-Jazz2', '115-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['120-Jazz2', '120-n-44-a--1em4aegimo6m7a-', 'jazz-light'],
    ['70-Swing-Jazz2', '70-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['100-Swing-Jazz2', '100-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['105-Swing-Jazz2', '105-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['110-Swing-Jazz2', '110-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['115-Swing-Jazz2', '115-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['120-Swing-Jazz2', '120-y-44-a--1em4aegimo6m7a-', 'jazz'],
    ['140-3/4', '140-n-34-a--5ei6a-', 'waltz'],
    ['150-3/4', '150-n-34-a--5ei6a-', 'waltz'],
    ['155-3/4', '155-n-34-a--5ei6a-', 'waltz'],
    ['160-3/4', '160-n-34-a--5ei6a-', 'waltz']
  ];

  function setup() {
  // Tampermonkey võib pärast uuesti paigaldamist korraks käivitada ka vana kirjet.
  // Hoia korraga ainult üks rütmivaade lehel.
  if (document.getElementById('minu-rutmid-tm')) return;

  let active = false;
  let generation = 0;
  let wakeLock = null;
  let starting = false;

  const host = document.createElement('div');
  host.id = 'minu-rutmid-tm';
  host.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;background:#272c34!important;opacity:1!important;isolation:isolate!important;';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });
  root.innerHTML = `
    <style>
      * { box-sizing: border-box; }
      main {
        position: absolute; inset: 0; overflow: auto; padding: 24px 16px;
        background: #272c34; color: #f5f7fa; font: 16px system-ui, sans-serif;
        color-scheme: dark;
      }
      section { max-width: 520px; margin: auto; }
      h1 { font-size: 30px; margin: 0 0 18px; }
        #tracks { display: grid; width: 100%; margin-inline: auto; grid-template-columns: repeat(2, 2.7cm); justify-content: start; gap: 8px; }
      button { font: 600 16px system-ui, sans-serif; touch-action: manipulation; cursor: pointer; -webkit-tap-highlight-color: transparent; }
      .track { min-width: 0; min-height: 56px; width: 100%; padding: 9px 10px; text-align: left; border: 1px solid; border-radius: 11px; overflow-wrap: anywhere; }
      .track:disabled { opacity: .45; }
      .track:active { filter: brightness(.85); }
      button:focus-visible { outline: 3px solid #bafa69; outline-offset: -3px; }
      .disco { background: #164b38; color: #fff; border-color: #36775c; }
      .rock { background: #173963; color: #fff; border-color: #3e6598; }
      .jazz { background: #666b73; color: #fff; border-color: #92979e; }
      .jazz-light { background: #858b94; color: #161b22; border-color: #a9adb4; }
      .waltz { background: #fff; color: #161b22; border-color: #d6dbe2; }
      p { font-size: 14px; line-height: 1.5; color: #c5ccd6; }
      #status { min-height: 22px; }
      #stop, #stop:hover, #stop:focus, #stop:active {
        appearance: none !important; -webkit-appearance: none !important;
        position: absolute !important; inset: 0 !important; z-index: 10 !important;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        width: 100% !important; height: 100% !important; margin: 0 !important;
        padding: 24px !important; border: 0 !important; border-radius: 0 !important;
        background: #e1e4e8 !important; background-image: none !important;
        color: #111 !important; opacity: 1 !important; box-shadow: none !important;
        filter: none !important; backdrop-filter: none !important; mix-blend-mode: normal !important;
        transition: none !important; animation: none !important; color-scheme: light !important;
        font: 600 24px system-ui, sans-serif; text-align: center; overflow: auto;
      }
      #stop small { display: block; max-width: 30rem; font-size: 16px; font-weight: 450; margin-top: 16px; color: #333; }
      #stop[hidden] { display: none !important; }
      #original { background: none; border: 0; color: #c5ccd6; font-size: 14px; padding: 12px 0; }
        @media (max-width: 360px) { main { padding: 18px 10px; } #tracks { width: 100%; grid-template-columns: repeat(2, 2.7cm); justify-content: start; gap: 6px; } .track { padding: 8px 6px; font-size: 14px; } }
    </style>
    <main><section>
      <h1>Minu rütmid</h1>
      <div id="tracks"></div>
      <p id="status" role="status">Laadin Musicca heli…</p>
      <button id="original" type="button">Näita Musicca algset lehte</button>
    </section></main>
    <button id="stop" type="button" hidden>
      <span id="title"></span>
      <small>Puuduta halli ekraani või vajuta Enter, et peatada.</small>
      <small id="wake"></small>
    </button>`;

  const status = root.querySelector('#status');
  const stopButton = root.querySelector('#stop');
  const control = () => document.querySelector('#play');
  const ready = () => page.appHasLoaded && page.AUDIO && page.App && control();

  // N/Y määratakse alles siis, kui kasutaja valib pärast pausi järgmise rütmi.
  function applyURLState(hash) {
    // Kasuta päris fragmendi navigeerimist, et Musicca saaks ka oma hashchange'i.
    page.location.replace(hash);
    const parsed = page.parseURLState();
    if (!parsed?.state) throw new Error('Vigane rütmilink');
    page.App.applyPattern(parsed.state);
  }

  function releaseWakeLock() {
    if (!wakeLock) return;
    const oldLock = wakeLock;
    wakeLock = null;
    oldLock.release().catch(() => {});
  }

  async function keepAwake() {
    if (!active || document.hidden || wakeLock || !navigator.wakeLock) return;
    const token = generation;
    try {
      const lock = await navigator.wakeLock.request('screen');
      if (!active || document.hidden || token !== generation) {
        await lock.release();
        return;
      }
      wakeLock = lock;
      root.querySelector('#wake').textContent = 'Hoian ekraani ärkvel';
      lock.addEventListener('release', () => {
        if (wakeLock === lock) wakeLock = null;
      });
    } catch (_) {
      root.querySelector('#wake').textContent = '';
    }
  }

  function stop() {
    generation++;
    active = false;
    starting = false;
    const button = control();
    if (button?.classList.contains('btn-pause')) button.click();
    stopButton.hidden = true;
    releaseWakeLock();
  }

  function start(track) {
    if (!ready() || starting) return;
    // Pause on juba avanud rütminupud ja peatanud heli. Ära peida rütmivaadet
    // siin uuesti, sest see tekitab valimisel tarbetu vilkumise.
    active = false;
    const token = ++generation;
    releaseWakeLock();
    starting = true;

    // See käib otse rütminupu vajutuse sees, et brauser avaks heli AudioContexti.
    let resume;
    try {
      resume = page.AUDIO.resume();
    } catch (error) {
      starting = false;
      status.textContent = 'Heli ei avanenud. Puuduta sama rütminuppu uuesti.';
      return;
    }

    try {
      applyURLState('#data=' + track[1]);
      active = true;
      root.querySelector('#title').textContent = track[0] + ' · puuduta peatamiseks';
      root.querySelector('#wake').textContent = 'Käivitan heli…';
      stopButton.hidden = false;
      keepAwake();

      Promise.resolve(resume).then(async () => {
        if (token !== generation || !active || document.hidden) return;
        if (page.AUDIO.state !== 'running') throw new Error('Heli on blokeeritud');
        // Kontrolli värsket Play elementi ning ära vajuta seda, kui muster juba mängib.
        const play = control();
        if (!play) throw new Error('Play-nuppu ei leitud');
        if (play.classList.contains('btn-play')) play.click();
        await new Promise(resolve => setTimeout(resolve, 250));
        if (token !== generation || !active) return;
        const after = control();
        if (!after || !after.classList.contains('btn-pause')) throw new Error('Musicca ei kinnitanud käivitust');
        starting = false;
        status.textContent = 'Rütm mängib. Puuduta halli ekraani või vajuta Enter, et peatada.';
        root.querySelector('#wake').textContent = ' '; 
      }).catch(() => {
        if (token !== generation) return;
        stop();
        status.textContent = 'Heli ei käivitunud. Puuduta rütminuppu uuesti.';
      });
    } catch (_) {
      Promise.resolve(resume).catch(() => {});
      stop();
      status.textContent = 'Rütmi laadimine ebaõnnestus. Värskenda Musicca lehte.';
    }
  }

  const buttons = tracks.map(track => {
    const button = document.createElement('button');
    button.className = 'track ' + track[2];
    button.textContent = track[0] + '  ▶';
    button.disabled = true;
    button.addEventListener('click', () => start(track));
    root.querySelector('#tracks').appendChild(button);
    return button;
  });

  stopButton.addEventListener('click', stop);
  root.querySelector('#original').addEventListener('click', () => {
    stop();
    host.remove();
    clearInterval(timer);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.repeat || !active) return;
    event.preventDefault();
    stop();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);

  const began = Date.now();
  const timer = setInterval(() => {
    if (ready()) {
      buttons.forEach(button => { button.disabled = false; });
      status.textContent = 'Vali rütm. Swing tuleb automaatselt lingi järgi.';
      clearInterval(timer);
    } else if (Date.now() - began > 30000) {
      status.textContent = 'Laadimine võtab kaua. Värskenda lehte või ava Musicca algne vaade.';
    }
  }, 300);
  }

  if (document.body) setup();
  else document.addEventListener('DOMContentLoaded', setup, { once: true });
})();
