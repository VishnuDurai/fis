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

def add_diagram_box(doc, title, flow_steps):
    add_heading_styled(doc, f"❖ Database Architecture Diagram: {title}", level=2)
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
    r_t = p.add_run(f"SCHEMA LAYER DIAGRAM: {title.upper()}\n")
    r_t.font.name = 'Times New Roman'
    r_t.font.size = Pt(14)
    r_t.bold = True
    r_t.font.color.rgb = RGBColor(15, 51, 31)
    
    for idx, step in enumerate(flow_steps):
        p_step = cell.add_paragraph()
        p_step.paragraph_format.space_before = Pt(2)
        p_step.paragraph_format.space_after = Pt(4)
        
        step_prefix = f"► Schema Layer {idx+1}: "
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

SECTION_MAPPINGS = [
    {
        "category": "1. Authentication & System Administration",
        "description": "Tables managing administrator credentials, department admin accounts, and faculty login credentials.",
        "tables": ["admin", "admin_dep", "staff_user"]
    },
    {
        "category": "2. Faculty Personal & Academic Profiles",
        "description": "Core identity profiles, contact info, AICTE/Anna Univ IDs, experience tracking, qualifications, and document files.",
        "tables": ["staff_personal", "staff_academics", "staff_edu", "staff_member", "staff_pan", "staff_aadhar"]
    },
    {
        "category": "3. Research, Publications & Intellectual Property",
        "description": "Records of journal/conference publications, books, patents, grants, consultancy revenue, and Ph.D. guidance.",
        "tables": ["staff_publication", "staff_book_published", "staff_ipr", "staff_funding", "staff_development", "staff_scholars", "staff_supervisor", "staff_seed_money"]
    },
    {
        "category": "4. Events, Certifications & Professional Activities",
        "description": "FDPs/workshops attended or organized, resource person roles, club events, certifications, exams, and awards.",
        "tables": ["staff_interaction", "staff_resource", "staff_event_organized", "staff_club", "staff_award", "staff_certificate", "staff_competitive", "staff_innovative"]
    },
    {
        "category": "5. Performance Appraisals & Department Governance",
        "description": "Faculty self-appraisals (annual evaluations), FPI criteria templates, department level duty responsibilities, and transfer history logs.",
        "tables": ["staff_appraisal", "appraisal_template", "staff_responsibilities", "staff_department_history"]
    },
    {
        "category": "6. Master Lookup Tables",
        "description": "Standardized drop-down and lookup lists for departments, universities, professional bodies, designations, and clubs.",
        "tables": ["departments", "university", "professional", "designations", "clubs"]
    }
]

TABLE_DESCRIPTIONS = {
    "admin": "Stores system administrator credentials.",
    "admin_dep": "Stores department-level administrator credentials and department scope.",
    "staff_user": "Stores faculty login credentials and profile picture references.",
    "staff_personal": "Stores personal, contact, identification numbers (PAN, Aadhaar, AICTE, Anna Univ, APAAR), and identity documents.",
    "staff_academics": "Stores academic designation, department, qualification, and detailed breakdown of past and SREC experience.",
    "staff_edu": "Stores educational qualifications (UG, PG, Ph.D.), degrees, institutes, marks, and certificate file references.",
    "staff_member": "Stores memberships in professional societies (IEEE, CSI, ACM, etc.).",
    "staff_pan": "Upload path references for PAN card documents.",
    "staff_aadhar": "Upload path references for Aadhaar card documents.",
    "staff_publication": "Stores research papers published in journals and conferences with indexing and citation metrics.",
    "staff_book_published": "Stores books and book chapters published by faculty.",
    "staff_ipr": "Stores patents filed, published, or granted with institutional affiliations.",
    "staff_funding": "Stores research grants, funding agency details, sanctioned amounts, and project statuses.",
    "staff_development": "Stores consultancy projects and research & development revenue generation.",
    "staff_scholars": "Stores details of Ph.D. scholars guided by faculty members.",
    "staff_supervisor": "Stores Ph.D. supervisor recognition status and scholar counts.",
    "staff_interaction": "Stores FDPs, workshops, and seminars attended by faculty.",
    "staff_resource": "Stores roles acted as resource person, session chair, or guest speaker.",
    "staff_event_organized": "Stores seminars, workshops, and conferences organized by faculty.",
    "staff_club": "Stores club events and student chapter activities coordinated.",
    "staff_award": "Stores honors, awards, and recognitions received.",
    "staff_certificate": "Stores online courses completed (NPTEL, Coursera, etc.) and scores.",
    "staff_competitive": "Stores competitive exam achievements (GATE, NET, SET, etc.).",
    "staff_innovative": "Stores innovative teaching methodologies and project initiatives.",
    "staff_appraisal": "Stores annual faculty self-appraisal submissions and evaluation metrics.",
    "appraisal_template": "Stores master criteria, rubrics, and maximum marks for faculty performance index (FPI).",
    "staff_responsibilities": "Stores institutional and departmental responsibilities assigned to faculty.",
    "staff_department_history": "Stores faculty department transfer history log including effective transfer dates.",
    "staff_seed_money": "Stores internal seed money grants awarded for research projects.",
    "departments": "Lookup table for institutional academic departments and official acronyms.",
    "university": "Lookup table for standard university names.",
    "professional": "Lookup table for recognized professional societies.",
    "designations": "Lookup table for academic designations.",
    "clubs": "Lookup table for campus student clubs and technical societies with Faculty Incharge & Co-Faculty Incharge assignments."
}

