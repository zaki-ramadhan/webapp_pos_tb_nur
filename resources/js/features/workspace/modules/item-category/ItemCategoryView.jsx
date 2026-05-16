import ItemCategoryFormView from './ItemCategoryFormView';
import ItemCategoryTableView from './ItemCategoryTableView';

export default function ItemCategoryView({ page, mode, activeLevel2Tab, onOpenContent, onOpenDetail }) {
    return mode === 'table' ? (
        <ItemCategoryTableView page={page} onCreate={onOpenContent} onOpenDetail={onOpenDetail} />
    ) : (
        <ItemCategoryFormView page={page} activeLevel2Tab={activeLevel2Tab} />
    );
}
