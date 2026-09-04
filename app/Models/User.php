<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Domain\Identity\Models\AccessGroup;
use App\Domain\Identity\Models\NumberingSequence;
use App\Domain\Identity\Models\Role;
use App\Domain\Identity\Models\TransactionApprovalRuleStep;
use App\Domain\Organization\Models\Branch;
use App\Domain\Organization\Models\Department;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * Atribut mass-assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'google_id',
        'google_avatar',
        'phone',
        'password',
        'is_active',
        'last_login_at',
        'email_verified_at',
    ];

    /**
     * Atribut tersembunyi untuk serialisasi.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Cast atribut model.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function accessGroups(): BelongsToMany
    {
        return $this->belongsToMany(AccessGroup::class);
    }

    public function branches(): BelongsToMany
    {
        return $this->belongsToMany(Branch::class);
    }

    public function departments(): BelongsToMany
    {
        return $this->belongsToMany(Department::class);
    }

    public function numberingSequences(): BelongsToMany
    {
        return $this->belongsToMany(NumberingSequence::class);
    }

    public function approvalRuleSteps(): HasMany
    {
        return $this->hasMany(TransactionApprovalRuleStep::class, 'approver_user_id');
    }

    /**
     * Daftar email pengembang / Administrator Sistem.
     *
     * @var list<string>
     */
    public const DEVELOPER_EMAILS = [
        'piscokpiscok2610@gmail.com',
        'zakiram4dhan@gmail.com',
    ];

    /**
     * Daftar email pemilik toko (Owner).
     *
     * @var list<string>
     */
    public const OWNER_EMAILS = [
        'nurhayati.karya@gmail.com',
    ];

    /**
     * @param  list<string>  $codes
     */
    public function hasAnyRoleCodes(array $codes): bool
    {
        if ($codes === []) {
            return false;
        }

        if (! $this->exists && ! $this->relationLoaded('roles')) {
            return false;
        }

        $this->loadMissing('roles');

        /** @var Collection<int, Role> $roles */
        $roles = $this->roles;

        return $roles
            ->filter(fn (Role $role): bool => (bool) ($role->is_active ?? true))
            ->contains(fn (Role $role): bool => in_array($role->code, $codes, true));
    }

    /**
     * Periksa apakah pengguna adalah Administrator Sistem (Developer / Super Admin).
     */
    public function isSystemAdmin(): bool
    {
        $email = strtolower(trim((string) $this->email));
        if (in_array($email, self::DEVELOPER_EMAILS, true)) {
            return true;
        }

        if ((bool) ($this->getAttribute('is_super_admin') ?? false)) {
            return true;
        }

        return $this->hasAnyRoleCodes([
            'super_admin',
            'system_admin',
            'administrator_sistem',
            'admin_sistem',
        ]);
    }

    /**
     * Periksa apakah pengguna adalah Owner toko atau Administrator Sistem.
     */
    public function isOwner(): bool
    {
        if ($this->isSystemAdmin()) {
            return true;
        }

        $email = strtolower(trim((string) $this->email));
        if (in_array($email, self::OWNER_EMAILS, true)) {
            return true;
        }

        if ($this->hasAnyRoleCodes(['owner', 'admin'])) {
            return true;
        }

        if (! $this->exists && ! $this->relationLoaded('accessGroups')) {
            return false;
        }

        $this->loadMissing('accessGroups');
        if ($this->accessGroups && $this->accessGroups->contains(function ($group) {
            $code = strtoupper(trim((string) ($group->code ?? '')));
            $name = strtolower(trim((string) ($group->name ?? '')));
            return $code === 'OWNER' || str_contains($name, 'owner') || str_contains($name, 'pemilik');
        })) {
            return true;
        }

        return false;
    }

    /**
     * Periksa apakah pengguna adalah akun berhak istimewa (Administrator Sistem atau Owner).
     */
    public function isPrivileged(): bool
    {
        return $this->isSystemAdmin() || $this->isOwner();
    }

    /**
     * Kirim notifikasi reset password.
     *
     * @param  string  $token
     * @return void
     */
    public function sendPasswordResetNotification($token)
    {
        $this->notify(new \App\Notifications\CustomResetPasswordNotification($token));
    }
}
