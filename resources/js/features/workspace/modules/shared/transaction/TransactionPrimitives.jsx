import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import Tooltip from '@/components/ui/Tooltip';


import { TRANSACTION_SECTION_TITLE_CLASS_NAME } from './transactionStyles';

export function buildCurrencyValue(value = '0') {
    let str = String(value);
    if (str.startsWith('Rp ')) {
        str = str.substring(3);
    } else if (str.startsWith('$ ')) {
        str = str.substring(2);
    }
    return str;
}

export function TransactionFieldLabel({ label, required = false, className = '', htmlFor }) {
    return (
        <label htmlFor={htmlFor} className={`whitespace-nowrap text-xs sm:text-sm text-brand-dark ${htmlFor ? 'cursor-pointer' : ''} ${className}`.trim()}>
            {label}
            {required ? <span className="text-tab-active-border-t"> *</span> : null}
        </label>
    );
}

export function TransactionSwitch({ checked, onChange }) {
    return (
        <Tooltip content="ON/OFF Penomoran Otomatis" portal>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`relative inline-flex h-[22px] w-[34px] items-center rounded-full transition ${
                    checked ? 'bg-blue-570' : 'bg-section-tab-neutral-border'
                }`.trim()}
            >
                <span
                    className={`inline-block h-[16px] w-[16px] rounded-full bg-white shadow transition ${
                        checked ? 'translate-x-[16px]' : 'translate-x-[3px]'
                    }`.trim()}
                />
            </button>
        </Tooltip>
    );
}

export function TransactionSectionRail({ tabs, activeTabId, onSelectTab }) {
    if (!tabs?.length) return null;

    return (
        <div className="flex shrink-0 flex-col self-start w-fit">
            {tabs.map((tab) => {
                const active = tab.id === activeTabId;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        aria-label={tab.label}
                        title={tab.label}
                        className={`relative inline-flex items-center justify-center border border-r-0 px-2 py-2.5 transition ${
                            active
                                ? 'z-10 -mr-px border-tab-overflow-panel-border border-l-[3px] border-l-tab-active-border-t bg-ui-bg-hover text-text-pink-active shadow-inset-light'
                                : 'border-tab-active-border-x bg-disabled-border text-tab-active-text hover:bg-tab-primary-inactive-hover-bg'
                        }`.trim()}
                    >
                        <NavigationIcon type={tab.icon} className="h-[22px] w-[22px] text-current" />
                    </button>
                );
            })}
        </div>
    );
}

export function TransactionSectionHeading({ title, icon }) {
    return (
        <div className="flex items-center gap-3 border-b border-ui-border-medium pb-1.5">
            <NavigationIcon type={icon} className="h-5 w-5 text-text-pink-active" />
            <h3 className={TRANSACTION_SECTION_TITLE_CLASS_NAME}>{title}</h3>
        </div>
    );
}

export function TransactionHeaderButton({ label, trailingChevron = false, className = '', ...props }) {
    return (
        <button
            type="button"
            className={`inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-xs sm:text-sm text-brand-blue-accent ${className}`.trim()}
            {...props}
        >
            <span>{label}</span>
            {trailingChevron ? <ChevronDownIcon className="h-4 w-4" /> : null}
        </button>
    );
}

export function TransactionReadonlyTextarea({ value, rows = 3, className = '', onChange, readOnly = true }) {
    return (
        <textarea
            value={value}
            readOnly={readOnly}
            onChange={onChange}
            rows={rows}
            className={`w-full resize-y rounded-[4px] border border-slate-400 px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none transition focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)] ${className}`.trim()}
        />
    );
}
