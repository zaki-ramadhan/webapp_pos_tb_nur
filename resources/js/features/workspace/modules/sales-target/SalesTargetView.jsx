import SalesTargetFormView from './SalesTargetFormView';
import SalesTargetTableView from './SalesTargetTableView';

export default function SalesTargetView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.salesTarget;

    return mode === 'table' ? (
        <SalesTargetTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesTargetFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
