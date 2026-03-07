from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required, get_jwt
from app.models import db, Utilisateur, Etudiant, Professeur, Admin

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Crée un nouvel utilisateur.
    Payload: { nom, prenom, mot_de_passe, role, matricule (si etudiant), specialite (si prof) }
    """
    data = request.get_json()
    
    if Utilisateur.query.filter_by(nom=data.get('nom'), prenom=data.get('prenom')).first():
        return jsonify({"msg": "Cet utilisateur existe déjà"}), 400

    new_user = Utilisateur(
        nom=data.get('nom'),
        prenom=data.get('prenom'),
        role=data.get('role')
    )
    new_user.set_password(data.get('mot_de_passe'))
    
    db.session.add(new_user)
    db.session.flush() # Pour récupérer l'ID de l'utilisateur

    # Création de l'entité spécifique au rôle
    if data.get('role') == 'Etudiant':
        etudiant = Etudiant(
            matricule=data.get('matricule'),
            classe_id_classe=data.get('id_classe'),
            utilisateur_id_user=new_user.id_user
        )
        db.session.add(etudiant)
    elif data.get('role') == 'Professeur':
        professeur = Professeur(
            specialite=data.get('specialite'),
            utilisateur_id_user=new_user.id_user
        )
        db.session.add(professeur)
    elif data.get('role') == 'Admin':
        admin = Admin(utilisateur_id_user=new_user.id_user)
        db.session.add(admin)

    db.session.commit()
    return jsonify({"msg": "Utilisateur créé avec succès"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authentifie un utilisateur et retourne un Token JWT.
    Payload: { username, mot_de_passe }
    """
    data = request.get_json()
    user = Utilisateur.query.filter_by(username=data.get('username')).first()

    if user and user.check_password(data.get('mot_de_passe')):
        access_token = create_access_token(
            identity=str(user.id_user),
            additional_claims={"role": user.role}
        )
        return jsonify({
            "access_token": access_token,
            "user": {
                "id": user.id_user,
                "username": user.username,
                "nom": user.nom,
                "prenom": user.prenom,
                "role": user.role
            }
        }), 200
    
    return jsonify({"msg": "Identifiants incorrects"}), 401

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Retourne les infos de l'utilisateur connecté"""
    current_user_id = get_jwt_identity()
    user = Utilisateur.query.get(current_user_id)
    return jsonify({
        "id": user.id_user,
        "nom": user.nom,
        "prenom": user.prenom,
        "role": user.role
    }), 200
