// 진단 로직: Mock 모드 + Real AI 모드 (Claude)
// 결과 스키마:
// {
//   percent: 0-100,            // AI 대체 가능성
//   verdict: '생존|위태|위험|치명',
//   tagline: string,           // 한 줄 평 (위협+유머)
//   role: string,              // 추정 직무
//   diagnosis: string[],       // 3-4개 진단 코멘트
//   skillTree: {
//      id, name, tier(1|2|3), branch('core'|'human'|'ai'|'meta'),
//      desc, urgency(1-5), unlocked, parent?
//   }[],
//   tools: {name, category, why, urgency(1-3)}[],
//   playbook: {when:'오늘'|'1주일'|'1개월'|'3개월', action:string}[],
// }

const MOCK_DELAY_MS = 4200;

// ============= MOCK =============
function mockDiagnose(text){
  const t = (text||'').toLowerCase();
  // 키워드 기반 거친 분류
  const keywords = {
    dev:        /개발|프로그래머|엔지니어|코딩|코더|소프트웨어|웹|앱|프론트|백엔드|풀스택|devops|sre|programmer|developer|engineer/,
    designer:   /디자이너|design|ui|ux|그래픽|영상|편집|모션/,
    pm:         /pm|기획|프로덕트|매니저|prd|product manager/,
    marketer:   /마케팅|마케터|광고|퍼포먼스|seo|콘텐츠/,
    writer:     /작가|에디터|기자|카피|writer|editor/,
    sales:      /영업|세일즈|sales|account/,
    finance:    /회계|재무|세무|finance|accounting/,
    teacher:    /교사|선생님|강사|teacher|tutor|교수/,
    lawyer:     /변호사|법무|법률|lawyer|legal/,
    doctor:     /의사|간호|약사|의료/,
    student:    /학생|취준|취업|졸업|대학생|고등학생|student/,
    hr:         /인사|hr|채용|recruiter/,
    cs:         /상담|cs|고객지원|customer support|콜센터/,
    translator: /번역|통역|translator/,
    artist:     /아티스트|일러스트|화가|음악|작곡|artist|illustrator/,
  };
  let role = '제너럴리스트', basePct = 55;
  const stats = { tech:30, human:50, creative:40, judgment:50 };

  if (keywords.dev.test(t))        { role='개발자';        basePct=58; stats.tech=80; stats.human=45; stats.creative=55; stats.judgment=60; }
  else if (keywords.designer.test(t)){ role='디자이너';     basePct=62; stats.tech=55; stats.human=55; stats.creative=85; stats.judgment=55; }
  else if (keywords.pm.test(t))    { role='기획자/PM';     basePct=42; stats.tech=55; stats.human=75; stats.creative=60; stats.judgment=80; }
  else if (keywords.marketer.test(t)){ role='마케터';       basePct=68; stats.tech=50; stats.human=55; stats.creative=70; stats.judgment=55; }
  else if (keywords.writer.test(t)){ role='작가/에디터';   basePct=72; stats.tech=30; stats.human=55; stats.creative=80; stats.judgment=60; }
  else if (keywords.sales.test(t)) { role='세일즈';        basePct=35; stats.tech=35; stats.human=85; stats.creative=45; stats.judgment=70; }
  else if (keywords.finance.test(t)){ role='재무/회계';    basePct=78; stats.tech=60; stats.human=40; stats.creative=25; stats.judgment=70; }
  else if (keywords.teacher.test(t)){ role='교육자';        basePct=45; stats.tech=40; stats.human=85; stats.creative=60; stats.judgment=65; }
  else if (keywords.lawyer.test(t)) { role='법조인';        basePct=48; stats.tech=45; stats.human=70; stats.creative=40; stats.judgment=85; }
  else if (keywords.doctor.test(t)) { role='의료인';        basePct=28; stats.tech=55; stats.human=85; stats.creative=40; stats.judgment=85; }
  else if (keywords.student.test(t)){ role='학생/취준생';   basePct=65; stats.tech=40; stats.human=55; stats.creative=55; stats.judgment=45; }
  else if (keywords.hr.test(t))    { role='HR/채용';        basePct=58; stats.tech=35; stats.human=80; stats.creative=45; stats.judgment=70; }
  else if (keywords.cs.test(t))    { role='CS/상담';        basePct=82; stats.tech=30; stats.human=70; stats.creative=35; stats.judgment=55; }
  else if (keywords.translator.test(t)){ role='번역가';     basePct=85; stats.tech=40; stats.human=55; stats.creative=55; stats.judgment=60; }
  else if (keywords.artist.test(t)){ role='아티스트';        basePct=58; stats.tech=35; stats.human=60; stats.creative=90; stats.judgment=55; }

  // 텍스트 길이/특정 단어로 보정 (아주 거친 가산점)
  const lengthBoost = Math.min(text.length, 600) / 600 * 8 - 4; // 길게 적으면 살짝 낮춤
  const aiSavvy = /(claude|gpt|chatgpt|copilot|cursor|llm|프롬프트|prompt|automation|자동화|ai\s)/i.test(text) ? -8 : 0;
  const seniorBoost = /(시니어|리드|책임|매니저|10년|15년|디렉터|cxo|c-?level)/i.test(text) ? -6 : 0;
  const repetitiveBoost = /(루틴|반복|단순|동일한|매일 똑같)/i.test(text) ? +10 : 0;
  const creativeBoost = /(전략|크리에이티브|기획|컨셉|새로운|혁신)/i.test(text) ? -5 : 0;

  let percent = Math.round(basePct + lengthBoost + aiSavvy + seniorBoost + repetitiveBoost + creativeBoost);
  // 약간의 결정적 흔들림 (해시 기반)
  let h = 0; for (let i=0;i<text.length;i++){ h = (h*31 + text.charCodeAt(i)) & 0xffff; }
  percent += (h % 7) - 3;
  percent = Math.max(8, Math.min(96, percent));

  const verdict =
    percent >= 80 ? '치명' :
    percent >= 65 ? '위험' :
    percent >= 45 ? '위태' : '생존';

  const taglines = {
    '치명': [
      '솔직히 말씀드리면, 지금 이 직무는… AI가 더 잘합니다. 🪦',
      'AI가 보고 "어 이건 내가 할게요" 하는 직무 1위.',
      '지금 당장 옆자리 동료가 ChatGPT인지 확인해 보세요.',
    ],
    '위험': [
      'AI 옆자리가 점점 가까워지고 있습니다. 🔥',
      '아직은 살아있지만, 안전벨트를 매세요.',
      '지금부터 1년이 가장 중요합니다. (진심)',
    ],
    '위태': [
      '회색지대에 있습니다. 어느 쪽으로 갈지는 본인 선택. ⚖️',
      'AI를 적으로 두면 위험, 동료로 두면 안전.',
      '딱 중간. 칼끝 위에서 균형 잡는 중.',
    ],
    '생존': [
      'AI가 와도 당신은 아직 안전 지대. 🛡️',
      '버틸 만합니다. 다만 방심은 금물.',
      'AI는 당신을 도구로 쓰고 싶어합니다 (good thing).',
    ],
  }[verdict];
  const tagline = taglines[h % taglines.length];

  const diagBank = {
    '치명': [
      '반복적인 패턴이 입력에서 너무 잘 보입니다. AI가 가장 좋아하는 먹이입니다.',
      '입력에서 "차별점"이 거의 보이지 않습니다. 이게 가장 큰 위험 신호입니다.',
      '결과물이 평균 수준이라면, AI가 평균을 무료로 제공하는 시대입니다.',
    ],
    '위험': [
      '핵심 업무 중 30~50%가 자동화 후보로 보입니다.',
      '"검수자/판단자"로 포지션을 옮겨야 살아남을 수 있는 시그널이 있습니다.',
      '다행히 인간 협업 비중이 일부 있어, 거기에 베팅하면 됩니다.',
    ],
    '위태': [
      '판단력과 맥락 이해가 중간 이상이라 당장 대체는 어렵습니다.',
      '다만 "AI 활용 능력"이 동료 대비 부족하면 빠르게 추월당합니다.',
      '딱 6개월이 골든타임. AI를 손에 익히세요.',
    ],
    '생존': [
      '인간만이 가진 신뢰/책임/판단의 비중이 높습니다.',
      'AI는 당신의 보조 도구로 강력하게 작동할 직무입니다.',
      '단, 도구를 쓰지 않으면 같은 직무의 AI 활용자에게 추월당합니다.',
    ],
  }[verdict];

  // 스킬트리 - 직무에 따라 약간 다르게
  const skillTree = buildSkillTree(role, stats, percent);
  const tools = pickTools(role, percent);
  const playbook = buildPlaybook(verdict, role);

  return {
    percent, verdict, tagline, role, stats,
    diagnosis: diagBank,
    skillTree, tools, playbook,
    raw: { text, basePct, lengthBoost, aiSavvy, seniorBoost, repetitiveBoost, creativeBoost },
  };
}

