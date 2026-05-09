import FormField from '@/components/ui/FormField';
import TextInput from '@/components/ui/TextInput';

export default function AuthInput({ label, type = 'text', placeholder = '', trailing = null }) {
    return (
        <FormField label={label}>
            <TextInput type={type} placeholder={placeholder} trailing={trailing} />
        </FormField>
    );
}
