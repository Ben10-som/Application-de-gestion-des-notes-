from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Filiere, Classe, Etudiant, Utilisateur

etudiants_bp = Blueprint('etudiants', __name__)

# --- GESTION DES FILIÈRES ---
@etudiants_bp.route('/filieres', methods=['GET', 'POST'])
@jwt_required()
def handle_filieres():
    identity = get_jwt_identity()
    claims = get_jwt()
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        data = request.get_json()
        new_filiere = Filiere(nom_filiere=data.get('nom_filiere'))
        db.session.add(new_filiere)
        db.session.commit()
        return jsonify({"msg": "Filière créée"}), 201
    
    filieres = Filiere.query.all()
    return jsonify([{"id": f.id_filiere, "nom": f.nom_filiere} for f in filieres]), 200

# --- GESTION DES CLASSES ---
@etudiants_bp.route('/classes', methods=['GET', 'POST'])
@jwt_required()
def handle_classes():
    identity = get_jwt_identity()
    claims = get_jwt()
    if request.method == 'POST':
        if claims.get('role') != 'Admin':
            return jsonify({"msg": "Action réservée à l'administrateur"}), 403
        data = request.get_json()
        new_classe = Classe(
            nom_classe=data.get('nom_classe'),
            filiere_id_filiere=data.get('id_filiere')
        )
        db.session.add(new_classe)
        db.session.commit()
        return jsonify({"msg": "Classe créée"}), 201

    classes = Classe.query.all()
    return jsonify([{
        "id": c.id_classe, 
        "nom": c.nom_classe, 
        "filiere": c.filiere.nom_filiere
    } for c in classes]), 200

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
