/* ============================================================
   20분 만에 이해하는 AI — 교재 뷰어 앱
   외부 라이브러리 없음. file:// 더블클릭 실행 전제.
   ============================================================ */
(function () {
  'use strict';

  var DOCS = (window.EDU_CONTENT && window.EDU_CONTENT.docs) || [];
  var byId = {};
  DOCS.forEach(function (d) { byId[d.id] = d; });
  var byFile = {};
  DOCS.forEach(function (d) { byFile[d.file] = d; });

  var CATS = {
    start:    { label: '시작하기',        color: 'var(--accent)' },
    lesson1:  { label: '1차시 · AI와 첫 만남',        color: 'var(--l1)' },
    lesson2:  { label: '2차시 · 프롬프트의 기술',     color: 'var(--l2)' },
    lesson3:  { label: '3차시 · AI 거짓말 탐정',      color: 'var(--l3)' },
    lesson4:  { label: '4차시 · AI와 함께 살아가기',  color: 'var(--l4)' },
    kit:      { label: '교사 키트',       color: 'var(--accent2)' },
    ext:      { label: '확장',            color: 'var(--l3)' },
    appendix: { label: '부록 · 근거 자료', color: 'var(--text-dim)' }
  };

  var LESSONS = [
    {
      id: 1, doc: 'plan1', ws: 'ws1', cls: 'c1',
      title: 'AI와 첫 만남 — 인공지능은 어떻게 말할까?',
      q: '같은 질문에 왜 매번 다른 답이 나올까?',
      desc: '"다음 단어 맞히기" 게임으로 확률 생성 원리를 몸으로 익히고, 게스트 모드로 첫 대화를 나눕니다. 개인정보 수칙을 세웁니다.',
      phases: [
        { t: 0,    label: '도입 — 다음 단어 맞히기 게임' },
        { t: 180,  label: '개념 — 말 만들기 기계(확률)' },
        { t: 420,  label: '실습① 게스트 접속' },
        { t: 540,  label: '실습② 미션1 공통 프롬프트' },
        { t: 720,  label: '실습③ 옆 친구와 결과 비교' },
        { t: 840,  label: '실습④ 미션2 자유 질문' },
        { t: 1020, label: '정리 — 3줄 정리·자기평가' }
      ]
    },
    {
      id: 2, doc: 'plan2', ws: 'ws2', cls: 'c2',
      title: '프롬프트의 기술 — AI에게 잘 부탁하는 법',
      q: '어떻게 부탁해야 원하는 답이 나올까?',
      desc: '레시피 4요소(역할–상황–요청–형식)로 A/B 실험을 하고, "3줄로 줄여 줘" 같은 후속 지시(멀티턴)를 연습합니다.',
      phases: [
        { t: 0,    label: '도입 — 심부름 비유' },
        { t: 180,  label: '개념 — 레시피 4요소' },
        { t: 390,  label: '실습1 — A안 「시 써 줘」' },
        { t: 480,  label: '실습2 — B안 4요소 프롬프트' },
        { t: 600,  label: '실습3 — A/B 비교 관찰' },
        { t: 720,  label: '실습4 — 멀티턴 미션 2개' },
        { t: 900,  label: '실습5 — 베스트 결과 옮겨 적기' },
        { t: 990,  label: '정리1 — 나만의 레시피 카드' },
        { t: 1110, label: '정리2 — 베스트 공유·예고' }
      ]
    },
    {
      id: 3, doc: 'plan3', ws: 'ws3', cls: 'c3',
      title: 'AI 거짓말 탐정 — 환각 수사대',
      q: 'AI가 한 말은 다 사실일까?',
      desc: '세종대왕 맥북프로 사건을 직접 수사하고(환각 재현도, AI의 부인도 모두 수사 성공!), 검증 3단계 습관을 만듭니다.',
      phases: [
        { t: 0,    label: '도입 — 세종대왕 사건 소개' },
        { t: 180,  label: '개념 — 환각과 검증 3단계' },
        { t: 360,  label: '실습① 사건 수사(공통 입력)' },
        { t: 480,  label: '실습② 기록·갈래 판정' },
        { t: 660,  label: '실습③ 함정 질문 수사' },
        { t: 840,  label: '실습④ 검증 3단계 적용' },
        { t: 960,  label: '정리 — 구호·탐정 서약' }
      ]
    },
    {
      id: 4, doc: 'plan4', ws: 'ws4', cls: 'c4',
      title: 'AI와 함께 살아가기 — 정직한 사용 선언',
      q: 'AI가 다 써 준 숙제는 내 숙제일까?',
      desc: '경계선 OX 토론으로 윤리 감각을 세우고, AI 초안을 내 문장으로 고쳐 쓰며 "나의 AI 사용 선언문"을 완성합니다.',
      phases: [
        { t: 0,    label: '도입 — 딜레마 투표' },
        { t: 180,  label: '개념 — 도구 vs 대필' },
        { t: 360,  label: '실습1 — 경계선 카드 토론 5장' },
        { t: 600,  label: '실습2-1 — AI에게 초안 요청' },
        { t: 750,  label: '실습2-2 — 내 문장으로 고쳐 쓰기' },
        { t: 960,  label: '정리1 — 복습 미니 퀴즈' },
        { t: 1080, label: '정리2 — 선언문 낭독·게시' }
      ]
    }
  ];
  var TOTAL = 1200; // 20분

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var store = {
    get: function (k, fb) { try { var v = localStorage.getItem(k); return v === null ? fb : JSON.parse(v); } catch (e) { return fb; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- 테마 · 글자 크기 ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    store.set('edu-theme', t);
  }
  applyTheme(store.get('edu-theme', (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light'));
  $('#btn-theme').addEventListener('click', function () {
    applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  var fontSize = store.get('edu-font', 16);
  function applyFont() {
    fontSize = Math.min(21, Math.max(13, fontSize));
    document.documentElement.style.setProperty('--content-fs', fontSize + 'px');
    store.set('edu-font', fontSize);
  }
  applyFont();
  $('#btn-font-up').addEventListener('click', function () { fontSize += 1; applyFont(); });
  $('#btn-font-down').addEventListener('click', function () { fontSize -= 1; applyFont(); });
  $('#btn-print').addEventListener('click', function () { window.print(); });

  /* ---------- 사이드바 ---------- */
  function buildSidebar() {
    var sb = $('#sidebar');
    var html = '<a class="nav-home" href="#/" data-nav-home>🏠 홈 대시보드</a>';
    Object.keys(CATS).forEach(function (cat) {
      var docs = DOCS.filter(function (d) { return d.cat === cat; });
      if (!docs.length) return;
      html += '<div class="nav-group open" data-cat="' + cat + '">' +
        '<button class="nav-cat"><span class="dot" style="background:' + CATS[cat].color + '"></span>' +
        esc(CATS[cat].label) + '<span class="tw">▶</span></button><ul class="nav-items">';
      docs.forEach(function (d) {
        html += '<li><a href="#/doc/' + d.id + '" data-doc="' + d.id + '">' + esc(d.nav) + '</a></li>';
      });
      html += '</ul></div>';
    });
    html += '<div class="sidebar-note">인쇄 배포용 원본은 저장소의 마크다운 문서입니다. 이 웹 교재는 <code>web/index.html</code>을 브라우저로 열기만 하면 오프라인에서 동작합니다.</div>';
    sb.innerHTML = html;
    $$('.nav-cat', sb).forEach(function (btn) {
      btn.addEventListener('click', function () { btn.parentElement.classList.toggle('open'); });
    });
    sb.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });
  }
  function openNav() { document.body.classList.add('nav-open'); }
  function closeNav() { document.body.classList.remove('nav-open'); }
  $('#btn-menu').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  $('#backdrop').addEventListener('click', closeNav);

  function markActive(id) {
    $$('#sidebar a').forEach(function (a) { a.classList.remove('active'); });
    if (id === null) { var h = $('[data-nav-home]'); if (h) h.classList.add('active'); return; }
    var a = $('#sidebar a[data-doc="' + id + '"]');
    if (a) {
      a.classList.add('active');
      a.closest('.nav-group').classList.add('open');
    }
  }

  /* ---------- 홈 대시보드 ---------- */
  var KIT_DESC = {
    checklist: 'D-7부터 수업 직후까지 단계별 준비 체크박스. 게스트 접속 3회 테스트가 최우선.',
    trouble: '"로그인 화면만 떠요" 등 12+ 상황별 증상→원인→조치. 수업 흐름을 끊지 않는 전환 순서.',
    snippets: '전 차시 실습 프롬프트 대본집 — 안내 멘트·예시 답변·지도 포인트·보너스 프롬프트.',
    rubric: '차시별 관찰 체크리스트, 산출물 3종 루브릭, 자기평가지, 생기부 기록 예시문.',
    poster: '교실 게시용 5대 안전 수칙 — 구호 형태. 인쇄 버튼으로 바로 출력.',
    parents: '가정통신문 양식 — 로그인·계정 수집이 없는 수업임을 학부모에게 안내.',
    faq: '"AI가 살아 있어요?" 등 돌발질문 23개에 대한 20초 즉답 가이드.'
  };
  function renderHome() {
    var el = $('#content');
    var h = '';
    h += '<div class="home-hero"><h1>20분 만에 이해하는 AI</h1>' +
      '<p>중학교 1학년 교실에서 <strong>제미나이(Gemini) 게스트 모드(로그인 없이 사용)</strong>만으로 진행하는 생성형 AI 리터러시 수업 패키지입니다. ' +
      '준비(체크리스트)부터 수업(지도안·프롬프트 대본)과 평가(루브릭)까지, 이 교재 하나로 끝냅니다.</p>' +
      '<div class="hero-tags"><span>20분 × 4회차</span><span>로그인 · 계정 수집 없음</span><span>1인 1기기 / 모둠 / 시연 3가지 운영</span><span>모든 차시 플랜 B 포함</span><span>문서 20종 수록</span></div></div>';

    h += '<section class="home-section"><h2>🚀 빠른 시작 — 수업이 내일이라면</h2><ol class="step-list">' +
      '<li><a href="#/doc/checklist">사전준비 체크리스트</a>의 D-1 항목부터 실행 — 학교 네트워크에서 시크릿 창으로 <b>게스트 접속 3회 테스트</b></li>' +
      '<li><a href="#/doc/plan1">1차시 지도안</a> 정독 — 분 단위 흐름표·발문 스크립트 (20분 수업엔 애드리브 여유가 없습니다)</li>' +
      '<li><a href="#/doc/snippets">프롬프트 스니펫</a>을 교사 기기에서 1회 사전 실행 — 결과 적절성 확인</li>' +
      '<li><a href="#/doc/ws1">1차시 학습지</a> 인쇄 — 게스트 모드는 기록이 저장되지 않으므로 <b>학습지가 곧 저장소</b></li></ol></section>';

    h += '<section class="home-section"><h2>📚 4차시 한눈에 보기</h2><div class="card-grid">';
    LESSONS.forEach(function (L) {
      h += '<a class="card lesson-card ' + L.cls + '" href="#/doc/' + L.doc + '">' +
        '<div class="card-kicker">' + L.id + '차시 · 20분</div>' +
        '<h3>' + esc(L.title) + '</h3>' +
        '<p><b>핵심 질문:</b> ' + esc(L.q) + '</p><p style="margin-top:6px">' + esc(L.desc) + '</p>' +
        '<div class="card-links"><span>지도안</span><span>학습지</span><span>타이머 지원</span></div></a>';
    });
    h += '</div></section>';

    h += '<section class="home-section"><h2>🧰 교사 키트</h2><div class="card-grid">';
    DOCS.filter(function (d) { return d.cat === 'kit'; }).forEach(function (d) {
      h += '<a class="card" href="#/doc/' + d.id + '"><h3>' + esc(d.nav) + '</h3><p>' + esc(KIT_DESC[d.id] || '') + '</p></a>';
    });
    h += '</div></section>';

    h += '<section class="home-section"><h2>🛡 5대 안전 수칙 <small style="font-weight:400;color:var(--text-dim)">— 자세한 내용은 <a href="#/doc/poster">안전수칙 포스터</a></small></h2>' +
      '<div class="rule-chips"><span>1️⃣ 개인정보 입력 금지 — 진짜 이름 말고 별명</span><span>2️⃣ AI 말은 일단 의심 — 검증 3단계</span>' +
      '<span>3️⃣ 이상하면 멈추고 선생님께</span><span>4️⃣ 진짜 얼굴 금지 — 나만의 캐릭터 (확장 차시)</span><span>5️⃣ "AI와 함께 만들었어요" 정직한 표시</span></div></section>';

    h += '<section class="home-section"><h2>🔭 확장 · 부록</h2><div class="card-grid">';
    DOCS.filter(function (d) { return d.cat === 'ext' || d.cat === 'appendix' || d.cat === 'start'; }).forEach(function (d) {
      var desc = { 'ext-image': '학교 Workspace for Education 계정이 있을 때만 진행하는 선택 5차시 — 이미지 안전 수칙 포함.',
        'ext-club': '10분 자투리 활동 5종, 교과 연계 프로젝트 4종, 동아리 8차시 로드맵.',
        research: '게스트 모드를 1순위로 결정한 근거 — 연령·계정 정책, 개인정보 보호법, 출처 링크.',
        readme: '패키지 전체 파일 맵과 사용 순서 안내.',
        overview: '설계 철학, 4차시 아크, 운영 시나리오 3종, 안전·법적 고려 요약.' }[d.id] || '';
      h += '<a class="card" href="#/doc/' + d.id + '"><h3>' + esc(d.nav) + '</h3><p>' + esc(desc) + '</p></a>';
    });
    h += '</div></section>';

    h += '<div class="home-note">⚠️ <b>2026년 7월 기준.</b> 게스트 모드의 가용 범위·연령 정책은 예고 없이 바뀔 수 있습니다. ' +
      '수업 전 실제 접속 화면이 최종 기준이며, 이 자료는 법률 자문이 아닙니다. 근거와 출처는 <a href="#/doc/research">부록</a>에 있습니다.</div>';

    el.className = 'doc home';
    el.innerHTML = h;
    $('#toc').innerHTML = '';
    $('#pager').innerHTML = '';
    markActive(null);
    document.title = '20분 만에 이해하는 AI — 중1 제미나이 수업 교재';
    window.scrollTo(0, 0);
  }

  /* ---------- 문서 렌더 ---------- */
  var pendingQuery = null;

  function docLessonOf(d) {
    var m = /^lesson([1-4])$/.exec(d.cat);
    return m ? Number(m[1]) : null;
  }

  function renderDoc(id) {
    var d = byId[id];
    if (!d) { renderHome(); return; }
    var el = $('#content');
    var head = '<header class="doc-head"><div class="crumb"><b>' + esc(CATS[d.cat].label) + '</b> · <span>' + esc(d.file) + '</span></div>' +
      '<div class="doc-actions">' +
      '<button class="btn primary" data-act="print">🖨 ' + (d.print ? '이 문서 인쇄 (배포용)' : '이 문서 인쇄') + '</button>' +
      (docLessonOf(d) ? '<button class="btn" data-act="timer">⏱ ' + docLessonOf(d) + '차시 타이머 열기</button>' : '') +
      (d.tasklist ? '<button class="btn" data-act="reset-tasks">↺ 체크 초기화</button>' : '') +
      '</div></header>';
    el.className = 'doc';
    el.innerHTML = head + d.html;

    // 표 → 가로 스크롤 래퍼
    $$('#content table').forEach(function (t) {
      if (t.parentElement.classList.contains('table-wrap')) return;
      var w = document.createElement('div');
      w.className = 'table-wrap';
      t.parentNode.insertBefore(w, t);
      w.appendChild(t);
    });

    // 문서 내 .md 상대 링크 → 앱 내 라우트
    $$('#content a[href$=".md"]').forEach(function (a) {
      var href = a.getAttribute('href').replace(/^\.\//, '').replace(/^\.\.\//, '');
      var target = byFile[href] || byFile[decodeURIComponent(href)];
      if (target) a.setAttribute('href', '#/doc/' + target.id);
    });

    // 인용구·코드 블록 복사 버튼
    $$('#content blockquote, #content pre').forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = '📋 복사';
      btn.addEventListener('click', function () {
        var text = b.innerText.replace(/^📋 복사\s*/, '').trim();
        var done = function () {
          btn.textContent = '✓ 복사됨';
          btn.classList.add('ok');
          setTimeout(function () { btn.textContent = '📋 복사'; btn.classList.remove('ok'); }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        } else { fallbackCopy(text); done(); }
      });
      b.appendChild(btn);
    });

    // 체크박스 상태 저장/복원
    var checks = $$('#content .task-check');
    if (checks.length) {
      var key = 'edu-tasks-' + d.id;
      var saved = store.get(key, []);
      checks.forEach(function (c, i) {
        c.checked = saved.indexOf(i) !== -1;
        c.addEventListener('change', function () {
          var now = [];
          checks.forEach(function (cc, ii) { if (cc.checked) now.push(ii); });
          store.set(key, now);
        });
      });
    }

    // 액션 버튼
    el.addEventListener('click', function (e) {
      var act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'print') window.print();
      if (act.dataset.act === 'timer') openTimer(docLessonOf(d));
      if (act.dataset.act === 'reset-tasks') {
        store.set('edu-tasks-' + d.id, []);
        $$('#content .task-check').forEach(function (c) { c.checked = false; });
      }
    });

    buildToc();
    buildPager(d);
    markActive(id);
    document.title = d.title + ' — 20분 만에 이해하는 AI';

    if (pendingQuery) { highlightQuery(pendingQuery); pendingQuery = null; }
    else window.scrollTo(0, 0);
  }

  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- 목차 + 스크롤스파이 ---------- */
  var spy = null;
  function buildToc() {
    var hs = $$('#content h2, #content h3');
    var toc = $('#toc');
    if (hs.length < 2) { toc.innerHTML = ''; return; }
    var h = '<div class="toc-title">이 문서의 목차</div><ol>';
    hs.forEach(function (hd, i) {
      hd.id = 'h-' + i;
      h += '<li class="lv' + hd.tagName[1] + '"><a href="#' + hd.id + '" data-toc="' + hd.id + '">' + esc(hd.textContent) + '</a></li>';
    });
    toc.innerHTML = h + '</ol>';
    // 해시 라우터와 충돌하지 않도록 목차 클릭은 scrollIntoView로 처리
    $$('#toc a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = document.getElementById(a.dataset.toc);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    if (spy) spy.disconnect();
    spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          $$('#toc a').forEach(function (a) { a.classList.remove('active'); });
          var a = $('#toc a[data-toc="' + en.target.id + '"]');
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-10% 0px -80% 0px' });
    hs.forEach(function (hd) { spy.observe(hd); });
  }

  function buildPager(d) {
    var i = DOCS.indexOf(d);
    var prev = DOCS[i - 1], next = DOCS[i + 1];
    var h = '';
    h += prev ? '<a class="prev" href="#/doc/' + prev.id + '"><small>← 이전 문서</small><b>' + esc(prev.title) + '</b></a>' : '<span style="flex:1"></span>';
    h += next ? '<a class="next" href="#/doc/' + next.id + '"><small>다음 문서 →</small><b>' + esc(next.title) + '</b></a>' : '<span style="flex:1"></span>';
    $('#pager').innerHTML = h;
  }

  /* ---------- 검색 ---------- */
  var searchIndex = null;
  function ensureIndex() {
    if (searchIndex) return;
    var scratch = document.createElement('div');
    searchIndex = DOCS.map(function (d) {
      scratch.innerHTML = d.html;
      return { id: d.id, title: d.title, cat: d.cat, text: scratch.textContent.replace(/\s+/g, ' ') };
    });
    scratch.innerHTML = '';
  }
  function openSearch() {
    ensureIndex();
    $('#search-overlay').classList.remove('hidden');
    var inp = $('#search-input');
    inp.value = '';
    $('#search-results').innerHTML = '<p class="search-hint">두 글자 이상 입력하면 20개 문서 전체에서 찾아 드립니다.</p>';
    setTimeout(function () { inp.focus(); }, 30);
  }
  function closeSearch() { $('#search-overlay').classList.add('hidden'); }
  $('#btn-search').addEventListener('click', openSearch);
  $('#search-close').addEventListener('click', closeSearch);
  $('#search-overlay').addEventListener('click', function (e) { if (e.target === e.currentTarget) closeSearch(); });

  function runSearch(q) {
    var res = $('#search-results');
    q = q.trim();
    if (q.length < 2) {
      res.innerHTML = '<p class="search-hint">두 글자 이상 입력하면 20개 문서 전체에서 찾아 드립니다.</p>';
      return;
    }
    var lq = q.toLowerCase();
    var items = [];
    searchIndex.forEach(function (d) {
      var lt = d.text.toLowerCase();
      var from = 0, count = 0, firstPos = -1;
      while (count < 50) {
        var p = lt.indexOf(lq, from);
        if (p === -1) break;
        if (firstPos === -1) firstPos = p;
        count++;
        from = p + lq.length;
      }
      if (count) items.push({ d: d, count: count, pos: firstPos });
    });
    items.sort(function (a, b) { return b.count - a.count; });
    if (!items.length) {
      res.innerHTML = '<p class="search-hint">「' + esc(q) + '」 — 결과가 없습니다. 띄어쓰기를 바꾸거나 짧은 단어로 검색해 보세요.</p>';
      return;
    }
    var h = '';
    items.slice(0, 20).forEach(function (it) {
      var s = Math.max(0, it.pos - 45);
      var snippet = (s > 0 ? '…' : '') + it.d.text.substr(s, 130) + '…';
      snippet = esc(snippet).replace(new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), function (m) { return '<mark>' + m + '</mark>'; });
      h += '<a class="search-item" href="#/doc/' + it.d.id + '" data-q="' + esc(q) + '">' +
        '<div class="si-doc">' + esc(CATS[it.d.cat].label) + ' › ' + esc(it.d.title) + ' <span style="color:var(--text-dim);font-weight:400">(' + it.count + '곳)</span></div>' +
        '<div class="si-snippet">' + snippet + '</div></a>';
    });
    res.innerHTML = h;
  }
  $('#search-input').addEventListener('input', function () { runSearch(this.value); });
  $('#search-results').addEventListener('click', function (e) {
    var a = e.target.closest('.search-item');
    if (!a) return;
    pendingQuery = a.dataset.q;
    closeSearch();
  });

  function highlightQuery(q) {
    var content = $('#content');
    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, null);
    var nodes = [];
    var lq = q.toLowerCase();
    var n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue.toLowerCase().indexOf(lq) !== -1 && !n.parentElement.closest('script,style,button')) nodes.push(n);
    }
    nodes.forEach(function (node) {
      var frag = document.createDocumentFragment();
      var rest = node.nodeValue;
      var li;
      while ((li = rest.toLowerCase().indexOf(lq)) !== -1) {
        frag.appendChild(document.createTextNode(rest.slice(0, li)));
        var mk = document.createElement('mark');
        mk.className = 'search-hit';
        mk.style.background = 'color-mix(in srgb, var(--l3) 35%, transparent)';
        mk.textContent = rest.substr(li, q.length);
        frag.appendChild(mk);
        rest = rest.slice(li + q.length);
      }
      frag.appendChild(document.createTextNode(rest));
      node.parentNode.replaceChild(frag, node);
    });
    var first = $('#content mark.search-hit');
    if (first) setTimeout(function () { first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 60);
    else window.scrollTo(0, 0);
  }

  /* ---------- 20분 수업 타이머 ---------- */
  var timer = { lesson: 0, sec: 0, running: false, iv: null, lastPhase: -1 };
  var timerEl = $('#timer');

  function timerPhases() { return LESSONS[timer.lesson].phases; }
  function phaseAt(sec) {
    var ph = timerPhases();
    for (var i = ph.length - 1; i >= 0; i--) if (sec >= ph[i].t) return i;
    return 0;
  }
  function fmt(sec) {
    var m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }
  function buildTrack() {
    var ph = timerPhases();
    var h = '';
    ph.forEach(function (p, i) {
      var end = (i + 1 < ph.length) ? ph[i + 1].t : TOTAL;
      var w = ((end - p.t) / TOTAL * 100).toFixed(2);
      h += '<div class="seg" data-i="' + i + '" style="width:' + w + '%" title="' + esc(p.label) + ' (' + fmt(p.t) + '~' + fmt(end) + ')"><div class="fill"></div></div>';
    });
    $('#timer-track').innerHTML = h;
  }
  function beep(n) {
    if (!$('#timer-sound').checked) return;
    try {
      var ctx = beep.ctx || (beep.ctx = new (window.AudioContext || window.webkitAudioContext)());
      for (var i = 0; i < n; i++) {
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 880;
        var t0 = ctx.currentTime + i * 0.25;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
        o.start(t0); o.stop(t0 + 0.22);
      }
    } catch (e) {}
  }
  function timerRender() {
    var ph = timerPhases();
    var i = phaseAt(timer.sec);
    $('#timer-clock').textContent = fmt(Math.min(timer.sec, TOTAL));
    var end = (i + 1 < ph.length) ? ph[i + 1].t : TOTAL;
    if (timer.sec >= TOTAL) {
      $('#timer-phase-now').textContent = '⏰ 20분 종료!';
      $('#timer-phase-next').textContent = '수고하셨습니다 — 창 닫기(기록 소멸) 안내를 잊지 마세요';
    } else {
      $('#timer-phase-now').textContent = ph[i].label;
      $('#timer-phase-next').textContent = '다음 단계까지 ' + fmt(end - timer.sec) +
        ((i + 1 < ph.length) ? ' → ' + ph[i + 1].label : ' (수업 종료)');
    }
    timerEl.classList.toggle('warn', timer.sec >= TOTAL - 120 && timer.sec < TOTAL);
    timerEl.classList.toggle('over', timer.sec >= TOTAL);
    $$('#timer-track .seg').forEach(function (seg, si) {
      var pStart = ph[si].t;
      var pEnd = (si + 1 < ph.length) ? ph[si + 1].t : TOTAL;
      seg.classList.toggle('done', timer.sec >= pEnd);
      var fill = seg.firstElementChild;
      if (timer.sec > pStart && timer.sec < pEnd) fill.style.width = ((timer.sec - pStart) / (pEnd - pStart) * 100) + '%';
      else fill.style.width = timer.sec >= pEnd ? '100%' : '0';
    });
    if (i !== timer.lastPhase) {
      if (timer.lastPhase !== -1 && timer.running) beep(1);
      timer.lastPhase = i;
    }
    if (timer.sec === TOTAL && timer.running) { beep(3); timerStop(); }
  }
  function timerStart() {
    if (timer.running) return timerStop();
    timer.running = true;
    $('#timer-start').textContent = '일시정지';
    timer.iv = setInterval(function () { timer.sec += 1; timerRender(); }, 1000);
  }
  function timerStop() {
    timer.running = false;
    $('#timer-start').textContent = timer.sec ? '계속' : '시작';
    clearInterval(timer.iv);
  }
  function timerReset() {
    timerStop();
    timer.sec = 0; timer.lastPhase = -1;
    $('#timer-start').textContent = '시작';
    timerRender();
  }
  function openTimer(lessonId) {
    timerEl.classList.remove('hidden', 'minimized');
    if (lessonId && lessonId - 1 !== timer.lesson) {
      timer.lesson = lessonId - 1;
      $('#timer-lesson').value = String(timer.lesson);
      buildTrack(); timerReset();
    }
    timerRender();
  }
  (function initTimer() {
    var sel = $('#timer-lesson');
    sel.innerHTML = LESSONS.map(function (L, i) {
      return '<option value="' + i + '">' + L.id + '차시 — ' + esc(L.title.split(' — ')[0]) + '</option>';
    }).join('');
    sel.addEventListener('change', function () {
      timer.lesson = Number(sel.value);
      buildTrack(); timerReset();
    });
    buildTrack(); timerRender();
    $('#timer-start').addEventListener('click', timerStart);
    $('#timer-reset').addEventListener('click', timerReset);
    $('#btn-timer').addEventListener('click', function () {
      if (timerEl.classList.contains('hidden')) openTimer();
      else timerEl.classList.add('hidden');
    });
    $('#timer-close').addEventListener('click', function () { timerEl.classList.add('hidden'); });
    $('#timer-min').addEventListener('click', function () { timerEl.classList.toggle('minimized'); });
    $('#timer-track').addEventListener('click', function (e) {
      var rect = e.currentTarget.getBoundingClientRect();
      timer.sec = Math.round((e.clientX - rect.left) / rect.width * TOTAL);
      timer.lastPhase = phaseAt(timer.sec);
      timerRender();
    });
    // 드래그 이동 (데스크톱)
    var head = $('.timer-head'), drag = null;
    head.addEventListener('mousedown', function (e) {
      if (e.target.closest('button')) return;
      var r = timerEl.getBoundingClientRect();
      drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      e.preventDefault();
    });
    document.addEventListener('mousemove', function (e) {
      if (!drag) return;
      timerEl.style.left = Math.max(4, Math.min(window.innerWidth - timerEl.offsetWidth - 4, e.clientX - drag.dx)) + 'px';
      timerEl.style.top = Math.max(4, Math.min(window.innerHeight - 40, e.clientY - drag.dy)) + 'px';
      timerEl.style.right = 'auto'; timerEl.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function () { drag = null; });
  })();

  /* ---------- 라우터 ---------- */
  function route() {
    var hash = location.hash || '#/';
    var m = /^#\/doc\/([\w-]+)/.exec(hash);
    if (m) renderDoc(m[1]);
    else renderHome();
  }
  window.addEventListener('hashchange', route);

  /* ---------- 단축키 ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSearch(); closeNav(); return; }
    var typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (typing) return;
    if (e.key === '/') { e.preventDefault(); openSearch(); }
    if (e.key === 't' || e.key === 'T') openTimer();
  });

  /* ---------- 시작 ---------- */
  buildSidebar();
  route();
})();
