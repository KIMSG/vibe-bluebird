// 분석 중 로딩 화면: 스캔/타이핑/계산 애니메이션
const { useState: useStateL, useEffect: useEffectL, useRef: useRefL } = React;

const PHASES = [
  { id:'scan',    label:'INPUT 분석', detail:'키워드/직무/경력 토큰화 중...', icon:'🔍' },
  { id:'cluster', label:'직무 클러스터링', detail:'유사 직군 32만건 매칭 중...', icon:'🧬' },
  { id:'calc',    label:'대체 가능성 계산', detail:'반복성/판단력/창의성 점수화...', icon:'🧮' },
  { id:'tree',    label:'스킬 트리 빌드', detail:'생존 분기점 가지치기 중...', icon:'🌳' },
  { id:'tools',   label:'도구 매칭', detail:'당신에게 맞는 AI 추천 정렬...', icon:'🛠️' },
  { id:'verdict', label:'최종 판정 작성', detail:'진단서 출력 준비...', icon:'⚖️' },
];

function Loading({ inputText, mode, onDone }){
  const [phaseIdx, setPhaseIdx] = useStateL(0);
  const [pct, setPct] = useStateL(0);
  const [glitch, setGlitch] = useStateL(false);

  useEffectL(() => {
    const totalMs = mode === 'real' ? 9000 : 4200;
    const start = performance.now();
    let raf;
    const tick = () => {
      const t = (performance.now() - start) / totalMs;
      const p = Math.min(0.99, t);
      setPct(p);
      const idx = Math.min(PHASES.length - 1, Math.floor(p * PHASES.length));
      setPhaseIdx(idx);
      if (Math.random() < 0.04) { setGlitch(true); setTimeout(()=>setGlitch(false), 80); }
      if (t < 0.99) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  return (
    <div style={{position:'relative', minHeight:'100vh', padding:'48px 24px', overflow:'hidden'}}>
      <div className="grid-bg" />

      {/* 스캔 라인 */}
      <div aria-hidden style={{
        position:'fixed', left:0, right:0, top:0, height:'100vh', pointerEvents:'none', zIndex:2, overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', left:0, right:0, height:160,
          background:'linear-gradient(to bottom, transparent, rgba(255,180,0,.18) 40%, rgba(255,180,0,.35) 50%, rgba(255,180,0,.18) 60%, transparent)',
          animation:'scanline 2.4s linear infinite',
          mixBlendMode:'screen',
        }}/>
      </div>

      <div style={{position:'relative', zIndex:3, maxWidth:980, margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex', alignItems:'center', gap:14, marginBottom:36}}>
          <Logo />
          <div>
            <div className="mono" style={{fontSize:11, letterSpacing:'.2em', color:'var(--warn)'}}>DIAGNOSTIC.exe</div>
            <div style={{fontWeight:900, fontSize:18}}>분석 중...</div>
          </div>
          <div style={{flex:1}}/>
          <span className="hazard" style={{padding:'6px 14px', fontFamily:'JetBrains Mono', fontSize:11, fontWeight:800, color:'var(--ink)'}}>
            ⚠ DO NOT REFRESH
          </span>
        </div>

        {/* 큰 % 카운터 */}
        <div style={{display:'grid', gridTemplateColumns:'1.1fr 1fr', gap:32, alignItems:'center', marginTop:20}}>
          <div>
            <div className="mono" style={{fontSize:13, color:'var(--paper-2)', opacity:.7, letterSpacing:'.15em'}}>OVERALL PROGRESS</div>
            <div style={{
              fontFamily:'JetBrains Mono', fontWeight:700,
              fontSize:'clamp(80px,14vw,180px)', lineHeight:1, color:'var(--warn)',
              letterSpacing:'-.04em',
              textShadow: glitch ? '3px 0 var(--danger), -3px 0 var(--warn-2)' : 'none',
              transform: glitch ? 'translateX(-1px)' : 'none',
            }}>
              {String(Math.round(pct*100)).padStart(2,'0')}<span style={{color:'var(--paper-2)', opacity:.4}}>%</span>
            </div>
            {/* 진행 바 */}
            <div style={{height:14, background:'rgba(255,180,0,.12)', borderRadius:8, overflow:'hidden', marginTop:14, border:'1px solid var(--line)'}}>
              <div style={{
                height:'100%', width:`${pct*100}%`,
                background:'repeating-linear-gradient(45deg, var(--warn) 0 12px, var(--warn-2) 12px 24px)',
                transition:'width .2s linear',
              }}/>
            </div>
          </div>

          {/* CRT 콘솔 */}
          <ConsoleLog phaseIdx={phaseIdx} inputText={inputText} mode={mode}/>
        </div>

        {/* 단계 리스트 */}
        <div style={{marginTop:40}}>
          <div className="mono" style={{fontSize:12, color:'var(--paper-2)', opacity:.7, letterSpacing:'.15em', marginBottom:12}}>// PIPELINE</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:10}}>
            {PHASES.map((p, i) => {
              const state = i < phaseIdx ? 'done' : i === phaseIdx ? 'active' : 'pending';
              return (
                <div key={p.id} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'12px 14px', borderRadius:12,
                  border: state === 'active' ? '1.5px solid var(--warn)' : '1px solid var(--line)',
                  background: state === 'active' ? 'rgba(255,180,0,.08)' : 'transparent',
                  opacity: state === 'pending' ? .35 : 1,
                  transition:'all .2s',
                }}>
                  <span style={{fontSize:18, filter: state==='done' ? 'grayscale(.5)' : 'none'}}>{state==='done' ? '✓' : p.icon}</span>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:700, color: state==='active' ? 'var(--warn)' : 'var(--paper)'}}>{p.label}</div>
                    <div className="mono" style={{fontSize:10, color:'var(--paper-2)', opacity:.6, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>
                      {p.detail}
                    </div>
                  </div>
                  {state === 'active' && <Spinner/>}
                </div>
              );
            })}
          </div>
        </div>

        <p style={{marginTop:36, fontSize:13, color:'var(--paper-2)', opacity:.5, fontStyle:'italic', textAlign:'center'}}>
          🤖 AI도 분석하면서 자기 일자리를 걱정하는 중입니다...
        </p>
      </div>
    </div>
  );
}

function Spinner(){
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{animation:'spin 1s linear infinite'}}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } svg { transform-origin: center; }`}</style>
      <circle cx="12" cy="12" r="9" stroke="var(--warn)" strokeWidth="2.5" fill="none" strokeDasharray="14 28" strokeLinecap="round"/>
    </svg>
  );
}

function ConsoleLog({ phaseIdx, inputText, mode }){
  const [lines, setLines] = useStateL([]);
  const ref = useRefL(null);
  useEffectL(() => {
    const messages = [
      `> ${mode === 'real' ? 'claude.complete()' : 'mock.diagnose()'} initiated`,
      `> input.length = ${inputText.length} chars`,
      `> tokenizing...`,
      `> matched 'role' patterns: scanning`,
      `> reading 32M historical job records`,
      `> computing automation_score`,
      `> branch_factor: human / creative / judgment`,
      `> scoring tier-1 skills`,
      `> querying AI tool index`,
      `> sorting by urgency`,
      `> ranking top 7`,
      `> drafting verdict`,
      `> formatting report`,
      mode === 'real' ? `> awaiting claude response...` : `> mock latency: 4200ms`,
    ];
    let i = 0;
    const id = setInterval(() => {
      setLines(L => [...L, messages[i % messages.length]].slice(-9));
      i++;
    }, 380);
    return () => clearInterval(id);
  }, []);
  useEffectL(()=>{ if (ref.current) ref.current.scrollTop = ref.current.scrollHeight; }, [lines]);

  return (
    <div ref={ref} style={{
      background:'#0a0704', border:'1.5px solid var(--line)', borderRadius:14,
      padding:'16px 18px', height:240, overflow:'hidden',
      fontFamily:'JetBrains Mono', fontSize:12, lineHeight:1.7, color:'var(--warn-2)',
    }}>
      <div style={{color:'var(--paper-2)', opacity:.5, marginBottom:6, fontSize:10, letterSpacing:'.15em'}}>{`// CONSOLE`}</div>
      {lines.map((l,i) => (
        <div key={i} style={{
          color: i === lines.length-1 ? 'var(--warn)' : 'var(--warn-2)',
          opacity: 0.4 + (i / lines.length) * 0.6,
        }}>
          {l}
        </div>
      ))}
      <span className="cursor" style={{height:'1em'}}/>
    </div>
  );
}

window.Loading = Loading;
