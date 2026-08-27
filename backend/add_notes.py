from app import create_app, db
from app.models import Etudiant, Enseignement, Note
import random

app = create_app()

def add_notes():
    with app.app_context():
        print("Loading data...")
        
        ens_list = Enseignement.query.all()
        etu_list = Etudiant.query.order_by(Etudiant.id_etudiant).all()
        
        print(f"Found {len(ens_list)} teachings, {len(etu_list)} students")
        
        count = 0
        
        for e in ens_list:
            ens_id = e.id_matière
            
            for s in etu_list:
                stu_id = s.id_etudiant
                val = round(random.uniform(8, 20), 2)
                
                # Check if exists
                exist = Note.query.filter_by(
                    etudiant_id_etudiant=stu_id,
                    enseignement_id_matière=ens_id
                ).first()
                
                if not exist:
                    n = Note(
                        valeur_note=val,
                        etudiant_id_etudiant=stu_id,
                        enseignement_id_matière=ens_id
                    )
                    db.session.add(n)
                    count += 1
        
        db.session.commit()
        print(f"Done! {count} notes added!")

if __name__ == "__main__":
    add_notes()
