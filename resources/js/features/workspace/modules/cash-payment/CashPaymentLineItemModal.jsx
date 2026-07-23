import MoneyMovementLineItemModal from '@/features/workspace/shared/MoneyMovementLineItemModal';

export default function CashPaymentLineItemModal(props) {
    return <MoneyMovementLineItemModal {...props} type="payment" />;
}
