<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SunatBoletaResumenController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->input('month', now()->format('Y-m'));

        // Boletas agrupadas por día de emisión
        $dailySummary = Invoice::query()
            ->select([
                DB::raw("DATE(issued_at) as day"),
                DB::raw('COUNT(*) as total_docs'),
                DB::raw('SUM(grand_total) as total_amount'),
                DB::raw('SUM(tax_total) as total_igv'),
                DB::raw("SUM(CASE WHEN sunat_filing_status = 'accepted' THEN 1 ELSE 0 END) as accepted_count"),
                DB::raw("SUM(CASE WHEN sunat_filing_status IN ('error','rejected') THEN 1 ELSE 0 END) as error_count"),
                'currency',
            ])
            ->where('sunat_document_type_code', '03')
            ->whereRaw("TO_CHAR(issued_at, 'YYYY-MM') = ?", [$month])
            ->groupBy(DB::raw('DATE(issued_at)'), 'currency')
            ->orderByDesc(DB::raw('DATE(issued_at)'))
            ->get();

        // Boletas del mes completo para stats
        $monthStats = Invoice::query()
            ->where('sunat_document_type_code', '03')
            ->whereRaw("TO_CHAR(issued_at, 'YYYY-MM') = ?", [$month])
            ->selectRaw("
                COUNT(*) as total,
                SUM(grand_total) as total_amount,
                SUM(CASE WHEN sunat_filing_status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN sunat_filing_status IN ('error','rejected') THEN 1 ELSE 0 END) as errors
            ")
            ->first();

        // Últimas boletas del mes
        $recentBoletas = Invoice::query()
            ->where('sunat_document_type_code', '03')
            ->whereRaw("TO_CHAR(issued_at, 'YYYY-MM') = ?", [$month])
            ->with(['order:id,order_number'])
            ->orderByDesc('issued_at')
            ->limit(50)
            ->get([
                'id', 'invoice_number', 'sunat_filing_status',
                'grand_total', 'currency', 'issued_at',
                'buyer_snapshot', 'order_id',
            ]);

        return Inertia::render('admin/sunat/boleta-resumen', [
            'dailySummary'  => $dailySummary,
            'monthStats'    => $monthStats,
            'recentBoletas' => $recentBoletas,
            'month'         => $month,
        ]);
    }
}
