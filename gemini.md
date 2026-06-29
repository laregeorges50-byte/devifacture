# DeviFacture - Documentation & Contexte pour l'IA

Ce document a été généré pour fournir un contexte complet aux futurs modèles d'Intelligence Artificielle (comme Gemini) travaillant sur ce projet. **À chaque nouvelle session, l'IA doit lire ce fichier pour comprendre la vision, la stack et les choix architecturaux.**

## 1. Ce que fait l'application
**DeviFacture** est un SaaS full-stack moderne conçu spécifiquement pour les entrepreneurs et particuliers africains. Il remplace les processus archaïques (Word/Excel) de création de devis et de factures en proposant une plateforme intuitive, sécurisée et "World Class". L'objectif est de permettre la création de documents professionnels et conformes en quelques clics, avec un suivi des paiements et une gestion simplifiée des clients.

## 2. Toutes les fonctionnalités implémentées
- **Landing Page Haute Conversion :** Page d'accueil premium avec Hero, grille de tarification à 4 colonnes (Gratuit, Starter, Pro ⭐, Business), comparaisons interactives et FAQ.
- **Authentification Complète (Supabase) :** Inscription (avec nom), Connexion, Réinitialisation de mot de passe. Les métadonnées utilisateur (`full_name`) sont stockées via `user_metadata` de Supabase Auth.
- **Protection des Routes :** Middleware Next.js qui empêche l'accès aux routes `/admin` sans session active.
- **Tableau de Bord Admin :** Interface de gestion avec sidebar, KPIs (Total Documents, Devis en attente, Factures payées, Clients Actifs).
- **Page Devis & Factures (`/admin/documents`) :** Liste filtrable de tous les documents de l'utilisateur avec badges de statut et de type.
- **Page Clients (`/admin/clients`) :** Gestion CRUD complète des clients (Ajout, Suppression, Liste).
- **Page Paramètres (`/admin/settings`) :** Configuration du profil (nom, entreprise, adresse, RCCM/SIRET, TVA par défaut). Stocké dans `user_metadata`.
- **Éditeur de Factures/Devis ("Style Excel") :** Grille interactive avec :
  - Ajout dynamique de lignes.
  - **Système de formules mathématiques** : taper `=500*3` dans Qté ou Prix évalue l'expression automatiquement.
  - Navigation clavier (Entrée, Tab, Flèches ↑↓).
  - Calcul en temps réel du Sous-total, TVA (taux configurable) et Total TTC.
  - Sauvegarde sécurisée dans Supabase.
- **Espace Super Admin (`/super-admin`) :** Panneau développeur exclusif (thème Noir/Violet), protégé par whitelist email. Affiche les statistiques globales du système.

## 3. Structure des Fichiers Principaux
La structure suit les recommandations de Next.js (App Router) :

```text
/src
 ├── app/
 │   ├── page.tsx                           # Landing Page
 │   ├── layout.tsx                         # Layout global (Polices, Metadata)
 │   ├── middleware.ts                      # Middleware Next.js Global
 │   ├── login/                             # Page Connexion
 │   │   ├── page.tsx                       # UI de connexion
 │   │   └── actions.ts                     # Server Actions (login, signup, logout, resetPassword)
 │   ├── signup/page.tsx                    # Page Inscription (avec champ Nom)
 │   ├── reset-password/page.tsx            # Page Réinitialisation MDP
 │   ├── admin/                             # Espace privé utilisateur
 │   │   ├── layout.tsx                     # Sidebar & Layout Admin (+ lien Super Admin conditionnel)
 │   │   ├── page.tsx                       # Dashboard Analytics
 │   │   ├── documents/
 │   │   │   ├── page.tsx                   # Liste des devis & factures
 │   │   │   └── create/page.tsx            # Éditeur interactif Excel-style
 │   │   ├── clients/page.tsx               # Gestion CRUD des clients
 │   │   └── settings/page.tsx              # Paramètres du profil & entreprise
 │   └── super-admin/                       # Espace développeur (protégé par email)
 │       ├── layout.tsx                     # Layout dark (Noir/Violet)
 │       └── page.tsx                       # Statistiques globales système
 ├── utils/
 │   └── supabase/                          # Clients Supabase SSR
 │       ├── client.ts                      # Client Browser
 │       ├── server.ts                      # Client Server-side
 │       └── middleware.ts                  # Logique de session (Auth)
```

