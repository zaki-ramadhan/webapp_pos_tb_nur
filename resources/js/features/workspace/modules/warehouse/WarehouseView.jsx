import WarehouseFormView from './WarehouseFormView';
import WarehouseTableView from './WarehouseTableView';

export default function WarehouseView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.warehouse;

    return mode === 'table' ? (
        <WarehouseTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <WarehouseFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
