<?php

namespace Tests\Feature;

use App\Support\Backend\BackendResourceRegistry;
use Tests\TestCase;

class ActiveWorkspaceBackendCrudCoverageTest extends TestCase
{
    public function test_delivery_order_and_period_end_resources_are_registered(): void
    {
        $resources = BackendResourceRegistry::all();

        $this->assertArrayHasKey('delivery-orders', $resources);
        $this->assertSame('delivery-order', $resources['delivery-orders']->permissionKey());

        $this->assertArrayHasKey('period-ends', $resources);
        $this->assertSame('period-end', $resources['period-ends']->permissionKey());
    }
}
