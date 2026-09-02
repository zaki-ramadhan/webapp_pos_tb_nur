import BackendLookupField from '@/features/workspace/shared/BackendLookupField';

export function resolveSelectedUserKey(user, index) {
    if (user && typeof user === 'object') {
        return user.id ?? user.label ?? index;
    }

    return user ?? index;
}

export function resolveSelectedUserLabel(user) {
    if (user && typeof user === 'object') {
        return user.label ?? user.name ?? '';
    }

    return String(user ?? '');
}

export default function GroupAccessUserLookupField({ field, selectedUsers, currentGroupId = null, onAddUser, onRemoveUser }) {
    const isUserAvailable = (user) => {
        const groups = (
            user?.access_groups ||
            user?.accessGroups ||
            (user?.access_group_ids ? user.access_group_ids.map((id) => ({ id })) : []) ||
            (user?.accessGroupIds ? user.accessGroupIds.map((id) => ({ id })) : [])
        );

        if (!Array.isArray(groups) || groups.length === 0) {
            return true;
        }

        const groupIds = groups
            .map((g) => String(typeof g === 'object' ? (g?.id ?? '') : g))
            .filter(Boolean);

        if (groupIds.length === 0) {
            return true;
        }

        if (!currentGroupId) {
            return false;
        }

        return groupIds.every((id) => id === String(currentGroupId));
    };

    return (
        <div className="w-full max-w-[430px]">
            <BackendLookupField
                resource="users"
                values={selectedUsers}
                placeholder={field.placeholder}
                searchLabel={`Cari ${field.label}`}
                filterOption={isUserAvailable}
                getOptionLabel={(option) => option.label ?? option.name ?? ''}
                onSelect={(user) => {
                    onAddUser({
                        id: user.id,
                        label: user.name ?? user.email ?? `Pengguna ${user.id}`,
                    });
                }}
                onRemove={onRemoveUser}
            />
        </div>
    );
}
