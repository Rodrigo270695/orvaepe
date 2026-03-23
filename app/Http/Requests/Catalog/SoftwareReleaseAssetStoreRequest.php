<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

class SoftwareReleaseAssetStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $label = $this->input('label');
        $path = $this->input('path');
        $sha = $this->input('sha256');

        $this->merge([
            'label' => is_string($label) ? trim($label) : $label,
            'path' => is_string($path) ? trim($path) : $path,
            'sha256' => $sha === '' || $sha === null ? null : trim((string) $sha),
        ]);
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'path' => ['required', 'string', 'max:512'],
            'sha256' => ['nullable', 'string', 'max:64', 'regex:/^[a-fA-F0-9]*$/'],
        ];
    }
}
