export default function CrudStatusMessage({ status, className = 'mb-4' }) {
    if (!status?.message) {
        return null;
    }

    const toneClassName =
        status.tone === 'error'
            ? 'border-red-f0c4c4 bg-surface text-red-a33939'
            : 'border-green-c8dfc9 bg-success-bg text-green-2e6b34';

    return (
        <div className={`${className} rounded-[6px] border px-3 py-2 text-sm ${toneClassName}`.trim()}>
            {status.message}
        </div>
    );
}
