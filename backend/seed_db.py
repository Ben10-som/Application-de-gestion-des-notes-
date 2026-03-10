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
        # Génie Informatique
        c_gl1a = Classe(nom_classe="GL 1-A", filiere_id_filiere=f_info.id_filiere)
        c_gl1b = Classe(nom_classe="GL 1-B", filiere_id_filiere=f_info.id_filiere)
        c_gl2a = Classe(nom_classe="GL 2-A", filiere_id_filiere=f_info.id_filiere)
        c_gl2b = Classe(nom_classe="GL 2-B", filiere_id_filiere=f_info.id_filiere)
        c_gl3a = Classe(nom_classe="GL 3-A", filiere_id_filiere=f_info.id_filiere)
        c_gl3b = Classe(nom_classe="GL 3-B", filiere_id_filiere=f_info.id_filiere)
        # Management & Business
        c_mgt1a = Classe(nom_classe="MGT 1-A", filiere_id_filiere=f_mgt.id_filiere)
        c_mgt1b = Classe(nom_classe="MGT 1-B", filiere_id_filiere=f_mgt.id_filiere)
        c_mgt2a = Classe(nom_classe="MGT 2-A", filiere_id_filiere=f_mgt.id_filiere)
        c_mgt2b = Classe(nom_classe="MGT 2-B", filiere_id_filiere=f_mgt.id_filiere)
        
        db.session.add_all([c_gl1a, c_gl1b, c_gl2a, c_gl2b, c_gl3a, c_gl3b, c_mgt1a, c_mgt1b, c_mgt2a, c_mgt2b])
        db.session.flush()

        # --- MATIÈRES ---
        m_python = Matiere(nom_matiere="Python", coef=3)
        m_algo = Matiere(nom_matiere="Algorithmique", coef=3)
        m_db = Matiere(nom_matiere="Base de Données", coef=2)
        m_sql = Matiere(nom_matiere="SQL", coef=2)
        m_reseaux = Matiere(nom_matiere="Réseaux", coef=3)
        m_securite = Matiere(nom_matiere="Sécurité Informatique", coef=3)
        m_devweb = Matiere(nom_matiere="Développement Web", coef=4)
        m_js = Matiere(nom_matiere="JavaScript", coef=4)
        m_math = Matiere(nom_matiere="Mathématiques", coef=3)
        m_stats = Matiere(nom_matiere="Statistiques", coef=2)
        m_eco = Matiere(nom_matiere="Économie", coef=2)
        m_gestion = Matiere(nom_matiere="Gestion", coef=2)
        m_java = Matiere(nom_matiere="Java", coef=3)
        m_poo = Matiere(nom_matiere="Programmation Orientée Objet", coef=3)
        m_se = Matiere(nom_matiere="Systèmes d'Exploitation", coef=3)
        m_linux = Matiere(nom_matiere="Linux", coef=2)
        m_analyse = Matiere(nom_matiere="Analyse de Données", coef=3)
        m_bigdata = Matiere(nom_matiere="Big Data", coef=3)
        m_compta = Matiere(nom_matiere="Comptabilité", coef=2)
        m_finance = Matiere(nom_matiere="Finance", coef=2)
        m_gl = Matiere(nom_matiere="Génie Logiciel", coef=3)
        m_uml = Matiere(nom_matiere="UML", coef=2)
        m_marketing = Matiere(nom_matiere="Marketing", coef=2)
        m_management = Matiere(nom_matiere="Management", coef=2)
        m_sd = Matiere(nom_matiere="Structures de Données", coef=3)
        m_algo_avancee = Matiere(nom_matiere="Algorithmique Avancée", coef=3)
        m_ia = Matiere(nom_matiere="Intelligence Artificielle", coef=4)
        m_ml = Matiere(nom_matiere="Machine Learning", coef=4)
        m_proba = Matiere(nom_matiere="Probabilités", coef=3)
        m_dev_mobile = Matiere(nom_matiere="Développement Mobile", coef=3)
        m_android = Matiere(nom_matiere="Android", coef=3)
        m_admin_reseau = Matiere(nom_matiere="Administration Réseaux", coef=3)
        m_cloud = Matiere(nom_matiere="Cloud Computing", coef=3)
        m_bd_avancees = Matiere(nom_matiere="Bases de Données Avancées", coef=3)
        m_datawarehouse = Matiere(nom_matiere="Data Warehousing", coef=3)
        m_python_avance = Matiere(nom_matiere="Python Avancé", coef=3)
        m_data_science = Matiere(nom_matiere="Data Science", coef=4)
        m_cyber = Matiere(nom_matiere="Cybersécurité", coef=3)
        m_crypto = Matiere(nom_matiere="Cryptographie", coef=3)
        
        db.session.add_all([
            m_python, m_algo, m_db, m_sql, m_reseaux, m_securite, m_devweb, m_js,
            m_math, m_stats, m_eco, m_gestion, m_java, m_poo, m_se, m_linux,
            m_analyse, m_bigdata, m_compta, m_finance, m_gl, m_uml, m_marketing,
            m_management, m_sd, m_algo_avancee, m_ia, m_ml, m_proba, m_dev_mobile,
            m_android, m_admin_reseau, m_cloud, m_bd_avancees, m_datawarehouse,
            m_python_avance, m_data_science, m_cyber, m_crypto
        ])
        db.session.flush()

        # --- UTILISATEURS: ADMIN ---
        u_admin1 = Utilisateur(username="admin", nom="ADMIN", prenom="Système", role="Admin")
        u_admin1.set_password("admin123")
        db.session.add(u_admin1)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin1.id_user))

        u_admin2 = Utilisateur(username="admin_acad", nom="ADMIN", prenom="Académique", role="Admin")
        u_admin2.set_password("admin456")
        db.session.add(u_admin2)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin2.id_user))

        # --- UTILISATEURS: PROFESSEURS (20 professors) ---
        profs_data = [
            ("adiop", "DIOP", "Amadou", "Python (GL1-A), Algorithmique (GL1-A)"),
            ("fndiaye", "NDIAYE", "Fatou", "Base de Données (GL2-A), SQL (GL2-B)"),
            ("msarr", "SARR", "Moussa", "Réseaux (GL3-A), Sécurité Informatique (GL3-B)"),
            ("aba", "BA", "Aissatou", "Développement Web (GL2-A), JavaScript (GL2-B)"),
            ("ifall", "FALL", "Ibrahima", "Mathématiques (GL1-A), Statistiques (GL1-B)"),
            ("msow", "SOW", "Mariama", "Économie (MGT1-A), Gestion (MGT1-B)"),
            ("agueye", "GUEYE", "Abdou", "Java (GL2-A), Programmation Orientée Objet (GL2-B)"),
            ("cka", "KA", "Cheikh", "Systèmes d'Exploitation (GL3-A), Linux (GL3-B)"),
            ("oseck", "SECK", "Ousmane", "Analyse de Données (GL3-A), Big Data (GL3-B)"),
            ("ktoure", "TOURE", "Khadija", "Comptabilité (MGT1-A), Finance (MGT2-A)"),
            ("mdia", "DIA", "Mamadou", "Génie Logiciel (GL3-A), UML (GL3-B)"),
            ("aciss", "CISS", "Awa", "Marketing (MGT2-A), Management (MGT2-B)"),
            ("alo", "LO", "Abdoulaye", "Structures de Données (GL2-A), Algorithmique Avancée (GL2-B)"),
            ("pfaye", "FAYE", "Pape", "Intelligence Artificielle (GL3-A), Machine Learning (GL3-B)"),
            ("fngom", "NGOM", "Fatoumata", "Probabilités (GL1-B), Statistiques (GL2-A)"),
            ("cmbaye", "MBAYE", "Cheikh", "Développement Mobile (GL3-A), Android (GL3-B)"),
            ("asy", "SY", "Abdou", "Administration Réseaux (GL3-A), Cloud Computing (GL3-B)"),
            ("andao", "NDAO", "Amina", "Bases de Données Avancées (GL3-A), Data Warehousing (GL3-B)"),
            ("mdiallo", "DIALLO", "Mamadou", "Python Avancé (GL2-A), Data Science (GL3-A)"),
            ("okane", "KANE", "Oumar", "Cybersécurité (GL3-A), Cryptographie (GL3-B)"),
        ]

        profs = []
        for username, nom, prenom, specialite in profs_data:
            u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Professeur")
            u.set_password("prof123")
            db.session.add(u)
            db.session.flush()
            p =Professeur(specialite=specialite, utilisateur_id_user=u.id_user)
            db.session.add(p)
            db.session.flush()
            profs.append(p)

        # --- AFFECTATIONS (ENSEIGNEMENTS) ---
        enseignements_data = [
            # DIOP Amadou - Python (GL1-A), Algorithmique (GL1-A)
            (profs[0], c_gl1a.id_classe, m_python.id_matiere),
            (profs[0], c_gl1a.id_classe, m_algo.id_matiere),
            # NDIAYE Fatou - Base de Données (GL2-A), SQL (GL2-B)
            (profs[1], c_gl2a.id_classe, m_db.id_matiere),
            (profs[1], c_gl2b.id_classe, m_sql.id_matiere),
            # SARR Moussa - Réseaux (GL3-A), Sécurité Informatique (GL3-B)
            (profs[2], c_gl3a.id_classe, m_reseaux.id_matiere),
            (profs[2], c_gl3b.id_classe, m_securite.id_matiere),
            # BA Aissatou - Développement Web (GL2-A), JavaScript (GL2-B)
            (profs[3], c_gl2a.id_classe, m_devweb.id_matiere),
            (profs[3], c_gl2b.id_classe, m_js.id_matiere),
            # FALL Ibrahima - Mathématiques (GL1-A), Statistiques (GL1-B)
            (profs[4], c_gl1a.id_classe, m_math.id_matiere),
            (profs[4], c_gl1b.id_classe, m_stats.id_matiere),
            # SOW Mariama - Économie (MGT1-A), Gestion (MGT1-B)
            (profs[5], c_mgt1a.id_classe, m_eco.id_matiere),
            (profs[5], c_mgt1b.id_classe, m_gestion.id_matiere),
            # GUEYE Abdou - Java (GL2-A), Programmation Orientée Objet (GL2-B)
            (profs[6], c_gl2a.id_classe, m_java.id_matiere),
            (profs[6], c_gl2b.id_classe, m_poo.id_matiere),
            # KA Cheikh - Systèmes d'Exploitation (GL3-A), Linux (GL3-B)
            (profs[7], c_gl3a.id_classe, m_se.id_matiere),
            (profs[7], c_gl3b.id_classe, m_linux.id_matiere),
            # SECK Ousmane - Analyse de Données (GL3-A), Big Data (GL3-B)
            (profs[8], c_gl3a.id_classe, m_analyse.id_matiere),
            (profs[8], c_gl3b.id_classe, m_bigdata.id_matiere),
            # TOURE Khadija - Comptabilité (MGT1-A), Finance (MGT2-A)
            (profs[9], c_mgt1a.id_classe, m_compta.id_matiere),
            (profs[9], c_mgt2a.id_classe, m_finance.id_matiere),
            # DIA Mamadou - Génie Logiciel (GL3-A), UML (GL3-B)
            (profs[10], c_gl3a.id_classe, m_gl.id_matiere),
            (profs[10], c_gl3b.id_classe, m_uml.id_matiere),
            # CISS Awa - Marketing (MGT2-A), Management (MGT2-B)
            (profs[11], c_mgt2a.id_classe, m_marketing.id_matiere),
            (profs[11], c_mgt2b.id_classe, m_management.id_matiere),
            # LO Abdoulaye - Structures de Données (GL2-A), Algorithmique Avancée (GL2-B)
            (profs[12], c_gl2a.id_classe, m_sd.id_matiere),
            (profs[12], c_gl2b.id_classe, m_algo_avancee.id_matiere),
            # FAYE Pape - Intelligence Artificielle (GL3-A), Machine Learning (GL3-B)
            (profs[13], c_gl3a.id_classe, m_ia.id_matiere),
            (profs[13], c_gl3b.id_classe, m_ml.id_matiere),
            # NGOM Fatoumata - Probabilités (GL1-B), Statistiques (GL2-A)
            (profs[14], c_gl1b.id_classe, m_proba.id_matiere),
            (profs[14], c_gl2a.id_classe, m_stats.id_matiere),
            # MBAYE Cheikh - Développement Mobile (GL3-A), Android (GL3-B)
            (profs[15], c_gl3a.id_classe, m_dev_mobile.id_matiere),
            (profs[15], c_gl3b.id_classe, m_android.id_matiere),
            # SY Abdou - Administration Réseaux (GL3-A), Cloud Computing (GL3-B)
            (profs[16], c_gl3a.id_classe, m_admin_reseau.id_matiere),
            (profs[16], c_gl3b.id_classe, m_cloud.id_matiere),
            # NDAO Amina - Bases de Données Avancées (GL3-A), Data Warehousing (GL3-B)
            (profs[17], c_gl3a.id_classe, m_bd_avancees.id_matiere),
            (profs[17], c_gl3b.id_classe, m_datawarehouse.id_matiere),
            # DIALLO Mamadou - Python Avancé (GL2-A), Data Science (GL3-A)
            (profs[18], c_gl2a.id_classe, m_python_avance.id_matiere),
            (profs[18], c_gl3a.id_classe, m_data_science.id_matiere),
            # KANE Oumar - Cybersécurité (GL3-A), Cryptographie (GL3-B)
            (profs[19], c_gl3a.id_classe, m_cyber.id_matiere),
            (profs[19], c_gl3b.id_classe, m_crypto.id_matiere),
        ]

        enseignements = []
        for prof, classe_id, matiere_id in enseignements_data:
            ens = Enseignement(professeur_id_professeur=prof.id_professeur, classe_id_classe=classe_id, matiere_id_matiere=matiere_id)
            db.session.add(ens)
            db.session.flush()
            enseignements.append(ens)

        # --- UTILISATEURS: ÉTUDIANTS (100 students) ---
        etudiants_data = [
            # GL1-A (from database2)
            ("alice", "DIALLO", "Alice", "AD001", c_gl1a.id_classe),
            ("bob", "NDIAYE", "Bob", "BN002", c_gl1a.id_classe),
            ("carol", "FALL", "Carol", "CF003", c_gl1a.id_classe),
            ("daouda", "SECK", "Daouda", "DS004", c_gl1a.id_classe),
            ("eve", "MBAYE", "Eve", "EM005", c_gl1a.id_classe),
            ("fatoumata", "GUEYE", "Fatoumata", "FG006", c_gl1a.id_classe),
            ("gabriel", "SARR", "Gabriel", "GS007", c_gl1a.id_classe),
            ("hawa", "THIAM", "Hawa", "HT008", c_gl1a.id_classe),
            ("ibrahima", "DIOP", "Ibrahima", "ID009", c_gl1a.id_classe),
            ("jean", "CAMARA", "Jean", "JC010", c_gl1a.id_classe),
            ("mamadou", "MBAYE", "Mamadou", "MO061", c_gl1a.id_classe),
            ("pape", "NDAO", "Pape", "NP062", c_gl1a.id_classe),
            ("fatou", "CISSE", "Fatou", "CF063", c_gl1a.id_classe),
            ("abdou", "SEYE", "Abdou", "SA064", c_gl1a.id_classe),
            ("awa", "FAYE", "Awa", "FA065", c_gl1a.id_classe),
            ("ibrahima", "GUEYE", "Ibrahima", "GI066", c_gl1a.id_classe),
            ("fatoumata", "THIAM", "Fatoumata", "TF067", c_gl1a.id_classe),
            ("mariam", "DIOUF", "Mariam", "DM068", c_gl1a.id_classe),
            ("abdoulaye", "NGOM", "Abdoulaye", "NA069", c_gl1a.id_classe),
            ("cheikh", "BA", "Cheikh", "BC070", c_gl1a.id_classe),
            
            # GL1-B
            ("khadija", "TOURE", "Khadija", "KT011", c_gl1b.id_classe),
            ("lamine", "BALDE", "Lamine", "LB012", c_gl1b.id_classe),
            ("mariama", "BA", "Mariama", "MB013", c_gl1b.id_classe),
            ("ousmane", "NDAO", "Ousmane", "NO014", c_gl1b.id_classe),
            ("pape", "SY", "Pape", "SP015", c_gl1b.id_classe),
            ("aissatou", "LO", "Aissatou", "LA016", c_gl1b.id_classe),
            ("cheikh", "FAYE", "Cheikh", "FC017", c_gl1b.id_classe),
            ("abdou", "SOW", "Abdou", "SA018", c_gl1b.id_classe),
            ("fatou", "KA", "Fatou", "KF019", c_gl1b.id_classe),
            ("moussa", "GAYE", "Moussa", "GM020", c_gl1b.id_classe),
            
            # GL2-A
            ("awa", "DIOUF", "Awa", "DA021", c_gl2a.id_classe),
            ("mamadou", "NDIAYE", "Mamadou", "NM022", c_gl2a.id_classe),
            ("aminata", "SEYE", "Aminata", "SA023", c_gl2a.id_classe),
            ("cheikh", "DIOP", "Cheikh", "DC024", c_gl2a.id_classe),
            ("fatou", "MBODJ", "Fatou", "MF025", c_gl2a.id_classe),
            ("oumar", "CISSE", "Oumar", "CO026", c_gl2a.id_classe),
            ("marieme", "THIAM", "Marieme", "TM027", c_gl2a.id_classe),
            ("ibrahima", "NGOM", "Ibrahima", "NI028", c_gl2a.id_classe),
            ("aida", "SARR", "Aida", "SA029", c_gl2a.id_classe),
            ("abdoulaye", "FALL", "Abdoulaye", "FA030", c_gl2a.id_classe),
            ("ousmane", "LO", "Ousmane", "LO071", c_gl2a.id_classe),
            ("awa", "SARR", "Awa", "SA072", c_gl2a.id_classe),
            ("mariama", "SY", "Mariama", "SM073", c_gl2a.id_classe),
            ("abdou", "FALL", "Abdou", "FA074", c_gl2a.id_classe),
            ("fatou", "DIOP", "Fatou", "DF075", c_gl2a.id_classe),
            ("ousmane", "CISSE", "Ousmane", "CO076", c_gl2a.id_classe),
            ("marieme", "GAYE", "Marieme", "GM077", c_gl2a.id_classe),
            ("abdou", "THIAM", "Abdou", "TA078", c_gl2a.id_classe),
            ("awa", "NDAO", "Awa", "NA079", c_gl2a.id_classe),
            ("cheikh", "MBODJ", "Cheikh", "MC080", c_gl2a.id_classe),
            
            # GL2-B
            ("khadim", "BA", "Khadim", "BK031", c_gl2b.id_classe),
            ("fatoumata", "NDAO", "Fatoumata", "NF032", c_gl2b.id_classe),
            ("abdou", "DIOP", "Abdou", "DA033", c_gl2b.id_classe),
            ("mariam", "SECK", "Mariam", "SM034", c_gl2b.id_classe),
            ("abdoulaye", "GUEYE", "Abdoulaye", "GA035", c_gl2b.id_classe),
            ("pape", "FALL", "Pape", "FP036", c_gl2b.id_classe),
            ("khadija", "SY", "Khadija", "SK037", c_gl2b.id_classe),
            ("moussa", "SOW", "Moussa", "SM038", c_gl2b.id_classe),
            ("fatou", "LO", "Fatou", "LF039", c_gl2b.id_classe),
            ("ousmane", "FAYE", "Ousmane", "FO040", c_gl2b.id_classe),
            
            # GL3-A
            ("aissatou", "NDIAYE", "Aissatou", "NA041", c_gl3a.id_classe),
            ("ibrahima", "BA", "Ibrahima", "BI042", c_gl3a.id_classe),
            ("cheikh", "DIOUF", "Cheikh", "DC043", c_gl3a.id_classe),
            ("fatou", "SEYE", "Fatou", "SF044", c_gl3a.id_classe),
            ("abdou", "NGOM", "Abdou", "NA045", c_gl3a.id_classe),
            ("mariama", "SARR", "Mariama", "SM046", c_gl3a.id_classe),
            ("ibrahima", "CISSE", "Ibrahima", "CI047", c_gl3a.id_classe),
            ("ousmane", "THIAM", "Ousmane", "TO048", c_gl3a.id_classe),
            ("awa", "KA", "Awa", "KA049", c_gl3a.id_classe),
            ("pape", "GUEYE", "Pape", "GP050", c_gl3a.id_classe),
            ("ousmane", "SECK", "Ousmane", "SO081", c_gl3a.id_classe),
            ("fatou", "DIALLO", "Fatou", "DF082", c_gl3a.id_classe),
            ("mariama", "NDIAYE", "Mariama", "NM083", c_gl3a.id_classe),
            ("abdoulaye", "SOW", "Abdoulaye", "SA084", c_gl3a.id_classe),
            ("ibrahima", "FAYE", "Ibrahima", "FI085", c_gl3a.id_classe),
            ("mariam", "BA", "Mariam", "BM086", c_gl3a.id_classe),
            ("khadija", "LO", "Khadija", "LK087", c_gl3a.id_classe),
            ("abdou", "GUEYE", "Abdou", "GA088", c_gl3a.id_classe),
            ("aissatou", "THIAM", "Aissatou", "TA089", c_gl3a.id_classe),
            ("cheikh", "CISSE", "Cheikh", "CC090", c_gl3a.id_classe),
            
            # GL3-B
            # (currently no students listed in database2 for GL3-B, but class exists)
            
            # MGT1-A
            ("mariama", "DIALLO", "Mariama", "DM051", c_mgt1a.id_classe),
            ("abdou", "NDIAYE", "Abdou", "NA052", c_mgt1a.id_classe),
            ("aissatou", "FALL", "Aissatou", "FA053", c_mgt1a.id_classe),
            ("ibrahima", "SOW", "Ibrahima", "SI054", c_mgt1a.id_classe),
            ("ousmane", "BA", "Ousmane", "BO055", c_mgt1a.id_classe),
            ("fatoumata", "LO", "Fatoumata", "LF056", c_mgt1a.id_classe),
            ("abdou", "GAYE", "Abdou", "GA057", c_mgt1a.id_classe),
            ("marieme", "SECK", "Marieme", "SM058", c_mgt1a.id_classe),
            ("cheikh", "SY", "Cheikh", "SC059", c_mgt1a.id_classe),
            ("khadija", "DIOP", "Khadija", "DK060", c_mgt1a.id_classe),
            ("oumar", "MBAYE", "Oumar", "NO091", c_mgt1a.id_classe),
            ("fatou", "NDIAYE", "Fatou", "MF092", c_mgt1a.id_classe),
            ("abdoulaye", "DIOP", "Abdoulaye", "DA093", c_mgt1a.id_classe),
            ("khadija", "SARR", "Khadija", "SK094", c_mgt1a.id_classe),
            ("ibrahima", "BA", "Ibrahima", "BI095", c_mgt1a.id_classe),
            ("mariama", "LO", "Mariama", "LM096", c_mgt1a.id_classe),
            ("ousmane", "GUEYE", "Ousmane", "GO097", c_mgt1a.id_classe),
            ("fatou", "THIAM", "Fatou", "TF098", c_mgt1a.id_classe),
            ("abdou", "CISSE", "Abdou", "CA099", c_mgt1a.id_classe),
            ("awa", "DIALLO", "Awa", "DA100", c_mgt1a.id_classe),
            
            # MGT1-B
            # (currently no students listed in database2 for MGT1-B)
            
            # MGT2-A
            # (currently no students listed in database2 for MGT2-A)
            
            # MGT2-B
            # (currently no students listed in database2 for MGT2-B)
        ]

        for username_base, nom, prenom, matricule, classe_id in etudiants_data:
            unique_username = f"{username_base}_{matricule.lower()}"
            u = Utilisateur(username=unique_username, nom=nom, prenom=prenom, role="Etudiant")
            u.set_password("etu123")
            db.session.add(u)
            db.session.flush()
            e = Etudiant(matricule=matricule, classe_id_classe=classe_id, utilisateur_id_user=u.id_user)
            db.session.add(e)
            db.session.flush()

            # Add random notes for each student
            # Get teachings for this class
            class_teachings = [ens for ens in enseignements if ens.classe_id_classe == classe_id]
            for ens in class_teachings:
                db.session.add(Note(
                    valeur_note=round(random.uniform(6, 20), 2),
                    etudiant_id_etudiant=e.id_etudiant,
                    enseignement_idenseignement=ens.idenseignement
                ))

        db.session.commit()
        print("Database seeded successfully with data from database2.xlsx!")

if __name__ == "__main__":
    seed_database()
