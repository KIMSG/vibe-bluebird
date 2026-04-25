"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "./Logo";
import type { DiagnosisResult, Mode, PlaybookItem, SkillNode, Stats, Tool } from "@/lib/types";

const FONT_MONO = "var(--font-jetbrains-mono), ui-monospace, monospace";

function pctColor(p: number) {
  if (p < 30) return "#3fb96b";
  if (p < 45) return "#9cc73a";
  if (p < 60) return "#ffb400";
  if (p < 75) return "#ff8a1a";
  if (p < 88) return "#ff5a1f";
  return "#e63b2e";
}

function pctLabel(p: number) {
  if (p < 30) return "안전";
  if (p < 45) return "안정";
  if (p < 60) return "주의";
  if (p < 75) return "위태";
  if (p < 88) return "위험";
  return "치명";
}

interface ResultProps {
  result: DiagnosisResult;
  inputText: string;
  mode: Mode;
  onRestart: () => void;
}

export function Result({ result, inputText, mode, onRestart }: ResultProps) {
  const verdictColor = pctColor(result.percent);

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div className="grid-bg" />
      <div style={{ position: "relative", zIndex: 2, maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Logo />
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: ".2em", color: "var(--warn)" }}>
                DIAGNOSIS COMPLETE
              </div>
              <div style={{ fontWeight: 900, fontSize: 18 }}>
                진단서 #{hashCode(inputText).toString(16).slice(0, 6).toUpperCase()}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn ghost" onClick={onRestart}>
              ← 다시 진단
            </button>
            <ShareButtons result={result} />
          </div>
        </div>

        <VerdictCard result={result} verdictColor={verdictColor} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <StatsCard stats={result.stats || { tech: 50, human: 50, creative: 50, judgment: 50 }} />
          <DiagnosisCard diagnosis={result.diagnosis} />
        </div>

        <SectionHeader num="02" title="살아남는 스킬 트리" subtitle="당신이 갈고닦아야 할 분기점들" />
        <SkillTree tree={result.skillTree} />

        <SectionHeader num="03" title="지금 당장 써야 할 AI 도구" subtitle="urgency 순으로 정렬" />
        <ToolGrid tools={result.tools} />

        <SectionHeader num="04" title="실행 플레이북" subtitle="오늘 / 1주일 / 1개월 / 3개월" />
        <Playbook playbook={result.playbook} />

        <div
          style={{
            marginTop: 60,
            padding: "22px 26px",
            border: "1px dashed var(--line)",
            borderRadius: 14,
            color: "var(--paper-2)",
            opacity: 0.6,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <b style={{ color: "var(--warn)" }}>📌 진단의 한계</b> · 이 결과는{" "}
          {mode === "real" ? "Claude의 실제 분석" : "mock 휴리스틱"}을 기반으로 합니다. 정확한 직무 미래는 누구도 모릅니다. 이 진단을 받았다는 사실 자체가 이미 평균보다 앞서있다는 뜻입니다 — 대부분 사람은 안 찾아봅니다.
          {result._fallback && (
            <div style={{ marginTop: 8, color: "var(--danger-2)" }}>
              ⚠ Real AI 호출 실패로 mock 진단으로 대체되었습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerdictCard({ result, verdictColor }: { result: DiagnosisResult; verdictColor: string }) {
  const { percent, verdict, tagline, role } = result;
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden", borderColor: verdictColor, borderWidth: 2 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1.4fr", gap: 0 }}>
        <div style={{ padding: "34px 32px", borderRight: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="label-tag">ESTIMATED ROLE</span>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--warn-2)" }}>{role}</span>
          </div>

          <div className="mono" style={{ fontSize: 12, letterSpacing: ".15em", color: "var(--paper-2)", opacity: 0.7, marginBottom: 6 }}>
            AI 대체 가능성
          </div>
          <div
            style={{
              fontFamily: FONT_MONO,
              fontWeight: 800,
              fontSize: "clamp(96px, 13vw, 168px)",
              lineHeight: 0.92,
              letterSpacing: "-.04em",
              color: verdictColor,
              textShadow: `0 0 40px ${verdictColor}55`,
            }}
          >
            <CountUp to={percent} />
            <span style={{ fontSize: ".45em", color: "var(--paper-2)", opacity: 0.5, marginLeft: 8 }}>%</span>
          </div>

          <PctSpectrum percent={percent} />

          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                background: verdictColor,
                color: "#1a1308",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: ".1em",
              }}
            >
              {pctLabel(percent).toUpperCase()} · {verdict.toUpperCase()}
            </div>
          </div>

          <p style={{ fontSize: 17, lineHeight: 1.55, marginTop: 18, color: "var(--paper)", fontWeight: 600, opacity: 0.95 }}>
            &ldquo;{tagline}&rdquo;
          </p>
        </div>

        <div style={{ position: "relative", background: "#0a0704", minHeight: 340 }}>
          <ECG percent={percent} verdictColor={verdictColor} />
          <div style={{ position: "absolute", top: 14, left: 18, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: 8, background: verdictColor, boxShadow: `0 0 8px ${verdictColor}` }} />
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".15em", color: "var(--paper-2)", opacity: 0.8 }}>
              SURVIVAL_MONITOR · LIVE
            </span>
          </div>
          <div
            className="mono"
            style={{ position: "absolute", top: 14, right: 18, display: "flex", gap: 14, fontSize: 11, color: "var(--paper-2)", opacity: 0.7 }}
          >
            <div>
              BPM <b style={{ color: verdictColor }}>{Math.round(60 + percent * 1.2)}</b>
            </div>
            <div>
              O₂ <b style={{ color: verdictColor }}>{Math.round(98 - percent * 0.4)}</b>
            </div>
            <div>
              HR <b style={{ color: verdictColor }}>{percent < 50 ? "OK" : "CRIT"}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PctSpectrum({ percent }: { percent: number }) {
  const stops = [
    { p: 0, c: "#3fb96b", l: "안전" },
    { p: 30, c: "#9cc73a", l: "안정" },
    { p: 45, c: "#ffb400", l: "주의" },
    { p: 60, c: "#ff8a1a", l: "위태" },
    { p: 75, c: "#ff5a1f", l: "위험" },
    { p: 88, c: "#e63b2e", l: "치명" },
  ];
  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          position: "relative",
          height: 10,
          borderRadius: 6,
          overflow: "hidden",
          background:
            "linear-gradient(to right, #3fb96b 0%, #9cc73a 28%, #ffb400 48%, #ff8a1a 65%, #ff5a1f 82%, #e63b2e 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -4,
            bottom: -4,
            left: `${percent}%`,
            width: 3,
            background: "var(--paper)",
            boxShadow: "0 0 8px rgba(254,246,216,.8)",
            transform: "translateX(-50%)",
          }}
        />
      </div>
      <div
        className="mono"
        style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "var(--paper-2)", opacity: 0.55 }}
      >
        {stops.map((s) => (
          <span key={s.p} style={{ flex: 1, textAlign: s.p === 0 ? "left" : "center" }}>
            {s.l}
          </span>
        ))}
      </div>
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const dur = 1400;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <>{n}</>;
}

