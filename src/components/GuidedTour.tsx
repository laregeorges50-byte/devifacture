'use client'

import React, { useState, useEffect } from 'react'
import { Joyride, STATUS } from 'react-joyride'

export function GuidedTour({ userId }: { userId?: string }) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà vu le tutoriel
    const storageKey = userId ? `devifacture_tour_completed_${userId}` : 'devifacture_tour_completed'
    const hasSeenTour = localStorage.getItem(storageKey)
    if (!hasSeenTour) {
      // Démarre le tour avec un petit délai pour s'assurer que le DOM est chargé
      const timer = setTimeout(() => {
        setRun(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const steps: any[] = [
    {
      target: 'body',
      placement: 'center',
      content: (
        <div className="text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Bienvenue sur DeviFacture ! 🎉</h2>
          <p className="text-gray-600">Je vais vous guider rapidement pour vous montrer comment créer vos premières factures de façon professionnelle.</p>
        </div>
      ),
      disableBeacon: true,
    },
    {
      target: '#tour-settings',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-gray-900 mb-1">Étape 1 : Vos Paramètres</h3>
          <p className="text-gray-600">Commencez par ici pour configurer le nom de votre entreprise et ajouter votre beau logo. Cela personnalisera tous vos futurs documents !</p>
        </div>
      ),
      placement: 'right',
    },
    {
      target: '#tour-new-doc',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-gray-900 mb-1">Étape 2 : Créer un document</h3>
          <p className="text-gray-600">Une fois configuré, cliquez ici pour générer votre premier devis ou votre première facture en un instant.</p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '#tour-dashboard',
      content: (
        <div className="text-left">
          <h3 className="font-bold text-gray-900 mb-1">Et c'est tout !</h3>
          <p className="text-gray-600">Vous retrouverez l'ensemble de votre activité, devis et factures ici sur votre tableau de bord. À vous de jouer !</p>
        </div>
      ),
      placement: 'center',
    }
  ]

  const handleJoyrideCallback = (data: any) => {
    const { status } = data
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      setRun(false)
      // Enregistre que l'utilisateur a fini le tutoriel
      const storageKey = userId ? `devifacture_tour_completed_${userId}` : 'devifacture_tour_completed'
      localStorage.setItem(storageKey, 'true')
    }
  }

  return (
    // @ts-ignore
    <Joyride
      steps={steps}
      run={run}
      {...({ continuous: true, showSkipButton: true, showProgress: true } as any)}
      callback={handleJoyrideCallback}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer le tutoriel'
      }}
      styles={({
        options: {
          primaryColor: '#2563eb', // text-blue-600
          zIndex: 10000,
        },
        tooltipContainer: {
          textAlign: 'left'
        },
        buttonNext: {
          backgroundColor: '#2563eb',
          borderRadius: '8px',
          fontWeight: 600
        },
        buttonBack: {
          marginRight: 10,
          color: '#4b5563'
        },
        buttonSkip: {
          color: '#6b7280'
        }
      } as any)}
    />
  )
}
