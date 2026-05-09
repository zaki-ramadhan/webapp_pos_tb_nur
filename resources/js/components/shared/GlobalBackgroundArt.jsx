export default function GlobalBackgroundArt() {
    return (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-[18%] top-[-16%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.48)_0%,rgba(255,255,255,0)_68%)] blur-3xl" />
            <div className="absolute right-[-10%] top-[6%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle_at_center,rgba(255,201,152,0.38)_0%,rgba(255,201,152,0)_72%)] blur-3xl" />
            <div className="absolute bottom-[-12%] left-[24%] h-[340px] w-[340px] rounded-full bg-[radial-gradient(circle_at_center,rgba(124,163,255,0.24)_0%,rgba(124,163,255,0)_72%)] blur-3xl" />
            <div className="absolute left-[8%] top-[14%] h-[220px] w-[220px] rotate-[-10deg] rounded-[38px] border border-white/20 bg-white/12 shadow-[0_24px_60px_rgba(15,23,42,0.08)]" />
            <div className="absolute right-[12%] top-[32%] h-[180px] w-[180px] rotate-[14deg] rounded-[30px] border border-white/18 bg-white/10 shadow-[0_18px_44px_rgba(15,23,42,0.08)]" />
            <div className="absolute bottom-[18%] right-[18%] h-[120px] w-[120px] rounded-full border border-white/22 bg-white/10 shadow-[0_10px_30px_rgba(15,23,42,0.08)]" />
        </div>
    );
}
