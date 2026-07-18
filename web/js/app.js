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

  /* ---------- 책(ebook) 목차 — 위키독스식 부·절 구조 ---------- */
  var BOOK = [
    { part: '들어가며', num: '', color: 'var(--accent)', items: [
      { id: 'preface', label: '머리말' },
      { id: 'howto', label: '이 책의 사용법' }
    ] },
    { part: '제1부 수업을 열기 전에', num: '1', color: 'var(--accent)', items: [
      { id: 'overview', label: '교육과정 개요' },
      { id: 'checklist', label: '사전준비 체크리스트' },
      { id: 'trouble', label: '트러블슈팅 가이드' },
      { id: 'parents', label: '학부모 안내문' },
      { id: 'poster', label: '안전수칙 포스터' }
    ] },
    { part: '제2부 1탄 · AI 리터러시 기초', num: '2', color: 'var(--l1)', items: [
      { id: 'plan1', label: '1차시 지도안 — AI와 첫 만남' },
      { id: 'ws1', label: '1차시 학습지' },
      { id: 'plan2', label: '2차시 지도안 — 프롬프트의 기술' },
      { id: 'ws2', label: '2차시 학습지' },
      { id: 'plan3', label: '3차시 지도안 — AI 거짓말 탐정' },
      { id: 'ws3', label: '3차시 학습지 (수사 보고서)' },
      { id: 'plan4', label: '4차시 지도안 — AI와 함께 살아가기' },
      { id: 'ws4', label: '4차시 학습지 (사용 선언문)' },
      { id: 'snippets', label: '프롬프트 스니펫 (1탄)' },
      { id: 'rubric', label: '평가 루브릭 (1탄)' }
    ] },
    { part: '제3부 2탄 · AI 창작 공방', num: '3', color: 'var(--accent2)', items: [
      { id: 'v2-overview', label: '2탄 개요 — 창작 3원칙' },
      { id: 'v2p1', label: '1차시 지도안 — 이야기 공장' },
      { id: 'v2w1', label: '1차시 학습지' },
      { id: 'v2p2', label: '2차시 지도안 — 캐릭터 공방' },
      { id: 'v2w2', label: '2차시 학습지' },
      { id: 'v2p3', label: '3차시 지도안 — 학급 광고 기획사' },
      { id: 'v2w3', label: '3차시 학습지' },
      { id: 'v2p4', label: '4차시 지도안 — 퀴즈쇼 제작단' },
      { id: 'v2w4', label: '4차시 학습지' },
      { id: 'v2-snippets', label: '프롬프트 스니펫 (2탄)' },
      { id: 'v2-rubric', label: '평가 루브릭 (2탄)' }
    ] },
    { part: '제4부 3탄 · AI 프로젝트 스튜디오', num: '4', color: 'var(--l4)', items: [
      { id: 'v3-overview', label: '3탄 개요 — 프로젝트 메뉴 5종' },
      { id: 'v3p1', label: '1차시 지도안 — 기획 회의' },
      { id: 'v3w1', label: '1차시 학습지 (기획서)' },
      { id: 'v3p2', label: '2차시 지도안 — 제작 스프린트' },
      { id: 'v3w2', label: '2차시 학습지 (팀 기록지)' },
      { id: 'v3p3', label: '3차시 지도안 — 다듬기 공방' },
      { id: 'v3w3', label: '3차시 학습지 (퇴고·검증)' },
      { id: 'v3p4', label: '4차시 지도안 — 쇼케이스' },
      { id: 'v3w4', label: '4차시 학습지 (발표·회고)' },
      { id: 'v3-snippets', label: '프롬프트 스니펫 (3탄)' },
      { id: 'v3-rubric', label: '평가 루브릭 (3탄)' }
    ] },
    { part: '제5부 수업을 더 풍성하게', num: '5', color: 'var(--l3)', items: [
      { id: 'faq', label: '학생 돌발질문 FAQ' },
      { id: 'exhibit', label: '작품 전시 키트' },
      { id: 'ext-image', label: '확장팩 — 이미지 생성 차시' },
      { id: 'ext-club', label: '심화활동·동아리 아이디어' }
    ] },
    { part: '부록', num: 'A', color: 'var(--text-dim)', items: [
      { id: 'research', label: '제미나이 조사 정리 (근거 자료)' },
      { id: 'readme', label: '저장소·웹 교재 안내' },
      { id: 'wikiguide', label: '온라인 ebook 출시 가이드' }
    ] }
  ];

  // 책 순서 평탄화 + 색인 (번호 "2.3" 계산)
  var bookFlat = [];
  var bookIndex = {};
  BOOK.forEach(function (P) {
    P.items.forEach(function (it, i) {
      var entry = {
        id: it.id,
        label: it.label,
        no: P.num ? P.num + '.' + (i + 1) : '',
        part: P.part
      };
      bookFlat.push(entry);
      bookIndex[it.id] = entry;
    });
  });

  var READ_KEY = 'edu-read-v1';
  function readSet() { return store.get(READ_KEY, []); }
  function markRead(id) {
    var r = readSet();
    if (r.indexOf(id) === -1) { r.push(id); store.set(READ_KEY, r); }
    store.set('edu-last-doc', id);
  }

  var LESSONS = [
    {
      vol: 1, id: 1, doc: 'plan1', ws: 'ws1', cls: 'c1',
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
      vol: 1, id: 2, doc: 'plan2', ws: 'ws2', cls: 'c2',
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
      vol: 1, id: 3, doc: 'plan3', ws: 'ws3', cls: 'c3',
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
      vol: 1, id: 4, doc: 'plan4', ws: 'ws4', cls: 'c4',
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
    },
    {
      vol: 2, id: 1, doc: 'v2p1', ws: 'v2w1', cls: 'c1',
      title: '이야기 공장 — 장르 변신 스토리',
      q: '내 아이디어로 이야기를 만들 수 있을까?',
      out: '나만의 미니 이야기',
      desc: '주인공·장소·사건을 내가 정하고, AI로 다섯 문장 이야기를 뽑은 뒤 장르를 바꿔 봅니다. 마지막엔 내 문장으로 고쳐 완성합니다.',
      phases: [
        { t: 0,    label: '도입 — 오늘부터 제작자' },
        { t: 180,  label: '개념 — 창작 3원칙' },
        { t: 360,  label: '실습① 이야기 씨앗 만들기' },
        { t: 480,  label: '실습② 프롬프트 조립·생성' },
        { t: 660,  label: '실습③ 장르 변신 멀티턴' },
        { t: 840,  label: '실습④ 옮겨 적고 고쳐 쓰기' },
        { t: 960,  label: '정리 — 제목·표시·공유' }
      ]
    },
    {
      vol: 2, id: 2, doc: 'v2p2', ws: 'v2w2', cls: 'c2',
      title: '캐릭터 공방 — 나만의 캐릭터 설계',
      q: '매력적인 캐릭터는 어떻게 만들까?',
      out: '캐릭터 프로필 카드',
      desc: '창작명·성격·특기·약점·말버릇을 내가 설계하고, AI로 살을 붙인 뒤 캐릭터와 인터뷰까지 해 봅니다.',
      phases: [
        { t: 0,    label: '도입 — 인물을 만든다' },
        { t: 180,  label: '개념 — 입체적 캐릭터(약점!)' },
        { t: 360,  label: '실습① 기본 설정 5칸' },
        { t: 540,  label: '실습② AI로 살 붙이기' },
        { t: 720,  label: '실습③ 캐릭터 인터뷰' },
        { t: 870,  label: '실습④ 프로필 카드 완성' },
        { t: 990,  label: '정리 — 캐릭터 소개' }
      ]
    },
    {
      vol: 2, id: 3, doc: 'v2p3', ws: 'v2w3', cls: 'c3',
      title: '학급 광고 기획사 — 마음을 움직이는 문구',
      q: '말로 사람의 마음을 움직일 수 있을까?',
      out: '캠페인 문구 세트',
      desc: '급식 잔반 줄이기 등 학급 공익 소재로 A/B 실험을 하며 헤드라인·슬로건·한 줄 설명 세트를 만듭니다.',
      phases: [
        { t: 0,    label: '도입 — 광고의 힘' },
        { t: 180,  label: '개념 — 광고 3요소' },
        { t: 360,  label: '실습① 소재·타깃·톤 정하기' },
        { t: 480,  label: '실습② A/B 문구 실험' },
        { t: 660,  label: '실습③ 다듬기 멀티턴' },
        { t: 840,  label: '실습④ 세트 완성' },
        { t: 990,  label: '정리 — 발표·활용 제안' }
      ]
    },
    {
      vol: 2, id: 4, doc: 'v2p4', ws: 'v2w4', cls: 'c4',
      title: '퀴즈쇼 제작단 — 내가 만드는 문제',
      q: 'AI가 만든 문제, 그대로 내도 될까?',
      out: '검증 완료 퀴즈 3문항',
      desc: 'AI로 퀴즈를 뽑고 검증 3단계로 직접 검수한 뒤(출제자의 책임!) 짝과 퀴즈 대결을 벌입니다.',
      phases: [
        { t: 0,    label: '도입 — 출제자의 책임' },
        { t: 180,  label: '개념 — 검증 없이 출제 금지' },
        { t: 360,  label: '실습① 주제 선택·퀴즈 생성' },
        { t: 540,  label: '실습② 검증(교과서 대조)' },
        { t: 720,  label: '실습③ 짝 퀴즈 대결' },
        { t: 930,  label: '정리 — 2탄 수료식' }
      ]
    },
    {
      vol: 3, id: 1, doc: 'v3p1', ws: 'v3w1', cls: 'c1',
      title: '기획 회의 — 무엇을 만들까?',
      q: '우리 팀은 무엇을 만들까?',
      out: '한 장 기획서',
      desc: '팀을 짜고 역할을 나눈 뒤, 프로젝트 메뉴 5종에서 주제를 고르고 AI 브레인스토밍으로 기획서를 완성합니다.',
      phases: [
        { t: 0,    label: '도입 — 프로젝트 소개' },
        { t: 150,  label: '팀 세팅·역할 배정' },
        { t: 300,  label: '주제 선정(메뉴 5종)' },
        { t: 480,  label: 'AI 브레인스토밍' },
        { t: 780,  label: '기획서 작성' },
        { t: 1080, label: '팀별 15초 공유·정리' }
      ]
    },
    {
      vol: 3, id: 2, doc: 'v3p2', ws: 'v3w2', cls: 'c2',
      title: '제작 스프린트 — 초안 공장',
      q: '좋은 재료는 어떻게 모을까?',
      out: '파트별 초안 모음',
      desc: '파트별로 프롬프트를 돌려 초안을 뽑고, "우리 기획에 맞나?"를 기준으로 재료를 고르고 조립을 시작합니다.',
      phases: [
        { t: 0,    label: '도입 — 기획서 리마인드' },
        { t: 120,  label: '파트 분담 확인' },
        { t: 240,  label: '초안 생성 스프린트' },
        { t: 720,  label: '재료 선별·조립' },
        { t: 1080, label: '중간 점검·정리' }
      ]
    },
    {
      vol: 3, id: 3, doc: 'v3p3', ws: 'v3w3', cls: 'c3',
      title: '다듬기 공방 — 내 문장으로, 사실 확인까지',
      q: 'AI 초안을 우리 작품으로 만들려면?',
      out: '프로젝트 완성본',
      desc: 'AI 문장을 팀의 문장으로 고쳐 쓰고, 검증 담당 주도로 팩트체크한 뒤 "AI와 함께 만들었어요"를 붙여 완성합니다.',
      phases: [
        { t: 0,    label: '도입 — 재료에서 요리로' },
        { t: 120,  label: '퇴고 — 팀의 문장으로' },
        { t: 540,  label: '팩트체크(검증 3단계)' },
        { t: 840,  label: '정직한 표시·마감' },
        { t: 1080, label: '발표 준비·정리' }
      ]
    },
    {
      vol: 3, id: 4, doc: 'v3p4', ws: 'v3w4', cls: 'c4',
      title: '쇼케이스 — 발표와 회고',
      q: '우리가 만든 것을 어떻게 보여 줄까?',
      out: '팀 발표 + 회고 카드',
      desc: '팀당 90초 쇼케이스로 작품을 발표하고, 칭찬 1+제안 1 피드백과 회고로 시리즈를 마무리합니다.',
      phases: [
        { t: 0,    label: '도입 — 발표 규칙·리허설' },
        { t: 180,  label: '팀 발표(팀당 90초)' },
        { t: 780,  label: '상호 피드백(칭찬 1+제안 1)' },
        { t: 960,  label: '회고·시리즈 수료' }
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
    store.set('edu-theme-v2', t);
  }
  // 기본은 항상 화이트 배경(라이트 테마) — 시스템 다크 모드를 따라가지 않음. 🌓 버튼으로만 전환.
  applyTheme(store.get('edu-theme-v2', 'light'));
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
    var read = readSet();
    var html = '<a class="nav-home" href="#/" data-nav-home>📖 책 표지 · 목차</a>';
    BOOK.forEach(function (P, pi) {
      html += '<div class="nav-group open" data-part="' + pi + '">' +
        '<button class="nav-cat"><span class="dot" style="background:' + P.color + '"></span>' +
        esc(P.part) + '<span class="tw">▶</span></button><ul class="nav-items">';
      P.items.forEach(function (it, i) {
        var no = P.num ? P.num + '.' + (i + 1) : '·';
        var isRead = read.indexOf(it.id) !== -1;
        html += '<li><a href="#/doc/' + it.id + '" data-doc="' + it.id + '" class="' + (isRead ? 'visited' : '') + '">' +
          '<span class="sec-no">' + no + '</span>' + esc(it.label) + '<span class="chk">✓</span></a></li>';
      });
      html += '</ul></div>';
    });
    html += '<div class="sidebar-note">✓ 는 한 번 이상 연 페이지입니다. 인쇄 배포용 원본은 저장소의 마크다운 문서이며, 이 웹 교재는 <code>web/index.html</code>을 브라우저로 열기만 하면 오프라인에서 동작합니다.</div>';
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
  /* ---------- 표지(홈) — 책 표지 + 전체 목차 ---------- */
  function renderHome() {
    var el = $('#content');
    var read = readSet();
    var total = bookFlat.length;
    var readCount = bookFlat.filter(function (e) { return read.indexOf(e.id) !== -1; }).length;
    var pct = total ? Math.round(readCount / total * 100) : 0;
    var last = store.get('edu-last-doc', null);
    var lastEntry = last && bookIndex[last] ? bookIndex[last] : null;

    var h = '';
    h += '<div class="home-hero book-cover">' +
      '<div class="cover-kicker">중학교 1학년 · 제미나이 게스트 모드 · 20분 × 12차시</div>' +
      '<h1>20분 만에 이해하는 AI</h1>' +
      '<p class="cover-sub">구경하는 아이에서 만들어 보는 아이로 — 리터러시 기초부터 창작 공방, 팀 프로젝트 스튜디오까지. 로그인 없이, 20분 단위로, 매 차시 산출물이 남는 생성형 AI 수업 교재.</p>' +
      '<div class="hero-tags"><span>로그인 · 계정 수집 없음</span><span>모든 차시 플랜 B</span><span>학습지 12종 인쇄 지원</span><span>총 ' + total + '페이지</span></div>' +
      '<div class="cover-actions">' +
      '<a class="btn cover-btn primary-inv" href="#/doc/preface">📖 머리말부터 읽기</a>' +
      (lastEntry ? '<a class="btn cover-btn" href="#/doc/' + lastEntry.id + '">↩ 이어서 읽기' + (lastEntry.no ? ' · ' + lastEntry.no : '') + '</a>' : '') +
      '<button class="btn cover-btn" id="cover-timer">⏱ 수업 타이머</button>' +
      '</div>' +
      '<div class="cover-progress"><div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '<span class="progress-label">' + readCount + ' / ' + total + ' 페이지 읽음 (' + pct + '%)</span></div>' +
      '</div>';

    h += '<section class="home-section"><h2>목차</h2><div class="book-toc">';
    BOOK.forEach(function (P) {
      h += '<div class="toc-part"><span class="dot" style="background:' + P.color + '"></span>' + esc(P.part) + '</div><ol class="toc-pages">';
      P.items.forEach(function (it, i) {
        var no = P.num ? P.num + '.' + (i + 1) : '';
        var isRead = read.indexOf(it.id) !== -1;
        h += '<li><a href="#/doc/' + it.id + '" class="' + (isRead ? 'visited' : '') + '">' +
          '<span class="sec-no">' + (no || '·') + '</span><span class="toc-label">' + esc(it.label) + '</span><span class="chk">✓</span></a></li>';
      });
      h += '</ol>';
    });
    h += '</div></section>';

    h += '<div class="home-note">⚠️ <b>2026년 7월 기준.</b> 게스트 모드의 가용 범위·연령 정책은 예고 없이 바뀔 수 있습니다. ' +
      '수업 전 실제 접속 화면이 최종 기준이며, 이 자료는 법률 자문이 아닙니다. 근거와 출처는 <a href="#/doc/research">부록 A.1</a>에 있습니다.</div>';

    el.className = 'doc home';
    el.innerHTML = h;
    var ct = $('#cover-timer');
    if (ct) ct.addEventListener('click', function () { openTimer(); });
    $('#toc').innerHTML = '';
    $('#pager').innerHTML = '';
    markActive(null);
    document.title = '20분 만에 이해하는 AI — 전자책 교재';
    window.scrollTo(0, 0);
  }

  /* ---------- 문서 렌더 ---------- */
  var pendingQuery = null;

  function docLessonIdx(d) {
    for (var i = 0; i < LESSONS.length; i++) {
      if (LESSONS[i].doc === d.id || LESSONS[i].ws === d.id) return i;
    }
    return -1;
  }

  function renderDoc(id) {
    var d = byId[id];
    if (!d) { renderHome(); return; }
    var el = $('#content');
    var be = bookIndex[d.id];
    var head = '<header class="doc-head"><div class="crumb">' +
      (be ? '<b>' + esc(be.part) + '</b>' + (be.no ? ' · <span class="crumb-no">' + be.no + '</span>' : '') + ' · ' : '') +
      '<span>' + esc(d.file) + '</span></div>' +
      '<div class="doc-actions">' +
      '<button class="btn primary" data-act="print">🖨 ' + (d.print ? '이 문서 인쇄 (배포용)' : '이 문서 인쇄') + '</button>' +
      (docLessonIdx(d) >= 0 ? '<button class="btn" data-act="timer">⏱ ' + LESSONS[docLessonIdx(d)].vol + '탄 ' + LESSONS[docLessonIdx(d)].id + '차시 타이머 열기</button>' : '') +
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
      if (act.dataset.act === 'timer') openTimer(docLessonIdx(d));
      if (act.dataset.act === 'reset-tasks') {
        store.set('edu-tasks-' + d.id, []);
        $$('#content .task-check').forEach(function (c) { c.checked = false; });
      }
    });

    buildToc();
    buildPager(d);
    markActive(id);

    // 읽음 표시 + 이어 읽기 저장
    markRead(d.id);
    var navA = $('#sidebar a[data-doc="' + d.id + '"]');
    if (navA) navA.classList.add('visited');
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
    // 책 순서(BOOK 평탄화) 기준 이전/다음 페이지
    var i = -1;
    for (var k = 0; k < bookFlat.length; k++) if (bookFlat[k].id === d.id) { i = k; break; }
    if (i === -1) { $('#pager').innerHTML = ''; return; }
    var prev = bookFlat[i - 1], next = bookFlat[i + 1];
    function lbl(e) { return (e.no ? e.no + ' · ' : '') + e.label; }
    var h = '';
    h += prev ? '<a class="prev" href="#/doc/' + prev.id + '"><small>← 이전 페이지</small><b>' + esc(lbl(prev)) + '</b></a>' : '<a class="prev" href="#/"><small>← 표지</small><b>책 표지 · 목차</b></a>';
    h += next ? '<a class="next" href="#/doc/' + next.id + '"><small>다음 페이지 →</small><b>' + esc(lbl(next)) + '</b></a>' : '<a class="next" href="#/"><small>끝 →</small><b>표지로 돌아가기</b></a>';
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
        '<div class="si-doc">' + esc((bookIndex[it.d.id] ? bookIndex[it.d.id].part + (bookIndex[it.d.id].no ? ' ' + bookIndex[it.d.id].no : '') : '')) + ' › ' + esc(it.d.title) + ' <span style="color:var(--text-dim);font-weight:400">(' + it.count + '곳)</span></div>' +
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
  function openTimer(idx) {
    timerEl.classList.remove('hidden', 'minimized');
    if (typeof idx === 'number' && idx >= 0 && idx !== timer.lesson) {
      timer.lesson = idx;
      $('#timer-lesson').value = String(timer.lesson);
      buildTrack(); timerReset();
    }
    timerRender();
  }
  (function initTimer() {
    var sel = $('#timer-lesson');
    sel.innerHTML = LESSONS.map(function (L, i) {
      return '<option value="' + i + '">' + L.vol + '탄 ' + L.id + '차시 — ' + esc(L.title.split(' — ')[0]) + '</option>';
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
