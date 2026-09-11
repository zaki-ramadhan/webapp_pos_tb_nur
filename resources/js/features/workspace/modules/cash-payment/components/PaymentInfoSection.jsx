import TextInput from '@/components/ui/TextInput';
import {
    TransactionFieldLabel,
    TransactionReadonlyTextarea,
    TransactionSectionHeading,
} from '@/features/workspace/modules/shared/TransactionWorkspaceShared';

export default function PaymentInfoSection({ config, values, setValues, isDetail }) {
    const isReconciled = values.reconcileStatus && values.reconcileStatus !== 'Belum';

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

                    {/* VOID checkbox — kolom kiri label V O I D, kolom kanan checkbox Ya */}
                    {isDetail && (
                        <>
                            <TransactionFieldLabel label="V O I D" htmlFor="voided-checkbox" />
                            <div className="flex items-center h-[34px]">
                                <label htmlFor="voided-checkbox" className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        id="voided-checkbox"
                                        type="checkbox"
                                        checked={Boolean(values.voided)}
                                        onChange={(e) =>
                                            setValues((current) => ({
                                                ...current,
                                                voided: e.target.checked,
                                            }))
                                        }
                                        className="h-4.5 w-4.5 rounded-[3px] border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                                    />
                                    <span className="text-xs sm:text-sm text-brand-dark">Ya</span>
                                </label>
                            </div>
                        </>
                    )}

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

                    {/* Terekonsiliasi — teks persis seperti Foto 2 */}
                    {isDetail && (
                        <>
                            <TransactionFieldLabel label="Terekonsiliasi" />
                            <div className="py-1 text-xs sm:text-sm text-brand-dark">
                                {values.reconcileStatus || 'Belum'}
                            </div>

                            <TransactionFieldLabel label="Dicetak/email" />
                            <div className="max-w-[276px]">
                                <TextInput
                                    value={values.printStatus || 'Belum cetak/email'}
                                    readOnly
                                    className="h-[34px] rounded-[4px] border-ui-border bg-slate-50/70"
                                    inputClassName="text-xs sm:text-sm text-slate-600 cursor-default"
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