function buildSkillTree(role, stats, percent){
  // 4개 가지: core(직무 핵심), human(인간 강점), ai(AI 활용), meta(메타 스킬)
  // tier 1(필수) -> 2(중급) -> 3(고급)
  const trees = {
    '개발자': [
      {id:'c1', branch:'core',  tier:1, name:'시스템 설계',     desc:'AI가 코드는 짜도, 아키텍처는 당신이.', urgency:5, unlocked:true},
      {id:'c2', branch:'core',  tier:2, name:'코드 리뷰/검수',  desc:'AI 코드의 함정을 잡아내는 눈.',          urgency:5, parent:'c1'},
      {id:'c3', branch:'core',  tier:3, name:'도메인 전문성',   desc:'바닥부터 비즈니스 이해.',                urgency:4, parent:'c2'},
      {id:'h1', branch:'human', tier:1, name:'팀 커뮤니케이션', desc:'PR보다 사람.',                          urgency:4, unlocked:true},
      {id:'h2', branch:'human', tier:2, name:'프로덕트 사고',   desc:'코드 너머의 가치를 본다.',              urgency:4, parent:'h1'},
      {id:'a1', branch:'ai',    tier:1, name:'Cursor/Copilot',  desc:'10x 코더가 되는 가장 빠른 길.',         urgency:5, unlocked:true},
      {id:'a2', branch:'ai',    tier:2, name:'프롬프트 엔지니어링', desc:'AI에게 일 시키는 기술.',           urgency:5, parent:'a1'},
      {id:'a3', branch:'ai',    tier:3, name:'에이전트 빌딩',   desc:'AI로 AI를 만든다.',                     urgency:4, parent:'a2'},
      {id:'m1', branch:'meta',  tier:2, name:'영문 기술 독해',  desc:'docs를 한국어 번역으로 보지 마세요.',   urgency:3, unlocked:true},
    ],
    '디자이너': [
      {id:'c1', branch:'core',  tier:1, name:'비주얼 시스템',   desc:'토큰/컴포넌트 단위 사고.',              urgency:5, unlocked:true},
      {id:'c2', branch:'core',  tier:2, name:'브랜드 빌딩',     desc:'AI가 못 만드는 일관된 톤.',             urgency:5, parent:'c1'},
      {id:'c3', branch:'core',  tier:3, name:'아트 디렉션',     desc:'AI 결과물을 큐레이션하는 자.',          urgency:4, parent:'c2'},
      {id:'h1', branch:'human', tier:1, name:'사용자 인터뷰',   desc:'화면 너머의 사람을 듣기.',              urgency:5, unlocked:true},
      {id:'h2', branch:'human', tier:2, name:'스토리텔링',      desc:'시안 < 내러티브.',                      urgency:4, parent:'h1'},
      {id:'a1', branch:'ai',    tier:1, name:'Midjourney/SDXL', desc:'레퍼런스 100개를 1분 안에.',            urgency:5, unlocked:true},
      {id:'a2', branch:'ai',    tier:2, name:'Figma + AI 플러그인', desc:'반복 작업 80% 줄이기.',           urgency:4, parent:'a1'},
      {id:'a3', branch:'ai',    tier:3, name:'생성형 워크플로우', desc:'당신만의 파이프라인 구축.',           urgency:4, parent:'a2'},
      {id:'m1', branch:'meta',  tier:2, name:'라이트 코딩',     desc:'프로토타이핑은 직접.',                  urgency:3, unlocked:true},
    ],
    '기획자/PM': [
      {id:'c1', branch:'core',  tier:1, name:'문제 정의',       desc:'AI가 풀기 전에 "뭘 풀지"부터.',         urgency:5, unlocked:true},
      {id:'c2', branch:'core',  tier:2, name:'우선순위 판단',   desc:'리소스 0인 시대의 핵심.',               urgency:5, parent:'c1'},
      {id:'c3', branch:'core',  tier:3, name:'전략 베팅',       desc:'데이터 + 직관의 결합.',                 urgency:4, parent:'c2'},
      {id:'h1', branch:'human', tier:1, name:'이해관계 조율',   desc:'사람을 움직이는 일.',                   urgency:5, unlocked:true},
      {id:'h2', branch:'human', tier:2, name:'스토리텔링/내러티브', desc:'PRD가 아니라 제품의 서사.',         urgency:4, parent:'h1'},
      {id:'a1', branch:'ai',    tier:1, name:'Claude/GPT로 PRD', desc:'문서 작업 시간 70% 절감.',             urgency:5, unlocked:true},
      {id:'a2', branch:'ai',    tier:2, name:'바이브 코딩',     desc:'프로토타입을 직접 만든다.',             urgency:5, parent:'a1'},
      {id:'a3', branch:'ai',    tier:3, name:'AI 워크플로우 설계', desc:'팀에 AI를 심는다.',                  urgency:4, parent:'a2'},
      {id:'m1', branch:'meta',  tier:2, name:'데이터 리터러시', desc:'SQL 한 줄은 직접 짜기.',               urgency:3, unlocked:true},
    ],
    '마케터': [
      {id:'c1', branch:'core',  tier:1, name:'타겟 인사이트',   desc:'AI가 못 보는 사람의 결.',               urgency:5, unlocked:true},
      {id:'c2', branch:'core',  tier:2, name:'캠페인 전략',     desc:'대량 콘텐츠 시대의 차별화.',            urgency:5, parent:'c1'},
      {id:'c3', branch:'core',  tier:3, name:'브랜드 빌딩',     desc:'단기 퍼포 너머의 자산.',                urgency:4, parent:'c2'},
      {id:'h1', branch:'human', tier:1, name:'커뮤니티 빌딩',   desc:'AI가 흉내 못 내는 진짜 관계.',          urgency:5, unlocked:true},
      {id:'h2', branch:'human', tier:2, name:'크리에이터 협업', desc:'사람-사람의 신뢰.',                     urgency:4, parent:'h1'},
      {id:'a1', branch:'ai',    tier:1, name:'GPT로 콘텐츠 양산', desc:'단, 평균에 머무르면 죽음.',          urgency:5, unlocked:true},
      {id:'a2', branch:'ai',    tier:2, name:'생성형 광고소재', desc:'AB 테스트 100배.',                      urgency:4, parent:'a1'},
      {id:'a3', branch:'ai',    tier:3, name:'AI 분석/세그먼트', desc:'코호트를 직접 본다.',                  urgency:4, parent:'a2'},
      {id:'m1', branch:'meta',  tier:2, name:'데이터 분석',     desc:'GA4 너머 SQL.',                         urgency:3, unlocked:true},
    ],
    '학생/취준생': [
      {id:'c1', branch:'core',  tier:1, name:'전공 깊이',       desc:'AI가 흉내 못 내는 전문성의 씨앗.',      urgency:5, unlocked:true},
      {id:'c2', branch:'core',  tier:2, name:'프로젝트 포트폴리오', desc:'스펙 < 결과물.',                  urgency:5, parent:'c1'},
      {id:'c3', branch:'core',  tier:3, name:'사이드 프로젝트', desc:'AI로 직접 빌드한 무언가.',              urgency:5, parent:'c2'},
      {id:'h1', branch:'human', tier:1, name:'커뮤니케이션',    desc:'면접/PT/협업의 기본.',                  urgency:4, unlocked:true},
      {id:'h2', branch:'human', tier:2, name:'네트워킹',        desc:'AI 채용 시대일수록 사람.',              urgency:4, parent:'h1'},
      {id:'a1', branch:'ai',    tier:1, name:'AI 일상 활용',    desc:'공부/검색/요약 다 AI로.',               urgency:5, unlocked:true},
      {id:'a2', branch:'ai',    tier:2, name:'바이브 코딩',     desc:'아이디어를 앱으로.',                    urgency:5, parent:'a1'},
      {id:'a3', branch:'ai',    tier:3, name:'AI 도구 빌딩',    desc:'써본 사람 vs 만든 사람.',               urgency:4, parent:'a2'},
      {id:'m1', branch:'meta',  tier:2, name:'영어 독해',       desc:'1차 자료에 직접 닿기.',                 urgency:4, unlocked:true},
    ],
  };
  // fallback
  const fallback = [
    {id:'c1', branch:'core',  tier:1, name:'직무 코어 강화',  desc:'당신만의 판단력 키우기.',                 urgency:5, unlocked:true},
    {id:'c2', branch:'core',  tier:2, name:'전문성 차별화',   desc:'평균을 벗어나기.',                        urgency:4, parent:'c1'},
    {id:'c3', branch:'core',  tier:3, name:'리더십/오너십',   desc:'책임지는 자가 살아남는다.',               urgency:4, parent:'c2'},
    {id:'h1', branch:'human', tier:1, name:'커뮤니케이션',    desc:'AI는 회의에 못 들어옵니다.',              urgency:4, unlocked:true},
    {id:'h2', branch:'human', tier:2, name:'협업/조율',       desc:'사람을 움직이는 능력.',                   urgency:4, parent:'h1'},
    {id:'a1', branch:'ai',    tier:1, name:'AI 일상 활용',    desc:'Claude/ChatGPT 매일.',                    urgency:5, unlocked:true},
    {id:'a2', branch:'ai',    tier:2, name:'프롬프트 설계',   desc:'결과물의 차이는 입력에서 나옵니다.',      urgency:5, parent:'a1'},
    {id:'a3', branch:'ai',    tier:3, name:'AI 워크플로우',   desc:'반복 업무를 자동화.',                     urgency:4, parent:'a2'},
    {id:'m1', branch:'meta',  tier:2, name:'학습 능력',       desc:'평생 학습이 디폴트.',                     urgency:3, unlocked:true},
  ];
  return trees[role] || fallback;
}

