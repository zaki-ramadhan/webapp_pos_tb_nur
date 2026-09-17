import { DepositAmountField, DepositDualTotalFooter, DepositStamp } from '@/features/workspace/modules/shared/DepositWorkspaceShared';

export { DepositAmountField, DepositStamp };

export default function DepositFooter({ values, setValues, onUpdateTaxSettings, readOnly = false }) {
    return <DepositDualTotalFooter values={values} setValues={setValues} onUpdateTaxSettings={onUpdateTaxSettings} readOnly={readOnly} />;
}
