# Project Constitution: Application de Gestion des Notes

## Directory Structure (Backend)
```
backend/
├── app/
│   ├── __init__.py          # Factory
│   ├── models.py            # SQLAlchemy
│   ├── routes/              # Blueprints
│   │   ├── auth.py
│   │   ├── etudiants.py
│   │   ├── notes.py
│   └── utils/               # PDF, Calculs
├── migrations/
├── config.py
└── run.py
```

## Behavioral Rules
- **Local First:** Start with local PostgreSQL.
- **Language:** French UI/Messages.
- **Security:** JWT Auth, Bcrypt hashing.
- **Roles:** Strict separation (Etudiant/Professeur/Admin).

## Data Schemas
[See previous versions for Payload shapes]
