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
    elif level == 3:
        run.font.size = Pt(14)
        run.font.color.rgb = RGBColor(15, 118, 110)
    return p

def add_diagram_box(doc, title, flow_steps, bg_header="0F331F"):
    add_heading_styled(doc, f"❖ Workflow Architecture Diagram: {title}", level=2)
    tbl = doc.add_table(rows=1, cols=1)
    tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl.autofit = False
    
    cell = tbl.rows[0].cells[0]
    cell.width = Inches(7.0)
    set_cell_background(cell, "F8FAFC")
    set_cell_margins(cell, top=140, bottom=140, left=180, right=180)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    r_t = p.add_run(f"ARCHITECTURAL FLOW: {title.upper()}\n")
    r_t.font.name = 'Times New Roman'
    r_t.font.size = Pt(14)
    r_t.bold = True
    r_t.font.color.rgb = RGBColor(15, 51, 31)
    
    for idx, step in enumerate(flow_steps):
        p_step = cell.add_paragraph()
        p_step.paragraph_format.space_before = Pt(2)
        p_step.paragraph_format.space_after = Pt(4)
        
        step_prefix = f"► Step {idx+1}: "
        r_sp = p_step.add_run(step_prefix)
        r_sp.bold = True
        r_sp.font.name = 'Times New Roman'
        r_sp.font.size = Pt(14)
        r_sp.font.color.rgb = RGBColor(3, 105, 161)
        
        r_sb = p_step.add_run(step)
        r_sb.font.name = 'Times New Roman'
        r_sb.font.size = Pt(14)
        r_sb.font.color.rgb = RGBColor(30, 41, 59)
        
        if idx < len(flow_steps) - 1:
            p_arrow = cell.add_paragraph()
            p_arrow.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_arrow.paragraph_format.space_before = Pt(0)
            p_arrow.paragraph_format.space_after = Pt(0)
            r_arr = p_arrow.add_run("│\n▼")
            r_arr.bold = True
            r_arr.font.name = 'Times New Roman'
            r_arr.font.size = Pt(14)
            r_arr.font.color.rgb = RGBColor(15, 118, 110)

    set_table_borders(tbl, color="0F331F", sz="8")
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

