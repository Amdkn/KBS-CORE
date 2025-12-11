# 05_MPH5_BUSINESS_LOGIC.md

> **Status:** APPROVED (V0.1 Specs)
> **Context:** Data Flow, Routing Logic, and Business Rules
> **Critical:** This logic defines the "User Journey". Broken links or failed transaction states are unacceptable.

## 1. Tuyauterie des Liens (Routing Map)

L'application est un graphe interconnecté. Voici les règles de transition strictes que le routeur Next.js doit respecter.

### A. Flux Listing -> Détail -> Action
* **Source :** `ListingCard` (dans Home, Saved, ou Profile).
* **Action :** Click.
* **Destination :** `/items/[id]` (Page `ItemDetail`).
* **Antifragilité :** Si l'ID n'existe pas (supprimé), afficher une page 404 propre ("Oups, cet objet a déjà trouvé une nouvelle maison") avec un bouton "Retour au Hub".

### B. Flux Profils
* **Source :** Avatar ou Nom du vendeur dans `ItemDetail`.
* **Action :** Click.
* **Destination :**
    * Si `seller_id === auth.uid()` (C'est moi) -> Redirection vers `/profile` (Mon Dashboard privé).
    * Si `seller_id !== auth.uid()` (C'est un autre) -> Redirection vers `/profile/[id]` (Vue Publique : Listings actifs + Score).

### C. Flux Messagerie
* **Source :** Bouton "Messages" dans BottomNav.
* **Destination :** `/messages` (Liste des conversations).
* **Drill-down :** Click sur une conversation -> `/messages/[conversation_id]`.
* **Deep Link :** Click sur une Notification de message -> Ouvre directement `/messages/[conversation_id]`.

### D. Flux Notifications
* **Source :** `NotificationBell` (Header).
* **Action :** Click sur une notif dans le Popover.
* **Logique :**
    1.  Appel Supabase : `UPDATE notification SET is_read = true WHERE id = [notif_id]`.
    2.  Redirection : Utiliser le champ `link_url` de la notification (ex: `/items/123` ou `/messages/456`).

---

## 2. Logique Transactionnelle (V0.1 Mockée)

Pour la V0.1, nous ne connectons pas encore Stripe. Nous simulons l'acte d'achat pour valider l'intention et le flux de données.

### Le Bouton "Buy Now" (ou "Request")
* **Condition :** Visible uniquement si `listing.status === 'active'` et `seller_id !== auth.uid()`.
* **Action :**
    1.  **Création Transaction :**
        * `INSERT INTO transaction (buyer_id, listing_id, amount_cents, status)`
        * `VALUES (auth.uid(), [listing.id], [listing.price_cents], 'PENDING')`.
    2.  **Feedback UI :** Afficher un Toast "Order Placed! Check your messages.".
    3.  **Mise à jour Listing (Optionnel V0.1) :**
        * Idéalement : Passer le `listing.status` à `'sold'` ou `'pending'`.
        * *Note Antigravity :* Si trop complexe pour V0.1, laisser actif mais afficher "Pending" sur la carte.
    4.  **Notification Vendeur :**
        * Créer une notif pour le vendeur : "New order for [Item Title]!".

---

## 3. Logique Chat & "Idempotency"

Le système de chat est le cœur de la confiance. Il ne doit pas y avoir de doublons.

### A. Initialisation ("Contact Seller")
Quand un utilisateur clique sur "Contact" depuis une fiche produit :
1.  **Check (Idempotency) :**
    * Requête Supabase : "Existe-t-il déjà une `conversation` où `listing_id` est cet objet ET les participants sont Moi et le Vendeur ?"
2.  **Branching :**
    * **OUI (Trouvé) :** Récupérer l'ID et rediriger -> `router.push('/messages/[id]')`.
    * **NON (Nouveau) :**
        * `INSERT INTO conversation (participant1_id, participant2_id, listing_id)`...
        * Récupérer le nouvel ID.
        * Rediriger -> `router.push('/messages/[new_id]')`.

### B. Realtime Messaging (Le "Vivant")
Dans la page `/messages/[id]` :
1.  **Subscription :**
    * `supabase.channel('room:[id]')`
    * `.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'message', filter: 'conversation_id=eq.[id]' })`
2.  **Handler :**
    * Quand un nouveau message arrive (payload), l'ajouter au state local `messages[]`.
    * Scroll automatique vers le bas (`window.scrollTo`).
3.  **Sending :**
    * `INSERT INTO message ...`
    * **Simultanément :** `UPDATE conversation SET last_message = [content], last_message_at = now() WHERE id = [id]`. (Cela permet à la liste principale des messages de remonter cette conversation en haut).

---

## 4. Instructions pour l'Agent Antigravity (Implémentation)

1.  **Priorité Routage :** Vérifie que `next.config.js` ou le dossier `app/` gère bien les routes dynamiques (`[id]`).
2.  **Typage Strict :** Utilise les types définis dans `types/database.ts` pour les payloads des transactions et des messages. Ne pas "deviner" les champs.
3.  **Gestion d'Erreur :**
    * Si une insertion échoue (ex: RLS bloque), afficher un `toast.error("Action failed. Please try again.")`. Ne pas laisser l'utilisateur sans réponse.
    