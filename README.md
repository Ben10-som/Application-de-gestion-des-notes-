# Application de Gestion des Notes 🎓

Bienvenue sur le dépôt de l'**Application de Gestion des Notes**. Ce projet a été conçu pour digitaliser et simplifier la gestion scolaire (étudiants, professeurs, notes, classes, et filières) au sein d'un établissement d'enseignement.

## 👥 Membres du Groupe
Ce projet a été réalisé avec passion et rigueur par :

- **Awa Diaw**
- **Alioune Abdou Salam Kane**
- **Soma Ben Idriss**
- **Samba Sow**
- **Paul Balafai**


---

## 🎯 Contexte et Objectifs du Projet
Dans la plupart des établissements, le suivi des notes, l'attribution des professeurs aux classes, et la gestion fluide des étudiants restent des tâches laborieuses, souvent gérées via des fichiers Excel éparpillés ou du format papier. 

Le but de cette application est de pallier ce problème grâce à une **plateforme centralisée, sécurisée, et ergonomique**. Elle offre trois environnements distincts (Dashboards) adaptés à chaque type d'utilisateur :

1. **Dashboard Administrateur :**
   - Création et gestion sans friction des entités principales : Filières, Classes, Étudiants et Professeurs.
   - Validation stricte des saisies : respect de formats d'identifiants uniques (matricules), gestion des doublons, et restriction lors de la suppression d'entités contenant des liaisons de dépendance pour préserver l'intégrité de la base de données.
   - Configuration transparente des identifiants (Login/Mot de passe) pour les étudiants et professeurs dès leur inscription.
   - Visualisation d'indicateurs de performance (Taux de réussite, moyennes globales, répartition des notes).

2. **Dashboard Professeur :**
   - Accès simplifié aux classes et matières attribuées.
   - Interface intuitive pour la saisie des notes des étudiants, avec des calculs automatisés de la moyenne et des statistiques immédiates par évaluation.

3. **Dashboard Étudiant :**
   - Espace personnel permettant à l'étudiant de consulter de façon sécurisée ses propres notes, ses performances par matière et de comparer sa progression vis-à-vis de sa classe.

---

## 🛠️ Stack Technologique (Logiciel & Langages)

Le projet adopte une architecture moderne "Modèle-Vue-Contrôleur" (MVC) séparant clairement le Backend (API) et le Frontend (Interface utilisateur).

### **Backend (Serveur / API RESTful) ⚙️**
- **Langage :** Python 3.x
- **Framework :** Flask
- **ORM (Object Relational Mapping) :** Flask-SQLAlchemy pour une interaction simplifiée et abstraite avec la BDD.
- **Sécurité :** Flask-JWT-Extended pour la gestion des sessions dynamiques par token, et Bcrypt pour le hachage sécurisé des mots de passe.
- **Base de données :** PostgreSQL. Puissante, relationnelle et scalable.

### **Frontend (Interface Utilisateur) 🎨**
- **Langage :** TypeScript (surcouche robuste à JavaScript).
- **Framework de rendu :** React 18, épaulé par ViteJS pour un démarrage de serveur et des compilations ultra-rapides.
- **Stylisation :** Tailwind CSS. Flexibilité maximale avec des composants graphiques au style impeccable et responsif.
- **Visualisation de données :** Recharts, pour des graphiques de statistiques (BarChart, PieChart) interactifs et modernes.
- **Composants d'interface :** Lucide-React pour une magnifique iconographie.

---

## 🚀 Guide d'Implémentation & Lancement (Environnement Local)

L'application est découpée en deux répertoires principaux : `backend/` et `frontend/`. 

### Étape 1 : Base de données (PostgreSQL)
1. Assurez-vous d'avoir installé et démarré **PostgreSQL**.
2. Créez une base de données locale (ex: `gestion_notes`).
3. Adaptez votre chaîne de connexion (URI) locale dans le projet, soit en modifiant le fichier `backend/config.py` ou `.env`. (Ex : `postgresql://user:password@localhost:5432/gestion_notes`).

### Étape 2 : Lancement du Backend (Python/Flask)
1. Ouvrez un terminal et naviguez dans le dossier `/backend`.
2. (Recommandé) Créez un environnement virtuel pour isoler les dépendances :
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Sur macOS/Linux
   # venv\Scripts\activate   # Sur Windows
   ```
3. Installez les paquets requis :
   ```bash
   pip install -r requirements.txt
   ```
4. Initialisez la base de données et appliquez les migrations en lançant simplement le projet pour que SQLAlchemy crée les tables automatiquement :
   ```bash
   python run.py
   ```
   > Le serveur devrait tourner sur **http://127.0.0.1:5000**.

### Étape 3 : Lancement du Frontend (React/Vite)
1. Ouvrez un **nouveau** terminal et naviguez dans le dossier `/frontend`.
2. Assurez-vous d'avoir **Node.js** d'installé. Installez les dépendances du projet :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
   > L'application est maintenant accessible via **http://localhost:5173** (port par défaut de Vite).

---

## 🔒 Notes de Sécurité et Bonnes Pratiques

- **Validation des Entrées :** Le backend et le frontend vérifient scrupuleusement le format des entrées telles que les matricules (format restrictif Ex: AB123) et les champs textes (Noms/Prénoms) pour éviter tout abus ou crash de la plateforme.
- **Dépendance des entités (Cascade Soft) :** L'administrateur est empêché de supprimer une filière ou classe non-vide (contenant des étudiants) afin de limiter les suppressions accidentelles et la corruption de la base de données logicielle.
- **Sécurité d'accès :** Aucun mot de passe n'est stocké en clair. Le panel admin gère la distribution des comptes de façon centralisée. Le hachage Bcrypt garantit la confidentialité totale.

---

*Développé avec ☕ et ❤️ dans le cadre de notre projet académique.*
