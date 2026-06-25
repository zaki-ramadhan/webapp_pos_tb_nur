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
                <div className="min-w-0 flex-1 flex flex-col h-full min-h-0">
                    {header ? (
                        <div className="shrink-0 px-4 pt-1.5 pb-2.5 bg-transparent">
                            {header}
                        </div>
                    ) : null}

                    <div className="flex flex-1 min-h-0">
                        <TransactionSectionRail
                            tabs={sectionTabs}
                            activeTabId={activeSectionId}
                            onSelectTab={onSectionChange}
                        />

                        <div className="min-w-0 flex-1 overflow-y-auto px-3 pt-3 pb-3 flex flex-col bg-white border border-ui-border rounded-[6px] shadow-card-light">
                            {children}
                        </div>
                    </div>

                    {footer ? (
                        <div className="shrink-0 flex justify-end pt-3 pb-3 bg-transparent">
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
