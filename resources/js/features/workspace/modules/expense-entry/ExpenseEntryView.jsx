import ExpenseEntryFormView from './ExpenseEntryFormView';
import ExpenseEntryTableView from './ExpenseEntryTableView';

export default function ExpenseEntryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.expenseEntry;

    return mode === 'table' ? (
        <ExpenseEntryTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ExpenseEntryFormView pageId={page.id} config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
