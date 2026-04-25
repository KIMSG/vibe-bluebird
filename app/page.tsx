"use client";

import { useRouter } from "next/navigation";
import { Landing } from "@/components/Landing";
import type { Mode } from "@/lib/types";

export default function Home() {
  const router = useRouter();

  const handleSubmit = (text: string, mode: Mode) => {
    sessionStorage.setItem("diagInput", text);
    sessionStorage.setItem("diagMode", mode);
    sessionStorage.removeItem("diagResult");
    router.push("/loading");
  };

  return <Landing onSubmit={handleSubmit} />;
}
