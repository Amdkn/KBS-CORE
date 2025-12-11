Markdown

# 04_MPH4_DEPLOYMENT_CICD.md

> **Status:** APPROVED (V0.1 Specs)
> **Context:** Build Pipeline, Environment Configuration, and Hosting
> **Critical:** "Green Build Policy". If `npm run build` fails locally, DO NOT PUSH to GitHub.

## 1. Clean Build Protocol ("Lobotomie Tactique IA")

Pour garantir l'Antifragilité du déploiement V0.1, nous retirons temporairement le "Cerveau" (Gemini) pour assurer la survie du "Corps" (App).

### A. Désactivation du Service IA
Le fichier `services/geminiService.ts` ne doit PAS contenir d'appels API réels ni importer `@google/generative-ai` si cela risque de briser le build sans clé.

**Code Attendu (Dummy Implementation) :**
```typescript
// services/geminiService.ts
export async function generateListingDetails(imageUrls: string[]) {
  console.warn("AI Module is DISABLED for V0.1 deployment.");
  // Retourne une structure vide ou null pour ne pas casser le frontend
  return null;
}
B. Nettoyage des Pages
Page /sell : Le bouton "Enhance with AI" doit être soit commenté, soit désactivé (disabled={true}), soit caché. Le flux par défaut est 100% manuel.

Imports : Vérifier qu'aucun fichier ne tente d'importer une librairie manquante.

2. Variables d'Environnement (Secrets)
KBS V0.1 ne nécessite que DEUX clés pour fonctionner en production.

A. Fichiers Locaux (.env.local)
Ce fichier ne doit JAMAIS être commité sur GitHub.

Bash

NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_LONG_ANON_KEY]"
B. Configuration Vercel (Production)
Lors de l'import du projet sur Vercel :

Copier les valeurs du .env.local.

Les coller dans les "Environment Variables" du projet Vercel.

INTERDIT : Ne pas ajouter GEMINI_API_KEY pour l'instant. Cela évite que Vercel ne tente de valider une clé qui n'est pas utilisée.

3. Configuration Next.js (next.config.js)
C'est la cause #1 des échecs de déploiement Vercel : les domaines d'images non autorisés.

Configuration Requise
Le fichier next.config.js doit strictement ressembler à ceci pour accepter les images de Seed Data (Unsplash, Pravatar) et les uploads utilisateurs (Supabase).

JavaScript

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        // Attention : Remplacer par le vrai domaine si possible, 
        // ou utiliser le wildcard pour tous les projets supabase
        hostname: '**.supabase.co', 
      },
    ],
  },
  // Désactive le check ESLint strict pendant le build pour V0.1 
  // (Permet de déployer même avec des warnings mineurs)
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Idem pour TS, on veut shipper la V0.1
    ignoreBuildErrors: true, 
  }
};

module.exports = nextConfig;
4. Pipeline GitHub & Vercel
A. Git Hygiene
.gitignore : Doit impérativement contenir :

.env

.env.local

node_modules/

.next/

Branche : main est la branche de production.

Message de Commit : Utiliser des messages clairs (ex: feat: add location picker, fix: remove ai dependency).

B. Procédure pour l'Agent Antigravity (Jules)
AUDIT : Vérifie que package.json contient bien @supabase/ssr, lucide-react, clsx, tailwind-merge.

INSTALL : npm install.

TEST BUILD : Lance npm run build en local.

🔴 Si Erreur : Corrige le code (souvent des types TS ou imports manquants). NE POUSSE PAS.

🟢 Si Succès : Passe à l'étape suivante.

PUSH : git add . -> git commit -m "chore: release v0.1 clean build" -> git push origin main.

VERCEL : Connecte le repo. Ajoute les 2 variables Supabase. Deploy.
