import PayrollEntryFormView from './PayrollEntryFormView';
import PayrollEntryTableView from './PayrollEntryTableView';

export default function PayrollEntryView({ page, mode, activeLevel2Tab, onOpenContent }) {
    const config = page.payrollEntry;

    return mode === 'table' ? (
        <PayrollEntryTableView config={config} onCreate={onOpenContent} />
    ) : (
        <PayrollEntryFormView pageId={page.id} activeLevel2Tab={activeLevel2Tab} config={config} />
    );
}
