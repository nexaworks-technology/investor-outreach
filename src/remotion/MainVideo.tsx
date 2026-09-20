import {
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
  frame: number;
  className?: string;
}> = ({ children, frame, className = "" }) => {
  const angle = frame * 2;
  return (
    <div className={`relative rounded-[2rem] p-[2px] ${className}`}>
      <div
        className="absolute inset-0 rounded-[2rem]"
        style={{
          background: `conic-gradient(from ${angle}deg, #6366f1, #a855f7, #ec4899, #6366f1)`,
          opacity: 0.8,
        }}
      />
      <div className="relative bg-zinc-950 rounded-[2rem] overflow-hidden">
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

/** Scene wrapper with premium transitions */
const Scene: React.FC<{
  frame: number; fps: number; from: number; dur: number;
  bg?: string; children: React.ReactNode;
}> = ({ frame, fps, from, dur, bg, children }) => {
  const localFrame = frame - from;
  const inP = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const outP = spring({ frame: localFrame - (dur - 12), fps, config: { damping: 14 } });
  const opacity = Math.max(0, interpolate(inP, [0, 1], [0, 1]) - interpolate(outP, [0, 1], [0, 1]));
  const scale = interpolate(inP, [0, 1], [1.05, 1]);
  const blur = interpolate(inP, [0, 1], [8, 0]);

  return (
    <AbsoluteFill
      className={bg || ""}
      style={{
        opacity,
        transform: `scale(${scale})`,
        filter: `blur(${blur}px)`,
      }}
    >
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
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-zinc-950 font-sans overflow-hidden">

      {/* ═══ SCENE 1: HOOK ═══ (0–52) */}
      <Sequence from={0} durationInFrames={52}>
        <Audio src={staticFile("audio/s01.m4a")} />
        <Scene frame={frame} fps={fps} from={0} dur={52} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(99,102,241,0.08)" speed={0.5} />
          <GradientOrb x={20} y={30} size={400} color1="rgba(99,102,241,0.3)" color2="transparent" frame={frame} />
          <GradientOrb x={70} y={60} size={300} color1="rgba(168,85,247,0.25)" color2="transparent" frame={frame} delay={50} />

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {/* "100% Free" badge at top */}
            {(() => {
              const p = spring({ frame, fps, config: { damping: 14 } });
              return (
                <div
                  className="mb-10"
                  style={{ opacity: interpolate(p, [0, 1], [0, 1]), transform: `translateY(${interpolate(p, [0, 1], [-30, 0])}px)` }}
                >
                  <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 px-8 py-3 rounded-full flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <span className="text-indigo-300 text-xl font-semibold tracking-wide">100% Free — No Credit Card</span>
                  </div>
                </div>
              );
            })()}

            <GlowText
              text="Your outbound is broken."
              frame={frame} fps={fps} startFrame={5}
              className="text-[6.5rem] font-black text-white tracking-tight leading-none"
              highlightWords={["broken."]}
              glowColor="rgba(239,68,68,0.5)"
            />
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 2: PAIN POINTS ═══ (52–236) */}
      <Sequence from={52} durationInFrames={184}>
        <Audio src={staticFile("audio/s02.m4a")} />
        <Scene frame={frame} fps={fps} from={52} dur={184} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(239,68,68,0.06)" speed={0.3} />
          <GradientOrb x={80} y={20} size={500} color1="rgba(239,68,68,0.15)" color2="transparent" frame={frame} />
          <GradientOrb x={10} y={70} size={350} color1="rgba(239,68,68,0.1)" color2="transparent" frame={frame} delay={30} />

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-10">
              {[
                { icon: <Users className="w-10 h-10" />, text: "Researching leads", delay: 8 },
                { icon: <Mail className="w-10 h-10" />, text: "Writing emails", delay: 40 },
                { icon: <Clock className="w-10 h-10" />, text: "Following up", delay: 72 },
              ].map((item, i) => {
                const lf = frame - 52;
                const p = spring({ frame: lf - item.delay, fps, config: { damping: 14 } });
                return (
                  <div
                    key={i}
                    className="flex items-center gap-8"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateX(${interpolate(p, [0, 1], [-80, 0])}px)`,
                      filter: `blur(${interpolate(p, [0, 1], [6, 0])}px)`,
                    }}
                  >
                    <GlassCard className="p-5" glow="rgba(239,68,68,0.15)">
                      <div className="text-red-400">{item.icon}</div>
                    </GlassCard>
                    <span className="text-5xl font-bold text-white/90">{item.text}</span>
                    <div className="w-3 h-3 rounded-full bg-red-500/60" style={{ boxShadow: "0 0 20px rgba(239,68,68,0.5)" }} />
                  </div>
                );
              })}

              {(() => {
                const lf = frame - 52;
                const p = spring({ frame: lf - 115, fps, config: { damping: 10 } });
                return (
                  <div
                    className="mt-10"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})`,
                      filter: `blur(${interpolate(p, [0, 1], [10, 0])}px)`,
                    }}
                  >
                    <span
                      className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400"
                      style={{ textShadow: "0 0 60px rgba(239,68,68,0.4)" }}
                    >
                      And still... crickets. 🦗
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 3: PIVOT ═══ (236–293) */}
      <Sequence from={236} durationInFrames={57}>
        <Audio src={staticFile("audio/s03.m4a")} />
        <Scene frame={frame} fps={fps} from={236} dur={57}>
          <div className="absolute inset-0" style={{
            background: `radial-gradient(circle at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 70%)`,
            transform: `scale(${interpolate(spring({ frame: frame - 236, fps, config: { damping: 8 } }), [0, 1], [0.5, 2.5])})`,
          }} />
          <DotGrid frame={frame} color="rgba(168,85,247,0.1)" speed={0.8} />
          <GradientOrb x={50} y={50} size={600} color1="rgba(99,102,241,0.4)" color2="rgba(168,85,247,0.2)" frame={frame} />

          <div className="absolute inset-0 flex items-center justify-center">
            <GlowText
              text="What if AI could do all of it?"
              frame={frame} fps={fps} startFrame={240}
              className="text-8xl font-black text-white tracking-tight"
              highlightWords={["AI"]}
              glowColor="rgba(99,102,241,0.6)"
            />
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 4: LOGO REVEAL ═══ (293–323) */}
      <Sequence from={293} durationInFrames={30}>
        <Audio src={staticFile("audio/s04.m4a")} />
        <Scene frame={frame} fps={fps} from={293} dur={30}>
          <DotGrid frame={frame} color="rgba(99,102,241,0.06)" speed={0.4} />

          {/* Expanding glow ring */}
          {(() => {
            const p = spring({ frame: frame - 293, fps, config: { damping: 8 } });
            const ringSize = interpolate(p, [0, 1], [0, 800]);
            return (
              <div
                className="absolute rounded-full border-2 border-indigo-500/30"
                style={{
                  left: "50%", top: "50%",
                  width: ringSize, height: ringSize,
                  transform: "translate(-50%, -50%)",
                  opacity: interpolate(p, [0, 1], [0.8, 0]),
                  boxShadow: "0 0 60px rgba(99,102,241,0.3)",
                }}
              />
            );
          })()}

          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const p = spring({ frame: frame - 295, fps, config: { damping: 10, stiffness: 80 } });
              return (
                <div style={{ transform: `scale(${interpolate(p, [0, 1], [0, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                  <div className="flex items-center gap-6">
                    <div
                      className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6"
                      style={{ boxShadow: "0 0 60px rgba(99,102,241,0.4), 0 0 120px rgba(99,102,241,0.2)" }}
                    >
                      <Sparkles className="w-16 h-16 text-white" />
                    </div>
                    <span className="text-9xl font-black text-white tracking-tight">Doodle</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 5: UPLOAD LEADS ═══ (323–566) */}
      <Sequence from={323} durationInFrames={243}>
        <Audio src={staticFile("audio/s05.m4a")} />
        <Scene frame={frame} fps={fps} from={323} dur={243} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(99,102,241,0.06)" speed={0.3} />
          <GradientOrb x={15} y={25} size={400} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          <GradientOrb x={85} y={75} size={350} color1="rgba(168,85,247,0.15)" color2="transparent" frame={frame} delay={40} />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-20">
            {(() => {
              const lf = frame - 323;
              const headerP = spring({ frame: lf, fps, config: { damping: 14 } });
              return (
                <div className="mb-10" style={{ opacity: interpolate(headerP, [0, 1], [0, 1]), transform: `translateY(${interpolate(headerP, [0, 1], [30, 0])}px)` }}>
                  <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-8 py-3 rounded-full text-xl font-bold flex items-center gap-3 mb-6 mx-auto w-fit">
                    <Upload className="w-6 h-6" /> Step 1
                  </div>
                  <h2 className="text-7xl font-black text-white text-center tracking-tight">Upload your leads</h2>
                </div>
              );
            })()}

            <GradientBorderCard frame={frame} className="w-[1000px]">
              <div className="p-10">
                {(() => {
                  const lf = frame - 323;
                  return (
                    <div className="space-y-3">
                      {/* Column headers */}
                      <div className="flex items-center px-6 py-3 text-zinc-500 text-lg font-semibold uppercase tracking-wider">
                        <span className="w-16" />
                        <span className="flex-1">Name</span>
                        <span className="flex-1">Company</span>
                        <span className="flex-1">Email</span>
                        <span className="w-20 text-right">Status</span>
                      </div>

                      {[
                        { name: "Sarah Chen", co: "Stripe", email: "sarah@stripe.com", delay: 40 },
                        { name: "James Wilson", co: "Notion", email: "james@notion.so", delay: 55 },
                        { name: "Priya Sharma", co: "Figma", email: "priya@figma.com", delay: 70 },
                        { name: "Alex Rivera", co: "Linear", email: "alex@linear.app", delay: 85 },
                        { name: "Maria Santos", co: "Vercel", email: "maria@vercel.com", delay: 100 },
                      ].map((row, i) => {
                        const rowP = spring({ frame: lf - row.delay, fps, config: { damping: 14 } });
                        const checkP = spring({ frame: lf - row.delay - 8, fps, config: { damping: 10 } });
                        return (
                          <div
                            key={i}
                            className="flex items-center bg-white/5 border border-white/10 rounded-xl px-6 py-4"
                            style={{
                              opacity: interpolate(rowP, [0, 1], [0, 1]),
                              transform: `translateX(${interpolate(rowP, [0, 1], [40, 0])}px)`,
                              filter: `blur(${interpolate(rowP, [0, 1], [4, 0])}px)`,
                            }}
                          >
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg mr-4">
                              {row.name[0]}
                            </div>
                            <span className="text-xl font-bold text-white flex-1">{row.name}</span>
                            <span className="text-xl text-zinc-400 flex-1">{row.co}</span>
                            <span className="text-lg text-zinc-500 font-mono flex-1">{row.email}</span>
                            <div className="w-20 flex justify-end" style={{ opacity: interpolate(checkP, [0, 1], [0, 1]), transform: `scale(${interpolate(checkP, [0, 1], [0, 1])})` }}>
                              <CheckCircle2 className="w-7 h-7 text-emerald-400" style={{ filter: "drop-shadow(0 0 8px rgba(52,211,153,0.5))" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </GradientBorderCard>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 6: AI WRITES EMAILS ═══ (566–765) */}
      <Sequence from={566} durationInFrames={199}>
        <Audio src={staticFile("audio/s06.m4a")} />
        <Scene frame={frame} fps={fps} from={566} dur={199} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(168,85,247,0.06)" speed={0.4} />
          <GradientOrb x={30} y={20} size={500} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          <GradientOrb x={70} y={80} size={400} color1="rgba(168,85,247,0.15)" color2="transparent" frame={frame} delay={60} />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-20">
            {(() => {
              const lf = frame - 566;
              const headerP = spring({ frame: lf, fps, config: { damping: 14 } });
              return (
                <div className="mb-8" style={{ opacity: interpolate(headerP, [0, 1], [0, 1]), transform: `translateY(${interpolate(headerP, [0, 1], [30, 0])}px)` }}>
                  <div className="bg-purple-500/10 border border-purple-500/20 text-purple-400 px-8 py-3 rounded-full text-xl font-bold flex items-center gap-3 mb-6 mx-auto w-fit">
                    <Bot className="w-6 h-6" /> Step 2
                  </div>
                  <h2 className="text-7xl font-black text-white text-center tracking-tight">AI writes every email</h2>
                </div>
              );
            })()}

            <GradientBorderCard frame={frame} className="w-[1100px]">
              <div className="p-10">
                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-black">
                      SC
                    </div>
                    <div>
                      <h3 className="text-3xl font-bold text-white">Sarah Chen</h3>
                      <p className="text-xl text-zinc-500">CTO @ Stripe</p>
                    </div>
                  </div>
                  <GlassCard className="px-5 py-3" glow="rgba(99,102,241,0.2)">
                    <div className="flex items-center gap-2 text-indigo-400 font-bold text-lg">
                      <Sparkles className="w-5 h-5" /> AI Drafting
                      <Cursor frame={frame} />
                    </div>
                  </GlassCard>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-2xl leading-relaxed text-zinc-300 min-h-[260px] relative">
                  <div
                    className="absolute -top-5 -left-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-xl"
                    style={{ boxShadow: "0 0 30px rgba(99,102,241,0.4)" }}
                  >
                    <Sparkles className="w-6 h-6" />
                  </div>

                  {(() => {
                    const lf = frame - 566;
                    const lines: { text: string; delay: number; bold?: boolean }[] = [
                      { text: "Hi Sarah,", delay: 25 },
                      { text: "I saw Stripe's latest API launch — the developer experience is remarkable.", delay: 45 },
                      { text: "We're building Doodle, an AI-powered outbound engine that automates personalized email at scale. Given your focus on developer tools, I think you'd find our approach interesting.", delay: 75 },
                      { text: "Would love 10 minutes to show you a quick demo?", delay: 115, bold: true },
                    ];
                    const lastVisibleIdx = lines.reduce((acc, l, i) => (lf > l.delay ? i : acc), -1);

                    return (
                      <div className="space-y-4">
                        {lines.map((line, i) => {
                          const p = spring({ frame: lf - line.delay, fps, config: { damping: 14 } });
                          const visible = lf > line.delay;
                          if (!visible) return null;
                          return (
                            <p
                              key={i}
                              style={{
                                opacity: interpolate(p, [0, 1], [0, 1]),
                                transform: `translateY(${interpolate(p, [0, 1], [15, 0])}px)`,
                              }}
                              className={line.bold ? "text-indigo-400 font-bold" : ""}
                            >
                              {line.text}
                              {i === lastVisibleIdx && <Cursor frame={frame} />}
                            </p>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </GradientBorderCard>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 7: SENDS ON AUTOPILOT ═══ (765–911) */}
      <Sequence from={765} durationInFrames={146}>
        <Audio src={staticFile("audio/s07.m4a")} />
        <Scene frame={frame} fps={fps} from={765} dur={146} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(52,211,153,0.06)" speed={0.3} />
          <GradientOrb x={20} y={40} size={400} color1="rgba(52,211,153,0.15)" color2="transparent" frame={frame} />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-20">
            {(() => {
              const lf = frame - 765;
              const headerP = spring({ frame: lf, fps, config: { damping: 14 } });
              return (
                <div className="mb-8" style={{ opacity: interpolate(headerP, [0, 1], [0, 1]) }}>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-8 py-3 rounded-full text-xl font-bold flex items-center gap-3 mb-6 mx-auto w-fit">
                    <Send className="w-6 h-6" /> Step 3
                  </div>
                  <h2 className="text-7xl font-black text-white text-center tracking-tight">Sends on autopilot</h2>
                </div>
              );
            })()}

            <GradientBorderCard frame={frame} className="w-[1000px]">
              <div className="p-8">
                {[
                  { name: "Sarah Chen", status: "Sent", time: "2m ago", color: "emerald", delay: 15 },
                  { name: "James Wilson", status: "Sent", time: "4m ago", color: "emerald", delay: 28 },
                  { name: "Priya Sharma", status: "Sending", time: "Now", color: "blue", delay: 42 },
                  { name: "Alex Rivera", status: "Queued", time: "In 8m", color: "zinc", delay: 56 },
                  { name: "Maria Santos", status: "Queued", time: "In 16m", color: "zinc", delay: 70 },
                ].map((item, i) => {
                  const lf = frame - 765;
                  const p = spring({ frame: lf - item.delay, fps, config: { damping: 14 } });
                  const colors: Record<string, { bg: string; text: string; glow: string }> = {
                    emerald: { bg: "bg-emerald-500/20", text: "text-emerald-400", glow: "drop-shadow(0 0 6px rgba(52,211,153,0.5))" },
                    blue: { bg: "bg-blue-500/20", text: "text-blue-400", glow: "drop-shadow(0 0 6px rgba(59,130,246,0.5))" },
                    zinc: { bg: "bg-white/5", text: "text-zinc-500", glow: "none" },
                  };
                  const c = colors[item.color];
                  return (
                    <div
                      key={i}
                      className="flex items-center py-5 border-b border-white/5 last:border-0"
                      style={{
                        opacity: interpolate(p, [0, 1], [0, 1]),
                        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
                      }}
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black text-lg mr-5">
                        {item.name[0]}
                      </div>
                      <span className="text-2xl font-bold text-white flex-1">{item.name}</span>
                      <span className={`text-lg font-bold px-5 py-2 rounded-full mr-5 ${c.bg} ${c.text}`} style={{ filter: c.glow }}>
                        {item.status === "Sent" && "✓ "}{item.status}
                      </span>
                      <span className="text-lg text-zinc-500 w-24 text-right">{item.time}</span>
                      <Shield className="w-5 h-5 text-emerald-500/50 ml-4" />
                    </div>
                  );
                })}
              </div>
            </GradientBorderCard>

            {(() => {
              const lf = frame - 765;
              const p = spring({ frame: lf - 80, fps, config: { damping: 14 } });
              return (
                <p className="text-xl text-zinc-500 font-medium flex items-center gap-3 mt-6" style={{ opacity: interpolate(p, [0, 1], [0, 1]) }}>
                  <Shield className="w-5 h-5 text-emerald-500" /> Paced perfectly. Your domain stays safe.
                </p>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 8: ANALYTICS ═══ (911–1050) */}
      <Sequence from={911} durationInFrames={139}>
        <Audio src={staticFile("audio/s08.m4a")} />
        <Scene frame={frame} fps={fps} from={911} dur={139} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(99,102,241,0.06)" speed={0.3} />
          <GradientOrb x={50} y={30} size={500} color1="rgba(99,102,241,0.15)" color2="transparent" frame={frame} />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-20">
            {(() => {
              const lf = frame - 911;
              const headerP = spring({ frame: lf, fps, config: { damping: 14 } });
              return (
                <h2 className="text-7xl font-black text-white text-center tracking-tight mb-12" style={{ opacity: interpolate(headerP, [0, 1], [0, 1]) }}>
                  Track <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">everything</span>
                </h2>
              );
            })()}

            <div className="grid grid-cols-3 gap-8 w-[1200px]">
              {[
                { label: "Emails Sent", value: 8402, icon: <Mail className="w-8 h-8" />, color: "indigo", growth: "+12%", ringPct: 84, delay: 15 },
                { label: "Open Rate", value: 67.3, suffix: "%", icon: <TrendingUp className="w-8 h-8" />, color: "purple", growth: "+8%", ringPct: 67, delay: 30 },
                { label: "Meetings Booked", value: 142, icon: <Target className="w-8 h-8" />, color: "emerald", growth: "+23%", ringPct: 92, delay: 45 },
              ].map((stat, i) => {
                const lf = frame - 911;
                const p = spring({ frame: lf - stat.delay, fps, config: { damping: 12 } });
                const countUp = interpolate(lf, [stat.delay, stat.delay + 60], [0, stat.value], { extrapolateRight: "clamp" });
                const ringUp = interpolate(lf, [stat.delay + 10, stat.delay + 50], [0, stat.ringPct], { extrapolateRight: "clamp" });
                const glowColors: Record<string, string> = { indigo: "rgba(99,102,241,0.2)", purple: "rgba(168,85,247,0.2)", emerald: "rgba(52,211,153,0.2)" };
                const strokeColors: Record<string, string> = { indigo: "#6366f1", purple: "#a855f7", emerald: "#34d399" };

                return (
                  <GlassCard
                    key={i}
                    className="p-8"
                    glow={glowColors[stat.color]}
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="relative">
                        <ProgressRing progress={ringUp} size={70} strokeWidth={5} color={strokeColors[stat.color]} />
                        <div className="absolute inset-0 flex items-center justify-center text-white/80">{stat.icon}</div>
                      </div>
                      <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">
                        <ArrowUpRight className="w-4 h-4" />{stat.growth}
                      </span>
                    </div>
                    <p className="text-lg text-zinc-500 font-medium mb-2">{stat.label}</p>
                    <p className="text-5xl font-black text-white">
                      {stat.suffix ? countUp.toFixed(1) : Math.floor(countUp).toLocaleString()}{stat.suffix || ""}
                    </p>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 9: USE CASES ═══ (1050–1180) */}
      <Sequence from={1050} durationInFrames={130}>
        <Audio src={staticFile("audio/s09.m4a")} />
        <Scene frame={frame} fps={fps} from={1050} dur={130} bg="bg-zinc-950">
          <DotGrid frame={frame} color="rgba(99,102,241,0.06)" speed={0.3} />
          <GradientOrb x={40} y={60} size={500} color1="rgba(99,102,241,0.15)" color2="rgba(168,85,247,0.1)" frame={frame} />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-20">
            {(() => {
              const lf = frame - 1050;
              const headerP = spring({ frame: lf, fps, config: { damping: 14 } });
              return (
                <h2 className="text-7xl font-black text-white text-center tracking-tight mb-14" style={{ opacity: interpolate(headerP, [0, 1], [0, 1]) }}>
                  Built for people who{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">move fast</span>
                </h2>
              );
            })()}

            <div className="grid grid-cols-3 gap-10 w-[1200px]">
              {[
                { icon: <Zap className="w-12 h-12" />, title: "Founders", desc: "Close your first 100 customers", delay: 12 },
                { icon: <Target className="w-12 h-12" />, title: "Sales Teams", desc: "10x your outbound pipeline", delay: 26 },
                { icon: <Users className="w-12 h-12" />, title: "Recruiters", desc: "Fill roles 3x faster", delay: 40 },
              ].map((item, i) => {
                const lf = frame - 1050;
                const p = spring({ frame: lf - item.delay, fps, config: { damping: 12 } });
                return (
                  <GlassCard
                    key={i}
                    className="p-10 text-center"
                    glow="rgba(99,102,241,0.1)"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.85, 1])})`,
                    }}
                  >
                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 p-5 rounded-2xl inline-block mb-6">
                      {item.icon}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-3">{item.title}</h3>
                    <p className="text-xl text-zinc-400 font-medium">{item.desc}</p>
                  </GlassCard>
                );
              })}
            </div>
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 10: 100% FREE ═══ (1180–1297) */}
      <Sequence from={1180} durationInFrames={117}>
        <Audio src={staticFile("audio/s10.m4a")} />
        <Scene frame={frame} fps={fps} from={1180} dur={117}>
          <GradientOrb x={30} y={40} size={600} color1="rgba(99,102,241,0.4)" color2="rgba(168,85,247,0.2)" frame={frame} />
          <GradientOrb x={70} y={60} size={500} color1="rgba(168,85,247,0.3)" color2="transparent" frame={frame} delay={30} />
          <DotGrid frame={frame} color="rgba(255,255,255,0.04)" speed={0.5} />

          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const p = spring({ frame: frame - 1180, fps, config: { damping: 10 } });
              return (
                <div className="text-center" style={{ transform: `scale(${interpolate(p, [0, 1], [0.3, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                  <p className="text-4xl text-indigo-300 font-bold mb-8">And right now?</p>
                  <h2
                    className="text-[10rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-none"
                    style={{ textShadow: "0 0 80px rgba(99,102,241,0.3)" }}
                  >
                    100% Free
                  </h2>
                  <p className="text-3xl text-zinc-400 font-medium mt-8">for early users</p>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

      {/* ═══ SCENE 11: EXIT CTA ═══ (1297–1373) */}
      <Sequence from={1297} durationInFrames={76}>
        <Audio src={staticFile("audio/s11.m4a")} />
        <Scene frame={frame} fps={fps} from={1297} dur={76}>
          <GradientOrb x={50} y={50} size={800} color1="rgba(99,102,241,0.2)" color2="transparent" frame={frame} />
          <DotGrid frame={frame} color="rgba(99,102,241,0.05)" speed={0.4} />

          <div className="absolute inset-0 flex items-center justify-center">
            {(() => {
              const p = spring({ frame: frame - 1297, fps, config: { damping: 10 } });
              return (
                <div className="flex flex-col items-center" style={{ transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                  <div className="flex items-center gap-5 mb-10">
                    <div
                      className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4"
                      style={{ boxShadow: "0 0 60px rgba(99,102,241,0.4)" }}
                    >
                      <Sparkles className="w-12 h-12 text-white" />
                    </div>
                    <span className="text-6xl font-bold text-white tracking-tight">Doodle</span>
                  </div>
                  <h2 className="text-8xl font-black text-white mb-10">
                    Be early.{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Build bigger.</span>
                  </h2>
                  <GlassCard className="px-12 py-6" glow="rgba(99,102,241,0.2)">
                    <p className="text-3xl font-medium text-white tracking-wide">doodle.com</p>
                  </GlassCard>
                </div>
              );
            })()}
          </div>
        </Scene>
      </Sequence>

    </AbsoluteFill>
  );
};
