const { useState, useRef, useEffect } = React;

const EXAMPLES = [
  '데이터 분석가 4년차: SQL과 Python을 활용해 서비스 퍼널 분석과 A/B 테스트를 설계하며 데이터 기반의 비즈니스 인사이트를 도출합니다. 최근에는 사내 데이터 마트 구축과 유저 리텐션 개선을 위한 대시보드 시각화 작업에 집중하고 있습니다.',
  'UX/UI 디자이너 6년차: 피그마를 활용해 전사 디자인 시스템을 관리하고 사용자 여정을 최적화하며 개발 효율을 높이는 핸드오프 업무를 수행합니다. 심미적 완성도를 넘어 비즈니스 지표를 개선하는 데이터 중심의 프로덕트 디자인에 주력하고 있습니다.',
  '서비스 운영 매니저(CX) 4년차: 고객의 목소리를 정제해 유의미한 VOC를 기획팀에 전달하고 전반적인 서비스 운영 프로세스를 최적화합니다. 반복되는 문의를 줄이기 위해 챗봇 시나리오를 설계하고 운영 자동화 지표를 관리하는 역할을 맡고 있습니다.',
  '컴공과 3학년 학생: Java와 Python 기반의 자료구조/알고리즘 및 운영체제 등 전공 심화 과정을 수강하며, 최근에는 개인 포트폴리오를 위해 React와 Node.js를 활용한 웹 프로젝트 협업에 참여 중입니다. 학점 관리와 동시에 다가올 하계 인턴십 지원을 위해 기술 면접 대비와 백준/프로그래머스 코딩 테스트 연습을 병행하고 있습니다.',
];

