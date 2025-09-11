import Header from "@/components/home/header";
import HeroContent from "@/components/home/hero-content";
import HospitalInfo from "@/components/home/hospital-info";
import PulsingCircle from "@/components/home/pulsing-circle";
import ShaderBackground from "@/components/home/shader-background";
import CenterText from "@/components/home/center-text";

export default function ShaderShowcase() {
  return (
    <ShaderBackground>
      {/* Desktop Layout */}
      <div className="hidden md:block">
        <Header />
        <HeroContent />
        <HospitalInfo />
        <CenterText />
        <PulsingCircle />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 flex flex-col px-4 space-y-6 py-6">
          <CenterText />
          <HeroContent />
          <HospitalInfo />
        </div>
        <div className="flex justify-center py-4">
          <PulsingCircle />
        </div>
      </div>
    </ShaderBackground>
  );
}
