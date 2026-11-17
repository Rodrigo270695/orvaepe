import { MENU } from '../data';

export default function ModulesSection() {
    return (
        <section className="px-5 py-20 sm:px-8 sm:py-28" aria-labelledby="fs-menu-title">
            <div className="mx-auto max-w-6xl">
                <p className="fs-kicker">Lo que hay en la casa</p>
                <h2 id="fs-menu-title" className="fs-display mt-4 max-w-2xl text-4xl text-[var(--fs-wine-deep)] sm:text-6xl">
                    La carta del sistema.
                </h2>
                <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-[var(--fs-muted)]">
                    No es un POS con un módulo de cocina pegado. Es el recorrido del local, y cada plan abre los platos que tu casa necesita.
                </p>
                <div className="mt-14 grid gap-10 lg:grid-cols-3">
                    {MENU.map((column) => (
                        <section key={column.course}>
                            <h3 className="fs-display text-3xl text-[var(--fs-wine)]">{column.course}</h3>
                            <div className="fs-rule mt-4" />
                            <ul className="mt-2">
                                {column.items.map((item) => (
                                    <li key={item.name} className="border-b border-[#c4a574]/40 py-4">
                                        <p className="font-sans text-base font-semibold">{item.name}</p>
                                        <p className="mt-1 font-sans text-sm leading-relaxed text-[var(--fs-muted)]">{item.note}</p>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </div>
        </section>
    );
}
