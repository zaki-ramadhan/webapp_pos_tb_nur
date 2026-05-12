import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';

export default function AuthInput({
    label,
    hint = null,
    type = 'text',
    placeholder = '',
    trailing = null,
    error = '',
    ...props
}) {
    return (
        <FormField label={label} hint={hint}>
            <TextInput type={type} placeholder={placeholder} trailing={trailing} error={error} {...props} />
        </FormField>
    );
}
