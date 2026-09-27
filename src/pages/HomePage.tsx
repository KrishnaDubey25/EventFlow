import React from "react";
import { Navbar } from "../components/home/Navbar";
import { HeroSection } from "../components/home/HeroSection";
import { MovingPartsSection } from "../components/home/MovingPartsSection";
import { JourneySection } from "../components/home/JourneySection";
import { Footer } from "../components/home/Footer";

export const HomePage: React.FC = () => {
  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-[#0B1120] flex flex-col font-sans selection:bg-[#C9A15C] selection:text-[#0B1120]">
      {/* 1. Sticky Minimal Navbar with Brand Identity */}
      <Navbar onNavigateSection={handleNavigateSection} />

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col">
        {/* 2. Hero Section with 3D Architectural Mega-Event Miniature */}
        <HeroSection />

        {/* 3. Section: "One event. Every moving part." (3 Large Interactive Cards) */}
        <MovingPartsSection />

        {/* 4. Section: "From arrival to dispersal" & Multi-Archetype Event Strip */}
        <JourneySection />
      </main>

      {/* 5. Spacious Premium Footer */}
      <Footer />
    </div>
  );
};

