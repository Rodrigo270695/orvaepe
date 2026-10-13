import HeroSection from './hero/HeroSection';
import MobilePlanBar from './pricing/MobilePlanBar';
import PricingSection from './pricing/PricingSection';
import ClosingCta from './sections/ClosingCta';
import DualBay from './sections/DualBay';
import FaqSection from './sections/FaqSection';
import ModulesBay from './sections/ModulesBay';
import RadioSection from './sections/RadioSection';
import ShiftScroll from './sections/ShiftScroll';
import TallerSaaSMotionRoot from './TallerSaaSMotionRoot';
import type { TallerSaaSLandingProps } from './types';

import './tallersaas-landing.css';

export default function TallerSaaSLanding(props: TallerSaaSLandingProps) {
    const { system, ...purchase } = props;

    return (
        <TallerSaaSMotionRoot>
            <div className="ts-landing relative">
                <HeroSection />
                <ShiftScroll />
                <DualBay />
                <ModulesBay />
                <RadioSection />
                <PricingSection plans={system.pricingPlans} {...purchase} />
                <FaqSection whatsappHref={purchase.consultationWhatsAppHref} />
                <ClosingCta whatsappHref={purchase.consultationWhatsAppHref} />

                {purchase.selectedPlan ? (
                    <MobilePlanBar title={purchase.selectionTitle} priceLine={purchase.selectionPriceLine} />
                ) : null}
            </div>
        </TallerSaaSMotionRoot>
    );
}
