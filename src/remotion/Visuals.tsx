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
