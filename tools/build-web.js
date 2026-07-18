#!/usr/bin/env node
/**
 * build-web.js — 마크다운 문서 20종을 web/js/content.js(완전 오프라인 단일 번들)로 변환
 *
 * 사용법:  node tools/build-web.js
 * 사전 준비: cd tools && npm install   (marked 파서, 빌드 시점에만 필요 — 산출물에는 포함되지 않음)
 *
 * 산출물인 web/ 폴더는 서버 없이 index.html 더블클릭(file://)만으로 동작해야 하므로
 * 문서 내용을 전부 JS 데이터로 내장한다(브라우저의 file:// fetch 차단 회피).
 */
const fs = require('fs');
const path = require('path');
const { marked } = require(path.join(__dirname, 'node_modules', 'marked'));

const ROOT = path.join(__dirname, '..');

// 문서 레지스트리: 사이드바 순서 그대로. cat은 내비게이션 그룹.
const DOCS = [
  { id: 'readme',      cat: 'start',   nav: '패키지 안내',           file: 'README.md' },
  { id: 'overview',    cat: 'start',   nav: '교육과정 개요',         file: 'curriculum/00-교육과정-개요.md' },
  { id: 'plan1',       cat: 'lesson1', nav: '지도안',                file: 'curriculum/1차시-지도안-AI와-첫만남.md' },
  { id: 'ws1',         cat: 'lesson1', nav: '학습지',                file: 'worksheets/1차시-학습지.md', print: true },
  { id: 'plan2',       cat: 'lesson2', nav: '지도안',                file: 'curriculum/2차시-지도안-프롬프트의-기술.md' },
  { id: 'ws2',         cat: 'lesson2', nav: '학습지',                file: 'worksheets/2차시-학습지.md', print: true },
  { id: 'plan3',       cat: 'lesson3', nav: '지도안',                file: 'curriculum/3차시-지도안-AI-거짓말-탐정.md' },
  { id: 'ws3',         cat: 'lesson3', nav: '학습지 (수사 보고서)',  file: 'worksheets/3차시-학습지-수사보고서.md', print: true },
  { id: 'plan4',       cat: 'lesson4', nav: '지도안',                file: 'curriculum/4차시-지도안-AI와-함께-살아가기.md' },
  { id: 'ws4',         cat: 'lesson4', nav: '학습지 (사용 선언문)',  file: 'worksheets/4차시-학습지-사용선언문.md', print: true },
  { id: 'v2-overview', cat: 'vol2',    nav: '2탄 개요',              file: 'vol2-AI-창작공방/00-2탄-개요.md' },
  { id: 'v2p1',        cat: 'vol2',    nav: '1차시 지도안 · 이야기 공장',      file: 'vol2-AI-창작공방/1차시-지도안-이야기-공장.md' },
  { id: 'v2w1',        cat: 'vol2',    nav: '1차시 학습지',          file: 'vol2-AI-창작공방/1차시-학습지-이야기-공장.md', print: true },
  { id: 'v2p2',        cat: 'vol2',    nav: '2차시 지도안 · 캐릭터 공방',      file: 'vol2-AI-창작공방/2차시-지도안-캐릭터-공방.md' },
  { id: 'v2w2',        cat: 'vol2',    nav: '2차시 학습지',          file: 'vol2-AI-창작공방/2차시-학습지-캐릭터-공방.md', print: true },
  { id: 'v2p3',        cat: 'vol2',    nav: '3차시 지도안 · 학급 광고 기획사', file: 'vol2-AI-창작공방/3차시-지도안-학급-광고-기획사.md' },
  { id: 'v2w3',        cat: 'vol2',    nav: '3차시 학습지',          file: 'vol2-AI-창작공방/3차시-학습지-학급-광고-기획사.md', print: true },
  { id: 'v2p4',        cat: 'vol2',    nav: '4차시 지도안 · 퀴즈쇼 제작단',    file: 'vol2-AI-창작공방/4차시-지도안-퀴즈쇼-제작단.md' },
  { id: 'v2w4',        cat: 'vol2',    nav: '4차시 학습지',          file: 'vol2-AI-창작공방/4차시-학습지-퀴즈쇼-제작단.md', print: true },
  { id: 'v2-snippets', cat: 'vol2',    nav: '프롬프트 스니펫 (2탄)', file: 'vol2-AI-창작공방/프롬프트-스니펫-2탄.md' },
  { id: 'v2-rubric',   cat: 'vol2',    nav: '평가 루브릭 (2탄)',     file: 'vol2-AI-창작공방/평가-루브릭-2탄.md' },
  { id: 'v3-overview', cat: 'vol3',    nav: '3탄 개요 · 프로젝트 메뉴 5종',    file: 'vol3-AI-프로젝트-스튜디오/00-3탄-개요.md' },
  { id: 'v3p1',        cat: 'vol3',    nav: '1차시 지도안 · 기획 회의',        file: 'vol3-AI-프로젝트-스튜디오/1차시-지도안-기획-회의.md' },
  { id: 'v3w1',        cat: 'vol3',    nav: '1차시 학습지 · 기획서', file: 'vol3-AI-프로젝트-스튜디오/1차시-학습지-기획서.md', print: true },
  { id: 'v3p2',        cat: 'vol3',    nav: '2차시 지도안 · 제작 스프린트',    file: 'vol3-AI-프로젝트-스튜디오/2차시-지도안-제작-스프린트.md' },
  { id: 'v3w2',        cat: 'vol3',    nav: '2차시 학습지 · 팀 기록지',        file: 'vol3-AI-프로젝트-스튜디오/2차시-학습지-팀-기록지.md', print: true },
  { id: 'v3p3',        cat: 'vol3',    nav: '3차시 지도안 · 다듬기 공방',      file: 'vol3-AI-프로젝트-스튜디오/3차시-지도안-다듬기-공방.md' },
  { id: 'v3w3',        cat: 'vol3',    nav: '3차시 학습지 · 퇴고·검증',        file: 'vol3-AI-프로젝트-스튜디오/3차시-학습지-퇴고-검증.md', print: true },
  { id: 'v3p4',        cat: 'vol3',    nav: '4차시 지도안 · 쇼케이스',         file: 'vol3-AI-프로젝트-스튜디오/4차시-지도안-쇼케이스.md' },
  { id: 'v3w4',        cat: 'vol3',    nav: '4차시 학습지 · 발표·회고',        file: 'vol3-AI-프로젝트-스튜디오/4차시-학습지-발표-회고.md', print: true },
  { id: 'v3-snippets', cat: 'vol3',    nav: '프롬프트 스니펫 (3탄)', file: 'vol3-AI-프로젝트-스튜디오/프롬프트-스니펫-3탄.md' },
  { id: 'v3-rubric',   cat: 'vol3',    nav: '평가 루브릭 (3탄)',     file: 'vol3-AI-프로젝트-스튜디오/평가-루브릭-3탄.md' },
  { id: 'checklist',   cat: 'kit',     nav: '사전준비 체크리스트',   file: 'teacher-kit/사전준비-체크리스트.md', tasklist: true },
  { id: 'trouble',     cat: 'kit',     nav: '트러블슈팅 가이드',     file: 'teacher-kit/트러블슈팅-가이드.md' },
  { id: 'snippets',    cat: 'kit',     nav: '프롬프트 스니펫 모음',  file: 'teacher-kit/프롬프트-스니펫-모음.md' },
  { id: 'rubric',      cat: 'kit',     nav: '평가 루브릭',           file: 'teacher-kit/평가-루브릭.md' },
  { id: 'poster',      cat: 'kit',     nav: '안전수칙 포스터',       file: 'teacher-kit/안전수칙-포스터.md', print: true },
  { id: 'parents',     cat: 'kit',     nav: '학부모 안내문',         file: 'teacher-kit/학부모-안내문.md', print: true },
  { id: 'faq',         cat: 'kit',     nav: '학생 돌발질문 FAQ',     file: 'teacher-kit/학생-돌발질문-FAQ.md' },
  { id: 'exhibit',     cat: 'kit',     nav: '작품 전시 키트',        file: 'teacher-kit/작품-전시-키트.md', print: true },
  { id: 'ext-image',   cat: 'ext',     nav: '확장팩 — 이미지 생성 차시', file: 'extensions/확장팩-이미지-생성-차시.md' },
  { id: 'ext-club',    cat: 'ext',     nav: '심화활동·동아리 아이디어', file: 'extensions/심화활동-및-동아리-아이디어.md' },
  { id: 'research',    cat: 'appendix', nav: '제미나이 조사 정리',   file: 'appendix/제미나이-조사-정리.md' },
];