function Landing({ onSubmit }){
  const [text, setText] = useState('');
  const [apiKey, setApiKey] = useState(sessionStorage.getItem('claudeApiKey') || '');
  const [shake, setShake] = useState(false);
  const [keyVisible, setKeyVisible] = useState(false);
  const taRef = useRef(null);

  useEffect(()=>{ taRef.current?.focus(); }, []);

  const submit = () => {
    if (text.trim().length < 10){
      setShake(true);
      setTimeout(()=>setShake(false), 350);
      return;
    }
    const trimmedKey = apiKey.trim();
    sessionStorage.setItem('claudeApiKey', trimmedKey);
    const mode = trimmedKey ? 'real' : 'mock';
    onSubmit(text.trim(), mode);
  };

  const onKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit();
  };

  return (
    <div style={{position:'relative', minHeight:'100vh', padding:'48px 24px 80px'}}>
      <div className="grid-bg" />

      {/* 상단 헤더 */}
      <div style={{position:'relative', zIndex:2, maxWidth:980, margin:'0 auto', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div style={{display:'flex', alignItems:'center', gap:14}}>
          <Logo />
          <div>
            <div className="mono" style={{fontSize:11, letterSpacing:'.2em', color:'var(--warn)', opacity:.8}}>SYSTEM // v1.0.0</div>
            <div style={{fontWeight:900, fontSize:18, letterSpacing:'-.01em'}}>AI 생존 진단기</div>
          </div>
        </div>
      </div>

      {/* 히어로 */}
      <div style={{position:'relative', zIndex:2, maxWidth:980, margin:'56px auto 0'}}>
        <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:18, flexWrap:'wrap'}}>
          <span className="label-tag">CASE FILE · {new Date().toISOString().slice(0,10).replace(/-/g,'.')}</span>
        </div>

        <h1 style={{fontSize:'clamp(44px, 6.5vw, 84px)', lineHeight:1, margin:'0 0 20px', letterSpacing:'-.035em', fontWeight:800}}>
          AI 시대,<br/>
          나의 커리어<br/>
          <span style={{color:'var(--warn)'}}>경쟁력</span>은?
          <span className="cursor" style={{marginLeft:8, height:'.65em', display:'inline-block', verticalAlign:'baseline'}}></span>
        </h1>
        <p style={{fontSize:17, color:'var(--paper-2)', maxWidth:680, lineHeight:1.6, margin:'0 0 36px', opacity:.8}}>
          생존 확률 분석부터 맞춤형 스킬 업까지
        </p>

        {/* 입력 영역 */}
        <div className={shake ? 'shake' : ''} style={{position:'relative'}}>
          <div style={{position:'absolute', top:-12, left:24, padding:'0 10px', background:'var(--bg)', zIndex:2}}>
            <span className="mono" style={{fontSize:11, letterSpacing:'.15em', color:'var(--warn)'}}>// 현재의 직무나 전공을 알려주세요</span>
          </div>
          <textarea
            ref={taRef}
            className="diag"
            placeholder={`예) 데이터 분석가 4년차입니다. SQL과 Python으로 퍼널 분석과 A/B 테스트를 설계합니다.\n예) UX/UI 디자이너 6년차. 피그마로 전사 디자인 시스템을 관리하고 있습니다.\n예) 컴공과 3학년. React/Node.js 웹 프로젝트 협업 중, 하계 인턴십 준비 중입니다.`}
            value={text}
            onChange={(e)=>setText(e.target.value)}
            onKeyDown={onKey}
          />
          <div style={{display:'flex', justifyContent:'space-between', marginTop:10, padding:'0 4px', fontSize:12, color:'var(--paper-2)', opacity:.6}}>
            <span className="mono">{text.length} chars · 최소 10자</span>
          </div>
        </div>

        {/* 예시 칩 */}
        <div style={{marginTop:28}}>
          <div style={{fontSize:13, color:'var(--paper-2)', opacity:.65, marginBottom:10}}>예시 프롬프트 ↓</div>
          <div style={{display:'flex', gap:10, flexWrap:'wrap'}}>
            {EXAMPLES.map((ex,i)=>(
              <button key={i} className="chip" onClick={()=>{setText(ex); taRef.current?.focus();}}>
                {ex.length > 38 ? ex.slice(0,38)+'…' : ex}
              </button>
            ))}
          </div>
        </div>

        {/* Google API Key 입력 */}
        <div style={{marginTop:28}}>
          <div style={{fontSize:15, fontWeight:700, marginBottom:6}}>Gemini API 키를 입력하세요</div>
          <div style={{fontSize:13, color:'var(--paper-2)', opacity:.65, marginBottom:6}}>키는 브라우저에만 임시 저장되며 서버로 전송되지 않습니다</div>
          <a href="https://aistudio.google.com/api-keys" target="_blank" rel="noopener noreferrer"
             style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:13, color:'var(--warn)', textDecoration:'none', marginBottom:10, opacity:.85}}>
            Google AI Studio에서 발급받기 →
          </a>
          <div style={{position:'relative', maxWidth:480}}>
            <input
              type={keyVisible ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Gemini API Key"
              style={{
                width:'100%', height:42, padding:'0 40px 0 14px',
                background:'rgba(245,239,224,.04)', border:'1px solid var(--line)',
                borderRadius:10, color:'var(--paper)', fontFamily:'JetBrains Mono, monospace',
                fontSize:13, outline:'none', transition:'border-color .2s',
              }}
              onFocus={e => e.target.style.borderColor='var(--warn)'}
              onBlur={e => e.target.style.borderColor='var(--line)'}
            />
            <button
              onClick={()=>setKeyVisible(v=>!v)}
              style={{
                position:'absolute', right:10, top:'50%', transform:'translateY(-50%)',
                background:'none', border:'none', cursor:'pointer',
                color:'var(--paper-2)', fontSize:15, padding:0, lineHeight:1,
              }}
            >{keyVisible ? '🙈' : '👁'}</button>
          </div>
        </div>

        {/* CTA */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginTop:20, flexWrap:'wrap'}}>
          <button className="btn danger" onClick={submit} style={{fontSize:15, padding:'15px 26px'}}>
            진단 시작
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{marginLeft:2}}><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function Logo(){
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" style={{display:'block'}}>
      <rect x="2" y="2" width="40" height="40" rx="10" fill="var(--warn)" stroke="var(--ink)" strokeWidth="2"/>
      <path d="M8 24 L14 24 L17 16 L23 32 L26 22 L30 22 L32 26 L36 26" stroke="var(--ink)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="36" cy="26" r="2" fill="var(--danger-2)"/>
    </svg>
  );
}

window.Landing = Landing;
window.Logo = Logo;
