'use client';

import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ContentSection from "./components/ContentSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <ContentSection />
      </main>
      <Footer />
    </div>
  );
}
