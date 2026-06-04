import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, HRFlowable
from reportlab.lib.colors import HexColor
from app.models.screening import ScreeningRecord

def generate_pdf(record: ScreeningRecord) -> bytes:
    """
    Generates a clinical PDF report for a Diabetic Retinopathy screening session.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    # Load JSON data from record
    probs = json.loads(record.probabilities) if isinstance(record.probabilities, str) else record.probabilities
    recom = json.loads(record.recommendation) if isinstance(record.recommendation, str) else record.recommendation

    styles = getSampleStyleSheet()
    
    # Custom Styles
    brand_green = HexColor('#1A6B3C')
    title_style = ParagraphStyle(
        'BrandTitle',
        parent=styles['Heading1'],
        textColor=brand_green,
        fontSize=24,
        spaceAfter=0
    )
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        spaceAfter=12
    )
    section_header = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading3'],
        fontSize=12,
        fontWeight='Bold',
        spaceBefore=10,
        spaceAfter=6
    )

    elements = []

    # --- HEADER ---
    header_data = [
        [
            Paragraph("RetinaScan", title_style),
            Paragraph(f"Report ID: RS-{record.id}<br/>Generated: {record.created_at.strftime('%Y-%m-%d %H:%M')}", 
                      ParagraphStyle('RightAlign', parent=styles['Normal'], alignment=2))
        ],
        [Paragraph("Diabetic Retinopathy Screening Report", subtitle_style), ""]
    ]
    header_table = Table(header_data, colWidths=[10*cm, 7*cm])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(header_table)
    elements.append(HRFlowable(width="100%", thickness=1, color=brand_green, spaceAfter=20))

    # --- PATIENT INFORMATION TABLE ---
    elements.append(Paragraph("PATIENT INFORMATION", section_header))
    patient_data = [
        ["Patient Name", record.patient_name],
        ["Age / Sex", f"{record.patient_age} / {record.patient_sex}"],
        ["Hospital ID", record.hospital_id or "N/A"],
        ["Eye Examined", record.eye],
        ["Facility", record.facility_ref.name if record.facility_ref else "N/A"],
        ["Examined By", ""],
    ]
    patient_table = Table(patient_data, colWidths=[5*cm, 12*cm])
    patient_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.whitesmoke),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('PADDING', (0, 0), (-1, -1), 6),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ]))
    elements.append(patient_table)
    elements.append(Spacer(1, 20))

    # --- AI CLASSIFICATION BOX ---
    grade_color = HexColor(recom.get('color', '#000000'))
    elements.append(Paragraph("AI ANALYSIS SUMMARY", section_header))
    
    # Text-based confidence bar
    bar_length = 20
    filled = int((record.confidence / 100) * bar_length)
    conf_bar = f"[{'#' * filled}{'.' * (bar_length - filled)}]"
    
    classification_text = (
        f"<b>Grade {record.grade} / 4 — {record.grade_label}</b><br/>"
        f"Confidence: {record.confidence:.1f}%<br/>"
        f"<font face='Courier'>{conf_bar}</font>"
    )
    
    classification_box = Table([[Paragraph(classification_text, styles['Normal'])]], colWidths=[17*cm])
    classification_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, colors.lightgrey),
        ('LINEBEFORE', (0, 0), (0, 0), 5, grade_color),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(classification_box)
    elements.append(Spacer(1, 15))

    # --- CONFIDENCE BREAKDOWN ---
    elements.append(Paragraph("Confidence Breakdown", styles['Heading4']))
    breakdown_data = [["DR Grade", "Classification", "Probability"]]
    grades = ["Grade 0", "Grade 1", "Grade 2", "Grade 3", "Grade 4"]
    labels = ["Normal", "Mild", "Moderate", "Severe", "Proliferative"]
    
    for i in range(5):
        prob_val = probs[i] if i < len(probs) else 0.0
        breakdown_data.append([grades[i], labels[i], f"{prob_val*100:.2f}%"])

    breakdown_table = Table(breakdown_data, colWidths=[4*cm, 6*cm, 4*cm])
    # Highlight winning row (record.grade + 1 because of header)
    winning_row = record.grade + 1
    breakdown_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('LINEBELOW', (0, 0), (-1, 0), 1, colors.black),
        ('BACKGROUND', (0, winning_row), (-1, winning_row), colors.lightyellow),
        ('GRID', (0, 1), (-1, -1), 0.5, colors.lightgrey),
        ('ALIGN', (2, 0), (2, -1), 'RIGHT'),
    ]))
    elements.append(breakdown_table)
    elements.append(Spacer(1, 20))

    # --- CLINICAL RECOMMENDATION ---
    urgency_map = {
        'ROUTINE': brand_green,
        'NON-URGENT': brand_green,
        'SOON': colors.orange,
        'URGENT': colors.red,
        'EMERGENCY': colors.darkred
    }
    urgency_text = recom.get('urgency', 'ROUTINE')
    urgency_color = urgency_map.get(urgency_text, colors.black)

    elements.append(Paragraph("CLINICAL RECOMMENDATION", section_header))
    
    recom_content = [
        Paragraph(f"Urgency: <font color='{urgency_color}'><b>{urgency_text}</b></font>", styles['Normal']),
        Spacer(1, 6),
        Paragraph(recom.get('action', ''), styles['Normal']),
        Spacer(1, 6),
        Paragraph(f"<b>Recommended follow-up:</b> {recom.get('followup', 'N/A')}", styles['Normal'])
    ]
    
    if recom.get('refer'):
        recom_content.append(Spacer(1, 6))
        recom_content.append(Paragraph("⚠ <b>Ophthalmologist referral required</b>", 
                             ParagraphStyle('Alert', parent=styles['Normal'], textColor=colors.red)))

    recom_box = Table([[recom_content]], colWidths=[17*cm])
    recom_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, brand_green),
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#F9FBFA')),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    elements.append(recom_box)

    # --- DISCLAIMER ---
    disclaimer_text = (
        "<i>This report is generated by an AI-assisted screening tool and does not replace "
        "a formal ophthalmological diagnosis. All results require clinical review by a "
        "qualified professional.</i>"
    )
    elements.append(Spacer(1, 30))
    elements.append(Paragraph(disclaimer_text, ParagraphStyle('Disclaimer', parent=styles['Normal'], fontSize=8, alignment=1)))

    # Footer function for generation
    def draw_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 8)
        canvas.setStrokeColor(colors.lightgrey)
        canvas.line(2*cm, 1.5*cm, 19*cm, 1.5*cm)
        footer_text = f"RetinaScan v1.0 | Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Page {doc.page}"
        canvas.drawCentredString(A4[0]/2, 1*cm, footer_text)
        canvas.restoreState()

    doc.build(elements, onFirstPage=draw_footer, onLaterPages=draw_footer)
    
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes