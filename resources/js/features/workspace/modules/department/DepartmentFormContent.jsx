import {
    DepartmentGeneralTab,
    DepartmentOpeningBalanceTab,
    DepartmentUsersTab,
} from './DepartmentFormSections';

export default function DepartmentFormContent({
    activeTabId,
    form,
    values,
    onChange,
    branchOptions,
    userOptions,
    parentDepartmentOptions,
}) {
    if (activeTabId === 'department-opening-balance') {
        return <DepartmentOpeningBalanceTab form={form} values={values} onChange={onChange} />;
    }

    if (activeTabId === 'department-users') {
        return (
            <DepartmentUsersTab
                form={form}
                values={values}
                onChange={onChange}
                branchOptions={branchOptions}
                userOptions={userOptions}
            />
        );
    }

    return (
        <DepartmentGeneralTab
            form={form}
            values={values}
            onChange={onChange}
            parentDepartmentOptions={parentDepartmentOptions}
        />
    );
}
