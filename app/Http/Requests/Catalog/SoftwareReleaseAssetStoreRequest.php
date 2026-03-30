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
            'path' => $path === '' || $path === null ? null : trim((string) $path),
            'sha256' => $sha === '' || $sha === null ? null : trim((string) $sha),
        ]);
    }

    public function rules(): array
    {
        return [
            'label' => ['required', 'string', 'max:255'],
            'asset_file' => ['nullable', 'file', 'max:204800'],
            'path' => ['required_without:asset_file', 'nullable', 'string', 'max:512'],
            'sha256' => ['nullable', 'string', 'max:64', 'regex:/^[a-fA-F0-9]*$/'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function assetPayload(): array
    {
        return collect($this->validated())
            ->except('asset_file')
            ->all();
    }
}
