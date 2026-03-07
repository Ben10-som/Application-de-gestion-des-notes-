from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Filiere, Classe, Etudiant, Utilisateur, Professeur, Enseignement
import re

etudiants_bp = Blueprint('etudiants', __name__)

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

# --- CRÉATION ÉTUDIANT ---
@etudiants_bp.route('/creer', methods=['POST'])
@jwt_required()
def creer_etudiant():
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
    
    data = request.get_json()
    nom = data.get('nom')
    prenom = data.get('prenom')
    matricule = data.get('matricule')
    id_classe = data.get('id_classe')
    password = data.get('password')
    username = data.get('username')

    if not all([nom, prenom, matricule, id_classe, password, username]):
        return jsonify({"msg": "Données manquantes"}), 400

    if not re.match(r'^[a-zA-Z]{2}\d{3}$', matricule):
        return jsonify({"msg": "Format de matricule invalide. Ex: AB123"}), 400
        
    if not re.match(r'^[a-zA-Z\s\-]+$', nom) or not re.match(r'^[a-zA-Z\s\-]+$', prenom):
        return jsonify({"msg": "Le nom et le prénom ne doivent contenir que des lettres."}), 400

    if Etudiant.query.filter_by(matricule=matricule).first():
        return jsonify({"msg": "Ce matricule existe déjà"}), 400

    if Utilisateur.query.filter_by(nom=username, role='Etudiant').first(): # we use nom field for username
        return jsonify({"msg": "Ce nom d'utilisateur existe déjà"}), 400

    # We store the login "username" in the "nom" field of Utilisateur? 
    # Wait, the DB models Utilisateur has `nom` and `prenom`. 
    # If the app expects user to log in with `nom` and `prenom`, we should enforce unique nom+prenom
    if Utilisateur.query.filter_by(nom=nom, prenom=prenom).first():
        return jsonify({"msg": "Un utilisateur avec ce nom et prénom existe déjà"}), 400

    # Create User
    new_user = Utilisateur(nom=nom, prenom=prenom, role='Etudiant')
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

@etudiants_bp.route('/etudiants/<int:id>', methods=['DELETE'])
@jwt_required()
def supprimer_etudiant(id):
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        
    etudiant = Etudiant.query.get(id)
    if not etudiant:
        return jsonify({"msg": "Étudiant non trouvé"}), 404
        
    utilisateur = etudiant.utilisateur
    db.session.delete(etudiant)
    if utilisateur:
        db.session.delete(utilisateur)
    db.session.commit()
    return jsonify({"msg": "Étudiant supprimé avec succès"}), 200

# --- GESTION DES PROFESSEURS ---
@etudiants_bp.route('/professeurs', methods=['GET', 'POST'])
@jwt_required()
def handle_professeurs():
    claims = get_jwt()
    
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
            
        data = request.get_json()
        nom = data.get('nom')
        prenom = data.get('prenom')
        specialite = data.get('specialite')
        password = data.get('password')
        
        if not all([nom, prenom, specialite, password]):
            return jsonify({"msg": "Données manquantes"}), 400
            
        if not re.match(r'^[a-zA-Z\s\-]+$', nom) or not re.match(r'^[a-zA-Z\s\-]+$', prenom):
            return jsonify({"msg": "Le nom et le prénom ne doivent contenir que des lettres."}), 400

        if Utilisateur.query.filter_by(nom=nom, prenom=prenom).first():
            return jsonify({"msg": "Ce professeur (nom et prénom) existe déjà"}), 400
            
        new_user = Utilisateur(nom=nom, prenom=prenom, role='Professeur')
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.flush()
        
        new_prof = Professeur(
            specialite=specialite,
            utilisateur_id_user=new_user.id_user
        )
        db.session.add(new_prof)
        db.session.commit()
        
        return jsonify({"msg": "Professeur créé"}), 201

    professeurs = Professeur.query.all()
    return jsonify([{
        "id": p.id_professeur,
        "nom": p.utilisateur.nom,
        "prenom": p.utilisateur.prenom,
        "specialite": p.specialite
    } for p in professeurs]), 200

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
