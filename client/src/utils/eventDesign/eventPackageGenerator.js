/**
 * SREC FIS V3.2.1 — ONE-CLICK COMPLETE EVENT PACKAGE GENERATOR
 * Orchestrates generation of Poster, Invitation, Individual Certificates,
 * Merged Certificate PDF, and Institutional Event Summary into a unified ZIP package.
 */

import JSZip from 'jszip';
import {
  generatePosterPdf,
  generateInvitationPdf,
  generateSingleCertificatePdf,
  generateCombinedCertificatesPdf,
  generateEventSummaryPdf
} from './pdfExportEngine.js';
import { sanitizeFilenamePart } from './bulkCertificateProcessor.js';

export const generateCompleteEventPackage = async ({
  eventData = {},
  posterTemplate = 'P01',
  invitationTemplate = 'I01',
  certificateTemplate = 'C01',
  participants = [],
  signatories = {},
  onProgress = () => {}
}) => {
  const zip = new JSZip();
  const year = new Date().getFullYear();
  const cleanTitle = sanitizeFilenamePart(eventData.title || 'Event');
  const cleanDeptCode = (eventData.departmentCode || 'GEN').toUpperCase();
  const cleanEventCode = (eventData.title?.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) || 'EVT').toUpperCase();

  const itemStatuses = {
    poster: 'PENDING',
    invitation: 'PENDING',
    certificates: 'PENDING',
    combinedPdf: 'PENDING',
    summary: 'PENDING',
    zip: 'PENDING'
  };

  const errors = {};
  const blobs = {
    posterBlob: null,
    invitationBlob: null,
    combinedCertsBlob: null,
    summaryBlob: null,
    zipBlob: null
  };

  // Step 1: Preparing Event Data
  onProgress({
    step: 1,
    stepName: 'Preparing Event Data',
    percentage: 10,
    status: 'IN_PROGRESS'
  });

  const fullEventPayload = {
    ...eventData,
    signatories
  };

  // Step 2: Generating Poster PDF
  onProgress({
    step: 2,
    stepName: 'Generating Poster PDF',
    percentage: 25,
    status: 'IN_PROGRESS'
  });

  try {
    const posterDoc = generatePosterPdf(posterTemplate, fullEventPayload);
    const posterData = posterDoc.output('arraybuffer');
    blobs.posterBlob = typeof Blob !== 'undefined' ? new Blob([posterData], { type: 'application/pdf' }) : Buffer.from(posterData);
    zip.file('01_Poster.pdf', posterData);
    itemStatuses.poster = 'SUCCESS';
  } catch (err) {
    console.error('Poster generation failed in package:', err);
    itemStatuses.poster = 'FAILED';
    errors.poster = err.message;
  }

  // Step 3: Generating Invitation PDF
  onProgress({
    step: 3,
    stepName: 'Generating Invitation PDF',
    percentage: 40,
    status: 'IN_PROGRESS'
  });

  try {
    const invDoc = generateInvitationPdf(invitationTemplate, fullEventPayload);
    const invData = invDoc.output('arraybuffer');
    blobs.invitationBlob = typeof Blob !== 'undefined' ? new Blob([invData], { type: 'application/pdf' }) : Buffer.from(invData);
    zip.file('02_Invitation.pdf', invData);
    itemStatuses.invitation = 'SUCCESS';
  } catch (err) {
    console.error('Invitation generation failed in package:', err);
    itemStatuses.invitation = 'FAILED';
    errors.invitation = err.message;
  }

  // Step 4 & 5: Generating Certificates
  const validParticipants = participants.filter(p => p && p.status !== 'Error' && (p.name || '').trim());
  const certRangeStart = validParticipants.length > 0
    ? `SREC/${cleanDeptCode}/${year}/${cleanEventCode}/001`
    : 'N/A';
  const certRangeEnd = validParticipants.length > 0
    ? `SREC/${cleanDeptCode}/${year}/${cleanEventCode}/${String(validParticipants.length).padStart(3, '0')}`
    : 'N/A';

  if (validParticipants.length > 0) {
    onProgress({
      step: 4,
      stepName: `Generating ${validParticipants.length} Certificates`,
      percentage: 55,
      status: 'IN_PROGRESS'
    });

    try {
      const certsFolder = zip.folder('03_Certificates');
      validParticipants.forEach((p, idx) => {
        const certNo = p.certificateNumber || `SREC/${cleanDeptCode}/${year}/${cleanEventCode}/${String(idx + 1).padStart(3, '0')}`;
        const certPayload = {
          participantName: p.name,
          designation: p.designation || 'Participant',
          organization: p.organization || 'Sri Ramakrishna Engineering College',
          eventTitle: eventData.title,
          eventType: eventData.type,
          department: eventData.department,
          fromDate: eventData.fromDate,
          toDate: eventData.toDate,
          certificateNumber: certNo,
          signatories
        };

        const singleDoc = generateSingleCertificatePdf(certificateTemplate, certPayload);
        const singleData = singleDoc.output('arraybuffer');
        const filename = `Certificate_${String(idx + 1).padStart(3, '0')}_${sanitizeFilenamePart(p.name)}.pdf`;
        certsFolder.file(filename, singleData);
      });
      itemStatuses.certificates = 'SUCCESS';
    } catch (err) {
      console.error('Certificate generation failed in package:', err);
      itemStatuses.certificates = 'FAILED';
      errors.certificates = err.message;
    }

    // Step 6: Generating Combined Certificates PDF
    onProgress({
      step: 5,
      stepName: 'Creating Combined Certificates PDF',
      percentage: 75,
      status: 'IN_PROGRESS'
    });

    try {
      const combinedDoc = generateCombinedCertificatesPdf(certificateTemplate, validParticipants, fullEventPayload);
      const combinedData = combinedDoc.output('arraybuffer');
      blobs.combinedCertsBlob = typeof Blob !== 'undefined' ? new Blob([combinedData], { type: 'application/pdf' }) : Buffer.from(combinedData);
      zip.file('04_Combined_Certificates.pdf', combinedData);
      itemStatuses.combinedPdf = 'SUCCESS';
    } catch (err) {
      console.error('Combined PDF generation failed in package:', err);
      itemStatuses.combinedPdf = 'FAILED';
      errors.combinedPdf = err.message;
    }
  } else {
    itemStatuses.certificates = 'SKIPPED';
    itemStatuses.combinedPdf = 'SKIPPED';
  }

  // Step 7: Generating Event Summary PDF
  onProgress({
    step: 6,
    stepName: 'Creating Event Summary PDF',
    percentage: 85,
    status: 'IN_PROGRESS'
  });

  try {
    const summaryPayload = {
      title: eventData.title,
      type: eventData.type,
      department: eventData.department,
      coOrganizedBy: eventData.coOrganizedBy,
      inAssociationWith: eventData.inAssociationWith,
      fromDate: eventData.fromDate,
      toDate: eventData.toDate,
      time: eventData.time,
      venue: eventData.venue,
      resourcePerson: eventData.resourcePerson,
      resDesignation: eventData.resDesignation,
      resOrganization: eventData.resOrganization,
      posterTemplate,
      invitationTemplate,
      certificateTemplate,
      participantCount: validParticipants.length,
      certRangeStart,
      certRangeEnd,
      facultyCoordinator: signatories?.facultyCoordinator?.name || '',
      hod: signatories?.hod?.name || '',
      principal: signatories?.principal?.name || ''
    };

    const summaryDoc = generateEventSummaryPdf(summaryPayload);
    const summaryData = summaryDoc.output('arraybuffer');
    blobs.summaryBlob = typeof Blob !== 'undefined' ? new Blob([summaryData], { type: 'application/pdf' }) : Buffer.from(summaryData);
    zip.file('05_Event_Summary.pdf', summaryData);
    itemStatuses.summary = 'SUCCESS';
  } catch (err) {
    console.error('Event summary generation failed in package:', err);
    itemStatuses.summary = 'FAILED';
    errors.summary = err.message;
  }

  // Step 8: Writing Safe Event Metadata JSON
  const safeMetadata = {
    institution: 'Sri Ramakrishna Engineering College, Coimbatore',
    eventTitle: eventData.title,
    eventType: eventData.type,
    department: eventData.department,
    departmentCode: cleanDeptCode,
    date: eventData.fromDate ? (eventData.toDate ? `${eventData.fromDate} to ${eventData.toDate}` : eventData.fromDate) : '',
    venue: eventData.venue,
    resourcePerson: eventData.resourcePerson,
    templates: {
      poster: posterTemplate,
      invitation: invitationTemplate,
      certificate: certificateTemplate
    },
    participantCount: validParticipants.length,
    certificateRange: {
      start: certRangeStart,
      end: certRangeEnd
    },
    generationTimestamp: new Date().toISOString(),
    status: itemStatuses
  };

  zip.file('06_Event_Metadata.json', JSON.stringify(safeMetadata, null, 2));

  // Step 9: Creating Final ZIP Archive
  onProgress({
    step: 7,
    stepName: 'Assembling Complete Event ZIP Package',
    percentage: 95,
    status: 'IN_PROGRESS'
  });

  const hasSuccess = Object.values(itemStatuses).some(s => s === 'SUCCESS');
  const hasFailure = Object.values(itemStatuses).some(s => s === 'FAILED');
  const generationStatus = !hasFailure ? 'COMPLETED' : hasSuccess ? 'PARTIAL' : 'FAILED';

  let zipBlob = null;
  const zipFilename = `SREC_${cleanDeptCode}_${cleanTitle}_Event_Package.zip`;

  if (hasSuccess) {
    zipBlob = await zip.generateAsync({
      type: typeof window !== 'undefined' ? 'blob' : 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });
    blobs.zipBlob = zipBlob;
    itemStatuses.zip = 'SUCCESS';
  } else {
    itemStatuses.zip = 'FAILED';
  }

  onProgress({
    step: 8,
    stepName: 'Package Generation Completed',
    percentage: 100,
    status: 'COMPLETED'
  });

  return {
    zipBlob,
    zipFilename,
    blobs,
    metadata: safeMetadata,
    generationStatus,
    itemStatuses,
    errors,
    certRangeStart,
    certRangeEnd,
    participantCount: validParticipants.length
  };
};
