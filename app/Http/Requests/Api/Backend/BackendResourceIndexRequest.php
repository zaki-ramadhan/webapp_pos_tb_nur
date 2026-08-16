<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceIndexRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        return array_merge([
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:1000'],
            'sort_by' => ['nullable', 'string', 'max:60'],
            'sort_direction' => ['nullable', 'string', 'in:asc,desc,ASC,DESC'],
            'sort_dir' => ['nullable', 'string', 'in:asc,desc,ASC,DESC'],
        ], $this->blueprint()->indexRules());
    }

    protected function ability(): string
    {
        return 'view';
    }
}
