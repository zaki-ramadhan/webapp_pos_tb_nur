import PreferencesTabs from '@/features/workspace/preferences/PreferencesTabs';
import CrudStatusMessage from '@/features/workspace/shared/CrudStatusMessage';
import DockSaveButton from '@/features/workspace/shared/DockSaveButton';

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
    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden">
            {form.tabs && form.tabs.length > 0 ? (
                <div className="shrink-0">
                    <PreferencesTabs
                        tabs={form.tabs}
                        activeTabId={activeTabId}
                        onSelectTab={setActiveTabId}
                        className="pl-0 sm:pl-0"
                    />
                </div>
            ) : null}

            <div className="flex flex-1 min-h-0 flex-col gap-4 lg:flex-row overflow-hidden pt-0">
                <div className="flex flex-1 min-h-0 flex-col rounded-[6px] border border-[#cfd6e2] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.08)] overflow-hidden px-4 py-4 -mt-px">
                    <div className="order-2 min-w-0 flex-1 lg:order-1 overflow-y-auto pr-1.5 min-h-0 flex flex-col">
                        {status && (status.message || status.tone) ? (
                            <CrudStatusMessage status={status} className="mb-4 shrink-0" />
                        ) : null}

                        <div className="flex-1 min-h-0 flex flex-col">
                            {children}
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
