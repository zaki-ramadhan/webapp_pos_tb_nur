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
        <div className="grid gap-8 lg:grid-cols-2">
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
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemSalesInfoSection config={config} values={values} onChange={onChange} />
            <ItemPurchaseTaxSection config={config} values={values} onChange={onChange} />
        </div>
    );
}
