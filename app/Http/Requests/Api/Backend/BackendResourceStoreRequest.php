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

    protected function prepareForValidation(): void
    {
        $resource = $this->route('resource');
        if ($resource === 'customers' || $resource === 'suppliers') {
            if (empty($this->input('code'))) {
                $prefix = $resource === 'customers' ? 'CUST' : 'SUPP';
                $table = $resource === 'customers' ? 'customers' : 'suppliers';
                $index = 1;
                do {
                    $seqNum = str_pad($index, 3, '0', STR_PAD_LEFT);
                    $generatedCode = "{$prefix}-{$seqNum}";
                    $index++;
                } while (\Illuminate\Support\Facades\DB::table($table)->where('code', $generatedCode)->exists());

                $this->merge([
                    'code' => $generatedCode,
                ]);
            }
        }
    }

    protected function ability(): string
    {
        return 'create';
    }
}
