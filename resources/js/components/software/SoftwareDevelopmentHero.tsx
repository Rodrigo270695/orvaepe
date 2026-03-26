import PageHero from '@/components/marketing/PageHero';
import { getMarketingHeroNavCtas } from '@/marketing/marketingHeroNavCtas';

export default function SoftwareDevelopmentHero() {
    return (
        <PageHero
            id="inicio"
            eyebrow="Desarrollo de software"
            title={
                <>
                    Software pensado para
                    <span className="bg-gradient-to-br from-foreground via-[var(--state-alert)] to-[var(--state-info)] bg-clip-text text-transparent dark:from-[var(--o-cream2)]">
                        {' '}
                        operar
                    </span>
                </>
            }
            description="Elige el sistema por categorías, ajusta tu plan (SaaS, licencia o módulos sueltos) y recibe entregables con documentación y trazabilidad. Todo orientado a implementación en días o semanas."
            ctas={getMarketingHeroNavCtas('software')}
        />
    );
}

