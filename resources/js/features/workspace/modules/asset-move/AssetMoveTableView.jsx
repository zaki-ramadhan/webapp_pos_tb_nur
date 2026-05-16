import { AssetMoveTableSection } from './AssetMoveSections';

export default function AssetMoveTableView({ config, onCreate, onOpenDetail }) {
    return <AssetMoveTableSection config={config} onCreate={onCreate} onOpenDetail={onOpenDetail} />;
}
