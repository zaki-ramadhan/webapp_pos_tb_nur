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
                <div className="min-w-0 flex-1 overflow-hidden rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] flex flex-col h-full min-h-0">
                    {header ? <div className="shrink-0 border-b border-[#d8dde7] px-4 py-4">{header}</div> : null}

                    <div className="flex flex-1 min-h-0 flex-col gap-3 px-2 py-2 sm:px-3 lg:flex-row lg:items-stretch">
                        <TransactionSectionRail
                            tabs={sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={onSectionChange}
                        />

                        <div className="min-w-0 flex-1 overflow-y-auto px-3 pt-1 pb-3 flex flex-col">
                            {children}
                        </div>
                    </div>

                    {footer ? <div className="shrink-0 flex justify-end border-t border-[#d8dde7] pt-3 px-3 pb-3">{footer}</div> : null}
                </div>

                <div className="shrink-0 lg:w-[104px]">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}
