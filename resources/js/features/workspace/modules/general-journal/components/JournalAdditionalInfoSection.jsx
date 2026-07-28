import TextareaField from '@/components/ui/TextareaField';
import {
    TransactionFieldLabel,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function JournalAdditionalInfoSection({ config, values, setValues, handlers = {} }) {
    const isManual = values.transactionTypeValue === 'general-journal';

    return (
        <div className="min-h-0">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.additionalInfoTitle} icon="info" />

                <div className="mt-4 grid gap-4 lg:grid-cols-[160px_minmax(0,1fr)] lg:items-start pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.notes} />
                    <TextareaField
                        value={values.notes}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        readOnly={!isManual}
                        rows={4}
                        className="border-ui-border"
                        textareaClassName="min-h-[70px] text-xs sm:text-sm text-brand-dark"
                    />
                </div>
            </div>
        </div>
    );
}
