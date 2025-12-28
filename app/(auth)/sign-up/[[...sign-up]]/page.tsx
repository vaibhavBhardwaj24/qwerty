"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="w-full max-w-md">
        {/* Custom Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-slate-300">
            Create your account and start your journey
          </p>
        </div>

        {/* Clerk Sign Up Component with Custom Styling */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
          <SignUp
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton:
                  "bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-200",
                socialButtonsBlockButtonText: "text-white font-medium",
                formButtonPrimary:
                  "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl",
                formFieldInput:
                  "bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-pink-500 focus:ring-pink-500 rounded-lg",
                formFieldLabel: "text-white font-medium",
                footerActionLink:
                  "text-pink-400 hover:text-pink-300 font-medium",
                footerActionText: "text-slate-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-pink-400 hover:text-pink-300",
                formHeaderTitle: "text-white text-2xl",
                formHeaderSubtitle: "text-slate-300",
                dividerLine: "bg-white/20",
                dividerText: "text-slate-300",
                otpCodeFieldInput:
                  "bg-white/10 border-white/20 text-white focus:border-pink-500",
              },
            }}
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{" "}
            <a
              href="/sign-in"
              className="text-pink-400 hover:text-pink-300 font-medium transition-colors"
            >
              Sign in instead
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
