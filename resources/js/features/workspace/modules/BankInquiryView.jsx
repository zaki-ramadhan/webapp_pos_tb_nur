import InquiryWorkspaceView from '@/features/workspace/modules/shared/InquiryWorkspaceView';
import { bankInquiryPageConfigs } from '@/features/workspace/modules/bankInquiryConfig';

export default function BankInquiryView({ page }) {
    const config = bankInquiryPageConfigs[page.id] ?? bankInquiryPageConfigs['bank-statement'];

    return <InquiryWorkspaceView key={page.id} config={config} />;
}
