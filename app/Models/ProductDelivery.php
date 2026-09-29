<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductDelivery extends Model
{
    use HasUuids;

    public const PERIOD_MONTHLY = 'monthly';

    public const PERIOD_ANNUAL = 'annual';

    public const PERIOD_TWO_YEARS = 'two_years';

    public const PERIOD_THREE_YEARS = 'three_years';

    /**
     * @return list<string>
     */
    public static function periods(): array
    {
        return [
            self::PERIOD_MONTHLY,
            self::PERIOD_ANNUAL,
            self::PERIOD_TWO_YEARS,
            self::PERIOD_THREE_YEARS,
        ];
    }

    public static function endDateFor(\DateTimeInterface $start, string $period): \Illuminate\Support\Carbon
    {
        $date = \Illuminate\Support\Carbon::parse($start);

        return match ($period) {
            self::PERIOD_MONTHLY => $date->addMonthNoOverflow(),
            self::PERIOD_TWO_YEARS => $date->addYearsNoOverflow(2),
            self::PERIOD_THREE_YEARS => $date->addYearsNoOverflow(3),
            default => $date->addYearNoOverflow(),
        };
    }

    protected $table = 'product_deliveries';

    protected $keyType = 'string';

    public $incrementing = false;

    #[Fillable([
        'ruc',
        'legal_name',
        'product_description',
        'includes_igv',
        'sale_amount',
        'collected_at',
        'delivered_at',
        'plan_period',
        'plan_ends_at',
        'invoice_path',
        'invoice_original_name',
        'xml_path',
        'xml_original_name',
        'created_by',
    ])]
    protected $fillable = [
        'ruc',
        'legal_name',
        'product_description',
        'includes_igv',
        'sale_amount',
        'collected_at',
        'delivered_at',
        'plan_period',
        'plan_ends_at',
        'invoice_path',
        'invoice_original_name',
        'xml_path',
        'xml_original_name',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'includes_igv' => 'boolean',
            'sale_amount' => 'decimal:2',
            'collected_at' => 'datetime',
            'delivered_at' => 'date',
            'plan_ends_at' => 'date',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * @return array<string, mixed>
     */
    public function toPanelArray(): array
    {
        return [
            'id' => $this->id,
            'ruc' => $this->ruc,
            'legal_name' => $this->legal_name,
            'product_description' => $this->product_description,
            'includes_igv' => (bool) $this->includes_igv,
            'sale_amount' => number_format((float) $this->sale_amount, 2, '.', ''),
            'is_collected' => $this->collected_at !== null,
            'delivered_at' => $this->delivered_at?->format('Y-m-d'),
            'plan_period' => $this->plan_period,
            'plan_ends_at' => $this->plan_ends_at?->format('Y-m-d'),
            'has_invoice' => filled($this->invoice_path),
            'has_xml' => filled($this->xml_path),
            'invoice_original_name' => $this->invoice_original_name,
            'xml_original_name' => $this->xml_original_name,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
