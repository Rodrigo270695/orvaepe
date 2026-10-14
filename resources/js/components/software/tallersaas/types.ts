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

/** Planes y features que vienen del panel de TallerSaaS (null si no responde y no hay copia). */
export type TallerSaaSMarketingPlan = {
    codigo: string;
    nombre: string;
    descripcion: string | null;
    badge: string | null;
    trial_days: number;
    highlights: string[];
    features: Record<string, number | boolean | string | null>;
};

export type TallerSaaSMarketing = {
    plans: TallerSaaSMarketingPlan[];
    comparison: {
        key: string;
        label: string;
        values: Record<string, string>;
    }[];
};

export type TallerSaaSLandingProps = TallerSaaSPurchaseProps & {
    system: SoftwareSystem;
    marketing?: TallerSaaSMarketing | null;
};
