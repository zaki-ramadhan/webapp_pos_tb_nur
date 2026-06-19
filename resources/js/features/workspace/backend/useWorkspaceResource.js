import { useMemo } from 'react';
import useBackendIndexResource from './useBackendIndexResource';

export default function useWorkspaceResource({
    resource,
    initialPerPage = 25,
    mapRow = (row) => row,
    enabled = true,
}) {
    const resourceState = useBackendIndexResource({
        resource,
        initialPerPage,
        enabled,
    });

    const mappedRows = useMemo(() => {
        return (resourceState.rows ?? []).map(mapRow);
    }, [resourceState.rows, mapRow]);

    const tableProps = useMemo(() => {
        return {
            rows: mappedRows,
            total: resourceState.total,
            loading: resourceState.loading,
            error: resourceState.error,
            onRefresh: resourceState.reload,
            pagination: {
                page: resourceState.page,
                perPage: resourceState.perPage,
                total: resourceState.total,
                lastPage: resourceState.lastPage,
                from: resourceState.from,
                to: resourceState.to,
                onPageChange: resourceState.setPage,
                onPerPageChange: resourceState.setPerPage,
            },
        };
    }, [mappedRows, resourceState]);

    return {
        ...resourceState,
        mappedRows,
        tableProps,
    };
}
