# Workspace Agent Rules & Guidelines

## Database Schema & ER Diagram Documentation Maintenance
- Whenever there is any change to the database schema, table definitions, columns, relationships, or database engine in this repository, you MUST execute `python3 scripts/generate_schema_doc.py` to regenerate the Entity-Relationship (ER) Diagram image (`docs/er_diagram.png`) and update `docs/Database_Schema.docx`.
- The generator script (`scripts/generate_schema_doc.py`) dynamically renders the updated ER Diagram image and embeds it into `docs/Database_Schema.docx`.
- The backend (`server/db.js`) also automatically invokes `generate_schema_doc.py` upon database initialization to keep both `docs/er_diagram.png` and `docs/Database_Schema.docx` synchronized.

## System Constraints & Portal Rules Documentation Maintenance
- Whenever there is any new constraint, rule, menu permission logic, role handling, or functionality permission defined or modified in this repository, you MUST execute `python3 scripts/generate_system_constraints_doc.py` to regenerate and update `docs/System_Constraints_and_Portal_Rules.docx`.
- The generator script (`scripts/generate_system_constraints_doc.py`) regenerates and synchronizes `docs/System_Constraints_and_Portal_Rules.docx` to reflect all system rules and constraints.

## Technical Codebase Constraints & File Modification Guide Maintenance
- Whenever there is any change to codebase file structures, permission handler locations, appraisal scoring algorithms, menu item definitions, or technical constraints, you MUST execute `python3 scripts/generate_tech_file_guide_doc.py` to regenerate and update `docs/Technical_Constraints_and_File_Modification_Guide.docx`.
- The generator script (`scripts/generate_tech_file_guide_doc.py`) regenerates and synchronizes `docs/Technical_Constraints_and_File_Modification_Guide.docx` to ensure developers have up-to-date technical reference maps for file modifications.

## Complete 3-Portals Workflow Guide Maintenance
- Whenever there is any change to user workflows, portal interaction lifecycles, approval processes, or role-based user navigation flows across any of the 3 portals, you MUST execute `python3 scripts/generate_portal_workflows_doc.py` to regenerate and update `docs/Complete_3_Portals_Workflow_Guide.docx`.
- The generator script (`scripts/generate_portal_workflows_doc.py`) regenerates and synchronizes `docs/Complete_3_Portals_Workflow_Guide.docx` to reflect all operational user workflows across all 3 portals.
