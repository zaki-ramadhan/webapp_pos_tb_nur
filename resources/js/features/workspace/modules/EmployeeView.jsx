import EmployeeFormView from '@/features/workspace/modules/employee/EmployeeFormView';
import EmployeeTableView from '@/features/workspace/modules/employee/EmployeeTableView';

export default function EmployeeView({ page, mode, onOpenContent }) {
    return mode === 'table' ? (
        <EmployeeTableView table={page.table} onCreate={onOpenContent} />
    ) : (
        <EmployeeFormView form={page.form} />
    );
}
