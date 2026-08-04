import os
import datetime
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

# Helpers for XML styling of Word tables
def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), fill_hex)
    tcPr.append(shd)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
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

# Section descriptions & mappings
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
    "clubs": "Lookup table for campus student clubs and technical societies."
}

def generate_docx():
    output_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../Database_Schema.docx'))
    
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
            # DESCRIBE output: Field, Type, Null, Key, Default, Extra
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
    
    # Page setup - Margins & Footer
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)
        
        footer = section.footer
        footer_p = footer.paragraphs[0]
        footer_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        footer_p.paragraph_format.space_before = Pt(6)
        footer_run = footer_p.add_run("© 2026 FIS Team - Sri Ramakrishna Engineering College, Coimbatore | SREC FIS V3.0")
        footer_run.font.name = 'Arial'
        footer_run.font.size = Pt(9)
        footer_run.font.color.rgb = RGBColor(110, 110, 110)
        
    # Document Header
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(4)
    run_title = title_p.add_run("SREC FIS V3.0 - Faculty Information System")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(24)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(24, 43, 73)
    
    subtitle_p = doc.add_paragraph()
    subtitle_p.paragraph_format.space_before = Pt(0)
    subtitle_p.paragraph_format.space_after = Pt(18)
    run_sub = subtitle_p.add_run("Database Architecture & Table Schema Reference")
    run_sub.font.name = 'Arial'
    run_sub.font.size = Pt(14)
    run_sub.font.color.rgb = RGBColor(100, 110, 120)
    
    # Metadata Table
    meta_table = doc.add_table(rows=2, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_table.autofit = False
    
    now_str = datetime.datetime.now().strftime("%B %d, %Y - %H:%M:%S")
    engine_name = "MySQL 9.7+ (srec_fis)" if use_mysql else "SQLite 3 (fis.db)"
    
    meta_data = [
        [("Database Engine:", True), (engine_name, False)],
        [("Last Updated:", True), (now_str, False)]
    ]
    
    for row_idx, row in enumerate(meta_data):
        for col_idx, (text, is_bold) in enumerate(row):
            cell = meta_table.cell(row_idx, col_idx)
            cell.width = Inches(3.25)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            run = p.add_run(text)
            run.font.name = 'Arial'
            run.font.size = Pt(9.5)
            run.font.bold = is_bold
            run.font.color.rgb = RGBColor(50, 50, 50)
            set_cell_background(cell, "F0F4F8")
            set_cell_margins(cell, top=60, bottom=60, left=100, right=100)
            
    doc.add_paragraph().paragraph_format.space_after = Pt(12)
    
    processed_tables = set()
    existing_tables = set(tables_data.keys())
    
    # Iterate through structured sections
    for sec_idx, section_info in enumerate(SECTION_MAPPINGS):
        h1 = doc.add_paragraph()
        h1.paragraph_format.space_before = Pt(16)
        h1.paragraph_format.space_after = Pt(4)
        h1.paragraph_format.keep_with_next = True
        run_h1 = h1.add_run(section_info["category"])
        run_h1.font.name = 'Arial'
        run_h1.font.size = Pt(15)
        run_h1.font.bold = True
        run_h1.font.color.rgb = RGBColor(24, 43, 73)
        
        desc_p = doc.add_paragraph()
        desc_p.paragraph_format.space_before = Pt(0)
        desc_p.paragraph_format.space_after = Pt(10)
        desc_p.paragraph_format.keep_with_next = True
        run_desc = desc_p.add_run(section_info["description"])
        run_desc.font.name = 'Arial'
        run_desc.font.size = Pt(9.5)
        run_desc.font.italic = True
        run_desc.font.color.rgb = RGBColor(90, 90, 90)
        
        for table_name in section_info["tables"]:
            if table_name not in existing_tables:
                continue
                
            processed_tables.add(table_name)
            
            h2 = doc.add_paragraph()
            h2.paragraph_format.space_before = Pt(12)
            h2.paragraph_format.space_after = Pt(2)
            h2.paragraph_format.keep_with_next = True
            run_h2 = h2.add_run(f"Table: {table_name}")
            run_h2.font.name = 'Arial'
            run_h2.font.size = Pt(12)
            run_h2.font.bold = True
            run_h2.font.color.rgb = RGBColor(40, 70, 115)
            
            if table_name in TABLE_DESCRIPTIONS:
                tbl_desc = doc.add_paragraph()
                tbl_desc.paragraph_format.space_before = Pt(0)
                tbl_desc.paragraph_format.space_after = Pt(6)
                tbl_desc.paragraph_format.keep_with_next = True
                r = tbl_desc.add_run(TABLE_DESCRIPTIONS[table_name])
                r.font.name = 'Arial'
                r.font.size = Pt(9)
                r.font.color.rgb = RGBColor(80, 80, 80)
            
            columns = tables_data[table_name]
            
            table = doc.add_table(rows=1, cols=5)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            table.autofit = False
            set_table_borders(table, color="D0D7DE", sz="4")
            
            hdr_cells = table.rows[0].cells
            headers = [("Column Name", 1.8), ("Data Type", 1.2), ("Key", 0.6), ("Default", 1.0), ("Nullable", 0.9)]
            
            for idx, (header_text, col_width) in enumerate(headers):
                hdr_cells[idx].width = Inches(col_width)
                p = hdr_cells[idx].paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                run = p.add_run(header_text)
                run.font.name = 'Arial'
                run.font.size = Pt(9)
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                set_cell_background(hdr_cells[idx], "182B49")
                set_cell_margins(hdr_cells[idx], top=80, bottom=80, left=100, right=100)
                
            trPr = table.rows[0]._tr.get_or_add_trPr()
            trPr.append(OxmlElement('w:tblHeader'))
            
            for col_info in columns:
                cid, name, col_type, notnull, dflt_value, pk = col_info
                
                row_cells = table.add_row().cells
                trPr = table.rows[-1]._tr.get_or_add_trPr()
                trPr.append(OxmlElement('w:cantSplit'))
                
                pk_str = "PK" if pk else ("FK" if name.endswith('_id') and name != 'id' else "")
                default_str = str(dflt_value) if dflt_value is not None else "-"
                nullable_str = "No" if notnull else "Yes"
                col_type_str = col_type if col_type else "TEXT"
                
                row_data = [
                    (name, True, RGBColor(30, 30, 30)),
                    (col_type_str, False, RGBColor(70, 70, 70)),
                    (pk_str, True, RGBColor(180, 40, 40) if pk else RGBColor(70, 70, 70)),
                    (default_str, False, RGBColor(90, 90, 90)),
                    (nullable_str, False, RGBColor(90, 90, 90))
                ]
                
                bg_color = "F9FAFB" if (cid % 2 == 1) else "FFFFFF"
                
                for idx, (val_text, is_bold, color_rgb) in enumerate(row_data):
                    col_width = headers[idx][1]
                    cell = row_cells[idx]
                    cell.width = Inches(col_width)
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    run = p.add_run(val_text)
                    run.font.name = 'Consolas' if idx in [0, 1] else 'Arial'
                    run.font.size = Pt(8.5)
                    run.font.bold = is_bold
                    run.font.color.rgb = color_rgb
                    set_cell_background(cell, bg_color)
                    set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
                    
            doc.add_paragraph().paragraph_format.space_after = Pt(8)
            
    # Remaining tables
    remaining = existing_tables - processed_tables
    if remaining:
        h1 = doc.add_paragraph()
        h1.paragraph_format.space_before = Pt(16)
        h1.paragraph_format.space_after = Pt(4)
        run_h1 = h1.add_run("7. Other Database Tables")
        run_h1.font.name = 'Arial'
        run_h1.font.size = Pt(15)
        run_h1.font.bold = True
        run_h1.font.color.rgb = RGBColor(24, 43, 73)
        
        for table_name in sorted(remaining):
            h2 = doc.add_paragraph()
            h2.paragraph_format.space_before = Pt(12)
            h2.paragraph_format.space_after = Pt(2)
            run_h2 = h2.add_run(f"Table: {table_name}")
            run_h2.font.name = 'Arial'
            run_h2.font.size = Pt(12)
            run_h2.font.bold = True
            
            columns = tables_data[table_name]
            
            table = doc.add_table(rows=1, cols=5)
            table.alignment = WD_TABLE_ALIGNMENT.CENTER
            set_table_borders(table, color="D0D7DE", sz="4")
            
            hdr_cells = table.rows[0].cells
            headers = [("Column Name", 1.8), ("Data Type", 1.2), ("Key", 0.6), ("Default", 1.0), ("Nullable", 0.9)]
            for idx, (header_text, col_width) in enumerate(headers):
                hdr_cells[idx].width = Inches(col_width)
                p = hdr_cells[idx].paragraphs[0]
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)
                run = p.add_run(header_text)
                run.font.name = 'Arial'
                run.font.size = Pt(9)
                run.font.bold = True
                run.font.color.rgb = RGBColor(255, 255, 255)
                set_cell_background(hdr_cells[idx], "182B49")
                set_cell_margins(hdr_cells[idx], top=80, bottom=80, left=100, right=100)
                
            for col_info in columns:
                cid, name, col_type, notnull, dflt_value, pk = col_info
                row_cells = table.add_row().cells
                pk_str = "PK" if pk else ""
                default_str = str(dflt_value) if dflt_value is not None else "-"
                nullable_str = "No" if notnull else "Yes"
                
                row_data = [
                    (name, True, RGBColor(30, 30, 30)),
                    (col_type if col_type else "TEXT", False, RGBColor(70, 70, 70)),
                    (pk_str, True, RGBColor(180, 40, 40) if pk else RGBColor(70, 70, 70)),
                    (default_str, False, RGBColor(90, 90, 90)),
                    (nullable_str, False, RGBColor(90, 90, 90))
                ]
                
                bg_color = "F9FAFB" if (cid % 2 == 1) else "FFFFFF"
                for idx, (val_text, is_bold, color_rgb) in enumerate(row_data):
                    cell = row_cells[idx]
                    cell.width = Inches(headers[idx][1])
                    p = cell.paragraphs[0]
                    p.paragraph_format.space_before = Pt(3)
                    p.paragraph_format.space_after = Pt(3)
                    run = p.add_run(val_text)
                    run.font.name = 'Consolas' if idx in [0, 1] else 'Arial'
                    run.font.size = Pt(8.5)
                    run.font.bold = is_bold
                    run.font.color.rgb = color_rgb
                    set_cell_background(cell, bg_color)
                    set_cell_margins(cell, top=50, bottom=50, left=80, right=80)
            doc.add_paragraph().paragraph_format.space_after = Pt(8)
            
    doc.save(output_path)
    print(f"Schema Word document successfully generated and updated at: {output_path}")

if __name__ == '__main__':
    generate_docx()
