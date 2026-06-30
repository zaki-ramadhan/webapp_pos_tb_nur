import CheckboxField from '@/components/ui/CheckboxField';
import {
    AddressStack,
    ChipLookupField,
    EmptyDataTable,
    FormFieldRow,
    PlusIcon,
    SectionHeading,
    SelectField,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';
import BackendLookupField from '@/features/workspace/shared/BackendLookupField';
import { AccountLookupTextInput } from '@/features/workspace/shared/AccountLookupControls';

export function SalesTab({ config, values, onChange }) {
    return (
        <div className="max-w-[500px] space-y-3">
            <SectionHeading title={config.headingLabels.salesLeft} />

            <FormFieldRow label={config.labels.paymentTerms}>
                <AccountLookupTextInput
                    id="paymentTerms"
                    resource="payment-terms"
                    value={(values.paymentTerms || [])[0] || ''}
                    placeholder="Cari/Pilih Syarat Pembayaran..."
                    searchLabel="Cari syarat pembayaran"
                    onSelectAccount={(record, label) => {
                        onChange('paymentTerms', label ? [label] : []);
                        onChange('paymentTermId', record ? record.id : null);
                    }}
                />
            </FormFieldRow>

            <FormFieldRow label="Batas Saldo Piutang">
                <TextInput
                    id="creditLimit"
                    name="creditLimit"
                    value={values.creditLimit}
                    onChange={(event) => {
                        const sanitized = event.target.value.replace(/[^0-9]/g, '');
                        onChange('creditLimit', sanitized);
                    }}
                    prefix="Rp"
                    className="h-[40px] rounded-[4px] border-ui-border"
                    prefixClassName="min-w-[34px] bg-input-prefix-bg-compact px-3 text-text-inactive"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </FormFieldRow>
        </div>
    );
}

export function TaxTab({ config, values, onChange }) {
    return (
        <div className="max-w-[500px] space-y-3">
            <SectionHeading title={config.headingLabels.taxLeft} />

            <FormFieldRow label="Nomor Wajib Pajak (NPWP / NIK)">
                <TextInput
                    id="taxNumber"
                    name="taxNumber"
                    value={values.taxNumber}
                    onChange={(event) => onChange('taxNumber', event.target.value)}
                    className="h-[40px] rounded-[4px] border-ui-border"
                    inputClassName="text-xs sm:text-sm text-brand-dark"
                />
            </FormFieldRow>
        </div>
    );
}

export function BalanceTab({ config }) {
    return (
        <div>
            <div className="mb-3 border-b border-ui-border-medium pb-1.5 flex items-center justify-between gap-3">
                <h3 className="text-base sm:text-lg font-normal text-input-brand">{config.balanceTable.title}</h3>
                <button
                    type="button"
                    className="inline-flex h-[34px] w-[56px] shrink-0 items-center justify-center rounded-[4px] border border-brand-blue-border bg-white text-brand-blue hover:bg-brand-blue-lightest transition"
                >
                    <PlusIcon className="h-5 w-5" />
                </button>
            </div>
            <EmptyDataTable columns={config.balanceTable.columns} emptyLabel={config.balanceTable.emptyLabel} />
        </div>
    );
}
