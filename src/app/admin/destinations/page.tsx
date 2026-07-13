"use client";

import React, { useState, useTransition } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Eye,
  Plus,
  Compass,
  Star,
  MapPin,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUser } from "@/components/UserContext";

export default function AdminDestinationsPage() {
  const { currentUser, isLoading } = useUser();
  const [isPending, startTransition] = useTransition();

  // Queries & Mutations
  const destinations = useQuery(api.destinations.getDestinations);
  const deleteDestMutation = useMutation(api.destinations.deleteDestination);

  // States
  const [deleteTargetId, setDeleteTargetId] = useState<Id<"destinations"> | null>(null);
  const [deleteTargetTitle, setDeleteTargetTitle] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Deletion Confirm Handler
  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        await deleteDestMutation({ id: deleteTargetId });
        setSuccessMsg(`Chronicle "${deleteTargetTitle}" was successfully deleted.`);
        setDeleteTargetId(null);
        setDeleteTargetTitle("");
        
        // Clear message after timeout
        setTimeout(() => setSuccessMsg(""), 3000);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to delete destination.");
        setDeleteTargetId(null);
        setDeleteTargetTitle("");
      }
    });
  };

  // 1. Loading State
  if (isLoading || destinations === undefined) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="text-center space-y-4">
            <Compass className="h-10 w-10 text-earth-terracotta animate-spin mx-auto" />
            <p className="text-sm font-semibold tracking-wider uppercase text-earth-clay/60">
              Loading Database Records...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // 2. Authorization Check
  const isUserAdmin = currentUser?.email === "230107anu@gmail.com";
  if (!currentUser || !isUserAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24">
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-8 text-center space-y-6 shadow-xl">
            <XCircle className="h-16 w-16 text-red-500 mx-auto" />
            <h1 className="font-serif text-2xl font-bold text-earth-forest">Admin Access Required</h1>
            <p className="font-sans text-sm text-earth-charcoal/70 leading-relaxed font-light">
              Access to the Official Chronicles Directory is limited to system administrators. Please log in using administrative credentials.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signin"
                className="px-6 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard"
                className="px-6 py-2.5 border border-earth-clay/20 text-earth-charcoal/75 hover:border-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-earth-sand text-earth-charcoal font-sans">
      <title>Manage Chronicles | SafarNama Admin</title>
      <meta name="description" content="Manage and edit curated destinations. Update photographs, logistics, geographical coordinate mapping, and user review threads." />
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center space-x-2 text-xs font-semibold text-earth-clay hover:text-earth-terracotta uppercase tracking-wider transition-colors mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Dashboard</span>
              </Link>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-earth-forest">
                Official Chronicles Manager
              </h1>
              <p className="font-sans text-xs text-earth-charcoal/60 leading-relaxed font-light">
                Manage, edit, or delete the curated regional travel guides featured on the SafarNama chronicles search catalog.
              </p>
            </div>

            <div className="shrink-0 pt-2 md:pt-0">
              <Link
                href="/admin/destinations/new"
                className="inline-flex items-center space-x-2 px-5 py-3 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-widest transition-all shadow-md rounded-none"
              >
                <Plus className="h-4 w-4" />
                <span>Create Chronicle</span>
              </Link>
            </div>
          </div>

          {/* Success / Error Banners */}
          {successMsg && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-semibold flex items-center space-x-3 shadow-sm animate-in fade-in">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center space-x-3 shadow-sm animate-in fade-in">
              <XCircle className="h-5 w-5 text-red-650 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Chronicles Listing Directory */}
          <div className="bg-white border border-earth-clay/10 shadow-lg overflow-hidden">
            {destinations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-earth-clay/10 text-left text-xs font-sans">
                  <thead className="bg-earth-sand/50 text-earth-clay/80 uppercase font-bold tracking-wider text-[10px]">
                    <tr>
                      <th scope="col" className="px-6 py-4">Thumbnail</th>
                      <th scope="col" className="px-6 py-4">Chronicle Title</th>
                      <th scope="col" className="px-6 py-4">Category</th>
                      <th scope="col" className="px-6 py-4">Location & State</th>
                      <th scope="col" className="px-6 py-4">Average Rating</th>
                      <th scope="col" className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-earth-clay/5 font-light text-earth-charcoal">
                    {destinations.map((dest) => (
                      <tr key={dest.id} className="hover:bg-earth-sand/20 transition-colors">
                        
                        {/* 1. Photo Thumbnail */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-10 w-14 overflow-hidden border border-earth-clay/15 bg-stone-100 shrink-0">
                            <img
                              src={dest.photos?.[0] || "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&w=800&q=80"}
                              alt={dest.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </td>

                        {/* 2. Title */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-serif text-sm font-bold text-earth-forest block">
                            {dest.title}
                          </span>
                          <span className="text-[10px] text-earth-clay/60 block mt-0.5">
                            ID: {dest.id}
                          </span>
                        </td>

                        {/* 3. Category */}
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-earth-clay">
                          {dest.category}
                        </td>

                        {/* 4. Location / State */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-earth-terracotta shrink-0" />
                            <span>{dest.location}</span>
                          </span>
                        </td>

                        {/* 5. Rating */}
                        <td className="px-6 py-4 whitespace-nowrap font-semibold">
                          <div className="flex items-center space-x-1 text-earth-saffron">
                            <Star className="h-3.5 w-3.5 fill-current shrink-0" />
                            <span>{dest.rating || "4.8"}</span>
                          </div>
                        </td>

                        {/* 6. Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link
                            href={`/destinations/${dest.id}`}
                            className="inline-flex items-center p-1.5 border border-earth-clay/20 bg-earth-sand text-earth-charcoal hover:border-earth-charcoal hover:bg-white transition-all shadow-sm rounded-none"
                            title="View Public Page"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                          
                          <Link
                            href={`/admin/destinations/${dest.id}/edit`}
                            className="inline-flex items-center p-1.5 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all shadow-sm rounded-none"
                            title="Edit Chronicle"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Link>

                          <button
                            onClick={() => {
                              setDeleteTargetId(dest.id as Id<"destinations">);
                              setDeleteTargetTitle(dest.title);
                            }}
                            className="inline-flex items-center p-1.5 border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 hover:border-red-300 transition-all shadow-sm rounded-none cursor-pointer"
                            title="Delete Chronicle"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-20 bg-white">
                <Compass className="h-12 w-12 text-earth-clay/30 animate-pulse mx-auto mb-4" />
                <p className="text-sm text-earth-charcoal/60 font-light max-w-md mx-auto">
                  No curated chronicles exist in the database. Use the creation portal to add your first destination guide.
                </p>
                <div className="pt-6">
                  <Link
                    href="/admin/destinations/new"
                    className="inline-block px-5 py-2.5 bg-earth-forest hover:bg-earth-terracotta text-white font-sans text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Add Chronicle
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal Backdrop */}
      {deleteTargetId && (
        <div className="fixed inset-0 bg-earth-charcoal/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          
          {/* Modal Container */}
          <div className="max-w-md w-full bg-white border border-earth-clay/10 p-6 md:p-8 space-y-6 shadow-2xl text-center relative animate-in scale-in duration-200">
            
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 inline-block rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-earth-forest">
                Confirm Chronicle Deletion
              </h3>
              <p className="font-sans text-xs text-earth-charcoal/70 leading-relaxed font-light">
                Are you absolutely sure you want to permanently delete the guide for <span className="font-bold text-earth-charcoal">"{deleteTargetTitle}"</span>? 
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 text-[10px] text-amber-800 text-left font-light leading-relaxed flex items-start space-x-2">
                <span>⚠️</span>
                <span>This action cannot be undone. All database records for this region and all user-submitted reviews will be deleted.</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center pt-2">
              <button
                disabled={isPending}
                onClick={() => {
                  setDeleteTargetId(null);
                  setDeleteTargetTitle("");
                }}
                className="flex-1 px-4 py-2.5 border border-earth-clay/20 text-earth-charcoal/75 hover:border-earth-charcoal font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                disabled={isPending}
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white font-sans text-xs font-bold uppercase tracking-widest transition-all rounded-none cursor-pointer disabled:opacity-50"
              >
                {isPending ? "Deleting..." : "Delete Guide"}
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
