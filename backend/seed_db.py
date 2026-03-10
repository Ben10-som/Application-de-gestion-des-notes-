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
        classes_data = [
            ("GL 1-A", f_info.id_filiere),
            ("GL 1-B", f_info.id_filiere),
            ("GL 2-A", f_info.id_filiere),
            ("GL 2-B", f_info.id_filiere),
            ("GL 3-A", f_info.id_filiere),
            ("GL 3-B", f_info.id_filiere),
            ("MGT 1", f_mgt.id_filiere),
            ("MGT 2", f_mgt.id_filiere),
        ]
        classes = {}
        for nom, fid in classes_data:
            c = Classe(nom_classe=nom, filiere_id_filiere=fid)
            db.session.add(c)
            db.session.flush()
            classes[nom] = c

        # --- MATIÈRES ---
        matieres_data = [
            ("Python", 3), ("Algorithmique", 3), ("Base de Données", 2), ("SQL", 2),
            ("Réseaux", 3), ("Sécurité Informatique", 3), ("Développement Web", 4), ("JavaScript", 4),
            ("Mathématiques", 3), ("Statistiques", 2), ("Économie", 2), ("Gestion", 2),
            ("Java", 3), ("Programmation Orientée Objet", 3), ("Systèmes d'Exploitation", 3), ("Linux", 2),
            ("Analyse de Données", 3), ("Big Data", 3), ("Comptabilité", 2), ("Finance", 2),
            ("Génie Logiciel", 3), ("UML", 2), ("Marketing", 2), ("Management", 2),
            ("Structures de Données", 3), ("Algorithmique Avancée", 3), ("Intelligence Artificielle", 4), ("Machine Learning", 4),
            ("Probabilités", 3), ("Développement Mobile", 3), ("Android", 3), ("Administration Réseaux", 3), ("Cloud Computing", 3),
            ("Bases de Données Avancées", 3), ("Data Warehousing", 3), ("Python Avancé", 3), ("Data Science", 4),
            ("Cybersécurité", 3), ("Cryptographie", 3),
        ]
        matieres = {}
        for nom, coef in matieres_data:
            m = Matiere(nom_matiere=nom, coef=coef)
            db.session.add(m)
            db.session.flush()
            matieres[nom] = m

        # --- ADMINISTRATEURS ---
        u_admin = Utilisateur(username="admin", nom="ADMIN", prenom="Système", role="Admin")
        u_admin.set_password("admin123")
        db.session.add(u_admin)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin.id_user))

        u_admin2 = Utilisateur(username="admin_acad", nom="ADMIN", prenom="Académique", role="Admin")
        u_admin2.set_password("admin456")
        db.session.add(u_admin2)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin2.id_user))

        # --- PROFESSEURS ---
        profs_data = [
            ("adiop", "DIOP", "Amadou"),
            ("fndiaye", "NDIAYE", "Fatou"),
            ("msarr", "SARR", "Moussa"),
            ("aba", "BA", "Aissatou"),
            ("ifall", "FALL", "Ibrahima"),
            ("msow", "SOW", "Mariama"),
            ("agueye", "GUEYE", "Abdou"),
            ("cka", "KA", "Cheikh"),
            ("oseck", "SECK", "Ousmane"),
            ("ktoure", "TOURE", "Khadija"),
        ]
        profs = []
        for username, nom, prenom in profs_data:
            u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Professeur")
            u.set_password("prof123")
            db.session.add(u)
            db.session.flush()
            p =Professeur(specialite="Informatique", utilisateur_id_user=u.id_user)
            db.session.add(p)
            db.session.flush()
            profs.append(p)

        # --- ENSEIGNEMENTS ---
        enseignements = []
        # Create some sample teachings
        for i, p in enumerate(profs[:5]):
            for cls_key in ["GL 1-A", "GL 1-B", "GL 2-A"]:
                matiere = list(matieres.values())[i % len(matieres)]
                ens = Enseignement(
                    professeur_id_professeur=p.id_professeur,
                    classe_id_classe=classes[cls_key].id_classe,
                    matiere_id_matiere=matiere.id_matiere
                )
                db.session.add(ens)
                db.session.flush()
                enseignements.append(ens)

        # --- ÉTUDIANTS (100 students from database2.xlsx) ---
        etudiants_data = [
            ("alice", "DIALLO", "Alice", "AD001", "GL 1-A"),
            ("bob", "NDIAYE", "Bob", "BN002", "GL 1-A"),
            ("carol", "FALL", "Carol", "CF003", "GL 1-A"),
            ("daouda", "SECK", "Daouda", "DS004", "GL 1-A"),
            ("eve", "MBAYE", "Eve", "EM005", "GL 1-A"),
            ("fatoumata", "GUEYE", "Fatoumata", "FG006", "GL 1-A"),
            ("gabriel", "SARR", "Gabriel", "GS007", "GL 1-A"),
            ("hawa", "THIAM", "Hawa", "HT008", "GL 1-A"),
            ("ibrahima", "DIOP", "Ibrahima", "ID009", "GL 1-A"),
            ("jean", "CAMARA", "Jean", "JC010", "GL 1-A"),
            ("khadija", "TOURE", "Khadija", "KT011", "GL 1-B"),
            ("lamine", "BALDE", "Lamine", "LB012", "GL 1-B"),
            ("mariama", "BA", "Mariama", "MB013", "GL 1-B"),
            ("ousmane", "NDAO", "Ousmane", "NO014", "GL 1-B"),
            ("pape", "SY", "Pape", "SP015", "GL 1-B"),
            ("aissatou", "LO", "Aissatou", "LA016", "GL 1-B"),
            ("cheikh", "FAYE", "Cheikh", "FC017", "GL 1-B"),
            ("abdou", "SOW", "Abdou", "SA018", "GL 1-B"),
            ("fatou", "KA", "Fatou", "KF019", "GL 1-B"),
            ("moussa", "GAYE", "Moussa", "GM020", "GL 1-B"),
            ("awa", "DIOUF", "Awa", "DA021", "GL 2-A"),
            ("mamadou", "NDIAYE", "Mamadou", "NM022", "GL 2-A"),
            ("aminata", "SEYE", "Aminata", "SA023", "GL 2-A"),
            ("cheikh2", "DIOP", "Cheikh", "DC024", "GL 2-A"),
            ("fatou2", "MBODJ", "Fatou", "MF025", "GL 2-A"),
            ("oumar", "CISSE", "Oumar", "CO026", "GL 2-A"),
            ("marieme", "THIAM", "Marieme", "TM027", "GL 2-A"),
            ("ibra", "NGOM", "Ibrahima", "NI028", "GL 2-A"),
            ("aida", "SARR", "Aida", "SA029", "GL 2-A"),
            ("abdoulaye", "FALL", "Abdoulaye", "FA030", "GL 2-A"),
            ("khadim", "BA", "Khadim", "BK031", "GL 2-B"),
            ("fatoumata2", "NDAO", "Fatoumata", "NF032", "GL 2-B"),
            ("abdou2", "DIOP", "Abdou", "DA033", "GL 2-B"),
            ("mariam", "SECK", "Mariam", "SM034", "GL 2-B"),
            ("abdoulaye2", "GUEYE", "Abdoulaye", "GA035", "GL 2-B"),
            ("pape2", "FALL", "Pape", "FP036", "GL 2-B"),
            ("khadija2", "SY", "Khadija", "SK037", "GL 2-B"),
            ("moussa2", "SOW", "Moussa", "SM038", "GL 2-B"),
            ("fatou3", "LO", "Fatou", "LF039", "GL 2-B"),
            ("ousmane2", "FAYE", "Ousmane", "FO040", "GL 2-B"),
            ("aissatou2", "NDIAYE", "Aissatou", "NA041", "GL 3-A"),
            ("ibrahima2", "BA", "Ibrahima", "BI042", "GL 3-A"),
            ("cheikh3", "DIOUF", "Cheikh", "DC043", "GL 3-A"),
            ("fatou4", "SEYE", "Fatou", "SF044", "GL 3-A"),
            ("abdou3", "NGOM", "Abdou", "NA045", "GL 3-A"),
            ("mariama2", "SARR", "Mariama", "SM046", "GL 3-A"),
            ("ibra2", "CISSE", "Ibrahima", "CI047", "GL 3-A"),
            ("ousmane3", "THIAM", "Ousmane", "TO048", "GL 3-A"),
            ("awa2", "KA", "Awa", "KA049", "GL 3-A"),
            ("pape3", "GUEYE", "Pape", "GP050", "GL 3-A"),
            ("mariama3", "DIALLO", "Mariama", "DM051", "MGT 1"),
            ("abdou4", "NDIAYE", "Abdou", "NA052", "MGT 1"),
            ("aissatou3", "FALL", "Aissatou", "FA053", "MGT 1"),
            ("ibra3", "SOW", "Ibrahima", "SI054", "MGT 1"),
            ("ousmane4", "BA", "Ousmane", "BO055", "MGT 1"),
            ("fatou5", "LO", "Fatoumata", "LF056", "MGT 1"),
            ("abdou5", "GAYE", "Abdou", "GA057", "MGT 1"),
            ("marieme2", "SECK", "Marieme", "SM058", "MGT 1"),
            ("cheikh4", "SY", "Cheikh", "SC059", "MGT 1"),
            ("khadija3", "DIOP", "Khadija", "DK060", "MGT 1"),
            ("oumar2", "MBAYE", "Mamadou", "MO061", "GL 1-A"),
            ("pape4", "NDAO", "Pape", "NP062", "GL 1-A"),
            ("fatou6", "CISSE", "Fatou", "CF063", "GL 1-A"),
            ("abdou6", "SEYE", "Abdou", "SA064", "GL 1-A"),
            ("awa3", "FAYE", "Awa", "FA065", "GL 1-A"),
            ("ibra4", "GUEYE", "Ibrahima", "GI066", "GL 1-A"),
            ("fatoumata3", "THIAM", "Fatoumata", "TF067", "GL 1-A"),
            ("mariam2", "DIOUF", "Mariam", "DM068", "GL 1-A"),
            ("abdoulaye3", "NGOM", "Abdoulaye", "NA069", "GL 1-A"),
            ("cheikh5", "BA", "Cheikh", "BC070", "GL 1-A"),
            ("ousmane5", "LO", "Ousmane", "LO071", "GL 2-A"),
            ("awa4", "SARR", "Awa", "SA072", "GL 2-A"),
            ("mariama4", "SY", "Mariama", "SM073", "GL 2-A"),
            ("abdou7", "FALL", "Abdou", "FA074", "GL 2-A"),
            ("fatou7", "DIOP", "Fatou", "DF075", "GL 2-A"),
            ("ousmane6", "CISSE", "Ousmane", "CO076", "GL 2-A"),
            ("marieme3", "GAYE", "Marieme", "GM077", "GL 2-A"),
            ("abdou8", "THIAM", "Abdou", "TA078", "GL 2-A"),
            ("awa5", "NDAO", "Awa", "NA079", "GL 2-A"),
            ("cheikh6", "MBODJ", "Cheikh", "MC080", "GL 2-A"),
            ("ousmane7", "SECK", "Ousmane", "SO081", "GL 3-A"),
            ("fatou8", "DIALLO", "Fatou", "DF082", "GL 3-A"),
            ("mariama5", "NDIAYE", "Mariama", "NM083", "GL 3-A"),
            ("abdoulaye4", "SOW", "Abdoulaye", "SA084", "GL 3-A"),
            ("ibra5", "FAYE", "Ibrahima", "FI085", "GL 3-A"),
            ("mariam3", "BA", "Mariam", "BM086", "GL 3-A"),
            ("khadija4", "LO", "Khadija", "LK087", "GL 3-A"),
            ("abdou9", "GUEYE", "Abdou", "GA088", "GL 3-A"),
            ("aissatou4", "THIAM", "Aissatou", "TA089", "GL 3-A"),
            ("cheikh7", "CISSE", "Cheikh", "CC090", "GL 3-A"),
            ("oumar3", "MBAYE", "Oumar", "NO091", "MGT 1"),
            ("fatou9", "NDIAYE", "Fatou", "MF092", "MGT 1"),
            ("abdoulaye5", "DIOP", "Abdoulaye", "DA093", "MGT 1"),
            ("khadija5", "SARR", "Khadija", "SK094", "MGT 1"),
            ("ibra6", "BA", "Ibrahima", "BI095", "MGT 1"),
            ("mariama6", "LO", "Mariama", "LM096", "MGT 1"),
            ("ousmane8", "GUEYE", "Ousmane", "GO097", "MGT 1"),
            ("fatou10", "THIAM", "Fatou", "TF098", "MGT 1"),
            ("abdou10", "CISSE", "Abdou", "CA099", "MGT 1"),
            ("awa6", "DIALLO", "Awa", "DA100", "MGT 1"),
        ]

        for username, nom, prenom, matricule, cls_nom in etudiants_data:
            u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Etudiant")
            u.set_password("etu123")
            db.session.add(u)
            db.session.flush()
            e = Etudiant(matricule=matricule, classe_id_classe=classes[cls_nom].id_classe, utilisateur_id_user=u.id_user)
            db.session.add(e)
            db.session.flush()

            # Add random notes for students in GL 1-A and GL 1-B
            if cls_nom in ["GL 1-A", "GL 1-B"]:
                for ens in enseignements[:2]:
                    n = Note(
                        valeur_note=round(random.uniform(8, 18), 2),
                        etudiant_id_etudiant=e.id_etudiant,
                        idencryption=ens.idencryption
                    )
                    db.session.add(n)

        db.session.commit()
        print("Database seeded successfully with 100 students from database2.xlsx!")

if __name__ == "__main__":
    seed_database()
