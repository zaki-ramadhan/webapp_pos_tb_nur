import SupplierPriceFormView from './SupplierPriceFormView';
import SupplierPriceTableView from './SupplierPriceTableView';

export default function SupplierPriceView({ page, mode, onOpenContent }) {
    const config = page.supplierPrice;

    return mode === 'table' ? (
        <SupplierPriceTableView config={config} onCreate={onOpenContent} />
    ) : (
        <SupplierPriceFormView config={config} />
    );
}
