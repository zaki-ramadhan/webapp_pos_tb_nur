<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceStoreRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        return $this->blueprint()->storeRules();
    }

    protected function ability(): string
    {
        return 'create';
    }
}
