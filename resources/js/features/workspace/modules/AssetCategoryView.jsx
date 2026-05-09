import { useMemo } from 'react';

import SimpleMasterView from '@/features/workspace/modules/SimpleMasterView';
import { buildAssetCategoryConfig } from '@/features/workspace/modules/assetCategoryConfig';

export default function AssetCategoryView(props) {
    const page = useMemo(() => {
        const config = buildAssetCategoryConfig(props.page.assetCategory ?? {});

        return {
            ...props.page,
            table: config.table,
            form: config.form,
        };
    }, [props.page]);

    return <SimpleMasterView {...props} page={page} />;
}
