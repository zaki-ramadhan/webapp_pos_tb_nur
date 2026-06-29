import SalesDocumentAdditionalInfoColumn from './SalesDocumentAdditionalInfoColumn';
import SalesDocumentTaxShippingColumn from './SalesDocumentTaxShippingColumn';

export { SalesDocumentAdditionalCostSection, SalesDocumentAdvancePaymentsSection } from './SalesDocumentSupplementarySections';

export function SalesDocumentAdditionalInfoSection({ config, values, setValues, isDetail, handlers }) {
    return (
        <div className="grid gap-8 grid-cols-1 lg:grid-cols-2">
            <SalesDocumentAdditionalInfoColumn
                config={config}
                values={values}
                setValues={setValues}
                isDetail={isDetail}
                handlers={handlers}
            />
            <SalesDocumentTaxShippingColumn
                config={config}
                values={values}
                setValues={setValues}
                handlers={handlers}
            />
        </div>
    );
}
