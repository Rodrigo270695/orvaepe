import Section from '@/components/welcome/Section';
import { Boxes, Cpu, HardDrive, ShieldCheck, Trees } from 'lucide-react';
import type { ComponentType } from 'react';

type Module = {
    name: string;
    description: string;
    icon: ComponentType<{ className?: string }>;
};

const modules: Module[] = [
    {
        name: 'Orvae ERP',
        description:
            'Sistema de gestión empresarial integrado para procesos críticos de organizaciones medianas (activos fijos, inventario TI, licencias y reportes multi-zona).',
        icon: Boxes,
    },
    {
        name: 'Orvae Assets',
        description: 'Gestión de activos fijos tecnológicos y no tecnológicos.',
        icon: HardDrive,
    },
    {
        name: 'Orvae Zones',
        description: 'Control multi-zonal y reportería en tiempo real para telcos y manufactura.',
        icon: Trees,
    },
    {
        name: 'Orvae Vault',
        description: 'Licencias de software, contratos y renovaciones.',
        icon: ShieldCheck,
    },
    {
        name: 'Orvae Stock',
        description: 'Inventario y almacenes para manufactura y MYPE.',
        icon: Cpu,
    },
];

export default function ProductsCatalogSection() {
    return (
        <Section
            id="productos"
            eyebrow="Productos y catálogo"
            title="Compra solo lo que usas. Escala sin fricción."
            description="Cada módulo puede venderse standalone o como parte del ERP completo. El cliente paga por lo que necesita y crece cuando lo requiere."
        >
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {modules.map((m) => (
                    <div
                        key={m.name}
                        className="rounded-2xl border border-[var(--border)] bg-background/60 p-6"
                    >
                        <m.icon className="size-6 text-[var(--o-amber)]" />
                        <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                            {m.name}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                            {m.description}
                        </p>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--border)] bg-background/60 p-6">
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--foreground)]">
                    Principio de catálogo
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted-foreground)]">
                    Una MYPE puede empezar con Orvae Assets y escalar después.
                    La estructura modular reduce la barrera de entrada y acelera el retorno.
                </p>
            </div>
        </Section>
    );
}

