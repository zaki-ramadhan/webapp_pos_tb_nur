import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import { ClearableTextInput, WarehouseFieldRow } from './warehouseHelpers';

export default function WarehouseGeneralTab({ config, values, onChange, isDetail }) {
    return (
        <div className="space-y-3 max-w-[980px]">
            <WarehouseFieldRow label={config.labels.name} required>
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput id="name" name="name" value={values.name} onChange={(event) => onChange('name', event.target.value)} />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.description}>
                <div className="lg:max-w-[50%] w-full">
                    <TextareaField
                        value={values.description}
                        onChange={(event) => onChange('description', event.target.value)}
                        rows={4}
                        className="rounded-[4px] border-ui-border"
                        textareaClassName="min-h-[112px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </WarehouseFieldRow>

            <WarehouseFieldRow label={config.labels.responsiblePerson}>
                <div className="lg:max-w-[50%] w-full">
                    <ClearableTextInput
                        value={values.responsiblePerson}
                        onChange={(event) => onChange('responsiblePerson', event.target.value)}
                    />
                </div>
            </WarehouseFieldRow>

            {isDetail ? (
                <WarehouseFieldRow label="Non Aktif">
                    <CheckboxField
                        id="warehouse-inactive"
                        label={config.labels.inactive}
                        checked={values.inactive}
                        onChange={(event) => onChange('inactive', event.target.checked)}
                        align="center"
                        labelClassName="text-base"
                        inputClassName="mt-0 h-[18px] w-[18px]"
                        containerClassName="w-auto"
                    />
                </WarehouseFieldRow>
            ) : null}
        </div>
    );
}