marked.setOptions({ gfm: true, breaks: false });

function firstHeading(md) {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].replace(/[*_`]/g, '').trim() : '';
}

function postProcess(html, doc) {
  // 체크리스트: marked가 disabled로 뽑는 체크박스를 실사용 가능하게 전환(상태 저장은 app.js 담당)
  html = html.replace(/<input disabled="" type="checkbox">/g, '<input type="checkbox" class="task-check">');
  html = html.replace(/<input checked="" disabled="" type="checkbox">/g, '<input type="checkbox" class="task-check" checked>');
  return html;
}

const docs = DOCS.map((d) => {
  const md = fs.readFileSync(path.join(ROOT, d.file), 'utf8');
  const html = postProcess(marked.parse(md), d);
  return {
    id: d.id,
    cat: d.cat,
    nav: d.nav,
    file: d.file,
    title: firstHeading(md) || d.nav,
    print: !!d.print,
    tasklist: !!d.tasklist,
    html,
  };
});

const banner = '// 자동 생성 파일 — 직접 수정하지 말 것. 원본은 저장소의 마크다운 문서이며, node tools/build-web.js 로 재생성한다.\n';
const out = banner + 'window.EDU_CONTENT = ' + JSON.stringify({ docs }, null, 0) + ';\n';
fs.writeFileSync(path.join(ROOT, 'web', 'js', 'content.js'), out);

const kb = (Buffer.byteLength(out) / 1024).toFixed(0);
console.log(`web/js/content.js 생성 완료 — 문서 ${docs.length}개, ${kb}KB`);
docs.forEach((d) => console.log(`  [${d.cat}] ${d.id}  ←  ${d.file}`));
