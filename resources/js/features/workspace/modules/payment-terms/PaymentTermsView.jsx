import PaymentTermsFormView from './PaymentTermsFormView';
import PaymentTermsTableView from './PaymentTermsTableView';

export default function PaymentTermsView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    return mode === 'table' ? (
        <PaymentTermsTableView page={page} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PaymentTermsFormView page={page} activeLevel2Tab={activeLevel2Tab} />
    );
}
