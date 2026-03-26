(() => {
  // ── State ──────────────────────────────────────────────
  const MODES = {
    work:  { label: '집중',  minutes: 25 },
    break: { label: '휴식',  minutes: 5  },
  };

  let mode        = 'work';
  let totalSecs   = MODES.work.minutes * 60;
  let remaining   = totalSecs;
  let running     = false;
  let intervalId  = null;

  // ── DOM refs ───────────────────────────────────────────
  const timerText   = document.getElementById('timer-text');
  const modeText    = document.getElementById('mode-text');
  const tomatoBody  = document.getElementById('tomato-body');
  const progressRing= document.getElementById('progress-ring');
  const CIRCUMFERENCE = 2 * Math.PI * 120; // r=120
  const labelInput  = document.getElementById('label-input');
  const btnStart    = document.getElementById('btn-start');
  const btnReset    = document.getElementById('btn-reset');
  const historyList = document.getElementById('history-list');
  const statSessions= document.getElementById('stat-sessions');
  const statMinutes = document.getElementById('stat-minutes');

  // ── Timer core ─────────────────────────────────────────
  function tick() {
    remaining--;
    render();
    if (remaining <= 0) finish();
  }

  function start() {
    if (running) { pause(); return; }
    running = true;
    intervalId = setInterval(tick, 1000);
    btnStart.textContent = '일시정지';
    btnReset.disabled = false;
  }

  function pause() {
    running = false;
    clearInterval(intervalId);
    btnStart.textContent = '재개';
  }

  function reset() {
    pause();
    remaining = totalSecs;
    btnStart.textContent = '시작';
    btnReset.disabled = true;
    render();
  }

  async function finish() {
    pause();
    const elapsed = Math.round(totalSecs / 60) || 1;
    const label   = labelInput.value.trim() || null;
    await saveSession(mode, elapsed, label);
    btnStart.textContent = '시작';
    btnReset.disabled = true;
    remaining = totalSecs;
    render();
    loadHistory();
    loadStats();
  }

  // ── Mode switching ─────────────────────────────────────
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      if (running) return;
      mode = tab.dataset.mode;
      totalSecs = MODES[mode].minutes * 60;
      remaining = totalSecs;
      document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      tomatoBody.setAttribute('fill', mode === 'work' ? '#e94560' : '#53d8fb');
      modeText.textContent = MODES[mode].label;
      btnReset.disabled = true;
      btnStart.textContent = '시작';
      render();
    });
  });

  // ── Render ─────────────────────────────────────────────
  function render() {
    const m = String(Math.floor(remaining / 60)).padStart(2, '0');
    const s = String(remaining % 60).padStart(2, '0');
    timerText.textContent = `${m}:${s}`;
    document.title = `${m}:${s} · 포모도로`;
    progressRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - remaining / totalSecs);
  }

  // ── Controls ───────────────────────────────────────────
  btnStart.addEventListener('click', start);
  btnReset.addEventListener('click', reset);

  // ── API helpers ────────────────────────────────────────
  async function saveSession(type, duration_minutes, label) {
    await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, duration_minutes, label }),
    });
  }

  async function loadHistory() {
    const res  = await fetch('/api/sessions?limit=20');
    const data = await res.json();
    renderHistory(data.sessions);
  }

  async function loadStats() {
    const res  = await fetch('/api/sessions/stats');
    const data = await res.json();
    statSessions.textContent = data.today.work_sessions;
    statMinutes.textContent  = data.today.work_minutes;
  }

  async function deleteSession(id) {
    await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    loadHistory();
    loadStats();
  }

  // ── Render history ─────────────────────────────────────
  function renderHistory(sessions) {
    if (!sessions.length) {
      historyList.innerHTML = '<p class="empty-state">아직 기록이 없습니다</p>';
      return;
    }
    historyList.innerHTML = sessions.map(s => {
      const badgeLabel = s.type === 'work' ? '집중' : '휴식';
      const itemLabel  = s.label || (s.type === 'work' ? '집중 세션' : '휴식 세션');
      const time       = s.completed_at.slice(0, 16).replace('T', ' ');
      return `
        <div class="history-item">
          <span class="badge ${s.type}">${badgeLabel}</span>
          <span class="item-label">${escHtml(itemLabel)}</span>
          <span class="item-meta">${s.duration_minutes}분 · ${time.slice(11)}</span>
          <button class="item-delete" data-id="${s.id}" title="삭제">✕</button>
        </div>`;
    }).join('');

    historyList.querySelectorAll('.item-delete').forEach(btn => {
      btn.addEventListener('click', () => deleteSession(Number(btn.dataset.id)));
    });
  }

  function escHtml(str) {
    return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── Init ───────────────────────────────────────────────
  btnReset.disabled = true;
  render();
  loadHistory();
  loadStats();
})();
