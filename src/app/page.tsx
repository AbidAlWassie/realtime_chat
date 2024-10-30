// src/app/page.tsx

// import Link from "next/link";
import SessionProvider from "@/components/SessionProvider";
import UI from "./ui";

export default function Home() {
  return (
    <SessionProvider>
      <UI />
    </SessionProvider>
  );
}
