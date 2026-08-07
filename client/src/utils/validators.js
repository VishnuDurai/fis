// Input Validation Helper Functions

export const validateStaffId = (id) => {
  if (!id || !id.trim()) return 'Staff ID is required.';
  const clean = id.trim().toUpperCase();
  if (!/^(TE\d{3,6}|SREC\d{3,6}|DEPT_[A-Z0-9_]+|ADMIN|[A-Z0-9_-]{3,15})$/i.test(clean)) {
    return 'Staff ID should follow the format TE followed by 4 digits (e.g. TE1024).';
  }
  return null;
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) return null;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. faculty@srec.ac.in).';
  }
  return null;
};

export const validateMobile = (mobile) => {
  if (!mobile || !mobile.trim()) return null;
  const digitsOnly = mobile.replace(/\D/g, '');
  if (digitsOnly.length !== 10 || !/^[6-9]\d{9}$/.test(digitsOnly)) {
    return 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
  }
  return null;
};

export const validatePan = (pan) => {
  if (!pan || !pan.trim()) return null;
  const clean = pan.trim().toUpperCase();
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(clean)) {
    return 'PAN Card number must be 10 characters in standard format (e.g. ABCDE1234F).';
  }
  return null;
};

export const validateAadhar = (aadhar) => {
  if (!aadhar || !aadhar.trim()) return null;
  const digitsOnly = aadhar.replace(/\D/g, '');
  if (digitsOnly.length !== 12) {
    return 'Aadhar number must be a 12-digit numeric number.';
  }
  return null;
};

export const validateAicteId = (id) => {
  if (!id || !id.trim()) return null;
  const clean = id.trim();
  if (!/^(1-\d{7,12}|[A-Z0-9-]{5,20})$/i.test(clean)) {
    return 'AICTE Faculty ID must follow format 1-12345678.';
  }
  return null;
};

export const validateAnnaUnivId = (id) => {
  if (!id || !id.trim()) return null;
  const clean = id.trim();
  if (!/^(AU-[A-Z0-9_-]{3,15}|[A-Z0-9_-]{4,15})$/i.test(clean)) {
    return 'Anna University ID must be in valid format (e.g. AU-9876).';
  }
  return null;
};

export const validateApaarId = (id) => {
  if (!id || !id.trim()) return null;
  const digitsOnly = id.replace(/\D/g, '');
  if (digitsOnly.length !== 12 && !/^[A-Z0-9-]{8,20}$/i.test(id.trim())) {
    return 'APAAR ID must be 12 digits or valid APAAR format.';
  }
  return null;
};

export const validatePercentage = (val) => {
  if (val === undefined || val === null || val === '') return null;
  const num = parseFloat(val);
  if (isNaN(num) || num < 0 || num > 100) {
    return 'Percentage / CGPA must be a number between 0 and 100.';
  }
  return null;
};

export const validateYear = (year) => {
  if (!year) return null;
  const num = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  if (isNaN(num) || num < 1950 || num > currentYear + 1) {
    return `Year of passing must be between 1950 and ${currentYear}.`;
  }
  return null;
};
