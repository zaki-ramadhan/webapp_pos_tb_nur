<?php

namespace App\Http\Requests\Api\Backend;

use App\Support\Backend\BackendResourceAccessService;
use App\Support\Backend\BackendResourceBlueprint;
use App\Support\Backend\BackendResourceRegistry;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

abstract class BackendResourceRequest extends FormRequest
{
    protected ?BackendResourceBlueprint $resolvedBlueprint = null;

    protected ?Model $resolvedRecord = null;

    abstract protected function ability(): string;

    public function authorize(): bool
    {
        $blueprint = $this->blueprint();
        $user = $this->user();

        if ($user === null) {
            return false;
        }

        return app(BackendResourceAccessService::class)
            ->can($user, $blueprint, $this->ability());
    }

    public function blueprint(): BackendResourceBlueprint
    {
        if ($this->resolvedBlueprint !== null) {
            return $this->resolvedBlueprint;
        }

        $resource = (string) $this->route('resource');
        $blueprint = BackendResourceRegistry::find($resource);

        if ($blueprint === null) {
            throw new NotFoundHttpException("Backend resource [{$resource}] is not registered.");
        }

        return $this->resolvedBlueprint = $blueprint;
    }

    public function record(): Model
    {
        if ($this->resolvedRecord !== null) {
            return $this->resolvedRecord;
        }

        $modelClass = $this->blueprint()->modelClass();
        $recordId = (int) $this->route('record');

        return $this->resolvedRecord = $modelClass::query()->findOrFail($recordId);
    }
}
