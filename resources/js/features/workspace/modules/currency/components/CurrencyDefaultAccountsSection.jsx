import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import CurrencyFieldRow from './CurrencyFieldRow';

export default function CurrencyDefaultAccountsSection({ config, values, setValues }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[1180px]">
            {config.accountFields.map((field) => (
                <CurrencyFieldRow key={field.id} label={field.label}>
                    <AccountLookupField
                        value={values.defaultAccounts[field.id] ?? ''}
                        placeholder={config.accountPlaceholder}
                        searchLabel={`Cari ${field.label}`}
                        dialogTitle={`Pilih ${field.label}`}
                        onSelectAccount={(record, label) =>
                            setValues((current) => ({
                                ...current,
                                defaultAccounts: {
                                    ...current.defaultAccounts,
                                    [field.id]: label,
                                },
                                defaultAccountIds: {
                                    ...current.defaultAccountIds,
                                    [field.id]: record?.id ?? null,
                                },
                            }))
                        }
                        onRemove={() =>
                            setValues((current) => ({
                                ...current,
                                defaultAccounts: {
                                    ...current.defaultAccounts,
                                    [field.id]: '',
                                },
                                defaultAccountIds: {
                                    ...current.defaultAccountIds,
                                    [field.id]: null,
                                },
                            }))
                        }
                    />
                </CurrencyFieldRow>
            ))}
        </div>
    );
}