function pickTools(role, percent){
  const all = [
    {name:'Claude',         category:'범용 LLM',     why:'장문 사고/코딩/분석에 가장 강력.',                  urgency:3, roles:['*']},
    {name:'ChatGPT',        category:'범용 LLM',     why:'커스텀 GPT/검색까지 한 곳에서.',                    urgency:3, roles:['*']},
    {name:'Cursor',         category:'IDE/코딩',     why:'코드베이스 전체를 AI가 읽는 IDE.',                 urgency:3, roles:['개발자','기획자/PM','학생/취준생']},
    {name:'GitHub Copilot', category:'IDE/코딩',     why:'에디터 안에서 즉시 완성.',                          urgency:2, roles:['개발자','학생/취준생']},
    {name:'v0 / bolt.new',  category:'프로토타이핑', why:'한 문장으로 UI 프로토타입.',                        urgency:3, roles:['디자이너','기획자/PM','학생/취준생']},
    {name:'Figma + AI',     category:'디자인',       why:'Make / First Draft 등 내장 AI 활용.',               urgency:3, roles:['디자이너']},
    {name:'Midjourney',     category:'이미지 생성',  why:'레퍼런스/무드보드 무제한.',                          urgency:2, roles:['디자이너','마케터','아티스트']},
    {name:'Runway',         category:'영상 생성',    why:'Gen-3로 광고/시안 영상.',                            urgency:2, roles:['디자이너','마케터','아티스트']},
    {name:'Perplexity',     category:'검색/리서치',  why:'출처가 붙는 AI 검색.',                              urgency:3, roles:['*']},
    {name:'NotebookLM',     category:'리서치',       why:'PDF/문서 묶어 질문하기.',                            urgency:2, roles:['*']},
    {name:'Gamma / Tome',   category:'문서/덱',      why:'덱/문서를 1분 안에.',                                urgency:2, roles:['기획자/PM','마케터','학생/취준생']},
    {name:'Granola / Otter',category:'회의록',       why:'회의 자동 기록 + 요약.',                            urgency:2, roles:['기획자/PM','세일즈','HR/채용']},
    {name:'Zapier / n8n',   category:'자동화',       why:'반복 업무를 노코드로 자동화.',                       urgency:2, roles:['*']},
    {name:'Cal.com + AI',   category:'스케줄링',     why:'미팅 잡는 시간 0으로.',                              urgency:1, roles:['세일즈','HR/채용']},
    {name:'Cursor Agents',  category:'에이전트',     why:'백그라운드에서 일하는 코드 에이전트.',               urgency:2, roles:['개발자']},
    {name:'ElevenLabs',     category:'음성',         why:'음성 합성/더빙.',                                    urgency:1, roles:['마케터','아티스트']},
  ];
  const filtered = all.filter(t => t.roles.includes('*') || t.roles.includes(role));
  // urgency desc, 6-7개로 컷
  filtered.sort((a,b)=>b.urgency-a.urgency);
  return filtered.slice(0, 7);
}

