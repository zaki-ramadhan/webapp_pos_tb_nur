import DepartmentFormView from '@/features/workspace/modules/department/DepartmentFormView';
import DepartmentTableView from '@/features/workspace/modules/department/DepartmentTableView';

export default function DepartmentView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <DepartmentTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <DepartmentFormView form={page.form} />
    );
}
