export default function GlobalBackgroundArt() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[18%] top-[-16%] h-[420px] w-[420px] rounded-full bg-bg-art-glow-white blur-3xl" />
            <div className="absolute right-[-10%] top-[6%] h-[360px] w-[360px] rounded-full bg-bg-art-glow-orange blur-3xl" />
            <div className="absolute bottom-[-12%] left-[24%] h-[340px] w-[340px] rounded-full bg-bg-art-glow-blue blur-3xl" />
            <div className="absolute left-[8%] top-[14%] h-[220px] w-[220px] rotate-[-10deg] rounded-[38px] border border-white/20 bg-white/12 shadow-bg-glow-large" />
            <div className="absolute right-[12%] top-[32%] h-[180px] w-[180px] rotate-[14deg] rounded-[30px] border border-white/18 bg-white/10 shadow-bg-glow-medium" />
            <div className="absolute bottom-[18%] right-[18%] h-[120px] w-[120px] rounded-full border border-white/22 bg-white/10 shadow-bg-glow-small" />
        </div>
    );
}
