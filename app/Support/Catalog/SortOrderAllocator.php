<?php

declare(strict_types=1);

namespace App\Support\Catalog;

use Illuminate\Database\Eloquent\Model;

/**
 * Asigna el siguiente sort_order (MAX en toda la tabla + 1).
 */
final class SortOrderAllocator
{
    /**
     * @param  class-string<Model>  $modelClass
     */
    public static function nextFor(string $modelClass, string $column = 'sort_order'): int
    {
        $max = (int) $modelClass::query()->max($column);

        return $max + 1;
    }
}
