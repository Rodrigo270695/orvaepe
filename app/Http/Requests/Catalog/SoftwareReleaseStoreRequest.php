<?php

namespace App\Http\Requests\Catalog;

use App\Models\SoftwareRelease;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SoftwareReleaseStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $changelog = $this->input('changelog');
        $artifactPath = $this->input('artifact_path');
        $artifactSha = $this->input('artifact_sha256');
        $minPhp = $this->input('min_php_version');

        $this->merge([
            'changelog' => is_string($changelog) ? trim($changelog) : $changelog,
            'artifact_path' => $artifactPath === '' || $artifactPath === null ? null : trim((string) $artifactPath),
            'artifact_sha256' => $artifactSha === '' || $artifactSha === null ? null : trim((string) $artifactSha),
            'min_php_version' => $minPhp === '' || $minPhp === null ? null : trim((string) $minPhp),
            'version' => is_string($this->input('version')) ? trim($this->input('version')) : $this->input('version'),
        ]);
    }

    public function rules(): array
    {
        /** @var SoftwareRelease|string|null $release */
        $release = $this->route('software_release');
        $releaseId = $release instanceof SoftwareRelease ? $release->id : null;

        $productId = $this->input('catalog_product_id');

        $versionUnique = Rule::unique('software_releases', 'version')
            ->where(fn ($q) => $q->where('catalog_product_id', $productId));

        if ($releaseId) {
            $versionUnique = $versionUnique->ignore($releaseId, 'id');
        }

        return [
            'catalog_product_id' => [
                'required',
                'uuid',
                Rule::exists('catalog_products', 'id')->where(function ($q) {
                    $q->whereNotNull('category_id')
                        ->whereExists(function ($sub) {
                            $sub->selectRaw('1')
                                ->from('catalog_categories')
                                ->whereColumn('catalog_categories.id', 'catalog_products.category_id')
                                ->where('catalog_categories.revenue_line', 'software_system');
                        });
                }),
            ],
            'version' => [
                'required',
                'string',
                'max:80',
                'regex:/^[\w.\-+]+$/',
                $versionUnique,
            ],
            'changelog' => ['nullable', 'string'],
            'artifact_path' => ['nullable', 'string', 'max:512'],
            'artifact_sha256' => ['nullable', 'string', 'max:64', 'regex:/^[a-fA-F0-9]*$/'],
            'min_php_version' => ['nullable', 'string', 'max:20'],
            'is_latest' => ['nullable', 'boolean'],
            'released_at' => ['required', 'date'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function releasePayload(): array
    {
        $data = $this->validated();
        $data['is_latest'] = $this->boolean('is_latest');

        return $data;
    }
}
