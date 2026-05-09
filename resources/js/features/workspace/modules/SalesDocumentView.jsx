import SalesDocumentFormView from '@/features/workspace/modules/sales-document/SalesDocumentFormView';
import SalesDocumentTableView from '@/features/workspace/modules/sales-document/SalesDocumentTableView';

export default function SalesDocumentView({
    config,
    buildRecord,
    mode,
    activeLevel2Tab,
    onOpenContent,
    onOpenDetail,
}) {
    return mode === 'table' ? (
        <SalesDocumentTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <SalesDocumentFormView config={config} buildRecord={buildRecord} activeLevel2Tab={activeLevel2Tab} />
    );
}
