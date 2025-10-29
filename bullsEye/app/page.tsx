"use client";

import { ArrowRight, Target, Users, Shield, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const navigateToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md z-50 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                BullsEye
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <button
                onClick={() => scrollToSection("home")}
                className="text-slate-300 hover:text-indigo-400 font-medium transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="text-slate-300 hover:text-indigo-400 font-medium transition-colors"
              >
                About
              </button>
              <Button
                onClick={navigateToDashboard}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/30"
              >
                Let&apos;s Lock In
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Home Section */}
      <section id="home" className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Content */}
            <div className="space-y-8">
              <div className="inline-block px-4 py-2 bg-indigo-950 text-indigo-300 rounded-full text-sm font-semibold border border-indigo-800">
                Web3 Accountability Platform
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Hit Your Goals or
                <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Lose Your SOL
                </span>
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed">
                Lock SOL, set ambitious goals, get verified by the community,
                and claim rewards. Accountability powered by blockchain
                technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={navigateToDashboard}
                  size="lg"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 shadow-lg shadow-indigo-500/30"
                >
                  Let&apos;s Lock In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => scrollToSection("about")}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Learn More
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold text-indigo-400">500+</div>
                  <div className="text-sm text-slate-500">Goals Completed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">1.2K</div>
                  <div className="text-sm text-slate-500">Active Users</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-indigo-400">85%</div>
                  <div className="text-sm text-slate-500">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-1 animate-pulse-slow">
                <div className="w-full h-full rounded-2xl bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  {/* Animated background circles */}
                  <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl animate-float"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-600/20 rounded-full blur-2xl animate-float-delayed"></div>
                  </div>

                  {/* Rotating motivational text around the circle */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-64 h-64">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-rotate-text">
                        <span className="text-xs font-bold text-indigo-400 whitespace-nowrap">
                          NO EXCUSES
                        </span>
                      </div>
                      <div className="absolute top-1/4 right-0 translate-x-1/2 animate-rotate-text-delayed-1">
                        <span className="text-xs font-bold text-purple-400 whitespace-nowrap">
                          LOCK IN
                        </span>
                      </div>
                      <div className="absolute bottom-1/4 right-0 translate-x-1/2 animate-rotate-text-delayed-2">
                        <span className="text-xs font-bold text-pink-400 whitespace-nowrap">
                          GET IT DONE
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 animate-rotate-text-delayed-3">
                        <span className="text-xs font-bold text-green-400 whitespace-nowrap">
                          RESULTS &gt; EXCUSES
                        </span>
                      </div>
                      <div className="absolute bottom-1/4 left-0 -translate-x-1/2 animate-rotate-text-delayed-4">
                        <span className="text-xs font-bold text-blue-400 whitespace-nowrap">
                          HUSTLE HARD
                        </span>
                      </div>
                      <div className="absolute top-1/4 left-0 -translate-x-1/2 animate-rotate-text-delayed-5">
                        <span className="text-xs font-bold text-yellow-400 whitespace-nowrap">
                          STAY FOCUSED
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Central target design */}
                  <div className="relative z-10">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      {/* Concentric circles */}
                      <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full animate-ping-slow"></div>
                      <div className="absolute inset-4 border-4 border-purple-500/30 rounded-full animate-ping-slower"></div>
                      <div className="absolute inset-8 border-4 border-pink-500/30 rounded-full animate-ping-slowest"></div>

                      {/* Center target */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                          <Target className="w-12 h-12 text-white animate-spin-slow" />
                        </div>

                        {/* Orbiting dots */}
                        <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2">
                          <div className="absolute top-0 left-1/2 w-3 h-3 bg-green-400 rounded-full -translate-x-1/2 animate-orbit shadow-lg shadow-green-400/50"></div>
                          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-blue-400 rounded-full -translate-x-1/2 animate-orbit-reverse shadow-lg shadow-blue-400/50"></div>
                          <div className="absolute top-1/2 right-0 w-3 h-3 bg-yellow-400 rounded-full -translate-y-1/2 animate-orbit-delayed shadow-lg shadow-yellow-400/50"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Success metrics floating */}
                  <div className="absolute top-8 right-8 text-right animate-fade-in-up">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-xs text-slate-400">Goals Hit</div>
                  </div>
                  <div className="absolute bottom-8 left-8 text-left animate-fade-in-up-delayed">
                    <div className="text-2xl font-bold text-white">85%</div>
                    <div className="text-xs text-slate-400">Win Rate</div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-700 animate-float">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    Verified
                  </span>
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-slate-800 rounded-lg shadow-xl p-4 border border-slate-700 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm font-semibold text-slate-200">
                    +15 SOL Locked
                  </span>
                </div>
              </div>

              {/* New notification card */}
              <div className="absolute top-1/2 -left-8 bg-slate-800 rounded-lg shadow-xl p-3 border border-green-700 animate-slide-in-left">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-slate-200">
                    Goal Achieved!
                  </span>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes float {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-20px);
                }
              }
              @keyframes float-delayed {
                0%,
                100% {
                  transform: translateY(0px);
                }
                50% {
                  transform: translateY(-15px);
                }
              }
              @keyframes ping-slow {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                75%,
                100% {
                  transform: scale(1.2);
                  opacity: 0;
                }
              }
              @keyframes ping-slower {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                75%,
                100% {
                  transform: scale(1.3);
                  opacity: 0;
                }
              }
              @keyframes ping-slowest {
                0% {
                  transform: scale(1);
                  opacity: 1;
                }
                75%,
                100% {
                  transform: scale(1.4);
                  opacity: 0;
                }
              }
              @keyframes spin-slow {
                from {
                  transform: rotate(0deg);
                }
                to {
                  transform: rotate(360deg);
                }
              }
              @keyframes orbit {
                from {
                  transform: rotate(0deg) translateX(64px) rotate(0deg);
                }
                to {
                  transform: rotate(360deg) translateX(64px) rotate(-360deg);
                }
              }
              @keyframes orbit-reverse {
                from {
                  transform: rotate(0deg) translateX(64px) rotate(0deg);
                }
                to {
                  transform: rotate(-360deg) translateX(64px) rotate(360deg);
                }
              }
              @keyframes orbit-delayed {
                from {
                  transform: rotate(120deg) translateX(64px) rotate(-120deg);
                }
                to {
                  transform: rotate(480deg) translateX(64px) rotate(-480deg);
                }
              }
              @keyframes rotate-text {
                0% {
                  transform: rotate(0deg) translateY(-130px) rotate(0deg);
                  opacity: 0.4;
                }
                50% {
                  opacity: 1;
                }
                100% {
                  transform: rotate(360deg) translateY(-130px) rotate(-360deg);
                  opacity: 0.4;
                }
              }
              @keyframes fade-in-up {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes fade-in-up-delayed {
                from {
                  opacity: 0;
                  transform: translateY(20px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              @keyframes slide-in-left {
                from {
                  opacity: 0;
                  transform: translateX(-50px);
                }
                to {
                  opacity: 1;
                  transform: translateX(0);
                }
              }
              @keyframes pulse-slow {
                0%,
                100% {
                  opacity: 1;
                }
                50% {
                  opacity: 0.7;
                }
              }
              .animate-float {
                animation: float 3s ease-in-out infinite;
              }
              .animate-float-delayed {
                animation: float-delayed 3s ease-in-out infinite 1s;
              }
              .animate-ping-slow {
                animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
              }
              .animate-ping-slower {
                animation: ping-slower 3s cubic-bezier(0, 0, 0.2, 1) infinite 1s;
              }
              .animate-ping-slowest {
                animation: ping-slowest 3s cubic-bezier(0, 0, 0.2, 1) infinite
                  2s;
              }
              .animate-spin-slow {
                animation: spin-slow 8s linear infinite;
              }
              .animate-orbit {
                animation: orbit 8s linear infinite;
              }
              .animate-orbit-reverse {
                animation: orbit-reverse 6s linear infinite;
              }
              .animate-orbit-delayed {
                animation: orbit-delayed 10s linear infinite;
              }
              .animate-fade-in-up {
                animation: fade-in-up 1s ease-out;
              }
              .animate-fade-in-up-delayed {
                animation: fade-in-up-delayed 1s ease-out 0.5s backwards;
              }
              .animate-slide-in-left {
                animation: slide-in-left 0.8s ease-out 1.5s backwards;
              }
              .animate-pulse-slow {
                animation: pulse-slow 4s ease-in-out infinite;
              }
              .animate-rotate-text {
                animation: rotate-text 15s linear infinite;
              }
              .animate-rotate-text-delayed-1 {
                animation: rotate-text 15s linear infinite 2.5s;
              }
              .animate-rotate-text-delayed-2 {
                animation: rotate-text 15s linear infinite 5s;
              }
              .animate-rotate-text-delayed-3 {
                animation: rotate-text 15s linear infinite 7.5s;
              }
              .animate-rotate-text-delayed-4 {
                animation: rotate-text 15s linear infinite 10s;
              }
              .animate-rotate-text-delayed-5 {
                animation: rotate-text 15s linear infinite 12.5s;
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-900 relative overflow-hidden">
        {/* Background gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-950/50 border border-indigo-800 rounded-full text-indigo-300 text-sm font-semibold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              Powered by Solana
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              🎯 How Bullseye Works
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Decentralized accountability that makes your commitments
              trustless, transparent, and real
            </p>
          </div>

          {/* Interactive Flow */}
          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent transform -translate-y-1/2"></div>

            <div className="grid lg:grid-cols-5 gap-6 lg:gap-4">
              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full hover:border-indigo-500 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-slate-900">
                    1
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl mb-3">🎯</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Set Your Goal
                    </h3>
                    <p className="text-sm text-slate-400">
                      Define your target and lock SOL as your commitment stake.
                      The higher the stakes, the stronger your motivation.
                    </p>
                  </div>
                </div>
                {/* Arrow */}
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-indigo-500" />
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full hover:border-purple-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-slate-900">
                    2
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl mb-3">👥</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Add Verifiers
                    </h3>
                    <p className="text-sm text-slate-400">
                      Choose trusted friends or community members who will
                      verify your achievement.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-purple-500" />
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-slate-900">
                    3
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl mb-3">⛓️</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      On-Chain Tracking
                    </h3>
                    <p className="text-sm text-slate-400">
                      Your goal and deadline are recorded on Solana, ensuring
                      transparency and immutability.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-blue-500" />
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group">
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 h-full hover:border-green-500 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-1">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-slate-900">
                    4
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl mb-3">✅</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Verification Blink
                    </h3>
                    <p className="text-sm text-slate-400">
                      At deadline, verifiers confirm your success through a
                      Solana transaction.
                    </p>
                  </div>
                </div>
                <div className="hidden lg:block absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                  <ArrowRight className="w-6 h-6 text-green-500" />
                </div>
              </div>

              {/* Step 5 */}
              <div className="relative group">
                <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-600 rounded-2xl p-6 h-full hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute -top-4 left-6 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-4 border-slate-900">
                    5
                  </div>
                  <div className="mt-4">
                    <div className="text-4xl mb-3">🎁</div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      Claim Blink
                    </h3>
                    <p className="text-sm text-slate-400">
                      Success? Reclaim your SOL. Failed? Funds are forfeited.
                      Accountability is real.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 border border-slate-700 rounded-full">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="text-slate-300 text-sm">
                <span className="font-semibold text-white">Trustless.</span>{" "}
                <span className="font-semibold text-white">Transparent.</span>{" "}
                <span className="font-semibold text-white">Fun.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              About BullsEye
            </h2>
            <p className="text-lg text-slate-400">
              Built by goal-setters, for goal-achievers
            </p>
          </div>

          {/* Mission */}
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 mb-8 border border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
            <p className="text-slate-400 leading-relaxed">
              We believe in the power of accountability. BullsEye combines
              blockchain technology with human psychology to create a platform
              where your commitments have real consequences. By putting your
              money where your goals are, you&apos;re not just setting
              intentions—you&apos;re making binding commitments that push you to
              succeed.
            </p>
          </div>

          {/* Team */}
          <div className="bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-800">
            <h3 className="text-2xl font-bold text-white mb-6">The Team</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl text-white font-bold">
                  KS
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">
                    Kaustubh Shivarkar
                  </h4>
                  <p className="text-indigo-400 text-sm mb-2">Founder & CEO</p>
                  <p className="text-slate-400">
                    Learning blockchain technology. Built BullsEye after
                    personally struggling with goal completion.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
