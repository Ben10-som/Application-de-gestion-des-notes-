import sys
import os
from dotenv import load_dotenv
import sqlalchemy

# Ajouter le dossier backend au path pour pouvoir importer config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from config import Config

def test_connection():
    try:
        engine = sqlalchemy.create_engine(Config.SQLALCHEMY_DATABASE_URI)
        connection = engine.connect()
        print("✅ Connexion à la base de données réussie !")
        connection.close()
    except Exception as e:
        print(f"❌ Erreur de connexion : {e}")
        print("\nConseil : Assurez-vous que PostgreSQL est lancé et que la DB 'gestion_notes' existe.")

if __name__ == "__main__":
    test_connection()
