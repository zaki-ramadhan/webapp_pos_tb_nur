import NumberingFormView from './NumberingFormView';
import NumberingTableView from './NumberingTableView';

export default function NumberingView({ page, mode, onOpenContent }) {
    return mode === 'table' ? <NumberingTableView table={page.table} onCreate={onOpenContent} /> : <NumberingFormView form={page.form} />;
}
