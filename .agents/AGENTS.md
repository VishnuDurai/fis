# Workspace Agent Rules & Guidelines

## Database Schema Documentation Maintenance
- Whenever there is any change to the database schema, table definitions, columns, or database engine in this repository, you MUST execute `python3 scripts/generate_schema_doc.py` to regenerate and update `Database_Schema.docx`.
- The backend (`server/db.js`) also automatically invokes `generate_schema_doc.py` upon database initialization to keep `Database_Schema.docx` synchronized.
