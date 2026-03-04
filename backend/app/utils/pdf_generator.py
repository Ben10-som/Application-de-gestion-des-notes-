import io
from app.models import Note, Etudiant
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_bulletin_pdf(etudiant_id):
    etudiant = Etudiant.query.get(etudiant_id)
    if not etudiant:
        raise ValueError("Etudiant non trouvé.")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    
    styles = getSampleStyleSheet()
    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    normal_style = styles['Normal']
    normal_style.fontSize = 11
    
    bold_style = ParagraphStyle('Bold', parent=normal_style, fontName='Helvetica-Bold')

    elements = []

    # En-tête
    elements.append(Paragraph("BULLETIN DE NOTES", title_style))
    elements.append(Paragraph("Année Académique 2025-2026", ParagraphStyle('Subtitle', parent=normal_style, alignment=1)))
    elements.append(Spacer(1, 40))

    # Informations de l'étudiant
    elements.append(Paragraph(f"<b>Nom :</b> {etudiant.utilisateur.nom} {etudiant.utilisateur.prenom}", normal_style))
    elements.append(Paragraph(f"<b>Matricule :</b> {etudiant.matricule}", normal_style))
    elements.append(Paragraph(f"<b>Classe :</b> {etudiant.classe.nom_classe}", normal_style))
    elements.append(Paragraph(f"<b>Filière :</b> {etudiant.classe.filiere.nom_filiere}", normal_style))
    elements.append(Spacer(1, 20))

    # Tableau des notes
    notes_data = [["Matière", "Coefficient", "Note", "Note Pondérée"]]
    total_points = 0
    total_coefs = 0

    for n in etudiant.notes:
        ens = n.enseignement
        matiere_nom = ens.matiere.nom_matiere
        coef = ens.matiere.coef
        note_valeur = n.valeur_note
        ponderee = note_valeur * coef

        notes_data.append([
            matiere_nom, 
            str(coef), 
            f"{note_valeur:.1f} / 20", 
            f"{ponderee:.1f}"
        ])
        
        total_points += ponderee
        total_coefs += coef

    moyenne = round(total_points / total_coefs, 2) if total_coefs > 0 else 0

    table = Table(notes_data, colWidths=[200, 80, 80, 100])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f2f2f2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    elements.append(Spacer(1, 40))

    # Moyenne générale
    elements.append(Paragraph(f"MOYENNE GÉNÉRALE : {moyenne} / 20", ParagraphStyle('Moyenne', parent=normal_style, fontName='Helvetica-Bold', fontSize=14, alignment=2)))

    doc.build(elements)
    
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content
