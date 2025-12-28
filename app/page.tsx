import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="text-center">
        {user ? (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome back, {user.firstName || user.username || "User"}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You&apos;re signed in as {user.emailAddresses[0]?.emailAddress}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Please log in
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be authenticated to access this application
            </p>
            <div className="flex gap-4 justify-center mt-6">
              <Link
                href="/sign-in"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
