import DashboardFormModal from '@/features/workspace/dashboard/DashboardFormModal';
import WidgetLibraryModal from '@/features/workspace/dashboard/WidgetLibraryModal';
import LoadingOverlay from '@/features/workspace/shared/LoadingOverlay';
import ConfirmationModal from '@/components/ui/ConfirmationModal';

export default function DashboardViewModals({
    dashboard,
    isWidgetLibraryLoading,
    pageOpeningLoading,
    isWidgetLibraryOpen,
    setIsWidgetLibraryOpen,
    handleAddWidget,
    activeDashboardModal,
    setActiveDashboardModal,
    handleCreateDashboard,
    selectedDashboard,
    handleUpdateDashboard,
    handleDeleteDashboard,
    unsavedChangesModalOpen,
    onCloseUnsavedChangesModal,
    onConfirmUnsavedChangesModal,
}) {
    return (
        <>
            <LoadingOverlay
                open={isWidgetLibraryLoading}
                loading={dashboard.toolbar.loadingOverlay}
            />

            <LoadingOverlay
                open={Boolean(pageOpeningLoading)}
                loading={
                    pageOpeningLoading?.loading ?? {
                        title: '',
                        description: '',
                    }
                }
            />

            <WidgetLibraryModal
                open={isWidgetLibraryOpen}
                modal={dashboard.toolbar.widgetLibraryModal}
                onClose={() => setIsWidgetLibraryOpen(false)}
                onSelectItem={handleAddWidget}
            />

            <DashboardFormModal
                open={activeDashboardModal === 'add'}
                mode="add"
                modal={dashboard.toolbar.addDashboardModal}
                initialValue=""
                onClose={() => setActiveDashboardModal(null)}
                onSubmit={handleCreateDashboard}
            />

            <DashboardFormModal
                open={activeDashboardModal === 'edit'}
                mode="edit"
                modal={dashboard.toolbar.editDashboardModal}
                initialValue={selectedDashboard?.label ?? ''}
                onClose={() => setActiveDashboardModal(null)}
                onSubmit={handleUpdateDashboard}
                onDelete={handleDeleteDashboard}
            />

            <ConfirmationModal
                open={unsavedChangesModalOpen}
                onClose={onCloseUnsavedChangesModal}
                onConfirm={onConfirmUnsavedChangesModal}
                title="Konfirmasi"
                message="Perubahan yang Anda lakukan akan dibatalkan, lanjutkan?"
                confirmLabel="Ya"
                cancelLabel="Batal"
            />
        </>
    );
}
