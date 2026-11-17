import type { SoftwarePricingPlan, SoftwareSystem } from '@/marketplace/softwareCatalog';

export type FoodSaaSPurchaseProps = {
    selectedPlan: SoftwarePricingPlan | null;
    purchaseEnabled: boolean;
    webCheckoutEnabled: boolean;
    isFreeSubscription: boolean;
    checkoutLoading: boolean;
    checkoutError: string | null;
    selectionTitle: string;
    selectionPriceLine?: string;
    selectionPriceCaption?: string;
    consultationWhatsAppHref?: string;
    onAddToCart: () => void;
    onStartCheckout: () => void;
    selectedPlanId: string | null;
    onSelectPlanId: (id: string) => void;
    addedCount: number;
};

export type FoodSaaSLandingProps = FoodSaaSPurchaseProps & {
    system: SoftwareSystem;
};
