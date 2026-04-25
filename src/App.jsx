// 메인 App: 라우팅 (landing -> loading -> result)
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tone": "balance",
  "accent": "amber",
  "showECG": true,
  "showStats": true,
  "skillStyle": "tree"
}/*EDITMODE-END*/;

function App(){
  const [stage, setStage] = useStateA('landing'); // 'landing' | 'loading' | 'result'
  const [inputText, setInputText] = useStateA('');
  const [result, setResult] = useStateA(null);
  const [mode, setMode] = useStateA('mock'); // 'mock' | 'real'
  const [tweaks, setTweaks] = (window.useTweaks ? window.useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, ()=>{}]);

  // 색상 테마 적용
  useEffectA(() => {
    const root = document.documentElement;
    if (tweaks.accent === 'red'){
      root.style.setProperty('--warn', '#ff5f1f');
      root.style.setProperty('--warn-2', '#ff8c1a');
      root.style.setProperty('--danger', '#ff1a1a');
      root.style.setProperty('--danger-2', '#cc0000');
    } else if (tweaks.accent === 'lime'){
      root.style.setProperty('--warn', '#d4ff00');
      root.style.setProperty('--warn-2', '#a8ff00');
      root.style.setProperty('--danger', '#ffae00');
      root.style.setProperty('--danger-2', '#ff6a00');
    } else {
      // amber default
      root.style.setProperty('--warn', '#ffb400');
      root.style.setProperty('--warn-2', '#ffd000');
      root.style.setProperty('--danger', '#ff6a13');
      root.style.setProperty('--danger-2', '#ff3d00');
    }
  }, [tweaks.accent]);

  const start = (text) => {
    setInputText(text);
    setStage('loading');
    window.diagnose(text, mode).then(r => {
      setResult(r);
      setStage('result');
      window.scrollTo({top:0, behavior:'instant'});
    });
  };

  const restart = () => {
    setStage('landing');
    setResult(null);
    window.scrollTo({top:0, behavior:'instant'});
  };

  return (
    <>
      {stage === 'landing' && <window.Landing onSubmit={start} mode={mode} setMode={setMode}/>}
      {stage === 'loading' && <window.Loading inputText={inputText} mode={mode}/>}
      {stage === 'result' && result && <window.Result result={result} inputText={inputText} mode={mode} onRestart={restart}/>}

      {window.TweaksPanel && (
        <window.TweaksPanel title="Tweaks">
          <window.TweakSection title="컬러 테마">
            <window.TweakRadio
              label="액센트"
              value={tweaks.accent}
              onChange={v => setTweaks({accent: v})}
              options={[
                {value:'amber', label:'앰버 (기본)'},
                {value:'red',   label:'레드 알람'},
                {value:'lime',  label:'라임 (사이버)'},
              ]}
            />
          </window.TweakSection>
        </window.TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('app')).render(<App/>);
