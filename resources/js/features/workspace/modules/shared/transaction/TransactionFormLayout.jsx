import { TransactionDock } from './TransactionDock';
import { TransactionSectionRail } from './TransactionPrimitives';
import { useFormSaveShortcut } from '@/features/workspace/shared/hooks/useFormSaveShortcut';

export default function TransactionFormLayout({
    header,
    sectionTabs,
    activeSectionId,
    onSectionChange,
    children,
    footer = null,
    dockActions = [],
}) {
    const saveAction = (dockActions || []).find((action) => action && action.id === 'save');
    const onSave = saveAction?.onClick || (saveAction?.items?.[0]?.onClick ? () => saveAction.items[0].onClick() : null) || saveAction?.onSelect;

    const formRef = useFormSaveShortcut(onSave, { disabled: Boolean(saveAction?.disabled) });
    return (
        <div ref={formRef} className="flex h-full min-h-0 flex-col gap-3">
            <div className="flex min-h-0 flex-1 flex-row gap-4">
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

                        <div className="min-w-0 flex-1 overflow-y-auto px-3 pt-3 pb-6 flex flex-col bg-white border border-ui-border rounded-[6px] shadow-card-light">
                            {children}
                        </div>
                    </div>

                    <div className="shrink-0 flex items-center justify-between gap-4 pt-1.5 pb-1.5 bg-transparent">
                        <div className="flex md:hidden">
                            <TransactionDock actions={dockActions} />
                        </div>
                        <div className="ml-auto">
                            {footer}
                        </div>
                    </div>
                </div>

                <div className="hidden md:flex shrink-0 w-[80px] lg:w-[96px] pt-1.5">
                    <TransactionDock actions={dockActions} />
                </div>
            </div>
        </div>
    );
}
