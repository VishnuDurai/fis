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

def create_technical_modification_guide():
    doc = Document()
    
    # Margins & Page Border
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
    run_title = title_p.add_run("TECHNICAL CONSTRAINTS & CODEBASE FILE MODIFICATION GUIDE")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(16)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(14)
    run_meta = meta_p.add_run(f"Document Generated: {datetime.datetime.now().strftime('%B %d, %Y')} | Version 3.0 | Status: Active Developer Guide")
    run_meta.font.name = 'Times New Roman'
    run_meta.font.size = Pt(11)
    run_meta.font.italic = True
    run_meta.font.color.rgb = RGBColor(100, 116, 139)

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

    # Section 1
    add_heading_styled(doc, "1. System Overview & Developer Quick Reference", level=1)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run("This technical manual specifies the exact code files, functions, and line ranges required to modify portal rules, menu visibility, role permissions, appraisal scoring algorithms, faculty transfer mechanisms, and file upload limits in the SREC FIS codebase.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    # Table 1: Feature to File Mapping
    table1 = doc.add_table(rows=1, cols=4)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    table1.autofit = False

    t1_headers = ["Constraint / Rule Feature", "Target File Path", "Key Function / Block", "Line Range"]
    t1_widths = [Inches(2.2), Inches(2.4), Inches(1.8), Inches(0.8)]

    for i, h in enumerate(t1_headers):
        table1.rows[0].cells[i].text = h
        table1.rows[0].cells[i].paragraphs[0].runs[0].font.bold = True
        table1.rows[0].cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
        table1.rows[0].cells[i].paragraphs[0].runs[0].font.name = 'Times New Roman'
        table1.rows[0].cells[i].paragraphs[0].runs[0].font.size = Pt(14)
        set_cell_background(table1.rows[0].cells[i], "0F331F")
        set_cell_margins(table1.rows[0].cells[i])
        table1.rows[0].cells[i].width = t1_widths[i]

    mappings = [
        ("Navigation Sidebar Items & Tree", "client/src/components/Sidebar.jsx", "getMenuStructure()", "L60-L325"),
        ("Navbar Role Labels & Switcher", "client/src/components/Navbar.jsx", "roleLabel / user menu", "L120-L135"),
        ("Role JWT Issuance & Claims", "server/routes/auth.js", "POST /api/auth/login", "L35-L130"),
        ("File Access JWT Guard", "server/server.js", "requireFileAuth middleware", "L28-L44"),
        ("Faculty Transfer & Folder Move", "server/routes/admin.js", "POST /api/admin/faculty/transfer", "L715-L755"),
        ("Physical Disk Directory Relocation", "server/utils/fileStorage.js", "moveFacultyDirectory()", "L230-L290"),
        ("Department Transfer History Schema", "server/db.js", "staff_department_history DDL", "L554-L561"),
        ("Appraisal Completed Academic Year", "client/src/utils/academicYear.js", "getAppraisalAcademicYear()", "L20-L33"),
        ("Appraisal Engine & Designation Overrides", "client/src/pages/Appraisal.jsx", "getConstraint()", "L3565-L3610"),
        ("Designation Filter & Copy Overrides", "client/src/pages/Appraisal.jsx", "Target Designation Bar", "L1585-L1640"),
        ("Threshold Bracket Configurator", "client/src/pages/Appraisal.jsx", "ruleModalItem modal", "L5120-L5210"),
        ("Custom PART / Section Addition", "client/src/pages/Appraisal.jsx", "showAddPartModal & distinctSections", "L5215-L5310"),
        ("Appraisal Approval Workflow & Remarks", "client/src/pages/Appraisal.jsx", "viewingAppraisal submit", "L3470-L3550"),
        ("Auto-Mapped Proof Document Links", "client/src/pages/Appraisal.jsx", "AutoMappedVerificationPanel", "L1227-L1490"),
        ("Faculty Read-Only Inputs (Dept Admin)", "client/src/pages/Personal.jsx", "disabled={auth.role === 'dept_admin'}", "L505-L545"),
        ("Responsibilities Hierarchy", "client/src/pages/Responsibilities.jsx", "isInstitutionalAdmin / isHod", "L25-L40"),
        ("Database Schema Definitions", "server/db.js", "tables DDL array", "L70-L570"),
        ("Auto-Doc Schema Script", "scripts/generate_schema_doc.py", "generate_schema_document()", "L1-L430"),
        ("Auto-Doc Constraints Script", "scripts/generate_system_constraints_doc.py", "create_system_constraints_doc()", "L1-L240"),
        ("Auto-Doc Technical Guide Script", "scripts/generate_tech_file_guide_doc.py", "create_technical_guide()", "L1-L250")
    ]

    for row_idx, (feat, fpath, ffunc, flines) in enumerate(mappings):
        row_cells = table1.add_row().cells
        bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
        for i, val in enumerate([feat, fpath, ffunc, flines]):
            row_cells[i].text = val
            p_cell = row_cells[i].paragraphs[0]
            p_cell.runs[0].font.name = 'Times New Roman'
            p_cell.runs[0].font.size = Pt(14)
            if i == 1 or i == 3:
                p_cell.runs[0].font.bold = True
                p_cell.runs[0].font.color.rgb = RGBColor(3, 105, 161)
            set_cell_background(row_cells[i], bg_color)
            set_cell_margins(row_cells[i])
            row_cells[i].width = t1_widths[i]

    set_table_borders(table1)
    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 2
    add_heading_styled(doc, "2. Detailed File Modification Instructions", level=1)

    sections_details = [
        ("A. Modifying Navigation Menu Links & Visibility Roles", "client/src/components/Sidebar.jsx", [
            ("To add/remove sidebar links: ", "Edit getMenuStructure() (Lines 62-300). Add new objects to baseMenu or category items array."),
            ("To change role-based menu toggles: ", "Modify role checks (e.g., if (role === 'admin'), if (isHod), if (isClubCoord)) in getMenuStructure()."),
            ("To inject custom pages: ", "Update allowedDynamicPages filter in Sidebar.jsx (Lines 303-320).")
        ]),
        ("B. Modifying Roles, Claims & Authorization", "server/routes/auth.js & server/server.js", [
            ("To add new role claims: ", "Edit POST /api/auth/login in server/routes/auth.js (Lines 110-130). Include new fields in jwt.sign()."),
            ("To change file access permissions: ", "Edit requireFileAuth middleware in server/server.js (Lines 28-44)."),
            ("To alter API authorization checks: ", "Update authenticateToken and role conditionals in server/routes/admin.js and faculty.js.")
        ]),
        ("C. Modifying Faculty Department Transfer Rules", "server/routes/admin.js & server/utils/fileStorage.js", [
            ("To update transfer audit logging: ", "Edit POST /api/admin/faculty/transfer in server/routes/admin.js (Lines 715-755)."),
            ("To adjust physical folder mover logic: ", "Edit moveFacultyDirectory() in server/utils/fileStorage.js (Lines 230-290)."),
            ("To change transfer history schema: ", "Update staff_department_history definition in server/db.js (Line 554).")
        ]),
        ("D. Modifying Performance Appraisal Rules & Form Builder", "client/src/pages/Appraisal.jsx & client/src/utils/academicYear.js", [
            ("To change default evaluation academic year: ", "Edit getAppraisalAcademicYear() in client/src/utils/academicYear.js (Lines 20-33)."),
            ("To alter score caps or designation overrides: ", "Edit getConstraint() in client/src/pages/Appraisal.jsx (Lines 3565-3610)."),
            ("To modify designation filter tabs: ", "Edit Target Designation Filter Bar in Appraisal.jsx (Lines 1585-1640)."),
            ("To adjust threshold bracket modal (⚙️ Config Bracket): ", "Edit ruleModalItem in Appraisal.jsx (Lines 5120-5210)."),
            ("To adjust custom PART addition (➕ Add New PART): ", "Edit showAddPartModal and distinctSections memo in Appraisal.jsx (Lines 5215-5310)."),
            ("To customize proof document viewing links: ", "Edit AutoMappedVerificationPanel in Appraisal.jsx (Lines 1227-1490).")
        ]),
        ("E. Modifying Document Storage & Upload Limits", "server/routes/activities.js & server/server.js", [
            ("To change upload file size limit (currently 5MB): ", "Edit multer upload config in server/routes/activities.js (Lines 13-25)."),
            ("To add new allowed file extensions: ", "Update file type validation regex in server/routes/activities.js and dynamic_pages.js.")
        ])
    ]

    for title, file_path, items in sections_details:
        add_heading_styled(doc, title, level=2)
        p_path = doc.add_paragraph()
        p_path.paragraph_format.space_after = Pt(4)
        r_p = p_path.add_run(f"Primary Code File: {file_path}")
        r_p.bold = True
        r_p.font.name = 'Times New Roman'
        r_p.font.size = Pt(14)
        r_p.font.color.rgb = RGBColor(3, 105, 161)

        for item_t, item_b in items:
            bp = doc.add_paragraph(style='List Bullet')
            bp.paragraph_format.space_after = Pt(3)
            r1 = bp.add_run(item_t)
            r1.bold = True
            r1.font.name = 'Times New Roman'
            r1.font.size = Pt(14)
            r2 = bp.add_run(item_b)
            r2.font.name = 'Times New Roman'
            r2.font.size = Pt(14)

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    # Section 3
    add_heading_styled(doc, "3. Auto-Documentation Maintenance Protocol", level=1)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("To ensure permanent synchronization between codebase changes and system documentation, the following automated generator scripts must be executed whenever code constraints or database structures are updated:")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(14)

    scripts = [
        ("Database Schema Document: ", "python3 scripts/generate_schema_doc.py -> Updates docs/Database_Schema.docx"),
        ("System Constraints & Rules Document: ", "python3 scripts/generate_system_constraints_doc.py -> Updates docs/System_Constraints_and_Portal_Rules.docx"),
        ("Technical File Modification Guide: ", "python3 scripts/generate_tech_file_guide_doc.py -> Updates docs/Technical_Constraints_and_File_Modification_Guide.docx")
    ]

    for s_title, s_desc in scripts:
        bp = doc.add_paragraph(style='List Bullet')
        bp.paragraph_format.space_after = Pt(4)
        r1 = bp.add_run(s_title)
        r1.bold = True
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(14)
        r1.font.color.rgb = RGBColor(15, 51, 31)
        r2 = bp.add_run(s_desc)
        r2.font.name = 'Times New Roman'
        r2.font.size = Pt(14)

    # Save document
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../docs'))
    os.makedirs(docs_dir, exist_ok=True)
    out_path = os.path.join(docs_dir, "Technical_Constraints_and_File_Modification_Guide.docx")
    doc.save(out_path)
    print(f"Technical modification guide Word document successfully generated at: {out_path}")

if __name__ == "__main__":
    create_technical_modification_guide()
