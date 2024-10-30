import SessionProvider from "@/components/SessionProvider";
import Room from "./room";

export default async function EditPostPage() {
  return (
    <SessionProvider>
      <Room />
    </SessionProvider>
  );
}
