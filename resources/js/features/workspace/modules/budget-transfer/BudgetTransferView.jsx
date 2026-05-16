import BudgetTransferFormView from './BudgetTransferFormView';
import BudgetTransferTableView from './BudgetTransferTableView';

export default function BudgetTransferView({ page, mode, activeLevel2Tab, onOpenContent }) {
    const config = page.budgetTransfer;

    return mode === 'table' ? (
        <BudgetTransferTableView config={config} onCreate={onOpenContent} />
    ) : (
        <BudgetTransferFormView pageId={page.id} activeLevel2Tab={activeLevel2Tab} config={config} />
    );
}
