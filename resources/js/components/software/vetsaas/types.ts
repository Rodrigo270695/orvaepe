import type { VetSaaSShowcaseClient } from '@/components/software/VetSaaSClientsCarousel';
import type { VetSaaSPublicReview } from '@/components/software/VetSaaSReviews';
import type { SoftwarePricingPlan } from '@/marketplace/softwareCatalog';

/** Estado de compra compartido entre la sección de planes y la barra fija. */
export type VetSaaSPurchaseProps = {
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
};

export type VetSaaSMarketingPlan = {
    codigo: string;
    nombre: string;
    descripcion: string;
    badge?: string | null;
    trial_days?: number;
    referral_reward_days?: number;
    highlights: string[];
};

export type VetSaaSMarketingPayload = {
    clinics_count: number;
    clinics_display: number;
    clinics_label: string;
    modules_note?: string;
    plans: VetSaaSMarketingPlan[];
    comparison: Array<Record<string, string>>;
    clients: VetSaaSShowcaseClient[];
    reviews?: VetSaaSPublicReview[];
};
