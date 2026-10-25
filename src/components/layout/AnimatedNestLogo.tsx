import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

interface AnimatedNestLogoProps {
  className?: string;
  onClick?: () => void;
  compact?: boolean;
}

interface TrailParticle {
  id: number;
  x: number;
  y: number;
  type: 'feather' | 'sparkle';
  color: string;
  size: number;
  driftX: number;
  initRot: number;
}

// Keyframe trajectory coordinates matching @keyframes real-bird-flight in index.css
const WAYPOINTS = [
  { t: 0.00, x: 0, y: 0 },
  { t: 0.03, x: -2, y: 3 },
  { t: 0.07, x: 12, y: -18 },
  { t: 0.16, x: 40, y: -35 },
  { t: 0.25, x: 72, y: -22 },
  { t: 0.35, x: 112, y: -36 },
  { t: 0.44, x: 154, y: -28 },
  { t: 0.51, x: 176, y: -10 },
  { t: 0.55, x: 168, y: 4 },
  { t: 0.65, x: 128, y: 16 },
  { t: 0.75, x: 72, y: 14 },
  { t: 0.85, x: 26, y: 4 },
  { t: 0.92, x: 8, y: -10 },
  { t: 0.96, x: 2, y: -2 },
  { t: 1.00, x: 0, y: 0 },
];

const getBirdPosition = (progress: number) => {
  const clamped = Math.max(0, Math.min(1, progress));
  for (let i = 0; i < WAYPOINTS.length - 1; i++) {
    const p1 = WAYPOINTS[i];
    const p2 = WAYPOINTS[i + 1];
    if (clamped >= p1.t && clamped <= p2.t) {
      const segT = (clamped - p1.t) / (p2.t - p1.t);
      return {
        x: p1.x + (p2.x - p1.x) * segT,
        y: p1.y + (p2.y - p1.y) * segT,
      };
    }
  }
  return { x: 0, y: 0 };
};

// SVG components for feather and sparkle particles
const FeatherParticle: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    style={{ width: `${size}px`, height: `${size}px` }}
    className="filter drop-shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
  >
    <path
      d="M20.2 3.8C16.5 4.5 12 7.2 9.5 11.5C8.2 13.8 7.5 16.5 6.5 20.5C8 18.5 9.8 17.2 11.5 16.5C14.8 15 18.2 11.5 20.2 3.8Z"
      fill={color}
    />
    <path
      d="M20.2 3.8C15 9 10 14.5 5 21"
      stroke={color}
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.9"
    />
    <path
      d="M13 11L10 10.5M15 8.5L12 8"
      stroke="#ffffff"
      strokeWidth="0.6"
      strokeLinecap="round"
      opacity="0.75"
    />
  </svg>
);

const SparkleParticle: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    style={{ width: `${size}px`, height: `${size}px` }}
    className="filter drop-shadow-[0_0_4px_currentColor]"
  >
    <path
      d="M12 0L14.2 8.8L23 12L14.2 15.2L12 24L9.8 15.2L1 12L9.8 8.8Z"
      fill={color}
    />
    <circle cx="12" cy="12" r="2.2" fill="#ffffff" />
  </svg>
);

