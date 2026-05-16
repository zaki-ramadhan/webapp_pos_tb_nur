import {
    ItemGeneralInfoSection,
    ItemMoreInfoSection,
} from './ItemGeneralSections';
import {
    ItemPurchaseTaxSection,
    ItemSalesInfoSection,
} from './ItemSalesPurchaseSections';

export function ItemGeneralTab({ config, values, onChange, isDetail }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
            <ItemGeneralInfoSection
                config={config}
                values={values}
                onChange={onChange}
                isDetail={isDetail}
            />
            <ItemMoreInfoSection config={config} values={values} onChange={onChange} />
        </div>
    );
}

export function ItemSalesPurchaseTab({ config, values, onChange }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1fr)]">
            <ItemSalesInfoSection config={config} values={values} onChange={onChange} />
            <ItemPurchaseTaxSection config={config} values={values} onChange={onChange} />
        </div>
    );
}
