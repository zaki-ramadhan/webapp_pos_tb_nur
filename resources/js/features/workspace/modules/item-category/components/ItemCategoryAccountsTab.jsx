import { AccountLookupField } from '@/features/workspace/shared/AccountLookupControls';
import { ItemCategoryFieldRow } from './itemCategoryHelpers';

const ACCOUNT_TYPE_MAP = {
    inventoryAccount: 'Inventory',
    expenseAccount: ['Expense', 'Other Expense'],
    salesAccount: 'Revenue',
    salesReturnAccount: 'Revenue',
    salesDiscountAccount: 'Revenue',
    goodsInTransitAccount: ['Inventory', 'Other Current Asset'],
    costOfGoodsSoldAccount: 'Cost of Sales',
    purchaseReturnAccount: ['Inventory', 'Cost of Sales'],
    unbilledPurchaseAccount: ['Payable', 'Other Current Liability'],
};

export default function ItemCategoryAccountsTab({ config, values, onAccountChange }) {
    return (
        <div className="max-w-[1180px] space-y-4">
            <p className="pt-1 text-xs sm:text-sm italic leading-6 text-brand-dark">{config.accountIntro}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3.5 max-w-[980px]">
                {config.accountFields.map((field) => (
                    <ItemCategoryFieldRow key={field.id} label={field.label}>
                        <AccountLookupField
                            value={values.accounts[field.id] ?? ''}
                            placeholder={config.accountPlaceholder}
                            searchLabel={`Cari ${field.label}`}
                            onRemove={() => onAccountChange(field.id, '', '')}
                            onSelectAccount={(record, label) => onAccountChange(field.id, label, record?.id ?? '')}
                            dialogTitle={`Pilih ${field.label}`}
                            queryParams={{ account_type: ACCOUNT_TYPE_MAP[field.id] }}
                        />
                    </ItemCategoryFieldRow>
                ))}
            </div>

            <div className="flex items-start gap-3 pt-1">
                <span className="mt-0.5 h-6 w-[4px] shrink-0 rounded-full bg-bg-timeline-bar-gray" />
                <p className="text-sm italic leading-6 text-red-550">{config.accountNote}</p>
            </div>
        </div>
    );
}
