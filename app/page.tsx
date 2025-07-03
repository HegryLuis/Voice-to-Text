"use client";

import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <div className="container mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Voice SaaS</h1>
        <p className="mb-8">The easiest way to transcribe your audio files.</p>

        <div className="flex items-center justify-center gap-4">
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </Link>
            <UserButton />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-green-600 rounded hover:bg-green-700">
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </SignedOut>
        </div>
      </div>
    </main>
  );
}
