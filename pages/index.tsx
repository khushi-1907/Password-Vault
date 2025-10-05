// pages/index.tsx
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login"); // redirect to login
  }, [router]);

  return null; // or a loader if you want
}
