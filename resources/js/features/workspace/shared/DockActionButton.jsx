import Spinner from '@/components/ui/Spinner';

export default function DockActionButton({
    label,
    icon,
    tone = 'primary',
    className = '',
    onClick,
    disabled = false,
    loading = false,
}) {
    const isDisabled = disabled || loading;
    const isSaveButton = typeof label === 'string' && label.toLowerCase().includes('simpan');
    const resolvedTone = isSaveButton ? 'primary' : tone;

    let toneClassName = '';
    if (isDisabled) {
      // State dinonaktifkan

        toneClassName = 'border-disabled-border bg-tab-view-active-border-t text-disabled-border-t cursor-default opacity-55 shadow-none pointer-events-none';
    } else {
        if (resolvedTone === 'danger') {
            toneClassName = 'border-red-150 bg-red-100 text-red-450 hover:bg-red-150 active:bg-red-150 cursor-pointer';
        } else if (resolvedTone === 'muted') {
            toneClassName = 'border-disabled-border bg-tab-view-active-border-t text-disabled-border-t hover:bg-tab-view-active-border-t active:bg-tab-primary-inactive-hover-bg cursor-pointer';
        } else {
            toneClassName = 'border-brand-blue-darker bg-blue-570 text-white hover:bg-bg-import-action-hover active:bg-brand-blue-darker cursor-pointer';
        }
    }

    return (
        <button
            type="button"
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            aria-label={label}
            title={label}
            className={`inline-flex h-12 w-[84px] shrink-0 items-center justify-center rounded-[8px] border transition sm:h-[54px] sm:w-[92px] md:h-[60px] md:w-[104px] shadow-dock-action ${toneClassName} ${className}`.trim()}
        >
            {loading ? (
                <Spinner className="h-8 w-8 text-current animate-spin" />
            ) : (
                icon
            )}
        </button>
    );
}