export const AnimatedNestLogo: React.FC<AnimatedNestLogoProps> = ({
  className = '',
  onClick,
  compact = false,
}) => {
  const [isFlying, setIsFlying] = useState(false);
  const [flightKey, setFlightKey] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);
  const [nestAction, setNestAction] = useState<'idle' | 'shake' | 'land'>('idle');
  const [nestShakeKey, setNestShakeKey] = useState(0);
  const [particles, setParticles] = useState<TrailParticle[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const particleIdRef = useRef(1);

  const launchFlight = useCallback(() => {
    if (isFlying) return;
    setIsFlying(true);
    setShowSparkles(true);
    setFlightKey((prev) => prev + 1);

    // Trigger physical nest shake right as bird crouches and leaps (~80ms into takeoff)
    setTimeout(() => {
      setNestAction('shake');
      setNestShakeKey((prev) => prev + 1);
    }, 80);

    // Conclude takeoff recoil after 720ms
    setTimeout(() => {
      setNestAction((current) => (current === 'shake' ? 'idle' : current));
    }, 720);

    // Cushioning compression on touchdown (~4100ms)
    setTimeout(() => {
      setNestAction('land');
    }, 4150);

    setTimeout(() => {
      setNestAction((current) => (current === 'land' ? 'idle' : current));
    }, 4550);

    // Full flight cycle takes 4.58s - bird returns snugly into nest
    setTimeout(() => {
      setIsFlying(false);
      setShowSparkles(false);
      setNestAction('idle');
    }, 4580);
  }, [isFlying]);

  // Periodic gentle loop every 8 to 12 seconds
  useEffect(() => {
    const scheduleNextFlight = () => {
      const delay = Math.floor(Math.random() * 4000) + 8000; // 8s to 12s
      timerRef.current = setTimeout(() => {
        launchFlight();
        scheduleNextFlight();
      }, delay);
    };

    scheduleNextFlight();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [launchFlight]);

  // Dynamic particle trail emitter during flight
  useEffect(() => {
    if (!isFlying) {
      const cleanupTimer = setTimeout(() => {
        setParticles([]);
      }, 1000);
      return () => clearTimeout(cleanupTimer);
    }

    const startTime = Date.now();
    const flightDuration = 4580; // ms

    const emitterInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / flightDuration;

      // Only emit while airborne between takeoff (5%) and landing (94%)
      if (progress < 0.05 || progress > 0.94) return;

      const pos = getBirdPosition(progress);
      if (!pos) return;

      const isFacingLeft = progress >= 0.53;
      // Tail coordinate offset relative to bird anchor
      const tailBaseX = isFacingLeft ? pos.x + 16 : pos.x - 3;
      const tailBaseY = pos.y + 6;

      const isFeather = Math.random() < 0.42;
      const featherColors = ['#7dd3fc', '#bae6fd', '#ffffff', '#38bdf8', '#fef08a'];
      const sparkleColors = ['#fde047', '#facc15', '#67e8f9', '#a5f3fc', '#ffffff'];

      const color = isFeather
        ? featherColors[Math.floor(Math.random() * featherColors.length)]
        : sparkleColors[Math.floor(Math.random() * sparkleColors.length)];

      const newParticle: TrailParticle = {
        id: particleIdRef.current++,
        x: tailBaseX + (Math.random() * 4 - 2),
        y: tailBaseY + (Math.random() * 4 - 2),
        type: isFeather ? 'feather' : 'sparkle',
        color,
        size: isFeather ? Math.floor(Math.random() * 3) + 10 : Math.floor(Math.random() * 4) + 8,
        driftX: (Math.random() - 0.5) * 10,
        initRot: Math.floor(Math.random() * 60) - 30,
      };

      setParticles((prev) => [...prev.slice(-16), newParticle]);
    }, 110);

    return () => {
      clearInterval(emitterInterval);
    };
  }, [isFlying]);

  const handleMouseEnter = () => {
    if (!isFlying) {
      launchFlight();
    }
  };

  return (
    <Link
      to="/"
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      className={`relative inline-flex items-center group cursor-pointer select-none ${className}`}
      title="NestTube – জীবন্ত পাখির উড়াল দেখতে হোভার বা ক্লিক করুন!"
    >
      {/* Outer wrapper with overflow-visible to permit majestic flight arcs */}
      <div className="relative overflow-visible flex items-center">
        {/* Base NestTube 3D Artwork (100% Transparent Background) with realistic nest takeoff shake */}
        <div
          key={`nest-base-${nestShakeKey}`}
          className={`relative ${compact ? 'h-7 sm:h-8' : 'h-8 sm:h-9 md:h-10'} flex items-center bg-transparent ${
            nestAction === 'shake'
              ? 'animate-nest-shake'
              : nestAction === 'land'
              ? 'animate-nest-land'
              : ''
          }`}
          style={{ willChange: 'transform' }}
        >
          {/* 
            DYNAMIC NEST STATE:
            1. When bird is flying away: Nest is visibly EMPTY (showing empty nest with white eggs)
            2. When bird returns and sits: Nest has the resting bird inside snugly
          */}
          <div className="relative h-full w-auto">
            {/* Empty nest logo image (shown when bird takes off and flies) */}
            <img
              src="/assets/aistudio/logo_empty_nest.png"
              alt="NestTube Empty Nest"
              className={`h-full w-auto object-contain bg-transparent transition-opacity duration-200 ${
                isFlying ? 'opacity-100' : 'opacity-0'
              }`}
            />
            {/* Occupied nest with resting bird (shown when bird is in the nest) */}
            <img
              src="/assets/aistudio/Gemini_Generated_Image_wmzkkfwmzkkfwmzk__1_-removebg-preview_2f76d2c5.png"
              alt="NestTube"
              className={`absolute inset-0 h-full w-auto object-contain bg-transparent transition-opacity duration-200 ${
                isFlying ? 'opacity-0 pointer-events-none' : 'opacity-100'
              }`}
            />
          </div>
        </div>

        {/* 
          Dynamic Trailing Particle Field (Feathers & Sparkles)
          Rendered behind the flying bird in the wake of its flight trajectory
        */}
        {isFlying && (
          <div
            className={`absolute pointer-events-none z-20 ${
              compact ? 'left-[10px] top-[4px]' : 'left-[12px] sm:left-[14px] top-[6px]'
            }`}
          >
            {particles.map((p) => (
              <div
                key={`nest-particle-${p.id}`}
                className={`absolute top-0 left-0 ${
                  p.type === 'feather' ? 'animate-feather-drift' : 'animate-sparkle-trail'
                }`}
                style={{
                  transform: `translate(${p.x}px, ${p.y}px)`,
                  ['--init-rot' as any]: `${p.initRot}deg`,
                  ['--drift-x' as any]: `${p.driftX}px`,
                }}
              >
                {p.type === 'feather' ? (
                  <FeatherParticle color={p.color} size={p.size} />
                ) : (
                  <SparkleParticle color={p.color} size={p.size} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 
          Realistic Flying Bird Entity:
          Appears exclusively during flight (taking off from the nest, vacating it completely,
          flying majestically with flapping wings and particles, then landing right back in the nest).
        */}
        {isFlying && (
          <div
            key={`flight-bird-${flightKey}`}
            className={`absolute pointer-events-none z-30 transition-all duration-200 ${
              compact ? 'left-[10px] top-[4px]' : 'left-[12px] sm:left-[14px] top-[6px]'
            }`}
          >
            <div
              className="animate-real-bird-flight"
              style={{ willChange: 'transform' }}
            >
              {/* Detailed Songbird SVG with multi-layer wing & tail articulation matching the logo's blue bird */}
              <div className="relative w-5 h-5 sm:w-6 sm:h-6 -translate-y-1">
                <svg
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.45)]"
                >
                  <defs>
                    {/* Feathers lighting & gradient */}
                    <linearGradient id="birdBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7dd3fc" />
                      <stop offset="35%" stopColor="#38bdf8" />
                      <stop offset="80%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </linearGradient>

                    <linearGradient id="birdBellyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="60%" stopColor="#e0f2fe" />
                      <stop offset="100%" stopColor="#bae6fd" />
                    </linearGradient>

                    <linearGradient id="primaryWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="50%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#075985" />
                    </linearGradient>

                    <linearGradient id="backWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#0284c7" />
                      <stop offset="100%" stopColor="#0c4a6e" />
                    </linearGradient>

                    <linearGradient id="beakRealisticGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="45%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                  </defs>

                  {/* 1. Background Wing (Behind body for authentic 3D depth) */}
                  <g className="animate-real-wing-back">
                    <path
                      d="M18 24 C14 16, 22 12, 30 18 C33 22, 28 30, 20 28 Z"
                      fill="url(#backWingGrad)"
                      opacity="0.9"
                    />
                  </g>

                  {/* 2. Tail Feathers with Aerodynamic Rudder Flaps */}
                  <g className="animate-real-tail">
                    <path
                      d="M10 40 C6 46, 2 52, 0 55 C6 52, 12 48, 16 44 Z"
                      fill="#0369a1"
                    />
                    <path
                      d="M13 36 C7 42, 3 47, 2 51 C8 48, 15 44, 18 39 Z"
                      fill="#0284c7"
                    />
                    <path
                      d="M15 34 C10 38, 7 43, 6 46 C11 44, 17 41, 19 36 Z"
                      fill="#38bdf8"
                    />
                  </g>

                  {/* 3. Main Chubby Bird Body */}
                  <ellipse
                    cx="32"
                    cy="34"
                    rx="18"
                    ry="15.5"
                    fill="url(#birdBodyGrad)"
                  />

                  {/* 4. Head and Expressive Silhouette */}
                  <circle
                    cx="42"
                    cy="22"
                    r="13.5"
                    fill="url(#birdBodyGrad)"
                  />

                  {/* Feathered Crown / Tuft */}
                  <path
                    d="M42 9 C44 4, 48 3, 50 6 C48 9, 46 11, 44 12 Z"
                    fill="#38bdf8"
                  />
                  <path
                    d="M40 10 C38 6, 35 4, 37 3 C39 5, 41 8, 41 10 Z"
                    fill="#0284c7"
                  />

                  {/* 5. Soft White/Cream Belly and Chest Patch */}
                  <ellipse
                    cx="37"
                    cy="38"
                    rx="11.5"
                    ry="10"
                    fill="url(#birdBellyGrad)"
                  />

                  {/* 6. Big Realistic Cartoon Eye */}
                  <circle cx="46" cy="19" r="5" fill="#090d16" />
                  {/* Eye Catchlights (Double reflections for life & emotion) */}
                  <circle cx="47.6" cy="17.4" r="2.2" fill="#ffffff" />
                  <circle cx="44.6" cy="20.6" r="1.1" fill="#ffffff" />

                  {/* 7. Cute Golden Open Beak */}
                  <path
                    d="M52 20.5 L63 24.5 L52 28.5 Z"
                    fill="url(#beakRealisticGrad)"
                  />
                  <path
                    d="M53 24.5 L61 24.5"
                    stroke="#b45309"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                  />

                  {/* 8. Foreground Primary Wing Layer with Flapping */}
                  <g className="animate-real-wing-front">
                    <path
                      d="M24 30 C19 21, 28 17, 36 23 C39 28, 33 38, 24 38 C21 36, 20 34, 24 30 Z"
                      fill="url(#primaryWingGrad)"
                      stroke="#0284c7"
                      strokeWidth="0.8"
                    />
                    {/* Realistic Primary Flight Feather Strands */}
                    <path
                      d="M26 31 C22 25, 27 22, 33 26"
                      stroke="#e0f2fe"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M24 34 C21 30, 25 27, 30 30"
                      stroke="#7dd3fc"
                      strokeWidth="1.1"
                      strokeLinecap="round"
                    />
                  </g>
                </svg>

                {/* Natural Wind Wake Accent */}
                {showSparkles && (
                  <div className="absolute -top-1 -left-2 flex items-center gap-1 pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-ping opacity-80" />
                    <span className="w-1 h-1 rounded-full bg-amber-300 animate-pulse delay-75 opacity-90" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};
