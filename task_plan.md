# Task Plan: Application de Gestion des Notes

## Phase 1: Blueprint (Vision & Logic)
- [x] Answer Discovery Questions (User)
- [x] Define Data Schema in `gemini.md`
- [x] Finalize Blueprint

## Phase 2: Link (Connectivity)
- [x] Setup Local Docker environment (PostgreSQL + Flask)
- [x] Create `docker-compose.yml` and `backend/Dockerfile`
- [ ] Verify Docker services are running

## Phase 3: Architect (A.N.T. Build)
- [ ] **Layer 1: Architecture**
    - [ ] Define SQLAlchemy Models in `backend/app/models.py`
- [ ] **Layer 2: Navigation**
    - [ ] Implement Flask Factory and Blueprints in `backend/app/`
- [ ] **Layer 3: Tools**
    - [ ] Implement Blueprints: `auth.py`, `etudiants.py`, `notes.py`
    - [ ] Implement PDF export in `backend/app/utils/`

## Phase 4: Stylize (Refinement & UI)
- [ ] (Reserved for User) Implement Frontend React architecture

## Phase 5: Trigger (Deployment)
- [ ] Transition to Cloud PostgreSQL (Railway/Supabase)
- [ ] Finalize production `.env`
- [ ] Deploy Backend & Frontend
