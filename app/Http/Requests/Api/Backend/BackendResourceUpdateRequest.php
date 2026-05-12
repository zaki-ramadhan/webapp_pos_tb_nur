<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceUpdateRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        return $this->blueprint()->updateRules($this->record());
    }

    protected function ability(): string
    {
        return 'update';
    }
}
