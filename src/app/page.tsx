"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  FileText,
  Calculator,
  AlertTriangle,
  Menu,
  X,
  ArrowRight,
  Zap,
  PlayCircle,
  LayoutDashboard,
  Settings,
  DownloadCloud,
  XCircle,
  Check
} from "lucide-react";

import { createClient } from "@/utils/supabase/client";

// Animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
      }
    };
    checkUser();
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-50 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Background Patterns */}
      <div className="fixed inset-0 z-[9999] pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>
      
      {/* Navbar */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-transparent py-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <div className="w-4 h-4 rounded-sm bg-white"></div>
            </div>
            <span className="font-bold text-2xl tracking-tight text-gray-900">DeviFacture</span>
          </div>

          {/* Desktop Nav - Parfaitement centré et espacé */}
          <nav className="hidden lg:flex flex-none justify-center items-center gap-6 xl:gap-10">
            <a href="#features" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">Fonctionnalités</a>
            <a href="#comparison" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">Pourquoi nous ?</a>
            <a href="#how-it-works" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#pricing" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">Tarifs</a>
          </nav>

          <div className="hidden md:flex flex-1 items-center justify-end gap-4">
            {isLoggedIn ? (
              <Link href="/admin" className="bg-gray-900 text-white hover:bg-gray-800 transition-all px-6 py-2.5 rounded-xl text-base font-medium shadow-sm hover:shadow-md">
                Mon Espace
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-base font-medium text-gray-600 hover:text-gray-900 transition-colors">Connexion</Link>
                <Link href="/signup" className="bg-gray-900 text-white hover:bg-gray-800 transition-all px-6 py-2.5 rounded-xl text-base font-medium shadow-sm hover:shadow-md">
                  Créer un compte
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-gray-600 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 px-6 py-8 flex flex-col gap-6 shadow-xl text-center"
            >
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-lg font-medium p-3 rounded-xl hover:bg-gray-50 mx-auto w-full max-w-sm">Fonctionnalités</a>
              <a href="#comparison" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-lg font-medium p-3 rounded-xl hover:bg-gray-50 mx-auto w-full max-w-sm">Pourquoi nous ?</a>
              <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-lg font-medium p-3 rounded-xl hover:bg-gray-50 mx-auto w-full max-w-sm">Comment ça marche</a>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-gray-700 text-lg font-medium p-3 rounded-xl hover:bg-gray-50 mx-auto w-full max-w-sm">Tarifs</a>
              <div className="h-px bg-gray-100 my-2 max-w-sm mx-auto w-full"></div>
              {isLoggedIn ? (
                <Link href="/admin" className="block bg-blue-600 text-white rounded-xl p-4 text-lg font-medium mx-auto w-full max-w-sm shadow-md text-center">Accéder à mon espace</Link>
              ) : (
                <>
                  <Link href="/login" className="block font-medium text-lg text-gray-700 p-3 hover:bg-gray-50 rounded-xl mx-auto w-full max-w-sm text-center">Connexion</Link>
                  <Link href="/signup" className="block bg-blue-600 text-white rounded-xl p-4 text-lg font-medium mx-auto w-full max-w-sm shadow-md text-center">Créer un compte</Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-24 md:pt-48 md:pb-32 px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl w-full">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold tracking-wide uppercase mb-10">
              <Zap size={16} className="fill-blue-600" />
              <span>Gagnez du temps sur vos devis et factures</span>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 tracking-tight leading-[1.1] text-balance mb-8">
              Des devis et factures <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">ultras professionnels</span>.
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 leading-relaxed mb-12 max-w-3xl mx-auto text-balance">
              La plateforme conçue pour les entrepreneurs africains. Abandonnez Word et Excel. Créez des documents conformes, personnalisés, et transformez vos devis en factures en un clic.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
              <Link href={isLoggedIn ? "/admin" : "/signup"} className="w-full sm:w-auto bg-blue-600 text-white hover:bg-blue-700 transition-all px-8 py-4 rounded-2xl text-lg font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5">
                {isLoggedIn ? "Accéder à mon espace" : "Commencer maintenant"}
                <ArrowRight size={20} />
              </Link>
              <Link href="/comment-ca-marche" className="w-full sm:w-auto bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 transition-all px-8 py-4 rounded-2xl text-lg font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5">
                <PlayCircle size={20} />
                Voir comment ça marche
              </Link>
            </motion.div>
          </motion.div>

          {/* Pure CSS Invoicing UI Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-5xl mx-auto mt-20 lg:mt-32 relative perspective-1000"
          >
            {/* Background glowing blur */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-400/20 blur-[120px] rounded-full pointer-events-none"></div>
            
            {/* The Mockup container */}
            <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-200/60 p-6 md:p-10 transform transition-transform hover:scale-[1.02] duration-500 text-left">
              
              {/* Fake Browser/App Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                <div className="flex gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-400"></div>
                  <div className="w-4 h-4 rounded-full bg-yellow-400"></div>
                  <div className="w-4 h-4 rounded-full bg-green-400"></div>
                </div>
                <div className="text-base font-medium text-gray-500 hidden sm:block">Création de document - DEV-2026-042</div>
                <div className="flex gap-3">
                  <button className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors hidden md:flex items-center gap-2"><DownloadCloud size={16}/> Brouillon</button>
                  <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm">Générer PDF</button>
                </div>
              </div>

              {/* Invoice Body Mockup */}
              <div className="flex flex-col lg:flex-row gap-10">
                {/* Left side: Client & Details */}
                <div className="flex-1 space-y-8">
                   <div className="flex justify-between items-start">
                     <div>
                       <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-4 shadow-sm">LOGO</div>
                       <div className="h-3 w-40 bg-gray-200 rounded mb-3"></div>
                       <div className="h-2 w-32 bg-gray-100 rounded"></div>
                     </div>
                     <div className="text-right">
                       <h2 className="text-3xl font-black text-gray-800 tracking-tight mb-2 uppercase">Devis</h2>
                       <div className="text-base text-gray-500">Date: 07 Juin 2026</div>
                     </div>
                   </div>

                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                     <div className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">À l'attention de</div>
                     <div className="h-5 w-64 bg-gray-300 rounded mb-3"></div>
                     <div className="h-3 w-40 bg-gray-200 rounded mb-2"></div>
                     <div className="h-3 w-48 bg-gray-200 rounded"></div>
                   </div>

                   {/* Table */}
                   <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                     <div className="bg-gray-50/80 flex px-6 py-4 text-sm font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                       <div className="flex-1">Description</div>
                       <div className="w-20 text-center hidden md:block">Qté</div>
                       <div className="w-32 text-right hidden md:block">Prix Uni.</div>
                       <div className="w-32 text-right">Total</div>
                     </div>
                     <div className="px-6 py-4 flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                       <div className="flex-1"><div className="text-base font-semibold text-gray-800">Développement Web complet</div><div className="text-sm text-gray-500 mt-1">Application Next.js & Supabase</div></div>
                       <div className="w-20 text-center text-base text-gray-600 hidden md:block">1</div>
                       <div className="w-32 text-right text-base text-gray-600 hidden md:block">1 500 000</div>
                       <div className="w-32 text-right text-base font-bold text-gray-900">1 500 000</div>
                     </div>
                     <div className="px-6 py-4 flex border-b border-gray-100 items-center hover:bg-gray-50 transition-colors">
                       <div className="flex-1"><div className="text-base font-semibold text-gray-800">Design UI/UX</div><div className="text-sm text-gray-500 mt-1">Maquettes Figma complètes</div></div>
                       <div className="w-20 text-center text-base text-gray-600 hidden md:block">3</div>
                       <div className="w-32 text-right text-base text-gray-600 hidden md:block">200 000</div>
                       <div className="w-32 text-right text-base font-bold text-gray-900">600 000</div>
                     </div>
                   </div>
                </div>

                {/* Right side: Totals (Sidebar on desktop) */}
                <div className="w-full lg:w-80 flex flex-col justify-end border-t lg:border-t-0 lg:border-l border-gray-100 pt-8 lg:pt-0 lg:pl-10">
                   <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                     <div className="flex justify-between items-center py-3 border-b border-gray-100">
                       <span className="text-base text-gray-500">Sous-total</span>
                       <span className="text-base font-semibold text-gray-800">2 100 000 F</span>
                     </div>
                     <div className="flex justify-between items-center py-3 border-b border-gray-100">
                       <span className="text-base text-gray-500">TVA (18%)</span>
                       <span className="text-base font-semibold text-gray-800">378 000 F</span>
                     </div>
                     <div className="flex justify-between items-center pt-5 mt-2">
                       <span className="text-base font-bold text-gray-900 uppercase">Total TTC</span>
                       <span className="text-2xl font-black text-blue-600">2 478 000 F</span>
                     </div>
                   </div>
                   
                   {/* Floating Success Badge */}
                   <motion.div 
                     initial={{ scale: 0.8, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     transition={{ delay: 1, type: "spring" }}
                     className="absolute -right-6 -bottom-6 bg-green-500 text-white px-6 py-4 rounded-2xl shadow-xl shadow-green-500/20 font-bold flex items-center gap-3 border-4 border-white text-base"
                   >
                     <CheckCircle2 size={24} />
                     Devis Sauvegardé
                   </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Section (Problem & Solution) */}
      <section id="comparison" className="py-24 md:py-32 bg-white relative z-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6 text-balance">L'évolution naturelle de votre entreprise</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Passez à la vitesse supérieure et laissez les méthodes obsolètes derrière vous.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-stretch max-w-6xl mx-auto">
            {/* Ancienne méthode */}
            <div className="p-8 md:p-12 rounded-3xl bg-red-50 border border-red-100 flex flex-col h-full">
              <h3 className="text-2xl font-bold text-red-900 mb-8 flex items-center gap-3">
                <XCircle className="text-red-500" size={28} />
                Les anciennes méthodes
              </h3>
              <ul className="space-y-6 flex-1">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-red-100 p-1.5 rounded-full text-red-600 shrink-0"><X size={16} /></div>
                  <span className="text-red-900/80 text-lg leading-snug">Factures Word peu professionnelles qui se déforment.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-red-100 p-1.5 rounded-full text-red-600 shrink-0"><X size={16} /></div>
                  <span className="text-red-900/80 text-lg leading-snug">Calculs manuels et erreurs fréquentes de TVA ou de totaux.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-red-100 p-1.5 rounded-full text-red-600 shrink-0"><X size={16} /></div>
                  <span className="text-red-900/80 text-lg leading-snug">Difficulté à suivre les paiements et relancer les clients.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-red-100 p-1.5 rounded-full text-red-600 shrink-0"><X size={16} /></div>
                  <span className="text-red-900/80 text-lg leading-snug">Documents dispersés dans des dossiers locaux sans sauvegarde.</span>
                </li>
              </ul>
            </div>

            {/* Avec DeviFacture */}
            <div className="p-8 md:p-12 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-900/20 flex flex-col h-full relative overflow-hidden">
              {/* Decor */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
              
              <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3 relative z-10">
                <CheckCircle2 className="text-blue-300" size={28} />
                Avec DeviFacture
              </h3>
              <ul className="space-y-6 flex-1 relative z-10">
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-white/20 p-1.5 rounded-full text-white shrink-0"><Check size={16} /></div>
                  <span className="text-blue-50 text-lg leading-snug">Création de factures et devis ultra-professionnels.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-white/20 p-1.5 rounded-full text-white shrink-0"><Check size={16} /></div>
                  <span className="text-blue-50 text-lg leading-snug">Calculs 100% automatiques et sans aucune erreur.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-white/20 p-1.5 rounded-full text-white shrink-0"><Check size={16} /></div>
                  <span className="text-blue-50 text-lg leading-snug">Gestion centralisée, suivi des paiements et gain de temps massif.</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 bg-white/20 p-1.5 rounded-full text-white shrink-0"><Check size={16} /></div>
                  <span className="text-blue-50 text-lg leading-snug">Image beaucoup plus sérieuse auprès de vos clients.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section id="features" className="py-24 md:py-32 bg-gray-50 relative z-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6 text-balance">Gérez vos devis et factures comme un pro</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Des fonctionnalités pensées spécifiquement pour fluidifier vos ventes et simplifier votre quotidien.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
            {/* Feature 1: Tracking */}
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 mb-10 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto md:mx-0 mb-6 ring-1 ring-blue-100">
                  <LayoutDashboard size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Transformez vos devis en un clic</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Suivez l'état de vos devis, et convertissez-les en factures instantanément une fois acceptés par le client.</p>
              </div>
              
              <div className="mt-auto -mx-8 md:-mx-12 -mb-8 md:-mb-12 bg-gray-50 border-t border-gray-100 p-8 md:p-12">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 space-y-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                  <div className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-lg">A</div>
                      <div>
                        <div className="text-base font-bold text-gray-900">Agence digitale</div>
                        <div className="text-sm text-gray-500">DEVIS-2026-001</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900">1 500 000 F</div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">Accepté</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center font-bold text-green-700 text-lg">B</div>
                      <div>
                        <div className="text-base font-bold text-gray-900">Boutique Mode</div>
                        <div className="text-sm text-gray-500">FACTURE-2026-002</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-gray-900">300 000 F</div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">Payé</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Customization */}
            <div className="p-8 md:p-12 rounded-[2.5rem] bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between overflow-hidden relative group">
              <div className="relative z-10 mb-10 text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto md:mx-0 mb-6 ring-1 ring-purple-100">
                  <Settings size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Documents à votre image</h3>
                <p className="text-gray-600 text-lg leading-relaxed">Ajoutez votre logo, votre signature et vos conditions générales de vente pour sécuriser vos accords commerciaux.</p>
              </div>
              
              <div className="mt-auto -mx-8 md:-mx-12 -mb-8 md:-mb-12 bg-gray-50 border-t border-gray-100 p-8 md:p-12 flex justify-center">
                 <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-md w-full max-w-md transform group-hover:-translate-y-2 transition-transform duration-500">
                   <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
                         <span className="text-sm font-bold mt-1">LOGO</span>
                      </div>
                      <div className="flex-1 space-y-4">
                         <div className="h-12 border border-gray-200 rounded-xl bg-gray-50 w-full flex items-center px-4 text-sm text-gray-500">Nom de votre Entreprise</div>
                         <div className="h-12 border border-gray-200 rounded-xl bg-gray-50 w-full flex items-center px-4 text-sm text-gray-500">NIF / Numéro de Siret</div>
                      </div>
                   </div>
                   <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                      <span className="text-base font-semibold text-gray-700">Activer la signature numérique</span>
                      <div className="w-14 h-7 bg-blue-600 rounded-full relative cursor-pointer shadow-inner">
                         <div className="w-6 h-6 bg-white rounded-full absolute right-0.5 top-0.5 shadow"></div>
                      </div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white relative z-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-4 block">Rapide et facile</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight text-balance">3 étapes simples</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16 md:gap-8 relative max-w-5xl mx-auto">
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-[2px] bg-gray-100 z-0"></div>

            {[
              { step: "1", title: "Inscription", desc: "Créez votre compte gratuitement en moins d'une minute." },
              { step: "2", title: "Configuration", desc: "Entrez les détails de votre entreprise et importez votre logo." },
              { step: "3", title: "Génération PDF", desc: "Téléchargez votre devis ou facture prêt à être envoyé." }
            ].map((item, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center px-4">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-50 flex items-center justify-center text-gray-900 mb-8 font-black text-2xl shadow-lg ring-1 ring-gray-200">
                  {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 md:py-32 bg-gray-50 relative z-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight text-balance">Ils gèrent leurs factures comme des pros</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed mt-6 text-balance">Découvrez pourquoi des centaines d'entrepreneurs africains nous font confiance au quotidien.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
            {[
              { name: "Komi D.", role: "Développeur Freelance", country: "Togo", quote: "Je perdais un temps fou sur Excel. Avec DeviFacture, mon devis est fait en 2 minutes sur mon téléphone et transformé en facture d'un simple clic.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Komi&backgroundColor=e0f2fe" },
              { name: "Awa T.", role: "Gérante de Boutique", country: "Côte d'Ivoire", quote: "L'interface est super intuitive. J'aime particulièrement le fait de pouvoir voir directement les devis en attente de signature sur mon tableau de bord.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Awa&backgroundColor=fce7f3" },
              { name: "Ousmane S.", role: "Consultant", country: "Sénégal", quote: "Mes devis font enfin professionnels ! Depuis que j'utilise cet outil, j'ai remarqué que mes prospects valident leurs commandes beaucoup plus vite.", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Ousmane&backgroundColor=dcfce7" }
            ].map((item, i) => (
              <div key={i} className="p-10 rounded-3xl bg-white border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                <div className="flex text-yellow-400 mb-8 gap-1">
                  {[...Array(5)].map((_, j) => <svg key={j} className="w-6 h-6 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <p className="text-gray-700 mb-10 flex-1 text-lg leading-relaxed italic">"{item.quote}"</p>
                <div className="flex items-center gap-5 pt-6 border-t border-gray-100">
                  <img src={item.avatar} alt={item.name} className="w-16 h-16 rounded-full bg-gray-100 object-cover shadow-sm ring-2 ring-gray-50" />
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">{item.name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{item.role}</p>
                    <p className="text-sm text-gray-400">{item.country}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Correctement Centré */}
      <section id="pricing" className="py-24 md:py-32 bg-white relative z-10 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-6 text-balance">Des tarifs adaptés à votre croissance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed text-balance">Passez au niveau supérieur sans vous ruiner. Aucun frais caché.</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 max-w-7xl mx-auto items-stretch">
            {/* Free Plan */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
              <p className="text-sm text-gray-500 mb-6">Pour découvrir la plateforme</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">0 F</span>
              </div>
              <Link href={isLoggedIn ? "/admin/plans" : "/signup"} className="w-full inline-block py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors mb-8 text-sm shadow-sm text-center">
                {isLoggedIn ? "Gérer mon abonnement" : "Commencer gratuitement"}
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 flex-1 w-full">
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> 2 devis + 2 factures</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Profil basique</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-green-500 shrink-0" /> Export PDF</li>
              </ul>
            </div>

            {/* Starter Plan */}
            <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-md flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les petits besoins</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">2 000 F</span>
              </div>
              <Link href={isLoggedIn ? "/admin/plans" : "/signup"} className="w-full inline-block py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors mb-8 text-sm shadow-sm text-center">
                Passer au Starter
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 flex-1 w-full">
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> 20 documents</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Sans expiration</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-500 shrink-0" /> Support par email</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-900/20 border border-blue-500 flex flex-col items-center text-center transform lg:-translate-y-4">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-white text-blue-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-md border border-blue-100 whitespace-nowrap">Le plus populaire</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 mt-2">Pro ⭐</h3>
              <p className="text-blue-100 text-sm mb-6">Pour les indépendants</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-white">5 000 F</span>
              </div>
              <Link href={isLoggedIn ? "/admin/plans" : "/signup"} className="w-full inline-block py-3 px-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-gray-50 transition-colors mb-8 text-sm shadow-md hover:-translate-y-0.5 text-center">
                Passer au Pro
              </Link>
              <ul className="space-y-4 text-sm text-blue-50 flex-1 w-full">
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> 80 documents</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> Sans expiration</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-blue-300 shrink-0" /> Personnalisation avancée</li>
              </ul>
            </div>

            {/* Business Plan */}
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-200 shadow-sm flex flex-col items-center text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
              <p className="text-sm text-gray-500 mb-6">Pour les agences</p>
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900">10 000 F</span>
              </div>
              <Link href={isLoggedIn ? "/admin/plans" : "/signup"} className="w-full inline-block py-3 px-4 rounded-xl border border-gray-300 bg-white text-gray-900 font-bold hover:bg-gray-100 transition-colors mb-8 text-sm shadow-sm text-center">
                Choisir ce plan
              </Link>
              <ul className="space-y-4 text-sm text-gray-600 flex-1 w-full">
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> 200 documents</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> Sans expiration</li>
                <li className="flex items-center justify-center gap-2"><CheckCircle2 size={18} className="text-gray-900 shrink-0" /> Support prioritaire</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Totalement Centré */}
      <section className="py-16 md:py-24 bg-white relative z-10">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="bg-blue-600 rounded-3xl overflow-hidden p-12 md:p-20 text-center shadow-2xl relative flex flex-col items-center justify-center">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-10 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-[100px]"></div>
            
            <div className="relative z-10 flex flex-col items-center justify-center gap-8 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight text-balance">Prêt à simplifier vos devis et factures ?</h2>
              <p className="text-blue-100 text-lg md:text-xl mb-4 text-balance">Rejoignez les entrepreneurs africains qui gagnent du temps chaque jour.</p>
              
              <Link href={isLoggedIn ? "/admin" : "/signup"} className="w-full sm:w-auto inline-flex bg-white text-blue-600 hover:bg-gray-50 px-10 py-5 rounded-2xl text-xl font-bold shadow-lg items-center justify-center gap-3 transition-transform hover:-translate-y-1">
                {isLoggedIn ? "Aller au tableau de bord" : "Créer un compte gratuit"}
                <ArrowRight size={24} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="bg-white border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <div className="w-3 h-3 rounded-sm bg-white"></div>
            </div>
            <span className="font-bold text-lg text-gray-900">DeviFacture</span>
          </div>
          <div className="text-base text-gray-500 font-medium text-center">
            © 2026 DeviFacture. Fait avec fierté en Afrique 🌍
          </div>
          <div className="flex gap-8 text-base text-gray-500 font-medium justify-center">
            <a href="#" className="hover:text-gray-900 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Conditions</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
