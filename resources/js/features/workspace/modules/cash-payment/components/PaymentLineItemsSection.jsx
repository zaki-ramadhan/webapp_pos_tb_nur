import TransactionAccountLineItemsSection from '@/features/workspace/modules/shared/TransactionAccountLineItemsSection';

export default function PaymentLineItemsSection({ config, values, setValues, handlers = {} }) {
    return (
        <TransactionAccountLineItemsSection
            config={config}
            values={values}
            setValues={setValues}
            handlers={handlers}
            searchLabel="Cari akun pembayaran"
            dialogTitle="Pilih Akun Pembayaran"
            queryParams={{ exclude_type: 'Cash/Bank' }}
        />
    );
}
