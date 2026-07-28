import TextInput from '@/components/ui/TextInput';
import {
    TransactionFieldLabel,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PaymentInfoSection({ config, values, setValues }) {
    return (
        <div className="w-full">
            <div className="lg:max-w-[50%] w-full">
                <TransactionSectionHeading title={config.infoTitle} icon="document" />

                <div className="mt-4 grid gap-y-2.5 sm:grid-cols-[170px_minmax(0,1fr)] sm:items-start sm:gap-x-4 pl-3 sm:pl-5">
                    <TransactionFieldLabel label={config.labels.checkNumber} />
                    <div className="max-w-[276px]">
                        <TextInput
                            value={values.checkNumber}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    checkNumber: event.target.value,
                                }))
                            }
                            className="h-[34px] rounded-[4px] border-ui-border"
                            inputClassName="text-xs sm:text-sm text-brand-dark"
                        />
                    </div>

                    <TransactionFieldLabel label={config.labels.recipient} />
                    <TransactionReadonlyTextarea
                        value={values.recipient}
                        readOnly={false}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                recipient: event.target.value,
                             }))
                        }
                        className="min-h-[56px]"
                    />

                    <TransactionFieldLabel label={config.labels.notes} />
                    <TransactionReadonlyTextarea
                        value={values.notes}
                        readOnly={false}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                notes: event.target.value,
                            }))
                        }
                        rows={4}
                        className="min-h-[70px]"
                    />
                </div>
            </div>
        </div>
    );
}
