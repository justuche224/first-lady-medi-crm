import Header from "@/components/home/header";
import HeroContent from "@/components/home/hero-content";
import HospitalInfo from "@/components/home/hospital-info";
import PulsingCircle from "@/components/home/pulsing-circle";
import ShaderBackground from "@/components/home/shader-background";

export default function ShaderShowcase() {
  return (
    <ShaderBackground>
      <Header />
      <HeroContent />
      <HospitalInfo />
      <PulsingCircle />
    </ShaderBackground>
  );
}
