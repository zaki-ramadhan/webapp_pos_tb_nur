import BranchFormView from './BranchFormView';
import BranchTableView from './BranchTableView';

export default function BranchView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <BranchTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <BranchFormView form={page.form} />
    );
}
