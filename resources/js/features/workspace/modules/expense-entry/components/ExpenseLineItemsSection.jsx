import TransactionAccountLineItemsSection from '@/features/workspace/modules/shared/TransactionAccountLineItemsSection';

export default function ExpenseLineItemsSection({ config, values, setValues, handlers = {} }) {
    return (
        <TransactionAccountLineItemsSection
            config={config}
            values={values}
            setValues={setValues}
            handlers={handlers}
            searchLabel="Cari akun rincian beban"
            dialogTitle="Pilih Akun Rincian Beban"
            queryParams={{ account_type: ['Expense', 'Other Expense', 'Cost of Sales'] }}
        />
    );
}
