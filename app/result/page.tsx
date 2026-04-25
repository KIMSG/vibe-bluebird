"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Result } from "@/components/Result";
import type { DiagnosisResult, Mode } from "@/lib/types";

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<Mode>("mock");

  useEffect(() => {
    const raw = sessionStorage.getItem("diagResult");
    const text = sessionStorage.getItem("diagInput") || "";
    const m = (sessionStorage.getItem("diagMode") as Mode) || "mock";

    if (!raw) {
      router.replace("/");
      return;
    }

    try {
      setResult(JSON.parse(raw) as DiagnosisResult);
      setInputText(text);
      setMode(m);
    } catch {
      router.replace("/");
    }
  }, [router]);

  const handleRestart = () => {
    sessionStorage.clear();
    router.push("/");
  };

  if (!result) return null;

  return <Result result={result} inputText={inputText} mode={mode} onRestart={handleRestart} />;
}
