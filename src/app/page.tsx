import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Zap, Shield, Mail, BarChart3, MessageSquare } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-50 overflow-hidden font-sans">
      
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight">Doodle</span>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-zinc-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-indigo-400 transition-colors">
              Sign In
            </Link>
            <Link href="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-32">
        {/* Hero Section */}
        <section className="relative max-w-7xl mx-auto px-6 pt-20 pb-32 text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 mb-8">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>Introducing Doodle AI Balancer 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
            Outbound sales on <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              absolute autopilot.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed">
            Doodle is the world's most advanced B2B outreach platform. Powered by an Omni-Provider AI Load Balancer, QStash delivery queues, and CAN-SPAM compliant drip pacing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 h-14 text-base font-semibold group">
                Start your free trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="rounded-full px-8 h-14 border-zinc-800 text-zinc-300 hover:bg-zinc-900 hover:text-white">
              Book a Demo
            </Button>
          </div>

          {/* Dashboard Preview Mockup */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-20" />
            <div className="relative rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-sm p-2 shadow-2xl">
              <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 aspect-video flex items-center justify-center">
                 <div className="text-center space-y-6">
                    <BarChart3 className="h-16 w-16 text-indigo-500 mx-auto opacity-50" />
                    <p className="text-zinc-500 font-medium">Interactive Dashboard Interface</p>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 border-t border-zinc-900 bg-black">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to close</h2>
              <p className="text-zinc-400">Enterprise-grade infrastructure built for startups.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6 text-yellow-400" />,
                  title: "Omni-Provider AI",
                  desc: "Automatically load-balances between Z.AI, Groq, and Gemini to ensure 99.9% uptime for AI generation without rate limits."
                },
                {
                  icon: <Mail className="h-6 w-6 text-indigo-400" />,
                  title: "Smart QStash Pacing",
                  desc: "Connect your Gmail/SMTP and we'll drip emails out automatically to protect your domain reputation."
                },
                {
                  icon: <MessageSquare className="h-6 w-6 text-green-400" />,
                  title: "1-Click AI Replies",
                  desc: "Chat natively in a WhatsApp-style interface with AI suggesting the perfect response to every inbound message."
                },
                {
                  icon: <Shield className="h-6 w-6 text-rose-400" />,
                  title: "CAN-SPAM Compliant",
                  desc: "Auto-appended unsubscribe links and immediate DB syncs to ensure you never email opted-out leads."
                },
                {
                  icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
                  title: "Open & Click Tracking",
                  desc: "Transparent 1x1 tracking pixels and redirect gateways to measure exactly who is reading your campaigns."
                },
                {
                  icon: <Sparkles className="h-6 w-6 text-purple-400" />,
                  title: "Approval Queues",
                  desc: "Never send an AI email blindly. Review and approve all AI-generated drafts before they hit the send queue."
                }
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-900 transition-colors">
                  <div className="mb-4 bg-black w-12 h-12 rounded-lg flex items-center justify-center border border-zinc-800">
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing / Early Access */}
        <section id="pricing" className="py-24 border-t border-zinc-900 bg-zinc-950">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-8 font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Early Access Program</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">100% Free for Early Users</h2>
            <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              We are currently in private beta. Join today and get complete, unrestricted access to the entire Doodle platform, Omni-Provider AI, and unlimited QStash pacing for zero cost.
            </p>
            
            <Link href="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-10 h-16 text-lg font-semibold shadow-lg shadow-indigo-500/25 group">
                Claim your free account
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-zinc-900 bg-black text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
             <Sparkles className="h-4 w-4 text-indigo-600" />
             <span className="font-semibold text-zinc-300">Doodle</span>
             <span>© 2026 NexaWorks. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-zinc-300">Twitter</Link>
            <Link href="#" className="hover:text-zinc-300">GitHub</Link>
            <Link href="#" className="hover:text-zinc-300">Terms</Link>
            <Link href="#" className="hover:text-zinc-300">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Check(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
