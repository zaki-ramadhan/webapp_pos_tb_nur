import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const TONE_CONFIG = {
    info:    { classes: 'border-info-border bg-info-bg text-info-text', Icon: Info },
    success: { classes: 'border-success-border bg-success-bg text-success-text', Icon: CheckCircle },
    warning: { classes: 'border-warning-border bg-warning-bg text-warning-text', Icon: AlertTriangle },
    danger:  { classes: 'border-danger-border bg-danger-bg text-danger-text', Icon: AlertCircle },
};

export default function Notice({ children, tone = 'info', className = '' }) {
    const { classes, Icon } = TONE_CONFIG[tone] ?? TONE_CONFIG.info;
    const isAlert = tone === 'danger' || tone === 'warning';

    return (
        <div
            role={isAlert ? 'alert' : undefined}
            className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 text-[14px] leading-6 ${classes} ${className}`.trim()}
        >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{children}</span>
        </div>
    );
}

