import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';

import { ChevronDownIcon } from '@/features/workspace/shared/Icons';
import Tooltip from '@/components/ui/Tooltip';

import { TRANSACTION_SECTION_TITLE_CLASS_NAME } from './transactionStyles';

export function buildCurrencyValue(value = '0') {
    return String(value).startsWith('Rp ') || String(value).startsWith('$ ') ? String(value) : `Rp ${value}`;
}

export function TransactionFieldLabel({ label, required = false, className = '', htmlFor }) {
    return (
        <label htmlFor={htmlFor} className={`text-xs sm:text-sm text-[#1f2436] ${htmlFor ? 'cursor-pointer' : ''} ${className}`.trim()}>
            {label}
            {required ? <span className="text-[#ED3969]"> *</span> : null}
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
                    checked ? 'bg-[#376eb1]' : 'bg-[#c7cfdd]'
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
                                ? 'border-[#f08bb0] bg-white text-[#ff2d7a]'
                                : 'border-[#bfc6d3] bg-[#f3f4f6] text-[#454d61]'
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
        <div className="flex items-center gap-3 border-b border-[#d8dde7] pb-3">
            <NavigationIcon type={icon} className="h-5 w-5 text-[#ff2d7a]" />
            <h3 className={TRANSACTION_SECTION_TITLE_CLASS_NAME}>{title}</h3>
        </div>
    );
}

export function TransactionHeaderButton({ label, trailingChevron = false, className = '', ...props }) {
    return (
        <button
            type="button"
            className={`inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-xs sm:text-sm text-[#21539b] ${className}`.trim()}
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
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}
