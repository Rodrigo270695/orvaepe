import { DEMO } from './data';
import './foodsaas-landing.css';
import HeroSection from './hero/HeroSection';
import ClosingCta from './sections/ClosingCta';
import FaqSection from './sections/FaqSection';
import ModulesSection from './sections/ModulesSection';
import PricingSection from './sections/PricingSection';
import ServiceLine from './sections/ServiceLine';
import type { FoodSaaSLandingProps } from './types';

export default function FoodSaaSLanding(props: FoodSaaSLandingProps) {
    const { system, ...purchase } = props;
    const demoUrl = system.demoUrl?.trim() || DEMO.url;
    const demoUser = system.demoUser?.trim() || DEMO.user;
    const demoPassword = system.demoPassword?.trim() || DEMO.password;

    return (
        <div className="fs-landing">
            <HeroSection demoUrl={demoUrl} demoUser={demoUser} demoPassword={demoPassword} />
            <ServiceLine />
            <ModulesSection />
            <PricingSection plans={system.pricingPlans} {...purchase} />
            <FaqSection />
            <ClosingCta whatsappHref={purchase.consultationWhatsAppHref} demoUrl={demoUrl} />
        </div>
    );
}