## 4. Technologies Utilisées (Stack)
- **Framework :** Next.js 14+ (App Router)
- **Langage :** TypeScript / React
- **Styling :** Tailwind CSS (Vanilla)
- **Animations :** Framer Motion
- **Icônes :** Lucide React
- **Backend as a Service (BaaS) :** Supabase (PostgreSQL)
  - Modules utilisés : Supabase Auth, Row Level Security (RLS), Supabase SSR.

## 5. Base de données (Tables SQL)
| Table            | Description                                                 |
|------------------|-------------------------------------------------------------|
| `clients`        | Clients de l'utilisateur (nom, email, téléphone, adresse)   |
| `documents`      | Devis et factures (type, statut, totaux, numéro)            |
| `document_lines` | Lignes d'un document (description, qté, prix, total)        |

Toutes les tables ont **RLS activé** avec des politiques liées à `auth.uid()`.

## 6. Décisions de Design (UI/UX)
- **Esthétique "World Class" :** Espacements multiples de 8px, ombres douces (`shadow-xl shadow-gray-200/50`), bords arrondis (`rounded-xl`, `rounded-3xl`), dégradés subtils.
- **Couleurs :** Fonds clairs (`bg-gray-50`), cartes blanches (`bg-white`), bleu premium (`blue-600`). Super Admin = thème sombre (`bg-gray-950`) + violet (`purple-600`).
- **Éditeur Excel-like :** Champs transparents, alignement `text-right tabular-nums`, formules commençant par `=` colorées en bleu.
- **Super Admin EMAILS whitelist :** Seul `lare50@gmail.com` peut accéder à `/super-admin`. Modifier la constante `SUPER_ADMIN_EMAILS` dans `admin/layout.tsx` et `super-admin/layout.tsx`.

## 7. ⚠️ Instructions Strictes pour le Futur Modèle IA
À chaque intervention sur ce dépôt, tu DOIS respecter ces règles :

1. **Ne casse pas le design :** Conserve l'esthétique premium de Tailwind. Utilise toujours les classes d'espacement existantes et ne rajoute pas de couleurs hors-charte sans justification.
2. **App Router & Server Actions :** N'utilise pas d'anciennes méthodes (`pages/` ou API Routes `req/res`). Tout ajout backend doit se faire via des **Server Actions** (dans des fichiers `actions.ts`) ou des composants serveur.
3. **Composants Clients (`"use client"`) :** L'éditeur de factures, la page Clients et la page Paramètres sont des composants clients interactifs. Ne les transforme pas en composants serveur.
4. **Sécurité & Supabase :** Si tu ajoutes une table SQL, **tu dois obligatoirement créer ses politiques RLS** pour que chaque utilisateur n'accède qu'à ses propres données (`auth.uid()`).
5. **Compréhension du Contexte :** Les utilitaires Supabase SSR sont dans `src/utils/supabase/`. Utilise `createClient()` depuis `client.ts` (côté browser) ou `server.ts` (côté serveur).
6. **Super Admin :** La whitelist email est dupliquée dans `admin/layout.tsx` et `super-admin/layout.tsx`. Les deux doivent rester synchronisées.
7. **Formules Excel :** Le parser est dans `documents/create/page.tsx` via la fonction `evaluateFormula()`. Il accepte `=expression` et n'autorise que les caractères mathématiques sûrs.

# R�gles de s�curit� front-end
N'affiche jamais d'informations sensibles (num�ros de t�l�phone, cl�s priv�es, mots de passe, etc.) en dur dans le code frontend. Utilise toujours des variables d'environnement (ex: process.env.NEXT_PUBLIC_...).

