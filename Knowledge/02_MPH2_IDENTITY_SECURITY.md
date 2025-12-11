# 02_MPH2_IDENTITY_SECURITY.md

> **Status:** APPROVED (V0.1 Specs)
> **Context:** Authentication, User Profiles, and Safety Logic
> **Critical:** Security must be handled server-side via RLS (see MPH1), but UI must handle Auth states gracefully.

## 1. Authentication Flow : "Grand Slam Onboarding"

L'authentification n'est pas une barrière administrative, c'est le début de l'offre.

### A. Landing Page (`/auth`)
Cette page sert de portail unique (Login + Signup). Elle doit appliquer les principes de psychologie de vente d'Alex Hormozi.

* **Copywriting (Promesse & Preuve) :**
    * *Headline :* "Turn Clutter into Cash & Good Karma." (Résultat de rêve).
    * *Sub-headline :* "List in 60s. Verified Locals Only." (Délai court / Probabilité de succès).
    * *Value Stack :* 1. Vendre (Cash/Escrow) 2. Acheter (Sécurité) 3. Donner (Karma).
* **Composant `AuthForm.tsx` :**
    * Toggle simple : "Sign In" / "Sign Up".
    * Champs Signup : Email, Password, Full Name.
    * Champs Login : Email, Password.
    * **Action :** Appels directs à `supabase.auth`.

### B. Gestion de Session & Redirections
L'agent Antigravity doit s'assurer que le routage est "étanche".

* **Middleware / Protection :**
    * Si un utilisateur non-connecté tente d'accéder à `/sell`, `/messages`, `/saved` ou `/profile` -> **Redirection immédiate vers `/auth`**.
    * Seule la Home (`/`) et les Détails d'items (`/items/[id]`) sont visibles en mode "Invité".
* **Post-Login :**
    * Succès -> `router.push('/')`.
* **Logout :**
    * Action -> `supabase.auth.signOut()`.
    * Redirection -> `router.push('/auth')`.
* **Trigger Inscription :**
    * Rappel critique : Le trigger SQL `handle_new_user` (défini dans MPH1) s'occupe de créer la ligne dans `public.app_user`. Le Frontend ne doit PAS créer cette ligne manuellement, il doit juste attendre qu'elle existe.

---

## 2. Profil Utilisateur (`/profile`)

Le profil est le tableau de bord de la réputation.

### A. Vue Lecture (Dashboard)
* **Header :**
    * Avatar (Rond, Large). Source: `app_user.avatar_url`. Fallback: Initiale ou image par défaut.
    * Nom & Localisation (`city`, `zip`).
    * **Trust Signals :**
        * Reputation Score (Étoile + Note).
        * Karma Points (Badge spécial pour les donateurs).
* **Onglets / Sections :**
    * *My Listings :* Grille des objets vendus par l'utilisateur (`seller_id = auth.uid()`).
    * *Menu :* Liste de boutons (Edit, Settings, Help, Logout).

### B. Vue Édition (`/profile/edit`)
* **Composant `AvatarUpload.tsx` :**
    * Doit gérer l'upload vers le bucket `avatars`.
    * *Flow :* Select File -> Upload to Supabase -> Get Public URL -> Update `app_user` table.
    * *UX :* Feedback visuel immédiat (Spinner pendant l'upload).
* **Formulaire :**
    * Modification de : Name, City, Zip.
    * Le bouton "Save" déclenche un `UPDATE` sur la table `app_user`.

### C. Pages Annexes (V0.1 Scope)
* **Settings (`/settings`) :**
    * Interface UI uniquement (Mock). Affiche des Toggles ("Notifications", "Dark Mode") qui peuvent changer un état local React, mais sans persistance Back-end complexe pour l'instant.
    * Zone "Danger" : Bouton "Delete Account" (Doit demander confirmation, mais l'action réelle peut être mockée pour éviter les accidents en phase de test).
* **Support (`/support`) :**
    * FAQ statique (Hardcoded). Questions clés : "Comment fonctionne le paiement ?", "C'est quoi le Karma ?", "Sécurité".

---

## 3. Trust & Safety (Logique Code)

Même en l'absence d'IA active, la structure du code doit être défensive ("Antifragile").

### A. CPSC Guard (Structure Passive)
Bien que l'IA de modération soit désactivée (Clean Build), la logique de blocage doit exister dans le code.

* **Champs DB :** `listing.has_recall_flag` (Boolean).
* **Logique Frontend (Listing Card & Detail) :**
    * `IF listing.has_recall_flag === true` -> Ne pas afficher l'objet, ou afficher un overlay "ITEM BLOCKED - SAFETY RISK".
    * *Note:* Pour la V0.1 Manuelle, ce flag sera `false` par défaut à la création. Mais si un Admin le change en DB, l'interface doit réagir.

### B. Input Sanitization
* Les champs textes (Titre, Description, Messages) sont des vecteurs d'attaque XSS.
* **Règle :** React échappe le HTML par défaut. Ne JAMAIS utiliser `dangerouslySetInnerHTML` pour du contenu utilisateur.
* **Validation Zod :** Si possible, utiliser Zod pour valider les formulaires avant l'envoi (ex: Titre min 3 chars, Prix >= 0).

### C. Protection des Données (Privacy)
* Les adresses email et téléphones ne doivent **jamais** être exposés publiquement via l'API.
* Le composant "Profil Public" (vu par les autres) ne doit afficher que : Nom, Avatar, Ville (Pas d'adresse précise), Score.
* La RLS (Row Level Security) configurée en MPH1 est le garant final de cette règle.