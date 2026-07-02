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
        <div className={`grid gap-3 lg:grid-cols-[135px_minmax(0,1fr)] lg:items-start ${className}`.trim()}>
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
    return <h3 className="border-b border-ui-border-medium pb-1.5 text-base sm:text-lg font-normal text-input-brand">{title}</h3>;
}

import AddressStack from '@/features/workspace/shared/components/AddressStack';
export { AddressStack };

export function EmptyDataTable({ columns, emptyLabel }) {
    return (
        <DataTable wrapperClassName="border-table-wrapper-border">
            <DataTableHeader className="bg-table-header-bg">
                <tr>
                    {columns.map((column) => (
                        <DataTableHead
                            key={column.id}
                            className={`${column.widthClassName ?? ''} px-3 text-base font-normal text-white text-center`.trim()}
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
