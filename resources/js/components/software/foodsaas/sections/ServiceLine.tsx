import { COURSES } from '../data';
import FoodSaaSReveal from '../FoodSaaSReveal';

export default function ServiceLine() {
    return (
        <section className="px-5 py-16 sm:px-8" aria-labelledby="fs-service-title" style={{ background: 'var(--fs-band)', color: 'var(--fs-on-band)' }}>
            <div className="mx-auto max-w-6xl">
                <p className="font-mono text-xs uppercase tracking-[0.22em] text-[#c4a574]">Un solo servicio</p>
                <h2 id="fs-service-title" className="fs-display mt-4 max-w-xl text-4xl sm:text-5xl">
                    Cuatro tiempos. Ningún sistema suelto.
                </h2>
                <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl bg-[#c4a574]/30 sm:grid-cols-2 lg:grid-cols-4">
                    {COURSES.map((course) => (
                        <li key={course.index} style={{ background: 'var(--fs-band-card)' }}>
                        <FoodSaaSReveal delay={Number(course.index) * 0.04}>
                            {course.image ? (
                                <img src={course.image} alt={course.imageAlt} className="aspect-[16/10] w-full object-cover" />
                            ) : null}
                            <div className="px-5 py-6">
                                <p className="font-mono text-xs tracking-[0.18em] text-[#c4a574]">{course.index}</p>
                                <h3 className="fs-display mt-3 text-3xl">{course.name}</h3>
                                <p className="mt-2 font-sans text-sm leading-relaxed text-[color-mix(in_srgb,var(--fs-on-band)_82%,transparent)]">{course.detail}</p>
                            </div>
                        </FoodSaaSReveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
