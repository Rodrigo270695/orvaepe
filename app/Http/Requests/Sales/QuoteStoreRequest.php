<?php

namespace App\Http\Requests\Sales;

use App\Models\Quote;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class QuoteStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $notes = $this->input('notes_internal');
        if (is_string($notes)) {
            $t = trim($notes);
            $this->merge(['notes_internal' => $t === '' ? null : $t]);
        }

        $title = $this->input('title');
        if (is_string($title)) {
            $t = trim($title);
            $this->merge(['title' => $t === '' ? null : $t]);
        }

        foreach (['customer_legal_name', 'customer_document_type', 'customer_document_number', 'customer_email', 'customer_phone', 'customer_address'] as $field) {
            $v = $this->input($field);
            if (is_string($v)) {
                $t = trim($v);
                $this->merge([$field => $t === '' ? null : $t]);
            }
        }

        if ($this->has('currency') && is_string($this->input('currency'))) {
            $this->merge(['currency' => strtoupper(trim($this->input('currency')))]);
        }

        $userId = $this->input('user_id');
        if ($userId === '' || $userId === null) {
            $this->merge(['user_id' => null]);
        }

        $lines = $this->input('lines');
        if (is_array($lines)) {
            $normalized = [];
            foreach ($lines as $line) {
                if (! is_array($line)) {
                    $normalized[] = $line;
                    continue;
                }

                $catalogSkuId = $line['catalog_sku_id'] ?? null;
                $manualCode = $line['manual_code'] ?? null;
                $manualName = $line['manual_name'] ?? null;

                $normalized[] = array_merge($line, [
                    'catalog_sku_id' => is_string($catalogSkuId) && trim($catalogSkuId) !== '' ? trim($catalogSkuId) : null,
                    'manual_code' => is_string($manualCode) && trim($manualCode) !== '' ? trim($manualCode) : null,
                    'manual_name' => is_string($manualName) && trim($manualName) !== '' ? trim($manualName) : null,
                    'manual_igv_applies' => array_key_exists('manual_igv_applies', $line)
                        ? filter_var($line['manual_igv_applies'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true
                        : true,
                ]);
            }
            $this->merge(['lines' => $normalized]);
        }
    }

    public function rules(): array
    {
        $statuses = [
            Quote::STATUS_DRAFT,
            Quote::STATUS_SENT,
        ];

        return [
            'user_id' => [
                'nullable',
                'integer',
                Rule::exists('users', 'id')->where(function ($query): void {
                    $roles = config('permission.table_names.roles');
                    $pivot = config('permission.table_names.model_has_roles');
                    $query->whereExists(function ($sub) use ($roles, $pivot): void {
                        $sub->from($pivot)
                            ->join($roles, "{$roles}.id", '=', "{$pivot}.role_id")
                            ->whereColumn("{$pivot}.model_id", 'users.id')
                            ->where("{$pivot}.model_type", User::class)
                            ->where("{$roles}.name", 'client')
                            ->where("{$roles}.guard_name", 'web');
                    });
                }),
            ],
            'customer_legal_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'customer_document_type' => ['nullable', 'string', 'max:20'],
            'customer_document_number' => ['nullable', 'string', 'max:32'],
            'customer_email' => ['nullable', 'string', 'max:255'],
            'customer_phone' => ['nullable', 'string', 'max:30'],
            'customer_address' => ['nullable', 'string'],
            'currency' => ['required', 'string', 'size:3'],
            'status' => ['required', 'string', Rule::in($statuses)],
            'title' => ['nullable', 'string', 'max:255'],
            'notes_internal' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.catalog_sku_id' => ['nullable', 'uuid', 'exists:catalog_skus,id'],
            'lines.*.manual_code' => ['nullable', 'string', 'max:120'],
            'lines.*.manual_name' => ['nullable', 'string', 'max:255'],
            'lines.*.manual_igv_applies' => ['nullable', 'boolean'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
            'lines.*.unit_price' => ['required', 'numeric', 'min:0'],
            'lines.*.line_discount' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
