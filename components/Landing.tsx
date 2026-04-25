"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "./Logo";
import type { Mode } from "@/lib/types";

const EXAMPLES = [
  "3년차 백엔드 개발자. Java/Spring 위주, 결제 시스템 담당. 최근 사내 AI 도입 TF 참여 중.",
  "IT 회사 PM 5년차. PRD 작성, 우선순위 조율, 분기 OKR 관리가 주 업무. SQL은 가끔.",
  "브랜드 마케터 2년차. 인스타 콘텐츠 기획, 카피라이팅, 인플루언서 협업.",
  "대학교 4학년 컴공과. UX 디자이너로 취업 준비 중. 사이드 프로젝트 1개.",
  "시각디자인과 졸업, 에이전시 그래픽 디자이너 4년. Figma/포토샵 능숙. 영상 편집은 초급.",
  "CS팀 5년차. 티켓 응대 하루 80건. 매뉴얼 기반 응답이 70%.",
];

interface LandingProps {
  onSubmit: (text: string) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export function Landing({ onSubmit, mode, setMode }: LandingProps) {
  const [text, setText] = useState("");
  const [shake, setShake] = useState(false);
  const [today, setToday] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    taRef.current?.focus();
    setToday(new Date().toISOString().slice(0, 10).replace(/-/g, "."));
  }, []);

  const submit = () => {
    if (text.trim().length < 10) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    onSubmit(text.trim());
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
  };

  return (
    <div style={{ position: "relative", minHeight: "100vh", padding: "48px 24px 80px" }}>
      <div className="grid-bg" />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Logo />
          <div>
            <div className="mono" style={{ fontSize: 11, letterSpacing: ".2em", color: "var(--warn)", opacity: 0.8 }}>
              SYSTEM // v1.0.0
            </div>
            <div style={{ fontWeight: 900, fontSize: 18, letterSpacing: "-.01em" }}>AI 생존 진단기</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 980, margin: "56px auto 0" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
          <span className="label-tag">CASE FILE · {today || "----.--.--"}</span>
        </div>

        <h1 style={{ fontSize: "clamp(44px, 6.5vw, 84px)", lineHeight: 1, margin: "0 0 20px", letterSpacing: "-.035em", fontWeight: 800 }}>
          AI가 당신을<br />
          대체할 확률은<br />
          <span style={{ color: "var(--warn)" }}>몇 %</span>일까요?
          <span className="cursor" style={{ marginLeft: 8, height: ".65em", display: "inline-block", verticalAlign: "baseline" }} />
        </h1>
        <p style={{ fontSize: 17, color: "var(--paper-2)", maxWidth: 680, lineHeight: 1.6, margin: "0 0 36px", opacity: 0.8 }}>
          직무·경력·하는 일을 자유롭게 입력해 주세요. AI가 생존 확률과 함께, 단련해야 할 스킬·당장 써야 할 도구를 알려드립니다.
        </p>

        <div className={shake ? "shake" : ""} style={{ position: "relative" }}>
          <div style={{ position: "absolute", top: -12, left: 24, padding: "0 10px", background: "var(--bg)", zIndex: 2 }}>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".15em", color: "var(--warn)" }}>
              // INPUT.txt
            </span>
          </div>
          <textarea
            ref={taRef}
            className="diag"
            placeholder={`예) 3년차 백엔드 개발자입니다. 결제 시스템 담당이고, Cursor를 매일 씁니다.\n예) 마케팅 5년차. 인스타 콘텐츠 + 퍼포먼스 광고 운영 중.\n예) 컴공과 4학년. 프론트엔드 취업 준비 중. 사이드 프로젝트 1개.`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
          />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "0 4px", fontSize: 12, color: "var(--paper-2)", opacity: 0.6 }}>
            <span className="mono">{text.length} chars · 최소 10자</span>
            <span className="mono">⌘+Enter 로 진단</span>
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 13, color: "var(--paper-2)", opacity: 0.65, marginBottom: 10 }}>예시 프롬프트 ↓</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {EXAMPLES.map((ex, i) => (
              <button
                key={i}
                className="chip"
                onClick={() => {
                  setText(ex);
                  taRef.current?.focus();
                }}
              >
                {ex.length > 38 ? ex.slice(0, 38) + "…" : ex}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 32, flexWrap: "wrap" }}>
          <button className="btn danger" onClick={submit} style={{ fontSize: 15, padding: "15px 26px" }}>
            진단 시작
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 2 }}>
              <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span style={{ fontSize: 13, color: "var(--paper-2)", opacity: 0.55 }}>
            {mode === "real" ? "Real AI (Claude) · 5~15초" : "Mock 모드 · 4초"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ModeToggle({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div style={{ display: "inline-flex", padding: 4, borderRadius: 999, border: "1px solid var(--line)", background: "rgba(0,0,0,.3)" }}>
      <button
        onClick={() => setMode("mock")}
        className="mono"
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: 0,
          cursor: "pointer",
          background: mode === "mock" ? "var(--warn)" : "transparent",
          color: mode === "mock" ? "var(--ink)" : "var(--paper-2)",
          fontWeight: mode === "mock" ? 800 : 500,
          fontSize: 12,
          letterSpacing: ".05em",
        }}
      >
        MOCK
      </button>
      <button
        onClick={() => setMode("real")}
        className="mono"
        style={{
          padding: "8px 14px",
          borderRadius: 999,
          border: 0,
          cursor: "pointer",
          background: mode === "real" ? "var(--danger)" : "transparent",
          color: mode === "real" ? "#fff" : "var(--paper-2)",
          fontWeight: mode === "real" ? 800 : 500,
          fontSize: 12,
          letterSpacing: ".05em",
        }}
      >
        REAL · CLAUDE
      </button>
    </div>
  );
}
