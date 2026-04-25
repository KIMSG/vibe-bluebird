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

    diagnose(text, m, apiKey).then((result) => {
      sessionStorage.setItem("diagResult", JSON.stringify(result));
      router.replace("/result");
    });
  }, [router]);

  if (!ready) return null;
  return <Loading inputText={inputText} mode={mode} />;
}
