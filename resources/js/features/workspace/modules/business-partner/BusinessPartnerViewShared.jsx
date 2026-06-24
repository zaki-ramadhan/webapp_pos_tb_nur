import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TextareaField from '@/components/ui/TextareaField';
import TableListView from '@/features/workspace/modules/TableListView';
import { TransactionSwitch } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import {
    CloseIcon,
    CogIcon,
    DownloadIcon,
    ExternalLinkIcon,
    PaperclipIcon,
    PlusIcon,
    PrintIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';
import CityAutocompleteInput from '@/features/workspace/shared/CityAutocompleteInput';

export function buildFormState(source = {}) {
    return Object.fromEntries(
        Object.entries(source).map(([key, value]) => [key, Array.isArray(value) ? [...value] : value]),
    );
}

export function FieldLabel({ label, required = false, className = '' }) {
    return (
        <label className={`text-xs sm:text-sm text-brand-dark ${className}`.trim()}>
            {label}
            {required ? <span className="text-tab-active-border-t"> *</span> : null}
        </label>
    );
}

export function FormFieldRow({ label, required = false, className = '', children }) {
    return (
        <div className={`grid gap-3 lg:grid-cols-[170px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
            <FieldLabel label={label} required={required} className="pt-2 lg:pt-1.5" />
            <div>{children}</div>
        </div>
    );
}

export function DockIcon({ icon }) {
    if (icon === 'attachment') {
        return <PaperclipIcon className="h-8 w-8" />;
    }

    if (icon === 'trash') {
        return <TrashIcon className="h-9 w-9" />;
    }

    return <SaveIcon className="h-9 w-9" />;
}

export function ToolbarIconAction({ icon, label }) {
    const renderedIcon =
        icon === 'download'
            ? <DownloadIcon className="h-4 w-4" />
            : icon === 'external-link'
              ? <ExternalLinkIcon className="h-4 w-4" />
              : icon === 'print'
                ? <PrintIcon className="h-4 w-4" />
                : <CogIcon className="h-4 w-4" />;

    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className="inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue"
        >
            {renderedIcon}
        </button>
    );
}

export function SectionHeading({ title }) {
    return <h3 className="border-b border-ui-border-medium pb-3 text-2xl font-normal text-input-brand">{title}</h3>;
}

export function AddressStack({ prefixValue, values, readOnly = false, onChange = null }) {
    const handleSelectCity = (item) => {
        onChange?.('city', item.city);
        onChange?.('province', item.province);
        onChange?.('postalCode', item.postalCode);
        onChange?.('country', item.country);
    };

    return (
        <div className="space-y-3">
            <TextareaField
                value={values.street}
                onChange={(event) => onChange?.('street', event.target.value)}
                readOnly={readOnly}
                rows={4}
                prefix={prefixValue}
                className="rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-input-prefix-text"
                textareaClassName="min-h-[112px] text-xs sm:text-sm text-brand-dark"
            />

            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                {readOnly ? (
                    <TextInput
                        value={values.city}
                        readOnly
                        prefix="Kota"
                        className="h-[40px] rounded-[4px] border-slate-400"
                        prefixClassName="min-w-[62px] bg-input-prefix-bg px-3 text-input-prefix-text"
                        inputClassName="text-xs sm:text-sm text-brand-dark"
                    />
                ) : (
                    <CityAutocompleteInput
                        value={values.city}
                        onChange={(nextValue) => onChange?.('city', nextValue)}
                        onSelectCity={handleSelectCity}
                        prefix="Kota"
                        prefixClassName="min-w-[62px] border-slate-400 bg-input-prefix-bg px-3 text-xs sm:text-sm text-input-prefix-text"
                        dropdownLeftOffsetClassName="left-[62px]"
                    />
                )}
                <TextInput
                    value={values.postalCode}
                    onChange={(event) => onChange?.('postalCode', event.target.value)}
                    readOnly={readOnly}
                    prefix="K.Pos"
                    className="h-[40px] rounded-[4px] border-slate-400"
                    prefixClassName="min-w-[62px] bg-input-prefix-bg px-3 text-input-prefix-text"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </div>

            <TextInput
                value={values.province}
                onChange={(event) => onChange?.('province', event.target.value)}
                readOnly={readOnly}
                prefix="Provinsi"
                className="h-[40px] rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-input-prefix-text"
                inputClassName="text-xs sm:text-sm text-brand-dark"
            />

            <TextInput
                value={values.country}
                onChange={(event) => onChange?.('country', event.target.value)}
                readOnly={readOnly}
                prefix="Negara"
                className="h-[40px] rounded-[4px] border-slate-400"
                prefixClassName="min-w-[92px] bg-input-prefix-bg px-3 text-input-prefix-text"
                inputClassName="text-xs sm:text-sm text-brand-dark"
            />
        </div>
    );
}

export function EmptyDataTable({ columns, emptyLabel }) {
    return (
        <DataTable wrapperClassName="border-table-wrapper-border">
            <DataTableHeader className="bg-table-header-bg">
                <tr>
                    {columns.map((column) => (
                        <DataTableHead
                            key={column.id}
                            className={`${column.widthClassName ?? ''} px-3 text-base font-medium text-white text-center`.trim()}
                        >
                            {column.label}
                        </DataTableHead>
                    ))}
                </tr>
            </DataTableHeader>

            <DataTableBody>
                <DataTableRow className="bg-white">
                    <DataTableCell colSpan={columns.length} className="px-3 py-3 text-center text-base text-text-workspace-dark">
                        {emptyLabel}
                    </DataTableCell>
                </DataTableRow>
            </DataTableBody>
        </DataTable>
    );
}

export function BusinessPartnerTableView({ config, onCreate, onOpenDetail }) {
    return (
        <TableListView
            table={config.table}
            createButton={{ label: config.table.createLabel, onClick: onCreate }}
            rightControls={[
                <ToolbarIconAction key="download" icon="download" label="Unduh" />,
                <ToolbarIconAction key="open" icon="external-link" label="Buka" />,
                <ToolbarIconAction key="print" icon="print" label="Cetak" />,
                <ToolbarIconAction key="settings" icon="settings" label="Pengaturan tabel" />,
            ]}
            menuButton={false}
            onRowClick={(row) =>
                onOpenDetail?.({
                    recordId: row.id,
                    label: row.name,
                    tabLabel: row.name.length > 16 ? `${row.name.slice(0, 13)}...` : row.name,
                })
            }
        />
    );
}

export {
    ChipLookupField,
    CloseIcon,
    PlusIcon,
    SelectField,
    TextInput,
    TransactionSwitch,
};
