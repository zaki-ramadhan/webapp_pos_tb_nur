import { useRef, useState } from 'react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import SelectField from '@/components/ui/SelectField';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { TransactionSwitch, TransactionToolbarSplitButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    CircleCheckIcon,
    DownloadIcon,
    RefreshIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
    ChevronDownIcon,
} from '@/features/workspace/shared/Icons';
import { showWarningToast, showSuccessToast } from '@/components/feedback/toast';
import { applyComputedTotals } from './salesDocumentFormShared';
import SalesDocumentCopyModal from './SalesDocumentCopyModal';
import { showSystemErrorModal } from '@/components/ui/SystemErrorModal';

export function SalesDocumentHeaderButtons({ config, values, setValues, isDetail, handlers, pageId }) {
    const secondaryActionLabel = values.secondaryHeaderActionLabel ?? config.secondaryActionLabel;
    const showSecondaryHeaderAction = Boolean(secondaryActionLabel) && (values.showSecondaryHeaderAction ?? config.showSecondaryHeaderAction ?? false);
    const showProcessButton = isDetail ? values.showProcessButton : (values.showProcessButtonOnCreate ?? config.showProcessButtonOnCreate ?? false);
    const showTakeButton = values.showHeaderTakeButton ?? config.showHeaderTakeButton ?? true;

    const takeRef = useRef(null);
    const [takeOpen, setTakeOpen] = useState(false);

    const processRef = useRef(null);
    const [processOpen, setProcessOpen] = useState(false);

    const [copyOption, setCopyOption] = useState(null);

    const handleTakeClick = (optionName) => {
        setTakeOpen(false);
        if (!values.__partnerId) {
            const partnerLabel = config.labels.customer || 'Pelanggan';
            const errorKey = config.labels.customer ? 'customer' : 'supplier';
            window.dispatchEvent(new CustomEvent('form-validation-error', {
                detail: {
                    [errorKey]: `${partnerLabel} harus diisi.`,
                    __partnerId: `${partnerLabel} harus diisi.`
                }
            }));
            showWarningToast({
                title: 'Perhatian',
                message: `${partnerLabel} harus diisi terlebih dahulu.`,
            });
            showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: `${partnerLabel} harus diisi.`,
                confirmLabel: 'OK',
            });
            return;
        }
        setCopyOption(optionName);
    };

    const handleProcessClick = (actionName) => {
        setProcessOpen(false);
        if (!values.__partnerId) {
            const partnerLabel = config.labels.customer || 'Pelanggan';
            const errorKey = config.labels.customer ? 'customer' : 'supplier';
            window.dispatchEvent(new CustomEvent('form-validation-error', {
                detail: {
                    [errorKey]: `${partnerLabel} harus diisi.`,
                    __partnerId: `${partnerLabel} harus diisi.`
                }
            }));
            showWarningToast({
                title: 'Perhatian',
                message: `${partnerLabel} harus diisi terlebih dahulu.`,
            });
            showSystemErrorModal({
                title: 'Terjadi Permasalahan pada Pemrosesan',
                description: 'Silakan perbaiki permasalahan berikut ini:',
                message: `${partnerLabel} harus diisi.`,
                confirmLabel: 'OK',
            });
            return;
        }

        if (actionName === 'Pembayaran') {
            if (handlers?.onProcessPembayaran) {
                handlers.onProcessPembayaran(values);
                return;
            }
        }

        showSuccessToast({
            title: 'Berhasil',
            message: `Memproses ${actionName} untuk dokumen ini.`,
        });
    };

    const handleApplyCopiedData = (copied) => {
        if (!setValues) return;
        setValues((current) => {
            const nextItems = [...(current.items ?? []), ...(copied.items ?? [])];
            const nextCosts = [...(current.additionalCosts ?? []), ...(copied.additionalCosts ?? [])];
            const nextAdvances = [...(current.advancePayments ?? []), ...(copied.advancePayments ?? [])];
            
            return applyComputedTotals({
                ...current,
                sourceDocId: copied.sourceDocId ?? current.sourceDocId ?? null,
                sourceDocType: copied.sourceDocType ?? current.sourceDocType ?? null,
                additionalCosts: nextCosts,
                advancePayments: nextAdvances,
            }, nextItems);
        });
        showSuccessToast({
            title: 'Berhasil',
            message: `Berhasil menyalin data dari ${copyOption}.`,
        });
    };

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {showTakeButton ? (
                <>
                    <button
                        ref={takeRef}
                        type="button"
                        onClick={() => setTakeOpen((o) => !o)}
                        className="inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-brand-blue-border bg-white px-4 text-sm text-brand-blue-accent"
                    >
                        <span>{config.takeButtonLabel}</span>
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${takeOpen ? 'rotate-180' : ''}`.trim()} />
                    </button>
                    <DropdownMenu open={takeOpen} onClose={() => setTakeOpen(false)} anchorRef={takeRef} widthClassName="w-[180px]">
                        <DropdownMenuItem onClick={() => handleTakeClick('Penawaran')}>Penawaran</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTakeClick('Pesanan')}>Pesanan</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTakeClick('Pengiriman')}>Pengiriman</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTakeClick('Pembelian')}>Pembelian</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTakeClick('Permintaan')}>Permintaan</DropdownMenuItem>
                    </DropdownMenu>
                </>
            ) : null}
            {showSecondaryHeaderAction ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-brand-blue-border bg-white px-4 text-sm text-brand-blue-accent"
                >
                    {secondaryActionLabel}
                </button>
            ) : null}
            {showProcessButton ? (
                <>
                    <button
                        ref={processRef}
                        type="button"
                        disabled={values.processDisabled}
                        onClick={() => {
                            if (!values.processDisabled) {
                                setProcessOpen((o) => !o);
                            }
                        }}
                        className={`inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border px-4 text-sm ${
                            values.processDisabled
                                ? 'border-tab-inactive-bg bg-tab-active-bg text-tab-inactive-border-l'
                                : 'border-brand-blue-border bg-white text-brand-blue-accent'
                        }`.trim()}
                    >
                        <span>{config.processButtonLabel}</span>
                        {!values.processDisabled ? <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${processOpen ? 'rotate-180' : ''}`.trim()} /> : null}
                    </button>
                    {!values.processDisabled ? (
                        <DropdownMenu open={processOpen} onClose={() => setProcessOpen(false)} anchorRef={processRef} widthClassName="w-[180px]">
                            <DropdownMenuItem onClick={() => handleProcessClick('Pembayaran')}>Pembayaran</DropdownMenuItem>
                        </DropdownMenu>
                    ) : null}
                </>
            ) : null}

            {copyOption && (
                <SalesDocumentCopyModal
                    open={Boolean(copyOption)}
                    onClose={() => setCopyOption(null)}
                    option={copyOption}
                    partnerId={values.__partnerId}
                    partnerField={config.labels.customer?.toLowerCase().includes('pemasok') || config.labels.customer?.toLowerCase().includes('supplier') ? 'supplier_id' : 'customer_id'}
                    onApply={handleApplyCopiedData}
                />
            )}
        </div>
    );
}

