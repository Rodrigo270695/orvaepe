import { DEMO } from './data';
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
    const { system, marketing = null, ...purchase } = props;
    const demoUrl = system.demoUrl?.trim() || DEMO.url;
    const demoUser = system.demoUser?.trim() || DEMO.user;
    const demoPassword = system.demoPassword?.trim() || DEMO.password;

    return (
        <TallerSaaSMotionRoot>
            <div className="ts-landing relative">
                <HeroSection demoUrl={demoUrl} demoUser={demoUser} demoPassword={demoPassword} />
                <ShiftScroll />
                <DualBay />
                <ModulesBay />
                <RadioSection />
                <PricingSection plans={system.pricingPlans} marketing={marketing} {...purchase} />
                <FaqSection whatsappHref={purchase.consultationWhatsAppHref} />
                <ClosingCta
                    whatsappHref={purchase.consultationWhatsAppHref}
                    demoUrl={demoUrl}
                    demoUser={demoUser}
                    demoPassword={demoPassword}
                />

                {purchase.selectedPlan ? (
                    <MobilePlanBar title={purchase.selectionTitle} priceLine={purchase.selectionPriceLine} />
                ) : null}
            </div>
        </TallerSaaSMotionRoot>
    );
}
