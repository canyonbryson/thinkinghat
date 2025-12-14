"use client";

import Header from "@/components/Header";
import Hero from "@/components/home/Hero";
import Games from "@/components/home/Games";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import Footer from "@/components/home/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      {/* Spacer for fixed header */}
      <div className="h-16 lg:h-20" />
      <Hero />
      <Games />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
