"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Custom Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-300">Sign in to continue to your account</p>
        </div>

        {/* Clerk Sign In Component with Custom Styling */}
        <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-8 shadow-2xl border border-white/20">
          <SignIn
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
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl",
                formFieldInput:
                  "bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500 focus:ring-purple-500 rounded-lg",
                formFieldLabel: "text-white font-medium",
                footerActionLink:
                  "text-purple-400 hover:text-purple-300 font-medium",
                footerActionText: "text-slate-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton:
                  "text-purple-400 hover:text-purple-300",
                formHeaderTitle: "text-white text-2xl",
                formHeaderSubtitle: "text-slate-300",
                dividerLine: "bg-white/20",
                dividerText: "text-slate-300",
                otpCodeFieldInput:
                  "bg-white/10 border-white/20 text-white focus:border-purple-500",
              },
            }}
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
          />
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
            >
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
