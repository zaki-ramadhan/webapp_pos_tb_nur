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

                    {/* VOID checkbox — di atas Catatan */}
                    <div className="sm:col-span-2 flex items-center gap-2.5 pt-1 pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <input
                                type="checkbox"
                                checked={Boolean(values.voided)}
                                onChange={(e) =>
                                    setValues((current) => ({
                                        ...current,
                                        voided: e.target.checked,
                                    }))
                                }
                                className="h-4 w-4 rounded-[3px] border-slate-300 text-red-600 cursor-pointer accent-red-600"
                            />
                            <span className="text-sm text-slate-700 group-hover:text-slate-900">
                                VOID
                            </span>
                            <span className="text-xs text-slate-500 font-normal">Ya</span>
                        </label>
                    </div>

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

                    {/* Info rekonsiliasi — di bawah Catatan */}
                    <TransactionFieldLabel label="Rekonsiliasi" />
                    <div className="flex items-center gap-2 py-1">
                        <span
                            className={`inline-flex items-center gap-1.5 text-sm font-normal ${
                                isReconciled ? 'text-emerald-700' : 'text-slate-500'
                            }`}
                        >
                            {isReconciled ? (
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-emerald-600">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0 text-slate-400">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
                                </svg>
                            )}
                            {values.reconcileStatus || 'Belum'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
