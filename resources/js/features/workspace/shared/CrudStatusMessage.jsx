export default function CrudStatusMessage({ status, className = 'mb-4' }) {
    if (!status?.message || status.tone !== 'error') {
        return null;
    }

    const toneClassName =
        status.tone === 'error'
            ? 'border-danger-border bg-surface text-red-850'
            : 'border-green-140 bg-success-bg text-green-910';

    return (
        <div className={`${className} rounded-[6px] border px-3 py-2 text-sm ${toneClassName}`.trim()}>
            {status.message}
        </div>
    );
}
