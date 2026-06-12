import CheckboxField from '@/components/ui/CheckboxField';
import TextInput from '@/components/ui/TextInput';
import ChipLookupField from '@/features/workspace/shared/ChipLookupField';

function PaymentFieldRow({ label, required = false, children }) {
    return (
        <div className="grid gap-3 lg:grid-cols-[360px_minmax(0,570px)] lg:items-start">
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
            <TextInput value={value} onChange={onChange} className="h-[40px] w-[116px] rounded-[4px] border-[#cfd6e2]" inputClassName="text-right text-xs sm:text-sm text-[#1f2436]" />
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
                <textarea
                    value={createValues.description}
                    onChange={(event) => setCreateValues((current) => ({ ...current, description: event.target.value }))}
                    rows={4}
                    className="min-h-[72px] w-full resize-none rounded-[4px] border border-[#cfd6e2] px-4 py-3 text-xs sm:text-sm text-[#1f2436] outline-none transition-[border-color,box-shadow] duration-150 focus:border-[var(--color-input-focus)] focus:shadow-[0_0_0_3px_var(--color-input-focus-ring)]"
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

            <div className="lg:pl-[372px]">
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

            <div className="lg:pl-[372px]">
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
