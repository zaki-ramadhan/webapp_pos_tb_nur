import TextareaField from '@/components/ui/TextareaField';
import {
    FormRow,
    SectionHeading,
    SimpleTextField,
} from '@/features/workspace/modules/items-services/itemsServicesViewShared';

export default function ItemOtherTab({ config, values, onChange }) {
    const isService = values.kind === 'Jasa';

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <section className="space-y-2">
                <SectionHeading title={config.labels.otherInfo} />

                <div className="mt-4 space-y-2">
                    <FormRow label="Catatan">
                        <TextareaField
                            value={values.notes}
                            onChange={(event) => onChange('notes', event.target.value)}
                            rows={4}
                            className="rounded-[4px] border-ui-border w-full"
                            textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                            maxLength={500}
                        />
                    </FormRow>
                </div>
            </section>

            {!isService && (
                <section className="space-y-2">
                    <SectionHeading title={config.labels.dimensionInfo} />

                    <div className="mt-4 space-y-2">
                        <FormRow label="Panjang (cm)">
                            <SimpleTextField
                                value={values.length}
                                onChange={(event) => onChange('length', event.target.value)}
                                formatAsAmount
                                maxLength={10}
                            />
                        </FormRow>

                        <FormRow label="Lebar (cm)">
                            <SimpleTextField
                                value={values.width}
                                onChange={(event) => onChange('width', event.target.value)}
                                formatAsAmount
                                maxLength={10}
                            />
                        </FormRow>

                        <FormRow label="Tinggi (cm)">
                            <SimpleTextField
                                value={values.height}
                                onChange={(event) => onChange('height', event.target.value)}
                                formatAsAmount
                                maxLength={10}
                            />
                        </FormRow>

                        <FormRow label="Berat (gr)">
                            <SimpleTextField
                                value={values.weight}
                                onChange={(event) => onChange('weight', event.target.value)}
                                formatAsAmount
                                allowDecimal={false}
                                maxLength={10}
                            />
                        </FormRow>
                    </div>
                </section>
            )}
        </div>
    );
}
