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
