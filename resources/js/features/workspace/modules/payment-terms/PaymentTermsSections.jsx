import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';
import TextareaField from '@/components/ui/TextareaField';

function PaymentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[180px_minmax(0,570px)] lg:items-start">
            <label className="pt-2 text-xs sm:text-sm leading-6 text-[#1f2436]">
                {label}
                {required ? <span className="text-[#ED3969]"> *</span> : null}
            </label>
            <div>{children}</div>
        </div>
    );
}

function UnitField({ value, onChange, unit }) {
    return (
        <div className="flex items-center gap-4">
            <TextInput value={value} onChange={onChange} className="h-[40px] w-[116px] rounded-[4px] border-slate-400" inputClassName="text-right text-xs sm:text-sm text-[#1f2436]" />
            <span className="text-xs sm:text-sm text-[#1f2436]">{unit}</span>
        </div>
    );
}

export function PaymentTermsCreateSection({ config, createValues, setCreateValues }) {
    return (
        <div className="max-w-[1180px] space-y-3">
            <PaymentFieldRow label={config.createLabels.discountDays}>
                <UnitField value={createValues.discountDays} onChange={(event) => setCreateValues((current) => ({ ...current, discountDays: event.target.value }))} unit="Hari" />
            </PaymentFieldRow>

            <PaymentFieldRow label={config.createLabels.discountPercent}>
                <UnitField value={createValues.discountPercent} onChange={(event) => setCreateValues((current) => ({ ...current, discountPercent: event.target.value }))} unit="%" />
            </PaymentFieldRow>

            <PaymentFieldRow label={config.createLabels.dueDays}>
                <UnitField value={createValues.dueDays} onChange={(event) => setCreateValues((current) => ({ ...current, dueDays: event.target.value }))} unit="Hari" />
            </PaymentFieldRow>

            <PaymentFieldRow label={config.createLabels.description}>
                <TextareaField
                    value={createValues.description}
                    onChange={(event) => setCreateValues((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    className="border-slate-400"
                    textareaClassName="min-h-[72px] text-xs sm:text-sm text-[#1f2436]"
                />
            </PaymentFieldRow>

            <PaymentFieldRow label={config.createLabels.default}>
                <CheckboxField
                    id="payment-term-create-default"
                    label={config.createLabels.yesLabel}
                    checked={createValues.isDefault}
                    onChange={(event) => setCreateValues((current) => ({ ...current, isDefault: event.target.checked }))}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </PaymentFieldRow>
        </div>
    );
}

export function PaymentTermsDetailSection({ config, detailValues, setDetailValues }) {
    return (
        <div className="max-w-[1180px] space-y-3">
            <PaymentFieldRow label={config.detailLabels.name}>
                <ChipLookupField value={detailValues.name} />
            </PaymentFieldRow>

            <div className="lg:pl-[192px]">
                <CheckboxField
                    id="payment-term-default"
                    label={config.detailLabels.default}
                    checked={detailValues.isDefault}
                    onChange={(event) => setDetailValues((current) => ({ ...current, isDefault: event.target.checked }))}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>

            <div className="lg:pl-[192px]">
                <CheckboxField
                    id="payment-term-inactive"
                    label={config.detailLabels.inactive}
                    checked={detailValues.isInactive}
                    onChange={(event) => setDetailValues((current) => ({ ...current, isInactive: event.target.checked }))}
                    align="center"
                    labelClassName="text-base"
                    inputClassName="mt-0 h-[18px] w-[18px]"
                    containerClassName="w-auto"
                />
            </div>
        </div>
    );
}
