<?php

namespace App\Support\Backend;

use App\Support\Backend\Definitions\CatalogBackendResources;
use App\Support\Backend\Definitions\FinanceBackendResources;
use App\Support\Backend\Definitions\IdentityBackendResources;
use App\Support\Backend\Definitions\OrganizationBackendResources;
use App\Support\Backend\Definitions\PartnerBackendResources;
use Illuminate\Support\Arr;

class BackendResourceRegistry
{
    /**
     * @var array<string, BackendResourceBlueprint>|null
     */
    protected static ?array $cachedResources = null;

    /**
     * @return array<string, BackendResourceBlueprint>
     */
    public static function all(): array
    {
        return self::$cachedResources ??= array_merge(
            IdentityBackendResources::definitions(),
            OrganizationBackendResources::definitions(),
            FinanceBackendResources::definitions(),
            PartnerBackendResources::definitions(),
            CatalogBackendResources::definitions(),
        );
    }

    public static function find(string $key): ?BackendResourceBlueprint
    {
        return Arr::get(self::all(), $key);
    }
}
