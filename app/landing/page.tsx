"use server";
import Link from "next/link";
import {
  ArrowRight,
  Zap,
  Users,
  Bell,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import "./landing.css";

export default async function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Qwerty</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-8">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white/90">
              Real-time collaboration made simple
            </span>
          </div>

          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Where Teams
            <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Create Together
            </span>
          </h1>

          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Experience seamless collaboration with real-time editing, smart
            mentions, and powerful task management. All in one beautiful
            workspace.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-lg px-8 py-6 rounded-xl shadow-lg shadow-indigo-500/50"
              >
                Start Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-6 rounded-xl"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need to collaborate
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Powerful features designed to make teamwork effortless
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-6">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Real-Time Collaboration
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Work together seamlessly with live cursors, instant updates, and
              presence awareness. See who's online and what they're working on.
            </p>
          </Card>

          {/* Feature 2 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Smart Mentions
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Tag teammates, track mentions across workspaces, and never miss
              important updates. Stay connected with intelligent notifications.
            </p>
          </Card>

          {/* Feature 3 */}
          <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle2 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">
              Task Management
            </h3>
            <p className="text-slate-400 leading-relaxed">
              Transform ideas into action with built-in task tables, priorities,
              and assignees. Keep your team organized and productive.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-6 py-32">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-0 p-12 md:p-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to transform your workflow?
            </h2>
            <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
              Join thousands of teams already collaborating better with Qwerty
            </p>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-white text-indigo-600 hover:bg-slate-100 text-lg px-8 py-6 rounded-xl shadow-xl"
              >
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">Qwerty</span>
            </div>
            <p className="text-slate-400 text-sm">
              Made with ❤️ for teams that create together
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
