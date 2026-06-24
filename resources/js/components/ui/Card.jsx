export default function Card({ children, className = '' }) {
    return (
        <section
            className={`overflow-hidden rounded-[10px] border border-slate-200 bg-white shadow-card-primary ${className}`.trim()}
        >
            {children}
        </section>
    );
}
