# 00_PROJECT_OVERVIEW.md

> **Status:** ACTIVE (V0.1 Launch Phase)
> **Last Updated:** 2025-11-02
> **Architect:** Amadeus

## 1. Vision & Philosophie : "Solarpunk Pragmatism"

**KBS (Kounta Business System)** n'est pas une simple application de petites annonces. C'est une infrastructure souveraine conçue pour ré-ancrer l'économie numérique dans le réel, spécifiquement pour le corridor **Ohio / Kentucky**.

### La Mission
**"Turn Clutter into Cash & Good Karma."**
Nous transformons le chaos (objets inutilisés) en valeur (Cash) ou en lien social (Don/Karma), en réduisant la friction au minimum absolu.

### Les Principes Directeurs
1.  **Antifragilité :** Le système doit gagner en robustesse face au stress. Si l'IA échoue, le flux manuel prend le relais. Si le réseau est lent, l'interface reste réactive.
2.  **Sobriété Intelligente (Solarpunk) :** Pas de "Bloatware". Nous utilisons des technologies éprouvées et efficaces. L'esthétique est "Clean", verte (#4ADE80), et optimiste.
3.  **Local First (Fractale) :** L'économie est locale. L'architecture logicielle reflète la géographie physique (Cercles/Hubs).
4.  **Mobile First :** L'usage se fait debout, dans un garage ou une rue. L'UI doit être utilisable à une main (Bottom Navigation, Gros boutons).

---

## 2. Tech Stack Souveraine (V0.1)

Nous refusons la complexité inutile. Voici le socle technologique validé :

### Frontend (The Shell)
* **Framework :** Next.js 14+ (App Router). *Strict Mode.*
* **Language :** TypeScript. *Typage strict aligné sur la DB.*
* **Styling :** Tailwind CSS.
    * *Design System :* "Stitch UI".
    * *Primary Color :* Green `#4ADE80`.
    * *Utils :* `clsx`, `tailwind-merge` (pour la gestion propre des classes conditionnelles).
    * *Icons :* `lucide-react`.
* **State Management :** React Server Components (RSC) pour le fetch, Client Components pour l'interactivité. `localStorage` pour la persistance légère (choix du hub).

### Backend (The Core)
* **Platform :** Supabase (BaaS).
* **Database :** PostgreSQL 15+.
* **Auth :** Supabase Auth (Email/Password).
* **Storage :** Supabase Storage (Buckets: `avatars`, `listings`).
* **Realtime :** Supabase Realtime (Channels pour Chat & Notifications).

### Intelligence (The Cortex) - *DÉSACTIVÉE POUR V0.1*
* **Model :** Gemini Flash 2.0 via Google AI Studio API.
* **Status V0.1 :** Le code IA est présent mais "commenté/mocké" (Clean Build) pour garantir un déploiement sans friction API. L'activation se fera en V0.2.

### DevOps (The Pipeline)
* **Repository :** GitHub (Branch `main` = Production).
* **Hosting :** Vercel (CD automatique sur push main).

---

## 3. Architecture Fractale : Les "Cercles"

L'application n'est pas monolithique dans son usage. Elle est fédérée.

* **Le Concept :** Un "Cercle" (Circle) est une zone géographique définie (Ville ou Quartier).
* **L'Expérience :**
    1.  L'utilisateur sélectionne son Hub (ex: "Florence Hub, KY").
    2.  L'application filtre *tout* (Listings, Stories, Recherche) sur ce `circle_id`.
    3.  L'utilisateur peut changer de Hub, mais il vit principalement dans un seul.
* **Données Seed V0.1 :**
    * Florence Hub (KY)
    * Cincinnati Downtown (OH)
    * Covington (KY)

---

## 4. Objectifs de la Phase Actuelle (MPH4 - Deployment)

Nous sommes à la charnière entre le développement (AI Studio) et la production (Cloud).

**Objectifs Critiques V0.1 :**
1.  **Clean Build :** Éliminer toute erreur de build liée à des dépendances IA manquantes ou des clés API non configurées.
2.  **Data Alignment :** S'assurer que le code TypeScript (`types/database.ts`) correspond exactement au schéma SQL Supabase déployé.
3.  **Routing Check :** Valider que la navigation (Home -> Detail -> Chat -> Profile) est fluide et sans liens morts.
4.  **Launch :** Déploiement réussi sur Vercel avec les variables d'environnement minimales (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

---

## 5. Glossaire "Business" (Ubiquitous Language)
* **Listing :** Un objet en vente ou en don.
* **Transaction :** Une promesse d'achat (pas encore un paiement Stripe complet en V0.1, mais l'enregistrement de l'acte).
* **Karma Points :** Monnaie de réputation gagnée par les dons.
* **Escrow (Séquestre) :** Concept clé (implémentation Stripe Connect prévue V0.2) où l'argent est bloqué jusqu'à livraison.
* **Story :** Contenu éphémère (24h) posté dans un Cercle pour animer la communauté.
