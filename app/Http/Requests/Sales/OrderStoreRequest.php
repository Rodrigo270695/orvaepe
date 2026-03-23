<?php

namespace App\Http\Requests\Sales;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OrderStoreRequest extends FormRequest
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

        if ($this->has('currency') && is_string($this->input('currency'))) {
            $this->merge(['currency' => strtoupper(trim($this->input('currency')))]);
        }
    }

    public function rules(): array
    {
        $statuses = [
            Order::STATUS_DRAFT,
            Order::STATUS_PENDING_PAYMENT,
            Order::STATUS_PAID,
            Order::STATUS_CANCELLED,
            Order::STATUS_REFUNDED,
        ];

        return [
            'user_id' => [
                'required',
                'integer',
                Rule::exists('users', 'id')->where(function ($query): void {
                    // El verificador de `exists` usa Query\Builder, no Eloquent: no usar whereHas().
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
            'currency' => ['required', 'string', 'size:3'],
            'status' => ['required', 'string', Rule::in($statuses)],
            'notes_internal' => ['nullable', 'string'],
            'lines' => ['required', 'array', 'min:1'],
            'lines.*.catalog_sku_id' => ['required', 'uuid', 'exists:catalog_skus,id'],
            'lines.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
