<?php

namespace App\Http\Requests\Admin;

use App\Models\Subscription;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubscriptionUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['cancel_at_period_end' => $this->boolean('cancel_at_period_end')]);

        foreach (['gateway_customer_id', 'gateway_subscription_id'] as $key) {
            $v = $this->input($key);
            if (is_string($v) && trim($v) === '') {
                $this->merge([$key => null]);
            }
        }
        foreach (['current_period_start', 'current_period_end', 'trial_ends_at'] as $key) {
            $v = $this->input($key);
            if ($v === '' || $v === null) {
                $this->merge([$key => null]);
            }
        }
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $start = $this->input('current_period_start');
            $end = $this->input('current_period_end');
            if ($start && $end && strtotime((string) $end) < strtotime((string) $start)) {
                $validator->errors()->add(
                    'current_period_end',
                    'El fin del período debe ser posterior o igual al inicio.',
                );
            }
        });
    }

    public function rules(): array
    {
        $statuses = [
            Subscription::STATUS_TRIALING,
            Subscription::STATUS_ACTIVE,
            Subscription::STATUS_PAST_DUE,
            Subscription::STATUS_PAUSED,
            Subscription::STATUS_CANCELLED,
        ];

        return [
            'user_id' => [
                'required',
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
            'status' => ['required', 'string', Rule::in($statuses)],
            'gateway_customer_id' => ['nullable', 'string', 'max:191'],
            'gateway_subscription_id' => ['nullable', 'string', 'max:191'],
            'current_period_start' => ['nullable', 'date'],
            'current_period_end' => ['nullable', 'date'],
            'trial_ends_at' => ['nullable', 'date'],
            'cancel_at_period_end' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.catalog_sku_id' => ['required', 'uuid', 'exists:catalog_skus,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.unit_price' => ['required', 'numeric', 'min:0'],
        ];
    }
}
