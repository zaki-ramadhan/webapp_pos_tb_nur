<?php

namespace App\Support\Backend;

use Closure;
use Illuminate\Database\Eloquent\Model;

class BackendResourceBlueprint
{
    /**
     * @param  class-string<Model>  $modelClass
     * @param  array<int, string>  $searchColumns
     * @param  array<int, string>  $with
     * @param  array<string, mixed>|Closure(): array<string, mixed>  $storeRules
     * @param  array<string, mixed>|Closure(Model): array<string, mixed>|null  $updateRules
     * @param  (Closure(Model, array<string, mixed>): void)|null  $syncUsing
     */
    public function __construct(
        public readonly string $key,
        public readonly string $label,
        public readonly string $modelClass,
        public readonly array $searchColumns = [],
        public readonly array $with = [],
        public readonly array|Closure $storeRules = [],
        public readonly array|Closure|null $updateRules = null,
        public readonly ?Closure $syncUsing = null,
    ) {
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
