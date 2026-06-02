'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const PARTICLES = [
  { left: '7%',  delay: '0s',   dur: '9s',  size: 2.5 },
  { left: '18%', delay: '2.3s', dur: '11s', size: 2 },
  { left: '29%', delay: '0.8s', dur: '8s',  size: 3 },
  { left: '42%', delay: '3.5s', dur: '10s', size: 2 },
  { left: '56%', delay: '1.2s', dur: '9s',  size: 3.5 },
  { left: '68%', delay: '2.9s', dur: '7s',  size: 2 },
  { left: '79%', delay: '0.4s', dur: '11s', size: 2.5 },
  { left: '91%', delay: '4.1s', dur: '8s',  size: 2 },
];

// Confetti pieces — angle in degrees, color, shape, size
const CONFETTI = [
  ...Array.from({ length: 40 }, (_, i) => ({
    angle: (i / 40) * 360,
    color: ['#D4942A','#F5C842','#5A7A3A','#8AA050','#FFFBE0','#E8C060','#C8B44A','#4a6830'][i % 8],
    shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'strip',
    size: 6 + (i % 5) * 2,
    speed: 180 + (i % 6) * 40,
    delay: (i % 5) * 40,
    rotation: i * 37,
  })),
];

type Phase = 'idle' | 'charging' | 'confetti' | 'burst' | 'flash';

const LAUNCH_LINES = [
  { text: 'Initializing Craft Protocol...', sub: 'System check complete ✓'          },
  { text: 'Heritage Verified · 80 Years',   sub: 'Authenticity confirmed ✓'         },
  { text: 'Loading Amma\'s Kitchen...',      sub: 'All ingredients online ✓'         },
  { text: 'All Systems Go 🚀',               sub: 'Launch sequence confirmed'        },
];

