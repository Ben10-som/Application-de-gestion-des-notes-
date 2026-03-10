from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Filiere, Classe, Etudiant, Utilisateur, Professeur, Enseignement, Matiere
import re

etudiants_bp = Blueprint('etudiants', __name__)

# --- SEED DATABASE (pour initialiser Neon) ---
@etudiants_bp.route('/seed', methods=['POST'])
def seed_database():
    """Route pour initialiser la base de données sur Neon"""
    from app.models import Note
    import random
    
    # Nettoyage complet
    db.drop_all()
    db.create_all()
    
    # Filières
    f_info = Filiere(nom_filiere="Génie Informatique")
    f_mgt = Filiere(nom_filiere="Management & Business")
    db.session.add_all([f_info, f_mgt])
    db.session.flush()
    
    # Classes
    classes_data = [
        ("GL 1-A", f_info.id_filiere), ("GL 1-B", f_info.id_filiere),
        ("GL 2-A", f_info.id_filiere), ("GL 2-B", f_info.id_filiere),
        ("GL 3-A", f_info.id_filiere), ("GL 3-B", f_info.id_filiere),
        ("MGT 1-A", f_mgt.id_filiere), ("MGT 1-B", f_mgt.id_filiere),
        ("MGT 2-A", f_mgt.id_filiere), ("MGT 2-B", f_mgt.id_filiere),
    ]
    classes = {}
    for nom, fid in classes_data:
        c = Classe(nom_classe=nom, filiere_id_filiere=fid)
        db.session.add(c)
        db.session.flush()
        classes[nom] = c
    
    # Matières
    matieres_noms = [
        "Python", "Algorithmique", "Base de Données", "SQL", "Réseaux", "Sécurité",
        "Développement Web", "JavaScript", "Mathématiques", "Statistiques", "Économie", "Gestion",
        "Java", "POO", "Systèmes d'Exploitation", "Linux", "Analyse de Données", "Big Data",
        "Comptabilité", "Finance", "Génie Logiciel", "UML", "Marketing", "Management",
        "Structures de Données", "Algo Avancée", "IA", "Machine Learning", "Probabilités",
        "Développement Mobile", "Android", "Admin Réseaux", "Cloud Computing",
        "BD Avancées", "Data Warehousing", "Python Avancé", "Data Science", "Cybersécurité", "Cryptographie"
    ]
    matieres = {}
    for nom in matieres_noms:
        m = Matiere(nom_matiere=nom, coef=random.randint(2, 4))
        db.session.add(m)
        db.session.flush()
        matieres[nom] = m
    
    # Admins
    u1 = Utilisateur(username="admin", nom="ADMIN", prenom="Système", role="Admin")
    u1.set_password("admin123")
    db.session.add(u1)
    db.session.flush()
    db.session.add(Admin(utilisateur_id_user=u1.id_user))
    
    u2 = Utilisateur(username="admin_acad", nom="ADMIN", prenom="Académique", role="Admin")
    u2.set_password("admin456")
    db.session.add(u2)
    db.session.flush()
    db.session.add(Admin(utilisateur_id_user=u2.id_user))
    
    # Professeurs
    profs_data = [
        ("adiop", "DIOP", "Amadou"), ("fndiaye", "NDIAYE", "Fatou"),
        ("msarr", "SARR", "Moussa"), ("aba", "BA", "Aissatou"),
        ("ifall", "FALL", "Ibrahima"), ("msow", "SOW", "Mariama"),
        ("agueye", "GUEYE", "Abdou"), ("cka", "KA", "Cheikh"),
        ("oseck", "SECK", "Ousmane"), ("ktoure", "TOURE", "Khadija"),
    ]
    profs = []
    for username, nom, prenom in profs_data:
        u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Professeur")
        u.set_password("prof123")
        db.session.add(u)
        db.session.flush()
        p = Professur(specialite="Informatique", utilisateur_id_user=u.id_user)
        db.session.add(p)
        db.session.flush()
        profs.append(p)
    
    # Enseignements
    enseignements = []
    for i, p in enumerate(profs[:5]):
        for cls in [classes["GL 1-A"], classes["GL 1-B"]]:
            matiere = list(matieres.values())[i]
            ens = Enseignement(professeur_id_professeur=p.id_professeur, classe_id_classe=cls.id_classe, matiere_id_matiere=matiere.id_matiere)
            db.session.add(ens)
            db.session.flush()
            enseignements.append(ens)
    
    # Étudiants
    etuds = [
        ("alice", "DIALLO", "Alice", "AD001", "GL 1-A"),
        ("bob", "NDIAYE", "Bob", "BN002", "GL 1-A"),
        ("carol", "FALL", "Carol", "CF003", "GL 1-A"),
        ("daouda", "SECK", "Daouda", "DS004", "GL 1-A"),
        ("eve", "MBAYE", "Eve", "EM005", "GL 1-A"),
        ("khadija", "TOURE", "Khadija", "KT011", "GL 1-B"),
        ("lamine", "BALDE", "Lamine", "LB012", "GL 1-B"),
        ("mariama", "BA", "Mariama", "MB013", "GL 1-B"),
    ]
    for username, nom, prenom, matricule, cls_nom in etuds:
        u = Utilisateur(username=username, nom=nom, prenom=prenom, role="Etudiant")
        u.set_password("etu123")
        db.session.add(u)
        db.session.flush()
        e = Etudiant(matricule=matricule, classe_id_classe=classes[cls_nom].id_classe, utilisateur_id_user=u.id_user)
        db.session.add(e)
        db.session.flush()
        for ens in enseignements[:2]:
            n = Note(valeur_note=round(random.uniform(8, 18), 2), etudiant_id_etudiant=e.id_etudiant, idencryption=ens.idencryption)
            db.session.add(n)
    
    db.session.commit()
    return jsonify({"message": "Base initialisée !"}), 200

