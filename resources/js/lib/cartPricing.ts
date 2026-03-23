import type { SoftwareCartItem } from '@/lib/softwareCartStorage';

/** Fila de precio desde el catálogo (API /carrito/precios-skus). */
export type SkuPriceRow = {
    list_price: number;
    currency: string;
    name?: string;
    /** Si el precio de lista ya incluye IGV (alineado a CatalogSku.tax_included). */
    tax_included?: boolean;
    /** Si aplica cálculo de IGV (CatalogSku.igv_applies). Si es false, el total es el precio de lista. */
    igv_applies?: boolean;
};

function roundPen2(n: number): number {
    return Math.round(n * 100) / 100;
}

/** Misma lógica que PeruIgvLineCalculator en backend (base, IGV, total línea). */
export function peruIgvLineAmounts(
    qty: number,
    listPriceUnit: number,
    taxIncluded: boolean,
    igvRate: number,
    igvApplies: boolean = true,
): { baseLine: number; taxLine: number; lineTotal: number } {
    if (!igvApplies) {
        const lineTotal = roundPen2(qty * listPriceUnit);

        return { baseLine: lineTotal, taxLine: 0, lineTotal };
    }

    if (igvRate < 0 || igvRate > 1) {
        throw new RangeError('igvRate debe estar entre 0 y 1');
    }

    if (taxIncluded) {
        const lineTotal = roundPen2(qty * listPriceUnit);
        const baseLine = roundPen2(lineTotal / (1 + igvRate));
        const taxLine = roundPen2(lineTotal - baseLine);

        return { baseLine, taxLine, lineTotal };
    }

    const baseLine = roundPen2(qty * listPriceUnit);
    const taxLine = roundPen2(baseLine * igvRate);
    const lineTotal = roundPen2(baseLine + taxLine);

    return { baseLine, taxLine, lineTotal };
}

/**
 * Totales del carrito alineados al pedido (OrderFromCartLinesBuilder): base, IGV y total con impuestos.
 */
export function cartTotalsWithIgv(
    lines: SoftwareCartItem[],
    skuPrices: Partial<Record<string, SkuPriceRow>>,
    igvRate: number,
): { subtotalBase: number; taxTotal: number; grandTotal: number; currency: string } | null {
    if (lines.length === 0) {
        return null;
    }

    let currency: string | null = null;
    let subtotalBase = 0;
    let taxTotal = 0;
    let grandTotal = 0;

    for (const line of lines) {
        const u = effectiveLineUnit(line, skuPrices);
        if (!u) {
            return null;
        }
        if (currency === null) {
            currency = u.currency;
        }
        if (u.currency !== currency) {
            return null;
        }

        const taxIncluded = u.tax_included ?? false;
        const igvApplies = u.igv_applies ?? true;
        const amounts = peruIgvLineAmounts(line.qty, u.list_price, taxIncluded, igvRate, igvApplies);
        subtotalBase += amounts.baseLine;
        taxTotal += amounts.taxLine;
        grandTotal += amounts.lineTotal;
    }

    return {
        subtotalBase: roundPen2(subtotalBase),
        taxTotal: roundPen2(taxTotal),
        grandTotal: roundPen2(grandTotal),
        currency: currency ?? 'PEN',
    };
}

/** Detecta UUID v4/v7 en texto (evita mostrarlo como nombre de plan). */
export function looksLikeUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        value.trim(),
    );
}

export function parsePenUnitFromPriceText(text: string | undefined): number | null {
    if (!text?.trim()) {
        return null;
    }

    const t = text.trim();

    const pen = t.match(/(\d+(?:[.,]\d+)?)\s*PEN\b/i);
    if (pen) {
        const v = Number.parseFloat(pen[1].replace(',', '.'));
        return Number.isFinite(v) ? v : null;
    }

    const iso = t.match(/^(\d+(?:[.,]\d+)?)\s+([A-Z]{3})\b/i);
    if (iso) {
        const cur = iso[2].toUpperCase();
        if (cur === 'PEN') {
            const v = Number.parseFloat(iso[1].replace(',', '.'));
            return Number.isFinite(v) ? v : null;
        }
    }

    return null;
}

/** Etiqueta legible del plan: nunca muestra un UUID crudo. */
export function formatPlanLabel(line: SoftwareCartItem): string {
    const label = line.planLabel?.trim();
    if (label && !looksLikeUuid(label)) {
        return label;
    }

    return 'Plan del catálogo';
}

export function lineUnitPricePen(line: SoftwareCartItem): number | null {
    if (line.unitPricePen != null && Number.isFinite(line.unitPricePen)) {
        return line.unitPricePen;
    }

    return parsePenUnitFromPriceText(line.priceText);
}

export function lineSubtotalPen(line: SoftwareCartItem): number | null {
    const unit = lineUnitPricePen(line);
    if (unit === null) {
        return null;
    }

    return Math.round(unit * line.qty * 100) / 100;
}

export function cartSubtotalPen(lines: SoftwareCartItem[]): number | null {
    let sum = 0;
    let any = false;

    for (const line of lines) {
        const st = lineSubtotalPen(line);
        if (st !== null) {
            sum += st;
            any = true;
        }
    }

    return any ? Math.round(sum * 100) / 100 : null;
}

/**
 * Precio unitario efectivo: prioriza catálogo (BD); si no, snapshot local parseado.
 */
export function effectiveLineUnit(
    line: SoftwareCartItem,
    skuPrices: Partial<Record<string, SkuPriceRow>>,
): SkuPriceRow | null {
    const fromDb = skuPrices[line.planId];
    if (fromDb && Number.isFinite(fromDb.list_price)) {
        return fromDb;
    }

    const pen = lineUnitPricePen(line);
    if (pen !== null) {
        return { list_price: pen, currency: 'PEN' };
    }

    return null;
}

export function effectiveLineSubtotal(
    line: SoftwareCartItem,
    skuPrices: Partial<Record<string, SkuPriceRow>>,
): number | null {
    const u = effectiveLineUnit(line, skuPrices);
    if (!u) {
        return null;
    }

    return Math.round(u.list_price * line.qty * 100) / 100;
}

/** Subtotal del carrito si todas las líneas tienen precio y la misma moneda. */
export function cartSubtotalResolved(
    lines: SoftwareCartItem[],
    skuPrices: Partial<Record<string, SkuPriceRow>>,
): { amount: number; currency: string } | null {
    if (lines.length === 0) {
        return null;
    }

    let currency: string | null = null;
    let sum = 0;

    for (const line of lines) {
        const u = effectiveLineUnit(line, skuPrices);
        if (!u) {
            return null;
        }
        if (currency === null) {
            currency = u.currency;
        }
        if (u.currency !== currency) {
            return null;
        }
        sum += u.list_price * line.qty;
    }

    return { amount: Math.round(sum * 100) / 100, currency };
}
