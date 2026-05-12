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

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'is_active',
        'last_login_at',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
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
     * @param  list<string>  $codes
     */
    public function hasAnyRoleCodes(array $codes): bool
    {
        if ($codes === []) {
            return false;
        }

        $this->loadMissing('roles');

        /** @var Collection<int, Role> $roles */
        $roles = $this->roles;

        return $roles
            ->filter(fn (Role $role): bool => (bool) $role->is_active)
            ->contains(fn (Role $role): bool => in_array($role->code, $codes, true));
    }
}
