from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import bcrypt

db = SQLAlchemy()

class Utilisateur(db.Model):
    __tablename__ = 'utilisateur'
    id_user = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False)
    prenom = db.Column(db.String(100), nullable=False)
    mot_de_passe = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # 'Admin', 'Professeur', 'Etudiant'

    def set_password(self, password):
        self.mot_de_passe = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.mot_de_passe.encode('utf-8'))

class Filiere(db.Model):
    __tablename__ = 'filiere'
    id_filiere = db.Column(db.Integer, primary_key=True)
    nom_filiere = db.Column(db.String(100), nullable=False)
    classes = db.relationship('Classe', backref='filiere', lazy=True)

class Classe(db.Model):
    __tablename__ = 'classe'
    id_classe = db.Column(db.Integer, primary_key=True)
    nom_classe = db.Column(db.String(100), nullable=False)
    filiere_id_filiere = db.Column(db.Integer, db.ForeignKey('filiere.id_filiere'), nullable=False)
    etudiants = db.relationship('Etudiant', backref='classe', lazy=True)
    enseignements = db.relationship('Enseignement', backref='classe', lazy=True)

class Etudiant(db.Model):
    __tablename__ = 'etudiant'
    id_etudiant = db.Column(db.Integer, primary_key=True)
    matricule = db.Column(db.String(50), unique=True, nullable=False)
    classe_id_classe = db.Column(db.Integer, db.ForeignKey('classe.id_classe'), nullable=False)
    utilisateur_id_user = db.Column(db.Integer, db.ForeignKey('utilisateur.id_user'), nullable=False)
    utilisateur = db.relationship('Utilisateur', backref=db.backref('etudiant', uselist=False))
    notes = db.relationship('Note', backref='etudiant', lazy=True)

class Professeur(db.Model):
    __tablename__ = 'professeur'
    id_professeur = db.Column(db.Integer, primary_key=True)
    specialite = db.Column(db.String(100))
    utilisateur_id_user = db.Column(db.Integer, db.ForeignKey('utilisateur.id_user'), nullable=False)
    utilisateur = db.relationship('Utilisateur', backref=db.backref('professeur', uselist=False))
    enseignements = db.relationship('Enseignement', backref='professeur', lazy=True)

class Admin(db.Model):
    __tablename__ = 'admin'
    id_admin = db.Column(db.Integer, primary_key=True)
    utilisateur_id_user = db.Column(db.Integer, db.ForeignKey('utilisateur.id_user'), nullable=False)
    utilisateur = db.relationship('Utilisateur', backref=db.backref('admin', uselist=False))

class Matiere(db.Model):
    __tablename__ = 'matiere'
    id_matiere = db.Column(db.Integer, primary_key=True)
    nom_matiere = db.Column(db.String(100), nullable=False)
    coef = db.Column(db.Integer, default=1)
    enseignements = db.relationship('Enseignement', backref='matiere', lazy=True)

class Enseignement(db.Model):
    __tablename__ = 'enseignement'
    idenseignement = db.Column(db.Integer, primary_key=True)
    matiere_id_matiere = db.Column(db.Integer, db.ForeignKey('matiere.id_matiere'), nullable=False)
    professeur_id_professeur = db.Column(db.Integer, db.ForeignKey('professeur.id_professeur'), nullable=False)
    classe_id_classe = db.Column(db.Integer, db.ForeignKey('classe.id_classe'), nullable=False)
    notes = db.relationship('Note', backref='enseignement', lazy=True)

class Note(db.Model):
    __tablename__ = 'note'
    id_note = db.Column(db.Integer, primary_key=True)
    valeur_note = db.Column(db.Float, nullable=False)
    date_saisie = db.Column(db.DateTime, default=datetime.utcnow)
    etudiant_id_etudiant = db.Column(db.Integer, db.ForeignKey('etudiant.id_etudiant'), nullable=False)
    enseignement_idenseignement = db.Column(db.Integer, db.ForeignKey('enseignement.idenseignement'), nullable=False)
