import { router, usePage } from '@inertiajs/react';
import { Cable } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';

import { NeuCardRaised } from '@/components/ui/neu-card-raised';
import { cn } from '@/lib/utils';

import { saasColor } from './saasColors';
import type { OpenWaLine, OpenWaProduct } from './types';

type Point = { x: number; y: number };
type Anchors = { lines: Record<string, Point>; products: Record<string, Point> };
type Drag = { lineId: string; pointer: Point; overKey: string | null };
type Pending = { lineId: string; key: string; action: 'add' | 'remove' };

type Props = {
    lines: OpenWaLine[];
    products: OpenWaProduct[];
};

const TAP_TOLERANCE_PX = 6;
const AMBER = '#D28C3C';

function curvePath(a: Point, b: Point): string {
    const dx = Math.max(48, Math.abs(b.x - a.x) * 0.5);

    return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
}

function productKeyAt(clientX: number, clientY: number): string | null {
    const node = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>('[data-product-key]');

    return node?.dataset.connected === 'true' ? (node.dataset.productKey ?? null) : null;
}

export function OpenWaLinkBoard({ lines, products }: Props) {
    const errors = usePage().props.errors as Record<string, string> | undefined;
    const boardRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<Point | null>(null);
    const [anchors, setAnchors] = useState<Anchors>({ lines: {}, products: {} });
    const [drag, setDrag] = useState<Drag | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [pending, setPending] = useState<Pending | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);

    const toBoard = useCallback((clientX: number, clientY: number): Point => {
        const box = boardRef.current?.getBoundingClientRect();

        return { x: clientX - (box?.left ?? 0), y: clientY - (box?.top ?? 0) };
    }, []);

    const measure = useCallback(() => {
        const board = boardRef.current;

        if (!board) {
            return;
        }

        const box = board.getBoundingClientRect();
        const read = (attribute: string) => {
            const points: Record<string, Point> = {};

            board.querySelectorAll<HTMLElement>(`[${attribute}]`).forEach((element) => {
                const id = element.getAttribute(attribute);
                const rect = element.getBoundingClientRect();

                if (id) {
                    points[id] = {
                        x: rect.left + rect.width / 2 - box.left,
                        y: rect.top + rect.height / 2 - box.top,
                    };
                }
            });

            return points;
        };

        setAnchors({ lines: read('data-line-port'), products: read('data-product-port') });
    }, []);

    useEffect(() => {
        const board = boardRef.current;

        if (!board) {
            return;
        }

        const observer = new ResizeObserver(() => measure());
        observer.observe(board);
        board.querySelectorAll('[data-node]').forEach((node) => observer.observe(node));

        return () => observer.disconnect();
    }, [lines, products, measure]);

    const save = useCallback((line: OpenWaLine, productos: string[], next: Pending) => {
        setPending(next);
        router.put(
            line.routes.productos,
            { productos },
            {
                preserveScroll: true,
                preserveState: true,
                only: ['lines', 'products'],
                onFinish: () => setPending(null),
            },
        );
    }, []);

    const toggleLink = useCallback(
        (lineId: string, key: string, mode: 'toggle' | 'add' = 'toggle') => {
            const line = lines.find((item) => item.id === lineId);
            const product = products.find((item) => item.key === key);

            if (!line || !product || pending) {
                return;
            }

            if (line.productos.includes(key)) {
                if (mode === 'toggle') {
                    save(line, line.productos.filter((item) => item !== key), { lineId, key, action: 'remove' });
                }

                return;
            }

            if (product.connected) {
                save(line, [...line.productos, key], { lineId, key, action: 'add' });
            }
        },
        [lines, products, pending, save],
    );

    const dragLineId = drag?.lineId ?? null;

    useEffect(() => {
        if (!dragLineId) {
            return;
        }

        const onMove = (event: PointerEvent) => {
            const pointer = toBoard(event.clientX, event.clientY);
            const overKey = productKeyAt(event.clientX, event.clientY);
            setDrag((current) => (current ? { ...current, pointer, overKey } : current));
        };

        const onUp = (event: PointerEvent) => {
            const start = dragStartRef.current;
            const moved = start
                ? Math.hypot(event.clientX - start.x, event.clientY - start.y) > TAP_TOLERANCE_PX
                : true;
            const key = productKeyAt(event.clientX, event.clientY);

            dragStartRef.current = null;
            setDrag(null);

            if (!moved) {
                setSelected((current) => (current === dragLineId ? null : dragLineId));
            } else if (key) {
                toggleLink(dragLineId, key, 'add');
            }
        };

        const onCancel = () => {
            dragStartRef.current = null;
            setDrag(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onCancel);

        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onCancel);
        };
    }, [dragLineId, toBoard, toggleLink]);

    const onPortPointerDown = (event: ReactPointerEvent<HTMLButtonElement>, lineId: string) => {
        if (event.button !== 0 || pending) {
            return;
        }

        event.preventDefault();
        dragStartRef.current = { x: event.clientX, y: event.clientY };
        setHovered(null);
        setDrag({ lineId, pointer: toBoard(event.clientX, event.clientY), overKey: null });
    };

    const onProductClick = (key: string) => {
        if (selected) {
            toggleLink(selected, key);
            setSelected(null);
        }
    };

    const onBoardKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            setSelected(null);
        }
    };

    if (lines.length === 0) {
        return null;
    }

    const productByKey = Object.fromEntries(products.map((product) => [product.key, product]));
    const selectedLine = lines.find((line) => line.id === selected) ?? null;
    const error =
        errors?.productos ??
        Object.entries(errors ?? {}).find(([field]) => field.startsWith('productos.'))?.[1];

    const links = lines.flatMap((line) => {
        const keys = new Set(line.productos);

        if (pending?.lineId === line.id && pending.action === 'add') {
            keys.add(pending.key);
        }

        return [...keys].map((key) => ({
            id: `${line.id}:${key}`,
            line,
            key,
            label: productByKey[key]?.label ?? key,
            orphan: productByKey[key]?.connected !== true,
            adding: pending?.action === 'add' && pending.lineId === line.id && pending.key === key,
            removing: pending?.action === 'remove' && pending.lineId === line.id && pending.key === key,
        }));
    });

    const dragFrom = drag ? anchors.lines[drag.lineId] : undefined;
    const dragTo = drag ? ((drag.overKey && anchors.products[drag.overKey]) || drag.pointer) : undefined;

    return (
        <NeuCardRaised className="rounded-xl p-4 md:p-5">
            <div className="flex items-start gap-3">
                <Cable className="mt-0.5 size-4 shrink-0 text-[#D28C3C]" aria-hidden />
                <div>
                    <h2 className="text-sm font-bold">Qué SaaS atiende cada línea</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground" aria-live="polite">
                        {selectedLine
                            ? `Ahora elige el SaaS para «${selectedLine.nombre}» (Esc para cancelar).`
                            : 'Arrastra desde el punto de una línea hasta un SaaS. Toca una curva para quitar el vínculo.'}
                    </p>
                </div>
            </div>

            {products.length === 0 ? (
                <p className="mt-4 rounded-lg border border-dashed p-4 text-[11px] text-muted-foreground">
                    No hay SaaS conectados. Activa la provisión de cada sistema en el .env (por ejemplo{' '}
                    <span className="font-mono">VETSAAS_PROVISIONING_ENABLED=true</span> con su{' '}
                    <span className="font-mono">VETSAAS_PROVISION_URL</span>) y aparecerán aquí.
                </p>
            ) : (
                <div
                    ref={boardRef}
                    onKeyDown={onBoardKeyDown}
                    className={cn(
                        'relative mt-5 grid grid-cols-2 gap-x-[clamp(3rem,12vw,10rem)] select-none',
                        drag && 'cursor-grabbing',
                    )}
                >
                    <svg className="pointer-events-none absolute inset-0 z-0 size-full overflow-visible" aria-hidden>
                        {links.map((link) => {
                            const from = anchors.lines[link.line.id];
                            const to = anchors.products[link.key];

                            if (!from || !to) {
                                return null;
                            }

                            const d = curvePath(from, to);
                            const isHovered = hovered === link.id && !pending;
                            const color = link.orphan ? 'var(--muted-foreground)' : saasColor(link.key);

                            return (
                                <g key={link.id}>
                                    {link.adding || link.orphan ? (
                                        <path
                                            d={d}
                                            fill="none"
                                            stroke={isHovered ? 'var(--destructive)' : color}
                                            strokeWidth={2.25}
                                            strokeLinecap="round"
                                            strokeDasharray={link.orphan ? '4 5' : undefined}
                                            className={link.adding ? 'openwa-link-flow' : undefined}
                                            opacity={link.orphan ? 0.6 : 0.9}
                                        />
                                    ) : (
                                        <path
                                            d={d}
                                            pathLength={1}
                                            fill="none"
                                            stroke={isHovered ? 'var(--destructive)' : color}
                                            strokeWidth={isHovered ? 3 : 2.25}
                                            strokeLinecap="round"
                                            className="openwa-link-draw transition-[stroke,stroke-width,opacity] duration-200"
                                            opacity={link.removing ? 0.25 : 0.9}
                                        />
                                    )}
                                    <path
                                        d={d}
                                        fill="none"
                                        stroke="transparent"
                                        strokeWidth={16}
                                        className="cursor-pointer"
                                        style={{ pointerEvents: pending || drag ? 'none' : 'stroke' }}
                                        onPointerEnter={() => setHovered(link.id)}
                                        onPointerLeave={() => setHovered((current) => (current === link.id ? null : current))}
                                        onClick={() => toggleLink(link.line.id, link.key)}
                                    >
                                        <title>{`Quitar vínculo: ${link.line.nombre} → ${link.label}`}</title>
                                    </path>
                                    {isHovered ? (
                                        <g transform={`translate(${(from.x + to.x) / 2} ${(from.y + to.y) / 2})`}>
                                            <circle r={10} fill="var(--destructive)" />
                                            <path
                                                d="M -3.5 -3.5 L 3.5 3.5 M 3.5 -3.5 L -3.5 3.5"
                                                stroke="white"
                                                strokeWidth={1.75}
                                                strokeLinecap="round"
                                            />
                                        </g>
                                    ) : null}
                                </g>
                            );
                        })}

                        {dragFrom && dragTo ? (
                            <g>
                                <path
                                    d={curvePath(dragFrom, dragTo)}
                                    fill="none"
                                    stroke={drag?.overKey ? saasColor(drag.overKey) : AMBER}
                                    strokeWidth={2.5}
                                    strokeLinecap="round"
                                    className="openwa-link-flow"
                                />
                                <circle
                                    cx={dragTo.x}
                                    cy={dragTo.y}
                                    r={5}
                                    fill={drag?.overKey ? saasColor(drag.overKey) : AMBER}
                                />
                            </g>
                        ) : null}
                    </svg>

                    <div className="relative z-10 flex flex-col justify-center gap-3">
                        {lines.map((line) => {
                            const isSelected = selected === line.id;
                            const isDragging = drag?.lineId === line.id;

                            return (
                                <div
                                    key={line.id}
                                    data-node
                                    className={cn(
                                        'relative rounded-xl border border-border/70 bg-background/70 py-2.5 pr-5 pl-3 transition-shadow',
                                        (isSelected || isDragging) &&
                                            'shadow-[0_0_0_3px_color-mix(in_oklab,#D28C3C_28%,transparent)]',
                                    )}
                                >
                                    <p className="truncate text-xs font-bold">{line.nombre}</p>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                        <span
                                            className={cn(
                                                'size-1.5 shrink-0 rounded-full',
                                                line.is_ready ? 'bg-emerald-500' : 'bg-muted-foreground/50',
                                            )}
                                            aria-hidden
                                        />
                                        <span className="truncate font-mono">{line.phone ?? line.session_name}</span>
                                    </p>
                                    <button
                                        type="button"
                                        data-line-port={line.id}
                                        aria-label={`Vincular ${line.nombre} con un SaaS`}
                                        aria-pressed={isSelected}
                                        disabled={pending !== null}
                                        onPointerDown={(event) => onPortPointerDown(event, line.id)}
                                        onClick={(event) => {
                                            if (event.detail === 0) {
                                                setSelected(isSelected ? null : line.id);
                                            }
                                        }}
                                        className="absolute top-1/2 -right-[10px] grid size-5 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-full border-2 border-[#D28C3C] bg-background shadow-sm transition-transform hover:scale-125 focus-visible:ring-2 focus-visible:ring-[#D28C3C]/50 focus-visible:outline-none active:cursor-grabbing disabled:cursor-wait"
                                    >
                                        <span
                                            className={cn(
                                                'size-2 rounded-full transition-colors',
                                                line.productos.length > 0 || isSelected || isDragging
                                                    ? 'bg-[#D28C3C]'
                                                    : 'bg-transparent',
                                            )}
                                        />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="relative z-10 flex flex-col justify-center gap-3">
                        {products.map((product) => {
                            const color = product.connected ? saasColor(product.key) : 'var(--muted-foreground)';
                            const isOver = drag?.overKey === product.key;
                            const isTarget = selected !== null && product.connected;
                            const count = lines.filter((line) => line.productos.includes(product.key)).length;

                            return (
                                <button
                                    key={product.key}
                                    type="button"
                                    data-node
                                    data-product-key={product.key}
                                    data-connected={product.connected ? 'true' : 'false'}
                                    aria-disabled={selected === null}
                                    onClick={() => onProductClick(product.key)}
                                    className={cn(
                                        'relative w-full rounded-xl border border-border/70 bg-background/70 py-2.5 pr-3 pl-5 text-left transition-[transform,box-shadow,border-color] duration-200',
                                        !product.connected && 'border-dashed opacity-60',
                                        selected === null && 'cursor-default',
                                        isTarget && 'hover:-translate-x-0.5',
                                        isOver && 'scale-[1.03]',
                                    )}
                                    style={
                                        isOver || isTarget
                                            ? {
                                                  borderColor: color,
                                                  boxShadow: isOver
                                                      ? `0 0 0 3px color-mix(in oklab, ${color} 25%, transparent)`
                                                      : undefined,
                                              }
                                            : undefined
                                    }
                                >
                                    <span
                                        data-product-port={product.key}
                                        className="absolute top-1/2 -left-[10px] grid size-5 -translate-y-1/2 place-items-center rounded-full border-2 bg-background shadow-sm"
                                        style={{ borderColor: color }}
                                        aria-hidden
                                    >
                                        <span
                                            className="size-2 rounded-full"
                                            style={{ background: count > 0 || isOver ? color : 'transparent' }}
                                        />
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="size-2 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
                                        <span className="truncate text-xs font-bold">{product.label}</span>
                                    </span>
                                    <span className="mt-0.5 block text-[10px] text-muted-foreground">
                                        {product.connected
                                            ? count === 0
                                                ? 'Sin línea asignada'
                                                : `${count} ${count === 1 ? 'línea' : 'líneas'}`
                                            : 'Sin conexión · solo puedes quitarlo'}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {error ? <p className="mt-3 text-[11px] text-destructive">{error}</p> : null}
        </NeuCardRaised>
    );
}
