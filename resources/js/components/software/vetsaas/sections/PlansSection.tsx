import SoftwareDetailPlansPicker from '@/components/software/SoftwareDetailPlansPicker';
import SoftwareDetailPlanSelectionPanel from '@/components/software/SoftwareDetailPlanSelectionPanel';
import VetSaaSReveal from '@/components/software/VetSaaSReveal';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

import type { VetSaaSPurchaseProps } from '../types';

type Props = VetSaaSPurchaseProps & {
    plans: SoftwarePricingPlan[];
    modulesNote: string;
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    selectionPriceCaption?: string;
    addedCount: number;
};

const PLAN_ACCENTS = ['#006D55', '#008762', '#33A07B', '#015743'];

export default function PlansSection({
    plans,
    modulesNote,
    selectedPlan,
    selectedPlanId,
    onSelectPlanId,
    purchaseEnabled,
    webCheckoutEnabled,
    isFreeSubscription,
    checkoutLoading,
    checkoutError,
    addedCount,
    selectionTitle,
    selectionPriceLine,
    selectionPriceCaption,
    consultationWhatsAppHref,
    onAddToCart,
    onStartCheckout,
}: Props) {
    return (
        <section id="planes" className="vs-planes scroll-mt-24 bg-[var(--vs-bg)] py-16 text-[var(--vs-ink)] sm:py-20">
            <div className="mx-auto max-w-6xl px-5 sm:px-8">
                <VetSaaSReveal>
                    <div className="max-w-2xl">
                        <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                            Mismos módulos. Distintas cantidades.
                        </h2>
                        <p className="vs-body vs-muted mt-3 text-sm leading-relaxed sm:text-base">{modulesNote}</p>
                    </div>
                </VetSaaSReveal>

                <div className="mt-10">
                    <SoftwareDetailPlansPicker
                        plans={plans}
                        selectedPlanId={selectedPlanId}
                        onSelectPlanId={onSelectPlanId}
                        semanticAccents={PLAN_ACCENTS}
                        brand="vetsaas"
                    />
                </div>

                <div className="mt-8">
                    <SoftwareDetailPlanSelectionPanel
                        eyebrow={selectedPlan ? 'Selección actual' : 'Siguiente paso'}
                        planSelected={Boolean(selectedPlan)}
                        webCheckoutEnabled={webCheckoutEnabled}
                        isFreeSubscription={isFreeSubscription}
                        purchaseEnabled={purchaseEnabled}
                        whatsappHref={consultationWhatsAppHref}
                        selectionTitle={selectionTitle}
                        priceLine={selectionPriceLine}
                        priceCaption={selectionPriceCaption}
                        payInProgress={checkoutLoading}
                        payError={checkoutError}
                        onPay={onStartCheckout}
                        onAdd={onAddToCart}
                        addedCount={addedCount}
                    />
                </div>
            </div>
        </section>
    );
}
