import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';
import { useFormSaveShortcut } from '@/features/workspace/shared/hooks/useFormSaveShortcut';

export default function ModuleFormTemplate({
    form,
    activeTabId,
    setActiveTabId,
    status,
    saving,
    saveDisabled,
    onSave,
    children,
    actionsSlot,
}) {
    const formRef = useFormSaveShortcut(onSave, { disabled: Boolean(saveDisabled || saving) });

    const hasTabs = (form.tabs && form.tabs.length > 0) || (form.rightTabs && form.rightTabs.length > 0);

    return (
        <div ref={formRef} className="flex h-full min-h-0 flex-col overflow-hidden">
            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden">
                <div className="flex flex-1 min-h-0 flex-col overflow-hidden">
                    {hasTabs ? (
                        <div className="shrink-0">
                            <PreferencesTabs
                                tabs={form.tabs}
                                rightTabs={form.rightTabs}
                                activeTabId={activeTabId}
                                onSelectTab={setActiveTabId}
                                className="pl-0 sm:pl-0 pr-0 sm:pr-0"
                            />
                        </div>
                    ) : null}

                    <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-ui-border bg-white shadow-card-light overflow-hidden px-4 py-4 -mt-px">
                        <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">

                            <div className="flex-1 min-h-0 flex flex-col">
                                {children}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="order-1 flex shrink-0 flex-row justify-start gap-3 lg:order-2 lg:shrink-0 lg:self-start lg:flex-col lg:w-[112px] lg:items-center pt-3 lg:pt-4">
                    <DockSaveButton
                        label={saving ? 'Memproses...' : (form.saveLabel ?? 'Simpan')}
                        disabled={saveDisabled}
                        onClick={onSave}
                    />
                    {actionsSlot}
                </div>
            </div>
        </div>
    );
}
