import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Rocket, BarChart3, Users, Link as LinkIcon, LayoutGrid, Sparkles, Briefcase, MoreHorizontal, Download, Cpu, Send, Inbox, Activity, Plug, Sprout, Target, Users2, Megaphone, Calendar } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white text-zinc-900 font-sans selection:bg-indigo-100">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
      `}} />

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 rounded-lg p-1.5 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M15 9l-6 6"/><path d="M9 9l6 6"/></svg>
            </div>
            <span className="font-bold text-2xl tracking-tight">Doodle</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
            <Link href="#" className="hover:text-zinc-900 transition-colors">Product</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Use Cases</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Resources</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Pricing</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Changelog</Link>
          </nav>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-5 py-5 font-semibold shadow-sm">
                Claim Free Access <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-28">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-sm text-indigo-600 font-medium mb-8">
                <span className="flex h-2 w-2 rounded-full bg-indigo-500"></span>
                100% Free for Early Users
              </div>
              
              <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
                Turn outreach <br/>into real <br/>
                <span className="text-indigo-600">opportunities.</span>
              </h1>
              
              <p className="text-lg text-zinc-600 mb-8 max-w-md leading-relaxed">
                Doodle is an AI-powered outbound engine that helps you find leads, write hyper-personalized messages, send at scale, and manage replies — all in one place.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10 max-w-md">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" /> Find & import leads
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" /> Generate personalized emails
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" /> Send with smart scheduling
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <CheckCircle2 className="h-5 w-5 text-indigo-600" /> Reply faster with AI
                </div>
              </div>

              <div className="relative inline-block">
                <Link href="/signup">
                  <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-8 h-14 text-base font-semibold group relative z-10">
                    Claim Your Free Early Access
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {/* Hand drawn arrow & text */}
                <div className="absolute -bottom-16 -right-16 md:-right-24 rotate-[-10deg]">
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" className="absolute -top-6 -left-6 -rotate-45">
                    <path d="M20 80 Q 50 20 80 20" />
                    <path d="M60 20 L 80 20 L 80 40" />
                  </svg>
                  <p className="font-handwriting text-xl text-zinc-500 leading-tight">No credit card.<br/>No limits (for now!)</p>
                </div>
              </div>
            </div>

            {/* Dashboard Mockup */}
            <div className="relative pt-10">
              <div className="absolute -top-6 right-10 rotate-6 z-20">
                  <p className="font-handwriting text-2xl text-indigo-600 leading-tight">More conversations.<br/>More opportunities.</p>
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" className="absolute -bottom-8 left-10 rotate-[120deg]">
                    <path d="M20 80 Q 50 20 80 20" />
                    <path d="M60 20 L 80 20 L 80 40" />
                  </svg>
              </div>
              <div className="rounded-2xl border border-zinc-200/60 bg-white/50 backdrop-blur-xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] p-4 relative z-10">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                {/* Fake UI */}
                <div className="flex gap-4">
                  <div className="w-48 space-y-4 pr-4 border-r border-zinc-100 hidden sm:block">
                     <div className="flex items-center gap-2 font-bold text-lg mb-6"><div className="bg-indigo-600 rounded p-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg></div>Doodle</div>
                     {['Home', 'Leads', 'Campaigns', 'Inbox', 'Analytics', 'Templates', 'Integrations'].map((i, idx) => (
                       <div key={idx} className={`text-sm font-medium flex items-center justify-between p-2 rounded-lg ${idx===0 ? 'text-indigo-600 bg-indigo-50' : 'text-zinc-500'}`}>
                         <span>{i}</span>
                         {idx===3 && <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">12</span>}
                       </div>
                     ))}
                  </div>
                  <div className="flex-1 bg-zinc-50 rounded-xl p-6">
                     <h3 className="text-xl font-bold mb-1">Good morning, Sahil 👋</h3>
                     <p className="text-sm text-zinc-500 mb-6">Here's what happening with your outreach today.</p>
                     
                     <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <p className="text-xs text-zinc-500 mb-1">Emails Sent</p>
                          <div className="flex items-end justify-between">
                             <p className="text-2xl font-bold">2,840</p>
                             <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+12%</span>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <p className="text-xs text-zinc-500 mb-1">Open Rate</p>
                          <div className="flex items-end justify-between">
                             <p className="text-2xl font-bold">62%</p>
                             <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+8%</span>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-zinc-100 shadow-sm">
                          <p className="text-xs text-zinc-500 mb-1">Reply Rate</p>
                          <div className="flex items-end justify-between">
                             <p className="text-2xl font-bold">18%</p>
                             <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">+6%</span>
                          </div>
                        </div>
                     </div>

                     <div className="h-48 bg-white border border-zinc-100 rounded-xl shadow-sm p-4 relative overflow-hidden">
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-indigo-50 to-transparent"></div>
                        <svg className="absolute bottom-4 left-4 right-4 w-[calc(100%-2rem)] h-24" preserveAspectRatio="none" viewBox="0 0 100 100" stroke="blue">
                           <path d="M0 80 Q 20 70 40 50 T 70 30 T 100 10" fill="none" stroke="#4f46e5" strokeWidth="3" />
                           <path d="M0 90 Q 20 85 40 70 T 70 60 T 100 40" fill="none" stroke="#93c5fd" strokeWidth="2" />
                        </svg>
                     </div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/2 right-1/2 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-400/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
            </div>

          </div>
        </section>

        {/* Used By Logos */}
        <section className="py-12 border-y border-zinc-100 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto px-6">
            <p className="text-center text-xs font-semibold tracking-widest text-zinc-400 uppercase mb-8">Used by founders, sales teams, recruiters, and operators</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60">
              {[
                { icon: Rocket, label: "Startups" },
                { icon: BarChart3, label: "Sales Teams" },
                { icon: Users, label: "Recruiters" },
                { icon: LinkIcon, label: "Partnerships" },
                { icon: LayoutGrid, label: "Agencies" },
                { icon: Briefcase, label: "Business Development" },
                { icon: MoreHorizontal, label: "And more" }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <item.icon className="h-6 w-6 text-zinc-800" />
                  <span className="text-sm font-medium text-zinc-800">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Outreach Simplified */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Outreach, simplified.</h2>
              <p className="text-lg text-zinc-500 max-w-2xl">Everything you need to go from a list of names to real conversations — without the busywork.</p>
            </div>
            <Link href="#" className="hidden md:flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
              See all features <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { icon: Download, color: "text-blue-500", bg: "bg-blue-50", title: "Import Leads", desc: "Upload CSVs or connect your sources. We parse and enrich automatically." },
               { icon: Cpu, color: "text-purple-500", bg: "bg-purple-50", title: "AI-Powered Writing", desc: "Generate personalized outreach at scale using our multi-provider AI engine." },
               { icon: Send, color: "text-green-500", bg: "bg-green-50", title: "Smart Sending", desc: "Auto-schedule and drip emails to protect your domain reputation." },
               { icon: Inbox, color: "text-amber-500", bg: "bg-amber-50", title: "Unified Inbox", desc: "Manage all replies in one place with AI-suggested responses." },
               { icon: Activity, color: "text-rose-500", bg: "bg-rose-50", title: "Analytics & Tracking", desc: "Track opens, clicks, replies and measure what's working." },
               { icon: Plug, color: "text-indigo-500", bg: "bg-indigo-50", title: "Integrations", desc: "Connect your email accounts and favorite tools in minutes." }
             ].map((f, i) => (
                <div key={i} className="p-8 rounded-2xl border border-zinc-100 bg-white shadow-sm hover:shadow-md transition-shadow group">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-6`}>
                    <f.icon className={`h-6 w-6 ${f.color}`} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-zinc-900">{f.title}</h3>
                  <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
                </div>
             ))}
          </div>
        </section>

        {/* Built for how you work */}
        <section className="py-24 bg-zinc-50 border-y border-zinc-100">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16 relative">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Built for how you work</h2>
              <p className="text-lg text-zinc-500 max-w-2xl mx-auto">
                Whether you're reaching out to investors, customers, partners, talent or anyone else — Doodle helps you start better conversations, faster.
              </p>
              
              <div className="absolute top-0 left-0 md:left-32 rotate-[-15deg] hidden md:block">
                  <p className="font-handwriting text-2xl text-zinc-500 leading-tight">For real people<br/>doing real work.</p>
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" className="absolute -bottom-6 left-6 rotate-[70deg]">
                    <path d="M20 80 Q 50 20 80 20" />
                    <path d="M60 20 L 80 20 L 80 40" />
                  </svg>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
               {[
                 { icon: Sprout, color: "text-emerald-600", bg: "bg-emerald-50", title: "Investor Outreach", desc: "Get in front of the right investors." },
                 { icon: Target, color: "text-rose-600", bg: "bg-rose-50", title: "Sales Prospecting", desc: "Find and close more customers." },
                 { icon: LinkIcon, color: "text-blue-600", bg: "bg-blue-50", title: "Partnerships", desc: "Start strategic conversations." },
                 { icon: Users2, color: "text-indigo-600", bg: "bg-indigo-50", title: "Recruiting", desc: "Reach and engage top talent." },
                 { icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50", title: "PR & Media", desc: "Get noticed by the right people." },
                 { icon: Calendar, color: "text-purple-600", bg: "bg-purple-50", title: "Community & Events", desc: "Invite, follow up and grow." }
               ].map((f, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-white border border-zinc-100 shadow-sm flex items-start gap-5">
                    <div className={`w-12 h-12 shrink-0 rounded-xl ${f.bg} flex items-center justify-center`}>
                      <f.icon className={`h-6 w-6 ${f.color}`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 text-zinc-900">{f.title}</h3>
                      <p className="text-zinc-500 text-sm">{f.desc}</p>
                    </div>
                  </div>
               ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2 tracking-tight">Trusted by early users.</h2>
              <p className="text-zinc-500">Real feedback from people using Doodle in their daily work.</p>
            </div>
            <Link href="#" className="hidden md:flex items-center text-indigo-600 font-semibold hover:text-indigo-700">
              Read more stories <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {[
               { quote: "Doodle saved me 10+ hours a week. The AI replies are actually good.", author: "Aarav S.", role: "Founder, SaaS Startup", bg: "bg-emerald-50", color: "text-emerald-600", icon: Sprout },
               { quote: "We booked 12 investor calls in our first month. Super easy to use.", author: "Neha P.", role: "Co-founder, Fintech", bg: "bg-blue-50", color: "text-blue-600", icon: Target },
               { quote: "Finally a tool that does outreach without feeling generic.", author: "Rohit K.", role: "Growth, D2C Brand", bg: "bg-purple-50", color: "text-purple-600", icon: Rocket }
             ].map((t, i) => (
                <div key={i} className="p-8 rounded-2xl border border-zinc-100 bg-white shadow-sm flex flex-col justify-between">
                  <div>
                    <div className={`w-10 h-10 rounded-lg ${t.bg} flex items-center justify-center mb-6`}>
                      <t.icon className={`h-5 w-5 ${t.color}`} />
                    </div>
                    <p className="text-zinc-700 font-medium leading-relaxed mb-8">"{t.quote}"</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
                    <div>
                      <p className="font-bold text-sm">{t.author}</p>
                      <p className="text-xs text-zinc-500">{t.role}</p>
                    </div>
                  </div>
                </div>
             ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="pb-24 pt-12 max-w-6xl mx-auto px-6 relative">
          <div className="rounded-3xl bg-gradient-to-b from-indigo-50 to-indigo-100/50 border border-indigo-100 p-12 md:p-20 text-center relative overflow-hidden shadow-sm">
            <div className="absolute inset-x-0 bottom-0 opacity-60 mix-blend-multiply flex justify-center w-full h-full overflow-hidden rounded-b-3xl pointer-events-none">
               <Image 
                  src="/mountains.jpg" 
                  alt="Mountains Background" 
                  width={1200} 
                  height={800} 
                  className="w-full h-full object-cover object-bottom scale-125 translate-y-24" 
               />
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 border border-white text-sm text-indigo-600 font-semibold mb-8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4" />
                100% Free for Early Users
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
                Be early. <span className="text-indigo-600">Build bigger.</span>
              </h2>
              <p className="text-lg md:text-xl text-zinc-600 mb-10 max-w-2xl mx-auto font-medium">
                Join founders, operators and teams already using Doodle to create opportunities.
              </p>
              
              <div className="relative inline-block">
                <Link href="/signup">
                  <Button size="lg" className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl px-8 h-14 text-base font-semibold relative z-10 shadow-lg">
                    Claim Your Free Early Access <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <p className="text-xs text-zinc-500 mt-4">No credit card required. No limits. Just progress.</p>
                
                <div className="absolute -right-20 md:-right-48 top-0 rotate-6 hidden md:block">
                  <p className="font-handwriting text-xl text-indigo-600 leading-tight text-left">Same tool.<br/>Bigger possibilities.</p>
                  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" className="absolute -bottom-8 left-10 rotate-[120deg]">
                    <path d="M20 80 Q 50 20 80 20" />
                    <path d="M60 20 L 80 20 L 80 40" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-zinc-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-600">
             <div className="flex items-center gap-2 text-zinc-900">
               <div className="bg-indigo-600 rounded p-1">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/></svg>
               </div>
               <span className="font-bold">Doodle</span>
             </div>
             <Link href="#" className="hover:text-zinc-900">Product</Link>
             <Link href="#" className="hover:text-zinc-900">Use Cases</Link>
             <Link href="#" className="hover:text-zinc-900">Resources</Link>
             <Link href="#" className="hover:text-zinc-900">Changelog</Link>
             <Link href="#" className="hover:text-zinc-900">Privacy</Link>
             <Link href="#" className="hover:text-zinc-900">Terms</Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-500 font-medium">
             <span>Built with ❤️ by a small team, for big opportunities.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
