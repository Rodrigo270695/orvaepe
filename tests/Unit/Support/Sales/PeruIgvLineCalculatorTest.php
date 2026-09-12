<?php

use App\Support\Sales\PeruIgvLineCalculator;

test('precio sin igv: base, igv y total', function () {
    $a = PeruIgvLineCalculator::forLine(1, 100.0, false, 0.18);

    expect($a->baseLine)->toBe(100.0)
        ->and($a->taxLine)->toBe(18.0)
        ->and($a->lineTotal)->toBe(118.0);
});

test('precio con igv: extrae base e igv del total', function () {
    $a = PeruIgvLineCalculator::forLine(1, 118.0, true, 0.18);

    expect($a->lineTotal)->toBe(118.0)
        ->and($a->baseLine)->toBe(100.0)
        ->and($a->taxLine)->toBe(18.0);
});

test('precio con igv cantidad 2: total 200 y base proporcional', function () {
    $a = PeruIgvLineCalculator::forLine(2, 100.0, true, 0.18);

    expect($a->lineTotal)->toBe(200.0)
        ->and($a->baseLine)->toBe(169.49)
        ->and($a->taxLine)->toBe(30.51);
});

test('tasa inválida lanza excepción', function () {
    PeruIgvLineCalculator::forLine(1, 100.0, false, 1.5);
})->throws(InvalidArgumentException::class);

test('igv no aplica: total igual al importe de catálogo sin impuesto', function () {
    $a = PeruIgvLineCalculator::forLine(1, 20.0, false, 0.18, false);

    expect($a->lineTotal)->toBe(20.0)
        ->and($a->taxLine)->toBe(0.0)
        ->and($a->baseLine)->toBe(20.0);
});

test('cpe con total anclado 399: igv es residuo no 338.14 por 18%', function () {
    $a = PeruIgvLineCalculator::forInvoiceLine(1, 338.14, 0.18, true, 399.0);

    expect($a->lineTotal)->toBe(399.0)
        ->and($a->baseLine)->toBe(338.14)
        ->and($a->taxLine)->toBe(60.86);
});

test('valor unitario sunat de 399 con igv usa 6 decimales', function () {
    expect(PeruIgvLineCalculator::sunatUnitValue(1, 399.0, 0.18, true))
        ->toBe('338.135593');
});
