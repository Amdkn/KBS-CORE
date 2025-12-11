# 03_MPH3_MODULAR_WIRING.md

> **Status:** APPROVED (V0.1 Specs)
> **Context:** Frontend Routing, Component Logic, and UX Patterns
> **Critical:** Mobile-First is not an option, it's a constraint. Always check for `pb-24` on main layouts.

## 1. Navigation & Layout (Mobile First)

L'application doit être utilisable d'une seule main (pouce).

### A. Bottom Navigation (`components/BottomNav.tsx`)
* **Position :** `fixed bottom-0 w-full z-50`.
* **Style :** Background White, Border Top (Gray-200), Safe Area padding pour iOS.
* **Items (5) :**
  1.  **Home** (`/`) - Icon: `Home`
  2.  **Saved** (`/saved`) - Icon: `Heart`
  3.  **Sell** (`/sell`) - Icon: `PlusCircle` (Gros bouton central, Vert #4ADE80, flottant ou proéminent).
  4.  **Messages** (`/messages`) - Icon: `MessageSquare` (Avec Badge rouge si non-lus).
  5.  **Profile** (`/profile`) - Icon: `User`.
* **Règle Layout Critique :** Le composant parent (Layout) doit appliquer un `padding-bottom` (ex: `pb-24`) au contenu principal pour éviter que le dernier élément de la liste ne soit caché derrière la barre de navigation.

### B. Location Picker (Architecture Fractale)
Situé dans le Header de la Home Page. C'est le sélecteur de "Monde".

* **Composant :** `components/LocationPicker.tsx`.
* **Logique de Persistance :**
  * À l'ouverture de l'app : Lire `localStorage.getItem('kbs_preferred_circle')`.
  * Si null : Sélectionner le premier Cercle disponible (ex: Florence Hub) ou demander à l'utilisateur.
  * Au changement : `localStorage.setItem(...)` + Rafraîchir le contexte React (State Global ou Context API).
* **Impact :** Ce choix filtre TOUTES les requêtes de la Home (Listings + Stories).

---

## 2. Pages Clés & Logique

### A. Home (`/`) - Le Tableau de Bord
* **Header :** LocationPicker (Gauche) + NotificationBell (Droite).
* **Search Bar :** Input text avec Debounce (300ms).
* **StoriesTray (`components/StoriesTray.tsx`) :**
  * Scroll horizontal.
  * Query : `story` table `.eq('circle_id', currentCircle)`.
  * UI : Cercles avec bordure verte (si non vu) ou grise (si vu).
* **Smart Filters (Chips) :**
  * Scroll horizontal : [All] [For Sale] [Trade] [Donation].
  * *Comportement :* Cliquer sur "Donation" ajoute `.eq('type', 'DONATION')` à la requête Supabase du Feed.
* **Main Feed :**
  * Grille Responsive (1 col mobile, 2/3 cols tablette).
  * Infinite Scroll ou Pagination simple ("Load More").
  * **Empty State :** Si le cercle est vide -> "Soyez le premier à publier dans [Nom du Cercle] !".

### B. Sell (`/sell`) - The Cockpit (V0.1 Manual Mode)
* **Tabs (Segmented Control) :**
  * [Sell] (Vert) | [Trade] (Bleu) | [Donate] (Violet).
  * *Impact :*
    * Si Donate : `price` forcé à 0, Label bouton devient "Donate Now".
    * Si Sell : Input Prix visible.
* **Upload (`components/ImageGridUpload.tsx`) :**
  * Grid 3x3. Bouton "+" appelle l'input file.
  * Upload direct vers bucket `listings`.
  * Feedback : Spinner sur la case pendant l'upload.
* **Formulaire Manuel :**
  * Titre, Catégorie, État, Description.
* **Boutons Actions (Footer) :**
  * **V0.1 Clean Build :** Le bouton "✨ Enhance with AI" est soit caché, soit désactivé (grisé).
  * Bouton Principal : "Post Listing" (Insert dans `listing`).

### C. Details (`/items/[id]`)
* **Hero :** Carousel d'images (Swipeable sur mobile).
* **Info Block :**
  * Titre (Gras, Large).
  * **Prix :**
    * Si Type SALE : `$45.00`.
    * Si Type DONATION : Badge Violet "FREE / DONATION".
    * Si Type TRADE : Badge Bleu "TRADE / ÉCHANGE".
* **Seller Block :** Mini profil (Avatar + Nom + Score + Lien vers `/profile/[id]`).
* **Actions (Sticky Bottom) :**
  * Si SALE : Bouton Vert "Buy Now" (Créer Transaction PENDING).
  * Si DONATION : Bouton Violet "Request Item" (Ouvrir Chat).
  * Si TRADE : Bouton Bleu "Propose Trade" (Ouvrir Chat).

---

## 3. Composants Réutilisables (Atomic Design)

### A. `ListingCard.tsx`
L'atome de l'interface.
* **Image :** `Next/Image` avec `object-cover`. Ratio 1:1 ou 4:3.
* **Badges :** Overlay sur l'image pour "DONATION" ou "TRADE".
* **Footer Card :** Prix (Gras) + Titre (Truncated) + Distance (si géo dispo, sinon Ville).

### B. `AvatarUpload.tsx`
* **Props :** `currentUrl`, `onUpload(url: string)`.
* **Logic :** Gère la complexité de l'upload Supabase (Blob, Extention, Path unique).
* **UI :** Rond. Si pas d'image, afficher les initiales.

### C. `NotificationBell.tsx`
* **Logique Temps Réel :**
  * `supabase.channel('public:notification')`
  * `.on('postgres_changes', { event: 'INSERT', filter: 'user_id=eq.MY_ID' })`
  * Incrémenter un compteur local (Badge Rouge).
* **Interaction :** Au clic, ouvrir un Popover avec les dernières notifs.

---

## 4. UX Patterns "Antifragiles"

* **Loading States (Skeletons) :** Ne jamais afficher une page blanche. Utiliser des rectangles gris pulsants (Skeletons) pendant le chargement des données Supabase.
* **Error Boundaries :** Si une image ne charge pas, afficher un placeholder "Image broken" (gris neutre avec icône image) plutôt que de casser le layout.
* **Optimistic UI :** Dans le Chat, afficher le message envoyé *immédiatement* dans la liste, même si Supabase n'a pas encore confirmé l'écriture (revenir en arrière ou afficher erreur rouge si échec).
