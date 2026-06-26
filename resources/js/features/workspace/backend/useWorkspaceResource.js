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

    const {
        total,
        loading,
        error,
        reload,
        page,
        perPage,
        lastPage,
        from,
        to,
        setPage,
        setPerPage,
    } = resourceState;

    const mappedRows = useMemo(() => {
        return (resourceState.rows ?? []).map(mapRow);
    }, [resourceState.rows, mapRow]);

    const tableProps = useMemo(() => {
        return {
            rows: mappedRows,
            total,
            loading,
            error,
            onRefresh: reload,
            pagination: {
                page,
                perPage,
                total,
                lastPage,
                from,
                to,
                onPageChange: setPage,
                onPerPageChange: setPerPage,
            },
        };
    }, [
        mappedRows,
        total,
        loading,
        error,
        reload,
        page,
        perPage,
        lastPage,
        from,
        to,
        setPage,
        setPerPage,
    ]);

    return {
        ...resourceState,
        mappedRows,
        tableProps,
    };
}
