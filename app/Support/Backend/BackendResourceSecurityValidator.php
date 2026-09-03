<?php

namespace App\Support\Backend;

use App\Models\User;
use App\Support\Backend\BackendResourceRegistry;
use App\Domain\Identity\Models\Role;
use Illuminate\Auth\Access\AuthorizationException;

class BackendResourceSecurityValidator
{
    public function __construct(
        protected BackendResourceAccessService $access
    ) {}

    /**
     * Validasi penugasan cabang.
     *
     * @param  User  $user
     * @param  array<string, mixed>  $payload
     * @return void
     * @throws AuthorizationException
     */
    public function validateBranchAssignment(User $user, array $payload): void
    {
        if ($user->hasAnyRoleCodes(['super_admin'])) {
            return;
        }

        if (isset($payload['branch_id'])) {
            if ($user->branches()->exists()) {
                $allowedBranchIds = $user->branches->pluck('id')->toArray();
                if (! in_array((int) $payload['branch_id'], $allowedBranchIds, true)) {
                    throw new AuthorizationException('Anda tidak memiliki hak akses untuk mengelola data pada cabang ini.');
                }
            }
        }
    }

    /**
     * Validasi eskalasi wewenang.
     *
     * @param  User  $user
     * @param  string  $resource
     * @param  array<string, mixed>  $payload
     * @return void
     * @throws AuthorizationException
     */
    public function validatePrivilegeEscalation(User $user, string $resource, array $payload): void
    {
        if ($user->hasAnyRoleCodes(['super_admin'])) {
            return;
        }

      // Cegah non-super-admin atur role super_admin

        if ($resource === 'users' && isset($payload['role_ids'])) {
            $superAdminRoleId = Role::where('code', 'super_admin')->value('id');
            if ($superAdminRoleId && in_array($superAdminRoleId, $payload['role_ids'])) {
                throw new AuthorizationException('Hanya Super Admin yang berwenang menetapkan hak akses tingkat tertinggi.');
            }
        }

      // Cegah non-super-admin beri izin ekstra

        if ($resource === 'access-groups' && isset($payload['permissions'])) {
            foreach ($payload['permissions'] as $perm) {
                $menuKey = $perm['menu_key'] ?? '';
                if ($menuKey === '*') {
                    throw new AuthorizationException('Hanya Super Admin yang dapat memberikan izin akses penuh (*).');
                }

                $targetBlueprint = BackendResourceRegistry::find($menuKey);
                if ($targetBlueprint) {
                    if (! empty($perm['can_create']) && ! $this->access->can($user, $targetBlueprint, 'create')) {
                        throw new AuthorizationException("Anda tidak dapat memberikan izin tambah pada modul {$targetBlueprint->label} karena Anda tidak memilikinya.");
                    }
                    if (! empty($perm['can_update']) && ! $this->access->can($user, $targetBlueprint, 'update')) {
                        throw new AuthorizationException("Anda tidak dapat memberikan izin ubah pada modul {$targetBlueprint->label} karena Anda tidak memilikinya.");
                    }
                    if (! empty($perm['can_delete']) && ! $this->access->can($user, $targetBlueprint, 'delete')) {
                        throw new AuthorizationException("Anda tidak dapat memberikan izin hapus pada modul {$targetBlueprint->label} karena Anda tidak memilikinya.");
                    }
                    if (! empty($perm['can_view']) && ! $this->access->can($user, $targetBlueprint, 'view')) {
                        throw new AuthorizationException("Anda tidak dapat memberikan izin lihat pada modul {$targetBlueprint->label} karena Anda tidak memilikinya.");
                    }
                }
            }
        }
    }

    /**
     * Validasi kebijakan penghapusan pengguna (Anti-Self-Delete, Anti-Owner-Sikut, Proteksi Admin Sistem).
     *
     * @throws AuthorizationException
     */
    public function validateUserDeletion(User $actor, User $target): void
    {
        if ((int) $actor->id === (int) $target->id) {
            throw new AuthorizationException('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.');
        }

        $developerEmails = [
            'piscokpiscok2610@gmail.com',
            'zakiram4dhan@gmail.com',
        ];
        $targetEmail = strtolower((string) $target->email);
        $actorEmail = strtolower((string) $actor->email);

        $isActorSuperAdmin = in_array($actorEmail, $developerEmails, true) || $actor->hasAnyRoleCodes(['super_admin']);
        $isTargetSuperAdmin = in_array($targetEmail, $developerEmails, true) || $target->hasAnyRoleCodes(['super_admin']);

        if ($isTargetSuperAdmin && ! $isActorSuperAdmin) {
            throw new AuthorizationException('Anda tidak memiliki wewenang untuk menghapus akun Administrator Sistem.');
        }

        if (! $isActorSuperAdmin) {
            $isTargetOwner = $target->hasAnyRoleCodes(['admin', 'owner'])
                || ($target->accessGroups()->where('code', 'OWNER')->exists());

            if ($isTargetOwner) {
                throw new AuthorizationException('Owner tidak memiliki wewenang untuk menghapus akun sesama Owner.');
            }
        }
    }
}
