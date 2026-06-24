import SelectField from '@/components/ui/SelectField';
import TextInput from '@/components/ui/TextInput';
import TransactionDateInput from '@/features/workspace/modules/shared/transaction/TransactionDateInput';
import PreferenceLookupAutocomplete from './PreferenceLookupAutocomplete';
import { CloseIcon, PencilIcon } from '@/features/workspace/shared/Icons';

const PREFERENCE_FIELD_RENDERERS = {
    select(field, value, onChange) {
        return (
            <SelectField
                id={field.id}
                value={value ?? field.value}
                onChange={(e) => onChange?.(field.id, e.target.value)}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                className="h-[34px] rounded-[3px] border-ui-border"
                selectClassName="text-xs sm:text-sm"
            >
                {field.options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </SelectField>
        );
    },
    date(field, value, onChange) {
        return (
            <TransactionDateInput
                value={value ?? field.value ?? ''}
                disabled={field.disabled}
                onChange={(displayValue) => onChange?.(field.id, displayValue)}
                className="w-full max-w-[280px]"
                inputClassName="text-xs sm:text-sm"
            />
        );
    },
    'readonly-edit'(field, value, onChange) {
        const handleCurrencyEdit = async () => {
            if (field.disabled) return;
            try {
                const response = await window.axios.get('/api/backend/currencies');
                const currencies = response?.data?.data ?? [];
                const idr = currencies.find(c => c.code === 'IDR');
                if (idr) {
                    window.dispatchEvent(new CustomEvent('workspace:open-page', {
                        detail: {
                            pageId: 'currency-master',
                            recordId: idr.id,
                            tabLabel: idr.name || 'Rupiah',
                            label: idr.name || 'Rupiah'
                        }
                    }));
                } else {
                    window.dispatchEvent(new CustomEvent('workspace:open-page', {
                        detail: { pageId: 'currency-master' }
                    }));
                }
            } catch (e) {
                console.error(e);
                window.dispatchEvent(new CustomEvent('workspace:open-page', {
                    detail: { pageId: 'currency-master' }
                }));
            }
        };

        return (
            <div className="flex max-w-[480px] items-center gap-4">
                <TextInput
                    id={field.id}
                    value={value ?? field.value}
                    readOnly
                    disabled={field.disabled}
                    error={field.error}
                    message={field.message}
                    className="h-[34px] flex-1 rounded-[3px] border-ui-border bg-ui-bg-panel-lighter"
                    inputClassName="text-xs sm:text-sm text-text-readonly-input"
                />
                <button
                    type="button"
                    disabled={field.disabled}
                    onClick={handleCurrencyEdit}
                    className="inline-flex h-[32px] w-[40px] items-center justify-center rounded-[2px] bg-orange-e8e4dd text-abc-label-dark disabled:cursor-default disabled:bg-slate-100 disabled:text-slate-400 disabled:pointer-events-none enabled:hover:bg-orange-dcd6cc transition"
                    aria-label={`Edit ${field.label}`}
                >
                    <PencilIcon />
                </button>
            </div>
        );
    },
    'chip-search'(field, value, onChange) {
        const options = ['GROSIR / WHOLESALER', 'RETAIL / ECERAN', 'MANUFAKTUR / PABRIKASI', 'JASA / SERVICE', 'KONTRAKTOR'];
        return (
            <PreferenceLookupAutocomplete
                field={field}
                value={value ?? field.value}
                onChange={onChange}
                options={options}
            />
        );
    },
    search(field, value, onChange) {
        const options = ['Bahan Bangunan', 'Alat Teknik', 'Cat & Perlengkapan', 'Pipa & Plumbling', 'Kelistrikan', 'Kayu & Kusen', 'Baja & Besi', 'Keramik & Sanitari'];
        return (
            <PreferenceLookupAutocomplete
                field={field}
                value={value ?? field.value}
                onChange={onChange}
                options={options}
            />
        );
    },
    default(field, value, onChange) {
        const hasValue = Boolean(value ?? field.value);
        return (
            <TextInput
                id={field.id}
                value={value ?? field.value}
                onChange={(e) => onChange?.(field.id, e.target.value)}
                placeholder={field.placeholder}
                disabled={field.disabled}
                error={field.error}
                message={field.message}
                clearable={field.clearable ?? false}
                trailing={
                    field.clearable && hasValue ? (
                        <button
                            type="button"
                            onClick={() => onChange?.(field.id, '')}
                            className="inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none transition-colors"
                            aria-label="Hapus"
                        >
                            <CloseIcon className="h-3.5 w-3.5" />
                        </button>
                    ) : null
                }
                className="h-[34px] rounded-[3px] border-ui-border"
                inputClassName="text-xs sm:text-sm"
            />
        );
    },
};

export default function PreferenceField({ field, value, onChange }) {
    const renderField = PREFERENCE_FIELD_RENDERERS[field.type] ?? PREFERENCE_FIELD_RENDERERS.default;

    return renderField(field, value, onChange);
}
