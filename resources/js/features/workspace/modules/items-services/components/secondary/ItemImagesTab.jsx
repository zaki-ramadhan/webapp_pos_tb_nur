import { SectionHeading } from '@/features/workspace/modules/items-services/itemsServicesViewShared';
import AttachmentUploadField from '@/features/workspace/shared/AttachmentUploadField';

export default function ItemImagesTab({ values, onChange }) {
    const currentCount = (values.attachments ?? []).length;
    const maxFiles = 5;

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-3">
                <SectionHeading title={`Gambar / Foto Produk (${currentCount}/${maxFiles})`} />
                <div className="mt-4">
                    <AttachmentUploadField
                        value={values.attachments ?? []}
                        onChange={(newList) => onChange('attachments', newList)}
                        accept="image/*"
                        multiple={true}
                        maxFiles={maxFiles}
                        label=""
                    />
                </div>
            </section>
            <div></div>
        </div>
    );
}
