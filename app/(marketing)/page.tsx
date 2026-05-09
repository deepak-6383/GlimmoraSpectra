import { Hero } from "@/components/marketing/hero";
import {
  PlatformSection,
  VisionShowcase,
  MemorySection,
  AgentsSection,
  EnterpriseSection,
  FinalCTA,
} from "@/components/marketing/sections";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <PlatformSection />
      <VisionShowcase />
      <MemorySection />
      <AgentsSection />
      <EnterpriseSection />
      <FinalCTA />
    </>
  );
}
