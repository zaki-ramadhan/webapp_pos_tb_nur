<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceStoreRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        if ($this->route('resource') === 'preferences' && $this->has('settings')) {
            return [
                'company_info' => ['sometimes', 'array'],
                'settings' => ['sometimes', 'array'],
            ];
        }

        $rules = $this->blueprint()->storeRules();
        $rules['attachment_ids'] = ['sometimes', 'array'];
        $rules['attachment_ids.*'] = ['integer', 'exists:attachments,id'];
        return $rules;
    }

    protected function ability(): string
    {
        return 'create';
    }
}
