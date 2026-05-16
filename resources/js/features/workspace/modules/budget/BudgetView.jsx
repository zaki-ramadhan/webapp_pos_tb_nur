import BudgetFormView from './BudgetFormView';
import BudgetTableView from './BudgetTableView';

export default function BudgetView({ page, mode, activeLevel2Tab, onOpenContent }) {
    return mode === 'table'
        ? <BudgetTableView page={page} onCreate={onOpenContent} />
        : <BudgetFormView page={page} activeLevel2Tab={activeLevel2Tab} />;
}
