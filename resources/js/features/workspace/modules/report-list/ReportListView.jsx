import { startTransition, useDeferredValue, useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import Panel from '@/components/ui/Panel';
import TextInput from '@/components/ui/TextInput';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildReportListConfig as buildBackendReportListConfig } from '@/features/workspace/backend/workspaceBackendAdapters';
import { buildReportListConfig } from './reportListConfig';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    isReportCategoryInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import { SaveIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function buildResolvedReportConfig(rows, fallbackConfig) {
    if (rows.length) {
        return buildBackendReportListConfig(rows, fallbackConfig);
    }

    return {
        ...fallbackConfig,
        reports: [],
    };
}

function buildReportContentState({ loading, error, reportsCount, visibleSectionsCount, keyword, config, onRetry }) {
    if (loading) {
        return {
            title: 'Memuat daftar laporan',
            description: 'Daftar laporan sedang diambil dari server.',
            iconName: 'reports',
        };
    }

    if (error) {
        return {
            title: 'Gagal memuat daftar laporan',
            description: typeof error === 'string' && error.includes('Conflict')
                ? 'Terjadi bentrokan data di database server.'
                : 'Tidak dapat terhubung ke server atau terjadi kendala sistem saat memuat data.',
            iconName: 'document',
            action: (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex h-[36px] items-center justify-center rounded-[8px] border border-[#7aa2d5] bg-white px-4 text-[14px] font-medium text-[#2353a0]"
                >
                    Muat Ulang
                </button>
            ),
        };
    }

    if (reportsCount === 0) {
        return {
            title: 'Belum ada laporan',
            description: 'Data daftar laporan belum tersedia dari backend.',
            iconName: 'reports',
        };
    }

    if (visibleSectionsCount === 0) {
        return {
            title: config.emptyState.title,
            description: keyword
                ? config.emptyState.description
                : 'Belum ada laporan pada kategori yang dipilih.',
            iconName: keyword ? 'search' : 'reports',
        };
    }

    return null;
}

function SidebarCategoryButton({ category, active, onSelect }) {
    const isInactive = isReportCategoryInactive(category.id);

    return (
        <button
            type="button"
            onClick={() => {
                if (!isInactive) {
                    onSelect(category.id);
                }
            }}
            className={`group flex w-full items-center gap-3 rounded-[6px] px-3.5 py-2.5 text-left transition ${
                isInactive
                    ? 'cursor-not-allowed opacity-50 text-[#8a93a7]'
                    : active
                    ? 'bg-[#ef3968] text-white font-semibold shadow-[0_2px_8px_rgba(239,57,104,0.12)]'
                    : 'bg-transparent text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
            }`.trim()}
            aria-disabled={isInactive}
            title={isInactive ? WORKSPACE_INACTIVE_HINT : category.label}
        >
            <span
                className={`inline-flex shrink-0 items-center justify-center ${
                    active ? 'text-white' : 'text-[#4b5563] group-hover:text-[#111827]'
                }`}
            >
                {category.icon === 'save' ? (
                    <SaveIcon className="h-[18px] w-[18px]" />
                ) : (
                    <NavigationIcon type={category.icon} className="h-[18px] w-[18px]" strokeWidth={1.8} />
                )}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] leading-6">{category.label}</span>
            </span>

            {isInactive ? (
                <span className="shrink-0 rounded-[4px] bg-[#fef2f2] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#ef4444] border border-[#fee2e2]">
                    {WORKSPACE_INACTIVE_BADGE_LABEL}
                </span>
            ) : null}
        </button>
    );
}

function getIconStyles(iconType) {
    if (iconType === 'reports' || iconType === 'budget' || iconType === 'chart') {
        return {
            container: 'bg-[#fff1ec] text-[#ea580c] shadow-[inset_0_0_0_1px_rgba(234,88,12,0.08)]',
            icon: 'reports',
        };
    }
    
    if (iconType === 'activity' || iconType === 'document' || iconType === 'invoice' || iconType === 'info') {
        return {
            container: 'bg-[#eef5ff] text-[#2269bb] shadow-[inset_0_0_0_1px_rgba(34,105,187,0.08)]',
            icon: iconType,
        };
    }
    
    return {
        container: 'bg-[#f5efff] text-[#7c3aed] shadow-[inset_0_0_0_1px_rgba(124,58,237,0.08)]',
        icon: iconType === 'save' ? 'save' : 'ledger',
    };
}

function ReportCard({ report }) {
    const styles = getIconStyles(report.icon);
    
    return (
        <button
            type="button"
            className="group flex w-full items-start gap-4 rounded-[10px] p-2.5 text-left transition hover:bg-[#f9fafb]"
        >
            <span className={`inline-flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[10px] ${styles.container}`}>
                <NavigationIcon type={styles.icon} className="h-6 w-6" strokeWidth={1.8} />
            </span>

            <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[17px] font-medium leading-6 text-[#111827] group-hover:text-[#ef3968] transition-colors">
                    {report.title}
                </span>
                <span className="mt-1 block text-[15px] leading-5 text-[#4b5563]">
                    {report.description}
                </span>
            </span>
        </button>
    );
}

function buildVisibleSections(reports, activeCategoryId, keyword) {
    const filteredReports = reports.filter((report) => {
        if (report.categoryId !== activeCategoryId) {
            return false;
        }

        if (!keyword) {
            return true;
        }

        return [report.title, report.description, report.section].some((value) =>
            String(value ?? '')
                .toLowerCase()
                .includes(keyword),
        );
    });

    return filteredReports.reduce((result, report) => {
        const currentSection = result.find((section) => section.title === report.section);

        if (currentSection) {
            currentSection.items.push(report);
            return result;
        }

        result.push({
            title: report.section,
            items: [report],
        });

        return result;
    }, []);
}

export default function ReportListView({ page }) {
    const fallbackConfig = page.reportList ?? buildReportListConfig();
    const { rows, loading, error, reload } = useBackendIndexResource({
        resource: 'report-lists',
        filters: {
            per_page: 100,
        },
    });
    
    const backendConfig = buildResolvedReportConfig(rows, fallbackConfig);
    const config = backendConfig.reports.length ? backendConfig : fallbackConfig;
    
    const firstActiveCategoryId = config.categories.find((category) => !isReportCategoryInactive(category.id))?.id ?? config.categories[0]?.id ?? '';
    const [activeCategoryId, setActiveCategoryId] = useState(firstActiveCategoryId);
    const [searchValue, setSearchValue] = useState('');
    const deferredKeyword = useDeferredValue(searchValue.trim().toLowerCase());
    const activeCategory =
        config.categories.find((category) => category.id === activeCategoryId && !isReportCategoryInactive(category.id)) ??
        config.categories.find((category) => !isReportCategoryInactive(category.id)) ??
        config.categories[0];
    const visibleSections = buildVisibleSections(config.reports, activeCategory?.id ?? '', deferredKeyword);
    const contentState = buildReportContentState({
        loading,
        error,
        reportsCount: config.reports.length,
        visibleSectionsCount: visibleSections.length,
        keyword: deferredKeyword,
        config,
        onRetry: reload,
    });

    return (
        <div className="flex min-h-full flex-col">
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)]">
                <Panel className="border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <div className="flex h-full flex-col">
                        <div className="flex items-center h-[46px] border-b border-[#e5e7eb] px-4">
                            <button type="button" className="text-[#4b5563] hover:text-[#111827]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto">
                            <div className="flex flex-col gap-0.5 p-2">
                                {config.categories
                                    .filter((category) => !isReportCategoryInactive(category.id))
                                    .map((category) => (
                                        <SidebarCategoryButton
                                            key={category.id}
                                            category={category}
                                            active={category.id === activeCategory?.id}
                                            onSelect={(nextCategoryId) =>
                                                startTransition(() => {
                                                    setActiveCategoryId(nextCategoryId);
                                                })
                                            }
                                        />
                                    ))}
                            </div>
                        </div>
                    </div>
                </Panel>

                <Panel className="border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
                    <div className="flex h-full min-h-[520px] flex-col px-4 py-4 sm:px-5 lg:px-6">
                        <div className="flex flex-col gap-4 border-b border-[#e5e7eb] pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-[24px] font-medium tracking-tight text-[#111827] sm:text-[26px]">
                                {activeCategory?.label ?? config.title}
                            </h1>
                            <div className="w-full sm:w-[320px]">
                                <TextInput
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder={config.searchPlaceholder}
                                    trailing={<SearchIcon className="h-5 w-5 text-[#9ca3af]" />}
                                    className="h-[36px] rounded-[4px] border-[#cfd6e2]"
                                    inputClassName="text-[14px] text-[#1f2436]"
                                    trailingClassName="px-3"
                                />
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col pt-4">
                            {!contentState ? (
                                <div className="space-y-6">
                                    {visibleSections.map((section) => (
                                        <div key={section.title} className="space-y-3">
                                            {visibleSections.length > 1 && (
                                                <h3 className="text-[14px] font-semibold uppercase tracking-wider text-[#9ca3af]">
                                                    {section.title}
                                                </h3>
                                            )}
                                            <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                                                {section.items.map((report) => (
                                                    <ReportCard key={report.id} report={report} />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    fill
                                    bordered
                                    align="center"
                                    tone="subtle"
                                    title={contentState.title}
                                    description={contentState.description}
                                    action={contentState.action}
                                    iconName={contentState.iconName}
                                    className="min-h-[280px] border-[#d8e1ef] bg-[#fbfcfe]"
                                />
                            )}
                        </div>
                    </div>
                </Panel>
            </div>
        </div>
    );
}

