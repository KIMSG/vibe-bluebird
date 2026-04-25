"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/Loading";
import { diagnose } from "@/lib/diagnose";
import type { Mode } from "@/lib/types";

export default function LoadingPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const [mode, setMode] = useState<Mode>("mock");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const text = sessionStorage.getItem("diagInput") || "";
    const m = (sessionStorage.getItem("diagMode") as Mode) || "mock";
    const apiKey = sessionStorage.getItem("claudeApiKey") || "";

    if (!text) {
      router.replace("/");
      return;
    }

    setInputText(text);
    setMode(m);
    setReady(true);

    diagnose(text, m, apiKey)
      .then((result) => {
        sessionStorage.setItem("diagResult", JSON.stringify(result));
        sessionStorage.removeItem("diagError");
        router.replace("/result");
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "진단 중 오류가 발생했습니다.";
        sessionStorage.setItem("diagError", msg);
        router.replace("/");
      });
  }, [router]);

  if (!ready) return null;
  return <Loading inputText={inputText} mode={mode} />;
}
