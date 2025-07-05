import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";

interface HomeComponentProps {
  isPremium: boolean;
}

export default function HomeComponent({ isPremium }: HomeComponentProps) {
  const background = isPremium
    ? "bg-gradient-to-br from-yellow-200 via-amber-300 to-orange-200"
    : "bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-200";

  const textClasses = isPremium ? "text-black" : "text-white";

  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white ${background}`}
    >
      <SignedIn>
        <div className="absolute top-6 right-6 z-10">
          {isPremium && (
            <div
              className="absolute -top-4.5 -left-2 transform -rotate-12"
              title="Premium Account"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 drop-shadow-md text-black"
              >
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              </svg>
            </div>
          )}
          <UserButton />
        </div>
      </SignedIn>

      <div className="container mx-auto text-center">
        <h1 className={`text-4xl font-bold mb-2 drop-shadow-lg ${textClasses}`}>
          Welcome to Voice SaaS
        </h1>
        <p className={`mb-4 drop-shadow-md ${textClasses}`}>
          The easiest way to transcribe your audio files.
        </p>

        <div className="flex items-center justify-center gap-x-4 md:gap-x-6">
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 rounded-lg text-lg font-semibold text-white
                hover:bg-blue-700 transition-colors duration-300 shadow-lg"
            >
              Go to Dashboard
            </Link>
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button
                type="button"
                className="
              min-w-[140px] text-center px-6 py-3 bg-green-600 rounded-lg text-lg font-semibold text-white
              cursor-pointer transition-all duration-300 shadow-lg
              hover:bg-green-700  hover:shadow-2xl
              "
              >
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="
                  min-w-[140px] text-center px-6 py-3 bg-indigo-600 rounded-lg text-lg font-semibold text-white
                  cursor-pointer transition-all duration-300 shadow-lg
                  hover:bg-indigo-700 hover:shadow-2xl"
              >
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
