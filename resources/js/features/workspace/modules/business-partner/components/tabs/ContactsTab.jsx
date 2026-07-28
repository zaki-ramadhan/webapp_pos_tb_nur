import { showErrorToast } from '@/components/feedback/toast';
import { PartnerInlineTableSection } from '@/features/workspace/modules/business-partner/BusinessPartnerViewShared';

export default function ContactsTab({ config, values, onChange }) {
    return (
        <PartnerInlineTableSection
            title={config.contactsTable.title}
            addButtonTitle="Tambah Kontak"
            modalTitle="Tambah Kontak Baru"
            columns={[
                { id: 'fullName', label: 'Nama Lengkap' },
                { id: 'title', label: 'Posisi Jabatan' },
                { id: 'email', label: 'Email' },
                { id: 'mobilePhone', label: 'Handphone' },
            ]}
            items={values?.contacts ?? []}
            emptyLabel={config.contactsTable.emptyLabel}
            fields={[
                { id: 'fullName', label: 'Nama Lengkap', required: true, placeholder: 'Contoh: Ahmad Hidayat' },
                { id: 'title', label: 'Posisi Jabatan', placeholder: 'Contoh: Sales Manager' },
                { id: 'email', label: 'Email', placeholder: 'Contoh: ahmad@supplier.com' },
                { id: 'mobilePhone', label: 'Handphone', placeholder: 'Contoh: 08123456789' },
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
            onAdd={(newItem) => onChange('contacts', [...(values?.contacts ?? []), newItem])}
            onRemove={(index) => onChange('contacts', (values?.contacts ?? []).filter((_, i) => i !== index))}
        />
    );
}
