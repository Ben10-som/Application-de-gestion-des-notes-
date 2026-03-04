from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from app.models import db, Note, Etudiant, Professeur, Enseignement, Matiere, Utilisateur
from app.utils.pdf_generator import generate_bulletin_pdf
import io
from datetime import datetime

notes_bp = Blueprint('notes', __name__)

@notes_bp.route('/bulletin', methods=['GET'])
@jwt_required()
def telecharger_bulletin():
    """Génère et renvoie le bulletin PDF de l'étudiant connecté"""
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'Etudiant':
        return jsonify({"msg": "Accès réservé aux étudiants"}), 403

    etudiant = Etudiant.query.filter_by(utilisateur_id_user=identity).first()
    if not etudiant:
        return jsonify({"msg": "Profil étudiant non trouvé"}), 404

    pdf_content = generate_bulletin_pdf(etudiant.id_etudiant)
    
    return send_file(
        io.BytesIO(pdf_content),
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f"Bulletin_{etudiant.matricule}.pdf"
    )

@notes_bp.route('/saisir', methods=['POST'])
@jwt_required()
def saisir_note():
    """
    Saisie d'une note par un professeur.
    Payload: { id_etudiant, id_enseignement, valeur_note }
    """
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'Professeur':
        return jsonify({"msg": "Accès réservé aux professeurs"}), 403

    data = request.get_json()
    prof = Professeur.query.filter_by(utilisateur_id_user=identity).first()
    
    # Vérification que le prof enseigne bien ce cours
    enseignement = Enseignement.query.get(data.get('id_enseignement'))
    if not enseignement or enseignement.professeur_id_professeur != prof.id_professeur:
        return jsonify({"msg": "Vous n'êtes pas autorisé à noter ce cours"}), 403

    # Création ou mise à jour de la note
    note = Note.query.filter_by(
        etudiant_id_etudiant=data.get('id_etudiant'),
        enseignement_idenseignement=data.get('id_enseignement')
    ).first()

    if note:
        note.valeur_note = data.get('valeur_note')
        note.date_saisie = datetime.utcnow()
    else:
        note = Note(
            valeur_note=data.get('valeur_note'),
            etudiant_id_etudiant=data.get('id_etudiant'),
            enseignement_idenseignement=data.get('id_enseignement')
        )
        db.session.add(note)

    db.session.commit()
    return jsonify({"msg": "Note enregistrée avec succès"}), 200

@notes_bp.route('/mes-notes', methods=['GET'])
@jwt_required()
def mes_notes():
    """Récupère les notes de l'étudiant connecté"""
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'Etudiant':
        return jsonify({"msg": "Accès réservé aux étudiants"}), 403

    etudiant = Etudiant.query.filter_by(utilisateur_id_user=identity).first()
    notes = Note.query.filter_by(etudiant_id_etudiant=etudiant.id_etudiant).all()

    result = []
    for n in notes:
        ens = n.enseignement
        result.append({
            "matiere": ens.matiere.nom_matiere,
            "coef": ens.matiere.coef,
            "note": n.valeur_note,
            "date": n.date_saisie.strftime('%d/%m/%Y'),
            "professeur": f"{ens.professeur.utilisateur.nom} {ens.professeur.utilisateur.prenom}"
        })

    return jsonify(result), 200

@notes_bp.route('/classe/<int:id_classe>/matiere/<int:id_matiere>', methods=['GET'])
@jwt_required()
def liste_notes_classe(id_classe, id_matiere):
    """Retourne la liste des étudiants d'une classe avec leurs notes actuelles pour une matière"""
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') not in ['Professeur', 'Admin']:
        return jsonify({"msg": "Accès non autorisé"}), 403

    # Trouver l'enseignement correspondant
    enseignement = Enseignement.query.filter_by(
        classe_id_classe=id_classe, 
        matiere_id_matiere=id_matiere
    ).first()

    if not enseignement:
        return jsonify({"msg": "Aucun enseignement trouvé pour cette classe/matière"}), 404

    etudiants = Etudiant.query.filter_by(classe_id_classe=id_classe).all()
    result = []
    for etu in etudiants:
        note = Note.query.filter_by(
            etudiant_id_etudiant=etu.id_etudiant,
            enseignement_idenseignement=enseignement.idenseignement
        ).first()
        
        result.append({
            "id_etudiant": etu.id_etudiant,
            "nom": etu.utilisateur.nom,
            "prenom": etu.utilisateur.prenom,
            "matricule": etu.matricule,
            "note": note.valeur_note if note else None,
            "id_enseignement": enseignement.idenseignement
        })

    return jsonify(result), 200
