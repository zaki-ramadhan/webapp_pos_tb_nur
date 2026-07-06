import { TransactionDock } from './TransactionDock';
import { TransactionSectionRail } from './TransactionPrimitives';

export default function TransactionFormLayout({
    header,
    sectionTabs,
    activeSectionId,
    onSectionChange,
    children,
    footer = null,
    dockActions = [],
    isLoading = false,
}) {
    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                <div className="min-w-0 flex-1 flex flex-col h-full min-h-0 gap-1.5">
                    {header ? (
                        <div className={`shrink-0 pr-3 pt-1.5 pb-0 bg-transparent ${sectionTabs?.length ? 'pl-[51px]' : 'pl-3'}`}>
                            {header}
                        </div>
                    ) : null}

                    <div className="flex flex-1 min-h-0">
                        <TransactionSectionRail
                            tabs={sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={onSectionChange}
                        />

                        <div className="min-w-0 flex-1 overflow-y-auto px-3 pt-3 pb-6 flex flex-col bg-white border border-ui-border rounded-[6px] shadow-card-light relative">
                            {isLoading ? (
                                <div className="flex flex-col gap-4 p-2 animate-pulse">
                                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                                    <div className="h-10 w-full rounded bg-gray-100" />
                                    <div className="h-4 w-1/4 rounded bg-gray-200" />
                                    <div className="h-10 w-full rounded bg-gray-100" />
                                    <div className="h-4 w-2/5 rounded bg-gray-200" />
                                    <div className="h-10 w-3/4 rounded bg-gray-100" />
                                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                                    <div className="h-24 w-full rounded bg-gray-100" />
                                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                                        <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
                                        Memuat data...
                                    </div>
                                </div>
                            ) : children}
                        </div>
                    </div>

                    {footer ? (
                        <div className="shrink-0 flex justify-end pt-1.5 pb-1.5 bg-transparent">
                            {footer}
                        </div>
                    ) : null}
                </div>

                <div className="shrink-0 lg:w-[96px] lg:pt-1.5">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}
