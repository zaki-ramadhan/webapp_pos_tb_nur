import { startTransition, useDeferredValue, useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import Panel from '@/components/ui/Panel';
import TextInput from '@/components/ui/TextInput';
import { buildReportListConfig } from '@/features/workspace/modules/reportListConfig';
import NavigationIcon from '@/features/workspace/navigation/NavigationIcon';
import {
    isReportCategoryInactive,
    WORKSPACE_INACTIVE_BADGE_LABEL,
    WORKSPACE_INACTIVE_HINT,
} from '@/features/workspace/shared/workspaceAvailability';
import { DownloadIcon, SaveIcon, SearchIcon } from '@/features/workspace/shared/Icons';

function SidebarCategoryButton({ category, active, count, onSelect }) {
    const isInactive = isReportCategoryInactive(category.id);

    return (
        <button
            type="button"
            onClick={() => {
                if (!isInactive) {
                    onSelect(category.id);
                }
            }}
            className={`group flex min-w-[172px] items-center gap-3 rounded-[10px] border px-3 py-3 text-left transition sm:min-w-[196px] lg:min-w-0 ${
                isInactive
                    ? 'cursor-not-allowed border-[#f0d9a3] bg-[#fff8e9] text-[#7d6220]'
                    : active
                    ? 'border-[#ef3968] bg-[#ef3968] text-white shadow-[0_10px_24px_rgba(239,57,104,0.18)]'
                    : 'border-transparent bg-transparent text-[#35405b] hover:border-[#e5eaf4] hover:bg-[#f7f9fc]'
            }`.trim()}
            aria-disabled={isInactive}
            title={isInactive ? WORKSPACE_INACTIVE_HINT : category.label}
        >
            <span
                className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] ${
                    isInactive
                        ? 'bg-[#f7e4b3] text-[#b67d12]'
                        : active
                          ? 'bg-white/16 text-white'
                          : 'bg-[#eef4fb] text-[#4b617f]'
                }`.trim()}
            >
                {category.icon === 'save' ? (
                    <SaveIcon className="h-[18px] w-[18px]" />
                ) : (
                    <NavigationIcon type={category.icon} className="h-[18px] w-[18px]" />
                )}
            </span>

            <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-medium">{category.label}</span>
                {isInactive ? (
                    <span className="mt-1 inline-flex rounded-full bg-[#f6dfab] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#8b6511]">
                        {WORKSPACE_INACTIVE_BADGE_LABEL}
                    </span>
                ) : null}
            </span>

            <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    isInactive
                        ? 'bg-[#f7e4b3] text-[#8b6511]'
                        : active
                          ? 'bg-white/16 text-white'
                          : 'bg-[#edf2f8] text-[#7b879d]'
                }`.trim()}
            >
                {count}
            </span>
        </button>
    );
}

function ReportToolbar({ searchValue, searchPlaceholder, onSearchChange }) {
    return (
        <div className="flex flex-col gap-3 border-b border-[#e8edf5] pb-4 lg:flex-row lg:items-center lg:justify-between">
            <button
                type="button"
                aria-label="Unduh daftar laporan"
                className="inline-flex h-[34px] w-[42px] items-center justify-center rounded-[4px] border border-[#7aa2d5] bg-white text-[#2353a0]"
            >
                <DownloadIcon className="h-4 w-4" />
            </button>

            <div className="w-full lg:max-w-[540px]">
                <TextInput
                    value={searchValue}
                    onChange={(event) => onSearchChange(event.target.value)}
                    placeholder={searchPlaceholder}
                    trailing={<SearchIcon className="h-5 w-5 text-[#111827]" />}
                    className="h-[34px] rounded-[4px] border-[#cfd6e2]"
                    inputClassName="text-[15px] text-[#1f2436]"
                    trailingClassName="px-3"
                />
            </div>
        </div>
    );
}

