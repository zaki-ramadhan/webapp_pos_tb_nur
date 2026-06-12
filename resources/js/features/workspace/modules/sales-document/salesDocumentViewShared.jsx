import SelectField from '@/components/ui/SelectField';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import { TransactionSwitch, TransactionToolbarSplitButton } from '@/features/workspace/modules/shared/TransactionWorkspaceShared';
import {
    CircleCheckIcon,
    DownloadIcon,
    FunnelIcon,
    LinkIcon,
    PlusIcon,
    PrintIcon,
    SearchIcon,
    SortIcon,
} from '@/features/workspace/shared/Icons';

export function SalesDocumentHeaderButtons({ config, values, isDetail }) {
    const secondaryActionLabel = values.secondaryHeaderActionLabel ?? config.secondaryActionLabel;
    const showSecondaryHeaderAction = Boolean(secondaryActionLabel) && (values.showSecondaryHeaderAction ?? config.showSecondaryHeaderAction ?? false);
    const showProcessButton = isDetail ? values.showProcessButton : (values.showProcessButtonOnCreate ?? config.showProcessButtonOnCreate ?? false);
    const showTakeButton = values.showHeaderTakeButton ?? config.showHeaderTakeButton ?? true;

    return (
        <div className="flex flex-wrap items-center justify-end gap-2">
            {showTakeButton ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                >
                    {config.takeButtonLabel}
                </button>
            ) : null}
            {showSecondaryHeaderAction ? (
                <button
                    type="button"
                    className="inline-flex h-[34px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white px-4 text-base text-[#21539b]"
                >
                    {secondaryActionLabel}
                </button>
            ) : null}
            {showProcessButton ? (
                <button
                    type="button"
                    disabled={values.processDisabled}
                    className={`inline-flex h-[34px] items-center justify-center rounded-[4px] border px-4 text-base ${
                        values.processDisabled
                            ? 'border-[#d4d7de] bg-[#f0f0f1] text-[#b1b5bf]'
                            : 'border-[#7aa2d5] bg-white text-[#21539b]'
                    }`.trim()}
                >
                    {config.processButtonLabel}
                    {!values.processDisabled ? <span className="ml-1">⌄</span> : null}
                </button>
            ) : null}
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
        return { config, values, handlers };
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
                    className="h-[34px] min-w-[118px] rounded-[4px] border-[#cfd6e2]"
                    selectClassName="px-3 text-xs sm:text-sm text-[#394157]"
                    iconClassName="mr-2 text-[#6c7894]"
                >
                    {filter.options.map((option, optionIndex) => (
                        <option key={`${filter.id}-${option.label}-${optionIndex}`} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </SelectField>
            ))}

            <button
                type="button"
                className="inline-flex h-[34px] w-[40px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-[#dcedff] text-[#2353a0]"
                aria-label={config.table.filterButtonLabel}
            >
                <FunnelIcon className="h-4.5 w-4.5" />
            </button>
        </div>
    );
}

export function buildSalesDocumentRightControls(config) {
    return [
        config.table.downloadItems?.length ? (
            <TransactionToolbarSplitButton key="download" label="Unduh" icon={<DownloadIcon className="h-4 w-4" />} items={config.table.downloadItems} />
        ) : null,
        config.table.printItems?.length ? (
            <TransactionToolbarSplitButton key="print" label="Cetak" icon={<PrintIcon className="h-4 w-4" />} items={config.table.printItems} />
        ) : null,
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
        filters: <SalesDocumentFilterBar config={config} filters={filters} setFilters={setFilters} />,
        createButton: {
            label: config.table.createLabel,
            onClick: onCreate,
            icon: <PlusIcon className="h-6 w-6" />,
        },
        refreshButton: {
            label: config.table.refreshLabel,
            icon: <LinkIcon className="h-4.5 w-4.5" />,
            onClick: config.table.onRefresh,
            loading: Boolean(config.table.loading),
        },
        rightControls: buildSalesDocumentRightControls(config).length ? <>{buildSalesDocumentRightControls(config)}</> : null,
        search: {
            value: keyword,
            onChange: (event) => setKeyword(event.target.value),
            placeholder: config.table.searchPlaceholder,
            widthClassName: 'sm:w-[342px]',
            trailing: <SearchIcon className="h-5 w-5 text-[#111827]" />,
        },
        pageValue: config.table.pageValue,
    };
}

export function SalesDocumentStatusCell({ columnId, row, children }) {
    if (columnId === 'statusIcon') {
        return (
            <span className="inline-flex items-center justify-center text-[#27b35f]">
                <CircleCheckIcon className="h-5.5 w-5.5 text-[#27b35f]" />
            </span>
        );
    }

    return children;
}

export function SalesDocumentSortHeader({ column }) {
    return (
        <span
            className={`flex items-center gap-2 ${
                column.align === 'right'
                    ? 'justify-end'
                    : column.align === 'center'
                      ? 'justify-center'
                      : 'justify-start'
            }`.trim()}
        >
            <SortIcon className="h-3 w-3 shrink-0 text-white/55" />
            <span>{column.label}</span>
        </span>
    );
}
