import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

export type TallerSaaSPurchaseProps = {
    selectedPlan: SoftwarePricingPlan | null;
    purchaseEnabled: boolean;
    webCheckoutEnabled: boolean;
    isFreeSubscription: boolean;
    checkoutLoading: boolean;
    checkoutError: string | null;
    selectionTitle: string;
    selectionPriceLine?: string;
    consultationWhatsAppHref?: string;
    onAddToCart: () => void;
    onStartCheckout: () => void;
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    addedCount: number;
    selectionPriceCaption?: string;
};

export type TallerSaaSLandingProps = TallerSaaSPurchaseProps & {
    system: SoftwareSystem;
};
