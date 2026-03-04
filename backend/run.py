from app import create_app, db

app = create_app()

if __name__ == '__main__':
    with app.app_context():
        # Crée les tables si elles n'existent pas (utile pour le premier lancement)
        db.create_all()
    app.run(host='0.0.0.0', port=5001, debug=True)
