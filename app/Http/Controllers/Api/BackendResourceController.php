<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\Backend\BackendResourceBlueprint;
use App\Support\Backend\BackendResourceRegistry;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BackendResourceController extends Controller
{
    public function resources(): JsonResponse
    {
        return response()->json([
            'data' => array_values(array_map(
                fn (BackendResourceBlueprint $blueprint) => [
                    'key' => $blueprint->key,
                    'label' => $blueprint->label,
                    'model' => $blueprint->modelClass,
                ],
                BackendResourceRegistry::all(),
            )),
        ]);
    }

    public function index(Request $request, string $resource): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $modelClass = $blueprint->modelClass();
        $perPage = max(1, min((int) $request->integer('per_page', 15), 100));
        $query = $modelClass::query()->with($blueprint->with);

        if ($request->filled('search')) {
            $this->applySearch(
                $query,
                $request->string('search')->toString(),
                $blueprint->searchColumns,
            );
        }

        $records = $query->orderByDesc('id')->paginate($perPage)->withQueryString();

        return response()->json($records);
    }

    public function store(Request $request, string $resource): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $payload = $request->validate($blueprint->storeRules());
        $record = $this->newModel($blueprint);
        $payload = $this->sanitizePayload($payload);

        $record->fill(Arr::only($payload, $record->getFillable()));
        $record->save();

        $blueprint->sync($record, $payload);

        return response()->json([
            'message' => "{$blueprint->label} created successfully.",
            'data' => $record->fresh($blueprint->with),
        ], 201);
    }

    public function show(string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);

        return response()->json([
            'data' => $this->findRecord($blueprint, $record),
        ]);
    }

    public function update(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $entity = $this->findRecord($blueprint, $record);
        $payload = $request->validate($blueprint->updateRules($entity));
        $payload = $this->sanitizePayload($payload);

        $entity->fill(Arr::only($payload, $entity->getFillable()));
        $entity->save();

        $blueprint->sync($entity, $payload);

        return response()->json([
            'message' => "{$blueprint->label} updated successfully.",
            'data' => $entity->fresh($blueprint->with),
        ]);
    }

    public function destroy(string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $entity = $this->findRecord($blueprint, $record);

        $entity->delete();

        return response()->json([
            'message' => "{$blueprint->label} deleted successfully.",
        ]);
    }

    protected function resolveBlueprint(string $resource): BackendResourceBlueprint
    {
        $blueprint = BackendResourceRegistry::find($resource);

        if ($blueprint === null) {
            throw new NotFoundHttpException("Backend resource [{$resource}] is not registered.");
        }

        return $blueprint;
    }

    protected function newModel(BackendResourceBlueprint $blueprint): Model
    {
        $modelClass = $blueprint->modelClass();

        return new $modelClass();
    }

    protected function findRecord(BackendResourceBlueprint $blueprint, int $record): Model
    {
        $modelClass = $blueprint->modelClass();

        return $modelClass::query()
            ->with($blueprint->with)
            ->findOrFail($record);
    }

    protected function applySearch(Builder $query, string $term, array $searchColumns): void
    {
        $keyword = trim($term);

        if ($keyword === '' || $searchColumns === []) {
            return;
        }

        $query->where(function (Builder $builder) use ($keyword, $searchColumns): void {
            foreach ($searchColumns as $index => $column) {
                if ($index === 0) {
                    $builder->where($column, 'like', "%{$keyword}%");
                    continue;
                }

                $builder->orWhere($column, 'like', "%{$keyword}%");
            }
        });
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    protected function sanitizePayload(array $payload): array
    {
        if (array_key_exists('password', $payload) && blank($payload['password'])) {
            unset($payload['password']);
        }

        return $payload;
    }
}
