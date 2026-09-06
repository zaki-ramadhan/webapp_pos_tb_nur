import { clearWorkspacePageState } from '@/features/workspace/dashboard/workspacePagePersistence';
import { clearInquiryFilterState } from '@/features/workspace/shared/inquiryFilterPersistence';

export function clearWorkspaceClientState() {
    clearWorkspacePageState();
    clearInquiryFilterState();
}

