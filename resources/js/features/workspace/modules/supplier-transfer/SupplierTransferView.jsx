import TransferBatchWorkspaceView from '@/features/workspace/modules/shared/TransferBatchWorkspaceView';
import { supplierTransferConfig } from '@/features/workspace/modules/supplier-transfer/supplierTransferConfig';

export default function SupplierTransferView({ page }) {
    return (
        <TransferBatchWorkspaceView
            key={page?.id ?? 'supplier-transfer'}
            config={page?.supplierTransfer ?? supplierTransferConfig}
        />
    );
}
