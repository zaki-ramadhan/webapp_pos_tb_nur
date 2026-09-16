import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ExportIcon, ExternalLinkIcon, LinkIcon, RefreshIcon, DownloadIcon, SearchIcon, LoadingIcon } from '@/features/workspace/shared/Icons';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
import { HighlightText } from '@/features/workspace/shared/LookupPrimitives';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';
import ToolbarIconButton from '@/features/workspace/shared/toolbar/ToolbarIconButton';
import ToolbarExportSplitButton from '@/features/workspace/shared/toolbar/ToolbarExportSplitButton';

export function buildInitialValues(config) {
    return (config.controls ?? []).reduce((result, control) => {
        result[control.id] = control.value ?? '';
        return result;
    }, {});
}

export function InquiryIconButton({ icon, label, onClick, loading = false }) {
    const IconComponent =
        icon === 'export' || icon === 'export-excel'
            ? ExportIcon
            : icon === 'external-link'
            ? ExternalLinkIcon
            : icon === 'refresh'
            ? RefreshIcon
            : icon === 'download'
            ? DownloadIcon
            : LinkIcon;

    return (
        <ToolbarIconButton
            label={label}
            onClick={onClick}
            disabled={loading}
            className={`inline-flex shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue transition hover:bg-brand-blue-light h-[40px] w-[40px] ${loading ? 'pointer-events-none opacity-70' : ''}`.trim()}
        >
            <IconComponent className={`h-4 w-4 ${loading && icon === 'refresh' ? 'animate-spin' : ''}`.trim()} />
        </ToolbarIconButton>
    );
}

export function InquiryTextButton({ label, tone = 'default', onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex h-[40px] items-center justify-center rounded-[4px] border px-3 sm:px-4 text-xs sm:text-sm transition cursor-pointer hover:bg-brand-blue-light active:bg-brand-blue-border/20 ${
                tone === 'primary'
                    ? 'border-brand-blue-border bg-bg-brand-blue-toggled text-brand-blue'
                    : 'border-brand-blue-border bg-white text-brand-blue'
            }`.trim()}
        >
            {label}
        </button>
    );
}

export function InquiryControl({
    control,
    value,
    onChange,
    onRefresh,
    exportConfig,
    suppliers = [],
    warehouses = [],
    products = [],
    onLookupSelect,
    onLookupClear,
    searching = false,
    loading = false,
    onButtonClick,
}) {
    if (control.type === 'select') {
        return (
            <SelectField
                value={value}
                onChange={(event) => onChange(control.id, event.target.value)}
                containerClassName="w-auto shrink-0"
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                selectClassName="text-xs sm:text-sm text-brand-dark"
            >
                {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </SelectField>
        );
    }

    if (control.type === 'date') {
        return (
            <TransactionDateInput
                commitOnClose
                value={value}
                onChange={(nextValue) => {
                    const val = typeof nextValue === 'string' ? nextValue : nextValue?.target?.value;
                    onChange(control.id, val ?? '');
                }}
                className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
                inputClassName="text-xs sm:text-sm text-brand-dark"
                trailingClassName="w-[42px] shrink-0 justify-center px-0"
            />
        );
    }

    if (control.type === 'icon-button') {
        if (control.id === 'export-excel') {
            return (
                <ToolbarExportSplitButton
                    exportConfig={exportConfig}
                    sizeStyle={{ utilityButton: 'h-[40px] w-[40px]' }}
                />
            );
        }
        return <InquiryIconButton icon={control.icon} label={control.label} onClick={control.id === 'refresh' ? onRefresh : undefined} loading={loading} />;
    }

    if (control.type === 'button') {
        return <InquiryTextButton label={control.label} tone={control.tone} onClick={() => onButtonClick?.(control.id)} />;
    }

    if (control.type === 'lookup') {
        if (control.id === 'supplierSearch') {
            return (
                <AccountLookupTextInput
                    id="supplierSearch"
                    resource="suppliers"
                    value={value}
                    placeholder={control.placeholder ?? 'Cari/Pilih Pemasok...'}
                    searchLabel="Cari pemasok"
                    heightClassName="h-[40px]"
                    loading={loading || searching}
                    onChange={(e) => {
                        onChange?.('supplierSearch', e?.target?.value ?? '');
                    }}
                    onSelectAccount={(record, label) => {
                        if (record) {
                            onLookupSelect?.('supplierSearch', { id: record.id, label, name: record.name, code: record.code });
                        } else {
                            onLookupClear?.('supplierSearch');
                        }
                    }}
                    className={`h-[40px] ${control.className ?? 'w-full sm:w-[240px]'}`.trim()}
                />
            );
        }

        const isProductSearch = control.id === 'itemSearch';
        const lookupItems =
            control.id === 'warehouseSearch'
                ? warehouses
                : isProductSearch
                ? products
                : [];

        const renderProductOption = (option, query) => {
            const name = option?.name ?? option?.label ?? '';
            const code = option?.code ?? option?.item_code ?? '';
            const barcode = option?.barcode ?? option?.upc ?? '';

            return (
                <div className="flex w-full min-w-0 flex-col gap-0.5 select-none text-text-workspace-dark">
                    <div className="truncate text-xs sm:text-sm font-normal">
                        <HighlightText text={name} search={query} />
                    </div>
                    <div className="flex items-center justify-between gap-4 w-full text-xs sm:text-[13px]">
                        <span className="truncate min-w-0 font-normal not-italic">
                            {code ? <HighlightText text={code} search={query} /> : '-'}
                        </span>
                        {barcode ? (
                            <span className="shrink-0 italic font-normal">
                                <HighlightText text={barcode} search={query} />
                            </span>
                        ) : null}
                    </div>
                </div>
            );
        };

        return (
            <ReferenceLookupInput
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                items={lookupItems}
                searching={searching || loading}
                getOptionLabel={(option) => option?.name ?? option?.label ?? ''}
                getOptionSearchText={
                    isProductSearch
                        ? (option) => {
                              const name = option?.name ?? option?.label ?? '';
                              const code = option?.code ?? option?.item_code ?? '';
                              const barcode = option?.barcode ?? option?.upc ?? '';
                              return `${name} ${code} ${barcode}`.trim();
                          }
                        : (option) => option?.name ?? option?.label ?? ''
                }
                renderOption={isProductSearch ? renderProductOption : null}
                onSelect={(option) => onLookupSelect(control.id, option)}
                onClear={() => onLookupClear(control.id)}
                className={control.className ?? (isProductSearch ? 'w-full sm:w-[360px] md:w-[400px]' : 'w-full sm:w-[240px]')}
                menuClassName={isProductSearch ? 'min-w-full sm:min-w-[400px] md:min-w-[460px]' : ''}
            />
        );
    }

    return (
        <TextInput
            value={value}
            onChange={(event) => onChange(control.id, event.target.value)}
            placeholder={control.placeholder ?? 'Cari...'}
            containerClassName="w-full sm:w-[240px]"
            className={`h-[40px] rounded-[4px] border-ui-border ${control.className ?? ''}`.trim()}
            inputClassName="text-xs sm:text-sm text-brand-dark"
            leadingIcon={<SearchIcon className="h-4 w-4 text-brand-gray-muted" />}
            trailing={loading ? <LoadingIcon className="h-4 w-4 animate-spin text-brand-dark" /> : null}
        />
    );
}
