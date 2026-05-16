import ShippingFormView from './ShippingFormView';
import ShippingTableView from './ShippingTableView';

export default function ShippingView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <ShippingTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <ShippingFormView form={page.form} />
    );
}
