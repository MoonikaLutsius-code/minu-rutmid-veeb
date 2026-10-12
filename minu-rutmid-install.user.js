// ==UserScript==
// @name         Minu rütmid
// @namespace    moonika.musicca
// @version      3.9
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
    let active = false, generation = 0, wakeLock = null, starting = false;
    const host = document.createElement('div');
    host.id = 'minu-rutmid-tm';
    host.style.cssText = 'position:fixed!important;inset:0!important;z-index:2147483647!important;background:#272c34!important;opacity:1!important;isolation:isolate!important;';
    document.body.appendChild(host);
    const root = host.attachShadow({mode:'open'});
    root.innerHTML = `
      <style>
        *{box-sizing:border-box}main{position:absolute;inset:0;overflow:auto;padding:24px 16px;background:#272c34;color:#f5f7fa;font:16px system-ui,sans-serif;color-scheme:dark}
        section{max-width:520px;margin:auto}h1{font-size:30px;margin:0 0 18px}
        #tracks{display:grid;width:100%;margin-inline:auto;grid-template-columns:repeat(2,2.7cm);justify-content:start;gap:8px}
        button{font:600 16px system-ui,sans-serif;touch-action:manipulation;cursor:pointer;-webkit-tap-highlight-color:transparent}
        .track{min-width:0;min-height:56px;width:100%;padding:9px 10px;text-align:left;border:1px solid;border-radius:11px;overflow-wrap:anywhere}
        .track:disabled{opacity:.45}.track:active{filter:brightness(.85)}button:focus-visible{outline:3px solid #bafa69;outline-offset:-3px}
        .disco{background:#164b38;color:#fff;border-color:#36775c}.rock{background:#173963;color:#fff;border-color:#3e6598}
        .jazz{background:#666b73;color:#fff;border-color:#92979e}.jazz-light{background:#858b94;color:#161b22;border-color:#a9adb4}.waltz{background:#fff;color:#161b22;border-color:#d6dbe2}
        p{font-size:14px;line-height:1.5;color:#c5ccd6}#status{min-height:22px}
