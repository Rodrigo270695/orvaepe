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

export type FoodSaaSMarketingPlan = {
    codigo: string;
    nombre: string;
    descripcion: string | null;
    badge: string | null;
    trial_days: number;
    highlights: string[];
    features: Record<string, number | boolean | string | null>;
    precio_mensual: number | null;
    precio_anual: number | null;
};

export type FoodSaaSMarketing = {
    plans: FoodSaaSMarketingPlan[];
    comparison: { key: string; label: string; values: Record<string, string> }[];
};

export type FoodSaaSLandingProps = FoodSaaSPurchaseProps & {
    system: SoftwareSystem;
    marketing?: FoodSaaSMarketing | null;
};
