import { buildAssetDisposalRecord } from './assetDisposalConfig';

export function buildFormValues(config, detailRow = null) {
    return buildAssetDisposalRecord(detailRow ?? {}, config);
}
