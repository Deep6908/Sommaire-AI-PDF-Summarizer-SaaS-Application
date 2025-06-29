import HeroSection from "@/components/home/hero_section";
import BgGradient from "@/components/common/bg_gradient";
import DemoSection from "@/components/home/demo_section";
import HowItWorksSection from "@/components/home/how_it_works";
import PricingSection from "@/components/home/pricing_section";
import CTASection from "@/components/home/cta_section";

export default function Home() {

  return (
    <div className="relative w-full">
      <BgGradient />
      <div className="flex flex-col">
        <HeroSection />
        <DemoSection />
        <HowItWorksSection />
        <PricingSection />
        <CTASection />
      </div>

    </div>
  );
}
