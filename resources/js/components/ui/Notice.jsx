import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';

const TONE_CONFIG = {
    info:    { classes: 'border-info-border bg-info-bg text-info-text', Icon: Info },
    success: { classes: 'border-success-border bg-success-bg text-success-text', Icon: CheckCircle },
    warning: { classes: 'border-warning-border bg-warning-bg text-warning-text', Icon: (props) => <img src="/assets/images/pop-up-confirm-icon.svg" alt="Warning" {...props} /> },
    danger:  { classes: 'border-danger-border bg-danger-bg text-danger-text', Icon: (props) => <img src="/assets/images/pop-up-warning-icon.svg" alt="Danger" {...props} /> },
};

export default function Notice({ children, tone = 'info', className = '', onClose = null }) {
    const [visible, setVisible] = useState(true);
    const { classes, Icon } = TONE_CONFIG[tone] ?? TONE_CONFIG.info;
    const isAlert = tone === 'danger' || tone === 'warning';

    useEffect(() => {
        setVisible(true);
    }, [children, tone]);

    if (!visible) return null;

    return (
        <div
            role={isAlert ? 'alert' : undefined}
            className={`flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm leading-6 relative ${classes} ${className}`.trim()}
        >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="flex-1 pr-6">{children}</span>
            <button
                type="button"
                onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                }}
                className="absolute right-3 top-3 text-current opacity-50 hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
                aria-label="Tutup"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

