import SessionProvider from "../components/SessionProvider";
import UI from "./ui";

export default function Home() {
  return (
    <SessionProvider>
      <UI />
    </SessionProvider>
  );
}

export type SearchParams = { [key: string]: string | string[] | undefined };

export interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<SearchParams>;
}
