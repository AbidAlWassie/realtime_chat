import SessionProvider from "@/components/SessionProvider";
import Chat from "./chat";

export default async function EditPostPage() {
  return (
    <SessionProvider>
      <Chat />
    </SessionProvider>
  );
}
