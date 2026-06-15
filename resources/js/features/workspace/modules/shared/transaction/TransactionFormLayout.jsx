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
}) {
    return (
        <div className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
                {/* Left Column Container: No border or shadow */}
                <div className="min-w-0 flex-1 flex flex-col h-full min-h-0">
                    {/* Transparent & Borderless Header */}
                    {header ? (
                        <div className="shrink-0 px-4 pt-1.5 pb-2.5 bg-transparent">
                            {header}
                        </div>
                    ) : null}

                    {/* White Body - Card wrapper around the table section */}
                    <div className="flex flex-1 min-h-0 flex-col gap-3 px-2 py-2 sm:px-3 lg:flex-row lg:items-stretch bg-white border border-[#cfd6e2] rounded-[6px] shadow-[0_2px_10px_rgba(15,23,42,0.08)]">
                        <TransactionSectionRail
                            tabs={sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={onSectionChange}
                        />

                        <div className="min-w-0 flex-1 overflow-y-auto px-1 pt-1 pb-3 flex flex-col">
                            {children}
                        </div>
                    </div>

                    {/* Transparent Footer */}
                    {footer ? (
                        <div className="shrink-0 flex justify-end pt-3 pb-3 bg-transparent">
                            {footer}
                        </div>
                    ) : null}
                </div>

                <div className="shrink-0 lg:w-[96px]">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}
