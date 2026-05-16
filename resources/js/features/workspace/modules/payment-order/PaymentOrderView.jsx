import PaymentOrderFormView from './PaymentOrderFormView';
import PaymentOrderTableView from './PaymentOrderTableView';

export default function PaymentOrderView({ page, mode, onOpenContent }) {
    const config = page.paymentOrder;

    return mode === 'table' ? (
        <PaymentOrderTableView config={config} onCreate={onOpenContent} />
    ) : (
        <PaymentOrderFormView config={config} />
    );
}
