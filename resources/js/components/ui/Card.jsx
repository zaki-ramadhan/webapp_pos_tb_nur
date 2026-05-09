export default function Card({ children, className = '' }) {
    return (
        <section
            className={`overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-[0_8px_20px_rgba(15,23,42,0.08)] ${className}`.trim()}
        >
            {children}
        </section>
    );
}
