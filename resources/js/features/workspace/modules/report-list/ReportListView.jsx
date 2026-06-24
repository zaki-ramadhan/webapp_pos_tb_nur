import { startTransition, useDeferredValue, useState } from 'react';

import EmptyState from '@/components/ui/EmptyState';
import Panel from '@/components/ui/Panel';
import TextInput from '@/components/ui/TextInput';
import useBackendIndexResource from '@/features/workspace/backend/useBackendIndexResource';
import { buildReportListConfig } from './reportListConfig';
import { isReportCategoryInactive } from '@/features/workspace/shared/workspaceAvailability';
import { SearchIcon } from '@/features/workspace/shared/Icons';

import SidebarCategoryButton from './components/SidebarCategoryButton';
import ReportCard from './components/ReportCard';
import ReportParameterModal from './components/ReportParameterModal';
import {
    buildResolvedReportConfig,
    buildReportContentState,
    buildVisibleSections,
} from './utils/reportHelpers';

export default function ReportListView({ page }) {
    const fallbackConfig = page.reportList ?? buildReportListConfig();
    const { rows, loading, error, reload } = useBackendIndexResource({
        resource: 'report-lists',
        filters: {
            per_page: 100,
        },
    });
    
    const backendConfig = buildResolvedReportConfig(rows, fallbackConfig);
    const baseConfig = backendConfig.reports.length ? backendConfig : fallbackConfig;
    
    // Urutkan kategori
    const sortedCategories = [...baseConfig.categories].sort((a, b) => a.label.localeCompare(b.label, 'id'));
    const config = { ...baseConfig, categories: sortedCategories };
    
    const firstActiveCategoryId = config.categories.find((category) => !isReportCategoryInactive(category.id))?.id ?? config.categories[0]?.id ?? '';
    const [activeCategoryId, setActiveCategoryId] = useState(firstActiveCategoryId);
    const [searchValue, setSearchValue] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
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
    });

    return (
        <div className="flex min-h-full flex-col">
            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,250px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,270px)_minmax(0,1fr)]">
                <Panel className="border border-ui-border-medium bg-white shadow-report-panel">
                    <div className="flex h-full flex-col">
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

                <Panel className="border border-ui-border-medium bg-white shadow-report-panel">
                    <div className="flex h-full min-h-[520px] flex-col px-4 py-4 sm:px-5 lg:px-6">
                        <div className="flex flex-col gap-4 border-b border-disabled-bg pb-4 sm:flex-row sm:items-center sm:justify-between">
                            <h1 className="text-2xl font-medium tracking-tight text-text-darkest sm:text-3xl">
                                {activeCategory?.label ?? config.title}
                            </h1>
                            <div className="w-full sm:w-[320px]">
                                <TextInput
                                    value={searchValue}
                                    onChange={(event) => setSearchValue(event.target.value)}
                                    placeholder={config.searchPlaceholder}
                                    trailing={<SearchIcon className="h-5 w-5 text-disabled-text" />}
                                    className="h-[36px] rounded-[4px] border-ui-border"
                                    inputClassName="text-xs sm:text-sm text-brand-dark"
                                    trailingClassName="px-3"
                                />
                            </div>
                        </div>

                        <div className="flex min-h-0 flex-1 flex-col pt-4">
                            {!contentState ? (
                                <div className="space-y-4">
                                    {visibleSections.map((section) => (
                                        <div key={section.title} className="space-y-3">
                                            {visibleSections.length > 1 && (
                                                <h3 className="text-sm font-semibold text-disabled-text">
                                                    {section.title}
                                                </h3>
                                            )}
                                            <div className="grid gap-x-6 gap-y-3 md:grid-cols-2">
                                                {section.items.map((report) => (
                                                    <ReportCard
                                                        key={report.id}
                                                        report={report}
                                                        onClick={() => setSelectedReport(report)}
                                                    />
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
                                    action={
                                        contentState.hasAction ? (
                                            <button
                                                type="button"
                                                onClick={reload}
                                                className="inline-flex h-[36px] items-center justify-center rounded-[8px] border border-brand-blue-border bg-white px-4 text-sm font-medium text-brand-blue"
                                            >
                                                Muat Ulang
                                            </button>
                                        ) : null
                                    }
                                    iconName={contentState.iconName}
                                    className="min-h-[280px] border-abc-card-border bg-ui-bg-hover"
                                />
                            )}
                        </div>
                    </div>
                </Panel>
            </div>

            <ReportParameterModal
                report={selectedReport}
                open={selectedReport !== null}
                onClose={() => setSelectedReport(null)}
            />
        </div>
    );
}