function ReportCard({ report }) {
    return (
        <button
            type="button"
            className="group flex w-full items-start gap-4 rounded-[16px] border border-transparent px-3 py-3 text-left transition hover:border-[#dbe6f3] hover:bg-[#f8fbff]"
        >
            <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-[16px] bg-[#eef5ff] text-[#2269bb] shadow-[inset_0_0_0_1px_rgba(34,105,187,0.08)]">
                <NavigationIcon type={report.icon} className="h-8 w-8" strokeWidth={1.8} />
            </span>

            <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold uppercase tracking-[0.14em] text-[#99a3b6]">
                    {report.section}
                </span>
                <span className="mt-1 block text-[20px] font-medium leading-7 text-[#1f2436]">
                    {report.title}
                </span>
                <span className="mt-1.5 block text-[14px] leading-6 text-[#7b8597]">
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
    const config = page.reportList ?? buildReportListConfig();
    const firstActiveCategoryId = config.categories.find((category) => !isReportCategoryInactive(category.id))?.id ?? config.categories[0]?.id ?? '';
    const [activeCategoryId, setActiveCategoryId] = useState(firstActiveCategoryId);
    const [searchValue, setSearchValue] = useState('');
    const deferredKeyword = useDeferredValue(searchValue.trim().toLowerCase());
    const activeCategory =
        config.categories.find((category) => category.id === activeCategoryId && !isReportCategoryInactive(category.id)) ??
        config.categories.find((category) => !isReportCategoryInactive(category.id)) ??
        config.categories[0];
    const visibleSections = buildVisibleSections(config.reports, activeCategory?.id ?? '', deferredKeyword);

    return (
        <div className="flex min-h-full flex-col">
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
                <Panel className="border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="flex h-full flex-col">
                        <div className="border-b border-[#e8edf5] px-4 py-4">
                            <h2 className="text-[18px] font-semibold text-[#1f2436]">Kategori Laporan</h2>
                            <p className="mt-1 text-[13px] leading-5 text-[#8a93a7]">
                                Pilih kategori untuk menampilkan daftar laporan yang tersedia.
                            </p>
                        </div>

                        <div className="min-h-0 flex-1 overflow-x-auto lg:overflow-y-auto">
                            <div className="flex gap-2.5 p-3 lg:flex-col lg:p-4">
                                {config.categories.map((category) => (
                                    <SidebarCategoryButton
                                        key={category.id}
                                        category={category}
                                        active={category.id === activeCategory?.id}
                                        count={config.reports.filter((report) => report.categoryId === category.id).length}
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

                <Panel className="border border-[#d6dce8] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                    <div className="flex h-full min-h-[520px] flex-col px-4 py-4 sm:px-5 lg:px-6">
                        <ReportToolbar
                            searchValue={searchValue}
                            searchPlaceholder={config.searchPlaceholder}
                            onSearchChange={setSearchValue}
                        />

                        <div className="flex min-h-0 flex-1 flex-col pt-5">
                            <div className="mb-5 flex flex-col gap-1 border-b border-[#eef2f7] pb-4">
                                <h1 className="text-[26px] font-normal tracking-[-0.02em] text-[#34415b] sm:text-[32px]">
                                    {activeCategory?.label ?? config.title}
                                </h1>
                                <p className="text-[14px] leading-6 text-[#8892a7]">
                                    {visibleSections.reduce((total, section) => total + section.items.length, 0)} laporan tersedia
                                </p>
                            </div>

                            {visibleSections.length ? (
                                <div className="space-y-7">
                                    {visibleSections.map((section) => (
                                        <section key={section.title}>
                                            <h3 className="mb-3 text-[20px] font-medium text-[#1f2436]">
                                                {section.title}
                                            </h3>
                                            <div className="grid gap-2 xl:grid-cols-2">
                                                {section.items.map((report) => (
                                                    <ReportCard key={report.id} report={report} />
                                                ))}
                                            </div>
                                        </section>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    fill
                                    bordered
                                    align="left"
                                    tone="subtle"
                                    title={config.emptyState.title}
                                    description={config.emptyState.description}
                                    iconName="reports"
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
