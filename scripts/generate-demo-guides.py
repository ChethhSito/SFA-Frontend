"""Generate clearly labeled demonstration PDFs for the portal guide library."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


OUTPUT = Path(__file__).resolve().parents[1] / "public" / "guides"
OUTPUT.mkdir(parents=True, exist_ok=True)

GUIDES = [
    ("estudiante-prematricula-demo.pdf", "Guía de prematrícula", "Estudiante", [
        "Comprueba que la convocatoria y el período de admisión estén habilitados en el portal público.",
        "Revisa tus datos personales y los documentos solicitados antes de enviar una postulación.",
        "Conserva la constancia o el número que muestre el sistema y consulta las observaciones de admisión.",
        "Si hay una discrepancia, comunícala a la oficina de admisión antes de continuar con la matrícula.",
    ], "Este ejemplo no fija requisitos, fechas ni criterios de admisión."),
    ("estudiante-matricula-demo.pdf", "Guía de matrícula", "Estudiante", [
        "En Información Personal, comprueba tu identidad y el estado de tu matrícula.",
        "En Mi Horario, verifica el grupo académico, las asignaturas y los horarios publicados.",
        "En Mis Cursos, confirma que aparezcan las asignaturas en las que estás inscrito.",
        "Si falta un curso o el grupo es incorrecto, solicita revisión a Secretaría Académica.",
    ], "La matrícula y sus requisitos oficiales se rigen por la normativa aprobada del instituto."),
    ("estudiante-procedimientos-demo.pdf", "Procedimientos administrativos", "Estudiante", [
        "Abre Trámites de Secretaría y elige Certificado de Estudios o Constancia de Matrícula.",
        "Envía la solicitud vinculada a tu DNI. El sistema crea una obligación de pago en MAF.",
        "Después de realizar el pago, comunica el número de operación, la fecha y el monto del voucher.",
        "Consulta el estado de la solicitud. MAF compara esos datos con el reporte bancario antes de validarla.",
    ], "Este flujo describe las funciones actuales del portal; las tasas y requisitos oficiales deben confirmarse con Secretaría."),
    ("estudiante-reconsideracion-demo.pdf", "Reconsideración de sanciones", "Estudiante", [
        "Solicita la comunicación formal de la decisión que deseas revisar.",
        "Prepara una exposición clara de los hechos y adjunta los documentos que sustenten tu pedido.",
        "Presenta la solicitud por el canal y dentro del plazo que indique la normativa institucional vigente.",
        "Conserva el cargo de recepción y consulta la respuesta de la oficina competente.",
    ], "El portal no ofrece todavía una solicitud digital de reconsideración; este PDF no establece plazos ni recursos legales."),
    ("estudiante-traslado-demo.pdf", "Reglamento de traslado interno", "Estudiante", [
        "Consulta a Secretaría Académica si el traslado interno está disponible para tu programa y período.",
        "Solicita los requisitos y documentos aprobados para evaluar la equivalencia de asignaturas.",
        "Presenta la solicitud por el canal institucional indicado y conserva el cargo de recepción.",
        "Espera la resolución correspondiente antes de considerar modificado tu programa o grupo.",
    ], "Documento ilustrativo: no define causales, vacantes, equivalencias ni requisitos oficiales de traslado."),
    ("estudiante-sanciones-demo.pdf", "Reglamento de sanciones", "Estudiante", [
        "Consulta la versión aprobada y vigente del reglamento institucional.",
        "Revisa la descripción de la conducta, la autoridad competente y el procedimiento aplicable.",
        "Si recibes una comunicación, identifica los canales disponibles para presentar descargos o pedir revisión.",
        "Solicita orientación a Secretaría Académica cuando necesites interpretar una disposición.",
    ], "Este ejemplo no tipifica faltas, no establece sanciones y no sustituye al reglamento oficial."),
    ("docente-gestion-curso-demo.pdf", "Guía de gestión del curso", "Docente", [
        "Abre Mis Cursos y selecciona la asignatura asignada.",
        "Revisa el resumen y el horario; organiza las actividades de las semanas 1 a 16.",
        "Publica materiales y tareas en la semana correspondiente, con archivo y fecha cuando aplique.",
        "Registra observaciones y evidencias del desarrollo de las sesiones.",
    ], "Los archivos del curso se conservan en el servidor local configurado para la demostración."),
    ("docente-asistencia-demo.pdf", "Guía de asistencia", "Docente", [
        "Dentro de un curso, abre la semana y selecciona Asistencia.",
        "Marca la condición de cada estudiante y guarda el registro de la sesión.",
        "Consulta Control de Asistencia para filtrar el historial por curso, semana, estudiante o fecha.",
        "Corrige las discrepancias mediante el procedimiento institucional vigente.",
    ], "Este ejemplo explica el uso del portal; no fija criterios oficiales de justificación de faltas."),
    ("docente-evaluaciones-demo.pdf", "Procedimiento de evaluaciones", "Docente", [
        "Crea las tareas o evaluaciones de la semana e informa la fecha y la rúbrica.",
        "Revisa las entregas y registra las calificaciones de acuerdo con la escala usada por el portal.",
        "Consulta Evaluaciones de Cursos para revisar la hoja de notas de la asignatura.",
        "Verifica los datos antes del cierre; la publicación y firma de actas oficiales requieren un proceso institucional adicional.",
    ], "La emisión de actas oficiales no queda acreditada por esta demostración."),
    ("docente-convivencia-demo.pdf", "Normas y convivencia", "Docente", [
        "Registra observaciones relevantes en la semana del curso correspondiente.",
        "Distingue hechos observados de interpretaciones y conserva evidencia pertinente.",
        "Comunica una posible incidencia a la autoridad institucional competente por el canal vigente.",
        "Consulta el reglamento aprobado antes de informar medidas o procedimientos al estudiante.",
    ], "Este ejemplo no establece faltas ni sanciones aplicables a docentes o estudiantes."),
]

title_style = ParagraphStyle("Title", fontName="Helvetica-Bold", fontSize=19, leading=24, textColor=colors.HexColor("#800521"), spaceAfter=12)
body_style = ParagraphStyle("Body", fontName="Helvetica", fontSize=10.5, leading=16, textColor=colors.HexColor("#243043"), spaceAfter=12)
label_style = ParagraphStyle("Label", fontName="Helvetica-Bold", fontSize=11, leading=15, textColor=colors.HexColor("#800521"), spaceBefore=12, spaceAfter=8)
step_style = ParagraphStyle("Step", parent=body_style, leftIndent=22, firstLineIndent=-18, spaceAfter=8)
note_style = ParagraphStyle("Note", parent=body_style, fontSize=9.5, leading=14, textColor=colors.HexColor("#75510A"))


def decorate(canvas, doc):
    canvas.saveState()
    width, height = A4
    canvas.setFillColor(colors.HexColor("#800521"))
    canvas.rect(0, height - 17 * mm, width, 17 * mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(20 * mm, height - 10.5 * mm, "IESTP SFA - BIBLIOTECA DE GUÍAS")
    canvas.setFillColor(colors.HexColor("#8A6B2F"))
    canvas.setFont("Helvetica-Bold", 10)
    canvas.drawCentredString(width / 2, 18 * mm, "DOCUMENTO DE DEMOSTRACIÓN - NO OFICIAL")
    canvas.setStrokeColor(colors.HexColor("#D9DDE3"))
    canvas.line(20 * mm, 24 * mm, width - 20 * mm, 24 * mm)
    canvas.setFillColor(colors.HexColor("#64748B"))
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 20 * mm, 10 * mm, f"Página {doc.page}")
    canvas.restoreState()


for filename, title, audience, steps, note in GUIDES:
    path = OUTPUT / filename
    document = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=20 * mm, rightMargin=20 * mm,
                                 topMargin=31 * mm, bottomMargin=30 * mm)
    story = [Paragraph(title, title_style),
             Paragraph(f"Perfil: {audience} | Uso: ejemplo de navegación y procedimiento", body_style)]
    banner = Table([[Paragraph("Este material sirve únicamente para probar la consulta de PDF en el portal. No constituye una disposición institucional vigente.", note_style)]], colWidths=[170 * mm])
    banner.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFF5DC")),
                                ("BOX", (0, 0), (-1, -1), 0.7, colors.HexColor("#E8CE87")),
                                ("LEFTPADDING", (0, 0), (-1, -1), 11), ("RIGHTPADDING", (0, 0), (-1, -1), 11),
                                ("TOPPADDING", (0, 0), (-1, -1), 10), ("BOTTOMPADDING", (0, 0), (-1, -1), 10)]))
    story += [banner, Spacer(1, 12 * mm), Paragraph("Pasos ilustrativos", label_style)]
    story += [Paragraph(f"{index}. {step}", step_style) for index, step in enumerate(steps, 1)]
    story += [Spacer(1, 8 * mm), Paragraph("Alcance", label_style), Paragraph(note, body_style)]
    document.build(story, onFirstPage=decorate, onLaterPages=decorate)
    print(path)
