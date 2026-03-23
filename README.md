<h1 align="center">🎓 EduDash — Application de Gestion des Notes</h1>

<p align="center">
  <strong>Plateforme web complète de gestion scolaire : étudiants, professeurs, notes, classes et filières.</strong>
</p>

<p align="center">
  <a href="https://gradeshandler.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/🌐%20Live%20Demo-gradeshandler.vercel.app-4f46e5?style=for-the-badge" alt="Live Demo"/>
  </a>
  &nbsp;
  <img src="https://img.shields.io/badge/Backend-Flask%20%2B%20Python-blue?style=for-the-badge&logo=python" alt="Flask"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?style=for-the-badge&logo=react" alt="React"/>
  &nbsp;
  <img src="https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL"/>
</p>

---

## 🌐 Application en ligne

> 👉 **[https://gradeshandler.vercel.app/](https://gradeshandler.vercel.app/)**

L'application est déployée et accessible en ligne. Le frontend est hébergé sur **Vercel**.

---

## 📋 Table des Matières

1. [Présentation du Projet](#-présentation-du-projet)
2. [Membres de l'équipe](#-membres-de-léquipe)
3. [Fonctionnalités](#-fonctionnalités)
4. [Architecture du Projet](#-architecture-du-projet)
5. [Stack Technique](#-stack-technique)
6. [Modèle de Données (MCD)](#-modèle-de-données-mcd)
7. [Prérequis](#-prérequis)
8. [Installation & Lancement Local](#-installation--lancement-local)
9. [Lancement via Docker](#-lancement-via-docker)
10. [Variables d'Environnement](#-variables-denvironnement)
11. [Routes de l'API](#-routes-de-lapi)
12. [Sécurité](#-sécurité)

---

## 🎯 Présentation du Projet

Dans la plupart des établissements scolaires, la gestion des notes, des professeurs et des étudiants reste un processus manuel et fragmenté — fichiers Excel éparpillés, bulletins papier, aucune centralisation.

**EduDash** résout ce problème en proposant une **plateforme web centralisée, sécurisée et ergonomique** avec trois interfaces adaptées à chaque rôle :

| Rôle | Accès & Capacités |
|---|---|
| 👑 **Admin** | Gestion complète : filières, classes, étudiants, professeurs, attributions |
| 👨‍🏫 **Professeur** | Consultation de ses classes et saisie des notes |
| 🎓 **Étudiant** | Consultation de ses propres notes, moyennes et statistiques |

---

## 👥 Membres de l'Équipe

Ce projet a été réalisé en collaboration par :

| Nom | Rôle |
|---|---|
| **Alioune Abdou Salam Kane** | Développeur Full-Stack |
| **Soma Ben Idriss** | Développeur Full-Stack |
| **Paul Balafai** | Développeur Full-Stack |
| **Awa Diaw** | Développeur Full-Stack |
| **Samba Sow** | Développeur Full-Stack |

---

## ✨ Fonctionnalités

### 👑 Dashboard Administrateur
- ✅ Création / modification / suppression de **filières, classes, étudiants, professeurs**
- ✅ Attribution de matières à un professeur pour une classe donnée (**gestion des enseignements**)
- ✅ Création des comptes (login + mot de passe) pour les étudiants et professeurs
- ✅ Validation stricte : formats de matricule (`AB123`), détection des doublons
- ✅ Visualisation des statistiques globales : taux de réussite, moyennes, répartition des notes
- ✅ Protection contre les suppressions en cascade (impossible de supprimer une classe non vide)

### 👨‍🏫 Dashboard Professeur
- ✅ Accès aux classes et matières qui lui sont attribuées
- ✅ Saisie intuitive des notes par étudiant
- ✅ Calcul automatique des moyennes et statistiques par évaluation

### 🎓 Dashboard Étudiant
- ✅ Consultation sécurisée de ses propres notes et moyennes
- ✅ Vue par matière avec coefficients
- ✅ Comparaison vis-à-vis de la classe

### 🔐 Authentification & Sécurité
- ✅ Authentification par **JWT** (JSON Web Tokens)
- ✅ Mots de passe hashés via **Bcrypt**
- ✅ Séparation stricte des accès par rôle (Admin / Professeur / Étudiant)

### 📄 Export PDF
- ✅ Génération de bulletins de notes en PDF via **ReportLab**

---

## 🗂️ Architecture du Projet

```
Application-de-gestion-des-notes-/
│
├── 📁 backend/                     # API RESTful Flask (Python)
│   ├── 📁 app/
│   │   ├── __init__.py             # Factory Flask, CORS, JWT, extensions
│   │   ├── models.py               # Modèles SQLAlchemy (toutes les tables)
│   │   └── 📁 routes/              # Blueprints (endpoints de l'API)
│   │       ├── auth.py             # /api/auth — Login, profil utilisateur
│   │       ├── etudiants.py        # /api — CRUD complet (étudiants, profs, classes...)
│   │       ├── notes.py            # /api/notes — Gestion des notes
│   │       └── stats.py            # /api/stats — Statistiques globales
│   │   └── 📁 utils/
│   │       └── pdf_generator.py    # Génération de bulletins PDF
│   │
│   ├── config.py                   # Configuration (BDD, clés secrètes via .env)
│   ├── run.py                      # Point d'entrée de l'application
│   ├── seed_db.py                  # Script de données de test (seed)
│   ├── requirements.txt            # Dépendances Python
│   ├── Dockerfile                  # Image Docker du backend
│   └── .env                        # Variables d'environnement (non versionné)
│
├── 📁 frontend/                    # Interface React + TypeScript (Vite)
│   ├── 📁 src/
│   │   ├── App.tsx                 # Routage principal (Login → Dashboard selon rôle)
│   │   ├── api.ts                  # Configuration Axios (baseURL de l'API)
│   │   ├── main.tsx                # Point d'entrée React
│   │   └── 📁 components/
│   │       ├── Login.tsx           # Page de connexion
│   │       ├── AdminDashboard.tsx  # Interface complète de l'administrateur
│   │       ├── ProfessorDashboard.tsx # Interface du professeur
│   │       ├── StudentDashboard.tsx   # Interface de l'étudiant
│   │       └── PixelPattern.tsx    # Composant d'arrière-plan décoratif
│   │
│   ├── package.json                # Dépendances Node.js
│   ├── vite.config.ts              # Configuration Vite
│   ├── tsconfig.json               # Configuration TypeScript
│   └── .env.example                # Exemple de variables d'environnement
│
├── docker-compose.yml              # Orchestration Docker (BDD + Backend)
├── MCD.md                          # Modèle Conceptuel de Données (diagramme)
├── RAPPORT_PROJET_EDUDASH.md       # Rapport complet du projet
└── README.md                       # Ce fichier
```

---

## 🛠️ Stack Technique

### Backend ⚙️
| Technologie | Rôle |
|---|---|
| **Python 3.x** | Langage principal |
| **Flask** | Framework web lightweight |
| **Flask-SQLAlchemy** | ORM — interaction avec la base de données |
| **Flask-JWT-Extended** | Authentification par token JWT |
| **Bcrypt** | Hachage sécurisé des mots de passe |
| **Flask-Migrate** | Migrations de base de données |
| **Flask-CORS** | Gestion des CORS (communication Frontend ↔ Backend) |
| **PostgreSQL** | Base de données relationnelle |
| **Gunicorn** | Serveur WSGI pour la production |
| **ReportLab / WeasyPrint** | Génération de PDFs |
| **python-dotenv** | Chargement des variables d'environnement |

### Frontend 🎨
| Technologie | Rôle |
|---|---|
| **React 19** | Framework UI |
| **TypeScript** | Typage statique |
| **Vite** | Bundler ultra-rapide |
| **Tailwind CSS v4** | Stylisation utilitaire |
| **Axios** | Appels HTTP à l'API |
| **Recharts** | Graphiques (BarChart, PieChart) |
| **Lucide React** | Bibliothèque d'icônes |
| **Motion** | Animations fluides |

### Déploiement 🚀
| Service | Usage |
|---|---|
| **Vercel** | Hébergement du Frontend |
| **Docker + Docker Compose** | Conteneurisation du Backend + PostgreSQL |

---

## 📐 Modèle de Données (MCD)

Voici les entités principales et leurs relations :

```
UTILISATEUR (id_user, username, nom, prenom, mot_de_passe, role)
    │
    ├──► ADMIN (id_admin)
    ├──► PROFESSEUR (id_professeur, specialite)
    └──► ETUDIANT (id_etudiant, matricule, classe_id)
              │
              └──► NOTE (id_note, valeur_note, date_saisie)
                         │
                         └──► ENSEIGNEMENT (professeur + classe + matiere)

FILIERE (id_filiere, nom_filiere)
    └──► CLASSE (id_classe, nom_classe)
              └──► ETUDIANT

MATIERE (id_matiere, nom_matiere, coef)
    └──► ENSEIGNEMENT
```

> 📖 Voir le fichier [MCD.md](./MCD.md) pour le schéma entité-association complet.

---

## 📦 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Python 3.10+** → [python.org](https://www.python.org/downloads/)
- **Node.js 18+** → [nodejs.org](https://nodejs.org/)
- **PostgreSQL 14+** → [postgresql.org](https://www.postgresql.org/download/)
- *(Optionnel)* **Docker & Docker Compose** → [docker.com](https://www.docker.com/)

---

## 🚀 Installation & Lancement Local

### 1️⃣ Cloner le dépôt

```bash
git clone https://github.com/Ben10-som/Application-de-gestion-des-notes-.git
cd Application-de-gestion-des-notes-
```

---

### 2️⃣ Configurer & Lancer le Backend

#### a) Créer la base de données PostgreSQL

```bash
# Se connecter à PostgreSQL
psql -U postgres

# Créer la base de données
CREATE DATABASE gestion_notes;
\q
```

#### b) Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env  # ou créer le fichier .env manuellement
```

Éditer `backend/.env` :

```env
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/gestion_notes
SECRET_KEY=une_cle_secrete_tres_longue_et_aleatoire
JWT_SECRET_KEY=une_autre_cle_jwt_tres_secrete
```

#### c) Créer l'environnement virtuel et installer les dépendances

```bash
# Depuis le dossier backend/
python3 -m venv venv

# Activer l'environnement virtuel
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate          # Windows

# Installer les dépendances
pip install -r requirements.txt
```

#### d) Lancer le serveur Flask

```bash
python run.py
```

> ✅ L'API tourne sur **http://127.0.0.1:5000**

#### e) (Optionnel) Peupler la base avec des données de test

```bash
python seed_db.py
```

---

### 3️⃣ Configurer & Lancer le Frontend

```bash
# Depuis la racine du projet
cd frontend

# Installer les dépendances Node.js
npm install

# Lancer le serveur de développement
npm run dev
```

> ✅ L'application est accessible sur **http://localhost:3000**

---

### 🔗 Lier le Frontend au Backend

Vérifier le fichier `frontend/src/api.ts` :

```typescript
// L'URL de base de l'API
const BASE_URL = "http://127.0.0.1:5000"; // En local
```

Pour pointer vers une API distante, modifier `BASE_URL` en conséquence.

---

## 🐳 Lancement via Docker

Si vous avez Docker installé, vous pouvez lancer le backend et la base de données en une seule commande :

```bash
# Depuis la racine du projet
# Créer un fichier .env à la racine (copier depuis backend/.env)

docker-compose up --build
```

Cela démarre :
- 🗄️ **PostgreSQL** sur le port `5433`
- ⚙️ **Backend Flask** sur le port `5001`

> ⚠️ Le frontend doit toujours être lancé séparément avec `npm run dev`.

---

## 🔑 Variables d'Environnement

### `backend/.env`

| Variable | Description | Exemple |
|---|---|---|
| `DATABASE_URL` | URI de connexion PostgreSQL | `postgresql://postgres:pass@localhost:5432/gestion_notes` |
| `SECRET_KEY` | Clé secrète Flask | `ma_cle_super_secrete_123` |
| `JWT_SECRET_KEY` | Clé pour signer les tokens JWT | `ma_cle_jwt_secrete_456` |

---

## 📡 Routes de l'API

### Authentification — `/api/auth`

| Méthode | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/login` | Connexion utilisateur | ❌ |
| `GET` | `/api/auth/me` | Profil de l'utilisateur connecté | ✅ JWT |

### Étudiants & Entités — `/api`

| Méthode | Endpoint | Description | Rôle |
|---|---|---|---|
| `GET` | `/api/etudiants` | Liste des étudiants | Admin |
| `POST` | `/api/etudiants` | Créer un étudiant | Admin |
| `PUT` | `/api/etudiants/<id>` | Modifier un étudiant | Admin |
| `DELETE` | `/api/etudiants/<id>` | Supprimer un étudiant | Admin |
| `GET` | `/api/professeurs` | Liste des professeurs | Admin |
| `POST` | `/api/professeurs` | Créer un professeur | Admin |
| `GET` | `/api/filieres` | Liste des filières | Admin |
| `POST` | `/api/filieres` | Créer une filière | Admin |
| `GET` | `/api/classes` | Liste des classes | Admin/Prof |
| `POST` | `/api/classes` | Créer une classe | Admin |
| `GET` | `/api/matieres` | Liste des matières | Tous |
| `GET` | `/api/enseignements` | Liste des enseignements | Admin/Prof |
| `POST` | `/api/enseignements` | Attribuer un prof à une classe | Admin |

### Notes — `/api/notes`

| Méthode | Endpoint | Description | Rôle |
|---|---|---|---|
| `GET` | `/api/notes` | Notes d'un étudiant | Étudiant/Prof |
| `POST` | `/api/notes` | Saisir une note | Professeur |
| `PUT` | `/api/notes/<id>` | Modifier une note | Professeur |
| `DELETE` | `/api/notes/<id>` | Supprimer une note | Admin/Prof |

### Statistiques — `/api/stats`

| Méthode | Endpoint | Description | Rôle |
|---|---|---|---|
| `GET` | `/api/stats/global` | Statistiques globales | Admin |
| `GET` | `/api/stats/classe/<id>` | Stats par classe | Admin/Prof |

---

## 🔒 Sécurité

- 🔐 **JWT** : Chaque requête aux routes protégées nécessite un token valide dans le header `Authorization: Bearer <token>`.
- 🔑 **Bcrypt** : Aucun mot de passe n'est stocké en clair — everything est haché avec un salt aléatoire.
- 🛡️ **RBAC** (Role-Based Access Control) : Chaque route vérifie le rôle de l'utilisateur. Un étudiant ne peut pas accéder aux données d'un autre étudiant.
- ⚠️ **Intégrité des données** : Suppression protégée — impossible de supprimer une entité référencée par d'autres (classes non vides, enseignements actifs, etc.).
- ✅ **Validation des entrées** : Le format des matricules (ex: `AD001`), les noms, et tous les champs critiques sont validés côté backend.

---

## 📄 Documentation Complémentaire

- 📐 [MCD.md](./MCD.md) — Modèle Conceptuel de Données avec toutes les entités et relations
- 📋 [RAPPORT_PROJET_EDUDASH.md](./RAPPORT_PROJET_EDUDASH.md) — Rapport technique complet du projet

---

<p align="center">
  Développé avec ☕ et ❤️ dans le cadre d'un projet académique
  <br/>
  <strong>Awa Diaw · Alioune Abdou Salam Kane · Soma Ben Idriss · Paul Balafai · Samba Sow</strong>
</p>
