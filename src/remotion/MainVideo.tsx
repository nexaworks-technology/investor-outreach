import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { Sparkles, Bot, Send, BarChart3, Users, Mail, ArrowUpRight } from "lucide-react";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Intro Animations (0-120)
  const introProgress = spring({ frame, fps, config: { damping: 14 } });
  const introOut = spring({ frame: frame - 100, fps, config: { damping: 14 } });

  // 2. Dashboard Screens Animations (100-260)
  const dashIn = spring({ frame: frame - 100, fps, config: { damping: 12 } });
  const dashOut = spring({ frame: frame - 240, fps, config: { damping: 14 } });

  // 3. AI Feature Animations (240-440)
  const featIn = spring({ frame: frame - 240, fps, config: { damping: 12 } });
  const featOut = spring({ frame: frame - 420, fps, config: { damping: 14 } });

  // 4. Exit Animations (420-540)
  const exitIn = spring({ frame: frame - 420, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill className="bg-zinc-50 flex items-center justify-center font-sans overflow-hidden">
      
      {/* --- SCENE 1: INTRO --- */}
      <Sequence from={0} durationInFrames={120}>
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ 
            opacity: interpolate(introOut, [0, 1], [1, 0]),
            transform: `translateY(${interpolate(introProgress, [0, 1], [50, 0])}px) scale(${interpolate(introOut, [0, 1], [1, 1.1])})`
          }}
        >
          <div className="flex items-center gap-4 bg-indigo-600 px-8 py-4 rounded-3xl mb-10 shadow-xl shadow-indigo-200">
            <div className="bg-white rounded-full p-2"><Sparkles className="w-8 h-8 text-indigo-600" /></div>
            <span className="text-white text-3xl font-bold tracking-widest uppercase">Doodle AI</span>
          </div>
          <h1 className="text-8xl font-black text-center tracking-tight text-zinc-900 leading-tight">
            Outbound sales on <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">absolute autopilot.</span>
          </h1>
        </div>
      </Sequence>

      {/* --- SCENE 2: SCREENS (DASHBOARD) --- */}
      <Sequence from={100} durationInFrames={160}>
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
            opacity: interpolate(dashIn, [0, 1], [0, 1]) - interpolate(dashOut, [0, 1], [0, 1]),
            transform: `scale(${interpolate(dashIn, [0, 1], [0.8, 1]) + interpolate(dashOut, [0, 1], [0, 0.2])})`
          }}
        >
          <div className="bg-white border border-zinc-200 shadow-2xl rounded-[3rem] p-12 w-[1400px] h-[800px] flex flex-col">
            <div className="flex justify-between items-center mb-12">
               <h2 className="text-4xl font-bold text-zinc-800">Campaign Overview</h2>
               <div className="bg-green-100 text-green-700 px-6 py-3 rounded-full font-bold text-xl flex items-center gap-2">
                 Active <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse ml-2" />
               </div>
            </div>
            <div className="grid grid-cols-3 gap-8 mb-12">
               {/* Stat Card 1 */}
               <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl">
                 <div className="flex justify-between items-start mb-6">
                   <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><Users className="w-8 h-8" /></div>
                   <span className="text-green-500 font-bold text-xl flex items-center"><ArrowUpRight className="w-5 h-5"/> 12%</span>
                 </div>
                 <p className="text-zinc-500 text-xl font-medium mb-2">Total Leads</p>
                 <p className="text-6xl font-black text-zinc-900">14,205</p>
               </div>
               {/* Stat Card 2 */}
               <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-3xl">
                 <div className="flex justify-between items-start mb-6">
                   <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl"><Mail className="w-8 h-8" /></div>
                   <span className="text-green-500 font-bold text-xl flex items-center"><ArrowUpRight className="w-5 h-5"/> 8%</span>
                 </div>
                 <p className="text-zinc-500 text-xl font-medium mb-2">Emails Sent</p>
                 <p className="text-6xl font-black text-zinc-900">
                    {Math.floor(interpolate(frame, [110, 200], [0, 8402]))}
                 </p>
               </div>
               {/* Stat Card 3 */}
               <div className="bg-indigo-600 p-8 rounded-3xl text-white relative overflow-hidden">
                 <div className="absolute right-0 top-0 opacity-20"><BarChart3 className="w-48 h-48 -mr-10 -mt-10" /></div>
                 <div className="flex justify-between items-start mb-6 relative z-10">
                   <div className="p-4 bg-white/20 rounded-2xl"><Sparkles className="w-8 h-8" /></div>
                 </div>
                 <p className="text-indigo-200 text-xl font-medium mb-2 relative z-10">Meeting Booked Rate</p>
                 <p className="text-6xl font-black relative z-10">
                   {interpolate(frame, [140, 200], [0, 14.2]).toFixed(1)}%
                 </p>
               </div>
            </div>
            <div className="flex-1 bg-zinc-50 border border-zinc-100 rounded-3xl flex items-center justify-center">
               <div className="text-zinc-400 font-bold text-2xl flex items-center gap-4">
                 <BarChart3 className="w-10 h-10" /> Analytics Chart Loading...
               </div>
            </div>
          </div>
        </div>
      </Sequence>

      {/* --- SCENE 3: AI FEATURE (DRAFTING) --- */}
      <Sequence from={240} durationInFrames={200}>
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ 
             opacity: interpolate(featIn, [0, 1], [0, 1]) - interpolate(featOut, [0, 1], [0, 1]),
             transform: `scale(${interpolate(featIn, [0, 1], [0.8, 1])}) translateY(${interpolate(featOut, [0, 1], [0, -100])}px)`
          }}
        >
          <div className="bg-white border border-indigo-100 shadow-[0_0_100px_rgba(79,70,229,0.15)] rounded-[3rem] p-12 w-[1200px]">
             <div className="flex items-center justify-between mb-10 pb-10 border-b border-zinc-100">
               <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-black">JD</div>
                  <div>
                     <h2 className="text-4xl font-bold">John Doe</h2>
                     <p className="text-2xl text-zinc-500 font-medium">CEO @ TechCorp</p>
                  </div>
               </div>
               <div className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-bold text-xl flex items-center gap-3">
                  <Bot className="w-6 h-6" /> AI Auto-Drafted
               </div>
             </div>
             
             <div className="bg-zinc-50 border border-zinc-200 shadow-inner rounded-3xl p-10 mb-10 relative text-3xl text-zinc-800 leading-relaxed font-medium min-h-[300px]">
                <div className="absolute -top-6 -left-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl shadow-lg">
                   <Sparkles className="w-8 h-8" />
                </div>
                
                {frame > 270 && <span>Hi John,</span>}
                <br/><br/>
                {frame > 290 && <span>I noticed TechCorp just raised its Series B. Huge congratulations! 🎉</span>}
                <br/><br/>
                {frame > 310 && <span>We help high-growth SaaS companies automate their entire outbound sales pipeline. We've helped companies like yours increase reply rates by 40%.</span>}
                <br/><br/>
                {frame > 340 && <span className="font-bold text-indigo-600">Open to a quick 10-min chat next Tuesday?</span>}
             </div>
             
             <div className="flex justify-end" style={{ opacity: frame > 360 ? 1 : 0, transform: `scale(${spring({ frame: frame - 360, fps, config: { damping: 10 } })})` }}>
                <button className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:scale-105 text-white px-10 py-5 rounded-2xl text-2xl font-bold flex items-center gap-4 shadow-xl shadow-indigo-200">
                   <Send className="w-8 h-8" /> Approve & Send
                </button>
             </div>
          </div>
        </div>
      </Sequence>

      {/* --- SCENE 4: EXIT CTA --- */}
      <Sequence from={420} durationInFrames={120}>
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-950 text-white"
          style={{ opacity: interpolate(exitIn, [0, 1], [0, 1]) }}
        >
           <div 
             className="flex flex-col items-center"
             style={{ transform: `scale(${interpolate(exitIn, [0, 1], [0.5, 1])})` }}
           >
             <div className="flex items-center gap-4 mb-8">
               <div className="bg-white rounded-2xl p-3"><Sparkles className="w-12 h-12 text-indigo-600" /></div>
               <span className="text-5xl font-bold tracking-tight">Doodle</span>
             </div>
             <h2 className="text-8xl font-black mb-8">Be early. <span className="text-indigo-400">Build bigger.</span></h2>
             <div className="bg-white/10 border border-white/20 backdrop-blur-md px-10 py-5 rounded-full">
                <p className="text-3xl font-medium tracking-wide">doodle.com</p>
             </div>
           </div>
        </div>
      </Sequence>

    </AbsoluteFill>
  );
};
