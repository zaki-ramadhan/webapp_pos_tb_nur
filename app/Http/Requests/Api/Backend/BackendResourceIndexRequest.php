<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceIndexRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        return array_merge([
            'search' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ], $this->blueprint()->indexRules());
    }

    protected function ability(): string
    {
        return 'view';
    }
}
