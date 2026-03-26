<?php

namespace App\Http\Requests\Admin;

use App\Models\ShowcaseClient;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ShowcaseClientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $client = $this->route('showcase_client');

        $slugUnique = Rule::unique('showcase_clients', 'slug');
        if ($client instanceof ShowcaseClient) {
            $slugUnique->ignore($client);
        }

        return [
            'legal_name' => ['required', 'string', 'max:255'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:120',
                $slugUnique,
            ],
            'logo_path' => ['nullable', 'string', 'max:500'],
            'logo' => ['nullable', 'file', 'max:5120', 'mimes:jpeg,jpg,png,webp,gif,svg'],
            'logo_clear' => ['nullable', 'boolean'],
            'website_url' => ['nullable', 'string', 'max:500', 'url'],
            'sector' => ['nullable', 'string', 'max:64'],
            'is_published' => ['boolean'],
            'sort_order' => ['integer', 'min:0', 'max:999999'],
            'admin_notes' => ['nullable', 'string', 'max:5000'],
            'authorized_at' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('sector') && $this->input('sector') === '__none__') {
            $this->merge(['sector' => null]);
        }

        foreach (['website_url', 'slug', 'display_name', 'logo_path', 'sector', 'admin_notes'] as $key) {
            if ($this->has($key) && $this->input($key) === '') {
                $this->merge([$key => null]);
            }
        }

        if ($this->has('authorized_at') && $this->input('authorized_at') === '') {
            $this->merge(['authorized_at' => null]);
        }

        $sort = $this->input('sort_order');
        if ($sort === '' || $sort === null) {
            $this->merge(['sort_order' => 0]);
        }

        $this->merge([
            'is_published' => $this->boolean('is_published'),
            'logo_clear' => $this->boolean('logo_clear'),
        ]);
    }
}
