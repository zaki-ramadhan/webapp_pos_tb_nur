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
        if ($user->isPrivileged() || $user->hasAnyRoleCodes(['super_admin', 'owner', 'admin'])) {
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
        if ($user->isSystemAdmin() || $user->hasAnyRoleCodes(['super_admin'])) {
            return;
        }

        // Cegah non-super-admin atur role super_admin
        if ($resource === 'users' && isset($payload['role_ids'])) {
            $superAdminRoleId = Role::where('code', 'super_admin')->value('id');
            if ($superAdminRoleId && in_array($superAdminRoleId, $payload['role_ids'])) {
                throw new AuthorizationException('Hanya Super Admin yang berwenang menetapkan hak akses tingkat tertinggi.');
            }
        }

        // Cegah non-super-admin / non-owner berikan grup akses OWNER
        if ($resource === 'users' && isset($payload['access_group_ids'])) {
            $ownerGroupId = \App\Domain\Identity\Models\AccessGroup::where('code', 'OWNER')->value('id');
            if ($ownerGroupId && in_array($ownerGroupId, $payload['access_group_ids'])) {
                if (! $user->isSystemAdmin() && ! $user->isOwner()) {
                    throw new AuthorizationException('Hanya Pemilik Toko (Owner) atau Super Admin yang berwenang menetapkan grup akses Owner.');
                }
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

        $developerEmails = User::DEVELOPER_EMAILS;
        $targetEmail = strtolower((string) $target->email);
        $actorEmail = strtolower((string) $actor->email);

        $isActorDeveloper = $actor->isSystemAdmin() || in_array($actorEmail, $developerEmails, true);
        $isTargetDeveloper = $target->isSystemAdmin() || in_array($targetEmail, $developerEmails, true);

        if ($isTargetDeveloper) {
            if (! $isActorDeveloper) {
                throw new AuthorizationException('Anda tidak memiliki wewenang untuk menghapus akun Administrator Sistem.');
            }

            $totalAdmins = User::whereIn('email', $developerEmails)->count();
            if ($totalAdmins <= 1) {
                throw new AuthorizationException('Tidak dapat menghapus akun Administrator Sistem terakhir.');
            }
        }

        if (! $isActorDeveloper) {
            $isTargetOwner = $target->isOwner() || in_array($targetEmail, User::OWNER_EMAILS, true);

            if ($isTargetOwner) {
                throw new AuthorizationException('Owner tidak memiliki wewenang untuk menghapus akun sesama Owner.');
            }
        }
    }

    /**
     * Validasi kebijakan pembaruan pengguna (Anti-Account-Takeover).
     *
     * @throws AuthorizationException
     */
    public function validateUserUpdate(User $actor, User $target, array $payload): void
    {
        $developerEmails = User::getDeveloperEmails();
        $targetEmail = strtolower((string) $target->email);
        $actorEmail = strtolower((string) $actor->email);

        $isActorDeveloper = $actor->isSystemAdmin() || in_array($actorEmail, $developerEmails, true);
        $isTargetDeveloper = $target->isSystemAdmin() || in_array($targetEmail, $developerEmails, true);

        // Jika target adalah Developer / Administrator Sistem, hanya Developer lain yang boleh mengedit
        if ($isTargetDeveloper && ! $isActorDeveloper) {
            throw new AuthorizationException('Anda tidak memiliki wewenang untuk mengubah data akun Administrator Sistem.');
        }

        // Jika target adalah Owner, hanya Developer atau akun Owner itu sendiri yang boleh mengedit
        if (! $isActorDeveloper) {
            $isTargetOwner = $target->isOwner() || in_array($targetEmail, User::getOwnerEmails(), true);
            $isActorOwner = $actor->isOwner() || in_array($actorEmail, User::getOwnerEmails(), true);

            if ($isTargetOwner && (! $isActorOwner || (int) $actor->id !== (int) $target->id)) {
                throw new AuthorizationException('Anda tidak memiliki wewenang untuk mengubah data akun Pemilik Toko (Owner).');
            }
        }

        // Jika bukan Super Admin / Owner, dan bukan akunnya sendiri, tidak boleh mengganti password user lain sembarangan
        if (!empty($payload['password']) && (int) $actor->id !== (int) $target->id) {
            if (! $actor->isSystemAdmin() && ! $actor->isOwner() && ! $actor->hasAnyRoleCodes(['super_admin', 'owner'])) {
                throw new AuthorizationException('Hanya Administrator yang berwenang mengubah password pengguna lain.');
            }
        }
    }
}
