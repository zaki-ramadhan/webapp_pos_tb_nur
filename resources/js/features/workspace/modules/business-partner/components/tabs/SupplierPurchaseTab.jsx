import { showErrorToast } from '@/components/feedback/toast';
import CheckboxField from '@/components/ui/CheckboxField';
import TextareaField from '@/components/ui/TextareaField';
import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import {
    FormFieldRow,
    PartnerInlineTableSection,
    SectionHeading,
    TextInput,
} from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function SupplierPurchaseTab({ config, values, onChange }) {
    const purchaseConfig = config.purchaseConfig ?? {};

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-6">
                <div>
                    <SectionHeading title={purchaseConfig.titleLeft ?? 'Pembelian'} />

                    <div className="mt-4 space-y-3">
                        <FormFieldRow label={purchaseConfig.discountLabel ?? 'Default Diskon (%)'}>
                            <TextInput
                                id="defaultDiscountPercent"
                                name="defaultDiscountPercent"
                                value={values.defaultDiscountPercent || ''}
                                onChange={(event) => {
                                    const sanitized = event.target.value.replace(/[^0-9.]/g, '');
                                    onChange('defaultDiscountPercent', sanitized);
                                }}
                                suffix="%"
                                className="h-[40px] max-w-[200px] rounded-[4px] border-ui-border"
                                suffixClassName="bg-input-prefix-bg-compact px-3 text-text-inactive text-xs sm:text-sm"
                                inputClassName="text-xs sm:text-sm text-brand-dark"
                            />
                        </FormFieldRow>

                        <FormFieldRow label={purchaseConfig.descriptionLabel ?? 'Default Deskripsi'}>
                            <TextareaField
                                value={values.defaultDescription || ''}
                                onChange={(event) => onChange('defaultDescription', event.target.value)}
                                rows={3}
                                className="rounded-[4px] border-ui-border"
                                textareaClassName="min-h-[80px] text-xs sm:text-sm text-brand-dark"
                            />
                        </FormFieldRow>

                        <FormFieldRow label="Batas Saldo Utang">
                            <TextInput
                                id="creditLimit"
                                name="creditLimit"
                                value={values.creditLimit || ''}
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
                </div>

                <div>
                    <SectionHeading title="Akun Pembelian" />

                    <div className="mt-4 space-y-3">
                        <FormFieldRow label={purchaseConfig.payableLabel ?? 'Akun Utang'}>
                            <AccountLookupField
                                id="payableAccount"
                                name="payableAccount"
                                values={values.payableAccount || []}
                                placeholder="Cari/Pilih..."
                                onSelectAccount={(acc) => {
                                    if (acc && acc.name) {
                                        const current = values.payableAccount || [];
                                        if (!current.includes(acc.name)) {
                                            onChange('payableAccount', [...current, acc.name]);
                                        }
                                    }
                                }}
                                onRemove={(val) => {
                                    const current = values.payableAccount || [];
                                    const targetName = typeof val === 'string' ? val : (val?.name ?? val);
                                    onChange('payableAccount', current.filter(x => x !== targetName));
                                }}
                            />
                        </FormFieldRow>

                        <FormFieldRow label={purchaseConfig.advanceLabel ?? 'Akun Uang muka'}>
                            <AccountLookupField
                                id="advanceAccount"
                                name="advanceAccount"
                                values={values.advanceAccount || []}
                                placeholder="Cari/Pilih..."
                                onSelectAccount={(acc) => {
                                    if (acc && acc.name) {
                                        const current = values.advanceAccount || [];
                                        if (!current.includes(acc.name)) {
                                            onChange('advanceAccount', [...current, acc.name]);
                                        }
                                    }
                                }}
                                onRemove={(val) => {
                                    const current = values.advanceAccount || [];
                                    const targetName = typeof val === 'string' ? val : (val?.name ?? val);
                                    onChange('advanceAccount', current.filter(x => x !== targetName));
                                }}
                            />
                        </FormFieldRow>

                        {purchaseConfig.accountNote && (
                            <p className="text-xs text-red-500 italic leading-relaxed pt-1">
                                {purchaseConfig.accountNote}
                            </p>
                        )}
                    </div>
                </div>
            </section>

            <PartnerInlineTableSection
                title={purchaseConfig.titleRight ?? 'Rekening Bank'}
                addButtonTitle={purchaseConfig.bankAddLabel ?? 'Tambah rekening bank'}
                modalTitle="Tambah Rekening Bank Baru"
                columns={[
                    { id: 'bankNumber', label: 'No Rekening' },
                    { id: 'accountName', label: 'Atas Nama' },
                    { id: 'bankName', label: 'Nama Bank' },
                ]}
                items={values?.bankAccounts ?? []}
                emptyLabel={config.bankTable.emptyLabel}
                fields={[
                    { id: 'bankNumber', label: 'No Rekening', required: true, placeholder: 'Contoh: 1234567890' },
                    { id: 'accountName', label: 'Atas Nama', placeholder: 'Contoh: PT Bangunan Jaya' },
                    { id: 'bankName', label: 'Nama Bank', placeholder: 'Contoh: BCA, Mandiri, BRI' },
                ]}
                onValidateBeforeOpen={() => {
                    if (!values?.name?.trim()) {
                        showErrorToast({
                            title: 'Perhatian',
                            message: 'Nama wajib diisi terlebih dahulu di Tab Umum.',
                        });
                        return false;
                    }
                    return true;
                }}
                onAdd={(newItem) => onChange('bankAccounts', [...(values?.bankAccounts ?? []), newItem])}
                onRemove={(index) => onChange('bankAccounts', (values?.bankAccounts ?? []).filter((_, i) => i !== index))}
            />
        </div>
    );
}