def generate_docx():
    docs_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../docs'))
    os.makedirs(docs_dir, exist_ok=True)
    output_path = os.path.join(docs_dir, 'Database_Schema.docx')
    
    use_mysql = False
    tables_data = {}
    
    try:
        import pymysql
        conn = pymysql.connect(
            host='localhost',
            port=3306,
            user='root',
            password='',
            database='srec_fis',
            cursorclass=pymysql.cursors.DictCursor
        )
        cursor = conn.cursor()
        cursor.execute("SHOW TABLES")
        tables_res = cursor.fetchall()
        tbl_key = list(tables_res[0].keys())[0] if tables_res else 'Tables_in_srec_fis'
        existing_tables = set(r[tbl_key] for r in tables_res)
        
        for tname in existing_tables:
            cursor.execute(f"DESCRIBE `{tname}`")
            cols = cursor.fetchall()
            formatted_cols = []
            for cid, col in enumerate(cols):
                is_pk = col['Key'] == 'PRI'
                formatted_cols.append((
                    cid,
                    col['Field'],
                    col['Type'],
                    col['Null'] == 'NO',
                    col['Default'],
                    1 if is_pk else 0
                ))
            tables_data[tname] = formatted_cols
            
        use_mysql = True
        conn.close()
        print("Connected to MySQL 'srec_fis' database successfully.")
    except Exception as e:
        print(f"MySQL Connection fallback: {e}")
        import sqlite3
        db_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../server/fis.db'))
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
        existing_tables = set(row[0] for row in cursor.fetchall())
        for tname in existing_tables:
            cursor.execute(f"PRAGMA table_info('{tname}');")
            tables_data[tname] = cursor.fetchall()
        conn.close()

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
        
    # Dual Logo Header Table
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
    run_title = title_p.add_run("DATABASE ARCHITECTURE & TABLE SCHEMA REFERENCE")
    run_title.font.name = 'Times New Roman'
    run_title.font.size = Pt(16)
    run_title.bold = True
    run_title.font.color.rgb = RGBColor(15, 23, 42)
    
    # Metadata Table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    
    now_str = datetime.datetime.now().strftime("%B %d, %Y - %H:%M:%S")
    engine_name = "MySQL 9.7+ (srec_fis)" if use_mysql else "SQLite 3 (fis.db)"
    
    meta_data = [
        [("Database Engine:", True), (engine_name, False)],
        [("Last Synchronized:", True), (now_str, False)]
    ]
    
    for row_idx, row in enumerate(meta_data):
        for col_idx, (text, is_bold) in enumerate(row):
            cell = meta_table.cell(row_idx, col_idx)
            cell.width = Inches(3.5)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(3)
            p.paragraph_format.space_after = Pt(3)
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(14)
            run.font.bold = is_bold
            run.font.color.rgb = RGBColor(30, 41, 59)
            set_cell_background(cell, "F8FAFC")
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            
    set_table_borders(meta_table)
    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    add_diagram_box(doc, "Relational Entity Relationship (ER) & Schema Layering Architecture", [
        "Core Identity Layer: staff_user, staff_personal, staff_academics (Key: staff_id).",
        "R&D & Scholarly Layer: staff_publication, staff_book_published, staff_ipr, staff_funding, staff_seed_money, staff_scholars.",
        "Activities & Clubs Layer: staff_interaction, staff_resource, staff_event_organized, staff_club, staff_certificate, staff_award.",
        "Governance & Appraisal Layer: staff_responsibilities, clubs (Coordinators & Co-Coordinators), staff_appraisal, appraisal_template, staff_department_history.",
        "Master Lookup Layer: departments, university, professional, designations, clubs."
    ])
    
    processed_tables = set()
    existing_tables = set(tables_data.keys())
    
    # Iterate through structured sections
    for sec_idx, section_info in enumerate(SECTION_MAPPINGS):
        h1 = doc.add_paragraph()
        h1.paragraph_format.space_before = Pt(18)
        h1.paragraph_format.space_after = Pt(4)
        h1.paragraph_format.keep_with_next = True
        run_h1 = h1.add_run(section_info["category"])
        run_h1.font.name = 'Times New Roman'
        run_h1.font.size = Pt(16)
        run_h1.font.bold = True
        run_h1.font.color.rgb = RGBColor(15, 23, 42)
        
        p_desc = doc.add_paragraph()
        p_desc.paragraph_format.space_after = Pt(10)
        run_desc = p_desc.add_run(section_info["description"])
        run_desc.font.name = 'Times New Roman'
        run_desc.font.size = Pt(14)
        run_desc.font.italic = True
        run_desc.font.color.rgb = RGBColor(71, 85, 105)
        
        for tname in section_info["tables"]:
            if tname in tables_data:
                processed_tables.add(tname)
                cols_info = tables_data[tname]
                
                h2 = doc.add_paragraph()
                h2.paragraph_format.space_before = Pt(12)
                h2.paragraph_format.space_after = Pt(2)
                h2.paragraph_format.keep_with_next = True
                
                r_name = h2.add_run(f"Table: {tname}")
                r_name.font.name = 'Times New Roman'
                r_name.font.size = Pt(14)
                r_name.font.bold = True
                r_name.font.color.rgb = RGBColor(3, 105, 161)
                
                if tname in TABLE_DESCRIPTIONS:
                    r_tdesc = h2.add_run(f" — {TABLE_DESCRIPTIONS[tname]}")
                    r_tdesc.font.name = 'Times New Roman'
                    r_tdesc.font.size = Pt(14)
                    r_tdesc.font.color.rgb = RGBColor(71, 85, 105)
                
                # Render table
                tbl = doc.add_table(rows=1, cols=6)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                tbl.autofit = False
                
                hdr_cells = tbl.rows[0].cells
                headers = ["#", "Column Name", "Data Type", "Nullable", "Default Value", "Key"]
                col_widths = [Inches(0.4), Inches(2.2), Inches(1.5), Inches(0.9), Inches(1.3), Inches(0.7)]
                
                for i, head_text in enumerate(headers):
                    hdr_cells[i].text = head_text
                    hdr_cells[i].paragraphs[0].runs[0].font.bold = True
                    hdr_cells[i].paragraphs[0].runs[0].font.name = 'Times New Roman'
                    hdr_cells[i].paragraphs[0].runs[0].font.size = Pt(14)
                    hdr_cells[i].paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
                    set_cell_background(hdr_cells[i], "0F331F")
                    set_cell_margins(hdr_cells[i])
                    hdr_cells[i].width = col_widths[i]
                
                for row_idx, col in enumerate(cols_info):
                    row_cells = tbl.add_row().cells
                    cid, cname, ctype, notnull, dflt, pk = col[0], col[1], col[2], col[3], col[4], col[5]
                    
                    is_not_null = notnull if isinstance(notnull, bool) else (notnull == 1)
                    null_str = "No" if is_not_null else "Yes"
                    key_str = "PK" if pk else ""
                    dflt_str = str(dflt) if dflt is not None else "NULL"
                    
                    vals = [str(cid+1), cname, str(ctype).upper(), null_str, dflt_str, key_str]
                    bg_color = "F8FAFC" if row_idx % 2 == 0 else "FFFFFF"
                    
                    for c_i, v in enumerate(vals):
                        row_cells[c_i].text = v
                        p = row_cells[c_i].paragraphs[0]
                        p.paragraph_format.space_before = Pt(2)
                        p.paragraph_format.space_after = Pt(2)
                        run = p.add_run()
                        run.font.name = 'Times New Roman'
                        run.font.size = Pt(14)
                        if c_i == 1 and pk:
                            run.font.bold = True
                            run.font.color.rgb = RGBColor(185, 28, 28)
                        else:
                            run.font.color.rgb = RGBColor(30, 41, 59)
                        set_cell_background(row_cells[c_i], bg_color)
                        set_cell_margins(row_cells[c_i])
                        row_cells[c_i].width = col_widths[c_i]
                
                set_table_borders(tbl)
                doc.add_paragraph().paragraph_format.space_after = Pt(8)

    doc.save(output_path)
    print(f"Database schema Word document generated successfully at: {output_path}")

if __name__ == '__main__':
    generate_docx()
