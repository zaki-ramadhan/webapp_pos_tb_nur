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

export default function GroupAccessUserLookupField({ field, selectedUsers, onAddUser, onRemoveUser }) {
    return (
        <div className="w-full max-w-[880px]">
            <BackendLookupField
                resource="users"
                values={selectedUsers}
                placeholder={field.placeholder}
                searchLabel={`Cari ${field.label}`}
                getOptionLabel={(option) => option.label ?? option.name ?? ''}
                onSelect={(user) => {
                    onAddUser({
                        id: user.id,
                        label: user.name ?? user.email ?? `Pengguna #${user.id}`,
                    });
                }}
                onRemove={onRemoveUser}
            />
        </div>
    );
}
