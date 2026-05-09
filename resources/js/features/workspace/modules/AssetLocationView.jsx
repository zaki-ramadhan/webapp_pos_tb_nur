import InquiryWorkspaceView from '@/features/workspace/modules/shared/InquiryWorkspaceView';
import { assetLocationConfig } from '@/features/workspace/modules/assetLocationConfig';

export default function AssetLocationView({ page }) {
    return <InquiryWorkspaceView key={page?.id ?? 'asset-location'} config={page?.assetLocation ?? assetLocationConfig} />;
}
