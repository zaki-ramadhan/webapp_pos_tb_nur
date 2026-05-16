import PeriodEndFormView from './PeriodEndFormView';
import PeriodEndTableView from './PeriodEndTableView';

export default function PeriodEndView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    const config = page.periodEnd;

    return mode === 'table' ? (
        <PeriodEndTableView config={config} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <PeriodEndFormView config={config} activeLevel2Tab={activeLevel2Tab} />
    );
}
