import { useMemo, useState } from 'react';

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
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import DockActionButton from '@/features/workspace/shared/DockActionButton';
import PanelActions from '@/features/workspace/shared/PanelActions';
import SectionTab from '@/features/workspace/shared/SectionTab';
import SecondaryTabs from '@/features/workspace/shared/SecondaryTabs';
import TableToolbar from '@/features/workspace/shared/TableToolbar';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CloseIcon,
    SaveIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

function AccountLookupField({ value, placeholder, disabled = false }) {
    return (
        <ChipLookupField
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            searchLabel="Cari akun beban"
            heightClassName="min-h-[38px]"
            className="rounded-[4px] border-[#cfd6e2]"
            contentClassName="px-3 py-1.5"
            chipClassName="text-[#24324a]"
        />
    );
}

function SalaryAllowanceForm({ config, entry, actions, editableDetail = false }) {
    const fields = config.fields;
    const isDetail = Boolean(entry.name) && entry.id !== config.newEntry.id;

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-[#f4f4f5] px-3 pb-3 pt-2">
            <SectionTab label={config.sectionLabel} />

            <div className="flex min-h-[598px] items-start rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                <div className="grid w-full content-start gap-x-7 gap-y-4 lg:grid-cols-[228px_minmax(0,640px)] lg:items-start">
                    <label className="pt-2 text-[18px] text-[#1f2436]">
                        {fields.nameLabel} <span className="text-[#ED3969]">*</span>
                    </label>
                    <TextInput
                        defaultValue={entry.name}
                        trailing={isDetail ? <CloseIcon className="h-4.5 w-4.5" /> : null}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[17px] text-[#1f2436]"
                    />

                    <div className="pt-2 text-[18px] text-[#1f2436]">{fields.typeLabel}</div>
                    {isDetail && !editableDetail ? (
                        <TextInput
                            value={entry.type}
                            readOnly
                            className="h-[40px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                            inputClassName="text-[17px] text-[#6a7286]"
                        />
                    ) : (
                        <SelectField
                            defaultValue={entry.type || config.typeOptions[0]}
                            className="h-[42px] rounded-[4px] border-[#7fb0ee] shadow-[0_0_0_3px_rgba(127,176,238,0.12)]"
                            selectClassName="text-[17px] text-[#1f2436]"
                        >
                            {config.typeOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </SelectField>
                    )}

                    <div className="pt-2 text-[18px] text-[#1f2436]">{fields.payDeductLabel}</div>
                    <TextInput
                        value={entry.payDeduct}
                        readOnly
                        className="h-[40px] max-w-[390px] rounded-[4px] border-[#cfd6e2] bg-[#f3f3f4]"
                        inputClassName="text-[17px] text-[#6a7286]"
                    />

                    <label className="pt-2 text-[18px] text-[#1f2436]">
                        {fields.expenseAccountLabel} <span className="text-[#ED3969]">*</span>
                    </label>
                    <AccountLookupField
                        value={entry.expenseAccount}
                        placeholder="Cari/Pilih Akun Perkiraan..."
                        disabled={isDetail}
                    />

                    {isDetail ? (
                        <>
                            <div className="pt-2 text-[18px] text-[#1f2436]">{fields.inactiveLabel}</div>
                            <label className="inline-flex h-[40px] items-center gap-3 text-[18px] text-[#1f2436]">
                                <input
                                    type="checkbox"
                                    defaultChecked={entry.inactive}
                                    className="h-6 w-6 rounded-[4px] border border-[#cfd6e2] text-[#2d61ab] focus:ring-[#2d61ab]"
                                />
                                <span>{fields.inactiveOptionLabel}</span>
                            </label>
                        </>
                    ) : null}
                </div>

                <div className="ml-5 flex w-[96px] shrink-0 flex-col gap-3">
                    {actions.map((action) => (
                        <DockActionButton
                            key={action.id}
                            label={action.label}
                            tone={action.tone === 'danger' ? 'danger' : 'primary'}
                            icon={action.icon === 'trash' ? <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" /> : <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function SalaryAllowanceTable({ config, rows, filters, setFilters, onCreate, onOpenDetail }) {
    const [keyword, setKeyword] = useState('');

    const filteredRows = useMemo(() => {
        return rows.filter((row) => {
            if (filters.type !== 'all') {
                const typeCategory = row.type === 'Gaji/Pensiun atau THT/JHT' ? 'salary' : 'allowance';

                if (typeCategory !== filters.type) {
                    return false;
                }
            }

            if (filters.inactive !== 'all') {
                const inactiveValue = row.inactive ? 'yes' : 'no';

                if (inactiveValue !== filters.inactive) {
                    return false;
                }
            }

            if (keyword.trim()) {
                const normalizedKeyword = keyword.trim().toLowerCase();

                return (
                    row.name.toLowerCase().includes(normalizedKeyword) ||
                    row.type.toLowerCase().includes(normalizedKeyword)
                );
            }

            return true;
        });
    }, [filters.inactive, filters.type, keyword, rows]);

    return (
        <div className="min-h-full rounded-[4px] border border-[#d3d9e5] bg-[#f4f4f5] px-3 pb-3 pt-3">
            <TableToolbar
                filters={config.table.filterOptions.map((filter) => (
                    <SelectField
                        key={filter.id}
                        value={filters[filter.id]}
                        onChange={(event) =>
                            setFilters((current) => ({
                                ...current,
                                [filter.id]: event.target.value,
                            }))
                        }
                        className="h-[40px] min-w-[222px] rounded-[4px] border-[#cfd6e2]"
                        selectClassName="text-[15px] text-[#394157]"
                    >
                        {filter.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </SelectField>
                ))}
                createButton={{
                    label: config.table.createLabel,
                    onClick: onCreate,
                }}
                refreshButton={{ label: config.table.refreshLabel }}
                printButton={{ label: config.table.printLabel }}
                search={{
                    value: keyword,
                    onChange: (event) => setKeyword(event.target.value),
                    placeholder: config.table.searchPlaceholder,
                }}
                pageValue={config.table.pageValue}
            />

            <div className="mt-4">
                <DataTable wrapperClassName="border-[#d1d8e4]">
                    <DataTableHeader className="bg-[#5f7690]">
                        <tr>
                            {config.table.columns.map((column) => (
                                <DataTableHead
                                    key={column}
                                    className="px-3 py-3 text-[16px] font-medium text-white"
                                >
                                    <span>{column}</span>
                                </DataTableHead>
                            ))}
                        </tr>
                    </DataTableHeader>

                    <DataTableBody>
                        {filteredRows.map((row, index) => (
                            <DataTableRow
                                key={row.id}
                                className={`cursor-pointer border-[#dde1e8] transition hover:bg-[#eef3fb] ${
                                    index % 2 === 1 ? 'bg-[#f1f1f2]' : 'bg-white'
                                }`.trim()}
                                onClick={() => onOpenDetail(row.id)}
                            >
                                <DataTableCell className="py-3 text-[17px]">
                                    {formatTableTextValue(row.name)}
                                </DataTableCell>
                                <DataTableCell className="py-3 text-[17px]">
                                    {formatTableTextValue(row.type)}
                                </DataTableCell>
                                <DataTableCell className="py-3 text-[17px]">
                                    {formatTableTextValue(row.inactiveLabel)}
                                </DataTableCell>
                            </DataTableRow>
                        ))}
                    </DataTableBody>
                </DataTable>
            </div>
        </div>
    );
}

export default function SalaryAllowanceView({ page }) {
    const config = page.salaryAllowance;
    const [isNewTabOpen, setIsNewTabOpen] = useState(true);
    const [activeInnerTabId, setActiveInnerTabId] = useState('new');
    const [openDetailTabIds, setOpenDetailTabIds] = useState([]);
    const [filters, setFilters] = useState(() =>
        config.table.filterOptions.reduce((result, filter) => {
            result[filter.id] = filter.defaultValue;
            return result;
        }, {}),
    );

    const rowMap = useMemo(
        () =>
            config.rows.reduce((result, row) => {
                result[row.id] = row;
                return result;
            }, {}),
        [config.rows],
    );

    const detailTabs = openDetailTabIds.map((id) => rowMap[id]).filter(Boolean);
    const innerTabs = [
        { id: 'view', kind: 'view', closable: false, label: 'View' },
        ...(isNewTabOpen ? [{ id: 'new', kind: 'content', closable: true, label: config.newTabLabel }] : []),
        ...detailTabs.map((row) => ({
            id: row.id,
            kind: 'content',
            closable: true,
            label: row.name,
        })),
    ];

    function handleOpenNewTab() {
        setIsNewTabOpen(true);
        setActiveInnerTabId('new');
    }

    function handleOpenDetail(tabId) {
        setOpenDetailTabIds((current) => (current.includes(tabId) ? current : [...current, tabId]));
        setActiveInnerTabId(tabId);
    }

    function handleCloseInnerTab(tabId) {
        if (tabId === 'new') {
            setIsNewTabOpen(false);
            setActiveInnerTabId('view');
            return;
        }

        setOpenDetailTabIds((current) => current.filter((id) => id !== tabId));

        if (activeInnerTabId === tabId) {
            setActiveInnerTabId(isNewTabOpen ? 'new' : 'view');
        }
    }

    const activeEntry =
        activeInnerTabId === 'new' ? config.newEntry : rowMap[activeInnerTabId] ?? config.newEntry;
    const isViewMode = activeInnerTabId === 'view';

    return (
        <div className="flex min-h-full flex-col">
            <div className="border-b border-[#d5d9e1] bg-[#f4f4f5] px-2 pt-1.5 sm:px-2.5">
                <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
                    <SecondaryTabs
                        tabs={innerTabs}
                        activeTabId={activeInnerTabId}
                        onSelectTab={setActiveInnerTabId}
                        onCloseTab={handleCloseInnerTab}
                        className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    />

                    <PanelActions actions={config.tipActions} />
                </div>
            </div>

            <div className="min-h-0 flex-1">
                {isViewMode ? (
                    <SalaryAllowanceTable
                        config={config}
                        rows={config.rows}
                        filters={filters}
                        setFilters={setFilters}
                        onCreate={handleOpenNewTab}
                        onOpenDetail={handleOpenDetail}
                    />
                ) : (
                    <SalaryAllowanceForm
                        key={activeInnerTabId}
                        config={config}
                        entry={activeEntry}
                        actions={activeInnerTabId === 'new' ? config.formActions : config.editActions}
                    />
                )}
            </div>
        </div>
    );
}