function buildPlaybook(verdict, role){
  const common = [
    {when:'오늘',    action:'Claude(또는 ChatGPT) 유료 플랜에 가입하고, 오늘 업무 한 가지를 AI로 처리해 봅니다.'},
    {when:'1주일',   action:'반복 업무 3가지를 골라 AI 워크플로우로 자동화합니다.'},
    {when:'1개월',   action:'직무에 맞는 AI 도구 1개를 깊게 학습 (튜토리얼 끝까지 1회 완주).'},
    {when:'3개월',   action:'AI를 활용한 결과물을 포트폴리오로 1개 이상 만듭니다.'},
  ];
  if (verdict === '치명'){
    common[0] = {when:'오늘', action:'⚠️ 진지하게: "내 직무가 AI로 어떻게 자동화될지" 시나리오를 직접 써 봅니다. 위협을 가까이서 봐야 움직입니다.'};
    common[3] = {when:'3개월', action:'직무 전환 옵션을 최소 2개 탐색. "AI를 다루는 자" 쪽으로 한 발.'};
  } else if (verdict === '생존'){
    common[3] = {when:'3개월', action:'팀에 AI 도입을 주도. 당신은 살아남는 게 아니라 "더 강해지는" 포지션.'};
  }
  return common;
}

// ============= REAL AI (Claude) =============
async function realDiagnose(text){
  if (!window.claude || !window.claude.complete) {
    throw new Error('Claude API를 사용할 수 없습니다.');
  }
  const prompt = `당신은 "AI 생존 진단기"입니다. 사용자의 직무/이력 설명을 받아 AI에 의한 대체 가능성을 진단합니다.
톤: 위협적이면서도 유머러스하게. 한국어로 응답. 직설적이고 재밌게.

사용자 입력:
"""${text}"""

다음 JSON 스키마로만 응답하세요. JSON 외 다른 텍스트 금지:
{
  "percent": 숫자(0-100, AI 대체 가능성),
  "verdict": "치명" | "위험" | "위태" | "생존" (percent에 맞게: 80+ 치명, 65+ 위험, 45+ 위태, 그 미만 생존),
  "tagline": "한 줄 평 (위협+유머, 30자 내외)",
  "role": "추정 직무 (간결)",
  "stats": {"tech": 0-100, "human": 0-100, "creative": 0-100, "judgment": 0-100},
  "diagnosis": ["진단 코멘트1", "진단2", "진단3"],
  "skillTree": [
    {"id":"c1","branch":"core|human|ai|meta","tier":1|2|3,"name":"스킬명","desc":"한줄 설명","urgency":1-5,"unlocked":true,"parent":"부모 id 또는 null"}
    // 9-10개. branch별로 core 3개(tier 1->2->3 체인), human 2개, ai 3개, meta 1-2개
  ],
  "tools": [
    {"name":"도구명","category":"카테고리","why":"왜 써야 하는지 한줄","urgency":1-3}
    // 6-7개
  ],
  "playbook": [
    {"when":"오늘","action":"행동"},
    {"when":"1주일","action":"행동"},
    {"when":"1개월","action":"행동"},
    {"when":"3개월","action":"행동"}
  ]
}`;
  const res = await window.claude.complete(prompt);
  // JSON 파싱
  const m = res.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('JSON 파싱 실패');
  const parsed = JSON.parse(m[0]);
  // 안전장치
  parsed.percent = Math.max(0, Math.min(100, Math.round(parsed.percent || 50)));
  parsed.stats = parsed.stats || {tech:50,human:50,creative:50,judgment:50};
  return parsed;
}

async function diagnose(text, mode){
  if (mode === 'real') {
    try {
      // 동시에 mock도 진행 - 둘 중 빠른 거... 가 아니라 real을 우선하되 최소 3초는 보여주자
      const [real] = await Promise.all([
        realDiagnose(text),
        new Promise(r => setTimeout(r, 3500)),
      ]);
      return real;
    } catch (e) {
      console.warn('Real AI 실패, mock으로 폴백:', e);
      await new Promise(r => setTimeout(r, 800));
      return { ...mockDiagnose(text), _fallback: true, _error: String(e) };
    }
  } else {
    await new Promise(r => setTimeout(r, MOCK_DELAY_MS));
    return mockDiagnose(text);
  }
}

window.diagnose = diagnose;
window.mockDiagnose = mockDiagnose;
