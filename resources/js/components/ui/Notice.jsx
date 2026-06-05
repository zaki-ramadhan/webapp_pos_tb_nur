import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

const TONE_CONFIG = {
    info:    { classes: 'border-[#c8ddff] bg-[#eef5ff] text-[#45608f]', Icon: Info },
    success: { classes: 'border-[#cfe8da] bg-[#edf9f2] text-[#3e7454]', Icon: CheckCircle },
    warning: { classes: 'border-[#f7e0b8] bg-[#fff7e8] text-[#8b6533]', Icon: AlertTriangle },
    danger:  { classes: 'border-[#f7c6d2] bg-[#fff1f5] text-[#9a4f66]', Icon: AlertCircle },
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

