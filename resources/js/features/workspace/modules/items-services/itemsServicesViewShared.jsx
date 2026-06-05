import TextInput from '@/components/ui/TextInput';
import FormattedAmountInput from '@/features/workspace/shared/FormattedAmountInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import Tooltip from '@/components/ui/Tooltip';
import {
    CloseIcon,
    InfoIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import { buildItemsServicesRecord } from '@/features/workspace/modules/items-services/itemsServicesConfig';


function cloneList(values) {
    return Array.isArray(values) ? [...values] : values ? [values] : [];
}

function cloneAccounts(accounts = {}) {
    return Object.fromEntries(
        Object.entries(accounts).map(([key, values]) => [key, cloneList(values)]),
    );
}

export function buildItemsServicesFormValues(config, detailRow = null) {
    const source = detailRow ? buildItemsServicesRecord(detailRow, config) : config.createDefaults;

    return {
        ...source,
        category: cloneList(source.category),
        primaryUnit: cloneList(source.primaryUnit),
        brand: cloneList(source.brand),
        mainSupplier: cloneList(source.mainSupplier),
        purchaseUnit: cloneList(source.purchaseUnit),
        taxReference: cloneList(source.taxReference),
        ppn: cloneList(source.ppn),
        pph: cloneList(source.pph),
        accounts: cloneAccounts(source.accounts),
        unitConversions: (source.unitConversions ?? []).map((item, index) => ({
            id: item.id ?? `conversion-${index + 1}`,
            unit: cloneList(item.unit),
            quantity: item.quantity ?? '',
            baseUnit: item.baseUnit ?? source.primaryUnit?.[0] ?? 'PCS',
        })),
        openingStockRows: [...(source.openingStockRows ?? [])],
        images: [...(source.images ?? [])],
        attachments: [...(source.attachments ?? [])],
    };
}

export function renderItemsServicesDockIcon(icon) {
    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

function getFormRowTooltip(label) {
    const cleanLabel = String(label || '').trim().replace(/:$/, '');
    const map = {
        'Pemasok Utama': 'Pemasok utama untuk memesan barang/jasa ini.',
        'Harga Beli': 'Harga beli default/terakhir dari pemasok.',
        'Ref Kode Pajak': 'Referensi kode perpajakan yang digunakan untuk barang/jasa ini.',
    };
    return map[cleanLabel] || `Informasi tentang ${cleanLabel}`;
}

export function FormRow({
    label,
    required = false,
    info = false,
    children,
    className = '',
    contentClassName = '',
}) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <label className="pt-2 text-[17px] leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
                {info ? (
                    <Tooltip content={typeof info === 'string' ? info : getFormRowTooltip(label)} portal>
                        <InfoIcon className="ml-1 inline-flex h-4.5 w-4.5 align-[-2px] text-[#394157] cursor-help" />
                    </Tooltip>
                ) : null}
            </label>
            <div className={contentClassName}>{children}</div>
        </div>
    );
}


export function SectionHeading({ title }) {
    return (
        <div className="border-b border-[#dbe1ea] pb-2">
            <h3 className="text-[22px] font-normal text-[#1564d7]">{title}</h3>
        </div>
    );
}

export function DetailActionButton({ label }) {
    return (
        <button
            type="button"
            className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#b7beca] bg-[#d3d3d4] px-3.5 text-[15px] text-[#5a6278]"
        >
            {label}
        </button>
    );
}

export function ClearableTextInput({
    value,
    onChange,
    placeholder = '',
    className = '',
    trailing = null,
}) {
    return (
        <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            inputClassName="text-[15px] text-[#1f2436]"
            trailing={
                trailing ??
                (value ? (
                    <button
                        type="button"
                        onClick={() => onChange({ target: { value: '' } })}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#111827] transition hover:bg-[#eef2f7]"
                        aria-label="Kosongkan isian"
                    >
                        <CloseIcon className="h-4 w-4" strokeWidth={2.4} />
                    </button>
                ) : null)
            }
            trailingClassName={value || trailing ? 'pr-2' : ''}
        />
    );
}

export function SimpleTextField({
    value,
    onChange,
    placeholder = '',
    className = '',
    prefix = null,
    trailing = null,
    inputClassName = '',
    formatAsAmount = false,
}) {
    const InputComponent = formatAsAmount ? FormattedAmountInput : TextInput;

    return (
        <InputComponent
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            prefix={prefix}
            trailing={trailing}
            className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
            prefixClassName={prefix ? 'min-w-[32px] border-r-[#d8dde7] bg-[#f3f3f4] px-3 text-[15px] text-[#9aa3b1]' : ''}
            inputClassName={`text-[15px] text-[#1f2436] ${inputClassName}`.trim()}
            trailingClassName={trailing ? 'px-3' : ''}
        />
    );
}

export function LookupField({
    values,
    placeholder,
    searchLabel,
    onRemove,
    className = '',
    heightClassName = 'h-[40px]',
    disabled = false,
}) {
    return (
        <ChipLookupField
            values={values}
            placeholder={placeholder}
            searchLabel={searchLabel}
            onRemove={onRemove}
            className={className}
            heightClassName={heightClassName}
            disabled={disabled}
        />
    );
}

export function CodeFieldRow({ values, onChange, isDetail }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[260px_48px_minmax(0,1fr)] lg:items-center">
            <label className="text-[17px] leading-6 text-[#1f2436]">
                Kode Barang <span className="text-[#ED3969]">*</span>
            </label>
            {!isDetail ? (
                <div className="pt-1 lg:pt-0">
                    <TransactionSwitch
                        checked={values.codeAuto}
                        onChange={(nextValue) => onChange('codeAuto', nextValue)}
                    />
                </div>
            ) : (
                <div />
            )}
            <ClearableTextInput
                value={values.code}
                onChange={(event) => onChange('code', event.target.value)}
            />
        </div>
    );
}
