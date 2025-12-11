# 01_MPH1_FOUNDATIONS_INFRA.md

> **Status:** APPROVED (Schema Locked for V0.1)
> **Context:** Database Schema, Security Policies, and Storage
> **Critical:** The Frontend `types/database.ts` MUST match this schema exactly.

## 1. Philosophie des Données : "Souveraineté & Typage Fort"

L'architecture de données de KBS repose sur **PostgreSQL** via Supabase.
Nous utilisons le typage fort (Enums) pour éviter les états invalides et les entiers (`cents`) pour la monnaie afin d'éviter les erreurs d'arrondi flottant.

---

## 2. Schéma de Base de Données (SQL Definition)

L'agent Antigravity doit vérifier que ces tables existent. Si elles manquent ou diffèrent, elles doivent être migrées vers cet état.

### A. Types & Enums (La Loi)
* `listing_type`: `'SALE'`, `'DONATION'`, `'TRADE'` (Attention: 'TRADE' a été ajouté en Itération 3B).
* `item_condition`: `'NEW'`, `'LIKE_NEW'`, `'GOOD'`, `'FAIR'`, `'POOR'`.
* `transaction_status`: `'PENDING'`, `'PAID'`, `'SHIPPED'`, `'DELIVERED'`, `'RELEASED'`, `'REFUNDED'`, `'DISPUTED'`.

### B. Tables Core

#### 1. `app_user` (Profils Publics)
Extension de la table système `auth.users`. Création gérée par Trigger SQL automatique à l'inscription.
* `id` (UUID, PK): FK vers `auth.users.id`.
* `email` (Text): Copie de lecture.
* `name` (Text): Nom d'affichage.
* `city` (Text): Ville (ex: Florence).
* `zip` (Text): Code postal.
* `avatar_url` (Text): URL Supabase Storage.
* `reputation_score` (Int): Score de confiance (Défaut: 0).
* `karma_points` (Int): Points gagnés par dons (Défaut: 0).

#### 2. `circle` (Hubs Locaux - Architecture Fractale)
* `id` (UUID, PK).
* `name` (Text): Ex: "Florence Hub (KY)".
* `zip_center` (Text): Centre géographique.
* `geo` (JSONB): Données géographiques optionnelles.

#### 3. `listing` (Le Produit)
* `id` (UUID, PK).
* `seller_id` (UUID): FK vers `app_user`.
* `circle_id` (UUID): FK vers `circle`.
* `type` (Enum `listing_type`): SALE, DONATION, ou TRADE.
* `title` (Text).
* `description` (Text).
* `category` (Text).
* `condition` (Enum `item_condition`).
* `price_cents` (Int): **Toujours en centimes** ($10.00 = 1000). 0 si DONATION.
* `status` (Text): 'active', 'sold', 'draft', 'blocked'.
* `has_recall_flag` (Boolean): Sécurité CPSC.

#### 4. `listing_media` (Photos)
* `id` (UUID, PK).
* `listing_id` (UUID): FK vers `listing`.
* `storage_path` (Text): Chemin relatif dans le bucket `listings`.

### C. Tables Flux & Social

#### 5. `transaction` (Commandes)
* `id` (UUID, PK).
* `buyer_id` (UUID): FK vers `app_user`.
* `listing_id` (UUID): FK vers `listing`.
* `amount_cents` (Int): Montant bloqué.
* `status` (Enum `transaction_status`).
* `escrow_id` (Text): ID Stripe (Future V0.2).
* `tracking_number` (Text): Suivi logistique.

#### 6. `conversation` & `message` (Chat)
* `conversation`: Liaison `participant1_id`, `participant2_id`, `listing_id`.
* `message`: `content`, `sender_id`, `is_read`.

#### 7. `notification` (Centre de notifs)
* `id` (UUID, PK).
* `user_id` (UUID).
* `type` (Text): 'MESSAGE', 'SYSTEM', 'OFFER'.
* `is_read` (Boolean).

#### 8. `story` (Community Hub)
* `id` (UUID, PK).
* `circle_id` (UUID).
* `media_url` (Text).
* `expires_at` (Timestamptz): Date d'expiration (24h).

---

## 3. Sécurité (RLS - Row Level Security)

**Politique : "Deny by Default".** Tout accès doit être explicitement autorisé.

| Table | Lecture (SELECT) | Écriture (INSERT/UPDATE/DELETE) |
| :--- | :--- | :--- |
| `app_user` | **Public** (Tous les users auth) | **Owner** (Id = auth.uid()) |
| `listing` | **Public** (Si status='active') | **Owner** (Seller_id = auth.uid()) |
| `listing_media`| **Public** (Si lié à un listing actif) | **Owner** (Via listing owner) |
| `transaction` | **Privé** (Buyer OU Seller uniquement) | **Buyer** (Création) / **System** (Update status) |
| `message` | **Privé** (Participants conversation) | **Sender** (Création) |
| `notification`| **Privé** (Owner uniquement) | **System** (Création) / **Owner** (Mark Read) |
| `story` | **Public** (Si expires_at > now()) | **Admin/Ambassadeur** (Pour V0.1) |

---

## 4. Storage Buckets (Object Storage)

Deux buckets publics doivent exister.

### 1. `avatars`
* **Access:** Public Read.
* **Policy:** Un utilisateur authentifié peut uploader un fichier. Il ne peut modifier/supprimer que ses propres fichiers.

### 2. `listings`
* **Access:** Public Read.
* **Policy:** Un utilisateur authentifié peut uploader. Idéalement, les noms de fichiers doivent être préfixés par l'`user_id` ou le `listing_id` pour l'organisation (géré par le Front).

---

## 5. Instructions pour l'Agent Antigravity
1.  **Vérifier le Schema :** Connecte-toi à Supabase et vérifie que toutes les tables ci-dessus existent.
2.  **Alignement Typescript :** Ouvre `types/database.ts` dans le Frontend. Ce fichier doit être le miroir exact de ce document.
    * *Exemple Critique :* Si le SQL dit `price_cents`, l'interface TS ne doit PAS dire `price`.
3.  **Seed Data :** Vérifie que les données de test (Alice, Bob, Florence Hub) sont présentes pour que le Frontend ne soit pas vide au déploiement.
