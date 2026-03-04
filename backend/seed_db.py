from app import create_app, db
from app.models import Utilisateur, Etudiant, Professeur, Admin, Classe, Filiere, Matiere, Enseignement

app = create_app()

with app.app_context():
    db.create_all()

    # Filiere / Classe
    if not Filiere.query.first():
        f = Filiere(nom_filiere="Informatique")
        db.session.add(f)
        db.session.flush()
        c = Classe(nom_classe="Info1", filiere_id_filiere=f.id_filiere)
        db.session.add(c)
        db.session.flush()

        # Users
        u_admin = Utilisateur(nom="Admin", prenom="Super", role="Admin")
        u_admin.set_password("admin123")
        db.session.add(u_admin)
        db.session.flush()
        db.session.add(Admin(utilisateur_id_user=u_admin.id_user))

        u_prof = Utilisateur(nom="Prof", prenom="Test", role="Professeur")
        u_prof.set_password("prof123")
        db.session.add(u_prof)
        db.session.flush()
        db.session.add(Professeur(specialite="Dev", utilisateur_id_user=u_prof.id_user))

        u_etu = Utilisateur(nom="Etu", prenom="Test", role="Etudiant")
        u_etu.set_password("etu123")
        db.session.add(u_etu)
        db.session.flush()
        db.session.add(Etudiant(matricule="E001", classe_id_classe=c.id_classe, utilisateur_id_user=u_etu.id_user))

        db.session.commit()
        print("Database seeded with Admin, Prof, Etu!")
    else:
        print("Already seeded.")
