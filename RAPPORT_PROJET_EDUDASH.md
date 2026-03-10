# Rapport Complet du Projet - Application de Gestion des Notes (EduDash)

**Date du rapport:** Mars 2026  
**Projet:** Application de Gestion des Notes - EduDash  
**Équipe:** Awa Diaw, Alioune Abdou Salam Kane, Soma Ben Idriss, Samba Sow, Paul Balafai  
**Cours:** Base de Données - Projet Académique

---

> **Note pour le professeur:** Ce rapport met l'accent sur la partie base de données du projet, la modélisation des données avec SQLAlchemy, et l'utilisation de Docker pour SQL Server. Les captures d'écran devront être ajoutées aux emplacements indiqués par les balises `[📷 Image]`.

---

## Table des Matières

1. [Introduction et Contexte](#1-introduction-et-contexte)
2. [Analyse du MCD (Modèle Conceptuel de Données)](#2-analyse-du-mcd)
3. [Architecture Base de Données et Modélisation](#3-architecture-base-de-données-et-modélisation)
4. [Implémentation avec SQLAlchemy (Flask)](#4-implémentation-avec-sqlalchemy-flask)
5. [Docker et SQL Server](#5-docker-et-sql-server)
6. [Backend Flask - API RESTful](#6-backend-flask---api-restful)
7. [Analyse du Frontend](#7-analyse-du-frontend)
8. [API et Points de Terminaison](#8-api-et-points-de-terminaison)
9. [Fonctionnalités par Rôle](#9-fonctionnalités-par-rôle)
10. [Sécurité et Authentification](#10-sécurité-et-authentification)
11. [Données de Test et Initialisation](#11-données-de-test-et-initialisation)
12. [Technologies Utilisées](#12-technologies-utilisées)
13. [Conclusion et Perspectives](#13-conclusion-et-perspectives)

---

## 1. Introduction et Contexte

### 1.1 Objectif du Projet

L'**Application de Gestion des Notes (EduDash)** est une plateforme centralisée, sécurisée et ergonomique conçue pour digitaliser et simplifier la gestion scolaire au sein d'un établissement d'enseignement. Ce projet a été développé dans le cadre d'un cours de **Base de Données** et met l'accent sur la modélisation des données, l'utilisation d'un SGBDR (SQL Server via Docker), et la création d'une API RESTful avec Flask.

### 1.2 Problématique

Dans la plupart des établissements, le suivi des notes, l'attribution des professeurs aux classes, et la gestion fluide des étudiants restent des tâches laborieuses, souvent gérées via des fichiers Excel éparpillés ou du format papier. Cette situation entraîne :
- Des risques d'erreurs de saisie
- Des pertes de données
- Un manque de traçabilité
- Des difficultés pour générer des statistiques

### 1.3 Solutions Proposées

L'application offre trois environnements distincts (Dashboards) adaptés à chaque type d'utilisateur :
- **Dashboard Administrateur** : Gestion centralisée de toutes les entités
- **Dashboard Professeur** : Saisie des notes et suivi des performances
- **Dashboard Étudiant** : Consultation personnelle des notes et performances

**[📷 Image à insérer ici]: Capture d'écran de la page de connexion (Login)**

---

## 2. Analyse du MCD (Modèle Conceptuel de Données)

### 2.1 Entités et Associations

Le MCD a été conçu pour répondre aux besoins fonctionnel de l'application. Voici les principales entités identifiées :

| Entité | Description | Attributs clés |
|--------|-------------|----------------|
| **UTILISATEUR** | Table centrale des utilisateurs | id_user, username, nom, prenom, mot_de_passe, role |
| **FILIÈRE** | Domaine d'études | id_filiere, nom_filiere |
| **CLASSE** | Groupe d'étudiants | id_classe, nom_classe, filiere_id |
| **ÉTUDIANT** | Apprenant | id_etudiant, matricule, utilisateur_id, classe_id |
| **PROFESSEUR** | Enseignant | id_professeur, specialite, utilisateur_id |
| **MATIÈRE** | Discipline enseignée | id_matiere, nom_matiere, coef |
| **ENSEIGNEMENT** | Association ternaire (Prof-Classe-Matière) | id_enseignment, prof_id, classe_id, matiere_id |
| **NOTE** | Évaluation d'un étudiant | id_note, valeur_note, date_saisie, etudiant_id, enseignement_id |

### 2.2 Cardinalités

```
FILIÈRE ──────< CLASSE
    1              N

CLASSE ──────< ÉTUDIANT
    1              N

CLASSE ──────< ENSEIGNEMENT
    1              N

PROFESSEUR ──────< ENSEIGNEMENT
    1              N

MATIÈRE ──────< ENSEIGNEMENT
    1              N

ENSEIGNEMENT ──────< NOTE
    1              N

ÉTUDIANT ──────< NOTE
    1              N
```

### 2.3 Diagramme MCD

**[📷 Image à insérer ici]: Schéma du MCD (Modèle Conceptuel de Données)**

Le diagramme MCD a été réalisé selon la méthode Merise, avec :
- Identification des entités fortes
- Définition des relations ternaires (notamment pour l'Enseignement)
- Normalisation jusqu'à la forme normale 3 (3NF)

---

## 3. Architecture Base de Données et Modélisation

### 3.1 Choix Technologiques

| Composant | Technologie | Justification |
|-----------|-------------|---------------|
| **SGBDR** | SQL Server (via Docker) | Requirement du projet académique |
| **ORM** | SQLAlchemy | Abstraction Python pour la base de données |
| **Framework** | Flask | Lightweight et intégration native avec SQLAlchemy |
| **Conteneurisation** | Docker | Portabilité et facilité de déploiement |

### 3.2 Modèle Logique de Données (MLD)

```sql
-- Table des utilisateurs (hérite des rôles)
UTILISATEUR (
    id_user INT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL
    -- role: 'Admin', 'Professeur', 'Etudiant'
)

FILIÈRE (
    id_filiere INT PRIMARY KEY,
    nom_filiere VARCHAR(100) NOT NULL
)

CLASSE (
    id_classe INT PRIMARY KEY,
    nom_classe VARCHAR(100) NOT NULL,
    filiere_id_filiere INT FOREIGN KEY REFERENCES FILIÈRE(id_filiere)
)

MATIÈRE (
    id_matiere INT PRIMARY KEY,
    nom_matiere VARCHAR(100) NOT NULL,
    coef INT DEFAULT 1
)

PROFESSEUR (
    id_professeur INT PRIMARY KEY,
    specialite VARCHAR(100),
    utilisateur_id_user INT FOREIGN KEY REFERENCES UTILISATEUR(id_user)
)

ÉTUDIANT (
    id_etudiant INT PRIMARY KEY,
    matricule VARCHAR(50) UNIQUE NOT NULL,
    classe_id_classe INT FOREIGN KEY REFERENCES CLASSE(id_classe),
    utilisateur_id_user INT FOREIGN KEY REFERENCES UTILISATEUR(id_user)
)

ENSEIGNEMENT (
    id_enseignment INT PRIMARY KEY,
    professeur_id_professeur INT FOREIGN KEY REFERENCES PROFESSEUR(id_professeur),
    classe_id_classe INT FOREIGN KEY REFERENCES CLASSE(id_classe),
    matiere_id_matiere INT FOREIGN KEY REFERENCES MATIÈRE(id_matiere)
)

NOTE (
    id_note INT PRIMARY KEY,
    valeur_note FLOAT NOT NULL,
    date_saisie DATETIME DEFAULT CURRENT_TIMESTAMP,
    etudiant_id_etudiant INT FOREIGN KEY REFERENCES ÉTUDIANT(id_etudiant),
    enseignement_id_enseignment INT FOREIGN KEY REFERENCES ENSEIGNEMENT(id_enseignment)
)

ADMIN (
    id_admin INT PRIMARY KEY,
    utilisateur_id_user INT FOREIGN KEY REFERENCES UTILISATEUR(id_user)
)
```

### 3.3 Diagramme de Classes SQLAlchemy

**[📷 Image à insérer ici]: Schéma des relations SQLAlchemy (backend/app/models.py)**

### 3.4 Index et Contraintes

```sql
-- Index pour optimiser les recherches
CREATE INDEX idx_etudiant_classe ON ÉTUDIANT(classe_id_classe);
CREATE INDEX idx_note_etudiant ON NOTE(etudiant_id_etudiant);
CREATE INDEX idx_note_enseignment ON NOTE(enseignment_id_enseignment);
CREATE INDEX idx_enseignment_professeur ON ENSEIGNEMENT(professeur_id_professeur);
CREATE INDEX idx_enseignment_classe ON ENSEIGNEMENT(classe_id_classe);

-- Contraintes de validation
ALTER TABLE NOTE ADD CONSTRAINT chk_note CHECK (valeur_note >= 0 AND valeur_note <= 20);
ALTER TABLE MATIÈRE ADD CONSTRAINT chk_coef CHECK (coef >= 1);
```

---

## 4. Implémentation avec SQLAlchemy (Flask)

### 4.1 Configuration de SQLAlchemy

Le fichier [`backend/app/__init__.py`](backend/app/__init__.py) initialise SQLAlchemy avec Flask :

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    # Configuration de la base de données
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialisation de SQLAlchemy
    db.init_app(app)
    
    # Import des modèles (crée les tables)
    from app import models
    
    return app
```

### 4.2 Définition des Modèles

Le fichier [`backend/app/models.py`](backend/app/models.py) contient toutes les définitions de tables :

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class Utilisateur(db.Model):
    """Table centrale des utilisateurs du système"""
    __tablename__ = 'utilisateur'
    id_user = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'Admin', 'Professeur', 'Etudiant'
    
    # Relations
    etudiant = db.relationship('Etudiant', backref='utilisateur', uselist=False)
    professeur = db.relationship('Professeur', backref='utilisateur', uselist=False)
    admin = db.relationship('Admin', backref='utilisateur', uselist=False)

class Filiere(db.Model):
    """Filière d'enseignement (ex: Génie Informatique, Management)"""
    __tablename__ = 'filiere'
    id_filiere = db.Column(db.Integer, primary_key=True)
    nom_filiere = db.Column(db.String(100), nullable=False)
    classes = db.relationship('Classe', backref='filiere', lazy=True)

class Classe(db.Model):
    """Classe associée à une filière"""
    __tablename__ = 'classe'
    id_classe = db.Column(db.Integer, primary_key=True)
    nom_classe = db.Column(db.String(100), nullable=False)
    filiere_id_filiere = db.Column(db.Integer, db.ForeignKey('filiere.id_filiere'), nullable=False)
    etudiants = db.relationship('Etudiant', backref='classe', lazy=True)
    enseignements = db.relationship('Enseignement', backref='classe', lazy=True)

class Matiere(db.Model):
    """Matière enseignée avec coefficient"""
    __tablename__ = 'matiere'
    id_matiere = db.Column(db.Integer, primary_key=True)
    nom_matiere = db.Column(db.String(100), nullable=False)
    coef = db.Column(db.Integer, default=1)
    enseignements = db.relationship('Enseignement', backref='matiere', lazy=True)

class Enseignement(db.Model):
    """Association ternaire:Professeur + Classe + Matière"""
    __tablename__ = 'encryption'
    idencryption = db.Column(db.Integer, primary_key=True)
    matiere_id_matiere = db.Column(db.Integer, db.ForeignKey('matiere.id_matiere'), nullable=False)
    professeur_id_professeur = db.Column(db.Integer, db.ForeignKey('professeur.id_professeur'), nullable=False)
    classe_id_classe = db.Column(db.Integer, db.ForeignKey('classe.id_classe'), nullable=False)
    notes = db.relationship('Note', backref='encryption', lazy=True)
```

### 4.3 Création Automatique des Tables

Le fichier [`backend/run.py`](backend/run.py) montre comment les tables sont créées automatiquement :

```python
from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crée toutes les tables définies dans models.py
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
```

> **Note technique:** `db.create_all()` lit toutes les classes qui héritent de `db.Model` et crée les tables correspondantes dans SQL Server.

**[📷 Image à insérer ici]: Schéma des tables dans SQL Server Management Studio**

---

## 5. Docker et SQL Server

### 5.1 Pourquoi Docker ?

Docker permet de :
- **Portabilité** : Le serveur SQL Server fonctionne sur n'importe quelle machine
- **Isolation** : Pas de conflit avec d'autres installations
- **Facilité de déploiement** : Une commande pour tout lancer
- **Cohérence** : Même environnement de développement pour toute l'équipe

### 5.2 Configuration Docker Compose

Le fichier [`docker-compose.yml`](docker-compose.yml) définit l'infrastructure :

```yaml
version: '3.8'

services:
  # ==========================================
  # SERVICE BASE DE DONNÉES: SQL Server
  # ==========================================
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: notes_db
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver_data:/var/opt/mssql
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT 1"
      interval: 10s
      timeout: 3s
      retries: 5

  # ==========================================
  # SERVICE BACKEND: Flask API
  # ==========================================
  backend:
    build: ./backend
    container_name: notes_backend
    ports:
      - "5001:5001"
    environment:
      - DATABASE_URL=mssql+pyodbc://sa:YourStrong@Passw0rd@db:1433/gestion_notes?driver=ODBC+Driver+17+for+SQL+Server
      - SECRET_KEY=cle_secrete_production
      - JWT_SECRET_KEY=jwt_secret_production
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./backend:/app

  # ==========================================
  # SERVICE FRONTEND: React (optionnel)
  # ==========================================
  frontend:
    build: ./frontend
    container_name: notes_frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  sqlserver_data:
```

### 5.3 Commandes Docker

```bash
# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter tous les services
docker-compose down

# Accéder au conteneur SQL Server
docker exec -it notes_db /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

### 5.4 Connexion Python à SQL Server

Le fichier [`backend/config.py`](backend/config.py) configure la connexion :

```python
import os

class Config:
    # Chaîne de connexion SQL Server
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
        'mssql+pyodbc://sa:YourStrong@Passw0rd@localhost:1433/gestion_notes?driver=ODBC+Driver+17+for+SQL+Server'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
```

> **Note importante:** Pour se connecter à SQL Server depuis Python, il faut installer le driver ODBC :
> ```bash
> pip install pyodbc
> ```

**[📷 Image à insérer ici]: Container SQL Server，运行 dans Docker Desktop**

**[📷 Image à insérer ici]: Base de données "gestion_notes" dans SQL Server Management Studio**

---

## 6. Backend Flask - API RESTful

### 6.1 Architecture de l'API

L'API Flask suit les principes REST et est structurée en **Blueprints** :

```
backend/
├── app/
│   ├── __init__.py          # Application Flask + extensions
│   ├── models.py            # Modèles SQLAlchemy
│   ├── routes/
│   │   ├── auth.py          # /api/auth - Authentification
│   │   ├── etudiants.py     # /api/etudiants - CRUD entités
│   │   ├── notes.py         # /api/notes - Notes & bulletins
│   │   └── stats.py         # /api/stats - Statistiques
│   └── utils/
│       └── pdf_generator.py # Génération bulletins PDF
├── config.py                # Configuration
├── run.py                   # Point d'entrée
└── seed_db.py               # Données de test
```

### 6.2 Point d'Entrée et Initialisation

```python
# backend/app/__init__.py
def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config.from_object(Config)
    
    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors(app)
    
    # Enregistrement des Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(etudiants_bp, url_prefix='/api/etudiants')
    app.register_blueprint(notes_bp, url_prefix='/api/notes')
    app.register_blueprint(stats_bp, url_prefix='/api/stats')
    
    return app
```

### 6.3 Exemple de Route CRUD

Voici un exemple de création d'un étudiant dans [`backend/app/routes/etudiants.py`](backend/app/routes/etudiants.py) :

```python
@etudiants_bp.route('/creer', methods=['POST'])
@jwt_required()
def creer_etudiant():
    """Créer un nouvel étudiant"""
    data = request.get_json()
    
    # Validation des données
    if not data.get('username') or not data.get('matricule'):
        return jsonify({'error': 'Données manquantes'}), 400
    
    # Vérifier unicité
    if Utilisateur.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username déjà utilisé'}), 409
    
    # Créer l'utilisateur
    utilisateur = Utilisateur(
        username=data['username'],
        nom=data['nom'],
        prenom=data['prenom'],
        role='Etudiant'
    )
    utilisateur.set_password(data.get('mot_de_passe', 'etu123'))
    db.session.add(utilisateur)
    db.session.flush()
    
    # Créer l'étudiant
    etudiant = Etudiant(
        matricule=data['matricule'],
        classe_id_classe=data['classe_id'],
        utilisateur_id_user=utilisateur.id_user
    )
    db.session.add(etudiant)
    db.session.commit()
    
    return jsonify({'message': 'Étudiant créé avec succès'}), 201
```

**[📷 Image à insérer ici]: Test de l'API avec Postman - Création d'un étudiant**

---

## 7. Analyse du Frontend

### 7.1 Architecture React

Le frontend est une application **React 19** avec **Vite** et **Tailwind CSS**.

### 7.2 Structure des Composants

| Composant | Fichier | Fonctionnalité |
|-----------|---------|----------------|
| Login | [`Login.tsx`](frontend/src/components/Login.tsx) | Authentification |
| Admin Dashboard | [`AdminDashboard.tsx`](frontend/src/components/AdminDashboard.tsx) | Gestion complète |
| Professor Dashboard | [`ProfessorDashboard.tsx`](frontend/src/components/ProfessorDashboard.tsx) | Saisie des notes |
| Student Dashboard | [`StudentDashboard.tsx`](frontend/src/components/StudentDashboard.tsx) | Consultation notes |

### 7.3 Communication API

```typescript
// frontend/src/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
});

// Interceptor pour ajouter le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**[📷 Image à insérer ici]: Interface Administrateur - Gestion des étudiants**

**[📷 Image à insérer ici]: Interface Professeur - Saisie des notes**

**[📷 Image à insérer ici]: Interface Étudiant - Bulletin PDF**

---

## 8. API et Points de Terminaison

### 8.1 Routes d'Authentification

| Méthode | Route | Description | Accès |
|--------|-------|-------------|-------|
| POST | `/api/auth/register` | Créer un utilisateur | Public |
| POST | `/api/auth/login` | Authentifier (JWT) | Public |
| GET | `/api/auth/me` | Infos utilisateur | JWT Requis |

### 8.2 Routes de Gestion des Entités

| Méthode | Route | Description | Accès |
|--------|-------|-------------|-------|
| GET/POST | `/api/etudiants/filieres` | CRUD Filières | Admin |
| GET/POST | `/api/etudiants/classes` | CRUD Classes | Admin |
| GET/POST | `/api/etudiants/matieres` | CRUD Matières | Admin |
| GET | `/api/etudiants/all` | Liste étudiants | Admin |
| POST | `/api/etudiants/creer` | Créer étudiant | Admin |
| GET/POST | `/api/etudiants/professeurs` | CRUD Professeurs | Admin |

### 8.3 Routes des Notes

| Méthode | Route | Description | Accès |
|--------|-------|-------------|-------|
| GET | `/api/notes/mes-enseignements` | Enseignements prof | Prof |
| POST | `/api/notes/saisir` | Saisir note | Prof |
| GET | `/api/notes/mes-notes` | Notes étudiant | Étudiant |
| GET | `/api/notes/bulletin` | Bulletin PDF | Étudiant |

### 8.4 Routes de Statistiques

| Méthode | Route | Description | Accès |
|--------|-------|-------------|-------|
| GET | `/api/stats/admin` | Stats globales | Admin |
| GET | `/api/stats/classe/<id>` | Stats par classe | Admin/Prof |
| GET | `/api/stats/etudiant` | Stats personnel | Étudiant |

---

## 9. Fonctionnalités par Rôle

### 9.1 Dashboard Administrateur

- **Gestion des filières** : CRUD complet
- **Gestion des classes** : Association filières
- **Gestion des étudiants** : Création, affectation classe
- **Gestion des professeurs** : Création, spécialités
- **Affectations** : Assignation prof → classe → matière
- **Statistiques** : Graphiques et KPIs

**[📷 Image à insérer ici]: Dashboard Administrateur - Vue d'ensemble**

### 9.2 Dashboard Professeur

- **Mes enseignements** : Liste classes/matières
- **Saisie des notes** : Ajout/modification
- **Statistiques** : Moyennes, répartition notes

**[📷 Image à insérer ici]: Dashboard Professeur - Saisie des notes**

### 9.3 Dashboard Étudiant

- **Mes notes** : Consultation par matière
- **Moyenne générale** : Calcul automatique avec coefficients
- **Bulletin PDF** : Téléchargement

**[📷 Image à insérer ici]: Dashboard Étudiant - Bulletin**

---

## 10. Sécurité et Authentification

### 10.1 JWT (JSON Web Tokens)

```python
# backend/app/routes/auth.py
from flask_jwt_extended import create_access_token, jwt_required, get_jwt

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    utilisateur = Utilisateur.query.filter_by(username=data['username']).first()
    
    if utilisateur and utilisateur.check_password(data['password']):
        # Création du token JWT avec le rôle
        access_token = create_access_token(
            identity=utilisateur.id_user,
            additional_claims={'role': utilisateur.role}
        )
        return jsonify(access_token=access_token), 200
    
    return jsonify({'msg': 'Identifiants invalides'}), 401
```

### 10.2 Hachage des Mots de Passe

```python
# backend/app/models.py
import bcrypt

class Utilisateur(db.Model):
    def set_password(self, password):
        self.mot_de_passe = bcrypt.hashpw(
            password.encode('utf-8'), 
            bcrypt.gensalt()
        ).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(
            password.encode('utf-8'), 
            self.mot_de_passe.encode('utf-8')
        )
```

### 10.3 Protection des Routes

```python
@jwt_required()
def route_protegee():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({'msg': 'Accès refusé'}), 403
    return jsonify({'data': 'admin only'}), 200
```

---

## 11. Données de Test et Initialisation

### 11.1 Script de Seed

Le fichier [`backend/seed_db.py`](backend/seed_db.py) initialise la base avec des données réalistes :

```python
def seed_database():
    with app.app_context():
        db.drop_all()  # Supprime toutes les tables
        db.create_all()  # Recrée les tables
        
        # === FILIÈRES ===
        f_info = Filiere(nom_filiere="Génie Informatique")
        f_mgt = Filiere(nom_filiere="Management & Business")
        
        # === CLASSES ===
        c_gl1a = Classe(nom_classe="GL 1-A", filiere_id_filiere=f_info.id_filiere)
        # ... autres classes
        
        # === MATIÈRES ===
        m_python = Matiere(nom_matiere="Python", coef=3)
        # ... autres matières
        
        # === ADMINISTRATEURS ===
        u_admin = Utilisateur(username="admin", nom="ADMIN", prenom="Système", role="Admin")
        u_admin.set_password("admin123")
        
        # === PROFESSEURS ===
        # 20 professors with their subjects
        
        # === ENSEIGNEMENTS ===
        # Association professor - classe - matière
        
        # === ÉTUDIANTS ===
        # 100+ étudiants avec notes aléatoires
        
        db.session.commit()
```

### 11.2 Comptes de Test

| Rôle | Username | Mot de passe |
|------|----------|--------------|
| Admin | admin | admin123 |
| Admin Académique | admin_acad | admin456 |
| Professeur | adiop | prof123 |
| Étudiant | alice | etu123 |

### 11.3 Exécution du Seed

```bash
cd backend
python seed_db.py
```

**[📷 Image à insérer ici]: Résultat du seed dans SQL Server - Tables remplies**

---

## 12. Technologies Utilisées

### 12.1 Base de Données

| Technologie | Version | Usage |
|-------------|---------|-------|
| SQL Server | 2022 | SGBDR |
| Docker | Latest | Conteneurisation |
| SQLAlchemy | - | ORM Python |
| pyodbc | - | Driver SQL Server |

### 12.2 Backend

| Technologie | Usage |
|-------------|-------|
| Flask | Framework web |
| Flask-SQLAlchemy | ORM |
| Flask-JWT-Extended | Authentification JWT |
| Flask-Migrate | Migrations BDD |
| Bcrypt | Hachage mots de passe |
| ReportLab | Génération PDF |

### 12.3 Frontend

| Technologie | Version |
|-------------|---------|
| React | 19.0.0 |
| Vite | 6.2.0 |
| Tailwind CSS | 4.x |
| TypeScript | 5.8.x |
| Axios | 1.13.6 |
| Recharts | 3.7.0 |

---

## 13. Conclusion et Perspectives

### 13.1 Résumé

Ce projet a permis de mettre en pratique les concepts fondamentaux des bases de données :

1. **Modélisation MCD/MLD** : Conception rigoureuse des entités et relations
2. **SQL Server** : Utilisation d'un SGBDR professionnel
3. **Docker** : Conteneurisation pour la portabilité
4. **SQLAlchemy** : Mapping objet-relationnel
5. **API REST** : Architecture orientée ressources

### 13.2 Points Forts

- ✅ **Modèle de données robuste** avec relations N:N
- ✅ **Base SQL Server** via Docker
- ✅ **Sécurité** : JWT + Bcrypt
- ✅ **API RESTful** bien structurée
- ✅ **Interface moderne** React

### 13.3 Améliorations Possibles

1. **Migrations** : Utiliser Alembic pour les évolutions de schéma
2. **Index** : Optimiser les performances avec des index composites
3. **Procédures stockées** : Déplacer la logique métier en SQL
4. **Triggers** : Automatiser certains traitements (historisation)
5. **Tests** : Couverture de tests unitaires

---

## Annexe : Commandes Utiles

```bash
# Lancer le projet avec Docker
docker-compose up -d

# Accéder à SQL Server
docker exec -it notes_db /opt.mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd

# Seed la base de données
cd backend && python seed_db.py

# Logs des conteneurs
docker-compose logs -f db
```

---

*Rapport généré le 10 Mars 2026*
*Projet académique - Cours de Base de Données*