function ECG({ percent, verdictColor }: { percent: number; verdictColor: string }) {
  const path = useMemo(() => buildECGPath(percent), [percent]);
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const W = 700;
  const H = 340;
  const dashOffset = -((t * 180) % (W * 2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <pattern id="ecggrid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d={`M28 0H0V28`} fill="none" stroke="rgba(255,180,0,.08)" strokeWidth="1" />
        </pattern>
        <pattern id="ecggridBig" x="0" y="0" width="84" height="84" patternUnits="userSpaceOnUse">
          <path d={`M84 0H0V84`} fill="none" stroke="rgba(255,180,0,.18)" strokeWidth="1" />
        </pattern>
        <linearGradient id="ecgGrad" x1="0" x2="1">
          <stop offset="0" stopColor={verdictColor} stopOpacity="0" />
          <stop offset=".3" stopColor={verdictColor} stopOpacity=".5" />
          <stop offset="1" stopColor={verdictColor} stopOpacity="1" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
      </defs>
      <rect width={W} height={H} fill="url(#ecggrid)" />
      <rect width={W} height={H} fill="url(#ecggridBig)" />
      <line x1="0" y1={H / 2} x2={W} y2={H / 2} stroke={verdictColor} strokeWidth="0.5" strokeDasharray="3 6" opacity=".3" />
      <g style={{ filter: "url(#glow)" }}>
        <path d={path} fill="none" stroke={verdictColor} strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" opacity=".5" />
      </g>
      <path
        d={path}
        fill="none"
        stroke={verdictColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={`${W * 2} ${W * 2}`}
        strokeDashoffset={dashOffset}
      />
      <SweepDot path={path} t={t} color={verdictColor} />
    </svg>
  );
}

function SweepDot({ path, t, color }: { path: string; t: number; color: string }) {
  const ref = useRef<SVGPathElement>(null);
  const [pt, setPt] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const total = ref.current.getTotalLength();
    if (!total) return;
    const len = (t * 180) % total;
    const p = ref.current.getPointAtLength(len);
    setPt({ x: p.x, y: p.y });
  }, [t, path]);
  return (
    <>
      <path ref={ref} d={path} fill="none" stroke="none" />
      <circle cx={pt.x} cy={pt.y} r="5" fill={color}>
        <animate attributeName="r" values="4;7;4" dur=".8s" repeatCount="indefinite" />
      </circle>
      <circle cx={pt.x} cy={pt.y} r="11" fill="none" stroke={color} opacity=".4">
        <animate attributeName="r" values="6;14;6" dur=".8s" repeatCount="indefinite" />
        <animate attributeName="opacity" values=".6;0;.6" dur=".8s" repeatCount="indefinite" />
      </circle>
    </>
  );
}

