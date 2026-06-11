<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SunatSubmissionLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SunatLogsController extends Controller
{
    public function index(Request $request): Response
    {
        $query = SunatSubmissionLog::query()
            ->with(['invoice:id,invoice_number,sunat_document_type_code,sunat_filing_status,buyer_snapshot'])
            ->orderByDesc('created_at');

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->whereHas('invoice', fn ($sub) =>
                $sub->where('invoice_number', 'ilike', "%{$q}%")
            );
        }

        if ($request->filled('success')) {
            $query->where('success', $request->boolean('success'));
        }

        if ($request->filled('channel')) {
            $query->where('channel', $request->input('channel'));
        }

        $logs = $query->paginate(30)->withQueryString();

        // Estadísticas rápidas del día
        $today = now()->startOfDay();
        $stats = [
            'today_total'   => SunatSubmissionLog::where('created_at', '>=', $today)->count(),
            'today_success' => SunatSubmissionLog::where('created_at', '>=', $today)->where('success', true)->count(),
            'today_error'   => SunatSubmissionLog::where('created_at', '>=', $today)->where('success', false)->count(),
            'total_all'     => SunatSubmissionLog::count(),
        ];

        return Inertia::render('admin/sunat/logs', [
            'logs'    => $logs,
            'stats'   => $stats,
            'filters' => $request->only(['q', 'success', 'channel']),
        ]);
    }
}
