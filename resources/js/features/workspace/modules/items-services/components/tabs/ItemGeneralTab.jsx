import {
    ItemGeneralInfoSection,
    ItemMoreInfoSection,
} from '../ItemGeneralSections';

export function ItemGeneralTab({ config, values, onChange, isDetail, isLoading }) {
    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <ItemGeneralInfoSection
                config={config}
                values={values}
                onChange={onChange}
                isDetail={isDetail}
                isLoading={isLoading}
            />
            <ItemMoreInfoSection config={config} values={values} onChange={onChange} isLoading={isLoading} />
        </div>
    );
}
