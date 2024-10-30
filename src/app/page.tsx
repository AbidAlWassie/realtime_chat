import Link from "next/link";

export default function Home() {
  return (
    <div className="">
      <h2>Hello World</h2>
      <Link href={"api/auth/signin"}> Sign In</Link>
      <Link href={"room"}> Room</Link>
    </div>
  );
}
