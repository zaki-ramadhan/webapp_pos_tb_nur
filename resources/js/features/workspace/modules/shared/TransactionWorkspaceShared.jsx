import { useEffect, useRef, useState } from 'react';

import {
    DataTable,
    DataTableBody,
    DataTableCell,
    DataTableHead,
    DataTableHeader,
    DataTableRow,
} from '@/components/ui/DataTable';
import DropdownMenu from '@/components/ui/DropdownMenu';
import DropdownMenuItem from '@/components/ui/DropdownMenuItem';
import TextInput from '@/components/ui/TextInput';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import formatTableTextValue from '@/features/workspace/shared/formatTableTextValue';
import {
    CalendarIcon,
    CircleCheckIcon,
    ChevronDownIcon,
    DownloadIcon,
    KebabIcon,
    PaperclipIcon,
    SaveIcon,
    SearchIcon,
    TrashIcon,
} from '@/features/workspace/shared/Icons';

const TRANSACTION_SECTION_TITLE_CLASS_NAME = 'text-[18px] font-normal text-[#1564d7] sm:text-[19px] xl:text-[21px] 2xl:text-[22px]';
const TRANSACTION_LINE_TITLE_CLASS_NAME = 'text-right text-[18px] font-normal text-[#1f2436] sm:text-[20px] xl:text-[22px] 2xl:text-[24px]';

export function buildCurrencyValue(value = '0') {
    return String(value).startsWith('Rp ') || String(value).startsWith('$ ') ? String(value) : `Rp ${value}`;
}

export function TransactionFieldLabel({ label, required = false, className = '' }) {
    return (
        <label className={`text-[15px] text-[#1f2436] sm:text-[16px] lg:text-[17px] ${className}`.trim()}>
            {label}
            {required ? <span className="text-[#ED3969]"> *</span> : null}
        </label>
    );
}

export function TransactionSwitch({ checked, onChange }) {
    return (
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
    );
}

function normalizeDateValue(value) {
    const normalizedValue = String(value ?? '').trim();

    if (!normalizedValue) {
        return '';
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        return normalizedValue;
    }

    const dateParts = normalizedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);

    if (!dateParts) {
        return '';
    }

    const [, day, month, year] = dateParts;

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

function formatDateValue(value) {
    const normalizedValue = normalizeDateValue(value);

    if (!normalizedValue) {
        return String(value ?? '');
    }

    const [year, month, day] = normalizedValue.split('-');

    return `${day}/${month}/${year}`;
}

