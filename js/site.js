class Component extends DCLogic {
  constructor(props) {
    super(props);
    this.setScroller = (el) => { this.scroller = el; };
    this.state = { open: null, cafeP: '2', cafeT: '10:30', cafeDone: false, handDone: false, fS: 'Schnitt', fD: '13', fT: '11:00', fDone: false, kT: 'Unternehmen', kDone: false, pR: 'Ja', pT: 'Vormittags', pDone: false, dPlay: false, dTrack: 0, dOcc: 'Hochzeit', dDone: false, cDone: false };
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState && prevState.open !== this.state.open && this.scroller) this.scroller.scrollTop = 0;
  }
  smoothPage(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const start = window.scrollY || window.pageYOffset || 0;
    const end = el.getBoundingClientRect().top + start;
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { window.scrollTo(0, end); return; }
    const dist = end - start;
    const dur = Math.min(1400, Math.max(700, Math.abs(dist) * 0.9));
    const t0 = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      window.scrollTo(0, start + dist * ease(t));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  scrollToId(id) {
    const sc = this.scroller;
    if (!sc) return;
    const el = sc.querySelector('#' + id);
    if (!el) return;
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - 8;
    if (sc.scrollTo) sc.scrollTo({ top: top, behavior: 'smooth' }); else sc.scrollTop = top;
  }
  pills(values, current, key, theme) {
    return values.map((v) => {
      const on = v === current;
      let style;
      if (theme === 'cafe') {
        style = 'all: unset; cursor: pointer; min-width: 44px; min-height: 44px; box-sizing: border-box; padding: 10px 16px; border-radius: 999px; text-align: center; font-weight: 700; font-size: 15px; border: 1.5px solid #3b2417; ' + (on ? 'background: #3b2417; color: #f6efe4;' : 'background: transparent; color: #3b2417;');
      } else if (theme === 'kanz') {
        style = 'all: unset; cursor: pointer; min-height: 44px; box-sizing: border-box; padding: 10px 18px; border-radius: 4px; text-align: center; font-weight: 600; font-size: 15px; border: 1px solid #0f3d3e; ' + (on ? 'background: #0f3d3e; color: #ffffff;' : 'background: #ffffff; color: #0f3d3e;');
      } else if (theme === 'denis') {
        style = 'all: unset; cursor: pointer; min-height: 44px; box-sizing: border-box; padding: 10px 18px; border-radius: 999px; text-align: center; font-weight: 700; font-size: 15px; border: 1px solid ' + (on ? '#c8833a; background: #c8833a; color: #0a0a0a;' : '#3a3a3a; background: transparent; color: #f2efe9;');
      } else if (theme === 'phys') {
        style = 'all: unset; cursor: pointer; min-height: 44px; box-sizing: border-box; padding: 10px 18px; border-radius: 999px; text-align: center; font-weight: 700; font-size: 15px; border: 1px solid #1f4d45; ' + (on ? 'background: #1f4d45; color: #ffffff;' : 'background: #ffffff; color: #1f4d45;');
      } else {
        style = 'all: unset; cursor: pointer; min-height: 44px; box-sizing: border-box; padding: 11px 18px; text-align: center; font-size: 14px; letter-spacing: 0.04em; border: 1px solid #111111; ' + (on ? 'background: #111111; color: #ffffff;' : 'background: transparent; color: #111111;');
      }
      return { label: v, style, pick: () => this.setState({ [key]: v }) };
    });
  }
  sendContact() {
    const f = document.getElementById('aon-kontakt');
    if (!f || this.state.cBusy) return;
    const q = (n) => f.querySelector('[name="' + n + '"]');
    const d = { name: q('name').value.trim(), betrieb: q('betrieb').value.trim(), telefon: q('telefon').value.trim(), email: q('email').value.trim(), nachricht: q('nachricht').value.trim() };
    if (q('botcheck').checked) return;
    if (!d.telefon && !d.email) { this.setState({ cErr: 'Bitte gib eine Telefonnummer oder E-Mail an, damit wir dich erreichen.' }); return; }
    if (!q('einwilligung').checked) { this.setState({ cErr: 'Bitte bestätige kurz die Einwilligung.' }); return; }
    const key = window.AON && window.AON.web3formsKey;
    if (!key) {
      const text = 'Name: ' + d.name + '\nBetrieb: ' + d.betrieb + '\nTelefon: ' + d.telefon + '\nE-Mail: ' + d.email + '\n\n' + d.nachricht;
      window.location.href = 'mailto:mail@allesodernetz.de?subject=' + encodeURIComponent('Anfrage über allesodernetz.de') + '&body=' + encodeURIComponent(text);
      this.setState({ cDone: true, cErr: '' });
      return;
    }
    this.setState({ cBusy: true, cErr: '' });
    fetch('https://api.web3forms.com/submit', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.assign({ access_key: key, subject: 'Neue Anfrage über allesodernetz.de', from_name: 'allesodernetz.de', replyto: d.email || undefined }, d))
    }).then((r) => r.json()).then((j) => {
      if (j && j.success) this.setState({ cDone: true, cBusy: false });
      else throw new Error('fail');
    }).catch(() => this.setState({ cBusy: false, cErr: 'Senden hat leider nicht geklappt. Schreib uns gern direkt an mail@allesodernetz.de.' }));
  }
  renderVals() {
    const s = this.state;
    // Fotos: hier die /_blob/-Adressen der hochgeladenen Bilder eintragen. Leer = Illustration.
    const photos = { cafe: '/img/1d62420401c3b948ced0aabc1f3139c9.jpg', hand: '/img/0db3f2eaca57ccce1d96e8e4eb1ee5fe.jpg', fris: '/img/1055fe4a15a0da09e48daf9542c2be20.jpg', kanz: '/img/f7be506e04fe22b9d3fca6f02899f86f.jpg', phys: '/img/4869e9aafb15ccc82543a1d45e78024b.jpg', nadja: '/img/ae1660880caf9074ad1db9cdfdc32e58.jpg', denis: '/img/52dc20c42fb80522fb30e27925e52cd3.jpg', denisDetail: '/img/57bfe2b5214037ee3b09f541fe3ccb11.jpg' };
    const ph = {};
    Object.keys(photos).forEach((k) => { ph[k] = { src: photos[k], has: !!photos[k], none: !photos[k] }; });
    const order = ['cafe', 'handwerk', 'friseur', 'kanzlei', 'physio', 'denis'];
    const meta = {
      cafe: { name: 'Café Morgenrot', url: 'cafe-morgenrot.de' },
      handwerk: { name: 'Elektro Kaya', url: 'elektro-kaya.de' },
      friseur: { name: 'Salon Lune', url: 'salon-lune.de' },
      kanzlei: { name: 'Hartmann & Partner Steuerberatung', url: 'hartmann-steuerberatung.de' },
      physio: { name: 'Physiotherapie am Stadtpark', url: 'physio-am-stadtpark.de' },
      denis: { name: 'Denis Karyan – Gitarrist', url: 'deniskaryan.de' }
    };
    const idx = order.indexOf(s.open);
    const step = (d) => () => this.setState({ open: order[(idx + d + order.length) % order.length] });
    const open = (k) => () => this.setState({ open: k });
    const card = (on, extra) => 'all: unset; cursor: pointer; box-sizing: border-box; ' + extra + (on ? ' border: 1px solid #f6f1ea; background: #f6f1ea; color: #111111; transform: translateY(-4px); box-shadow: 0 22px 44px -22px rgba(246,241,234,.45);' : ' border: 1px solid #3a3530; background: #1a1715; color: #f6f1ea;');
    const frisServices = [
      { label: 'Schnitt', dur: '45 Min.', price: 'ab 48 €' },
      { label: 'Farbe', dur: '90 Min.', price: 'ab 65 €' },
      { label: 'Balayage', dur: 'ca. 3 Std.', price: 'ab 140 €' },
      { label: 'Pflege', dur: '30 Min.', price: 'ab 25 €' }
    ].map((x) => {
      const on = x.label === s.fS;
      return Object.assign({}, x, {
        pressed: on ? 'true' : 'false',
        style: card(on, 'display: flex; flex-direction: column; gap: 8px; min-height: 168px; padding: 20px;'),
        check: on ? 'width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: #111111; color: #f6f1ea; flex-shrink: 0' : 'width: 26px; height: 26px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid #5a524b; color: transparent; flex-shrink: 0',
        pick: () => this.setState({ fS: x.label })
      });
    });
    const days = [['Di', '12'], ['Mi', '13'], ['Do', '14'], ['Fr', '15'], ['Sa', '16']];
    const frisDays = days.map((d) => {
      const on = d[1] === s.fD;
      return { wd: d[0], num: d[1], pressed: on ? 'true' : 'false', style: card(on, 'display: flex; flex-direction: column; align-items: center; gap: 4px; min-height: 118px; padding: 16px 8px; text-align: center; justify-content: center;'), pick: () => this.setState({ fD: d[1] }) };
    });
    const curDay = days.find((d) => d[1] === s.fD) || days[1];
    const dayLabel = curDay[0] + ' ' + curDay[1] + '. Nov';
    const frisTimes = ['9:30', '11:00', '12:30', '14:00', '15:30', '17:00'].map((t) => {
      const on = t === s.fT;
      return { label: t, pressed: on ? 'true' : 'false', style: card(on, 'display: flex; align-items: center; justify-content: center; min-height: 56px; padding: 12px; font-size: 17px; letter-spacing: 0.04em;'), pick: () => this.setState({ fT: t }) };
    });
    const tracks = [
      { title: 'Late Light', len: '3:42' },
      { title: 'Nachtblau', len: '4:15' },
      { title: 'Slow Return', len: '5:03' }
    ];
    const denisTracks = tracks.map((t, i) => {
      const on = i === s.dTrack;
      return { no: '0' + (i + 1), title: t.title, len: t.len, pick: () => this.setState({ dTrack: i, dPlay: true }), style: 'all: unset; cursor: pointer; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; min-height: 52px; padding: 12px 8px; border-top: 1px solid #222222; font-weight: 700; ' + (on ? 'color: #c8833a;' : 'color: #f2efe9;') };
    });
    const go = {};
    ['cafe-karte', 'cafe-story', 'hand-team', 'kanz-team', 'phys-team', 'cafe-reservieren', 'hand-leistungen', 'hand-kontakt', 'fris-nadja', 'fris-termin', 'kanz-top', 'kanz-leistungen', 'kanz-kontakt', 'phys-top', 'phys-beh', 'phys-termin', 'denis-bio', 'denis-musik', 'denis-live', 'denis-booking'].forEach((id) => { go[id.replace(/-/g, '_')] = () => this.scrollToId(id); });
    return {
      ph,
      go,
      contactOpen: !s.cDone, contactDone: s.cDone, contactSend: () => this.sendContact(), contactErr: s.cErr || '', contactHasErr: !!s.cErr, contactBusy: !!s.cBusy, contactReset: () => this.setState({ cDone: false }),
      pageGo: { beispiele: () => this.smoothPage('beispiele'), leistungen: () => this.smoothPage('leistungen'), kontakt: () => this.smoothPage('kontakt') },
      setScroller: this.setScroller,
      openCafe: open('cafe'), openHand: open('handwerk'), openFris: open('friseur'), openKanz: open('kanzlei'), openPhys: open('physio'), openDenis: open('denis'),
      close: () => this.setState({ open: null }),
      stop: (e) => { if (e && e.stopPropagation) e.stopPropagation(); },
      prev: step(-1),
      next: step(1),
      isOpen: s.open !== null,
      isCafe: s.open === 'cafe',
      isHand: s.open === 'handwerk',
      isFris: s.open === 'friseur',
      isKanz: s.open === 'kanzlei',
      isPhys: s.open === 'physio',
      isDenis: s.open === 'denis',
      siteName: s.open ? meta[s.open].name : '',
      siteUrl: s.open ? meta[s.open].url : '',
      sitePos: s.open ? (idx + 1) + ' / ' + order.length : '',
      cafePersons: this.pills(['1', '2', '3', '4', '5+'], s.cafeP, 'cafeP', 'cafe'),
      cafeTimes: this.pills(['9:00', '10:30', '12:00', '14:00', '16:00'], s.cafeT, 'cafeT', 'cafe'),
      cafeOpenForm: !s.cafeDone,
      cafeDone: s.cafeDone,
      cafeSummary: 'Tisch für ' + s.cafeP + ' um ' + s.cafeT + ' Uhr.',
      cafeSend: () => this.setState({ cafeDone: true }),
      cafeReset: () => this.setState({ cafeDone: false }),
      handOpenForm: !s.handDone,
      handDone: s.handDone,
      handSend: () => this.setState({ handDone: true }),
      handReset: () => this.setState({ handDone: false }),
      frisServices: frisServices, frisDays: frisDays, frisTimes: frisTimes,
      frisOpenForm: !s.fDone,
      frisDone: s.fDone,
      frisSummary: s.fS + ' · ' + dayLabel + ' · ' + s.fT + ' Uhr',
      frisSend: () => this.setState({ fDone: true }),
      frisReset: () => this.setState({ fDone: false }),
      kanzTypes: this.pills(['Privatperson', 'Unternehmen', 'Gründer:in'], s.kT, 'kT', 'kanz'),
      kanzOpenForm: !s.kDone,
      kanzDone: s.kDone,
      kanzSend: () => this.setState({ kDone: true }),
      kanzReset: () => this.setState({ kDone: false }),
      physRx: this.pills(['Ja', 'Nein', 'Privat'], s.pR, 'pR', 'phys'),
      physTimes: this.pills(['Vormittags', 'Nachmittags', 'Abends'], s.pT, 'pT', 'phys'),
      physOpenForm: !s.pDone,
      physDone: s.pDone,
      physSummary: 'Rezept: ' + s.pR + ' · Wunschzeit: ' + s.pT + '. Wir rufen dich zurück.',
      physSend: () => this.setState({ pDone: true }),
      physReset: () => this.setState({ pDone: false }),
      denisTracks: denisTracks,
      denisToggle: () => this.setState({ dPlay: !s.dPlay }),
      denisPlaying: s.dPlay,
      denisPaused: !s.dPlay,
      denisPlayLabel: s.dPlay ? 'Pause' : 'Abspielen',
      denisStatus: s.dPlay ? 'Läuft gerade' : 'Hörprobe',
      denisNow: tracks[s.dTrack].title,
      eqState: s.dPlay ? '' : 'rl-eq-off',
      denisOccasions: this.pills(['Hochzeit', 'Firmenevent', 'Studio-Session', 'Unterricht'], s.dOcc, 'dOcc', 'denis'),
      denisOcc: s.dOcc,
      denisOpenForm: !s.dDone,
      denisDone: s.dDone,
      denisSend: () => this.setState({ dDone: true }),
      denisReset: () => this.setState({ dDone: false })
    };
  }
}

dcMount(Component, document.getElementById('dc-tpl'), document.getElementById('app'));
