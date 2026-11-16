(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  const REGION_NAMES = { africa: 'Africa', silk: 'Silk Road', asia: 'Asia Pacific' };

  // Toast
  const toast = (msg) => {
    const t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  };

  // Mobile menu
  const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open);
    });
    $$('#navLinks a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  // Membership state (prototype only)
  const isMember = () => store.get('b4t_member') === '1';
  const applyMember = () => {
    const m = isMember();
    document.body.classList.toggle('is-member', m);
    $$('.guest-only').forEach(el => el.style.display = m ? 'none' : '');
    ['#logoutBtn', '#toPortal'].forEach(s => { const el = $(s); if (el) el.style.display = m ? '' : 'none'; });
    renderConnect();
  };

  // Modals
  const openModal = (id) => { const m = document.getElementById(id); if (m) { m.classList.add('open'); const f = m.querySelector('input'); f && setTimeout(() => f.focus(), 50); } };
  const closeModals = () => $$('.modal.open').forEach(m => m.classList.remove('open'));
  $$('[data-open]').forEach(b => b.addEventListener('click', (e) => {
    e.preventDefault();
    if (b.dataset.kind) {
      postKind = b.dataset.kind;
      $('#postTitle').textContent = postKind === 'need' ? 'Post a need' : 'Offer a resource';
    }
    openModal(b.dataset.open);
  }));
  $$('[data-switch]').forEach(a => a.addEventListener('click', (e) => { e.preventDefault(); closeModals(); openModal(a.dataset.switch); }));
  $$('[data-close]').forEach(b => b.addEventListener('click', closeModals));
  $$('.modal').forEach(m => m.addEventListener('click', (e) => { if (e.target === m) closeModals(); }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });

  const loginForm = $('#loginForm');
  if (loginForm) loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if ($('#lPass').value.trim().toLowerCase() === 'b4t') {
      store.set('b4t_member', '1'); $('#loginErr').style.display = 'none';
      closeModals(); applyMember(); toast('Welcome back — members-only content is now visible.');
    } else { $('#loginErr').style.display = 'block'; }
  });
  const logout = $('#logoutBtn');
  if (logout) logout.addEventListener('click', () => { store.del('b4t_member'); applyMember(); toast('Signed out.'); });

  // Region tabs + hero buttons
  const selectRegion = (r) => {
    $$('#regions .tab').forEach(t => t.setAttribute('aria-selected', t.dataset.tab === r));
    $$('.region-panel').forEach(p => p.hidden = p.id !== 'panel-' + r);
  };
  $$('#regions .tab').forEach(t => t.addEventListener('click', () => selectRegion(t.dataset.tab)));
  $$('.region-btn, [data-region-link]').forEach(b => b.addEventListener('click', () => {
    selectRegion(b.dataset.region || b.dataset.regionLink);
    if (b.classList.contains('region-btn')) $('#regions').scrollIntoView({ behavior: 'smooth' });
  }));
  $$('[data-filter-region]').forEach(a => a.addEventListener('click', () => {
    const s = $('#fRegion'); if (s) { s.value = a.dataset.filterRegion; renderConnect(); }
  }));

  // Connect platform (sample data)
  const LISTINGS = [
    { kind: 'need', region: 'africa', type: 'Capital', title: 'Second truck for sanitation business', desc: 'Growing waste-management SME seeking growth capital to add a second vehicle.', amount: '~$25,000' },
    { kind: 'need', region: 'asia', type: 'Mentoring', title: 'Bookkeeping mentor for rice co-operative', desc: 'Farmer co-op needs monthly coaching on records, pricing and cash flow.' },
    { kind: 'need', region: 'silk', type: 'Expertise', title: 'Digital marketing for tourism start-up', desc: 'Guidance on bookings, SEO and social media for an adventure tourism business.' },
    { kind: 'need', region: 'silk', type: 'Prayer', title: 'Confidential partner request', desc: 'Details for registered members only.', locked: true },
    { kind: 'need', region: 'africa', type: 'Equipment', title: 'Industrial sewing machines', desc: 'Tailoring workshop training young women needs 4 machines.' },
    { kind: 'need', region: 'asia', type: 'Capital', title: 'Business plan under review', desc: 'Investor summary available to vetted members.', locked: true },
    { kind: 'resource', region: 'all', type: 'Mentoring', title: 'Retired CFO — 4 hrs/month', desc: 'Financial controls, budgeting and investor reporting. Online.' },
    { kind: 'resource', region: 'asia', type: 'Capital', title: 'Investor circle — agriculture', desc: 'Group of business owners open to $10k–$50k ticket sizes.' },
    { kind: 'resource', region: 'africa', type: 'Expertise', title: 'Agronomist volunteer', desc: 'Soil, irrigation and crop planning; can travel twice a year.' },
    { kind: 'resource', region: 'all', type: 'Expertise', title: 'Web & e-commerce studio', desc: 'Pro-bono websites for B4T entrepreneurs.' },
    { kind: 'resource', region: 'silk', type: 'Capital', title: 'Patient capital partner', desc: 'Details shared with members only.', locked: true }
  ];
  let postKind = 'need';
  const pill = (r) => r === 'all' ? '<span class="pill">All regions</span>' : `<span class="pill ${r}">${REGION_NAMES[r]}</span>`;
  const itemHTML = (l) => {
    const locked = l.locked && !isMember();
    return `<div class="item ${locked ? 'locked' : ''}">
      <h4 class="${locked ? 'blur' : ''}">${locked ? 'Restricted listing title here' : esc(l.title)}</h4>
      <p class="${locked ? 'blur' : ''}">${locked ? 'This listing contains sensitive information available to approved members.' : esc(l.desc)}</p>
      <div class="item-meta">${pill(l.region)}<span class="pill">${esc(l.type)}</span>${l.amount && !locked ? `<span class="pill">${esc(l.amount)}</span>` : ''}
      ${l.locked ? `<span class="lock-badge">🔒 Members only</span>` : ''}
      ${locked ? '<button class="btn btn-sm btn-ghost" data-unlock style="margin-left:auto;padding:4px 12px">Sign in</button>' : `<button class="btn btn-sm btn-ghost" data-respond style="margin-left:auto;padding:4px 12px">${l.kind === 'need' ? 'I can help' : 'Request'}</button>`}
      </div></div>`;
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function renderConnect() {
    const nl = $('#needList'); if (!nl) return;
    const r = $('#fRegion').value, t = $('#fType').value;
    const ok = (l) => (r === 'all' || l.region === r || l.region === 'all') && (t === 'all' || l.type === t);
    const needs = LISTINGS.filter(l => l.kind === 'need' && ok(l));
    const res = LISTINGS.filter(l => l.kind === 'resource' && ok(l));
    nl.innerHTML = needs.map(itemHTML).join('') || '<div class="empty">No needs match these filters.</div>';
    $('#resList').innerHTML = res.map(itemHTML).join('') || '<div class="empty">No resources match these filters.</div>';
    $('#needCount').textContent = needs.length; $('#resCount').textContent = res.length;
    $$('[data-unlock]').forEach(b => b.addEventListener('click', () => openModal('loginModal')));
    $$('[data-respond]').forEach(b => b.addEventListener('click', () => toast('Thanks! A B4T Developer would follow up to make the match. (Prototype)')));
  }
  ['#fRegion', '#fType'].forEach(s => { const el = $(s); el && el.addEventListener('change', renderConnect); });
  const postForm = $('#postForm');
  if (postForm) postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    LISTINGS.unshift({ kind: postKind, region: $('#pRegion').value, type: $('#pType').value, title: $('#pTitle').value, desc: $('#pDesc').value || '—', locked: $('#pSensitive').checked });
    postForm.reset(); closeModals(); renderConnect();
    toast('Listing added for this session (prototype — would go to moderation).');
  });

  // Training (sample data)
  const TRAININGS = [
    { d: '23', m: 'Jan 2027', title: 'Biblical Entrepreneurship Training', venue: 'Durban, South Africa', region: 'africa', format: 'In person · 3 days', seats: '20 seats' },
    { d: '13', m: 'Feb 2027', title: 'Developer Foundations', venue: 'Online (Zoom)', region: 'online', format: 'Online · 4 weekly sessions', seats: 'Open' },
    { d: '06', m: 'Mar 2027', title: 'Biblical Entrepreneurship Training', venue: 'Kuala Lumpur, Malaysia', region: 'asia', format: 'In person · 2 days', seats: '30 seats' },
    { d: '17', m: 'Apr 2027', title: 'Business Mentor Orientation', venue: 'Online (Zoom)', region: 'online', format: 'Online · 2 hours', seats: 'Open' },
    { d: '15', m: 'May 2027', title: 'Kingdom Business Bootcamp', venue: 'Location shared with members', region: 'silk', format: 'In person · 4 days', seats: 'By invitation', locked: true },
    { d: '12', m: 'Jun 2027', title: 'Biblical Entrepreneurship Training', venue: 'Kampala, Uganda', region: 'africa', format: 'In person · 3 days', seats: '25 seats' },
    { d: '07', m: 'Aug 2027', title: 'Investor Roundtable', venue: 'Kuala Lumpur, Malaysia', region: 'asia', format: 'In person · 1 day', seats: '15 seats' }
  ];
  const renderTraining = (f) => {
    const tb = $('#trainingBody'); if (!tb) return;
    const rows = TRAININGS.filter(t => f === 'all' || t.region === f);
    tb.innerHTML = rows.map(t => `<tr>
      <td><div class="date-box"><b>${t.d}</b><span>${t.m.split(' ')[0]}</span></div></td>
      <td><b>${t.title}</b><div class="seats">${t.m} · ${t.seats}</div></td>
      <td>${t.locked ? '<span class="lock-badge">🔒 Members only</span>' : t.venue}<div style="margin-top:4px">${t.region === 'online' ? '<span class="pill">Online</span>' : pill(t.region)}</div></td>
      <td class="muted">${t.format}</td>
      <td style="text-align:right"><button class="btn btn-sm btn-dark" data-register>Register interest</button></td>
    </tr>`).join('') || '<tr><td colspan="5" class="muted">No sessions scheduled.</td></tr>';
    $$('[data-register]').forEach(b => b.addEventListener('click', () => toast('Interest registered — we\'ll email details when registration opens. (Prototype)')));
  };
  $$('#trainingFilter .tab').forEach(b => b.addEventListener('click', () => {
    $$('#trainingFilter .tab').forEach(x => x.setAttribute('aria-selected', x === b));
    renderTraining(b.dataset.t);
  }));
  renderTraining('all');

  // Role links prefill contact
  $$('[data-role]').forEach(a => a.addEventListener('click', () => { const s = $('#cRole'); if (s) s.value = a.dataset.role; }));

  // Prototype forms
  const proto = (id, msg) => { const f = typeof id === 'string' ? $(id) : id; f && f.addEventListener('submit', (e) => { e.preventDefault(); f.reset(); closeModals(); toast(msg); if (f.id === 'subscribeForm') store.set('b4t_subscribed', '1'); }); };
  proto('#subscribeForm', 'You\'re subscribed! Watch your inbox for the next update. (Prototype)');
  proto('#contactForm', 'Message sent — the team will be in touch. (Prototype)');
  $$('.js-proto-form').forEach(f => proto(f, 'Request received — a regional leader will review it. (Prototype)'));

  // Update prompt after scrolling
  const prompt = $('#updatePrompt');
  if (prompt && !store.get('b4t_prompt_dismissed') && !store.get('b4t_subscribed')) {
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.6) { prompt.classList.add('show'); window.removeEventListener('scroll', onScroll); }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    prompt.querySelector('.x').addEventListener('click', () => { prompt.classList.remove('show'); store.set('b4t_prompt_dismissed', '1'); });
    prompt.querySelector('a').addEventListener('click', () => prompt.classList.remove('show'));
  }

  applyMember();
})();
