<?php

namespace Tests\Unit;

use App\Domain\Identity\Models\AccessGroup;
use App\Domain\Identity\Models\Role;
use App\Models\User;
use App\Support\Backend\BackendResourceAccessService;
use App\Support\Backend\BackendResourceBlueprint;
use Tests\TestCase;

class PrivilegedAccessTest extends TestCase
{
    public function test_developer_emails_are_identified_as_system_admin_and_privileged(): void
    {
        $user1 = new User(['email' => 'piscokpiscok2610@gmail.com']);
        $this->assertTrue($user1->isSystemAdmin());
        $this->assertTrue($user1->isOwner());
        $this->assertTrue($user1->isPrivileged());

        $user2 = new User(['email' => 'zakiram4dhan@gmail.com']);
        $this->assertTrue($user2->isSystemAdmin());
        $this->assertTrue($user2->isOwner());
        $this->assertTrue($user2->isPrivileged());
    }

    public function test_owner_email_is_identified_as_owner_and_privileged(): void
    {
        $owner = new User(['email' => 'nurhayati.karya@gmail.com']);
        $this->assertFalse($owner->isSystemAdmin());
        $this->assertTrue($owner->isOwner());
        $this->assertTrue($owner->isPrivileged());
    }

    public function test_regular_user_is_not_privileged_by_default(): void
    {
        $cashier = new User(['email' => 'kasir@tokonur.com']);
        $this->assertFalse($cashier->isSystemAdmin());
        $this->assertFalse($cashier->isOwner());
        $this->assertFalse($cashier->isPrivileged());
    }

    public function test_privileged_user_has_unrestricted_can_access(): void
    {
        $user = new User(['email' => 'piscokpiscok2610@gmail.com']);
        $service = new BackendResourceAccessService();

        $blueprint = new BackendResourceBlueprint('accounts', 'Akun', User::class);

        $this->assertTrue($service->can($user, $blueprint, 'view'));
        $this->assertTrue($service->can($user, $blueprint, 'create'));
        $this->assertTrue($service->can($user, $blueprint, 'update'));
        $this->assertTrue($service->can($user, $blueprint, 'delete'));
        $this->assertNull($service->getUserTimeRestrictionMessage($user));

        $abilities = $service->abilitiesMapFor($user);
        $this->assertTrue($abilities['accounts']['view']);
        $this->assertTrue($abilities['accounts']['create']);
        $this->assertTrue($abilities['accounts']['update']);
        $this->assertTrue($abilities['accounts']['delete']);
    }

    public function test_authenticated_user_presenter_for_system_admin_and_owner(): void
    {
        $dev = new User(['name' => 'Developer', 'email' => 'piscokpiscok2610@gmail.com']);
        $devData = \App\Support\Presentation\AuthenticatedUserPresenter::present($dev);

        $this->assertSame('Administrator Sistem', $devData['role']);
        $this->assertTrue($devData['isSuperAdmin']);
        $this->assertTrue($devData['isOwner']);
        $this->assertTrue($devData['isPrivileged']);
        $this->assertTrue($devData['hasAccessGroup']);
        $this->assertTrue($devData['abilities']['accounts']['view']);

        $owner = new User(['name' => 'Owner', 'email' => 'nurhayati.karya@gmail.com']);
        $ownerData = \App\Support\Presentation\AuthenticatedUserPresenter::present($owner);

        $this->assertSame('Owner', $ownerData['role']);
        $this->assertFalse($ownerData['isSuperAdmin']);
        $this->assertTrue($ownerData['isOwner']);
        $this->assertTrue($ownerData['isPrivileged']);
        $this->assertTrue($ownerData['hasAccessGroup']);
        $this->assertTrue($ownerData['abilities']['accounts']['view']);
    }
}
