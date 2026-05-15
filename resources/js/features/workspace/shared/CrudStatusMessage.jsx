export default function CrudStatusMessage({ status, className = 'mb-4' }) {
    if (!status?.message) {
        return null;
    }

    const toneClassName =
        status.tone === 'error'
            ? 'border-[#f0c4c4] bg-[#fff6f6] text-[#a33939]'
            : 'border-[#c8dfc9] bg-[#f3fff4] text-[#2e6b34]';

    return (
        <div className={`${className} rounded-[6px] border px-3 py-2 text-[14px] ${toneClassName}`.trim()}>
            {status.message}
        </div>
    );
}
