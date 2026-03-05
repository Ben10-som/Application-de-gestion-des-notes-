from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt
from app.models import db, Utilisateur, Etudiant, Professeur, Classe, Filiere, Note, Enseignement, Matiere
from sqlalchemy import func

stats_bp = Blueprint('stats', __name__)


@stats_bp.route('/admin', methods=['GET'])
@jwt_required()
def admin_stats():
    """Statistiques globales pour l'administrateur."""
    claims = get_jwt()
    if claims.get('role') != 'Admin':
        return jsonify({"msg": "Accès non autorisé"}), 403

    nb_etudiants = Etudiant.query.count()
    nb_profs = Professeur.query.count()
    nb_classes = Classe.query.count()

    # Moyenne générale de toutes les notes
    moyenne = db.session.query(func.avg(Note.valeur_note)).scalar()
    moyenne = round(float(moyenne), 2) if moyenne else 0

    # Taux de réussite (>= 10/20)
    notes_réussies = Note.query.filter(Note.valeur_note >= 10).count()
    nb_notes = Note.query.count()
    taux_reussite = round((notes_réussies / nb_notes * 100), 1) if nb_notes > 0 else 0

    # Répartition étudiants par filière
    filieres = Filiere.query.all()
    repartition_filieres = []
    for f in filieres:
        count = db.session.query(func.count(Etudiant.id_etudiant)).join(
            Classe, Etudiant.classe_id_classe == Classe.id_classe
        ).filter(Classe.filiere_id_filiere == f.id_filiere).scalar()
        repartition_filieres.append({"filiere": f.nom_filiere, "count": count or 0})

    # Moyennes par classe
    classes = Classe.query.all()
    moyennes_classes = []
    for c in classes:
        etudiants = Etudiant.query.filter_by(classe_id_classe=c.id_classe).all()
        all_notes = []
        for etu in etudiants:
            notes = Note.query.filter_by(etudiant_id_etudiant=etu.id_etudiant).all()
            all_notes.extend([n.valeur_note for n in notes])
        moy = round(sum(all_notes) / len(all_notes), 2) if all_notes else 0
        moyennes_classes.append({"classe": c.nom_classe, "moyenne": moy, "nb_etudiants": len(etudiants)})

    return jsonify({
        "nb_etudiants": nb_etudiants,
        "nb_profs": nb_profs,
        "nb_classes": nb_classes,
        "moyenne_generale": moyenne,
        "taux_reussite": taux_reussite,
        "repartition_filieres": repartition_filieres,
        "moyennes_classes": moyennes_classes
    }), 200


@stats_bp.route('/classe/<int:id_classe>', methods=['GET'])
@jwt_required()
def classe_stats(id_classe):
    """Statistiques pour une classe donnée."""
    claims = get_jwt()
    if claims.get('role') not in ['Admin', 'Professeur']:
        return jsonify({"msg": "Accès non autorisé"}), 403

    classe = Classe.query.get_or_404(id_classe)
    etudiants = Etudiant.query.filter_by(classe_id_classe=id_classe).all()

    # Répartition des notes par tranche
    tranches = {"0-5": 0, "5-10": 0, "10-15": 0, "15-20": 0}
    toutes_notes = []
    for etu in etudiants:
        notes = Note.query.filter_by(etudiant_id_etudiant=etu.id_etudiant).all()
        for n in notes:
            toutes_notes.append(n.valeur_note)
            if n.valeur_note < 5:
                tranches["0-5"] += 1
            elif n.valeur_note < 10:
                tranches["5-10"] += 1
            elif n.valeur_note < 15:
                tranches["10-15"] += 1
            else:
                tranches["15-20"] += 1

    moy = round(sum(toutes_notes) / len(toutes_notes), 2) if toutes_notes else 0
    taux = round(len([n for n in toutes_notes if n >= 10]) / len(toutes_notes) * 100, 1) if toutes_notes else 0

    # Performances par matière
    enseignements = Enseignement.query.filter_by(classe_id_classe=id_classe).all()
    stats_matiere = []
    for ens in enseignements:
        notes = Note.query.filter_by(enseignement_idenseignement=ens.idenseignement).all()
        vals = [n.valeur_note for n in notes]
        moy_mat = round(sum(vals) / len(vals), 2) if vals else 0
        stats_matiere.append({
            "matiere": ens.matiere.nom_matiere,
            "moyenne": moy_mat,
            "nb_notes": len(vals)
        })

    return jsonify({
        "classe": classe.nom_classe,
        "filiere": classe.filiere.nom_filiere,
        "nb_etudiants": len(etudiants),
        "moyenne": moy,
        "taux_reussite": taux,
        "repartition_notes": [{"tranche": k, "count": v} for k, v in tranches.items()],
        "stats_par_matiere": stats_matiere
    }), 200


@stats_bp.route('/etudiant', methods=['GET'])
@jwt_required()
def etudiant_stats():
    """Statistiques personnelles pour l'étudiant connecté."""
    from flask_jwt_extended import get_jwt_identity
    identity = get_jwt_identity()
    claims = get_jwt()
    if claims.get('role') != 'Etudiant':
        return jsonify({"msg": "Accès réservé aux étudiants"}), 403

    etudiant = Etudiant.query.filter_by(utilisateur_id_user=identity).first()
    if not etudiant:
        return jsonify({"msg": "Profil étudiant introuvable"}), 404

    notes = Note.query.filter_by(etudiant_id_etudiant=etudiant.id_etudiant).all()
    result = []
    total_notes = []
    for n in notes:
        ens = n.enseignement
        matiere = ens.matiere
        result.append({
            "matiere": matiere.nom_matiere,
            "coef": matiere.coef,
            "note": n.valeur_note,
            "date": n.date_saisie.strftime('%Y-%m-%d')
        })
        total_notes.append(n.valeur_note)

    moy = round(sum(total_notes) / len(total_notes), 2) if total_notes else 0
    rang = None  # Pourrait être calculé plus tard

    return jsonify({
        "nom": etudiant.utilisateur.nom,
        "prenom": etudiant.utilisateur.prenom,
        "matricule": etudiant.matricule,
        "classe": etudiant.classe.nom_classe,
        "notes": result,
        "moyenne_generale": moy
    }), 200
