import SalesDocumentAdditionalInfoColumn from './SalesDocumentAdditionalInfoColumn';
import SalesDocumentTaxShippingColumn from './SalesDocumentTaxShippingColumn';

export { SalesDocumentAdditionalCostSection, SalesDocumentAdvancePaymentsSection } from './SalesDocumentSupplementarySections';

export function SalesDocumentAdditionalInfoSection({ config, values, setValues, isDetail, handlers }) {
    return (
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
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
