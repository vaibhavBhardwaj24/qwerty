import { HomePage } from "@/components/homePage";
import { currentUser } from "@clerk/nextjs/server";
import LandingPage from "./landing/page";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black w-full">
      <div className="text-center w-full">
        {user ? <HomePage /> : <LandingPage />}
      </div>
    </div>
  );
}
