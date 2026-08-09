# Workspace Agent Rules & Guidelines

## Database Schema Documentation Maintenance
- Whenever there is any change to the database schema, table definitions, columns, or database engine in this repository, you MUST execute `python3 scripts/generate_schema_doc.py` to regenerate and update `Database_Schema.docx`.
- The backend (`server/db.js`) also automatically invokes `generate_schema_doc.py` upon database initialization to keep `Database_Schema.docx` synchronized.

## System Constraints & Portal Rules Documentation Maintenance
- Whenever there is any new constraint, rule, menu permission logic, role handling, or functionality permission defined or modified in this repository, you MUST execute `python3 scripts/generate_system_constraints_doc.py` to regenerate and update `System_Constraints_and_Portal_Rules.docx`.
- The generator script (`scripts/generate_system_constraints_doc.py`) regenerates and synchronizes `System_Constraints_and_Portal_Rules.docx` to reflect all system rules and constraints.
