# Modèle Conceptuel de Données (MCD)
## Application de Gestion des Notes — EduDash

> Dernière mise à jour : Mars 2026

---

## Diagramme Entité-Association

```
┌─────────────────────┐
│     UTILISATEUR     │
├─────────────────────┤
│ PK id_user          │
│    username (UNIQUE)│
│    nom              │
│    prenom           │
│    mot_de_passe     │
│    role             │
│    (Admin /         │
│     Professeur /    │
│     Etudiant)       │
└──────────┬──────────┘
           │ 1
    ┌──────┴──────────────────────────────────┐
    │              │                          │
    │ 0..1         │ 0..1                     │ 0..1
    ▼              ▼                          ▼
┌─────────┐  ┌────────────┐           ┌──────────┐
│  ADMIN  │  │ PROFESSEUR │           │ ETUDIANT │
├─────────┤  ├────────────┤           ├──────────┤
│PK id_   │  │PK id_prof  │           │PK id_etu │
│  admin  │  │   specialite│          │   matri- │
│FK id_   │  │FK id_user  │           │   cule   │
│  user   │  └─────┬──────┘           │FK id_user│
└─────────┘        │                  │FK id_    │
                   │ 1..N             │  classe  │
                   ▼                  └────┬─────┘
            ┌─────────────┐               │ 1..N
            │ ENSEIGNEMENT│               ▼
            ├─────────────┤          ┌─────────┐
            │PK idenseign.│          │  NOTE   │
            │FK id_prof   │◄─────────┤─────────┤
            │FK id_classe │  1..N    │PK id_   │
            │FK id_matiere│          │  note   │
            └──────┬──────┘          │  valeur │
                   │                 │  date_  │
                   │                 │  saisie │
                   │                 │FK id_etu│
                   │                 │FK idense│
                   │                 └─────────┘
    ┌──────────────┴──────────────┐
    │                             │
    ▼                             ▼
┌──────────┐               ┌──────────┐
│ MATIERE  │               │  CLASSE  │
├──────────┤               ├──────────┤
│PK id_mat │               │PK id_cl  │
│  nom_mat │               │  nom_cl  │
│  coef    │               │FK id_fil │
└──────────┘               └────┬─────┘
                                │ N..1
                                ▼
                          ┌──────────┐
                          │ FILIERE  │
                          ├──────────┤
                          │PK id_fil │
                          │  nom_fil │
                          └──────────┘
```

---

## Tables et attributs

### `utilisateur`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_user` | INTEGER | PK, AUTO | Identifiant unique |
| `username` | VARCHAR(100) | UNIQUE, NOT NULL | Login de connexion |
| `nom` | VARCHAR(100) | NOT NULL | Nom de famille |
| `prenom` | VARCHAR(100) | NOT NULL | Prénom |
| `mot_de_passe` | VARCHAR(255) | NOT NULL | Hash bcrypt |
| `role` | VARCHAR(50) | NOT NULL | `Admin`, `Professeur`, `Etudiant` |

### `admin`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_admin` | INTEGER | PK, AUTO | Identifiant |
| `utilisateur_id_user` | INTEGER | FK → utilisateur | Lien utilisateur |

### `professeur`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_professeur` | INTEGER | PK, AUTO | Identifiant |
| `specialite` | VARCHAR(100) | — | Domaine d'expertise |
| `utilisateur_id_user` | INTEGER | FK → utilisateur | Lien utilisateur |

### `filiere`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_filiere` | INTEGER | PK, AUTO | Identifiant |
| `nom_filiere` | VARCHAR(100) | NOT NULL | Ex: Génie Informatique |

### `classe`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_classe` | INTEGER | PK, AUTO | Identifiant |
| `nom_classe` | VARCHAR(100) | NOT NULL | Ex: GL 1-A |
| `filiere_id_filiere` | INTEGER | FK → filiere | Filière de rattachement |

### `etudiant`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_etudiant` | INTEGER | PK, AUTO | Identifiant |
| `matricule` | VARCHAR(50) | UNIQUE, NOT NULL | Ex: AD001 |
| `classe_id_classe` | INTEGER | FK → classe | Classe de l'étudiant |
| `utilisateur_id_user` | INTEGER | FK → utilisateur | Lien utilisateur |

### `matiere`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_matiere` | INTEGER | PK, AUTO | Identifiant |
| `nom_matiere` | VARCHAR(100) | NOT NULL | Ex: Programmation Python |
| `coef` | INTEGER | DEFAULT 1 | Coefficient de pondération |

### `enseignement`
Table d'association entre Professeur, Classe et Matière.

| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `idenseignement` | INTEGER | PK, AUTO | Identifiant |
| `professeur_id_professeur` | INTEGER | FK → professeur | Professeur concerné |
| `classe_id_classe` | INTEGER | FK → classe | Classe concernée |
| `matiere_id_matiere` | INTEGER | FK → matiere | Matière enseignée |

### `note`
| Colonne | Type | Contrainte | Description |
|---------|------|-----------|-------------|
| `id_note` | INTEGER | PK, AUTO | Identifiant |
| `valeur_note` | FLOAT | NOT NULL | Note sur 20 |
| `date_saisie` | DATETIME | DEFAULT now() | Date de saisie |
| `etudiant_id_etudiant` | INTEGER | FK → etudiant | Étudiant noté |
| `enseignement_idenseignement` | INTEGER | FK → enseignement | Contexte (prof + classe + matière) |

---

## Relations

| Relation | Cardinalité | Description |
|----------|-------------|-------------|
| Utilisateur → Admin | 1:0..1 | Un utilisateur peut être admin |
| Utilisateur → Professeur | 1:0..1 | Un utilisateur peut être professeur |
| Utilisateur → Etudiant | 1:0..1 | Un utilisateur peut être étudiant |
| Filiere → Classe | 1:N | Une filière contient plusieurs classes |
| Classe → Etudiant | 1:N | Une classe contient plusieurs étudiants |
| Professeur + Classe + Matiere → Enseignement | N:N:N | Un prof enseigne une matière dans une classe |
| Enseignement → Note | 1:N | Un enseignement génère plusieurs notes |
| Etudiant → Note | 1:N | Un étudiant a plusieurs notes |

---

## Règles de gestion

1. Un étudiant appartient à **une seule classe** à la fois
2. Une classe appartient à **une seule filière**
3. Un professeur peut enseigner **plusieurs matières** dans **plusieurs classes**
4. Une note est toujours liée à un **enseignement** (contexte prof + classe + matière) et à un **étudiant**
5. Le rôle d'un utilisateur est exclusif : Admin, Professeur, ou Etudiant
6. Le matricule d'un étudiant est **unique** dans le système
