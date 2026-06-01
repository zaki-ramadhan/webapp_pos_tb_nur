<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceStoreRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        if ($this->route('resource') === 'preferences') {
            return [
                'company_info' => ['sometimes', 'array'],
                'settings' => ['sometimes', 'array'],
            ];
        }

        return $this->blueprint()->storeRules();
    }

    protected function ability(): string
    {
        return 'create';
    }
}
