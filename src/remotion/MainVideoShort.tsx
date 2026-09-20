import { Img,
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
  Easing,
} from "remotion";
import {
  Sparkles,
  Bot,
  Send,
  BarChart3,
  Users,
  Mail,
  ArrowUpRight,
  Upload,
  Shield,
  Clock,
  CheckCircle2,
  Zap,
  Target,
  TrendingUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════
   PREMIUM VISUAL COMPONENTS
   ═══════════════════════════════════════════════════════ */

/** Animated dot grid background */
const DotGrid: React.FC<{ color?: string; frame: number; speed?: number }> = ({
  color = "rgba(99,102,241,0.12)",
  frame,
  speed = 0.3,
}) => {
  const offset = frame * speed;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" style={{ transform: `translate(${-offset % 40}px, ${-offset % 40}px)` }}>
        <defs>
          <pattern id={`dots-${color}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill={color} />
          </pattern>
        </defs>
        <rect width="200%" height="200%" fill={`url(#dots-${color})`} />
      </svg>
    </div>
  );
};

/** Floating gradient orbs for depth */
const GradientOrb: React.FC<{
  x: number; y: number; size: number; color1: string; color2: string;
  frame: number; speed?: number; delay?: number;
}> = ({ x, y, size, color1, color2, frame, speed = 1, delay = 0 }) => {
  const floatY = Math.sin((frame + delay) * 0.02 * speed) * 30;
  const floatX = Math.cos((frame + delay) * 0.015 * speed) * 20;
  const pulse = 1 + Math.sin((frame + delay) * 0.03) * 0.08;
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color1}, ${color2})`,
        filter: "blur(60px)",
        opacity: 0.6,
        transform: `translate(${floatX}px, ${floatY}px) scale(${pulse})`,
      }}
    />
  );
};

/** Glass card with frosted effect */
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  glow?: string;
}> = ({ children, className = "", style, glow }) => (
  <div
    className={`relative rounded-[2rem] border border-white/20 overflow-hidden ${className}`}
    style={{
      background: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(40px)",
      boxShadow: glow
        ? `0 0 80px ${glow}, 0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)`
        : "0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.1)",
      ...style,
    }}
  >
    {children}
  </div>
);

/** Animated gradient border card */
const GradientBorderCard: React.FC<{
  children: React.ReactNode;
  frame?: number;
  className?: string;
  containerClassName?: string;
}> = ({ children, frame = 0, className = "", containerClassName = "" }) => {
  const angle = frame * 2;
  return (
    <div className={`relative rounded-[2rem] p-[2px] ${containerClassName}`}>
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background: `conic-gradient(from ${angle}deg, #6366f1, #a855f7, #ec4899, #6366f1)`,
          opacity: 0.8,
        }}
      />
      <div className={`relative bg-zinc-950 rounded-[30px] overflow-hidden w-full h-full ${className}`}>
        {children}
      </div>
    </div>
  );
};

/** Typing cursor */
const Cursor: React.FC<{ frame: number; visible?: boolean }> = ({ frame, visible = true }) => {
  if (!visible) return null;
  const blink = Math.floor(frame / 15) % 2 === 0;
  return (
    <span
      className="inline-block w-[3px] h-[1.1em] bg-indigo-400 ml-1 align-middle"
      style={{ opacity: blink ? 1 : 0 }}
    />
  );
};

/** Circular progress ring */
const ProgressRing: React.FC<{
  progress: number; size: number; strokeWidth: number;
  color: string; bgColor?: string;
}> = ({ progress, size, strokeWidth, color, bgColor = "rgba(255,255,255,0.1)" }) => {
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={bgColor} strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
        strokeWidth={strokeWidth} strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
};

