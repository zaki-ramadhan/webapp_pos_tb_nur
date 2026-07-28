import { showErrorToast } from '@/components/feedback/toast';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import RadioField from '@/components/ui/RadioField';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    FormFieldRow,
    PartnerInlineTableSection,
    SectionHeading,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function CustomerOthersTab({ config, values, onChange }) {
    return (
        <div className="space-y-6">
            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersLimit} />

                <div className="mt-4 space-y-3">
                    <RadioField
                        id="limit-per-customer"
                        name="receivableLimitMode"
                        label="Per Pelanggan"
                        checked={values.receivableLimitMode === 'per-customer'}
                        onChange={() => onChange('receivableLimitMode', 'per-customer')}
                        inputClassName="h-[18px] w-[18px]"
                        containerClassName="w-auto inline-flex items-center"
                    />

                    <div className="space-y-3 pl-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-age"
                                label="Jika ada faktur dengan umur lebih dari"
                                checked={Boolean(values.receivableAgeEnabled)}
                                onChange={(event) => onChange('receivableAgeEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-xs sm:text-sm"
                                inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                id="receivableAgeDays"
                                name="receivableAgeDays"
                                value={values.receivableAgeDays}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9]/g, '');
                                    onChange('receivableAgeDays', sanitized);
                                }}
                                className="h-[40px] w-[130px] rounded-[4px] border-ui-border"
                                inputClassName="text-right text-xs sm:text-sm text-brand-dark"
                            />
                            <span className="text-xs sm:text-sm text-brand-dark">Hari</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <CheckboxField
                                id="customer-receivable-amount"
                                label="Jika total piutang & pesanan melebihi"
                                checked={Boolean(values.receivableAmountEnabled)}
                                onChange={(event) => onChange('receivableAmountEnabled', event.target.checked)}
                                align="center"
                                labelClassName="text-xs sm:text-sm"
                                inputClassName="mt-0 h-4 w-4 sm:h-[18px] sm:w-[18px]"
                                containerClassName="w-auto"
                            />
                            <TextInput
                                id="receivableAmount"
                                name="receivableAmount"
                                value={values.receivableAmount}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9.]/g, '');
                                    onChange('receivableAmount', sanitized);
                                }}
                                className="h-[40px] w-[280px] rounded-[4px] border-ui-border"
                                inputClassName="text-right text-xs sm:text-sm text-text-light"
                            />
                        </div>
                    </div>

                    <RadioField
                        id="limit-merge-parent"
                        name="receivableLimitMode"
                        label="Tergabung ke Pelanggan Induk"
                        checked={values.receivableLimitMode === 'merge-parent'}
                        onChange={() => onChange('receivableLimitMode', 'merge-parent')}
                        inputClassName="h-[18px] w-[18px]"
                        containerClassName="w-auto inline-flex items-center"
                    />
                </div>
            </section>

            <section className="max-w-[880px]">
                <SectionHeading title={config.headingLabels.othersOther} />

                <div className="mt-4 space-y-3">
                    <FormFieldRow label={config.labels.defaultWarehouse}>
                        <BackendLookupField
                            resource="warehouses"
                            values={(values.defaultWarehouse || []).map(item => typeof item === 'string' ? { name: item } : item)}
                            placeholder={config.lookupPlaceholders.default}
                            searchLabel="Cari gudang default"
                            onSelect={(option) => {
                                const current = values.defaultWarehouse || [];
                                if (!current.includes(option.name)) {
                                    onChange('defaultWarehouse', [...current, option.name]);
                                }
                            }}
                            onRemove={(option) => {
                                const current = values.defaultWarehouse || [];
                                onChange('defaultWarehouse', current.filter(x => x !== option.name));
                            }}
                        />
                    </FormFieldRow>

                    <FormFieldRow label={config.labels.notes}>
                        <TextareaField
                            value={values.notes}
                            onChange={(event) => onChange('notes', event.target.value)}
                            rows={4}
                            className="rounded-[4px] border-ui-border"
                            textareaClassName="min-h-[98px] text-xs sm:text-sm text-brand-dark"
                        />
                    </FormFieldRow>
                </div>
            </section>
        </div>
    );
}
