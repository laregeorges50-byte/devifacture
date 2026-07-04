"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  UserPlus, 
  Settings, 
  FileText,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

export default function HowItWorksPage() {
  const steps = [
    {
      icon: <UserPlus className="w-10 h-10 text-blue-600" />,
      title: "1. Créez votre compte",
      description: "L'inscription est simple et rapide. En quelques secondes, vous accédez à votre tableau de bord personnel. Aucune carte de crédit n'est requise pour commencer.",
      color: "bg-blue-100 border-blue-200"
    },
    {
      icon: <Settings className="w-10 h-10 text-indigo-600" />,
      title: "2. Configurez votre profil",
      description: "Allez dans les Paramètres de votre espace pour renseigner le nom de votre entreprise, votre adresse e-mail de contact et ajouter votre logo pour personnaliser vos documents.",
      color: "bg-indigo-100 border-indigo-200"
    },
    {
      icon: <FileText className="w-10 h-10 text-emerald-600" />,
      title: "3. Créez devis et factures",
      description: "Retournez sur l'accueil de votre tableau de bord, cliquez sur 'Nouveau' et générez instantanément des devis et des factures ultra-professionnels à l'image de votre entreprise.",
      color: "bg-emerald-100 border-emerald-200"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-[0] pointer-events-none opacity-[0.02] bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')]"></div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-200 sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium">
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md">
              <div className="w-3 h-3 rounded-sm bg-white"></div>
            </div>
            <span className="font-bold text-xl tracking-tight text-gray-900">DeviFacture</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-16 md:pt-24">
        <div className="text-center mb-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] mb-6">
              Démarrez en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">3 étapes simples</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              La plateforme a été pensée pour vous faire gagner du temps. Voici comment générer votre première facture en moins de 2 minutes.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="space-y-12 md:space-y-24 relative"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
        >
          {/* Ligne connectrice sur Desktop */}
          <div className="hidden md:block absolute left-12 top-12 bottom-12 w-1 bg-gray-200 rounded-full z-0"></div>

          {steps.map((step, index) => (
            <motion.div key={index} variants={fadeUp} className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-16 items-start">
              {/* Icône (Mobile & Desktop) */}
              <div className={`shrink-0 w-24 h-24 rounded-3xl ${step.color} border-2 flex items-center justify-center shadow-lg mx-auto md:mx-0 relative`}>
                {step.icon}
                {/* Badge numéro */}
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold shadow-md">
                  {index + 1}
                </div>
              </div>

              {/* Contenu */}
              <div className="flex-1 bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 text-center md:text-left hover:shadow-2xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {step.description}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-green-600 font-medium">
                  <CheckCircle2 size={20} />
                  <span>Simple et intuitif</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action Final */}
        <motion.div 
          className="mt-24 text-center bg-gray-900 rounded-3xl p-10 md:p-16 shadow-2xl relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-600/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-600/20 blur-3xl"></div>
          
          <h2 className="relative z-10 text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à professionnaliser votre entreprise ?
          </h2>
          <p className="relative z-10 text-lg text-gray-300 mb-10 max-w-2xl mx-auto">
            Rejoignez les entrepreneurs qui utilisent DeviFacture pour facturer plus vite et être payés plus rapidement.
          </p>
          <Link href="/signup" className="relative z-10 inline-flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-500 transition-all px-8 py-4 rounded-xl text-lg font-bold shadow-lg hover:shadow-blue-600/50 hover:-translate-y-1">
            Créer mon compte gratuitement
            <ArrowRight size={20} />
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
