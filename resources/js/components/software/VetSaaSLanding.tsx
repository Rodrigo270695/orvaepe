import { useMemo } from 'react';

import SoftwareDetailStickyPurchaseBar from '@/components/software/SoftwareDetailStickyPurchaseBar';
import type { VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';
import VetSaaSMotionRoot from '@/components/software/VetSaaSMotionRoot';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import VetSaaSReviews from '@/components/software/VetSaaSReviews';
import AiAssistantSection from '@/components/software/vetsaas/ai/AiAssistantSection';
import HeroSection from '@/components/software/vetsaas/hero/HeroSection';
import ClientsSection from '@/components/software/vetsaas/sections/ClientsSection';
import ClinicDayScroll from '@/components/software/vetsaas/sections/ClinicDayScroll';
import ClosingCta from '@/components/software/vetsaas/sections/ClosingCta';
import ComparisonSection from '@/components/software/vetsaas/sections/ComparisonSection';
import FaqSection from '@/components/software/vetsaas/sections/FaqSection';
import ModulesSection from '@/components/software/vetsaas/sections/ModulesSection';
import NoveltiesSection from '@/components/software/vetsaas/sections/NoveltiesSection';
import PricingSection from '@/components/software/vetsaas/pricing/PricingSection';
import StatsBand from '@/components/software/vetsaas/sections/StatsBand';
import type { VetSaaSMarketingPayload, VetSaaSPurchaseProps } from '@/components/software/vetsaas/types';
import { planCodigoFromSku } from '@/components/software/vetsaas/utils';
import type { SoftwareSystem } from '@/marketplace/softwareCatalog';

import '@/components/software/vetsaas/vetsaas-landing.css';

export type { VetSaaSMarketingPayload } from '@/components/software/vetsaas/types';

type Props = VetSaaSPurchaseProps & {
    system: SoftwareSystem;
    marketing: VetSaaSMarketingPayload;
    showcaseClients: VetSaaSShowcaseClient[];
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    addedCount: number;
    selectionPriceCaption?: string;
};

const DEFAULT_MODULES_NOTE =
    'Todos los módulos están incluidos en todos los planes. Lo que cambia es la cantidad.';

export default function VetSaaSLanding({ system, marketing, showcaseClients, ...purchase }: Props) {
    const clinics = marketing.clinics_display || 100;
    const clients = showcaseClients.length > 0 ? showcaseClients : marketing.clients;
    const reviews = marketing.reviews ?? [];

    const plans = useMemo(() => {
        const highlightsByCodigo = new Map(marketing.plans.map((p) => [p.codigo, p.highlights]));
        return system.pricingPlans.map((plan) => {
            const extras = highlightsByCodigo.get(planCodigoFromSku(plan));
            return extras?.length ? { ...plan, highlights: extras } : plan;
        });
    }, [system.pricingPlans, marketing.plans]);

    return (
        <VetSaaSMotionRoot>
            <div className="vs-landing relative">
                <HeroSection clinics={clinics} clients={clients} />
                <StatsBand clinics={clinics} />
                <ClientsSection clinics={clinics} clients={clients} />
                <AiAssistantSection />
                <ClinicDayScroll />
                <ModulesSection />

                {reviews.length > 0 ? (
                    <VetSaaSReveal>
                        <VetSaaSReviews reviews={reviews} />
                    </VetSaaSReveal>
                ) : null}

                <PricingSection
                    {...purchase}
                    plans={plans}
                    marketingPlans={marketing.plans}
                    modulesNote={marketing.modules_note ?? DEFAULT_MODULES_NOTE}
                />
                <ComparisonSection plans={marketing.plans} comparison={marketing.comparison} />
                <NoveltiesSection />
                <FaqSection whatsappHref={purchase.consultationWhatsAppHref} />
                <ClosingCta clinics={clinics} whatsappHref={purchase.consultationWhatsAppHref} />

                {purchase.selectedPlan ? (
                    <SoftwareDetailStickyPurchaseBar
                        selectedPlanLabel={purchase.selectionTitle}
                        priceLine={purchase.selectionPriceLine}
                        planReady
                        webCheckoutEnabled={purchase.webCheckoutEnabled}
                        isFreeSubscription={purchase.isFreeSubscription}
                        purchaseEnabled={purchase.purchaseEnabled}
                        whatsappHref={purchase.consultationWhatsAppHref}
                        payInProgress={purchase.checkoutLoading}
                        payError={purchase.checkoutError}
                        onPay={purchase.onStartCheckout}
                        onAdd={purchase.onAddToCart}
                    />
                ) : null}
            </div>
        </VetSaaSMotionRoot>
    );
}
