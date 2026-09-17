import { useState } from 'react';
import DocumentStamp from '@/components/ui/DocumentStamp';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { TransactionDualTotalCard } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { parseNumericInput } from '@/features/workspace/shared/transactionFormatters';
import TarifPajakModal from './TarifPajakModal';

export function buildDepositFormState(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
    );
}

export function ReadonlyTransactionTextarea({ value, rows = 3, className = '' }) {
    return (
        <textarea
            value={value}
            readOnly
            rows={rows}
            className={`w-full resize-y rounded-[4px] border border-ui-border px-4 py-3 text-xs sm:text-sm text-brand-dark outline-none ${className}`.trim()}
        />
    );
}

export function DepositStamp(props) {
    return <DocumentStamp {...props} />;
}

export function DepositStatusPill({ value }) {
    const toneClassName =
        value === 'Lunas'
            ? 'border-green-140 bg-success-bg text-text-badge-success-alt'
            : 'border-status-warning-badge-border bg-bg-badge-warning-alt text-status-warning-badge-text';

    return (
        <span className={`inline-flex rounded-[4px] border px-3 py-0.5 text-xs sm:text-sm font-semibold ${toneClassName}`.trim()}>
            {value}
        </span>
    );
}

export function DepositAmountField({ prefix = 'Rp', value, className = '' }) {
    return (
        <div className={`flex h-[34px] overflow-hidden rounded-[4px] border border-ui-border ${className}`.trim()}>
            <span className="inline-flex items-center bg-input-prefix-bg-compact px-3 text-base text-table-row-text">
                {prefix}
            </span>
            <span className="inline-flex flex-1 items-center justify-end px-3 text-lg font-semibold text-text-darkest">
                {value}
            </span>
            <span className="inline-flex w-10 items-center justify-center text-brand-dark">
                <NavigationIcon type="payment" className="h-4 w-4 text-current" />
            </span>
        </div>
    );
}

export function DepositFooterSummary({ items = [] }) {
    if (!items.length) {
        return null;
    }

    const gridTemplateClassName =
        items.length >= 4 ? 'md:grid-cols-4' : items.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2';

    return (
        <div className="flex justify-end">
            <div
                className={`grid w-full max-w-[866px] overflow-hidden rounded-[4px] border border-table-cell-border bg-white shadow-card-medium ${gridTemplateClassName}`.trim()}
            >
                {items.map((item, index) => (
                    <div
                        key={item.id ?? item.label}
                        className={`border-b border-ui-border-light px-4 py-3 last:border-b-0 md:border-b-0 md:px-5 ${
                            index < items.length - 1 ? 'md:border-r' : ''
                        }`.trim()}
                    >
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-dark">
                            <span>{item.label}</span>
                            {item.badge ? (
                                <span className="inline-flex rounded-[4px] border border-brand-blue-border-light px-1.5 py-0.5 text-xs text-brand-blue-accent">
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>
                        <div className="mt-2 text-right text-lg font-semibold text-text-darkest">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DepositLinkedRowsSection({ title, icon = 'payment', rows = [], emptyLabel = 'Belum ada data.' }) {
    return (
        <section>
            <div className="flex items-center gap-3 border-b border-ui-border-medium pb-3">
                <NavigationIcon type={icon} className="h-5 w-5 text-input-brand" />
                <h3 className="text-2xl font-normal text-input-brand">{title}</h3>
            </div>

            <div className="mt-4">
                {rows.length ? (
                    <div className="rounded-[4px] border border-ui-border-medium bg-white">
                        {rows.map((item, index) => (
                            <div
                                key={item.id}
                                className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-4 py-3 ${
                                    index > 0 ? 'border-t border-border-ui-border-lightest' : ''
                                }`.trim()}
                            >
                                <div>
                                    <div className="text-base font-semibold text-input-brand">{item.number}</div>
                                    <div className="mt-1 text-sm text-brand-dark">{item.date}</div>
                                </div>
                                <div className="text-right text-base font-semibold text-text-darkest">{item.amount}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-[4px] border border-dashed border-ui-border-medium px-4 py-6 text-base text-text-placeholder">
                        {emptyLabel}
                    </div>
                )}
            </div>
        </section>
    );
}

export function DepositDualTotalFooter({
    values,
    setValues,
    onUpdateTaxSettings,
    readOnly = false,
}) {
    const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);

    const items = [
        { label: 'Sub Total', value: values?.subtotal || '0' },
    ];

    if (values?.taxEnabled && values?.__taxId) {
        const rateLabel = values.taxRate !== undefined && values.taxRate !== null ? ` (${values.taxRate}%)` : '';
        items.push({
            label: `PPN${rateLabel}`,
            value: values.taxTotalFormatted || 'Rp 0',
            action: !readOnly ? (
                <button
                    type="button"
                    aria-label="Ubah tarif pajak"
                    onClick={() => setIsTaxModalOpen(true)}
                    className="h-5 w-5 inline-flex items-center justify-center rounded-[3px] border border-brand-blue-accent/30 bg-brand-blue-lightest text-brand-blue-accent hover:bg-brand-blue-accent hover:text-white transition text-xs font-semibold cursor-pointer"
                >
                    %
                </button>
            ) : null,
        });
    }

    if (values?.pphChecked && values?.pphAmount) {
        items.push({
            label: values.pphLabel || 'PPh 23',
            value: values.pphAmount,
        });
    }

    items.push({ label: 'Total', value: values?.total || '0' });

    const handleApplyTaxSettings = ({ dppPercent, dppFactor, taxRate }) => {
        if (onUpdateTaxSettings) {
            onUpdateTaxSettings({ dppPercent, dppFactor, taxRate });
        } else if (setValues) {
            setValues((current) => ({
                ...current,
                dppPercent,
                dppFactor,
                taxRate,
            }));
        }
    };

    return (
        <>
            <TransactionDualTotalCard items={items} />
            {values?.taxEnabled && (
                <TarifPajakModal
                    open={isTaxModalOpen}
                    onClose={() => setIsTaxModalOpen(false)}
                    baseAmount={parseNumericInput(values?.depositAmount || 0)}
                    taxIncluded={Boolean(values?.taxIncluded)}
                    currentDppPercent={values?.dppPercent ?? 100}
                    currentTaxRate={values?.taxRate ?? 11}
                    onApply={handleApplyTaxSettings}
                />
            )}
        </>
    );
}