function buildECGPath(percent: number): string {
  const W = 700;
  const H = 340;
  const midY = H / 2;
  const cycles = 4;
  const cycleW = W / cycles;
  const intensity = percent / 100;
  const amp = 60 + intensity * 90;
  const noise = intensity * 20;
  const irreg = intensity * 0.5;

  let d = `M0 ${midY} `;
  for (let c = 0; c < cycles; c++) {
    const baseX = c * cycleW;
    const wob = Math.sin(c * 1.7) * irreg;
    const flat1 = cycleW * (0.18 + wob * 0.05);
    const Pup = cycleW * 0.06;
    const Pdn = cycleW * 0.06;
    const Q = cycleW * 0.04;
    const R = cycleW * 0.04;
    const S = cycleW * 0.04;
    const T = cycleW * 0.10;
    const flat2 = cycleW - flat1 - Pup - Pdn - Q - R - S - T;

    let x = baseX;
    x += flat1;
    d += `L${x} ${midY + (Math.random() - 0.5) * noise * 0.3} `;
    x += Pup;
    d += `Q ${x - Pup / 2} ${midY - 14 - intensity * 5} ${x} ${midY} `;
    x += Pdn;
    d += `L${x} ${midY} `;
    x += Q;
    d += `L${x} ${midY + 12 + intensity * 8} `;
    x += R;
    d += `L${x} ${midY - amp} `;
    x += S;
    d += `L${x} ${midY + 24 + intensity * 16} `;
    x += T * 0.5;
    d += `Q ${x} ${midY - 22 - intensity * 8} ${x + T * 0.5} ${midY} `;
    const steps = 10;
    for (let i = 1; i <= steps; i++) {
      const xi = baseX + cycleW - flat2 + (flat2 * i) / steps;
      const yi = midY + (Math.random() - 0.5) * noise + Math.sin(i * 1.3 + c) * intensity * 4;
      d += `L${xi} ${yi} `;
    }
  }
  d += `L${W} ${midY}`;
  return d;
}

