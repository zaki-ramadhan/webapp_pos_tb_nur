import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import Tooltip from '@/components/ui/Tooltip';

import { TRANSACTION_SECTION_TITLE_CLASS_NAME } from './transactionStyles';

export function buildCurrencyValue(value = '0') {
    return String(value).startsWith('Rp ') || String(value).startsWith('$ ') ? String(value) : `Rp ${value}`;
}

export function TransactionFieldLabel({ label, required = false, className = '', htmlFor }) {
    return (
        <label htmlFor={htmlFor} className={`text-xs sm:text-sm text-brand-dark ${htmlFor ? 'cursor-pointer' : ''} ${className}`.trim()}>
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
                    checked ? 'bg-blue-3f68b2' : 'bg-section-tab-neutral-border'
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
    return (
        <div className="flex shrink-0 flex-row flex-wrap gap-1.5 lg:flex-col">
            {tabs.map((tab) => {
                const active = tab.id === activeTabId;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => onSelectTab(tab.id)}
                        aria-label={tab.label}
                        title={tab.label}
                        className={`inline-flex h-[36px] w-[36px] items-center justify-center rounded-[4px] border ${
                            active
                                ? 'border-purple-f08bb0 bg-white text-text-pink-active'
                                : 'border-tab-inactive-border-t bg-ui-bg-panel text-blue-434a65'
                        }`.trim()}
                    >
                        <NavigationIcon type={tab.icon} className="h-5 w-5 text-current" />
                    </button>
                );
            })}
        </div>
    );
}

export function TransactionSectionHeading({ title, icon }) {
    return (
        <div className="flex items-center gap-3 border-b border-ui-border-medium pb-3">
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

export function TransactionReadonlyTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-none rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}
