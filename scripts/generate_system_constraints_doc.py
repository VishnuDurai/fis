import os
import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CBD5E1", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), val)
        border.set(qn('w:sz'), sz)
        border.set(qn('w:space'), '0')
        border.set(qn('w:color'), color)
        tblBorders.append(border)
    border = OxmlElement('w:insideV')
    border.set(qn('w:val'), 'none')
    tblBorders.append(border)
    tblPr.append(tblBorders)

def add_page_border(section, color="0F331F", sz="8"):
    sectPr = section._sectPr
    pgBorders = OxmlElement('w:pgBorders')
    pgBorders.set(qn('w:offsetFrom'), 'page')
    for b_name in ['top', 'left', 'bottom', 'right']:
        b = OxmlElement(f'w:{b_name}')
        b.set(qn('w:val'), 'single')
        b.set(qn('w:sz'), sz)
        b.set(qn('w:space'), '20')
        b.set(qn('w:color'), color)
        pgBorders.append(b)
    sectPr.append(pgBorders)

def add_heading_styled(doc, text, level=1):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.bold = True
    if level == 1:
        run.font.size = Pt(16)
        run.font.color.rgb = RGBColor(15, 23, 42)
    elif level == 2:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(3, 105, 161)
    return p

def create_system_constraints_document():
    doc = Document()
    
    # Page setup - Margins & Page Border
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

        add_page_border(section, color="0F331F", sz="8")

        footer = section.footer
        footer_p = footer.paragraphs[0]
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer_p.paragraph_format.space_before = Pt(6)
        footer_run = footer_p.add_run("© 2026 FIS Team - Sri Ramakrishna Engineering College, Coimbatore | SREC FIS V3.0")
        footer_run.font.name = 'Times New Roman'
        footer_run.font.size = Pt(11)
        footer_run.font.color.rgb = RGBColor(100, 116, 139)

    # Dual Logo Header Table (SREC College Logo Left + SNR Sons Trust Logo Right)
    left_logo = os.path.abspath(os.path.join(os.path.dirname(__file__), '../client/public/report-logo-left.png'))
    right_logo = os.path.abspath(os.path.join(os.path.dirname(__file__), '../client/public/report-logo-right.png'))
    
    logo_table = doc.add_table(rows=1, cols=2)
    logo_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    logo_table.autofit = False
    
    cell_l = logo_table.rows[0].cells[0]
    cell_r = logo_table.rows[0].cells[1]
    cell_l.width = Inches(3.5)
    cell_r.width = Inches(3.5)
    
    if os.path.exists(left_logo):
        p_l = cell_l.paragraphs[0]
        p_l.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p_l.paragraph_format.space_before = Pt(0)
        p_l.paragraph_format.space_after = Pt(0)
        r_l = p_l.add_run()
        r_l.add_picture(left_logo, height=Inches(0.85))

    if os.path.exists(right_logo):
        p_r = cell_r.paragraphs[0]
        p_r.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_r.paragraph_format.space_before = Pt(0)
        p_r.paragraph_format.space_after = Pt(0)
        r_r = p_r.add_run()
        r_r.add_picture(right_logo, height=Inches(0.85))

    # Standardized Institutional Report Header Text
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_inst.paragraph_format.space_before = Pt(6)
    p_inst.paragraph_format.space_after = Pt(2)
    r_inst = p_inst.add_run("SRI RAMAKRISHNA ENGINEERING COLLEGE")
    r_inst.font.name = 'Times New Roman'
    r_inst.font.size = Pt(18)
    r_inst.bold = True
    r_inst.font.color.rgb = RGBColor(15, 51, 31)

    p_subinst = doc.add_paragraph()
    p_subinst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subinst.paragraph_format.space_before = Pt(0)
    p_subinst.paragraph_format.space_after = Pt(4)
    r_subinst = p_subinst.add_run("[An Autonomous Institution | Re-Accredited by NAAC with 'A+' Grade]")
    r_subinst.font.name = 'Times New Roman'
    r_subinst.font.size = Pt(12)
    r_subinst.font.italic = True
    r_subinst.font.color.rgb = RGBColor(71, 85, 105)

    p_sys = doc.add_paragraph()
    p_sys.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sys.paragraph_format.space_before = Pt(0)
    p_sys.paragraph_format.space_after = Pt(14)
    r_sys = p_sys.add_run("FACULTY INFORMATION SYSTEM (SREC FIS V3.0)")
    r_sys.font.name = 'Times New Roman'
    r_sys.font.size = Pt(14)
    r_sys.bold = True
    r_sys.font.color.rgb = RGBColor(2, 132, 199)

    # Document Main Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(6)
    title_p.paragraph_format.space_after = Pt(6)
    run_title = title_p.add_run("SYSTEM CONSTRAINTS, RULES & PORTAL FUNCTIONALITY MANUAL")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(16)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(14)
    run_meta = meta_p.add_run(f"Document Generated: {datetime.datetime.now().strftime('%B %d, %Y')} | Version 3.0 | Status: Active System Rules Specification")
    run_meta.font.name = 'Times New Roman'
    run_meta.font.size = Pt(11)
    run_meta.font.italic = True
    run_meta.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Section 1
    add_heading_styled(doc, "1. Executive Summary & Portal Classification", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("The Sri Ramakrishna Engineering College Faculty Information System (SREC FIS V3.0) operates across three distinct portal environments, governed by strict authorization constraints, menu visibility matrix, role elevation logic, and workflow governance.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    table1 = doc.add_table(rows=1, cols=3)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False
    
    hdr_cells = table1.rows[0].cells
    headers = ["Portal Environment", "Target User Roles", "Operational Scope & Access Rules"]
    widths = [Inches(1.8), Inches(1.8), Inches(3.4)]
    
    for i, h in enumerate(headers):
        hdr_cells[i].text = h
        hdr_cells[i].paragraphs[0].runs[0].font.bold = True
        hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        hdr_cells[i].paragraphs[0].runs[0].font.name = 'Times New Roman'
        hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(14)
        set_cell_background(hdr_cells[i], "0F331F")
        set_cell_margins(hdr_cells[i])
        hdr_cells[i].width = widths[i]

    portals_data = [
        ("1. Faculty Portal", "role: 'faculty'", "Self-service profile logging, personal activities, R&D submissions, assigned responsibilities view, self FPI appraisal submission."),
        ("2. Dept Admin / HOD Portal", "role: 'dept_admin'\nisHod: true", "Departmental faculty oversight, read-only faculty verification, departmental additional responsibilities assignment, HOD Part-by-Part appraisal review & score evaluation."),
        ("3. Executive & System Admin Portal", "role: 'admin'\nrole: 'principal'\nrole: 'hr'", "Institution-wide administration, full CRUD across all faculty records, Dynamic Form Builder & Rubrics Configurator, designation scoring parameter overrides, final executive appraisal approval.")
    ]

    for row_idx, (p_name, p_roles, p_scope) in enumerate(portals_data):
        row_cells = table1.add_row().cells
        bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([p_name, p_roles, p_scope]):
            row_cells[i].text = val
            p_cell = row_cells[i].paragraphs[0]
            p_cell.runs[0].font.name = 'Times New Roman'
            p_cell.runs[0].font.size = Pt(14)
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i])
            row_cells[i].width = widths[i]

    set_table_borders(table1)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 2
    add_heading_styled(doc, "2. User Roles, Elevation Flags & Automatic Designation Rules", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("The system dynamically evaluates user credentials and designation strings to elevate permissions and toggle menu items:")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    rules = [
        ("Doctorate / Ph.D Designation Rule: ", "If a faculty member's name contains 'Dr.' or 'Dr ', or Ph.D qualification is recorded, the Research Supervisor menu item (/activities/supervisors) is automatically enabled in place of the Research Scholar menu item (/activities/scholars)."),
        ("HOD Designation Rule: ", "If a faculty member's designation contains 'Head' or 'HOD', the isHod flag is set to true, granting Departmental Responsibility Assignment and HOD Appraisal Review privileges."),
        ("Executive Admin Rule: ", "If a faculty member's designation contains 'Principal' or 'HR', the isInstitutionalAdmin flag is set to true, granting Institutional Responsibility Assignment, Executive Appraisal Review, and Form Builder access."),
        ("Club Coordinator Rule: ", "If a faculty member is assigned as an active coordinator in staff_club, the isClubCoordinator flag is set to true, enabling the Clubs Activity Organized menu item."),
        ("Relieved Faculty Constraint: ", "If is_relieved === 1 in staff_user or staff_personal, login authentication is strictly blocked, revoking all system access.")
    ]

    for title_text, body_text in rules:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(title_text)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(15, 118, 110)
        r2 = bp.add_run(body_text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 3
    add_heading_styled(doc, "3. Faculty Department Transfer Workflow & Governance Rules", level=1)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("When a faculty member is transferred between departments (e.g. from CSE to AI & DS), the system executes an automated, multi-layered synchronization process:")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    transfer_steps = [
        ("1. Transfer History Audit Log (staff_department_history): ", "An immutable record is inserted storing staff_id, from_dept, to_dept, transfer_date, and system timestamp."),
        ("2. Academic Profile & Credentials Update: ", "Department column in staff_academics is updated to the new target department. If assigned as a Dept Admin (admin_dep), the admin scope updates automatically. Session JWT claims update upon next login."),
        ("3. Server Storage Folder Relocation (moveFacultyDirectory): ", "Uploaded files on server disk are moved from /SREC/{old_dept}/{staff_id}/ to /SREC/{new_dept}/{staff_id}/. Database document paths across all activity tables are remapped automatically."),
        ("4. Historical Activity & Appraisal Retention: ", "All prior Publications, Patents, Grants, Certifications, and submitted FPI Appraisal forms remain preserved under staff_id without data loss."),
        ("5. HOD Review Authority Transfer: ", "The faculty member is removed from the old HOD's active directory and pending queue, and immediately appears in the new HOD's directory and pending appraisal queue."),
        ("6. Dynamic HOD Resolution in Reports: ", "General Information tables, FPI forms, and Dossier Reports dynamically resolve and display the HOD Name of the faculty's new department.")
    ]

    for title_text, body_text in transfer_steps:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(title_text)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(3, 105, 161)
        r2 = bp.add_run(body_text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 4
    add_heading_styled(doc, "4. Sidebar & Menu Enablement / Disablement Matrix", level=1)

    table2 = doc.add_table(rows=1, cols=5)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    table2.autofit = False

    m_headers = ["Menu Item", "Path", "Faculty Portal", "Dept Admin / HOD", "System Admin / Executive"]
    m_widths = [Inches(1.5), Inches(1.5), Inches(1.2), Inches(1.4), Inches(1.4)]

    for i, h in enumerate(m_headers):
        table2.rows[0].cells[i].text = h
        table2.rows[0].cells[i].paragraphs[0].runs[0].font.bold = True
        table2.rows[0].cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        table2.rows[0].cells[i].paragraphs[0].runs[0].font.name = 'Times New Roman'
        table2.rows[0].cells[i].paragraphs[0].runs[0].font.size = Pt(14)
        set_cell_background(table2.rows[0].cells[i], "0F331F")
        set_cell_margins(table2.rows[0].cells[i])
        table2.rows[0].cells[i].width = m_widths[i]

    menu_matrix = [
        ("Dashboard", "/dashboard", "Enabled", "Enabled", "Enabled"),
        ("Personal Details", "/profile/personal", "Self Edit", "Dept Read-Only", "Full Access"),
        ("Faculty Directory", "/admin/faculty", "Disabled", "Dept List", "All Depts List"),
        ("Dept / System Admins", "/admin/*-admins", "Disabled", "Disabled", "Full Access"),
        ("Assign Clubs", "/admin/clubs", "Disabled", "Disabled", "Full Access"),
        ("Academic Info", "/profile/academic", "Self Edit", "Dept View", "Full Access"),
        ("Official Documents", "/profile/documents", "Upload/View", "View Proofs", "Full Access"),
        ("Education Details", "/profile/education", "Self Edit", "Dept View", "Full Access"),
        ("Memberships", "/activities/memberships", "Self Edit", "Dept View", "Full Access"),
        ("Responsibilities", "/responsibilities", "View Assigned", "Assign Dept", "Assign Institution"),
        ("Faculty Activities", "/activities/*", "Self Logging", "Dept View", "All Depts View"),
        ("Clubs Activity", "/activities/clubs", "If Coordinator", "Dept View", "All Depts View"),
        ("Research Scholar", "/activities/scholars", "Non-Doctorate", "Dept View", "All Depts View"),
        ("Research Supervisor", "/activities/supervisors", "Doctorate/Ph.D", "Dept View", "All Depts View"),
        ("Appraisal Form", "/appraisal", "Submit / View", "Review Dept", "Form Builder & Approve"),
        ("Reports & Dossier", "/reports", "Self Dossier", "Dept Reports", "All Institution Reports"),
        ("Dynamic Builder", "/admin/dynamic-pages", "Disabled", "Disabled", "Full Access")
    ]

    for row_idx, (m_item, m_path, m_fac, m_hod, m_adm) in enumerate(menu_matrix):
        row_cells = table2.add_row().cells
        bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([m_item, m_path, m_fac, m_hod, m_adm]):
            row_cells[i].text = val
            p_cell = row_cells[i].paragraphs[0]
            p_cell.runs[0].font.name = 'Times New Roman'
            p_cell.runs[0].font.size = Pt(14)
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i])
            row_cells[i].width = m_widths[i]

    set_table_borders(table2)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 5
    add_heading_styled(doc, "5. Annual Performance Appraisal (FPI) Governance & Rules", level=1)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("The Faculty Performance Indicator (FPI) appraisal process is regulated by the following governance rules:")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    fpi_rules = [
        ("Completed Academic Year Rule: ", "Performance appraisals evaluate the completed academic year (e.g. 2025-2026). The appraisal form defaults to getAppraisalAcademicYear() (2025-2026)."),
        ("Score Evaluation Caps (200 Total): ", "PART A (Teaching: Max 60 Pts), PART B (Prof Dev: Max 40 Pts), PART C (R&D: Max 80 Pts), PART D (Institutional: Max 20 Pts). Total FPI score capped at 200 Pts."),
        ("Club Coordinator & Additional Responsibility Rule: ", "Being assigned as a Club Coordinator or Club In-charge is categorized as an Institutional Level Additional Responsibility under Criteria D1 in PART D (Institutional Development & Contribution), scoring 10 Pts per institutional duty up to the 20 Pts Part D cap. Furthermore, student club activities organized by coordinators log extension points under PART B."),
        ("Designation-Based Customization: ", "System Admins / HR can define custom unit marks, max caps, calculation rules, and bracket configs per designation (Assistant Professor, Associate Professor, Professor, Professor & Head). System falls back to ALL common default mappings if no override exists."),
        ("Threshold Bracket Configurator (⚙️ Config Bracket): ", "Admins can configure cutoff thresholds (e.g. feedback 4.0 cutoff, pass % 80% cutoff, journal vs conference split, patent status splits)."),
        ("Custom PART Addition (➕ Add New PART): ", "Admins can dynamically add new evaluation sections (PART_E, PART_F) and modify section titles in real time."),
        ("Approval Workflow Lifecycle: ", "Submitted (Pending HOD Review) -> HOD Approved (Pending Principal/HR Review) -> Final Approved (Finalized Appraisal)."),
        ("Proof Document Verification Provision: ", "HODs, Principal, HR, and System Admin have access to the Auto-Mapped Activity Verification Panel inside both the submissions list and View Full FPI Form modal. Each record features an 👁️ View Proof button to inspect original evidence documents (PDF, images) before approving scores.")
    ]

    for title_text, body_text in fpi_rules:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(title_text)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(15, 51, 31)
        r2 = bp.add_run(body_text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 6
    add_heading_styled(doc, "6. Document Storage & Security Constraints", level=1)

    sec6_rules = [
        ("Dedicated Storage Folder Structure: ", "Uploaded documents are stored in dedicated faculty folders: server/SREC/{Department}/{Staff_ID}/, NOT in a common directory."),
        ("File Upload Size & Formats: ", "Maximum 5 MB per file upload. Supported formats: PDF, PNG, JPG, JPEG, DOC, DOCX."),
        ("JWT Authentication Guard (requireFileAuth): ", "Direct file requests under /uploads/* or /SREC/* require valid JWT authentication via Authorization Bearer token header or ?token=<token> URL query string. Unauthenticated requests redirect to /login.")
    ]

    for title_text, body_text in sec6_rules:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(title_text)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(185, 28, 28)
        r2 = bp.add_run(body_text)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    # Save document
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../docs'))
    os.makedirs(docs_dir, exist_ok=True)
    out_path = os.path.join(docs_dir, "System_Constraints_and_Portal_Rules.docx")
    doc.save(out_path)
    print(f"System constraints Word document successfully generated at: {out_path}")

if __name__ == "__main__":
    create_system_constraints_document()