export function TransactionDateInput({
    value,
    onChange,
    className = 'w-full max-w-full sm:max-w-[238px]',
    inputClassName = 'text-[15px] text-[#1f2436]',
    trailingClassName = 'w-[42px] shrink-0 justify-center px-0',
    disabled = false,
    ariaLabel = 'Pilih tanggal',
    ...inputProps
}) {
    const [displayValue, setDisplayValue] = useState(() => formatDateValue(value));
    const [nativeValue, setNativeValue] = useState(() => normalizeDateValue(value));

    useEffect(() => {
        setDisplayValue(formatDateValue(value));
        setNativeValue(normalizeDateValue(value));
    }, [value]);

    function handleChange(event) {
        const nextNativeValue = event.target.value;
        const nextDisplayValue = formatDateValue(nextNativeValue);

        setDisplayValue(nextDisplayValue);
        setNativeValue(nextNativeValue);
        onChange?.(nextDisplayValue, nextNativeValue);
    }

    return (
        <div className={`relative ${className}`.trim()}>
            <TextInput
                value={displayValue}
                readOnly
                disabled={disabled}
                trailing={<CalendarIcon className="h-4 w-4 -translate-x-px text-[#1f2436]" />}
                className={`h-[40px] rounded-[4px] border-[#cfd6e2] ${className}`.trim()}
                inputClassName={`cursor-pointer ${inputClassName}`.trim()}
                trailingClassName={`pointer-events-none ${trailingClassName}`.trim()}
            />
            <input
                type="date"
                value={nativeValue}
                onChange={handleChange}
                disabled={disabled}
                aria-label={ariaLabel}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
                {...inputProps}
            />
        </div>
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

export function TransactionHeaderButton({ label, trailingChevron = false, className = '' }) {
    return (
        <button
            type="button"
            className={`inline-flex h-[34px] items-center justify-center gap-1 rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-[15px] text-[#21539b] ${className}`.trim()}
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
            className={`w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-[15px] text-[#1f2436] outline-none ${className}`.trim()}
        />
    );
}

export function resolveTransactionAlignClassName(align) {
    if (align === 'right') {
        return 'text-right';
    }

    if (align === 'center') {
        return 'text-center';
    }

    return 'text-left';
}

export function TransactionDataTable({
    columns,
    rows,
    emptyLabel,
    minWidthClassName = 'min-w-[760px]',
    renderHeaderCell = null,
    renderCell = null,
    emptyLeadingCellContent = null,
    onRowClick = null,
    getRowClassName = null,
}) {
    const hasLeadingEmptyCell = columns[0]?.kind === 'spacer' && emptyLeadingCellContent !== null;

    return (
        <div className={minWidthClassName}>
            <DataTable wrapperClassName="border-[#d1d8e4]">
                <DataTableHeader className="bg-[#5f7690]">
                    <tr>
                        {columns.map((column) => (
                            <DataTableHead
                                key={column.id}
                                className={`${column.widthClassName ?? ''} px-3 text-[16px] font-medium text-white ${resolveTransactionAlignClassName(column.align)}`.trim()}
                            >
                                {renderHeaderCell ? renderHeaderCell(column) : column.label}
                            </DataTableHead>
                        ))}
                    </tr>
                </DataTableHeader>

                <DataTableBody>
                    {rows.length ? (
                        rows.map((row, index) => {
                            const customRowClassName = getRowClassName?.(row, index) ?? '';
                            const clickable = typeof onRowClick === 'function';

                            return (
                                <DataTableRow
                                    key={row.id}
                                    className={`border-[#dde1e8] ${index % 2 === 1 ? 'bg-[#f3f3f4]' : 'bg-white'} ${customRowClassName}`.trim()}
                                    onClick={clickable ? () => onRowClick(row, index) : undefined}
                                >
                                    {columns.map((column) => (
                                        <DataTableCell
                                            key={column.id}
                                            className={`px-3 text-[15px] text-[#131a28] ${resolveTransactionAlignClassName(column.align)}`.trim()}
                                        >
                                            {renderCell
                                                ? renderCell({
                                                      row,
                                                      column,
                                                      index,
                                                  })
                                                : formatTableTextValue(row[column.id])}
                                        </DataTableCell>
                                    ))}
                                </DataTableRow>
                            );
                        })
                    ) : (
                        <DataTableRow className="bg-white">
                            {hasLeadingEmptyCell ? (
                                <DataTableCell className="px-3 text-center text-[#a8afbe]">
                                    {emptyLeadingCellContent}
                                </DataTableCell>
                            ) : null}
                            <DataTableCell
                                colSpan={columns.length - (hasLeadingEmptyCell ? 1 : 0)}
                                className="px-3 py-3 text-center text-[15px] text-[#131a28]"
                            >
                                {emptyLabel}
                            </DataTableCell>
                        </DataTableRow>
                    )}
                </DataTableBody>
            </DataTable>
        </div>
    );
}

export function TransactionLineItemsSection({
    searchValue,
    onSearchChange,
    searchPlaceholder,
    title,
    columns,
    rows,
    emptyLabel,
    minWidthClassName = 'min-w-[760px]',
    titleRequired = true,
    showTitleSearchButton = false,
    searchReadOnly = false,
    spacerHeaderContent = null,
    spacerCellContent = null,
    emptyLeadingCellContent = null,
}) {
    const hasRows = rows.length > 0;

    return (
        <div className={`flex flex-col ${hasRows ? 'min-h-[540px]' : 'min-h-[240px]'}`.trim()}>
            <div className="flex flex-col gap-3 border-b border-[#d8dde7] pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1 sm:max-w-[560px]">
                    <TextInput
                        value={searchValue}
                        onChange={onSearchChange}
                        readOnly={searchReadOnly}
                        placeholder={searchPlaceholder}
                        trailing={<SearchIcon className="h-5 w-5 text-[#1f2436]" />}
                        className="h-[40px] rounded-[4px] border-[#cfd6e2]"
                        inputClassName="text-[15px] text-[#1f2436]"
                    />
                </div>

                <div className="flex items-center justify-end gap-3">
                    {showTitleSearchButton ? (
                        <button
                            type="button"
                            className="inline-flex h-[40px] w-[40px] items-center justify-center rounded-[4px] border border-[#cfd6e2] bg-white text-[#21539b]"
                            aria-label={`Cari ${title}`}
                        >
                            <SearchIcon className="h-5 w-5" />
                        </button>
                    ) : null}
                    <div className={TRANSACTION_LINE_TITLE_CLASS_NAME}>
                        {title}
                        {titleRequired ? <span className="text-[#ED3969]"> *</span> : null}
                    </div>
                </div>
            </div>

            <div className={`mt-4 overflow-x-auto ${hasRows ? 'min-h-0 flex-1' : ''}`.trim()}>
                <TransactionDataTable
                    columns={columns}
                    rows={rows}
                    emptyLabel={emptyLabel}
                    minWidthClassName={minWidthClassName}
                    emptyLeadingCellContent={emptyLeadingCellContent}
                    renderHeaderCell={(column) => (column.kind === 'spacer' ? spacerHeaderContent : column.label)}
                    renderCell={({ row, column }) =>
                        column.kind === 'spacer' ? spacerCellContent : formatTableTextValue(row[column.id])
                    }
                />
            </div>
        </div>
    );
}

function resolveDockToneClassName(tone) {
    switch (tone) {
        case 'muted':
            return 'border-[#d3d7df] bg-[#e8e8e9] text-[#a7abb4] shadow-[0_5px_10px_rgba(15,23,42,0.08)]';
        case 'blue':
        case 'secondary':
            return 'border-[#4d94dd] bg-[#8fc0ef] text-[#0d4e96] shadow-[0_5px_10px_rgba(20,75,138,0.16)]';
        case 'success':
            return 'border-[#69cf7e] bg-[#9de29b] text-[#0b7b34] shadow-[0_5px_10px_rgba(27,104,53,0.14)]';
        case 'danger':
            return 'border-[#f08f92] bg-[#ffb2b5] text-[#e54854] shadow-[0_5px_10px_rgba(135,43,52,0.12)]';
        case 'primary':
        default:
            return 'border-[#214d8d] bg-[#0f62b8] text-white shadow-[0_5px_10px_rgba(24,53,97,0.18)]';
    }
}

function resolveDockDividerClassName(tone) {
    switch (tone) {
        case 'blue':
        case 'secondary':
            return 'border-l-[#5a9bdd]';
        case 'success':
            return 'border-l-[#6bc57c]';
        case 'muted':
            return 'border-l-[#d0d4db]';
        case 'danger':
            return 'border-l-[#f39ca0]';
        case 'primary':
        default:
            return 'border-l-[#1a4f95]';
    }
}

function TransactionDockIcon({ icon }) {
    switch (icon) {
        case 'form':
            return <NavigationIcon type="form" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'document':
            return <NavigationIcon type="document" className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'paperclip':
            return <PaperclipIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'kebab':
            return <KebabIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'check':
            return <CircleCheckIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'trash':
            return <TrashIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'download':
            return <DownloadIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
        case 'save':
        default:
            return <SaveIcon className="h-7 w-7 sm:h-8 sm:w-8" />;
    }
}

function TransactionDockButton({ action }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);
    const hasMenu = Boolean(action.items?.length);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                aria-label={action.label}
                title={action.label}
                onClick={() => {
                    if (hasMenu) {
                        setOpen((current) => !current);
                    }
                }}
                className={`inline-flex h-[48px] w-[78px] shrink-0 overflow-hidden rounded-[8px] border sm:h-[52px] sm:w-[88px] lg:h-[56px] lg:w-[96px] ${resolveDockToneClassName(action.tone)}`.trim()}
            >
                <span className="inline-flex flex-1 items-center justify-center">
                    <TransactionDockIcon icon={action.icon} />
                </span>
                {hasMenu ? (
                    <span
                        className={`inline-flex w-[28px] items-center justify-center border-l sm:w-[32px] lg:w-[36px] ${resolveDockDividerClassName(action.tone)}`.trim()}
                    >
                        <ChevronDownIcon className="h-5 w-5" />
                    </span>
                ) : null}
            </button>

            {hasMenu ? (
                <DropdownMenu
                    open={open}
                    onClose={() => setOpen(false)}
                    anchorRef={buttonRef}
                    widthClassName="w-[200px]"
                >
                    <div className="flex flex-col">
                        {action.items.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onClick={() => {
                                    item.onClick?.();
                                    setOpen(false);
                                }}
                            >
                                {item.label}
                            </DropdownMenuItem>
                        ))}
                    </div>
                </DropdownMenu>
            ) : null}
        </div>
    );
}

