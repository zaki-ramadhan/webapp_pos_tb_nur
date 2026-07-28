import CheckboxField from '@/components/ui/CheckboxField';

export default function PermissionCell({ checked, onChange }) {
    return (
        <div className="flex items-center justify-center">
            <CheckboxField
                id="permission"
                checked={checked}
                onChange={onChange}
                inputClassName="h-[22px] w-[22px] rounded-[5px] border-tab-view-active-border-x"
                containerClassName="w-auto flex items-center justify-center"
            />
        </div>
    );
}
