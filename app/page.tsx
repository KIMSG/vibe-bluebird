"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Landing } from "@/components/Landing";
import type { Mode } from "@/lib/types";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("mock");

  const handleSubmit = (text: string) => {
    sessionStorage.setItem("diagInput", text);
    sessionStorage.setItem("diagMode", mode);
    sessionStorage.removeItem("diagResult");
    router.push("/loading");
  };

  return <Landing onSubmit={handleSubmit} mode={mode} setMode={setMode} />;
}
