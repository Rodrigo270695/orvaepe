<?php

use App\Models\ProductDelivery;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->string('plan_period', 20)->default(ProductDelivery::PERIOD_ANNUAL)->after('delivered_at');
            $table->date('plan_ends_at')->nullable()->after('plan_period');
            $table->index('plan_period');
            $table->index('plan_ends_at');
        });

        ProductDelivery::query()
            ->whereNull('plan_ends_at')
            ->each(function (ProductDelivery $delivery): void {
                $start = $delivery->delivered_at;
                $delivery->plan_period = $delivery->plan_period ?: ProductDelivery::PERIOD_ANNUAL;
                $delivery->plan_ends_at = $start
                    ? ProductDelivery::endDateFor($start, $delivery->plan_period)
                    : null;
                $delivery->save();
            });
    }

    public function down(): void
    {
        Schema::table('product_deliveries', function (Blueprint $table) {
            $table->dropIndex(['plan_period']);
            $table->dropIndex(['plan_ends_at']);
            $table->dropColumn(['plan_period', 'plan_ends_at']);
        });
    }
};
