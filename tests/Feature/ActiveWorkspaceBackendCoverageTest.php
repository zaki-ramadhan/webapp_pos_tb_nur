<?php

namespace Tests\Feature;

use App\Support\Backend\BackendResourceRegistry;
use Tests\TestCase;

class ActiveWorkspaceBackendCoverageTest extends TestCase
{
    public function test_all_active_implemented_workspace_pages_have_backend_coverage(): void
    {
        $implementedPageIds = $this->readQuotedSet(
            resource_path('js/features/workspace/shared/implementedWorkspacePageIds.js'),
        );
        $inactivePageIds = $this->readQuotedSet(
            resource_path('js/features/workspace/shared/workspaceAvailability.js'),
        );

        $activeImplementedPageIds = array_values(array_filter(
            $implementedPageIds,
            fn (string $pageId) => ! in_array($pageId, $inactivePageIds, true),
        ));

        $coveredPageIds = collect(BackendResourceRegistry::all())
            ->flatMap(function ($blueprint): array {
                $candidates = [$blueprint->permissionKey(), $blueprint->key];

                return array_values(array_filter($candidates, fn ($value) => is_string($value) && $value !== ''));
            })
            ->map(fn (string $value) => $this->normalizeResourceIdentifier($value))
            ->unique()
            ->all();

        $manualAliases = [
            'department' => 'departments',
            'currency-master' => 'currencies',
            'company-tax' => 'taxes',
            'salary-allowance' => 'salary-allowances',
            'warehouse-master' => 'warehouses',
            'items-services' => 'products',
            'item-unit' => 'units',
            'item-category' => 'product-categories',
            'supplier-price' => 'supplier-prices',
            'group-access' => 'access-groups',
            'transaction-approval' => 'transaction-approval-rules',
        ];

        $missing = array_values(array_filter(
            $activeImplementedPageIds,
            function (string $pageId) use ($coveredPageIds, $manualAliases): bool {
                $normalizedPageId = $this->normalizeResourceIdentifier($pageId);
                $normalizedAlias = isset($manualAliases[$pageId])
                    ? $this->normalizeResourceIdentifier($manualAliases[$pageId])
                    : null;

                return ! in_array($normalizedPageId, $coveredPageIds, true)
                    && ($normalizedAlias === null || ! in_array($normalizedAlias, $coveredPageIds, true));
            },
        ));

        $this->assertSame([], $missing, 'Missing backend coverage for active implemented pages: '.implode(', ', $missing));
    }

    /**
     * @return array<int, string>
     */
    private function readQuotedSet(string $path): array
    {
        $content = file_get_contents($path);

        preg_match_all("/'([^']+)'/", $content ?: '', $matches);

        return array_values(array_unique($matches[1] ?? []));
    }

    private function normalizeResourceIdentifier(string $value): string
    {
        return str_replace('_', '-', $value);
    }
}
