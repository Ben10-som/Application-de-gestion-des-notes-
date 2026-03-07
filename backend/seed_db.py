from app import create_app, db
from app.models import Utilisateur, Etudiant, Professeur, Admin, Classe, Filiere, Matiere, Enseignement, Note
import random

app = create_app()

def seed_database():
    with app.app_context():
        print("Cleaning database...")
        db.drop_all()
        db.create_all()

        print("Seeding database...")

        # --- FILIÈRES ---
        f_info = Filiere(nom_filiere="Génie Informatique")
        f_mgt = Filiere(nom_filiere="Management & Business")
        db.session.add_all([f_info, f_mgt])
        db.session.flush()

        # --- CLASSES ---
        c_gl1 = Classe(nom_classe="GL 1-A", filiere_id_filiere=f_info.id_filiere)
        c_gl2 = Classe(nom_classe="GL 2-B", filiere_id_filiere=f_info.id_filiere)
        c_mgt1 = Classe(nom_classe="MGT 1", filiere_id_filiere=f_mgt.id_filiere)
        db.session.add_all([c_gl1, c_gl2, c_mgt1])
        db.session.flush()

        # --- MATIÈRES ---
        m_python = Matiere(nom_matiere="Programmation Python", coef=3)
        m_js = Matiere(nom_matiere="JavaScript & React", coef=4)
        m_db = Matiere(nom_matiere="Bases de Données SQL", coef=2)
        m_eco = Matiere(nom_matiere="Économie Générale", coef=2)
        db.session.add_all([m_python, m_js, m_db, m_eco])
        db.session.flush()

        # --- UTILISATEURS: ADMIN ---
        u_admin = Utilisateur(username="admin", nom="ADMIN", prenom="Système", role="Admin")
        u_admin.set_password("admin123")
        db.session.add(u_admin)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin.id_user))

        # --- UTILISATEURS: PROFESSEURS ---
        # Prof 1
        u_prof1 = Utilisateur(username="jdupont", nom="DUPONT", prenom="Jean", role="Professeur")
        u_prof1.set_password("prof123")
        db.session.add(u_prof1)
        db.session.flush()
        p1 = Professeur(specialite="Développement Logiciel", utilisateur_id_user=u_prof1.id_user)
        db.session.add(p1)
        db.session.flush()

        # Prof 2
        u_prof2 = Utilisateur(username="mmartin", nom="MARTIN", prenom="Marie", role="Professeur")
        u_prof2.set_password("prof123")
        db.session.add(u_prof2)
        db.session.flush()
        p2 = Professeur(specialite="Data & Management", utilisateur_id_user=u_prof2.id_user)
        db.session.add(p2)
        db.session.flush()

        # --- AFFECTATIONS (ENSEIGNEMENTS) ---
        ens1 = Enseignement(professeur_id_professeur=p1.id_professeur, classe_id_classe=c_gl1.id_classe, matiere_id_matiere=m_python.id_matiere)
        ens2 = Enseignement(professeur_id_professeur=p1.id_professeur, classe_id_classe=c_gl2.id_classe, matiere_id_matiere=m_js.id_matiere)
        ens3 = Enseignement(professeur_id_professeur=p2.id_professeur, classe_id_classe=c_gl1.id_classe, matiere_id_matiere=m_db.id_matiere)
        ens4 = Enseignement(professeur_id_professeur=p2.id_professeur, classe_id_classe=c_mgt1.id_classe, matiere_id_matiere=m_eco.id_matiere)
        db.session.add_all([ens1, ens2, ens3, ens4])
        db.session.flush()

        # --- UTILISATEURS: ÉTUDIANTS ---
        etudiants_data = [
            # GL 1-A
            ("alice",    "DIALLO",   "Alice",    "AD001", c_gl1.id_classe),
            ("bob",      "NDIAYE",   "Bob",      "BN002", c_gl1.id_classe),
            ("carol",    "FALL",     "Carol",    "CF003", c_gl1.id_classe),
            ("daouda",   "SECK",     "Daouda",   "DS004", c_gl1.id_classe),
            ("eve",      "MBAYE",    "Eve",      "EM005", c_gl1.id_classe),
            # GL 2-B
            ("fatoumata","GUEYE",    "Fatoumata","FG006", c_gl2.id_classe),
            ("gabriel",  "SARR",     "Gabriel",  "GS007", c_gl2.id_classe),
            ("hawa",     "THIAM",    "Hawa",     "HT008", c_gl2.id_classe),
            ("ibrahima", "DIOP",     "Ibrahima", "ID009", c_gl2.id_classe),
            # MGT 1
            ("jean",     "CAMARA",   "Jean",     "JC010", c_mgt1.id_classe),
            ("khadija",  "TOURE",    "Khadija",  "KT011", c_mgt1.id_classe),
            ("lamine",   "BALDE",    "Lamine",   "LB012", c_mgt1.id_classe),
        ]

        for username, nom, prenom, matricule, classe_id in etudiants_data:
            u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Etudiant")
            u.set_password("etu123")
            db.session.add(u)
            db.session.flush()
            e = Etudiant(matricule=matricule, classe_id_classe=classe_id, utilisateur_id_user=u.id_user)
            db.session.add(e)
            db.session.flush()

            # Notes selon la classe
            if classe_id == c_gl1.id_classe:
                db.session.add(Note(valeur_note=round(random.uniform(8, 19), 2),  etudiant_id_etudiant=e.id_etudiant, enseignement_idenseignement=ens1.idenseignement))
                db.session.add(Note(valeur_note=round(random.uniform(7, 18), 2),  etudiant_id_etudiant=e.id_etudiant, enseignement_idenseignement=ens3.idenseignement))
            elif classe_id == c_gl2.id_classe:
                db.session.add(Note(valeur_note=round(random.uniform(9, 20), 2),  etudiant_id_etudiant=e.id_etudiant, enseignement_idenseignement=ens2.idenseignement))
            elif classe_id == c_mgt1.id_classe:
                db.session.add(Note(valeur_note=round(random.uniform(6, 17), 2),  etudiant_id_etudiant=e.id_etudiant, enseignement_idenseignement=ens4.idenseignement))

        db.session.commit()
        print("Database seeded successfully with realistic data!")

if __name__ == "__main__":
    seed_database()
