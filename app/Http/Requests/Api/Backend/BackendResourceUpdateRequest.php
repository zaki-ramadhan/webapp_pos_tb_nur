<?php

namespace App\Http\Requests\Api\Backend;

class BackendResourceUpdateRequest extends BackendResourceRequest
{
    public function rules(): array
    {
        if ($this->route('resource') === 'preferences' && $this->has('settings')) {
            return [
                'company_info' => ['sometimes', 'array'],
                'settings' => ['sometimes', 'array'],
            ];
        }

        $rules = $this->blueprint()->updateRules($this->record());
        $rules['attachment_ids'] = ['sometimes', 'array'];
        $rules['attachment_ids.*'] = ['integer', 'exists:attachments,id'];
        return $rules;
    }

    protected function ability(): string
    {
        return 'update';
    }
}
