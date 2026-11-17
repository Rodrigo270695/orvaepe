import { DEMO } from './data';
import './foodsaas-landing.css';
import FoodSaaSMotionRoot from './FoodSaaSMotionRoot';
import HeroSection from './hero/HeroSection';
import ClosingCta from './sections/ClosingCta';
import FaqSection from './sections/FaqSection';
import ModulesSection from './sections/ModulesSection';
import PricingSection from './sections/PricingSection';
import ServiceLine from './sections/ServiceLine';
import ServiceScroll from './sections/ServiceScroll';
import type { FoodSaaSLandingProps } from './types';

export default function FoodSaaSLanding(props: FoodSaaSLandingProps) {
    const { system, marketing = null, ...purchase } = props;
    const demoUrl = system.demoUrl?.trim() || DEMO.url;
    const demoUser = system.demoUser?.trim() || DEMO.user;
    const demoPassword = system.demoPassword?.trim() || DEMO.password;

    return (
        <FoodSaaSMotionRoot>
            <div className="fs-landing">
                <HeroSection demoUrl={demoUrl} demoUser={demoUser} demoPassword={demoPassword} />
                <ServiceScroll />
                <ServiceLine />
                <ModulesSection />
                <PricingSection plans={system.pricingPlans} marketing={marketing} {...purchase} />
                <FaqSection />
                <ClosingCta whatsappHref={purchase.consultationWhatsAppHref} demoUrl={demoUrl} />
            </div>
        </FoodSaaSMotionRoot>
    );
}