export default function VIPLaunch({ onDismiss }: { onDismiss?: () => void }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('idle');
  const [lineIdx, setLineIdx] = useState(-1);
  const [typedText, setTypedText] = useState('');
  const [subVisible, setSubVisible] = useState(false);
  const typeRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STEP = 2400;
  const TYPE_SPEED = 38;

  useEffect(() => {
    if (lineIdx < 0 || lineIdx >= LAUNCH_LINES.length) { setTypedText(''); setSubVisible(false); return; }
    const fullText = LAUNCH_LINES[lineIdx].text;
    setTypedText('');
    setSubVisible(false);
    let i = 0;
    if (typeRef.current) clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setTypedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(typeRef.current!);
        setTimeout(() => setSubVisible(true), 150);
      }
    }, TYPE_SPEED);
    return () => { if (typeRef.current) clearInterval(typeRef.current); };
  }, [lineIdx]);

  const handleLaunch = () => {
    if (phase !== 'idle') return;
    setPhase('charging');

    // After charging, show lines one by one (each stays STEP ms, then replaced)
    setTimeout(() => {
      setPhase('confetti');
      LAUNCH_LINES.forEach((_, i) => {
        setTimeout(() => setLineIdx(i), i * STEP);
      });
    }, 500);

    const totalLines = LAUNCH_LINES.length * STEP;
    const HOLD = 1200; // extra pause after last line before burst
    setTimeout(() => { setLineIdx(-1); setPhase('burst'); }, 500 + totalLines + HOLD);
    setTimeout(() => setPhase('flash'),    500 + totalLines + HOLD + 600);
    setTimeout(() => { if (onDismiss) onDismiss(); else router.push('/'); }, 500 + totalLines + HOLD + 1200);
  };

  return (
    <>
      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          8%   { opacity: 0.65; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes float-up-fast {
          0%   { opacity: 0.8; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-110vh); }
        }
        @keyframes ring-breathe {
          0%, 100% { transform: scale(1);    opacity: 0.25; }
          50%       { transform: scale(1.06); opacity: 0.55; }
        }
        @keyframes ring-breathe2 {
          0%, 100% { transform: scale(1);    opacity: 0.10; }
          50%       { transform: scale(1.09); opacity: 0.22; }
        }
        @keyframes logo-glow {
          0%, 100% { box-shadow: 0 0 30px 6px rgba(212,148,42,0.18), 0 16px 48px rgba(0,0,0,0.8); }
          50%       { box-shadow: 0 0 60px 18px rgba(212,148,42,0.32), 0 16px 48px rgba(0,0,0,0.8); }
        }
        @keyframes gold-sweep {
          0%   { background-position: -300% center; }
          100% { background-position:  300% center; }
        }
        @keyframes ambient {
          0%, 100% { opacity: 0.06; }
          50%       { opacity: 0.13; }
        }
        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes line-grow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes btn-idle-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(212,148,42,0); }
          50%       { box-shadow: 0 0 0 14px rgba(212,148,42,0.12); }
        }
        @keyframes btn-charge-glow {
          0%   { box-shadow: 0 0 20px 4px rgba(212,148,42,0.4); }
          100% { box-shadow: 0 0 80px 30px rgba(255,220,80,0.8), 0 0 160px 60px rgba(212,148,42,0.5); }
        }
        @keyframes line-in {
          0%   { opacity: 0; transform: translateY(32px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes sub-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes text-glow-pulse {
          0%, 100% { text-shadow: 0 2px 30px rgba(0,0,0,0.9), 0 0 20px rgba(212,148,42,0.15); }
          50%       { text-shadow: 0 2px 30px rgba(0,0,0,0.9), 0 0 50px rgba(212,148,42,0.45); }
        }
        @keyframes checkmark-pop {
          0%   { transform: scale(0) rotate(-15deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(5deg);  opacity: 1; }
          100% { transform: scale(1) rotate(0deg);   opacity: 1; }
        }
        @keyframes screen-shake {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          15% { transform: translate(-4px, 2px) rotate(-0.3deg); }
          30% { transform: translate(4px, -3px) rotate(0.3deg); }
          45% { transform: translate(-3px, 4px) rotate(-0.2deg); }
          60% { transform: translate(3px, -2px) rotate(0.2deg); }
          75% { transform: translate(-2px, 3px) rotate(-0.1deg); }
          90% { transform: translate(2px, -1px) rotate(0.1deg); }
        }
        @keyframes confetti-fly {
          0%   { transform: translate(0,0) rotate(0deg) scale(1); opacity: 1; }
          80%  { opacity: 0.8; }
          100% { opacity: 0; }
        }
        @keyframes shockwave-slow {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.9; }
          100% { transform: translate(-50%,-50%) scale(16); opacity: 0; }
        }
        @keyframes shockwave-slow2 {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 0.5; }
          100% { transform: translate(-50%,-50%) scale(20); opacity: 0; }
        }
        @keyframes burst-expand-slow {
          0%   { transform: translate(-50%,-50%) scale(0); opacity: 1; }
          100% { transform: translate(-50%,-50%) scale(22); opacity: 1; }
        }
        @keyframes flash-in-slow {
          0%   { opacity: 0; }
          30%  { opacity: 0.8; }
          60%  { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes content-launch-slow {
          0%   { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
          100% { transform: scale(1.12) translateY(-40px); opacity: 0; filter: blur(12px); }
        }

        .gold-text {
          background: linear-gradient(105deg,
            #B8922A 0%, #D4942A 15%, #E8C060 28%, #FAF0B0 40%, #FFFBE8 50%,
            #FAF0B0 60%, #E8C060 72%, #D4942A 85%, #B8922A 100%
          );
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gold-sweep 3.5s linear infinite;
        }
        .r1 { animation: reveal-up 1s cubic-bezier(.16,.8,.3,1.1) 0.1s both; }
        .r2 { animation: reveal-up 1s cubic-bezier(.16,.8,.3,1.1) 0.3s both; }
        .r3 { animation: reveal-up 1s cubic-bezier(.16,.8,.3,1.1) 0.5s both; }
        .r4 { animation: reveal-up 1s cubic-bezier(.16,.8,.3,1.1) 0.7s both; }
        .r5 { animation: reveal-up 1s cubic-bezier(.16,.8,.3,1.1) 0.9s both; }
        .line-left  { animation: line-grow 0.8s ease-out 0.6s both; transform-origin: right; }
        .line-right { animation: line-grow 0.8s ease-out 0.6s both; transform-origin: left; }
      `}</style>

      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(165deg,#050B03 0%,#0A1407 30%,#101C0C 60%,#050B03 100%)',
          animation: phase === 'charging' ? 'screen-shake 0.5s ease-in-out' : 'none',
        }}>

        {/* Confetti burst */}
        {(phase === 'confetti' || phase === 'burst' || phase === 'flash') && CONFETTI.map((c, i) => {
          const rad = (c.angle * Math.PI) / 180;
          const tx = Math.cos(rad) * c.speed;
          const ty = Math.sin(rad) * c.speed;
          const dur = 0.9 + c.delay / 200;
          const keyframeName = `cf${i}`;
          return (
            <div key={i} className="absolute pointer-events-none" style={{ top: '50%', left: '50%' }}>
              <style>{`
                @keyframes ${keyframeName} {
                  0%   { transform: translate(-50%,-50%) rotate(0deg) scale(1); opacity: 1; }
                  70%  { opacity: 0.85; }
                  100% { transform: translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) rotate(${c.rotation}deg) scale(0.4); opacity: 0; }
                }
              `}</style>
              <div style={{
                width: c.shape === 'strip' ? 3 : c.size,
                height: c.shape === 'strip' ? c.size * 2.5 : c.size,
                borderRadius: c.shape === 'circle' ? '50%' : '2px',
                background: c.color,
                animation: `${keyframeName} ${dur}s ${c.delay}ms ease-out forwards`,
              }} />
            </div>
          );
        })}

        {/* Shock rings */}
        {(phase === 'burst' || phase === 'flash') && (
          <>
            <div className="absolute pointer-events-none rounded-full"
              style={{ top: '50%', left: '50%', width: 160, height: 160,
                background: 'radial-gradient(circle, rgba(255,240,80,0.85) 0%, rgba(212,148,42,0.4) 50%, transparent 70%)',
                animation: 'shockwave-slow 0.6s ease-out forwards' }} />
            <div className="absolute pointer-events-none rounded-full"
              style={{ top: '50%', left: '50%', width: 160, height: 160,
                background: 'radial-gradient(circle, rgba(255,255,180,0.4) 0%, rgba(212,148,42,0.2) 60%, transparent 80%)',
                animation: 'shockwave-slow2 0.85s ease-out 0.08s forwards' }} />
            <div className="absolute pointer-events-none rounded-full"
              style={{ top: '50%', left: '50%', width: 80, height: 80,
                background: 'linear-gradient(135deg,rgba(255,240,120,1),rgba(212,148,42,1))',
                animation: 'burst-expand-slow 0.65s cubic-bezier(.2,0,.4,1) forwards' }} />
          </>
        )}

        {/* Gold flash */}
        {phase === 'flash' && (
          <div className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(135deg,rgba(255,240,100,0.97),rgba(212,148,42,0.99))',
              animation: 'flash-in-slow 0.6s ease-in forwards',
            }} />
        )}

        {/* Film grain */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.04,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: '160px' }} />

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0"
            style={{ animation: 'ambient 6s ease-in-out infinite',
              background: 'radial-gradient(ellipse 80% 55% at 50% 10%, rgba(212,148,42,1), transparent)' }} />
          <div className="absolute" style={{ bottom: '-15%', left: '-5%', width: 700, height: 700, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(90,122,58,0.06), transparent 65%)' }} />
        </div>

        {/* Floating background particles */}
        {PARTICLES.map((p, i) => (
          <div key={i} className="absolute bottom-0 pointer-events-none rounded-full"
            style={{ left: p.left, width: p.size, height: p.size,
              background: 'rgba(212,148,42,0.65)',
              animation: phase === 'charging' || phase === 'confetti'
                ? `float-up-fast ${0.5 + i * 0.06}s ${i * 0.03}s ease-in forwards`
                : `float-up ${p.dur} ${p.delay} ease-in infinite`,
              boxShadow: `0 0 ${p.size * 3}px rgba(212,148,42,0.5)` }} />
        ))}

        {/* Top shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.5) 30%,rgba(255,230,100,1) 50%,rgba(212,148,42,0.5) 70%,transparent)' }} />

        {/* Corner brackets */}
        {([
          { top: 20, left: 20,   d: 'M1 14V1h13' },
          { top: 20, right: 20,  d: 'M1 1h13v13' },
          { bottom: 20, left: 20,  d: 'M1 1v13h13' },
          { bottom: 20, right: 20, d: 'M14 1H1v13' },
        ] as Array<{ top?: number; bottom?: number; left?: number; right?: number; d: string }>).map((c, i) => (
          <div key={i} className="absolute pointer-events-none r1"
            style={{ top: c.top, bottom: c.bottom, left: c.left, right: c.right, opacity: 0.3 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d={c.d} stroke="#D4942A" strokeWidth="1.2" strokeLinecap="square"/>
            </svg>
          </div>
        ))}

        {/* ── Launch text overlay — one line at a time, typewriter ── */}
        {phase === 'confetti' && lineIdx >= 0 && lineIdx < LAUNCH_LINES.length && (
          <div className="absolute inset-0 z-[6] flex flex-col items-center justify-center pointer-events-none px-8">
            <div key={lineIdx} className="flex flex-col items-center gap-4 text-center"
              style={{ animation: 'line-in 0.45s ease-out forwards' }}>

              {/* Line number badge */}
              <div style={{
                fontFamily: 'monospace', fontSize: '0.65rem',
                color: 'rgba(74,222,128,0.55)', letterSpacing: '3px',
                animation: 'sub-in 0.3s ease-out forwards',
              }}>
                {`[ STEP ${lineIdx + 1} / ${LAUNCH_LINES.length} ]`}
              </div>

              {/* Typewriter main text */}
              <p className="font-display font-black leading-tight"
                style={{
                  fontSize: 'clamp(1.7rem,6.5vw,3rem)',
                  color: lineIdx === LAUNCH_LINES.length - 1 ? '#FFE060' : 'rgba(255,248,220,0.97)',
                  letterSpacing: '-0.02em',
                  minHeight: '1.2em',
                  animation: 'text-glow-pulse 2s ease-in-out infinite',
                }}>
                {typedText}
                {/* Blinking cursor */}
                {typedText.length < LAUNCH_LINES[lineIdx].text.length && (
                  <span style={{ animation: 'cursor-blink 0.6s step-end infinite', color: '#D4942A' }}>|</span>
                )}
                {/* Checkmark after typing done */}
                {subVisible && lineIdx < LAUNCH_LINES.length - 1 && (
                  <span style={{ marginLeft: 10, fontSize: '0.7em', color: 'rgba(74,222,128,0.9)', animation: 'checkmark-pop 0.35s ease-out forwards', display: 'inline-block' }}>✓</span>
                )}
              </p>

              {/* Sub text — appears after typing completes */}
              {subVisible && (
                <p style={{
                  fontFamily: 'monospace',
                  fontSize: 'clamp(0.68rem,1.8vw,0.85rem)',
                  color: 'rgba(74,222,128,0.75)',
                  letterSpacing: '0.08em',
                  textShadow: '0 0 14px rgba(74,222,128,0.35)',
                  animation: 'sub-in 0.4s ease-out forwards',
                }}>
                  {LAUNCH_LINES[lineIdx].sub}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="relative z-[5] flex flex-col items-center text-center px-6"
          style={{
            maxWidth: 540,
            animation: phase === 'confetti' || phase === 'burst' || phase === 'flash'
              ? 'content-launch-slow 0.6s ease-in forwards'
              : 'none',
          }}>

          {/* Logo */}
          <div className="r1 relative flex items-center justify-center mb-10"
            style={{ width: 130, height: 130 }}>
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1.5px solid rgba(212,148,42,0.45)', animation: 'ring-breathe 3s ease-in-out infinite' }} />
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(212,148,42,0.15)', transform: 'scale(1.22)', animation: 'ring-breathe2 4.5s ease-in-out infinite' }} />
            <div className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(212,148,42,0.05)', transform: 'scale(1.46)' }} />
            <Image src="/images/logo.png" alt="Crafted by Amma" width={100} height={100}
              className="relative rounded-full bg-white object-contain"
              style={{ border: '2px solid rgba(212,148,42,0.30)', animation: 'logo-glow 4s ease-in-out infinite' }} />
          </div>

          {/* Pre-label */}
          <div className="r2 flex items-center gap-4 mb-5">
            <div className="h-px w-14 line-left" style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.45))' }} />
            <span className="text-[0.58rem] font-bold tracking-[5px] uppercase" style={{ color: 'rgba(212,148,42,0.50)' }}>
              Est. Mysuru · Homemade
            </span>
            <div className="h-px w-14 line-right" style={{ background: 'linear-gradient(90deg,rgba(212,148,42,0.45),transparent)' }} />
          </div>

          {/* Brand */}
          <div className="r3 mb-1 overflow-hidden">
            <h1 className="font-display font-bold leading-none"
              style={{ fontSize: 'clamp(2.6rem,9vw,4.2rem)', color: 'rgba(235,225,200,0.97)', letterSpacing: '-0.02em' }}>
              Crafted by
            </h1>
          </div>
          <div className="r4 overflow-hidden mb-8">
            <h1 className="gold-text font-display font-black leading-none"
              style={{ fontSize: 'clamp(3.8rem,14vw,6.4rem)', letterSpacing: '-0.03em' }}>
              Amma
            </h1>
          </div>

          <p className="r4 text-sm leading-relaxed mb-10"
            style={{ color: 'rgba(235,225,200,0.30)', maxWidth: 360 }}>
            Homemade · Traditional · Nutritious<br />
            <span style={{ color: 'rgba(235,225,200,0.18)' }}>Pure millet products from Namma Mysuru</span>
          </p>

          {/* Button */}
          <button onClick={handleLaunch} disabled={phase !== 'idle'}
            className="r5 group relative overflow-hidden px-14 py-5 rounded-full font-black uppercase transition-all hover:scale-[1.05] active:scale-[.97]"
            style={{
              background: phase === 'charging' || phase === 'confetti'
                ? 'linear-gradient(135deg,#FFE060,#FFB820)'
                : 'linear-gradient(135deg,#D4942A,#B87323)',
              color: '#0D0800',
              letterSpacing: '0.25em',
              fontSize: '0.85rem',
              animation: phase === 'idle'
                ? 'btn-idle-pulse 2.5s ease-in-out 1.2s infinite'
                : phase === 'charging'
                ? 'btn-charge-glow 0.5s ease-in forwards'
                : 'none',
              boxShadow: phase === 'confetti'
                ? '0 0 80px 30px rgba(255,220,80,0.7), 0 0 160px 60px rgba(212,148,42,0.4)'
                : undefined,
              transition: 'background 0.3s ease, box-shadow 0.3s ease',
            }}>
            <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)' }} />
            <span className="relative flex items-center gap-3">
              {phase === 'charging' || phase === 'confetti' ? '🚀  Launching...' : (
                <>
                  Launch
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </span>
          </button>

          <p className="r5 font-kannada text-sm mt-8" style={{ color: 'rgba(235,225,200,0.08)' }}>
            ಅಮ್ಮನಿಂದ ಕರಕುಶಲ · ಮೈಸೂರು
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[1px]"
          style={{ background: 'linear-gradient(90deg,transparent,rgba(212,148,42,0.25) 50%,transparent)' }} />
      </div>
    </>
  );
}
