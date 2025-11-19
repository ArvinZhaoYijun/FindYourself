const PARTICLES = [
  { top: "8%", left: "18%", size: 6, opacity: 0.15 },
  { top: "18%", left: "65%", size: 4, opacity: 0.12 },
  { top: "28%", left: "42%", size: 5, opacity: 0.18 },
  { top: "38%", left: "78%", size: 3, opacity: 0.1 },
  { top: "46%", left: "25%", size: 4, opacity: 0.12 },
  { top: "58%", left: "54%", size: 5, opacity: 0.16 },
  { top: "64%", left: "12%", size: 3, opacity: 0.1 },
  { top: "72%", left: "72%", size: 4, opacity: 0.12 },
  { top: "82%", left: "38%", size: 5, opacity: 0.15 },
  { top: "88%", left: "60%", size: 3, opacity: 0.12 },
  { top: "32%", left: "10%", size: 4, opacity: 0.12 },
  { top: "12%", left: "82%", size: 5, opacity: 0.15 },
];

export function FindMeLandingBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(25,255,199,0.14),_transparent_55%),radial-gradient(circle_at_75%_18%,_rgba(155,79,255,0.18),_transparent_60%),linear-gradient(180deg,#020308_0%,#05060a_30%,#080a12_55%,#0b0c10_75%,#121417_100%)]" />
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
          backgroundSize: "120px 120px",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(0,174,239,0.4), transparent 50%), radial-gradient(circle at 80% 30%, rgba(155,79,255,0.35), transparent 55%)",
        }}
      />
      <div className="absolute inset-0">
        {PARTICLES.map((particle, index) => (
          <div
            key={`particle-${index}`}
            className="absolute rounded-full bg-white"
            style={{
              top: particle.top,
              left: particle.left,
              opacity: particle.opacity,
              width: particle.size,
              height: particle.size,
              boxShadow: `0 0 35px rgba(255,255,255,${particle.opacity})`,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#19FFC7]/20 blur-[140px]" />
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-[#9B4FFF]/25 blur-[160px]" />
        <div className="absolute bottom-[-20%] left-1/3 h-[420px] w-[420px] rounded-full bg-[#00AEEF]/10 blur-[200px]" />
      </div>
    </div>
  );
}
