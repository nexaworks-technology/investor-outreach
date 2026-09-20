import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Sequence } from "remotion";
import { Sparkles, Bot, Send } from "lucide-react";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animation for the hero title
  const titleProgress = spring({ frame, fps, config: { damping: 12 } });
  const titleY = interpolate(titleProgress, [0, 1], [100, 0]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Scene 2: AI writing an email
  const aiProgress = spring({ frame: frame - 90, fps, config: { damping: 12 } });
  
  return (
    <AbsoluteFill className="bg-white flex items-center justify-center font-sans">
      
      <Sequence from={0} durationInFrames={120}>
        <div 
          className="flex flex-col items-center justify-center"
          style={{ transform: `translateY(${titleY}px)`, opacity: titleOpacity }}
        >
          <div className="flex items-center gap-4 bg-indigo-600 px-6 py-3 rounded-2xl mb-8">
            <Sparkles className="w-8 h-8 text-white" />
            <span className="text-white text-2xl font-bold tracking-widest uppercase">Doodle AI Engine</span>
          </div>
          <h1 className="text-8xl font-black text-center tracking-tight text-zinc-900 leading-tight">
            Outbound sales on <br/>
            <span className="text-indigo-600">absolute autopilot.</span>
          </h1>
        </div>
      </Sequence>

      <Sequence from={90}>
        <div 
          className="bg-zinc-50 border border-zinc-200 shadow-2xl rounded-3xl p-12 w-[1200px]"
          style={{ 
             opacity: interpolate(aiProgress, [0, 1], [0, 1]),
             transform: `scale(${interpolate(aiProgress, [0, 1], [0.8, 1])}) translateY(${interpolate(aiProgress, [0, 1], [100, 0])}px)`
          }}
        >
           <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-200">
             <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">JD</div>
                <div>
                   <h2 className="text-3xl font-bold">John Doe</h2>
                   <p className="text-xl text-zinc-500">CEO @ TechCorp</p>
                </div>
             </div>
             <div className="bg-green-100 text-green-600 px-6 py-2 rounded-full font-bold text-lg flex items-center gap-2">
                <Bot /> AI Reply Suggested
             </div>
           </div>
           
           <div className="bg-white border border-indigo-100 shadow-sm rounded-2xl p-8 mb-8 relative">
              <div className="absolute -top-4 -left-4 bg-indigo-600 text-white p-2 rounded-xl">
                 <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-2xl text-zinc-800 leading-relaxed font-medium">
                {frame > 120 ? "Hi John," : ""}
                <br/><br/>
                {frame > 130 ? "I noticed TechCorp just raised its Series B. Huge congratulations!" : ""}
                <br/><br/>
                {frame > 150 ? "I'm reaching out because we help high-growth SaaS companies automate their entire outbound sales pipeline. We've helped companies like yours increase reply rates by 40%." : ""}
                <br/><br/>
                {frame > 180 ? "Open to a quick 10-min chat next Tuesday?" : ""}
              </p>
           </div>
           
           <div className="flex justify-end" style={{ opacity: frame > 210 ? 1 : 0 }}>
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-xl font-bold flex items-center gap-3">
                 <Send /> Send AI Draft
              </button>
           </div>
        </div>
      </Sequence>

    </AbsoluteFill>
  );
};
