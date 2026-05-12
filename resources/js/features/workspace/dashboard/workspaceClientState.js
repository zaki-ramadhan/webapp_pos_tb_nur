import { clearDashboardPreferences } from '@/features/workspace/dashboard/dashboardPersistence';
import { clearWorkspacePageState } from '@/features/workspace/dashboard/workspacePagePersistence';

export function clearWorkspaceClientState() {
    clearWorkspacePageState();
    clearDashboardPreferences();
}
