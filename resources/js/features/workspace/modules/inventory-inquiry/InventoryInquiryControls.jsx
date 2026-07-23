import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import { TransactionDateInput } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { ExternalLinkIcon, LinkIcon, RefreshIcon, DownloadIcon, SearchIcon } from '@/features/workspace/shared/Icons';
import ReferenceLookupInput from '@/features/workspace/shared/ReferenceLookupInput';
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
        icon === 'external-link'
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
            className={`inline-flex h-[40px] items-center justify-center rounded-[4px] border px-3 sm:px-4 text-xs sm:text-sm ${
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
                value={value}
                onChange={(nextValue) => onChange(control.id, nextValue)}
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
        const lookupItems =
            control.id === 'supplierSearch'
                ? suppliers
                : control.id === 'warehouseSearch'
                ? warehouses
                : control.id === 'itemSearch'
                ? products
                : [];

        return (
            <ReferenceLookupInput
                value={value}
                placeholder={control.placeholder ?? 'Cari/Pilih...'}
                items={lookupItems}
                searching={searching}
                getOptionLabel={(option) => option?.name ?? option?.label ?? ''}
                onSelect={(option) => onLookupSelect(control.id, option)}
                onClear={() => onLookupClear(control.id)}
                className={control.className ?? 'w-full sm:w-[240px]'}
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
        />
    );
}