/** Scene wrapper with clean transitions (no blur to avoid glitching) */
const Scene: React.FC<{
  frame: number; fps: number; from: number; dur: number;
  bg?: string; children: React.ReactNode;
}> = ({ frame, fps, from, dur, bg, children }) => {
  const localFrame = frame - from;
  // Smooth fade in over first 10 frames
  const fadeIn = interpolate(localFrame, [0, 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // Smooth fade out over last 8 frames
  const fadeOut = interpolate(localFrame, [dur - 8, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = fadeIn * fadeOut;

  return (
    <AbsoluteFill className={bg || "bg-zinc-950"} style={{ opacity }}>
      {children}
    </AbsoluteFill>
  );
};

/** Staggered word animation with glow */
const GlowText: React.FC<{
  text: string; frame: number; fps: number; startFrame: number;
  className?: string; highlightWords?: string[];
  glowColor?: string; wordDelay?: number;
}> = ({ text, frame, fps, startFrame, className = "", highlightWords = [], glowColor = "rgba(99,102,241,0.5)", wordDelay = 2 }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center gap-x-5 ${className}`}>
      {words.map((word, i) => {
        const wf = startFrame + i * wordDelay;
        const p = spring({ frame: frame - wf, fps, config: { damping: 12, stiffness: 200 } });
        const isHL = highlightWords.some((hw) => word.toLowerCase().includes(hw.toLowerCase()));
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.8, 1])})`,
              display: "inline-block",
              textShadow: isHL ? `0 0 40px ${glowColor}, 0 0 80px ${glowColor}` : "none",
            }}
            className={isHL ? "text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400" : ""}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   MAIN VIDEO
   ═══════════════════════════════════════════════════════ */

export const MainVideoShort: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-zinc-950 font-sans overflow-hidden text-white">

      {/* ═══ SCENE 1: HOOK (0–136) ═══ */}
      <Sequence from={0} durationInFrames={136}>
        <Audio src={staticFile("audio2/s01.m4a")} />
        <Scene frame={frame} fps={fps} from={0} dur={136}>
          <DotGrid frame={frame} color="rgba(239,68,68,0.08)" speed={0.5} />
          <GradientOrb x={20} y={30} size={400} color1="rgba(239,68,68,0.2)" color2="transparent" frame={frame} />
          <GradientOrb x={80} y={70} size={500} color1="rgba(168,85,247,0.15)" color2="transparent" frame={frame} delay={20} />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <GlowText
              text="Still doing outbound manually?"
              frame={frame} fps={fps} startFrame={5}
              className="text-6xl font-black text-white tracking-tight leading-none mb-16"
              highlightWords={["manually?"]}
              glowColor="rgba(239,68,68,0.5)"
            />

            {/* Tool switching visual */}
            <div className="flex items-center justify-center gap-8 relative mt-10">
              {[
                { icon: BarChart3, label: "Spreadsheet", color: "from-green-500 to-emerald-600", delay: 30 },
                { icon: ArrowUpRight, label: "Switch", isArrow: true, delay: 40 },
                { icon: Bot, label: "AI Tool", color: "from-purple-500 to-fuchsia-600", delay: 50 },
                { icon: ArrowUpRight, label: "Switch", isArrow: true, delay: 60 },
                { icon: Mail, label: "Gmail", color: "from-red-500 to-rose-600", delay: 70 },
              ].map((item, i) => {
                const p = spring({ frame: frame - item.delay, fps, config: { damping: 12 } });
                
                if (item.isArrow) {
                  return (
                    <div key={i} style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `scale(${interpolate(p, [0, 1], [0, 1])})` }}>
                      <ArrowUpRight className="w-8 h-8 text-zinc-500" />
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)` }}>
                    <GlassCard className="p-6 flex flex-col items-center justify-center w-32 h-32">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-semibold text-zinc-300">{item.label}</span>
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 2: INTRO (136–232) ═══ */}
      <Sequence from={136} durationInFrames={96}>
        <Audio src={staticFile("audio2/s02.m4a")} />
        <Scene frame={frame} fps={fps} from={136} dur={96}>
          <DotGrid frame={frame} color="rgba(99,102,241,0.08)" speed={0.5} />
          <GradientOrb x={50} y={50} size={600} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          
          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const p = spring({ frame: frame - 136, fps, config: { damping: 14 } });
              return (
                <div style={{ transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }} className="flex flex-col items-center">
                  <div className="flex items-center gap-4 mb-8">
                     <Img src={staticFile("logo.jpg")} className="w-12 h-12 rounded-xl object-cover shadow-[0_0_30px_rgba(99,102,241,0.4)]" />
                     <span className="text-4xl font-bold tracking-tight">Doodle</span>
                  </div>
                  
                  {/* Mock Dashboard */}
                  <GlassCard className="w-[800px] h-[450px] p-6 flex flex-col" glow="rgba(99,102,241,0.15)">
                    <div className="w-full h-8 border-b border-white/10 mb-6 flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500/50" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                      <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="flex gap-6 h-full text-sm">
                      {/* Sidebar */}
                      <div className="w-48 space-y-2">
                        <div className="px-3 py-2 bg-indigo-500/20 text-indigo-300 rounded-lg font-medium flex items-center gap-2"><Target className="w-4 h-4" /> Campaigns</div>
                        <div className="px-3 py-2 text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-2"><Users className="w-4 h-4" /> Leads</div>
                        <div className="px-3 py-2 text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-2"><Mail className="w-4 h-4" /> Inbox</div>
                        <div className="px-3 py-2 text-zinc-400 hover:text-zinc-200 font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analytics</div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="flex-1 space-y-6">
                        {/* Stats Row */}
                        <div className="flex gap-4">
                          <div className="h-24 flex-1 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 rounded-xl p-4 flex flex-col justify-center">
                            <span className="text-zinc-400 text-xs font-semibold mb-1">Emails Sent</span>
                            <span className="text-2xl font-bold text-white">1,240</span>
                          </div>
                          <div className="h-24 flex-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 rounded-xl p-4 flex flex-col justify-center">
                            <span className="text-zinc-400 text-xs font-semibold mb-1">Open Rate</span>
                            <span className="text-2xl font-bold text-white">48.2%</span>
                          </div>
                          <div className="h-24 flex-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-white/10 rounded-xl p-4 flex flex-col justify-center">
                            <span className="text-zinc-400 text-xs font-semibold mb-1">Replies</span>
                            <span className="text-2xl font-bold text-emerald-400">112</span>
                          </div>
                        </div>
                        
                        {/* Data Table */}
                        <div className="h-48 w-full bg-white/5 rounded-xl border border-white/5 p-4">
                          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-4 pb-2 border-b border-white/5">
                            <span className="w-1/3">LEAD NAME</span>
                            <span className="w-1/3">COMPANY</span>
                            <span className="w-1/3">STATUS</span>
                          </div>
                          <div className="space-y-3">
                            {[
                              { name: "Sarah Jenkins", company: "Acme Corp", status: "Replied", color: "text-emerald-400", bg: "bg-emerald-400/10" },
                              { name: "Mike Chen", company: "TechFlow", status: "Sent", color: "text-zinc-300", bg: "bg-white/10" },
                              { name: "Alex Rivera", company: "Global AI", status: "Opened", color: "text-purple-400", bg: "bg-purple-400/10" },
                            ].map((row, i) => (
                              <div key={i} className="flex items-center justify-between text-sm">
                                <span className="w-1/3 text-zinc-200">{row.name}</span>
                                <span className="w-1/3 text-zinc-400">{row.company}</span>
                                <span className="w-1/3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${row.color} ${row.bg}`}>{row.status}</span>
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 3: DEMO (232–395) ═══ */}
      <Sequence from={232} durationInFrames={163}>
        <Audio src={staticFile("audio2/s03.m4a")} />
        <Scene frame={frame} fps={fps} from={232} dur={163}>
          <DotGrid frame={frame} color="rgba(99,102,241,0.08)" speed={0.4} />
          
          <div className="absolute inset-0 flex items-center justify-center gap-12">
            {/* Step 1: Import */}
            {(() => {
              const p = spring({ frame: frame - 240, fps, config: { damping: 12 } });
              return (
                <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}>
                  <GradientBorderCard containerClassName="w-64" className="p-8 flex flex-col items-center text-center">
                    <Upload className="w-12 h-12 text-indigo-400 mb-4" />
                    <h3 className="font-bold text-xl mb-2">Import Leads</h3>
                    <p className="text-zinc-400 text-sm">Upload your CSV</p>
                  </GradientBorderCard>
                </div>
              );
            })()}

            <ArrowUpRight className="w-10 h-10 text-zinc-600" style={{ opacity: spring({ frame: frame - 270, fps }) }} />

            {/* Step 2: AI Personalize */}
            {(() => {
              const p = spring({ frame: frame - 280, fps, config: { damping: 12 } });
              return (
                <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}>
                  <GradientBorderCard containerClassName="w-64" className="p-8 flex flex-col items-center text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mb-4" />
                    <h3 className="font-bold text-xl mb-2">AI Personalize</h3>
                    <p className="text-zinc-400 text-sm">Craft perfect emails</p>
                  </GradientBorderCard>
                </div>
              );
            })()}

            <ArrowUpRight className="w-10 h-10 text-zinc-600" style={{ opacity: spring({ frame: frame - 320, fps }) }} />

            {/* Step 3: Launch */}
            {(() => {
              const p = spring({ frame: frame - 330, fps, config: { damping: 12 } });
              return (
                <div style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)` }}>
                  <GradientBorderCard containerClassName="w-64" className="p-8 flex flex-col items-center text-center">
                    <Send className="w-12 h-12 text-emerald-400 mb-4" />
                    <h3 className="font-bold text-xl mb-2">Launch</h3>
                    <p className="text-zinc-400 text-sm">Send campaign</p>
                  </GradientBorderCard>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 4: REPLY (395–539) ═══ */}
      <Sequence from={395} durationInFrames={144}>
        <Audio src={staticFile("audio2/s04.m4a")} />
        <Scene frame={frame} fps={fps} from={395} dur={144}>
          <GradientOrb x={30} y={30} size={600} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          <GradientOrb x={70} y={70} size={500} color1="rgba(236,72,153,0.15)" color2="transparent" frame={frame} delay={50} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* Incoming Message */}
            {(() => {
              const p = spring({ frame: frame - 400, fps, config: { damping: 14 } });
              return (
                <div className="w-[600px] mb-6" style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)` }}>
                  <GlassCard className="p-6 border-l-4 border-l-indigo-500">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold text-sm">JD</div>
                      <span className="font-semibold text-zinc-200">John Doe</span>
                      <span className="text-xs text-zinc-500">Just now</span>
                    </div>
                    <p className="text-xl text-white">This looks interesting. Can you send the deck?</p>
                  </GlassCard>
                </div>
              );
            })()}

            {/* AI Reply Button & Draft */}
            {(() => {
              const pBtn = spring({ frame: frame - 440, fps, config: { damping: 12 } });
              // Simulate click at frame 470
              const click = spring({ frame: frame - 470, fps, config: { damping: 10, stiffness: 200 } });
              const scale = interpolate(click, [0, 0.5, 1], [1, 0.95, 1]);
              
              const pDraft = spring({ frame: frame - 480, fps, config: { damping: 14 } });

              return (
                <div className="w-[600px] flex flex-col items-end" style={{ opacity: interpolate(pBtn, [0, 1], [0, 1]) }}>
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] mb-6"
                    style={{ transform: `scale(${scale})` }}
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                    <span>AI Reply</span>
                  </div>

                  {/* Draft appears after click */}
                  <div className="w-[500px]" style={{ opacity: interpolate(pDraft, [0, 1], [0, 1]), transform: `translateY(${interpolate(pDraft, [0, 1], [20, 0])}px)` }}>
                    <GradientBorderCard containerClassName="w-full" className="p-6 border-l-4 border-l-purple-500">
                      <p className="text-lg text-zinc-300 leading-relaxed">
                        Hi John, absolutely. I've attached our deck below. Let me know if you have any questions!<Cursor blink={true} />
                      </p>
                    </GradientBorderCard>
                  </div>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 5: PAYOFF (539–648) ═══ */}
      <Sequence from={539} durationInFrames={109}>
        <Audio src={staticFile("audio2/s05.m4a")} />
        <Scene frame={frame} fps={fps} from={539} dur={109}>
          <DotGrid frame={frame} color="rgba(52,211,153,0.08)" speed={0.5} />
          <GradientOrb x={50} y={50} size={800} color1="rgba(52,211,153,0.15)" color2="transparent" frame={frame} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="flex gap-4 mb-6">
              {[
                { text: "Leads.", delay: 550 },
                { text: "Outreach.", delay: 565 },
                { text: "Replies.", delay: 580 },
              ].map((item, i) => {
                const p = spring({ frame: frame - item.delay, fps, config: { damping: 12 } });
                return (
                  <span 
                    key={i} 
                    className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 tracking-tight"
                    style={{ 
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`
                    }}
                  >
                    {item.text}
                  </span>
                );
              })}
            </div>
            
            {(() => {
              const p = spring({ frame: frame - 600, fps, config: { damping: 12 } });
              return (
                <div 
                  className="bg-emerald-500 px-8 py-2 rounded-2xl"
                  style={{ 
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
                    boxShadow: "0 0 40px rgba(52,211,153,0.6)"
                  }}
                >
                  <span className="text-7xl font-black text-white tracking-tight">One place.</span>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 6: THE CATCH (648–784) ═══ */}
      <Sequence from={648} durationInFrames={136}>
        <Audio src={staticFile("audio2/s06.m4a")} />
        <Scene frame={frame} fps={fps} from={648} dur={136}>
          <GradientOrb x={20} y={80} size={500} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          <GradientOrb x={80} y={20} size={500} color1="rgba(168,85,247,0.2)" color2="transparent" frame={frame} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <GlowText
              text="100% FREE FOR EARLY BETA USERS"
              frame={frame} fps={fps} startFrame={655}
              className="text-[5.5rem] font-black text-white text-center max-w-5xl leading-tight tracking-tight"
              highlightWords={["FREE", "EARLY", "BETA"]}
              glowColor="rgba(168,85,247,0.5)"
            />
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 7: CTA (784–884) ═══ */}
      <Sequence from={784} durationInFrames={100}>
        <Audio src={staticFile("audio2/s07.m4a")} />
        <Scene frame={frame} fps={fps} from={784} dur={100}>
          <DotGrid frame={frame} color="rgba(99,102,241,0.06)" speed={0.3} />
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {(() => {
              const pLogo = spring({ frame: frame - 790, fps, config: { damping: 12 } });
              const pBtn = spring({ frame: frame - 810, fps, config: { damping: 12 } });
              const pTag = spring({ frame: frame - 830, fps, config: { damping: 12 } });
              
              return (
                <>
                  <div style={{ opacity: interpolate(pLogo, [0, 1], [0, 1]), transform: `translateY(${interpolate(pLogo, [0, 1], [-20, 0])}px)` }} className="flex flex-col items-center mb-16">
                    <div className="rounded-3xl overflow-hidden bg-black mb-6" style={{ width: 140, height: 140, boxShadow: "0 0 80px rgba(99,102,241,0.5)" }}>
                      <Img src={staticFile("logo.jpg")} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-6xl font-bold tracking-tight">Doodle</span>
                  </div>

                  <div 
                    style={{ opacity: interpolate(pBtn, [0, 1], [0, 1]), transform: `scale(${interpolate(pBtn, [0, 1], [0.8, 1])})` }}
                    className="bg-white text-black px-10 py-5 rounded-full font-bold text-3xl flex items-center gap-4 shadow-[0_0_40px_rgba(255,255,255,0.3)] mb-8"
                  >
                    <span>Claim Free Early Access</span>
                    <ArrowUpRight className="w-8 h-8" />
                  </div>
                  
                  <div style={{ opacity: interpolate(pTag, [0, 1], [0, 1]) }}>
                    <p className="text-2xl font-medium text-zinc-400">Turn outreach into real opportunities.</p>
                  </div>
                </>
              );
            })()}
          </div>
        </Scene>
      </Sequence>
      
    </AbsoluteFill>
  );
};
