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

/* ─── helpers ─── */
const ease = (t: number) => interpolate(t, [0, 1], [0, 1], { easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

const FadeSlide: React.FC<{
  frame: number;
  fps: number;
  from: number;
  dur: number;
  direction?: "up" | "down" | "left" | "right";
  children: React.ReactNode;
}> = ({ frame, fps, from, dur, direction = "up", children }) => {
  const localFrame = frame - from;
  const inProgress = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const outProgress = spring({ frame: localFrame - (dur - 15), fps, config: { damping: 14 } });

  const dirs: Record<string, [number, number]> = {
    up: [80, 0], down: [-80, 0], left: [0, 80], right: [0, -80],
  };
  const [startY, startX] = dirs[direction] || [80, 0];

  const y = interpolate(inProgress, [0, 1], [startY, 0]) + interpolate(outProgress, [0, 1], [0, -60]);
  const x = interpolate(inProgress, [0, 1], [startX, 0]);
  const opacity = interpolate(inProgress, [0, 1], [0, 1]) - interpolate(outProgress, [0, 1], [0, 1]);
  const scale = interpolate(inProgress, [0, 1], [0.9, 1]);

  return (
    <div
      className="absolute inset-0 flex items-center justify-center"
      style={{ transform: `translateX(${x}px) translateY(${y}px) scale(${scale})`, opacity: Math.max(0, opacity) }}
    >
      {children}
    </div>
  );
};

/* ─── word-by-word kinetic text ─── */
const KineticText: React.FC<{
  text: string;
  frame: number;
  fps: number;
  startFrame: number;
  className?: string;
  highlightWord?: string;
}> = ({ text, frame, fps, startFrame, className = "", highlightWord }) => {
  const words = text.split(" ");
  return (
    <div className={`flex flex-wrap justify-center gap-x-5 ${className}`}>
      {words.map((word, i) => {
        const wordFrame = startFrame + i * 3;
        const p = spring({ frame: frame - wordFrame, fps, config: { damping: 12, stiffness: 200 } });
        const isHighlight = highlightWord && word.toLowerCase().includes(highlightWord.toLowerCase());
        return (
          <span
            key={i}
            style={{
              opacity: interpolate(p, [0, 1], [0, 1]),
              transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
              display: "inline-block",
            }}
            className={isHighlight ? "text-indigo-500" : ""}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

/* ─── MAIN VIDEO ─── */
export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill className="bg-white font-sans overflow-hidden">

      {/* ═══════════════════════════════════════════
          SCENE 1: HOOK — "Your outbound is broken."
          Frames 0–52
      ═══════════════════════════════════════════ */}
      <Sequence from={0} durationInFrames={52}>
        <Audio src={staticFile("audio/s01.m4a")} />
        <AbsoluteFill className="bg-zinc-950 flex items-center justify-center">
          <KineticText
            text="Your outbound is broken."
            frame={frame}
            fps={fps}
            startFrame={5}
            className="text-8xl font-black text-white tracking-tight"
            highlightWord="broken"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 2: PAIN POINTS
          Frames 52–236
      ═══════════════════════════════════════════ */}
      <Sequence from={52} durationInFrames={184}>
        <Audio src={staticFile("audio/s02.m4a")} />
        <AbsoluteFill className="bg-zinc-950 flex items-center justify-center">
          <div className="flex flex-col items-center gap-16">
            {/* Pain items appearing one by one */}
            {[
              { icon: <Users className="w-12 h-12" />, text: "Researching leads", delay: 5 },
              { icon: <Mail className="w-12 h-12" />, text: "Writing emails", delay: 40 },
              { icon: <Clock className="w-12 h-12" />, text: "Following up", delay: 75 },
            ].map((item, i) => {
              const localFrame = frame - 52;
              const p = spring({ frame: localFrame - item.delay, fps, config: { damping: 12 } });
              return (
                <div
                  key={i}
                  className="flex items-center gap-8"
                  style={{
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(p, [0, 1], [-100, 0])}px)`,
                  }}
                >
                  <div className="bg-red-500/20 text-red-400 p-5 rounded-2xl">{item.icon}</div>
                  <span className="text-5xl font-bold text-white">{item.text}</span>
                </div>
              );
            })}

            {/* "And still... crickets." */}
            {(() => {
              const localFrame = frame - 52;
              const p = spring({ frame: localFrame - 120, fps, config: { damping: 14 } });
              return (
                <div
                  className="mt-8"
                  style={{
                    opacity: interpolate(p, [0, 1], [0, 1]),
                    transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`,
                  }}
                >
                  <span className="text-7xl font-black text-red-400">And still... crickets. 🦗</span>
                </div>
              );
            })()}
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 3: PIVOT — "What if AI could do all of it?"
          Frames 236–293
      ═══════════════════════════════════════════ */}
      <Sequence from={236} durationInFrames={57}>
        <Audio src={staticFile("audio/s03.m4a")} />
        <AbsoluteFill className="bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
          <KineticText
            text="What if AI could do all of it?"
            frame={frame}
            fps={fps}
            startFrame={241}
            className="text-8xl font-black text-white tracking-tight"
            highlightWord="AI"
          />
        </AbsoluteFill>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 4: LOGO REVEAL — "Meet Doodle."
          Frames 293–323
      ═══════════════════════════════════════════ */}
      <Sequence from={293} durationInFrames={30}>
        <Audio src={staticFile("audio/s04.m4a")} />
        <AbsoluteFill className="bg-white flex items-center justify-center">
          {(() => {
            const p = spring({ frame: frame - 293, fps, config: { damping: 10, stiffness: 100 } });
            return (
              <div style={{ transform: `scale(${interpolate(p, [0, 1], [0, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                <div className="flex items-center gap-6">
                  <div className="bg-indigo-600 rounded-3xl p-5">
                    <Sparkles className="w-16 h-16 text-white" />
                  </div>
                  <span className="text-9xl font-black text-zinc-900 tracking-tight">Doodle</span>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 5: UPLOAD LEADS
          Frames 323–566
      ═══════════════════════════════════════════ */}
      <Sequence from={323} durationInFrames={243}>
        <Audio src={staticFile("audio/s05.m4a")} />
        <FadeSlide frame={frame} fps={fps} from={323} dur={243}>
          <div className="flex flex-col items-center gap-10">
            <div className="bg-indigo-50 text-indigo-600 px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-3">
              <Upload className="w-7 h-7" /> Step 1
            </div>
            <h2 className="text-7xl font-black text-zinc-900 text-center tracking-tight">
              Upload your leads
            </h2>

            {/* Animated CSV upload card */}
            <div className="bg-white border-2 border-dashed border-indigo-300 rounded-[2rem] p-12 w-[900px] flex flex-col items-center gap-8 shadow-xl">
              {(() => {
                const localFrame = frame - 323;
                const uploadP = spring({ frame: localFrame - 30, fps, config: { damping: 12 } });
                return (
                  <>
                    <Upload
                      className="w-20 h-20 text-indigo-400"
                      style={{ transform: `translateY(${interpolate(uploadP, [0, 1], [0, -10])}px)` }}
                    />
                    <p className="text-3xl text-zinc-500 font-medium">CSV, spreadsheet, or paste them in</p>

                    {/* Animated rows appearing */}
                    <div className="w-full space-y-4 mt-4">
                      {[
                        { name: "Sarah Chen", co: "Stripe", email: "sarah@stripe.com", delay: 60 },
                        { name: "James Wilson", co: "Notion", email: "james@notion.so", delay: 75 },
                        { name: "Priya Sharma", co: "Figma", email: "priya@figma.com", delay: 90 },
                        { name: "Alex Rivera", co: "Linear", email: "alex@linear.app", delay: 105 },
                        { name: "Maria Santos", co: "Vercel", email: "maria@vercel.com", delay: 120 },
                      ].map((row, i) => {
                        const rowP = spring({ frame: localFrame - row.delay, fps, config: { damping: 14 } });
                        return (
                          <div
                            key={i}
                            className="flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-8 py-5"
                            style={{
                              opacity: interpolate(rowP, [0, 1], [0, 1]),
                              transform: `translateX(${interpolate(rowP, [0, 1], [60, 0])}px)`,
                            }}
                          >
                            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl mr-6">
                              {row.name[0]}
                            </div>
                            <span className="text-2xl font-bold text-zinc-800 flex-1">{row.name}</span>
                            <span className="text-2xl text-zinc-500 flex-1">{row.co}</span>
                            <span className="text-xl text-zinc-400 font-mono">{row.email}</span>
                            <CheckCircle2 className="w-7 h-7 text-green-500 ml-6" />
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </FadeSlide>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 6: AI WRITES EMAILS
          Frames 566–765
      ═══════════════════════════════════════════ */}
      <Sequence from={566} durationInFrames={199}>
        <Audio src={staticFile("audio/s06.m4a")} />
        <FadeSlide frame={frame} fps={fps} from={566} dur={199}>
          <div className="flex flex-col items-center gap-10">
            <div className="bg-purple-50 text-purple-600 px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-3">
              <Bot className="w-7 h-7" /> Step 2
            </div>
            <h2 className="text-7xl font-black text-zinc-900 text-center tracking-tight">
              AI writes every email
            </h2>

            <div className="bg-white border border-zinc-200 shadow-2xl rounded-[2rem] p-10 w-[1100px]">
              <div className="flex items-center justify-between mb-8 pb-8 border-b border-zinc-100">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-2xl font-black">SC</div>
                  <div>
                    <h3 className="text-3xl font-bold">Sarah Chen</h3>
                    <p className="text-xl text-zinc-500">CTO @ Stripe</p>
                  </div>
                </div>
                <div className="bg-indigo-50 text-indigo-600 px-6 py-3 rounded-full font-bold text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> AI Drafting...
                </div>
              </div>

              <div className="bg-zinc-50 rounded-2xl p-8 text-2xl leading-relaxed text-zinc-700 relative min-h-[260px]">
                <div className="absolute -top-5 -left-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-3 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                {(() => {
                  const localFrame = frame - 566;
                  const lines = [
                    { text: 'Hi Sarah,', delay: 20 },
                    { text: '', delay: 0 },
                    { text: "I saw Stripe's latest API launch — the developer experience is remarkable.", delay: 40 },
                    { text: '', delay: 0 },
                    { text: "We're building Doodle, an AI-powered outbound engine that automates personalized email at scale. Given your focus on developer tools, I think you'd find our approach interesting.", delay: 70 },
                    { text: '', delay: 0 },
                    { text: 'Would love 10 minutes to show you a quick demo?', delay: 110 },
                  ];
                  return lines.map((line, i) => {
                    if (!line.text) return <br key={i} />;
                    const p = spring({ frame: localFrame - line.delay, fps, config: { damping: 14 } });
                    return (
                      <span
                        key={i}
                        style={{ opacity: interpolate(p, [0, 1], [0, 1]) }}
                        className={i === lines.length - 1 ? "font-bold text-indigo-600" : ""}
                      >
                        {line.text}
                        {i < lines.length - 1 && <br />}
                      </span>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </FadeSlide>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 7: SENDS ON AUTOPILOT
          Frames 765–911
      ═══════════════════════════════════════════ */}
      <Sequence from={765} durationInFrames={146}>
        <Audio src={staticFile("audio/s07.m4a")} />
        <FadeSlide frame={frame} fps={fps} from={765} dur={146}>
          <div className="flex flex-col items-center gap-10">
            <div className="bg-green-50 text-green-600 px-8 py-4 rounded-full text-2xl font-bold flex items-center gap-3">
              <Send className="w-7 h-7" /> Step 3
            </div>
            <h2 className="text-7xl font-black text-zinc-900 text-center tracking-tight">
              Sends on autopilot
            </h2>

            <div className="bg-white border border-zinc-200 shadow-2xl rounded-[2rem] p-10 w-[1000px]">
              {[
                { name: "Sarah Chen", status: "Sent", time: "2 min ago", delay: 20 },
                { name: "James Wilson", status: "Sent", time: "4 min ago", delay: 35 },
                { name: "Priya Sharma", status: "Sending...", time: "Now", delay: 50 },
                { name: "Alex Rivera", status: "Queued", time: "In 8 min", delay: 65 },
                { name: "Maria Santos", status: "Queued", time: "In 16 min", delay: 80 },
              ].map((item, i) => {
                const localFrame = frame - 765;
                const p = spring({ frame: localFrame - item.delay, fps, config: { damping: 14 } });
                const isSent = item.status === "Sent";
                const isSending = item.status === "Sending...";
                return (
                  <div
                    key={i}
                    className="flex items-center py-6 border-b border-zinc-100 last:border-0"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(p, [0, 1], [30, 0])}px)`,
                    }}
                  >
                    <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-black text-xl mr-6">
                      {item.name[0]}
                    </div>
                    <span className="text-2xl font-bold text-zinc-800 flex-1">{item.name}</span>
                    <span className={`text-xl font-bold px-5 py-2 rounded-full mr-6 ${
                      isSent ? "bg-green-100 text-green-600" : isSending ? "bg-blue-100 text-blue-600" : "bg-zinc-100 text-zinc-500"
                    }`}>
                      {isSent && <span>✓ </span>}{item.status}
                    </span>
                    <span className="text-xl text-zinc-400 w-32 text-right">{item.time}</span>
                    <Shield className="w-6 h-6 text-green-400 ml-6" />
                  </div>
                );
              })}
            </div>

            <p className="text-2xl text-zinc-400 font-medium flex items-center gap-3">
              <Shield className="w-6 h-6" /> Paced perfectly. Your domain stays safe.
            </p>
          </div>
        </FadeSlide>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 8: ANALYTICS
          Frames 911–1050
      ═══════════════════════════════════════════ */}
      <Sequence from={911} durationInFrames={139}>
        <Audio src={staticFile("audio/s08.m4a")} />
        <FadeSlide frame={frame} fps={fps} from={911} dur={139}>
          <div className="flex flex-col items-center gap-10">
            <h2 className="text-7xl font-black text-zinc-900 text-center tracking-tight">
              Track <span className="text-indigo-600">everything</span>
            </h2>

            <div className="grid grid-cols-3 gap-8 w-[1200px]">
              {[
                { label: "Emails Sent", value: 8402, icon: <Mail className="w-10 h-10" />, color: "indigo", growth: "+12%", delay: 15 },
                { label: "Open Rate", value: 67.3, suffix: "%", icon: <TrendingUp className="w-10 h-10" />, color: "blue", growth: "+8%", delay: 30 },
                { label: "Meetings Booked", value: 142, icon: <Target className="w-10 h-10" />, color: "green", growth: "+23%", delay: 45 },
              ].map((stat, i) => {
                const localFrame = frame - 911;
                const p = spring({ frame: localFrame - stat.delay, fps, config: { damping: 12 } });
                const countUp = interpolate(localFrame, [stat.delay, stat.delay + 60], [0, stat.value], { extrapolateRight: "clamp" });
                const colors: Record<string, string> = {
                  indigo: "bg-indigo-50 text-indigo-600",
                  blue: "bg-blue-50 text-blue-600",
                  green: "bg-green-50 text-green-600",
                };
                return (
                  <div
                    key={i}
                    className="bg-white border border-zinc-200 shadow-xl rounded-3xl p-10"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `translateY(${interpolate(p, [0, 1], [50, 0])}px) scale(${interpolate(p, [0, 1], [0.9, 1])})`,
                    }}
                  >
                    <div className="flex justify-between items-start mb-8">
                      <div className={`p-5 rounded-2xl ${colors[stat.color]}`}>{stat.icon}</div>
                      <span className="text-green-500 font-bold text-xl flex items-center gap-1">
                        <ArrowUpRight className="w-5 h-5" />{stat.growth}
                      </span>
                    </div>
                    <p className="text-xl text-zinc-500 font-medium mb-3">{stat.label}</p>
                    <p className="text-6xl font-black text-zinc-900">
                      {stat.suffix ? countUp.toFixed(1) : Math.floor(countUp).toLocaleString()}{stat.suffix || ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeSlide>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 9: USE CASES
          Frames 1050–1180
      ═══════════════════════════════════════════ */}
      <Sequence from={1050} durationInFrames={130}>
        <Audio src={staticFile("audio/s09.m4a")} />
        <FadeSlide frame={frame} fps={fps} from={1050} dur={130}>
          <div className="flex flex-col items-center gap-12">
            <h2 className="text-7xl font-black text-zinc-900 text-center tracking-tight">
              Built for people who <span className="text-indigo-600">move fast</span>
            </h2>

            <div className="grid grid-cols-3 gap-10 w-[1200px]">
              {[
                { icon: <Zap className="w-14 h-14" />, title: "Founders", desc: "Close your first 100 customers", delay: 15 },
                { icon: <Target className="w-14 h-14" />, title: "Sales Teams", desc: "10x your outbound pipeline", delay: 30 },
                { icon: <Users className="w-14 h-14" />, title: "Recruiters", desc: "Fill roles 3x faster", delay: 45 },
              ].map((item, i) => {
                const localFrame = frame - 1050;
                const p = spring({ frame: localFrame - item.delay, fps, config: { damping: 12 } });
                return (
                  <div
                    key={i}
                    className="bg-white border border-zinc-200 shadow-xl rounded-3xl p-12 text-center"
                    style={{
                      opacity: interpolate(p, [0, 1], [0, 1]),
                      transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
                    }}
                  >
                    <div className="bg-indigo-50 text-indigo-600 p-6 rounded-2xl inline-block mb-6">{item.icon}</div>
                    <h3 className="text-3xl font-bold text-zinc-900 mb-3">{item.title}</h3>
                    <p className="text-xl text-zinc-500 font-medium">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </FadeSlide>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 10: FREE
          Frames 1180–1297
      ═══════════════════════════════════════════ */}
      <Sequence from={1180} durationInFrames={117}>
        <Audio src={staticFile("audio/s10.m4a")} />
        <AbsoluteFill className="bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
          {(() => {
            const p = spring({ frame: frame - 1180, fps, config: { damping: 10 } });
            return (
              <div className="text-center" style={{ transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                <p className="text-4xl text-indigo-200 font-bold mb-6">And right now?</p>
                <h2 className="text-9xl font-black text-white tracking-tight">100% Free</h2>
                <p className="text-3xl text-indigo-200 font-medium mt-8">for early users</p>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* ═══════════════════════════════════════════
          SCENE 11: EXIT CTA
          Frames 1297–1373
      ═══════════════════════════════════════════ */}
      <Sequence from={1297} durationInFrames={76}>
        <Audio src={staticFile("audio/s11.m4a")} />
        <AbsoluteFill className="bg-zinc-950 flex items-center justify-center">
          {(() => {
            const p = spring({ frame: frame - 1297, fps, config: { damping: 10 } });
            return (
              <div className="flex flex-col items-center" style={{ transform: `scale(${interpolate(p, [0, 1], [0.5, 1])})`, opacity: interpolate(p, [0, 1], [0, 1]) }}>
                <div className="flex items-center gap-5 mb-10">
                  <div className="bg-indigo-600 rounded-2xl p-4">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                  <span className="text-6xl font-bold text-white tracking-tight">Doodle</span>
                </div>
                <h2 className="text-8xl font-black text-white mb-10">
                  Be early. <span className="text-indigo-400">Build bigger.</span>
                </h2>
                <div className="bg-white/10 border border-white/20 backdrop-blur-sm px-12 py-6 rounded-full">
                  <p className="text-3xl font-medium text-white tracking-wide">doodle.com</p>
                </div>
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

    </AbsoluteFill>
  );
};
