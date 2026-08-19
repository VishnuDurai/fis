/**
 * SREC FIS V3.2 — Bulk Certificate Processing & ZIP Generation Engine
 * Handles batch rendering with live progress tracking, non-blocking fault tolerance, deterministic numbering, and JSZip archiving.
 */

import JSZip from 'jszip';
import { generateSingleCertificatePdf, generateCombinedCertificatesPdf } from './pdfExportEngine.js';

/**
 * Downloads a Blob directly in the browser with sanitized filename
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/**
 * Sanitizes participant names for filenames (e.g. "Dr. S. Karthik" -> "001_Dr_S_Karthik.pdf")
 */
export const sanitizeFilenamePart = (str) => {
  return String(str || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .replace(/__+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 40);
};

/**
 * Generates deterministic certificate numbers for a batch
 */
export const computeCertificateNumbers = (deptCode = 'GEN', eventTitle = 'EVENT', year = new Date().getFullYear(), count = 1) => {
  const cleanEvent = (eventTitle.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) || 'EVENT').toUpperCase();
  const numbers = [];
  for (let i = 1; i <= count; i++) {
    const seq = String(i).padStart(3, '0');
    numbers.push(`SREC/${deptCode.toUpperCase()}/${year}/${cleanEvent}/${seq}`);
  }
  return numbers;
};

/**
 * Batch Processes Certificates with Live Progress and JSZip Archiving
 */
export const processBulkCertificates = async ({
  templateId,
  participants = [],
  eventData = {},
  onProgress = () => {}
}) => {
  const validParticipants = participants.filter(p => p.status === 'Ready' || p.status === 'Duplicate');
  const total = validParticipants.length;

  if (total === 0) {
    throw new Error('No valid participant records to generate certificates for.');
  }

  const deptCode = eventData.departmentCode || 'GEN';
  const certNumbers = computeCertificateNumbers(deptCode, eventData.title, new Date().getFullYear(), total);

  const zip = new JSZip();
  const folderName = `Participation_Certificates_${sanitizeFilenamePart(eventData.title || 'Event')}`;
  const certFolder = zip.folder(folderName);

  let successCount = 0;
  let failedCount = 0;
  const errors = [];

  for (let i = 0; i < total; i++) {
    const p = validParticipants[i];
    const certNumber = certNumbers[i];
    p.certificateNumber = certNumber;

    onProgress({
      current: i + 1,
      total,
      participantName: p.name,
      percentage: Math.round(((i + 1) / total) * 100)
    });

    try {
      const certPayload = {
        participantName: p.name,
        designation: p.designation,
        organization: p.organization,
        eventTitle: eventData.title,
        eventType: eventData.type,
        department: eventData.department,
        fromDate: eventData.fromDate,
        toDate: eventData.toDate,
        certificateNumber: certNumber,
        signatories: eventData.signatories || {}
      };

      const pdfDoc = generateSingleCertificatePdf(templateId, certPayload);
      const pdfData = pdfDoc.output('arraybuffer');

      const seqNum = String(i + 1).padStart(3, '0');
      const safeName = sanitizeFilenamePart(p.name);
      const filename = `${seqNum}_${safeName}.pdf`;

      certFolder.file(filename, pdfData);
      successCount++;
    } catch (err) {
      console.error(`Failed to generate certificate for ${p.name}:`, err);
      failedCount++;
      errors.push({ name: p.name, error: err.message });
    }

    // Yield execution momentarily for UI reactivity
    if (i % 5 === 0) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  const zipArrayBuf = await zip.generateAsync({ type: 'arraybuffer', compression: 'DEFLATE' });
  const zipBlob = typeof Blob !== 'undefined' ? new Blob([zipArrayBuf], { type: 'application/zip' }) : zipArrayBuf;

  return {
    total,
    successCount,
    failedCount,
    errors,
    zipBlob,
    zipArrayBuf,
    folderName,
    participantsWithNumbers: validParticipants
  };
};