def create_portal_workflows_document():
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

    # Official SREC Header Banner (same as PDF Reports)
    header_banner = os.path.abspath(os.path.join(os.path.dirname(__file__), '../client/public/srec-header-banner.png'))
    if os.path.exists(header_banner):
        p_banner = doc.add_paragraph()
        p_banner.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_banner.paragraph_format.space_before = Pt(0)
        p_banner.paragraph_format.space_after = Pt(6)
        r_banner = p_banner.add_run()
        r_banner.add_picture(header_banner, width=Inches(7.0))

    p_sys = doc.add_paragraph()
    p_sys.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sys.paragraph_format.space_before = Pt(0)
    p_sys.paragraph_format.space_after = Pt(10)
    r_sys = p_sys.add_run("FACULTY INFORMATION SYSTEM (SREC FIS V3.0)")
    r_sys.font.name = 'Times New Roman'
    r_sys.font.size = Pt(14)
    r_sys.bold = True
    r_sys.font.color.rgb = RGBColor(2, 132, 199)

    # Document Main Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(6)
    title_p.paragraph_format.space_after = Pt(6)
    run_title = title_p.add_run("COMPLETE & DETAILED WORKFLOW GUIDE FOR ALL 3 PORTALS")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(16)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(14)
    run_meta = meta_p.add_run(f"Document Generated: {datetime.datetime.now().strftime('%B %d, %Y')} | Version 3.0 | Status: Operational Workflow Specification")
    run_meta.font.name = 'Times New Roman'
    run_meta.font.size = Pt(11)
    run_meta.font.italic = True
    run_meta.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Section 1
    add_heading_styled(doc, "1. System Architectural Overview & Authentication Workflow", level=1)
    
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("The SREC FIS V3.0 system is designed with a multi-role, modular architecture servicing three distinct user portals: (1) Faculty Portal, (2) Department Admin / HOD Portal, and (3) System Admin & Executive Portal. Authentication is centralized via JWT (JSON Web Token) tokens issued upon authenticating at /api/auth/login.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    add_diagram_box(doc, "Centralized JWT Authentication & Portal Access Routing", [
        "User inputs credentials (Staff ID / Password / Role Selection) at /login.",
        "Backend verifies password via bcryptjs against staff_user or admin tables.",
        "Server generates 24-hour JWT token with claims: role, isHod, isInstitutionalAdmin, isSupervisorEligible, isClubCoordinator.",
        "Client stores token in localStorage and passes Bearer Authorization Header on all API calls.",
        "React Router (App.jsx) dynamically mounts Portal 1 (Faculty), Portal 2 (Dept Admin), or Portal 3 (System Admin)."
    ])

    # Section 2
    add_heading_styled(doc, "2. Portal 1 — Regular Faculty Portal Workflow (role: 'faculty')", level=1)

    p2 = doc.add_paragraph()
    p2.paragraph_format.space_after = Pt(6)
    r2 = p2.add_run("The Faculty Portal empowers teaching staff to log personal details, upload academic documents, manage research submissions, view assigned duties, fill self FPI appraisal forms, and export dossiers.")
    r2.font.name = 'Times New Roman'
    r2.font.size = Pt(14)

    fac_workflows = [
        ("Workflow 1.1 — Personal & Academic Profile Logging: ", "Faculty logs into Dashboard -> Personal (/profile/personal) to update DOB, Gender, Mobile, PAN, Aadhaar, and Address. Accesses Academic Info (/profile/academic) to view designation, department, and SREC experience. Uploads official identity documents via /profile/documents. File saved to server/SREC/{Department}/{Staff_ID}/."),
        ("Workflow 1.2 — Education & Professional Memberships: ", "Faculty submits educational qualifications (SSLC, HSC, UG, PG, Ph.D) with certificate uploads in Education Details (/profile/education). Registers professional memberships (IEEE, CSI, ACM) in /activities/memberships."),
        ("Workflow 1.3 — Activity & Certification Logging: ", "Faculty logs FDPs/workshops attended (/activities/interactions), resource person engagements (/activities/resource), online certifications (/activities/certifications), awards (/activities/awards), and events organized (/activities/events). If assigned as Club Coordinator, accesses /activities/clubs."),
        ("Workflow 1.4 — R&D & Scholarly Submissions: ", "If non-Doctorate, accesses Research Scholar (/activities/scholars). If Doctorate/Ph.D ('Dr.'), Research Supervisor (/activities/supervisors) is automatically enabled. Logs Research Funding (/activities/funding), Seed Money (/activities/seed_money), Patents/IPR (/activities/ipr), Publications (/activities/publications), and Books (/activities/books)."),
        ("Workflow 1.5 — Assigned Responsibilities View: ", "Faculty accesses /responsibilities to view official additional duties assigned by HOD, Principal, HR, or System Admin."),
        ("Workflow 1.6 — Annual Performance Appraisal (FPI Form) Submission: ", "Faculty opens Appraisal Form (/appraisal). System auto-selects completed academic year (2025-2026) and auto-maps portal data into PART A (Teaching, Max 60), PART B (Prof Dev, Max 40), PART C (R&D, Max 80), and PART D (Institutional, Max 20). Self-scores calculate automatically. Faculty verifies auto-mapped proofs (👁️ View Proof) and clicks 'Submit FPI Form'. Form status updates to 'Submitted'."),
        ("Workflow 1.7 — Self Dossier Report Generation: ", "Faculty opens Reports (/reports) to generate and download self academic dossier in PDF, Excel, or ZIP format.")
    ]

    for t_wf, b_wf in fac_workflows:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(t_wf)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(3, 105, 161)
        r2 = bp.add_run(b_wf)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    add_diagram_box(doc, "Faculty Annual FPI Appraisal Self-Submission Process", [
        "Faculty accesses /appraisal for completed academic year (2025-2026).",
        "Engine auto-fetches logged portal data (Pass %, Feedback, FDPs, Publications, Grants, Responsibilities).",
        "System calculates auto-mapped scores across PART A (Max 60), PART B (Max 40), PART C (Max 80), PART D (Max 20).",
        "Faculty inspects auto-mapped proof documents via 👁️ View Proof buttons.",
        "Faculty fills goals for next year, signs form, and clicks 'Submit FPI Form' (Status set to 'Submitted')."
    ])

    # Section 3
    add_heading_styled(doc, "3. Portal 2 — Department Admin & HOD Portal Workflow (role: 'dept_admin', isHod: true)", level=1)

    p3 = doc.add_paragraph()
    p3.paragraph_format.space_after = Pt(6)
    r3 = p3.add_run("The Department Admin & HOD Portal provides departmental oversight, read-only faculty verification, departmental duty assignment, Part-by-Part appraisal evaluation, and departmental report exports.")
    r3.font.name = 'Times New Roman'
    r3.font.size = Pt(14)

    hod_workflows = [
        ("Workflow 2.1 — Department Faculty Directory & Read-Only Profile Verification: ", "HOD/Dept Admin accesses Faculty Directory (/admin/faculty) to view department faculty listings. Opens Personal Details (/profile/personal) to inspect DOB, Gender, Mobile, PAN, Aadhaar, and Address. All input fields are explicitly disabled (disabled={auth.role === 'dept_admin'}) to prevent unauthorized editing."),
        ("Workflow 2.2 — Department Additional Responsibilities Assignment: ", "HOD accesses /responsibilities to assign official departmental additional duties (e.g. Class Advisor, Lab In-charge, Accreditation Coordinator) to department faculty members."),
        ("Workflow 2.3 — HOD Annual Appraisal Review & Part-by-Part Evaluation: ", "HOD opens Appraisal Form (/appraisal) and monitors pending department submissions (status === 'Submitted'). Opens Auto-Mapped Activity Verification Panel and clicks 👁️ View Proof next to publications, grants, patents, certifications, and events to inspect original uploaded evidence. Opens evaluation modal, enters HOD evaluated scores for PART A, B, C, D, adds feedback remarks, and clicks 'Approve & Forward to Principal/HR'. Form status updates to 'HOD Approved'."),
        ("Workflow 2.4 — Departmental Report & Dossier Generation: ", "HOD accesses Reports (/reports) to generate department-wide activity summaries, publication dossiers, and appraisal evaluation reports in PDF, Excel, and ZIP formats.")
    ]

    for t_wf, b_wf in hod_workflows:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(t_wf)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(15, 51, 31)
        r2 = bp.add_run(b_wf)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    add_diagram_box(doc, "HOD Part-by-Part Appraisal Verification & Score Evaluation", [
        "HOD monitors department submissions queue (Status: 'Submitted').",
        "HOD opens Auto-Mapped Activity Verification Panel and clicks 👁️ View Proof to verify uploaded evidence.",
        "HOD inputs evaluated marks for PART A, PART B, PART C, and PART D based on institutional rubric.",
        "HOD adds qualitative evaluation remarks and submits form.",
        "System updates appraisal status to 'HOD Approved' and forwards queue to Principal/HR."
    ])

    # Section 4
    add_heading_styled(doc, "4. Portal 3 — System Admin & Executive Portal Workflow (role: 'admin', 'principal', 'hr')", level=1)

    p4 = doc.add_paragraph()
    p4.paragraph_format.space_after = Pt(6)
    r4 = p4.add_run("The System Admin & Executive Portal equips Principal, HR, and System Administrators with institution-wide administration, full CRUD control, dynamic form building, appraisal rubric customization, final executive appraisal approval, and faculty transfer execution.")
    r4.font.name = 'Times New Roman'
    r4.font.size = Pt(14)

    adm_workflows = [
        ("Workflow 3.1 — Institution User Management & Full Profile CRUD: ", "Admin accesses System Admins (/admin/system-admins), Dept Admins (/admin/dept-admins), Faculty Directory (/admin/faculty), and Club Coordinators (/admin/clubs). Has full permission to edit personal/academic details, update designations, reset credentials, assign Coordinators & Co-Coordinators, or mark faculty as relieved (is_relieved === 1)."),
        ("Workflow 3.2 — Institutional Responsibilities Assignment: ", "Principal/HR/Admin accesses /responsibilities to assign institution-level additional responsibilities (e.g. NAAC Coordinator, IQAC Member, Anti-Ragging Committee) to any faculty across all departments."),
        ("Workflow 3.3 — Dynamic Page & Custom Form Builder: ", "Admin accesses Dynamic Page Builder (/admin/dynamic-pages) to create custom survey forms, feedback questionnaires, or data collection pages, specifying target portal visibility."),
        ("Workflow 3.4 — Appraisal Form Builder & Rubric Configurator (/appraisal): ", "Admin opens Form Builder tab in /appraisal to configure evaluation parameters: (a) Designation Overrides: Selects target designation (Assistant Professor, Associate Professor, Professor, Professor & Head) to customize unit marks and max caps. (b) Threshold Brackets (⚙️ Config Bracket): Configures cutoff thresholds (feedback 4.0 cutoff, pass % 80% cutoff, publication splits). (c) Custom PART Addition (➕ Add New PART): Adds new evaluation sections (PART_E, PART_F) and updates titles in real time."),
        ("Workflow 3.5 — Final Executive Appraisal Approval: ", "Executive Admin reviews HOD-approved submissions (status === 'HOD Approved'). Inspects auto-mapped proof documents (👁️ View Proof), inputs final executive scores and remarks, and clicks 'Final Approve'. Form status updates to 'Final Approved'."),
        ("Workflow 3.6 — Faculty Department Transfer Execution: ", "Admin initiates faculty transfer (/api/admin/faculty/transfer). System logs audit history in staff_department_history, updates staff_academics, moves physical storage directory from /SREC/{old_dept}/{staff_id}/ to /SREC/{new_dept}/{staff_id}/, remaps DB file paths, and re-queues faculty under new HOD.")
    ]

    for t_wf, b_wf in adm_workflows:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(t_wf)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(185, 28, 28)
        r2 = bp.add_run(b_wf)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    add_diagram_box(doc, "Faculty Department Transfer & Directory Relocation Lifecycle", [
        "System Admin submits transfer request at /api/admin/faculty/transfer (Old Dept -> New Dept).",
        "System inserts immutable audit record in staff_department_history.",
        "System updates Department field in staff_academics and updates admin_dep scope if applicable.",
        "Disk Mover (moveFacultyDirectory) relocates files: /SREC/OldDept/ID/ ➔ /SREC/NewDept/ID/.",
        "System remaps document path strings in activity tables and re-queues faculty under New Department HOD."
    ])

    # Save document
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../docs'))
    os.makedirs(docs_dir, exist_ok=True)
    out_path = os.path.join(docs_dir, "Complete_3_Portals_Workflow_Guide.docx")
    doc.save(out_path)
    print(f"Complete 3-Portal Workflow Word document successfully generated at: {out_path}")

if __name__ == "__main__":
    create_portal_workflows_document()
