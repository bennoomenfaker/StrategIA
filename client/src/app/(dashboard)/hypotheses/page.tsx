"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HypothesesRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/intelligence/hypotheses");
  }, [router]);

  return null;
}
