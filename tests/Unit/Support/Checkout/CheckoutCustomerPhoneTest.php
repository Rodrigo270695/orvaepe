<?php

declare(strict_types=1);

use App\Models\Order;
use App\Models\User;
use App\Support\Checkout\CheckoutCustomerPhone;

test('prioriza el celular del usuario sobre el snapshot', function (): void {
    $user = new User(['phone' => '947381241']);
    $order = new Order(['billing_snapshot' => ['phone' => '999888777']]);

    expect(CheckoutCustomerPhone::raw($user, $order))->toBe('947381241')
        ->and(CheckoutCustomerPhone::ultraMsgTo($user, $order))->toBe('+51947381241');
});

test('usa el snapshot si el usuario no tiene celular', function (): void {
    $user = new User(['phone' => '']);
    $order = new Order(['billing_snapshot' => ['customer_phone' => '947381241']]);

    expect(CheckoutCustomerPhone::raw($user, $order))->toBe('947381241');
});

test('no toma el celular del admin: sin usuario ni snapshot no hay número', function (): void {
    expect(CheckoutCustomerPhone::raw(null, new Order(['billing_snapshot' => []])))->toBeNull();
});
