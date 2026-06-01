<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceUpdateRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        if ($this->route('resource') === 'preferences') {
            return [
                'company_info' => ['sometimes', 'array'],
                'settings' => ['sometimes', 'array'],
            ];
        }

        return $this->blueprint()->updateRules($this->record());
    }

    protected function ability(): string
    {
        return 'update';
    }
}