export function resolveSectionComponent(activeSectionId) {
    switch (activeSectionId) {
        case 'additional-info':
            return 'additional-info';
        case 'additional-costs':
            return 'additional-costs';
        case 'smartlink':
            return 'smartlink';
        case 'advance-payments':
            return 'advance-payments';
        case 'order-info':
            return 'order-info';
        default:
            return 'details';
    }
}

export function buildSectionProps(activeSectionId, config, values, setValues, isDetail, handlers) {
    if (activeSectionId === 'additional-info') {
        return { config, values, setValues, isDetail, handlers };
    }

    if (activeSectionId === 'additional-costs' || activeSectionId === 'advance-payments' || activeSectionId === 'order-info') {
        return { config, values, setValues, handlers };
    }

    if (activeSectionId === 'smartlink') {
        return {};
    }

    return {
        config: {
            ...config,
            onOpenItemModal: handlers.openItemModal,
        },
        values,
        setValues,
        isDetail,
        handlers,
    };
}

export function resolveInitialSectionId(config, isDetail) {
    const preferredSectionId = isDetail ? config.detailInitialSectionId : config.initialSectionId;

    if (preferredSectionId && config.sectionTabs?.some((tab) => tab.id === preferredSectionId)) {
        return preferredSectionId;
    }

    return config.sectionTabs?.[0]?.id ?? 'details';
}

export function SalesDocumentFilterBar({ config, filters, setFilters }) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {config.table.filters.map((filter) => (
                <SelectField
                    key={filter.id}
                    value={filters[filter.id]}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.id]: event.target.value }))}
                    containerClassName="w-auto"
                    className="h-[34px] rounded-[4px] border-ui-border"
                    selectClassName="px-3 text-xs sm:text-sm text-filter-select-text"
                    iconClassName="mr-2 text-filter-icon"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

        </div>
    );
}

export function buildSalesDocumentRightControls(config) {
    if (config.hideToolbarButtons) {
        return [];
    }

    return [
      // Hide print and download buttons

        /*
        config.table.downloadItems?.length ? (
            <TransactionToolbarSplitButton key="download" label="Unduh" icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
        ) : null,
        config.table.printItems?.length ? (
            <TransactionToolbarSplitButton key="print" label="Cetak" icon={<PrintIcon className="h-4 w-4" />} items={config.table.printItems} />
        ) : null,
        */
        config.table.settingsItems?.length ? (
            <TransactionToolbarSplitButton
                key="settings"
                label="Pengaturan tabel"
                icon={<NavigationIcon type="settings" className="h-4 w-4" />}
                items={config.table.settingsItems}
            />
        ) : null,
    ].filter(Boolean);
}

export function salesDocumentToolbarConfig(config, onCreate, keyword, setKeyword, filters, setFilters) {
    return {
        size: 'compact',
        className: 'space-y-3',
        filters: config.table.filters?.length ? <SalesDocumentFilterBar config={config} filters={filters} setFilters={setFilters} /> : null,
        createButton: {
            label: config.table.createLabel,
            onClick: onCreate,
            icon: <PlusIcon className="h-6 w-6" />,
        },
        refreshButton: {
            label: config.table.refreshLabel,
            icon: <RefreshIcon className="h-4.5 w-4.5" />,
            onClick: config.table.onRefresh,
            loading: Boolean(config.table.loading),
        },
        importButton: config.hideImportButton ? false : undefined,
        rightControls: buildSalesDocumentRightControls(config).length ? <>{buildSalesDocumentRightControls(config)}</> : null,
        search: {
            value: keyword,
            onChange: (event) => setKeyword(event.target.value),
            placeholder: config.table.searchPlaceholder,
            widthClassName: 'sm:w-[342px]',
            trailing: <SearchIcon className="h-5 w-5 text-text-darkest" />,
        },
        pageValue: config.table.pageValue,
    };
}

export function SalesDocumentStatusCell({ columnId, row, children }) {
    if (columnId === 'statusIcon') {
        return (
            <span className="inline-flex items-center justify-center text-green-730">
                <CircleCheckIcon className="h-5.5 w-5.5 text-green-730" />
            </span>
        );
    }

    return children;
}

export function SalesDocumentSortHeader({ column }) {
    return (
        <span
            className={`flex items-center gap-2 ${
                column.align === 'center'
                    ? 'justify-center'
                    : 'justify-start'
            }`.trim()}
        >
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}
