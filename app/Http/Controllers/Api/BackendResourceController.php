<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\Backend\BackendResourceIndexRequest;
use App\Http\Requests\Api\Backend\BackendResourceStoreRequest;
use App\Http\Requests\Api\Backend\BackendResourceUpdateRequest;
use App\Support\Backend\BackendResourceAccessService;
use App\Support\Backend\BackendResourceBlueprint;
use App\Support\Backend\BackendResourceIndexQuery;
use App\Support\Backend\BackendResourcePayloadSanitizer;
use App\Support\Backend\BackendResourceRegistry;
use App\Support\Backend\BackendResourceWriter;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class BackendResourceController extends Controller
{
    public function __construct(
        protected BackendResourceAccessService $access,
        protected BackendResourceIndexQuery $indexQuery,
        protected BackendResourcePayloadSanitizer $payloadSanitizer,
        protected BackendResourceWriter $writer,
    ) {
    }

    public function resources(Request $request): JsonResponse
    {
        return response()->json([
            'data' => $this->access->visibleResourcesFor($request->user()),
        ]);
    }

    public function index(BackendResourceIndexRequest $request, string $resource): JsonResponse
    {
        $records = $this->indexQuery->paginate(
            $request->blueprint(),
            $request->validated(),
        );

        return response()->json($records);
    }

    public function store(BackendResourceStoreRequest $request, string $resource): JsonResponse
    {
        $blueprint = $request->blueprint();
        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $record = $this->writer->create($blueprint, $payload);

        return response()->json([
            'message' => "{$blueprint->label} created successfully.",
            'data' => $record,
        ], 201);
    }

    public function show(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'view');

        return response()->json([
            'data' => $this->findRecord($blueprint, $record),
        ]);
    }

    public function update(BackendResourceUpdateRequest $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $request->blueprint();
        $entity = $this->findRecord($blueprint, $record);
        $payload = $this->payloadSanitizer->sanitize($request->validated());
        $entity = $this->writer->update($blueprint, $entity, $payload);

        return response()->json([
            'message' => "{$blueprint->label} updated successfully.",
            'data' => $entity,
        ]);
    }

    public function destroy(Request $request, string $resource, int $record): JsonResponse
    {
        $blueprint = $this->resolveBlueprint($resource);
        $this->access->authorize($request->user(), $blueprint, 'delete');
        $entity = $this->findRecord($blueprint, $record);

        $this->writer->delete($entity);

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

    protected function findRecord(BackendResourceBlueprint $blueprint, int $record): Model
    {
        $modelClass = $blueprint->modelClass();

        return $modelClass::query()
            ->with($blueprint->with)
            ->findOrFail($record);
    }
}
