"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HiddenGemForm from "@/components/HiddenGemForm";
import { useRouter } from "next/navigation";

export default function SubmitHiddenGemPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>Submit a Hidden Gem | SafarNama</title>
      <meta
        name="description"
        content="Share an offbeat destination or hidden gem spot with the SafarNama traveler community."
      />
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-earth-clay/15 p-6 md:p-10 shadow-lg">
            <HiddenGemForm
              variant="inline"
              onSuccess={() => router.push("/dashboard?tab=explore")}
              onCancel={() => router.back()}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