# --- GESTION DES FILIÈRES ---
@etudiants_bp.route('/filieres', methods=['GET', 'POST'])
@jwt_required()
def handle_filieres():
    claims = get_jwt()
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        data = request.get_json()
        nom_filiere = data.get('nom_filiere')
        
        if Filiere.query.filter_by(nom_filiere=nom_filiere).first():
            return jsonify({"msg": "Cette filière existe déjà"}), 400
            
        new_filiere = Filiere(nom_filiere=nom_filiere)
        db.session.add(new_filiere)
        db.session.commit()
        return jsonify({"msg": "Filière créée"}), 201
    
    filieres = Filiere.query.all()
    return jsonify([{"id": f.id_filiere, "nom": f.nom_filiere} for f in filieres]), 200

@etudiants_bp.route('/filieres/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modifier_filiere(id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        
    filiere = Filiere.query.get(id)
    if not filiere:
        return jsonify({"msg": "Filière non trouvée"}), 404
        
    if request.method == 'PUT':
        data = request.get_json()
        nouveau_nom = data.get('nom_filiere')
        if Filiere.query.filter(Filiere.nom_filiere == nouveau_nom, Filiere.id_filiere != id).first():
            return jsonify({"msg": "Une autre filière porte déjà ce nom"}), 400
        filiere.nom_filiere = nouveau_nom
        db.session.commit()
        return jsonify({"msg": "Filière modifiée avec succès"}), 200
        
    if request.method == 'DELETE':
        if Classe.query.filter_by(filiere_id_filiere=id).count() > 0:
            return jsonify({"msg": "Impossible de supprimer : cette filière contient des classes"}), 400
        db.session.delete(filiere)
        db.session.commit()
        return jsonify({"msg": "Filière supprimée avec succès"}), 200

# --- GESTION DES CLASSES ---
@etudiants_bp.route('/classes', methods=['GET', 'POST'])
@jwt_required()
def handle_classes():
    claims = get_jwt()
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        data = request.get_json()
        nom_classe = data.get('nom_classe')
        id_filiere = data.get('id_filiere')
        
        if Classe.query.filter_by(nom_classe=nom_classe, filiere_id_filiere=id_filiere).first():
            return jsonify({"msg": "Cette classe existe déjà dans cette filière"}), 400
            
        new_classe = Classe(
            nom_classe=nom_classe,
            filiere_id_filiere=id_filiere
        )
        db.session.add(new_classe)
        db.session.commit()
        return jsonify({"msg": "Classe créée"}), 201

    classes = Classe.query.all()
    return jsonify([{
        "id": c.id_classe, 
        "nom": c.nom_classe, 
        "filiere": c.filiere.nom_filiere,
        "filiere_id": c.filiere_id_filiere
    } for c in classes]), 200

@etudiants_bp.route('/classes/<int:id>', methods=['PUT', 'DELETE'])
@jwt_required()
def modifier_classe(id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        
    classe = Classe.query.get(id)
    if not classe:
        return jsonify({"msg": "Classe non trouvée"}), 404
        
    if request.method == 'PUT':
        data = request.get_json()
        nom_classe = data.get('nom_classe')
        id_filiere = data.get('id_filiere')
        
        if Classe.query.filter(Classe.nom_classe == nom_classe, Classe.filiere_id_filiere == id_filiere, Classe.id_classe != id).first():
            return jsonify({"msg": "Une autre classe porte déjà ce nom dans cette filière"}), 400
            
        classe.nom_classe = nom_classe
        classe.filiere_id_filiere = id_filiere
        db.session.commit()
        return jsonify({"msg": "Classe modifiée avec succès"}), 200
        
    if request.method == 'DELETE':
        if Etudiant.query.filter_by(classe_id_classe=id).count() > 0:
            return jsonify({"msg": "Impossible de supprimer : cette classe contient des étudiants"}), 400
        if Enseignement.query.filter_by(classe_id_classe=id).count() > 0:
            return jsonify({"msg": "Impossible de supprimer : cette classe est liée à des enseignements"}), 400
        db.session.delete(classe)
        db.session.commit()
        return jsonify({"msg": "Classe supprimée avec succès"}), 200

# --- LISTE DE TOUS LES ÉTUDIANTS (Admin) ---
@etudiants_bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_etudiants():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Accès non autorisé"}), 403
    etudiants = Etudiant.query.all()
    return jsonify([{
        "id": e.id_etudiant,
        "matricule": e.matricule,
        "nom": e.utilisateur.nom,
        "prenom": e.utilisateur.prenom,
        "username": e.utilisateur.username,
        "classe": e.classe.nom_classe if e.classe else None,
        "filiere": e.classe.filiere.nom_filiere if e.classe and e.classe.filiere else None,
    } for e in etudiants]), 200

# --- LISTE DES ÉTUDIANTS PAR CLASSE ---
@etudiants_bp.route('/classe/<int:id_classe>', methods=['GET'])
@jwt_required()
def get_etudiants_par_classe(id_classe):
    etudiants = Etudiant.query.filter_by(classe_id_classe=id_classe).all()
    return jsonify([{
        "id": e.id_etudiant,
        "matricule": e.matricule,
        "nom": e.utilisateur.nom,
        "prenom": e.utilisateur.prenom
    } for e in etudiants]), 200

# --- GESTION DES MATIÈRES ---
@etudiants_bp.route('/matieres', methods=['GET', 'POST'])
@jwt_required()
def handle_matieres():
    claims = get_jwt()
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        data = request.get_json()
        nom = data.get('nom_matiere')
        coef = data.get('coef', 1)
        
        if Matiere.query.filter_by(nom_matiere=nom).first():
            return jsonify({"msg": "Cette matière existe déjà"}), 400
            
        new_matiere = Matiere(nom_matiere=nom, coef=coef)
        db.session.add(new_matiere)
        db.session.commit()
        return jsonify({"msg": "Matière créée"}), 201
    
    matieres = Matiere.query.all()
    return jsonify([{"id": m.id_matiere, "nom": m.nom_matiere, "coef": m.coef} for m in matieres]), 200

# --- CRÉATION ÉTUDIANT ---
@etudiants_bp.route('/creer', methods=['POST'])
@jwt_required()
def creer_etudiant():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
    
    data = request.get_json()
    username = data.get('username')
    nom = data.get('nom')
    prenom = data.get('prenom')
    matricule = data.get('matricule')
    id_classe = data.get('id_classe')
    password = data.get('password')

    if not all([username, nom, prenom, matricule, id_classe, password]):
        return jsonify({"msg": "Données manquantes"}), 400

    if Utilisateur.query.filter_by(username=username).first():
        return jsonify({"msg": "Cet identifiant (username) est déjà utilisé"}), 400

    if Etudiant.query.filter_by(matricule=matricule).first():
        return jsonify({"msg": "Ce matricule existe déjà"}), 400

    try:
        # Create User
        new_user = Utilisateur(username=username, nom=nom, prenom=prenom, role='Etudiant')
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()

        # Create Etudiant
        new_etu = Etudiant(
            matricule=matricule,
            classe_id_classe=id_classe,
            utilisateur_id_user=new_user.id_user
        )
        db.session.add(new_etu)
        db.session.commit()
        return jsonify({"msg": "Étudiant créé avec succès"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": f"Erreur lors de la création : {str(e)}"}), 500

# --- GESTION DES PROFESSEURS ---
@etudiants_bp.route('/professeurs', methods=['GET', 'POST'])
@jwt_required()
def handle_professeurs():
    claims = get_jwt()
    
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
            
        data = request.get_json()
        username = data.get('username')
        nom = data.get('nom')
        prenom = data.get('prenom')
        specialite = data.get('specialite')
        password = data.get('password')
        enseignements = data.get('enseignements', []) # Liste de {id_classe, id_matiere}
        
        if not all([username, nom, prenom, specialite, password]):
            return jsonify({"msg": "Données manquantes"}), 400
            
        if Utilisateur.query.filter_by(username=username).first():
            return jsonify({"msg": "Cet identifiant (username) est déjà utilisé"}), 400

        try:
            new_user = Utilisateur(username=username, nom=nom, prenom=prenom, role='Professeur')
            new_user.set_password(password)
            db.session.add(new_user)
            db.session.flush()
            
            new_prof = Professeur(
                specialite=specialite,
                utilisateur_id_user=new_user.id_user
            )
            db.session.add(new_prof)
            db.session.flush()

            # Affectation des matières/classes
            for ens in enseignements:
                id_classe = ens.get('id_classe')
                id_matiere = ens.get('id_matiere')
                if id_classe and id_matiere:
                    # Vérifier si cet enseignement existe déjà (doublon)
                    existing = Enseignement.query.filter_by(
                        classe_id_classe=id_classe,
                        matiere_id_matiere=id_matiere
                    ).first()
                    if existing:
                        db.session.rollback()
                        return jsonify({"msg": f"L'enseignement (Classe ID {id_classe}, Matière ID {id_matiere}) est déjà attribué à un autre professeur."}), 400
                        
                    nouveau_cours = Enseignement(
                        professeur_id_professeur=new_prof.id_professeur,
                        classe_id_classe=id_classe,
                        matiere_id_matiere=id_matiere
                    )
                    db.session.add(nouveau_cours)
            
            db.session.commit()
            return jsonify({"msg": "Professeur créé et matières affectées avec succès"}), 201
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"Erreur lors de la création : {str(e)}"}), 500

    professeurs = Professeur.query.all()
    result = []
    for p in professeurs:
        ens_list = []
        for ens in p.enseignements:
            ens_list.append({
                "classe": ens.classe.nom_classe,
                "matiere": ens.matiere.nom_matiere
            })
        result.append({
            "id": p.id_professeur,
            "username": p.utilisateur.username,
            "nom": p.utilisateur.nom,
            "prenom": p.utilisateur.prenom,
            "specialite": p.specialite,
            "enseignements": ens_list
        })
    return jsonify(result), 200

@etudiants_bp.route('/professeurs/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_professeur(id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        
    prof = Professeur.query.get(id)
    if not prof:
        return jsonify({"msg": "Professeur non trouvé"}), 404
        
    if Enseignement.query.filter_by(professeur_id_professeur=id).count() > 0:
        return jsonify({"msg": "Impossible de supprimer : ce professeur a des enseignements assignés"}), 400
        
    utilisateur = prof.utilisateur
    db.session.delete(prof)
    if utilisateur:
        db.session.delete(utilisateur)
    db.session.commit()
    return jsonify({"msg": "Professeur supprimé avec succès"}), 200
