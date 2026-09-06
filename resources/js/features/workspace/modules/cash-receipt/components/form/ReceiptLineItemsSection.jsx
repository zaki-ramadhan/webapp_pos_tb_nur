import TransactionAccountLineItemsSection from '@/features/workspace/modules/shared/TransactionAccountLineItemsSection';

export function ReceiptLineItemsSection({ config, values, setValues, handlers = {} }) {
    return (
        <TransactionAccountLineItemsSection
            config={config}
            values={values}
            setValues={setValues}
            handlers={handlers}
            searchLabel="Cari akun penerimaan"
            dialogTitle="Pilih Akun Penerimaan"
            queryParams={{ exclude_type: 'Cash/Bank' }}
        />
    );
}