function StatsCard({ stats }: { stats: Stats }) {
  const items: { key: keyof Stats; label: string; color: string; desc: string }[] = [
    { key: "tech", label: "기술 활용", color: "var(--warn-2)", desc: "AI/도구 다루는 능력" },
    { key: "human", label: "인간 협업", color: "var(--safe)", desc: "사람을 움직이는 힘" },
    { key: "creative", label: "창의/판단", color: "var(--danger)", desc: "AI가 못 흉내 내는" },
    { key: "judgment", label: "전문 판단", color: "var(--warn)", desc: "책임지는 결정" },
  ];
  return (
    <div className="panel">
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div className="label-tag">CAPABILITY MAP</div>
        <span className="mono" style={{ fontSize: 11, color: "var(--paper-2)", opacity: 0.5 }}>
          0~100
        </span>
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {items.map((it) => {
          const v = stats[it.key] ?? 50;
          return (
            <div key={it.key}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                <div>
                  <span style={{ fontWeight: 800, fontSize: 14 }}>{it.label}</span>
                  <span style={{ fontSize: 11, color: "var(--paper-2)", opacity: 0.55, marginLeft: 8 }}>{it.desc}</span>
                </div>
                <span className="mono" style={{ fontWeight: 700, color: it.color }}>
                  {v}
                </span>
              </div>
              <div style={{ height: 8, background: "rgba(255,180,0,.08)", borderRadius: 8, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${v}%`,
                    background: it.color,
                    transition: "width 1s ease-out",
                    boxShadow: `0 0 8px ${it.color}88`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DiagnosisCard({ diagnosis }: { diagnosis: string[] }) {
  return (
    <div className="panel">
      <div className="label-tag" style={{ marginBottom: 14 }}>
        DOCTOR&apos;S NOTES
      </div>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 14 }}>
        {(diagnosis || []).map((d, i) => (
          <li key={i} style={{ display: "flex", gap: 12 }}>
            <span className="mono" style={{ color: "var(--warn)", fontWeight: 700, fontSize: 13, marginTop: 2 }}>
              0{i + 1}
            </span>
            <span style={{ fontSize: 14, lineHeight: 1.6, color: "var(--paper)" }}>{d}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionHeader({ num, title, subtitle }: { num: string; title: string; subtitle: string }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 14, margin: "56px 0 22px", flexWrap: "wrap" }}>
      <span className="mono" style={{ fontSize: 12, color: "var(--warn)", letterSpacing: ".15em", fontWeight: 700 }}>
        // {num}
      </span>
      <h2 style={{ margin: 0, fontSize: "clamp(28px,3.5vw,42px)", fontWeight: 900, letterSpacing: "-.02em" }}>{title}</h2>
      <span style={{ fontSize: 14, color: "var(--paper-2)", opacity: 0.6 }}>{subtitle}</span>
    </div>
  );
}

interface BranchDef {
  id: SkillNode["branch"];
  label: string;
  color: string;
  icon: string;
}

const BRANCHES: BranchDef[] = [
  { id: "core", label: "직무 코어", color: "var(--warn)", icon: "⚔️" },
  { id: "human", label: "인간력", color: "var(--safe)", icon: "🤝" },
  { id: "ai", label: "AI 활용", color: "var(--danger)", icon: "🤖" },
];

function splitSkillName(name: string): string[] {
  if (name.length <= 7) return [name];
  const seps = [" ", "/", "-", "·", "+"];
  const target = Math.ceil(name.length / 2);
  let bestIdx = -1;
  let bestDist = Infinity;
  for (let i = 1; i < name.length - 1; i++) {
    if (seps.includes(name[i])) {
      const d = Math.abs(i - target);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
  }
  if (bestIdx > 0) {
    if (name[bestIdx] === " ") return [name.slice(0, bestIdx).trim(), name.slice(bestIdx + 1).trim()];
    return [name.slice(0, bestIdx + 1).trim(), name.slice(bestIdx + 1).trim()];
  }
  return [name.slice(0, target), name.slice(target)];
}

function SkillTree({ tree }: { tree: SkillNode[] }) {
  const [hover, setHover] = useState<string | null>(null);

  const grouped = BRANCHES.map((b) => ({
    ...b,
    nodes: (tree || []).filter((n) => n.branch === b.id).sort((a, b) => a.tier - b.tier),
  }));

  const COL = 260;
  const ROW = 175;
  const PAD_TOP = 60;
  const PAD_LEFT = 40;
  const W = PAD_LEFT * 2 + BRANCHES.length * COL;
  const maxRows = Math.max(...grouped.map((g) => g.nodes.length || 1));
  const H = PAD_TOP + maxRows * ROW + 30;

  const nodePos = (bIdx: number, nIdx: number) => ({
    x: PAD_LEFT + bIdx * COL + COL / 2,
    y: PAD_TOP + nIdx * ROW + 50,
  });

  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div
        style={{
          padding: "18px 22px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {BRANCHES.map((b) => (
            <div key={b.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--paper-2)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: b.color }} />
              <span>
                {b.icon} {b.label}
              </span>
            </div>
          ))}
        </div>
        <span className="mono" style={{ fontSize: 11, color: "var(--paper-2)", opacity: 0.5 }}>
          HOVER FOR DETAIL · 진하게 표시된 노드부터 시작
        </span>
      </div>
      <div style={{ overflowX: "auto", background: "#0d0a04" }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ display: "block", minWidth: W, width: "100%", height: "auto" }}>
          <defs>
            <pattern id="treegrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1" fill="rgba(255,180,0,.18)" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#treegrid)" />

          {grouped.map((g, bIdx) => {
            const x = PAD_LEFT + bIdx * COL + COL / 2;
            return (
              <g key={g.id}>
                <text
                  x={x}
                  y={32}
                  textAnchor="middle"
                  fill={g.color}
                  style={{ fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, letterSpacing: ".15em" }}
                >
                  {g.icon} {g.label.toUpperCase()}
                </text>
              </g>
            );
          })}

          {grouped.map((g, bIdx) =>
            g.nodes.map((n, nIdx) => {
              if (!n.parent) return null;
              const parent = (tree || []).find((p) => p.id === n.parent);
              if (!parent) return null;
              const pIdx = grouped.findIndex((gg) => gg.id === parent.branch);
              const pNIdx = grouped[pIdx]?.nodes.findIndex((pp) => pp.id === parent.id);
              if (pNIdx == null || pNIdx < 0) return null;
              const a = nodePos(pIdx, pNIdx);
              const b = nodePos(bIdx, nIdx);
              const aR = 46 + (parent.tier === 1 ? 6 : 0);
              const bR = 46 + (n.tier === 1 ? 6 : 0);
              return (
                <path
                  key={`e${n.id}`}
                  d={`M${a.x} ${a.y + aR + 2} C ${a.x} ${a.y + aR + 30} ${b.x} ${b.y - bR - 30} ${b.x} ${b.y - bR - 2}`}
                  stroke={g.color}
                  strokeWidth="2"
                  fill="none"
                  opacity=".5"
                  strokeDasharray="6 4"
                />
              );
            }),
          )}

          {(() => {
            const items = grouped.flatMap((g, bIdx) =>
              g.nodes.map((n, nIdx) => ({ g, bIdx, n, nIdx })),
            );
            items.sort((a, b) => Number(a.n.id === hover) - Number(b.n.id === hover));
            return items.map(({ g, bIdx, n, nIdx }) => {
              const { x, y } = nodePos(bIdx, nIdx);
              const isHover = hover === n.id;
              const size = 92 + (n.tier === 1 ? 12 : 0);
              const scale = isHover ? 1.4 : 1;
              const haloR = (size / 2) * scale;
              const lines = splitSkillName(n.name);
              const longest = Math.max(...lines.map((l) => l.length));
              const fontSize = longest <= 4 ? 15 : longest <= 6 ? 13 : longest <= 8 ? 12 : 11;
              const lineGap = fontSize + 2;
              const yStart = lines.length === 1 ? 5 : -((lines.length - 1) * lineGap) / 2 + 4;
              return (
                <g key={n.id} className="node">
                  <g
                    transform={`translate(${x} ${y}) scale(${scale})`}
                    onMouseEnter={() => setHover(n.id)}
                    onMouseLeave={() => setHover(null)}
                    style={{ cursor: "pointer", transition: "transform 180ms ease-out" }}
                  >
                    <Hexagon r={size / 2} fill={n.unlocked ? g.color : "var(--bg-2)"} stroke={g.color} strokeWidth="2.5" />
                    {n.tier === 1 && <Hexagon r={size / 2 + 8} fill="none" stroke={g.color} strokeWidth="1" opacity=".4" />}
                    <circle cx={size / 2 - 8} cy={-size / 2 + 8} r="11" fill="var(--bg)" stroke={g.color} strokeWidth="1.5" />
                    <text
                      x={size / 2 - 8}
                      y={-size / 2 + 12}
                      textAnchor="middle"
                      fill={g.color}
                      style={{ fontSize: 11, fontWeight: 800, fontFamily: FONT_MONO }}
                    >
                      {n.tier}
                    </text>
                    <text
                      x="0"
                      y={yStart}
                      textAnchor="middle"
                      fill={n.unlocked ? "var(--ink)" : g.color}
                      style={{ fontSize, fontWeight: 800 }}
                    >
                      {lines.map((line, i) => (
                        <tspan key={i} x="0" dy={i === 0 ? 0 : lineGap}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                    <g transform={`translate(${-size / 2 + 6} ${size / 2 + 14})`}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <rect
                          key={i}
                          x={i * 8}
                          y="0"
                          width="6"
                          height="6"
                          rx="1"
                          fill={i < n.urgency ? g.color : "rgba(255,255,255,.1)"}
                        />
                      ))}
                    </g>
                  </g>

                  {isHover && (
                    <g transform={`translate(${x} ${y})`} style={{ pointerEvents: "none" }}>
                      <rect
                        x={-110}
                        y={haloR + 18}
                        width="220"
                        height="56"
                        rx="8"
                        fill="var(--bg-2)"
                        stroke={g.color}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y={haloR + 38}
                        textAnchor="middle"
                        fill="var(--paper)"
                        style={{ fontSize: 12, fontWeight: 700 }}
                      >
                        {n.name}
                      </text>
                      <foreignObject x={-100} y={haloR + 44} width="200" height="28">
                        <div
                          style={{ fontSize: 11, color: "#fde58aaa", textAlign: "center", lineHeight: 1.4 }}
                        >
                          {n.desc}
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </g>
              );
            });
          })()}
        </svg>
      </div>
      <div
        style={{
          padding: "18px 22px",
          borderTop: "1px solid var(--line)",
          display: "grid",
          gap: 10,
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        }}
      >
        {(tree || []).map((n) => {
          const branch = BRANCHES.find((b) => b.id === n.branch);
          if (!branch) return null;
          return (
            <div
              key={n.id}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,180,0,.04)",
                border: `1px solid ${branch.color}33`,
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: 32 }}>
                <span className="mono" style={{ fontSize: 11, color: branch.color, fontWeight: 800 }}>
                  T{n.tier}
                </span>
                <span style={{ fontSize: 14 }}>{branch.icon}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: branch.color }}>{n.name}</div>
                <div style={{ fontSize: 12, color: "var(--paper-2)", opacity: 0.7, lineHeight: 1.4 }}>{n.desc}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Hexagon({ r, ...rest }: { r: number } & React.SVGProps<SVGPolygonElement>) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return [r * Math.cos(a), r * Math.sin(a)].join(",");
  }).join(" ");
  return <polygon points={points} {...rest} />;
}

function ToolGrid({ tools }: { tools: Tool[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
      {(tools || []).map((t, i) => (
        <div
          key={t.name}
          className="panel"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            position: "relative",
            borderColor: t.urgency >= 3 ? "var(--danger)" : "var(--line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--paper-2)", opacity: 0.6, letterSpacing: ".12em" }}>
              #{String(i + 1).padStart(2, "0")} · {t.category}
            </span>
            <UrgencyBadge urgency={t.urgency} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "var(--warn-2)" }}>{t.name}</div>
          <div style={{ fontSize: 14, color: "var(--paper)", opacity: 0.85, lineHeight: 1.5 }}>{t.why}</div>
        </div>
      ))}
    </div>
  );
}

function UrgencyBadge({ urgency }: { urgency: number }) {
  const map: Record<number, { label: string; color: string }> = {
    3: { label: "NOW", color: "var(--danger)" },
    2: { label: "SOON", color: "var(--warn)" },
    1: { label: "LATER", color: "var(--paper-2)" },
  };
  const u = map[urgency] || map[1];
  return (
    <span
      className="stamp"
      style={{ color: u.color, borderColor: u.color, fontSize: 9, padding: "3px 8px", transform: "rotate(0)" }}
    >
      {u.label}
    </span>
  );
}

function Playbook({ playbook }: { playbook: PlaybookItem[] }) {
  const items = playbook || [];
  return (
    <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
      <div style={{ position: "relative", padding: "24px 28px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 0 }}>
          {items.map((_, i) => (
            <div key={i} style={{ position: "relative", textAlign: "center" }}>
              <div
                className="mono"
                style={{ fontSize: 10, color: "var(--paper-2)", opacity: 0.55, letterSpacing: ".15em", marginBottom: 8 }}
              >
                T+{i === 0 ? "0" : i === 1 ? "7d" : i === 2 ? "30d" : "90d"}
              </div>
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: i === 0 ? "var(--warn)" : "transparent",
                  border: "2px solid var(--warn)",
                  margin: "0 auto",
                  boxShadow: i === 0 ? "0 0 0 4px rgba(255,180,0,.15)" : "none",
                }}
              />
            </div>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            left: "12.5%",
            right: "12.5%",
            top: "52px",
            height: 2,
            background: "linear-gradient(to right, var(--warn), rgba(255,180,0,.2))",
            zIndex: 0,
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 0, marginTop: 18 }}>
        {items.map((p, i) => (
          <div
            key={i}
            style={{
              padding: "22px 24px 26px",
              borderRight: i < items.length - 1 ? "1px solid var(--line)" : "none",
              borderTop: "1px solid var(--line)",
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 10, color: "var(--warn)", letterSpacing: ".15em", fontWeight: 700, marginBottom: 6 }}
            >
              STEP 0{i + 1}
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "var(--paper)", letterSpacing: "-.02em", marginBottom: 12 }}>
              {p.when}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "var(--paper-2)", opacity: 0.85 }}>{p.action}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShareButtons({ result }: { result: DiagnosisResult }) {
  const [copied, setCopied] = useState(false);
  const summary =
    `🩺 AI 생존 진단 결과\n` +
    `직무: ${result.role}\n` +
    `대체 가능성: ${result.percent}% (${result.verdict})\n` +
    `한줄평: "${result.tagline}"\n` +
    `\n살아남는 스킬 TOP 3:\n` +
    (result.skillTree || []).slice(0, 3).map((s, i) => `${i + 1}. ${s.name} — ${s.desc}`).join("\n") +
    `\n\n#AI생존진단기`;

  const copy = () => {
    navigator.clipboard?.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  return (
    <button className="btn ghost" onClick={copy}>
      {copied ? "✓ 복사됨" : "📋 텍스트 복사"}
    </button>
  );
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) & 0xffffff;
  return Math.abs(h);
}
