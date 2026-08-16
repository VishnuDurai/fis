import db from '../db.js';

/**
 * Logs a critical action to the system audit trail
 * @param {Object} params
 * @param {string} params.actor_id - Staff ID or Username of person performing action
 * @param {string} params.actor_name - Full Name of actor
 * @param {string} params.actor_role - 'admin' | 'dept_admin' | 'faculty'
 * @param {string} params.action_type - e.g. 'SALUTATION_DR_PROMOTION', 'PASSWORD_RESET', 'FACULTY_TRANSFER', 'CAREER_UPDATE', 'ANNOUNCEMENT_POST'
 * @param {string} [params.target_id] - Target Staff ID or Entity ID
 * @param {string} [params.target_name] - Target faculty or resource name
 * @param {string|Object} [params.details] - Extra details or diffs
 * @param {string} [params.ip_address] - Client IP address
 */
export const logAuditEvent = ({
  actor_id,
  actor_name,
  actor_role,
  action_type,
  target_id = '',
  target_name = '',
  details = '',
  ip_address = ''
}) => {
  const detailStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

  db.run(`
    INSERT INTO system_audit_log (
      actor_id, actor_name, actor_role, action_type, target_id, target_name, details, ip_address
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    actor_id || 'SYSTEM',
    actor_name || 'System Admin',
    actor_role || 'admin',
    action_type || 'GENERAL_ACTION',
    target_id || '',
    target_name || '',
    detailStr,
    ip_address || ''
  ], (err) => {
    if (err) {
      console.error('Audit Logger Error:', err.message);
    }
  });
};
