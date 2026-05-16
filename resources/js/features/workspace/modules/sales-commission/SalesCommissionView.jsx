import SalesCommissionFormView from './SalesCommissionFormView';
import SalesCommissionTableView from './SalesCommissionTableView';

export default function SalesCommissionView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.salesCommission;

    return mode === 'table' ? (
        <SalesCommissionTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesCommissionFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
