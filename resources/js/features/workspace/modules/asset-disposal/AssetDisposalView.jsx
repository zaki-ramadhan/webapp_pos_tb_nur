import AssetDisposalFormView from './AssetDisposalFormView';
import AssetDisposalTableView from './AssetDisposalTableView';

export default function AssetDisposalView({
    page,
    mode = 'table',
    activeLevel2Tab = null,
    onOpenContent,
    onOpenDetail,
}) {
    if (mode === 'form') {
        return <AssetDisposalFormView page={page} activeLevel2Tab={activeLevel2Tab} />;
    }

    return <AssetDisposalTableView page={page} onOpenContent={onOpenContent} onOpenDetail={onOpenDetail} />;
}
