<?php

namespace App\Http\Controllers\Sales;

use App\Http\Controllers\Controller;
use App\Http\Requests\Sales\ProductDeliveryStoreRequest;
use App\Models\ProductDelivery;
use App\Support\AdminFlashToast;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProductDeliveriesController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $q = trim((string) $request->input('q', ''));
        $igv = trim((string) $request->input('igv', ''));
        $dateFrom = trim((string) $request->input('date_from', ''));
        $dateTo = trim((string) $request->input('date_to', ''));
        $datePattern = '/^\d{4}-\d{2}-\d{2}$/';

        $perPage = (int) $request->input('per_page', 25);
        $allowedPerPage = [10, 15, 20, 25, 30, 40, 50];
        if (! in_array($perPage, $allowedPerPage, true)) {
            $perPage = 25;
        }

        $sortDir = strtolower((string) $request->input('sort_dir', 'desc'));
        if (! in_array($sortDir, ['asc', 'desc'], true)) {
            $sortDir = 'desc';
        }

        $query = ProductDelivery::query();
        $like = Schema::getConnection()->getDriverName() === 'pgsql' ? 'ilike' : 'like';

        if ($q !== '') {
            $query->where(function ($sub) use ($q, $like): void {
                $sub->where('ruc', $like, "%{$q}%")
                    ->orWhere('legal_name', $like, "%{$q}%")
                    ->orWhere('product_description', $like, "%{$q}%");
            });
        }

        if ($igv === '1') {
            $query->where('includes_igv', true);
        } elseif ($igv === '0') {
            $query->where('includes_igv', false);
        } else {
            $igv = '';
        }

        $plan = trim((string) $request->input('plan', ''));
        if (! in_array($plan, ProductDelivery::periods(), true)) {
            $plan = '';
        } else {
            $query->where('plan_period', $plan);
        }

        if ($dateFrom !== '' && preg_match($datePattern, $dateFrom)) {
            $query->whereDate('delivered_at', '>=', $dateFrom);
        } else {
            $dateFrom = '';
        }

        if ($dateTo !== '' && preg_match($datePattern, $dateTo)) {
            $query->whereDate('delivered_at', '<=', $dateTo);
        } else {
            $dateTo = '';
        }

        $cobro = trim((string) $request->input('cobro', ''));
        if ($cobro === 'pending') {
            $query->whereNull('collected_at');
        } elseif ($cobro === 'collected') {
            $query->whereNotNull('collected_at');
        } else {
            $cobro = '';
        }

        $append = [
            'per_page' => $perPage,
            'sort_dir' => $sortDir,
        ];
        if ($q !== '') {
            $append['q'] = $q;
        }
        if ($igv !== '') {
            $append['igv'] = $igv;
        }
        if ($plan !== '') {
            $append['plan'] = $plan;
        }
        if ($cobro !== '') {
            $append['cobro'] = $cobro;
        }
        if ($dateFrom !== '') {
            $append['date_from'] = $dateFrom;
        }
        if ($dateTo !== '') {
            $append['date_to'] = $dateTo;
        }

        $summary = $this->filteredSummary(clone $query);

        $deliveries = $query
            ->orderBy('delivered_at', $sortDir)
            ->orderBy('created_at', $sortDir)
            ->paginate($perPage)
            ->appends($append)
            ->through(fn (ProductDelivery $row) => $row->toPanelArray());

        return Inertia::render('admin/ventas-entregas/index', [
            'deliveries' => $deliveries,
            'summary' => $summary,
            'filters' => [
                'q' => $q,
                'igv' => $igv,
                'plan' => $plan,
                'cobro' => $cobro,
                'sort_dir' => $sortDir,
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function create(): InertiaResponse
    {
        return Inertia::render('admin/ventas-entregas/create');
    }

    public function store(ProductDeliveryStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $delivery = ProductDelivery::query()->create([
            'ruc' => $data['ruc'],
            'legal_name' => $data['legal_name'],
            'product_description' => $data['product_description'],
            'includes_igv' => $data['includes_igv'],
            'sale_amount' => $data['sale_amount'],
            'delivered_at' => $data['delivered_at'],
            'plan_period' => $data['plan_period'],
            'plan_ends_at' => $data['plan_ends_at'],
            'created_by' => $request->user()?->id,
        ]);

        $this->persistUploads($request, $delivery);

        return redirect()
            ->route('panel.ventas-entregas.show', $delivery)
            ->with('toast', AdminFlashToast::success(
                'Entrega registrada',
                'Quedó el registro de a quién se ofreció el servicio.',
            ));
    }

    public function show(ProductDelivery $productDelivery): InertiaResponse
    {
        return Inertia::render('admin/ventas-entregas/show', [
            'delivery' => $productDelivery->toPanelArray(),
        ]);
    }

    public function edit(ProductDelivery $productDelivery): InertiaResponse
    {
        return Inertia::render('admin/ventas-entregas/edit', [
            'delivery' => $productDelivery->toPanelArray(),
        ]);
    }

    public function update(ProductDeliveryStoreRequest $request, ProductDelivery $productDelivery): RedirectResponse
    {
        $data = $request->validated();

        $productDelivery->fill([
            'ruc' => $data['ruc'],
            'legal_name' => $data['legal_name'],
            'product_description' => $data['product_description'],
            'includes_igv' => $data['includes_igv'],
            'sale_amount' => $data['sale_amount'],
            'delivered_at' => $data['delivered_at'],
            'plan_period' => $data['plan_period'],
            'plan_ends_at' => $data['plan_ends_at'],
        ]);
        $productDelivery->save();

        $this->persistUploads($request, $productDelivery);

        return redirect()
            ->route('panel.ventas-entregas.show', $productDelivery)
            ->with('toast', AdminFlashToast::success('Entrega actualizada'));
    }

    public function destroy(ProductDelivery $productDelivery): RedirectResponse
    {
        $this->deleteStoredFiles($productDelivery);
        $productDelivery->delete();

        return redirect()
            ->route('panel.ventas-entregas.index')
            ->with('toast', AdminFlashToast::success('Entrega eliminada'));
    }

    public function toggleCollected(ProductDelivery $productDelivery): RedirectResponse
    {
        $productDelivery->collected_at = $productDelivery->collected_at ? null : now();
        $productDelivery->save();

        return back()->with('toast', AdminFlashToast::success(
            $productDelivery->collected_at ? 'Marcada como cobrada' : 'Volvió a por cobrar',
        ));
    }

    public function downloadInvoice(ProductDelivery $productDelivery): StreamedResponse
    {
        return $this->downloadStored(
            $productDelivery->invoice_path,
            $productDelivery->invoice_original_name ?: 'factura',
        );
    }

    public function downloadXml(ProductDelivery $productDelivery): StreamedResponse
    {
        return $this->downloadStored(
            $productDelivery->xml_path,
            $productDelivery->xml_original_name ?: 'factura.xml',
        );
    }

    /**
     * @return array{count: int, total_amount: string, pending_amount: string, collected_amount: string, with_igv: int, without_igv: int, with_docs: int}
     */
    private function filteredSummary(\Illuminate\Database\Eloquent\Builder $query): array
    {
        $money = fn (mixed $value): string => number_format((float) $value, 2, '.', '');

        return [
            'count' => (clone $query)->count(),
            'total_amount' => $money((clone $query)->sum('sale_amount')),
            'pending_amount' => $money((clone $query)->whereNull('collected_at')->sum('sale_amount')),
            'collected_amount' => $money((clone $query)->whereNotNull('collected_at')->sum('sale_amount')),
            'with_igv' => (clone $query)->where('includes_igv', true)->count(),
            'without_igv' => (clone $query)->where('includes_igv', false)->count(),
            'with_docs' => (clone $query)->where(function ($sub): void {
                $sub->whereNotNull('invoice_path')->orWhereNotNull('xml_path');
            })->count(),
        ];
    }

    private function persistUploads(Request $request, ProductDelivery $delivery): void
    {
        $invoice = $request->file('invoice_file');
        if ($invoice instanceof UploadedFile) {
            $this->replaceFile(
                $delivery,
                $invoice,
                'invoice_path',
                'invoice_original_name',
                'factura',
            );
        }

        $xml = $request->file('xml_file');
        if ($xml instanceof UploadedFile) {
            $this->replaceFile(
                $delivery,
                $xml,
                'xml_path',
                'xml_original_name',
                'comprobante',
            );
        }
    }

    private function replaceFile(
        ProductDelivery $delivery,
        UploadedFile $file,
        string $pathColumn,
        string $nameColumn,
        string $basename,
    ): void {
        $previous = $delivery->{$pathColumn};
        if (is_string($previous) && $previous !== '') {
            Storage::disk('local')->delete($previous);
        }

        $ext = strtolower($file->getClientOriginalExtension() ?: 'bin');
        $ext = preg_replace('/[^a-z0-9]/', '', $ext) ?: 'bin';
        $stored = $file->storeAs(
            'product-deliveries/'.$delivery->id,
            $basename.'.'.$ext,
            'local',
        );

        $original = basename(str_replace('\\', '/', $file->getClientOriginalName()));
        $delivery->{$pathColumn} = $stored;
        $delivery->{$nameColumn} = $original !== '' ? $original : $basename.'.'.$ext;
        $delivery->save();
    }

    private function deleteStoredFiles(ProductDelivery $delivery): void
    {
        $disk = Storage::disk('local');
        foreach ([$delivery->invoice_path, $delivery->xml_path] as $path) {
            if (is_string($path) && $path !== '') {
                $disk->delete($path);
            }
        }
        $disk->deleteDirectory('product-deliveries/'.$delivery->id);
    }

    private function downloadStored(?string $path, string $downloadName): StreamedResponse
    {
        abort_unless(is_string($path) && $path !== '' && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->download($path, $downloadName);
    }
}
