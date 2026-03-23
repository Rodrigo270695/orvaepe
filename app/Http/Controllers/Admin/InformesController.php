<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\DashboardMetricsService;
use Inertia\Inertia;
use Inertia\Response;

class InformesController extends Controller
{
    public function resumen(DashboardMetricsService $metrics): Response
    {
        return Inertia::render('admin/informes/resumen', $metrics->build());
    }

    public function lineas(DashboardMetricsService $metrics): Response
    {
        $data = $metrics->build();

        return Inertia::render('admin/informes/lineas', [
            'revenueByLine' => $data['revenueByLine'],
        ]);
    }
}
