<?php

namespace App\Support\Backend;

use Closure;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class BackendResourceBlueprint
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<int, string>  $searchColumns
     * @param  array<int, string>  $with
     * @param  array<string, mixed>|Closure(): array<string, mixed>  $indexRules
     * @param  array<string, mixed>|Closure(): array<string, mixed>  $storeRules
     * @param  array<string, mixed>|Closure(Model): array<string, mixed>|null  $updateRules
     * @param  (Closure(array<string, mixed>): LengthAwarePaginator|array<string, mixed>)|null  $indexUsing
     * @param  (Closure(int): Model|array<string, mixed>|null)|null  $showUsing
     * @param  (Closure(Model, array<string, mixed>): void)|null  $syncUsing
     */
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly string $modelClass,
        public readonly ?string $permissionKey = null,
        public readonly array $searchColumns = [],
        public readonly array $with = [],
        public readonly array|Closure $indexRules = [],
        public readonly array|Closure $storeRules = [],
        public readonly array|Closure|null $updateRules = null,
        public readonly ?Closure $indexUsing = null,
        public readonly ?Closure $showUsing = null,
        public readonly ?Closure $syncUsing = null,
        public readonly bool $readOnly = false,
    ) {
    }

    /**
     * @return array<string, mixed>
     */
    public function indexRules(): array
    {
        return is_array($this->indexRules) ? $this->indexRules : ($this->indexRules)();
    }

    /**
     * @return array<string, mixed>
     */
    public function storeRules(): array
    {
        return is_array($this->storeRules) ? $this->storeRules : ($this->storeRules)();
    }

    /**
     * @return array<string, mixed>
     */
    public function updateRules(Model $record): array
    {
        if ($this->updateRules === null) {
            return $this->storeRules();
        }

        return is_array($this->updateRules) ? $this->updateRules : ($this->updateRules)($record);
    }

    /**
     * @return class-string<Model>
     */
    public function modelClass(): string
    {
        return $this->modelClass;
    }

    public function permissionKey(): string
    {
        return $this->permissionKey ?? $this->key;
    }

    public function canMutate(): bool
    {
        return ! $this->readOnly;
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return LengthAwarePaginator|array<string, mixed>|null
     */
    public function runIndex(array $filters): LengthAwarePaginator|array|null
    {
        if (! $this->indexUsing instanceof Closure) {
            return null;
        }

        return ($this->indexUsing)($filters);
    }

    /**
     * @return Model|array<string, mixed>|null
     */
    public function runShow(int $record): Model|array|null
    {
        if (! $this->showUsing instanceof Closure) {
            return null;
        }

        return ($this->showUsing)($record);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function sync(Model $record, array $payload): void
    {
        if ($this->syncUsing instanceof Closure) {
            ($this->syncUsing)($record, $payload);
        }
    }
}