export function TransactionDock({ actions = [] }) {
    if (!actions.length) {
        return null;
    }

    return (
        <div className="flex w-full justify-stretch lg:justify-start">
            <div className="flex w-full flex-row gap-2 overflow-x-auto pb-1 sm:gap-3 lg:w-auto lg:flex-col lg:overflow-visible lg:pb-0">
                {actions.map((action) => (
                    <TransactionDockButton key={action.id} action={action} />
                ))}
            </div>
        </div>
    );
}

export function TransactionTotalCard({ label, value, className = '' }) {
    return (
        <div
            className={`w-full max-w-[264px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
        >
            <div className="px-4 py-3 text-[15px] text-[#1f2436] sm:text-[16px] lg:text-[17px]">{label}</div>
            <div className="px-4 pb-4 text-right text-[16px] font-semibold text-[#111827] sm:text-[17px] lg:text-[18px]">{value}</div>
        </div>
    );
}

export function TransactionDualTotalCard({ items = [], className = '' }) {
    if (!items.length) {
        return null;
    }

    return (
        <div
            className={`grid w-full max-w-[566px] overflow-hidden rounded-[4px] border border-[#d2d8e3] bg-white shadow-[0_4px_10px_rgba(15,23,42,0.08)] ${className}`.trim()}
            style={{
                gridTemplateColumns: items.length > 1 ? `repeat(${items.length}, minmax(0,1fr))` : undefined,
            }}
        >
            {items.map((item, index) => (
                <div
                    key={item.label}
                    className={`p-4 ${index < items.length - 1 ? 'border-b border-[#d8dde7] sm:border-b-0 sm:border-r' : ''}`.trim()}
                >
                    <div className="text-[17px] text-[#1f2436]">{item.label}</div>
                    <div className="mt-3 text-right text-[18px] font-semibold text-[#111827]">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

export function TransactionFormLayout({
    header,
    sectionTabs,
    activeSectionId,
    onSectionChange,
    children,
    footer = null,
    dockActions = [],
}) {
    return (
        <div className="flex min-h-full flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    {header ? <div className="border-b border-[#d8dde7] px-4 py-4">{header}</div> : null}

                    <div className="flex min-h-[620px] flex-col gap-3 px-2 py-2 sm:px-3 lg:flex-row lg:items-start">
                        <TransactionSectionRail
                            tabs={sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={onSectionChange}
                        />

                        <div className="min-w-0 flex-1 rounded-[4px] border border-[#d3d9e5] bg-white px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                            {children}
                        </div>
                    </div>

                    {footer ? <div className="flex justify-end px-3 pb-3">{footer}</div> : null}
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}

export function TransactionToolbarIconButton({ label, children, className = '' }) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`inline-flex h-[34px] w-[40px] shrink-0 items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0] ${className}`.trim()}
        >
            {children}
        </button>
    );
}

export function TransactionToolbarSplitButton({ label, icon, items = [] }) {
    const [open, setOpen] = useState(false);
    const buttonRef = useRef(null);

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="inline-flex h-[34px] overflow-hidden rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
                aria-label={label}
                title={label}
            >
                <span className="inline-flex w-[36px] items-center justify-center">{icon}</span>
                <span className="inline-flex w-[28px] items-center justify-center border-l border-l-[#7aa2d5]">
                    <ChevronDownIcon className="h-4 w-4" />
                </span>
            </button>

            <DropdownMenu
                open={open}
                onClose={() => setOpen(false)}
                anchorRef={buttonRef}
                widthClassName="w-[180px]"
            >
                <div className="flex flex-col">
                    {items.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            onClick={() => {
                                item.onClick?.();
                                setOpen(false);
                            }}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenu>
        </div>
    );
}
