# Findings: Application de Gestion des Notes

## Project Context
- **Source:** Cahier de charges.pdf & MCD_projet.xml
- **Goal:** Web application for academic management (Students, Teachers, Admins).
- **Tech Stack:** Python (Flask), PostgreSQL (Railway/Supabase), React (Vercel/Netlify).

## Discovery Answers
- **North Star:** Production-ready web app, deployed, fully functional.
- **Integrations:** PostgreSQL, PDF generation (ReportLab/WeasyPrint).
- **Source of Truth:** Cloud PostgreSQL (Railway/Supabase).
- **Delivery Payload:** GitHub repo, Flask on Railway/Render, React on Vercel/Netlify.
- **Behavioral Rules:** French language, JWT auth, strict role-based access, hashed passwords (bcrypt), secure PDF access.

## Data Schema Summary (from MCD_projet.xml)
- **utilisateur:** id_user, nom, prenom, mot_de_passe, role (Admin, Professeur, Etudiant)
- **etudiant:** id_etudiant, matricule, classe_id_classe, utilisateur_id_user
- **professeur:** id_professeur, specialite, utilisateur_id_user
- **admin:** id_admin, utilisateur_id_user
- **filiere:** id_filiere, nom_filiere
- **classe:** id_classe, nom_classe, filiere_id_filiere
- **matiere:** id_matiere, nom_matiere, coef
- **enseignement:** idenseignement, matiere_id_matiere, professeur_id_professeur, classe_id_classe
- **note:** id_note, note, date_saisie, etudiant_id_etudiant, enseignement_idenseignement
- **professeur_has_matiere:** Junction table for professeurs and matieres.
