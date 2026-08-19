/**
 * SREC FIS V3.2 — EVENT DESIGN & CERTIFICATE GENERATION SUITE
 * Complete institutional design suite for Event Posters, Invitations, and Bulk Participation Certificates.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Palette,
  FileText,
  Award,
  Download,
  Upload,
  Sparkles,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  Building,
  Image as ImageIcon,
  Layers,
  Printer,
  Archive,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { POSTER_TEMPLATES, renderPosterHtml } from '../utils/eventDesign/posterTemplates.js';
import { INVITATION_TEMPLATES, renderInvitationHtml } from '../utils/eventDesign/invitationTemplates.js';
import { CERTIFICATE_TEMPLATES, renderCertificateHtml } from '../utils/eventDesign/certificateTemplates.js';
import {
  generatePosterPdf,
  generateInvitationPdf,
  generateSingleCertificatePdf,
  generateCombinedCertificatesPdf,
  generateEventSummaryPdf
} from '../utils/eventDesign/pdfExportEngine.js';
import {
  processBulkCertificates,
  downloadBlob,
  sanitizeFilenamePart
} from '../utils/eventDesign/bulkCertificateProcessor.js';
import { generateCompleteEventPackage } from '../utils/eventDesign/eventPackageGenerator.js';
import { useAlert } from '../context/AlertContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function EventDesignSuite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useAlert();

  // Active Tab (Poster, Invitation, Certificate, Package, Gallery, History)
  const initialType = searchParams.get('type') || 'poster';
  const [activeTab, setActiveTab] = useState(
    initialType === 'invitation' ? 'invitation' : initialType === 'certificate' ? 'certificate' : initialType === 'package' ? 'package' : 'poster'
  );

  // Authenticated Faculty & Event State
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [facultyDept, setFacultyDept] = useState('ARTIFICIAL INTELLIGENCE AND DATA SCIENCE');
  const [facultyDeptCode, setFacultyDeptCode] = useState('AD');
  const [facultyName, setFacultyName] = useState('');
  const [facultyEvents, setFacultyEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(searchParams.get('eventId') || '');
  const [signatories, setSignatories] = useState({
    facultyCoordinator: { roleTitle: 'Faculty Coordinator', name: 'Dr. Faculty Coordinator', designation: 'Faculty Coordinator' },
    hod: { roleTitle: 'HOD', name: 'Head of the Department', designation: 'Professor & Head' },
    principal: { roleTitle: 'Principal', name: 'Dr. N. R. Alamelu', designation: 'Principal' }
  });

  // Form State (Shared / Reused)
  const [eventForm, setEventForm] = useState({
    title: 'National Conference on Emerging AI & Intelligent Systems',
    theme: 'Innovations for Sustainable Industry 4.0',
    type: 'Conference',
    department: 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE',
    departmentCode: 'AD',
    coOrganizedBy: '',
    inAssociationWith: 'IEEE Computer Society & ACM SREC Chapter',
    resourcePerson: 'Dr. V. Rajesh, Principal AI Architect',
    resDesignation: 'Principal AI Architect & Fellow',
    resOrganization: 'Cognitive Computing Labs, Bangalore',
    fromDate: '2026-09-22',
    toDate: '2026-09-23',
    time: '09:30 AM - 04:30 PM',
    venue: 'Auditorium & AI Center of Excellence, SREC Campus',
    presidedBy: 'Dr. N. R. Alamelu, Principal, SREC',
    description: 'A comprehensive two-day forum bringing together leading researchers, academicians, and practitioners to discuss state-of-the-art developments in AI, deep learning, and intelligent automation.',
    organizerLogo: '',
    associationLogo: '',
    eventLogo: '',
    resourcePersonPhoto: '',
    speakerPhoto: ''
  });

  // Selected Templates
  const [selectedPosterTemplate, setSelectedPosterTemplate] = useState('P01');
  const [selectedInvitationTemplate, setSelectedInvitationTemplate] = useState('I01');
  const [selectedCertificateTemplate, setSelectedCertificateTemplate] = useState('C01');

  // Participation Certificates State
  const [participants, setParticipants] = useState([
    { sno: 1, name: 'Dr. S. Karthik', designation: 'Associate Professor', organization: 'Sri Ramakrishna Engineering College', email: 'karthik.s@srec.ac.in', status: 'Ready', errorReason: '' },
    { sno: 2, name: 'Ms. R. Priya', designation: 'Assistant Professor', organization: 'PSG College of Technology', email: 'priya.r@psgtech.ac.in', status: 'Ready', errorReason: '' },
    { sno: 3, name: 'Mr. K. Vignesh', designation: 'Research Scholar', organization: 'Sri Ramakrishna Engineering College', email: 'vignesh.k@srec.ac.in', status: 'Ready', errorReason: '' }
  ]);
  const [uploadingParticipants, setUploadingParticipants] = useState(false);
  const [singlePreviewCert, setSinglePreviewCert] = useState(null);

  // Bulk Progress State
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, participantName: '', percentage: 0 });
  const [bulkResult, setBulkResult] = useState(null);

  // Generated Designs History
  const [generatedDesigns, setGeneratedDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  // Template Gallery Filter
  const [galleryFilter, setGalleryFilter] = useState('ALL');

  // Photo Upload State
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoWarning, setPhotoWarning] = useState('');

  // SREC FIS V3.2.1 — One-Click Complete Event Package States
  const [isPackageGenerating, setIsPackageGenerating] = useState(false);
  const [packageProgress, setPackageProgress] = useState({ step: 0, stepName: '', percentage: 0, status: 'IDLE' });
  const [packageResult, setPackageResult] = useState(null);
  const [packagePosterTmpl, setPackagePosterTmpl] = useState('P01');
  const [packageInvTmpl, setPackageInvTmpl] = useState('I01');
  const [packageCertTmpl, setPackageCertTmpl] = useState('C01');

  // Handle One-Click Complete Package Generation
  const handleGenerateCompletePackage = async () => {
    setIsPackageGenerating(true);
    setPackageResult(null);
    try {
      const idempotencyKey = `pkg_${selectedEventId || 'manual'}_${Date.now()}`;
      const res = await generateCompleteEventPackage({
        eventData: eventForm,
        posterTemplate: packagePosterTmpl,
        invitationTemplate: packageInvTmpl,
        certificateTemplate: packageCertTmpl,
        participants,
        signatories,
        onProgress: (p) => setPackageProgress(p)
      });

      setPackageResult(res);

      // Post audit & package record to backend if authenticated
      if (selectedEventId) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${API_BASE_URL}/api/event-design/packages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              eventId: selectedEventId,
              eventTitle: eventForm.title,
              posterTemplate: packagePosterTmpl,
              invitationTemplate: packageInvTmpl,
              certificateTemplate: packageCertTmpl,
              participantCount: res.participantCount,
              certRangeStart: res.certRangeStart,
              certRangeEnd: res.certRangeEnd,
              packageFilename: res.zipFilename,
              generationStatus: res.generationStatus,
              posterStatus: res.itemStatuses.poster,
              invitationStatus: res.itemStatuses.invitation,
              certificateStatus: res.itemStatuses.certificates,
              summaryStatus: res.itemStatuses.summary,
              idempotencyKey,
              metadata: res.metadata
            })
          });
          fetchGeneratedDesigns();
        } catch (apiErr) {
          console.warn('Package audit logging warning:', apiErr);
        }
      }

      if (res.generationStatus === 'COMPLETED') {
        showSuccess('Complete Event Package generated successfully! You can download the full ZIP bundle below.');
      } else if (res.generationStatus === 'PARTIAL') {
        showInfo('Event Package partially generated. Successful documents are ready for download.');
      }
    } catch (err) {
      console.error('Package generation error:', err);
      showError(err.message || 'Failed to generate complete event package');
    } finally {
      setIsPackageGenerating(false);
    }
  };

  // Load Faculty Events on Mount
  useEffect(() => {
    fetchFacultyEvents();
    fetchGeneratedDesigns();
  }, []);

  // Handle URL Param pre-selection
  useEffect(() => {
    const eventIdParam = searchParams.get('eventId');
    if (eventIdParam && facultyEvents.length > 0) {
      handleEventSelect(eventIdParam);
    }
  }, [facultyEvents, searchParams]);

  const fetchFacultyEvents = async () => {
    try {
      setLoadingEvents(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setFacultyDept(data.department || 'ARTIFICIAL INTELLIGENCE AND DATA SCIENCE');
      setFacultyDeptCode(data.departmentCode || 'AD');
      setFacultyName(data.facultyName || '');
      setFacultyEvents(data.events || []);
      if (data.signatories) {
        setSignatories(data.signatories);
      }

      setEventForm(prev => ({
        ...prev,
        department: data.department || prev.department,
        departmentCode: data.departmentCode || prev.departmentCode
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchGeneratedDesigns = async () => {
    try {
      setLoadingDesigns(true);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/my-designs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedDesigns(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDesigns(false);
    }
  };

  // Pre-fill form from selected existing event
  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    if (!eventId) return;

    const evt = facultyEvents.find(e => String(e.id) === String(eventId));
    if (evt) {
      setEventForm(prev => ({
        ...prev,
        title: evt.title || prev.title,
        type: evt.type || prev.type,
        resourcePerson: evt.res_person || prev.resourcePerson,
        fromDate: evt.from_date || evt.date || prev.fromDate,
        toDate: evt.to_date || '',
        venue: prev.venue,
        description: `Organized by Department of ${facultyDept}${evt.sponsership ? ` with sponsorship from ${evt.sponsership}` : ''}.`
      }));
      showInfo(`Loaded details for event: "${evt.title}"`);
    }
  };

  // Logo upload handler
  const handleLogoUpload = async (e, logoType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Logo file size exceeds 5 MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('logo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/upload-logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload logo');

      setEventForm(prev => ({ ...prev, [logoType]: `${API_BASE_URL}${data.url}` }));
      showSuccess('Logo uploaded successfully.');
    } catch (err) {
      showError(err.message);
    }
  };

  // Chief Guest / Resource Person Photo Upload Handler
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showError('Photo file size exceeds 5 MB limit.');
      return;
    }

    setUploadingPhoto(true);
    setPhotoWarning('');
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/upload-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload photo');

      const fullUrl = `${API_BASE_URL}${data.url}`;
      setEventForm(prev => ({
        ...prev,
        resourcePersonPhoto: fullUrl,
        speakerPhoto: fullUrl
      }));

      if (data.isLowResolution && data.warningMessage) {
        setPhotoWarning(data.warningMessage);
        showInfo(data.warningMessage);
      } else {
        showSuccess('Resource person photo attached successfully.');
      }
    } catch (err) {
      showError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remove Chief Guest Photo Handler
  const handleRemovePhoto = async () => {
    const currentPhoto = eventForm.resourcePersonPhoto || eventForm.speakerPhoto;
    if (!currentPhoto) return;

    const filename = currentPhoto.split('/').pop();
    try {
      const token = localStorage.getItem('token');
      if (filename && filename.startsWith('speaker_')) {
        await fetch(`${API_BASE_URL}/api/event-design/photo/${filename}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.warn('Failed to delete photo on server:', e);
    }

    setEventForm(prev => ({
      ...prev,
      resourcePersonPhoto: '',
      speakerPhoto: ''
    }));
    setPhotoWarning('');
    showInfo('Resource person photo removed.');
  };

  // Participant Spreadsheet Upload
  const handleParticipantFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingParticipants(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/validate-participants`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to validate participants');

      setParticipants(data.participants || []);
      if (data.signatories) {
        setSignatories(data.signatories);
      }
      showSuccess(`Validated ${data.totalRows} participants: ${data.validCount} ready, ${data.duplicateCount} duplicates, ${data.errorCount} errors.`);
    } catch (err) {
      showError(err.message);
    } finally {
      setUploadingParticipants(false);
    }
  };

  // Record generated design in audit table
  const logGeneratedDesign = async (designType, templateId, count = 1) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/api/event-design/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventId: selectedEventId ? parseInt(selectedEventId, 10) : null,
          eventTitle: eventForm.title,
          designType,
          templateId,
          certificateCount: count,
          metadata: {
            theme: eventForm.theme,
            resourcePerson: eventForm.resourcePerson,
            fromDate: eventForm.fromDate,
            time: eventForm.time,
            venue: eventForm.venue,
            signatories
          }
        })
      });
      fetchGeneratedDesigns();
    } catch (err) {
      console.error(err);
    }
  };

  // Action: Download Poster PDF
  const handleDownloadPosterPdf = () => {
    try {
      const doc = generatePosterPdf(selectedPosterTemplate, eventForm);
      const filename = `SREC_Poster_${selectedPosterTemplate}_${sanitizeFilenamePart(eventForm.title)}.pdf`;
      doc.save(filename);
      logGeneratedDesign('POSTER', selectedPosterTemplate, 1);
      showSuccess('Poster PDF downloaded successfully.');
    } catch (err) {
      showError('Failed to generate poster PDF: ' + err.message);
    }
  };

  // Action: Download Invitation PDF
  const handleDownloadInvitationPdf = () => {
    try {
      const doc = generateInvitationPdf(selectedInvitationTemplate, eventForm);
      const filename = `SREC_Invitation_${selectedInvitationTemplate}_${sanitizeFilenamePart(eventForm.title)}.pdf`;
      doc.save(filename);
      logGeneratedDesign('INVITATION', selectedInvitationTemplate, 1);
      showSuccess('Formal Invitation PDF downloaded successfully.');
    } catch (err) {
      showError('Failed to generate invitation PDF: ' + err.message);
    }
  };

  // Action: Download Single Certificate PDF
  const handleDownloadSingleCertPdf = (p) => {
    try {
      const certPayload = {
        participantName: p.name,
        designation: p.designation,
        organization: p.organization,
        eventTitle: eventForm.title,
        eventType: eventForm.type,
        department: facultyDept,
        fromDate: eventForm.fromDate,
        toDate: eventForm.toDate,
        certificateNumber: p.certificateNumber || `SREC/${facultyDeptCode}/${new Date().getFullYear()}/EVT/001`,
        signatories
      };
      const doc = generateSingleCertificatePdf(selectedCertificateTemplate, certPayload);
      const filename = `Certificate_${sanitizeFilenamePart(p.name)}.pdf`;
      doc.save(filename);
      showSuccess(`Certificate for ${p.name} downloaded.`);
    } catch (err) {
      showError('Failed to download certificate: ' + err.message);
    }
  };

  // Action: Download Combined Multi-Page Certificate PDF
  const handleDownloadCombinedCertPdf = () => {
    const valid = participants.filter(p => p.status === 'Ready' || p.status === 'Duplicate');
    if (valid.length === 0) {
      showError('No valid participants to generate certificates for.');
      return;
    }
    try {
      const doc = generateCombinedCertificatesPdf(selectedCertificateTemplate, valid, {
        ...eventForm,
        department: facultyDept,
        departmentCode: facultyDeptCode,
        signatories
      });
      const filename = `SREC_Combined_Certificates_${sanitizeFilenamePart(eventForm.title)}.pdf`;
      doc.save(filename);
      logGeneratedDesign('CERTIFICATE', selectedCertificateTemplate, valid.length);
      showSuccess(`Combined PDF with ${valid.length} certificates generated.`);
    } catch (err) {
      showError('Failed to generate combined certificates: ' + err.message);
    }
  };

  // Action: Execute Bulk Generation & ZIP Download
  const handleGenerateBulkCertificates = async () => {
    const valid = participants.filter(p => p.status === 'Ready' || p.status === 'Duplicate');
    if (valid.length === 0) {
      showError('No valid participants found in list.');
      return;
    }

    setIsBulkGenerating(true);
    setBulkResult(null);

    try {
      const result = await processBulkCertificates({
        templateId: selectedCertificateTemplate,
        participants: valid,
        eventData: {
          ...eventForm,
          department: facultyDept,
          departmentCode: facultyDeptCode,
          signatories
        },
        onProgress: (p) => setBulkProgress(p)
      });

      setBulkResult(result);
      logGeneratedDesign('CERTIFICATE', selectedCertificateTemplate, result.successCount);
      downloadBlob(result.zipBlob, `${result.folderName}.zip`);
      showSuccess(`Successfully generated ${result.successCount} certificates and downloaded ZIP archive.`);
    } catch (err) {
      showError('Bulk certificate error: ' + err.message);
    } finally {
      setIsBulkGenerating(false);
    }
  };

  return (
    <div style={{ padding: '24px 28px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎨</span>
            <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Event Design & Certificate Generation Suite
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              V3.2 Suite
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.88rem' }}>
            Accredited institutional templates for Event Posters, Formal Invitations, and Bulk Participation Certificates with single-entry data reuse.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            textAlign: 'right'
          }}>
            <div style={{ color: '#38bdf8', fontWeight: 800 }}>Dept of {facultyDept}</div>
            <div style={{ color: '#cbd5e1', fontSize: '0.74rem' }}>{facultyName || 'Authenticated Faculty'}</div>
          </div>
        </div>
      </div>

      {/* Main Suite Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'package', label: '📦 One-Click Complete Package', badge: 'V3.2.1 Pro' },
          { id: 'poster', label: '🎨 Poster Generator', badge: '5 Templates' },
          { id: 'invitation', label: '📨 Invitation Generator', badge: '5 Templates' },
          { id: 'certificate', label: '📜 Participation Certificates', badge: 'Bulk Engine' },
          { id: 'gallery', label: '🏛️ Template Gallery', badge: '15 Designs' },
          { id: 'history', label: '📁 My Generated Designs', badge: generatedDesigns.length }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              fontWeight: 800,
              fontSize: '0.9rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: activeTab === tab.id ? '3.5px solid hsl(var(--primary))' : '3.5px solid transparent',
              color: activeTab === tab.id ? 'hsl(var(--primary))' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === tab.id ? 'hsl(var(--primary) / 0.12)' : '#f1f5f9',
              color: activeTab === tab.id ? 'hsl(var(--primary))' : '#64748b'
            }}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* TAB 0: ONE-CLICK COMPLETE EVENT PACKAGE STUDIO (V3.2.1)                   */}
      {/* ========================================================================= */}
      {activeTab === 'package' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header Banner */}
          <div style={{ background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', borderRadius: '16px', padding: '24px 28px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>📦</span>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  One-Click Complete Event Package Studio
                </h2>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#bfdbfe', maxWidth: '680px' }}>
                Generate all institutional event artifacts in a single workflow: Vector Print Poster, Formal Invitation Card, Individual Participant Certificates, Merged Combined PDF, and Official Event Summary Sheet.
              </p>
            </div>

            <button
              type="button"
              disabled={isPackageGenerating}
              onClick={handleGenerateCompletePackage}
              style={{
                background: isPackageGenerating ? '#94a3b8' : '#ffffff',
                color: isPackageGenerating ? '#ffffff' : '#1e3a8a',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: isPackageGenerating ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              {isPackageGenerating ? (
                <>
                  <RefreshCw size={18} className="animate-spin" /> Generating Package...
                </>
              ) : (
                <>
                  <span>🚀</span> Generate Complete Event Package
                </>
              )}
            </button>
          </div>

          {/* Progress Tracker Card (when generating) */}
          {isPackageGenerating && (
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '2px solid #3b82f6', padding: '20px 24px', boxShadow: '0 4px 12px rgba(37,99,235,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className="animate-spin" color="#3b82f6" />
                  Step {packageProgress.step} of 7: {packageProgress.stepName}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#2563eb' }}>
                  {packageProgress.percentage}%
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${packageProgress.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Configuration Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Left Column: Template Selectors & Event Overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              
              {/* Event Details Card */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📋</span> Target Event Information
                  </h4>
                  {selectedEventId && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
                      Linked Event #{selectedEventId}
                    </span>
                  )}
                </div>

                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{eventForm.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  <div><strong>Category:</strong> {eventForm.type}</div>
                  <div><strong>Dept:</strong> {facultyDept} ({facultyDeptCode})</div>
                  <div><strong>Date & Time:</strong> {eventForm.fromDate || 'N/A'} | {eventForm.time || 'All Day'}</div>
                  <div><strong>Venue:</strong> {eventForm.venue || 'SREC Campus'}</div>
                  <div><strong>Resource Person:</strong> {eventForm.resourcePerson || 'N/A'}</div>
                </div>

                {/* Photo & Logo Reuse Status */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {(eventForm.resourcePersonPhoto || eventForm.speakerPhoto) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#15803d', fontWeight: 700 }}>
                      <img src={eventForm.resourcePersonPhoto || eventForm.speakerPhoto} alt="Photo" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #86efac' }} />
                      Photo Reused
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>○ No Photo Attached</div>
                  )}

                  {eventForm.organizerLogo && (
                    <div style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700 }}>
                      ✓ Organizer Logo
                    </div>
                  )}
                  {eventForm.associationLogo && (
                    <div style={{ fontSize: '0.76rem', color: '#0369a1', fontWeight: 700 }}>
                      ✓ Association Logo
                    </div>
                  )}
                </div>
              </div>

              {/* Template Configuration */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                  🎯 Select Package Templates
                </h4>

                {/* Poster Template */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    1. Poster Template
                  </label>
                  <select
                    className="form-control"
                    value={packagePosterTmpl}
                    onChange={(e) => setPackagePosterTmpl(e.target.value)}
                    style={{ fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {POSTER_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.id} — {t.name} ({t.previewBadge})</option>
                    ))}
                  </select>
                </div>

                {/* Invitation Template */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    2. Invitation Template
                  </label>
                  <select
                    className="form-control"
                    value={packageInvTmpl}
                    onChange={(e) => setPackageInvTmpl(e.target.value)}
                    style={{ fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {INVITATION_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.id} — {t.name} ({t.previewBadge})</option>
                    ))}
                  </select>
                </div>

                {/* Certificate Template */}
                <div style={{ marginBottom: '8px' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    3. Certificate Template
                  </label>
                  <select
                    className="form-control"
                    value={packageCertTmpl}
                    onChange={(e) => setPackageCertTmpl(e.target.value)}
                    style={{ fontSize: '0.84rem', fontWeight: 700 }}
                  >
                    {CERTIFICATE_TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.id} — {t.name} ({t.previewBadge})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Participants Count Card */}
              <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #cbd5e1', padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>
                      Certified Candidates
                    </div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                      {participants.filter(p => p.status !== 'Error').length} Participants
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('certificate')}
                    style={{ background: '#ffffff', border: '1px solid #cbd5e1', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Manage List ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Package Artifacts Checklist & Download Dashboard */}
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                    Package Artifacts Dashboard
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                    Status of all constituent documents and individual download links.
                  </p>
                </div>
                {packageResult && (
                  <span style={{
                    background: packageResult.generationStatus === 'COMPLETED' ? '#dcfce7' : '#fffbeb',
                    color: packageResult.generationStatus === 'COMPLETED' ? '#15803d' : '#b45309',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    padding: '3px 10px',
                    borderRadius: '12px'
                  }}>
                    {packageResult.generationStatus}
                  </span>
                )}
              </div>

              {/* Artifacts List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                
                {/* 1. Poster */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      01_Poster.pdf
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Template {packagePosterTmpl} • High-Resolution Vector Poster
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: packageResult?.itemStatuses?.poster === 'SUCCESS' ? '#166534' : '#64748b' }}>
                      {packageResult?.itemStatuses?.poster === 'SUCCESS' ? '✓ Ready' : 'Pending'}
                    </span>
                    {packageResult?.blobs?.posterBlob && (
                      <button
                        type="button"
                        onClick={() => downloadBlob(packageResult.blobs.posterBlob, '01_Poster.pdf')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Download size={12} style={{ display: 'inline', marginRight: '3px' }} /> Download
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. Invitation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      02_Invitation.pdf
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Template {packageInvTmpl} • Formal Dignitary Invitation Card
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: packageResult?.itemStatuses?.invitation === 'SUCCESS' ? '#166534' : '#64748b' }}>
                      {packageResult?.itemStatuses?.invitation === 'SUCCESS' ? '✓ Ready' : 'Pending'}
                    </span>
                    {packageResult?.blobs?.invitationBlob && (
                      <button
                        type="button"
                        onClick={() => downloadBlob(packageResult.blobs.invitationBlob, '02_Invitation.pdf')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Download size={12} style={{ display: 'inline', marginRight: '3px' }} /> Download
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Combined Certificates PDF */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      04_Combined_Certificates.pdf
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Template {packageCertTmpl} • {participants.length} Multi-Page Certificates
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: packageResult?.itemStatuses?.combinedPdf === 'SUCCESS' ? '#166534' : '#64748b' }}>
                      {packageResult?.itemStatuses?.combinedPdf === 'SUCCESS' ? '✓ Ready' : 'Pending'}
                    </span>
                    {packageResult?.blobs?.combinedCertsBlob && (
                      <button
                        type="button"
                        onClick={() => downloadBlob(packageResult.blobs.combinedCertsBlob, '04_Combined_Certificates.pdf')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Download size={12} style={{ display: 'inline', marginRight: '3px' }} /> Download
                      </button>
                    )}
                  </div>
                </div>

                {/* 4. Event Summary PDF */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      05_Event_Summary.pdf
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Official Institutional Documentation Summary Sheet
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: packageResult?.itemStatuses?.summary === 'SUCCESS' ? '#166534' : '#64748b' }}>
                      {packageResult?.itemStatuses?.summary === 'SUCCESS' ? '✓ Ready' : 'Pending'}
                    </span>
                    {packageResult?.blobs?.summaryBlob && (
                      <button
                        type="button"
                        onClick={() => downloadBlob(packageResult.blobs.summaryBlob, '05_Event_Summary.pdf')}
                        style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '4px', padding: '3px 8px', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        <Download size={12} style={{ display: 'inline', marginRight: '3px' }} /> Download
                      </button>
                    )}
                  </div>
                </div>

                {/* 5. Safe Metadata JSON */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                      06_Event_Metadata.json
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      Structured event design manifest & certificate numbers
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.74rem', fontWeight: 800, color: packageResult ? '#166534' : '#64748b' }}>
                      {packageResult ? '✓ Included in ZIP' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Complete Package Download Button */}
              {packageResult?.zipBlob ? (
                <div style={{ background: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#166534', marginBottom: '8px' }}>
                    🎉 Complete Event Package Bundle is Ready!
                  </div>
                  <button
                    type="button"
                    onClick={() => downloadBlob(packageResult.zipBlob, packageResult.zipFilename)}
                    style={{
                      background: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '12px 28px',
                      fontWeight: 900,
                      fontSize: '0.95rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 12px rgba(21,128,61,0.25)'
                    }}
                  >
                    <Download size={18} /> Download Complete Package ZIP
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px', background: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1', color: '#64748b', fontSize: '0.84rem' }}>
                  Click <strong>"Generate Complete Event Package"</strong> above to produce and bundle all 6 artifacts simultaneously.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: POSTER GENERATOR                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'poster' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Form Controls */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="hsl(var(--primary))" /> Event Poster Configuration
            </h3>

            {/* Existing Event Loader */}
            <div style={{ marginBottom: '16px', background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '6px' }}>
                🔗 LOAD FROM "EVENTS ORGANIZED" MODULE:
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => handleEventSelect(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', fontWeight: 600 }}
              >
                <option value="">-- Create Custom Poster / Enter Details --</option>
                {facultyEvents.map(evt => (
                  <option key={evt.id} value={evt.id}>
                    [{evt.type || 'Event'}] {evt.title} ({evt.from_date || evt.date || 'No Date'})
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector Carousel */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                SELECT POSTER TEMPLATE:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                {POSTER_TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedPosterTemplate(t.id)}
                    style={{
                      border: selectedPosterTemplate === t.id ? '2px solid hsl(var(--primary))' : '1.5px solid #e2e8f0',
                      background: selectedPosterTemplate === t.id ? 'hsl(var(--primary) / 0.06)' : '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: selectedPosterTemplate === t.id ? 'hsl(var(--primary))' : '#0f172a' }}>{t.id}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.previewBadge}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Event Form Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  placeholder="e.g. National Seminar on AI"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Theme / Subtitle</label>
                <input
                  type="text"
                  value={eventForm.theme}
                  onChange={e => setEventForm({ ...eventForm, theme: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                  placeholder="e.g. Next-Generation Computing"
                />
              </div>

              {/* Department (Server Derived) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  Organized By (Verified Institutional Department)
                </label>
                <input
                  type="text"
                  value={`Department of ${facultyDept}`}
                  disabled
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem', background: '#f8fafc', color: '#64748b', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Co-Organized By</label>
                  <input
                    type="text"
                    value={eventForm.coOrganizedBy}
                    onChange={e => setEventForm({ ...eventForm, coOrganizedBy: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    placeholder="e.g. Dept of ECE"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>In Association With</label>
                  <input
                    type="text"
                    value={eventForm.inAssociationWith}
                    onChange={e => setEventForm({ ...eventForm, inAssociationWith: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    placeholder="e.g. IEEE / CSI / ACM"
                  />
                </div>
              </div>

              {/* Chief Guest / Resource Person Section with Photo */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#0369a1" /> CHIEF GUEST / RESOURCE PERSON
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Optional Photo</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Name *</label>
                    <input
                      type="text"
                      value={eventForm.resourcePerson}
                      onChange={e => setEventForm({ ...eventForm, resourcePerson: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      placeholder="e.g. Dr. A. Scientist"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Designation</label>
                      <input
                        type="text"
                        value={eventForm.resDesignation}
                        onChange={e => setEventForm({ ...eventForm, resDesignation: e.target.value })}
                        style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        placeholder="e.g. Senior Scientist"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Organization</label>
                      <input
                        type="text"
                        value={eventForm.resOrganization}
                        onChange={e => setEventForm({ ...eventForm, resOrganization: e.target.value })}
                        style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        placeholder="e.g. Tech Labs"
                      />
                    </div>
                  </div>

                  {/* Photograph Upload / Preview Box */}
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Photograph (JPG, PNG, WEBP - Max 5 MB):
                    </label>

                    {eventForm.resourcePersonPhoto ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <img
                          src={eventForm.resourcePersonPhoto}
                          alt="Speaker"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0369a1', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {eventForm.resourcePerson || 'Resource Person Photo'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> Photo Active
                          </div>
                          {photoWarning && (
                            <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <AlertCircle size={10} /> {photoWarning}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <label style={{ cursor: 'pointer', padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                            Replace
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{ padding: '4px 6px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', color: '#b91c1c', cursor: 'pointer' }}
                            title="Remove Photo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', textAlign: 'center' }}>
                        <Upload size={18} color="#64748b" style={{ marginBottom: '4px' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                          {uploadingPhoto ? 'Uploading Photo...' : 'Upload Chief Guest / Speaker Photo'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          PNG, JPG, or WEBP up to 5 MB
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Date (From)</label>
                  <input
                    type="date"
                    value={eventForm.fromDate}
                    onChange={e => setEventForm({ ...eventForm, fromDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Time</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Venue</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                  placeholder="e.g. Auditorium / Hall 1"
                />
              </div>

              {/* Logo Upload Dropzones */}
              <div style={{ marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                  OPTIONAL LOGO ATTACHMENTS (MAX 5MB):
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>Association Logo</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleLogoUpload(e, 'associationLogo')} style={{ fontSize: '0.75rem' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginBottom: '3px' }}>Event Sponsor Logo</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => handleLogoUpload(e, 'organizerLogo')} style={{ fontSize: '0.75rem' }} />
                  </div>
                </div>
              </div>

              {/* Poster Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={handleDownloadPosterPdf}
                  style={{
                    flex: 1,
                    background: 'hsl(var(--primary))',
                    color: '#ffffff',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={16} /> Download PDF Poster
                </button>
              </div>
            </div>
          </div>

          {/* Right Live Interactive Preview */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                LIVE PREVIEW — {POSTER_TEMPLATES.find(t => t.id === selectedPosterTemplate)?.name}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, background: '#ecfdf5', padding: '3px 8px', borderRadius: '12px' }}>
                ● Real-Time Sync
              </span>
            </div>

            <div
              id="poster-preview-canvas"
              dangerouslySetInnerHTML={{
                __html: renderPosterHtml(selectedPosterTemplate, {
                  ...eventForm,
                  department: facultyDept
                })
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVITATION GENERATOR                                              */}
      {/* ========================================================================= */}
      {activeTab === 'invitation' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 460px) 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Form Controls */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="#0284c7" /> Formal Invitation Configuration
            </h3>

            {/* Template Selector Carousel */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#475569', marginBottom: '8px' }}>
                SELECT INVITATION TEMPLATE:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                {INVITATION_TEMPLATES.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedInvitationTemplate(t.id)}
                    style={{
                      border: selectedInvitationTemplate === t.id ? '2px solid #0284c7' : '1.5px solid #e2e8f0',
                      background: selectedInvitationTemplate === t.id ? 'rgba(2, 132, 199, 0.08)' : '#ffffff',
                      borderRadius: '8px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: '0.82rem', fontWeight: 900, color: selectedInvitationTemplate === t.id ? '#0284c7' : '#0f172a' }}>{t.id}</div>
                    <div style={{ fontSize: '0.68rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.previewBadge}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Form Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Event Title *</label>
                <input
                  type="text"
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              {/* Chief Guest / Resource Person Section with Photo (Invitation) */}
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <User size={14} color="#831843" /> CHIEF GUEST & DIGNITARY
                  </label>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Optional Photo</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Chief Guest / Speaker *</label>
                    <input
                      type="text"
                      value={eventForm.resourcePerson}
                      onChange={e => setEventForm({ ...eventForm, resourcePerson: e.target.value })}
                      style={{ width: '100%', padding: '7px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                      placeholder="e.g. Dr. K. Sundar"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Designation</label>
                      <input
                        type="text"
                        value={eventForm.resDesignation}
                        onChange={e => setEventForm({ ...eventForm, resDesignation: e.target.value })}
                        style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        placeholder="e.g. Director of Technology"
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginBottom: '3px' }}>Organization</label>
                      <input
                        type="text"
                        value={eventForm.resOrganization}
                        onChange={e => setEventForm({ ...eventForm, resOrganization: e.target.value })}
                        style={{ width: '100%', padding: '7px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        placeholder="e.g. Tech Innovations Ltd"
                      />
                    </div>
                  </div>

                  {/* Photograph Box */}
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                      Chief Guest Photograph (JPG, PNG, WEBP - Max 5 MB):
                    </label>

                    {eventForm.resourcePersonPhoto ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <img
                          src={eventForm.resourcePersonPhoto}
                          alt="Chief Guest"
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #831843', flexShrink: 0 }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {eventForm.resourcePerson || 'Chief Guest Photo'}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={11} /> Photo Attached (Reused across suite)
                          </div>
                          {photoWarning && (
                            <div style={{ fontSize: '0.68rem', color: '#d97706', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
                              <AlertCircle size={10} /> {photoWarning}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <label style={{ cursor: 'pointer', padding: '4px 8px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>
                            Replace
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/jpg,image/webp"
                              onChange={handlePhotoUpload}
                              style={{ display: 'none' }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            style={{ padding: '4px 6px', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '4px', color: '#b91c1c', cursor: 'pointer' }}
                            title="Remove Photo"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '12px', border: '1.5px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', background: '#ffffff', textAlign: 'center' }}>
                        <Upload size={18} color="#64748b" style={{ marginBottom: '4px' }} />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155' }}>
                          {uploadingPhoto ? 'Uploading Photo...' : 'Upload Chief Guest Photograph'}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '2px' }}>
                          PNG, JPG, or WEBP up to 5 MB
                        </span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          style={{ display: 'none' }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Presided Over By</label>
                <input
                  type="text"
                  value={eventForm.presidedBy}
                  onChange={e => setEventForm({ ...eventForm, presidedBy: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.88rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={eventForm.fromDate}
                    onChange={e => setEventForm({ ...eventForm, fromDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Time</label>
                  <input
                    type="text"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Venue</label>
                <input
                  type="text"
                  value={eventForm.venue}
                  onChange={e => setEventForm({ ...eventForm, venue: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadInvitationPdf}
                style={{
                  marginTop: '16px',
                  background: '#0284c7',
                  color: '#ffffff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Download size={16} /> Download Invitation PDF
              </button>
            </div>
          </div>

          {/* Right Live Preview */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#334155' }}>
                LIVE PREVIEW — {INVITATION_TEMPLATES.find(t => t.id === selectedInvitationTemplate)?.name}
              </div>
              <span style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 700, background: '#e0f2fe', padding: '3px 8px', borderRadius: '12px' }}>
                ● Formal Layout
              </span>
            </div>

            <div
              dangerouslySetInnerHTML={{
                __html: renderInvitationHtml(selectedInvitationTemplate, {
                  ...eventForm,
                  department: facultyDept
                })
              }}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PARTICIPATION CERTIFICATE GENERATOR                               */}
      {/* ========================================================================= */}
      {activeTab === 'certificate' && (
        <div>
          
          {/* Certificate Template Selection Row */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} color="#b45309" /> 1. Select Certificate Design Template
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                  Accredited participation layouts with deterministic certificate numbering: SREC/{facultyDeptCode}/2026/...
                </p>
              </div>

              {/* Sample Downloads */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={`${API_BASE_URL}/api/event-design/templates/sample-excel`}
                  download="SREC_Certificate_Participants_Template.xlsx"
                  style={{
                    background: '#f0fdf4',
                    color: '#166534',
                    border: '1.5px solid #bbf7d0',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileSpreadsheet size={14} /> Download Excel Template
                </a>
                <a
                  href={`${API_BASE_URL}/api/event-design/templates/sample-csv`}
                  download="SREC_Certificate_Participants_Template.csv"
                  style={{
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={14} /> Download CSV Template
                </a>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              {CERTIFICATE_TEMPLATES.map(t => (
                <div
                  key={t.id}
                  onClick={() => setSelectedCertificateTemplate(t.id)}
                  style={{
                    border: selectedCertificateTemplate === t.id ? '2.5px solid #b45309' : '1.5px solid #e2e8f0',
                    background: selectedCertificateTemplate === t.id ? '#fffbeb' : '#ffffff',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#b45309' }}>{t.id}</span>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, background: '#fed7aa', color: '#9a3412', padding: '1px 6px', borderRadius: '4px' }}>
                      {t.previewBadge}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0f172a', marginTop: '4px' }}>{t.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px', lineHeight: 1.3 }}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Signatories Verification Card (Server Enforced) */}
          <div style={{ background: '#f8fafc', borderRadius: '14px', border: '1.5px solid #cbd5e1', padding: '16px 20px', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#0284c7" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0f172a' }}>
                  Institutional Signatories (Verified Server Configuration)
                </span>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0369a1', background: '#e0f2fe', padding: '2px 8px', borderRadius: '12px' }}>
                🔒 Server-Enforced Anti-Spoofing
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              {/* 1. Faculty Coordinator */}
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>1. Faculty Coordinator</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem', marginTop: '2px' }}>{signatories?.facultyCoordinator?.name || 'Dr. Faculty Coordinator'}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>{signatories?.facultyCoordinator?.designation || 'Faculty Coordinator'}</div>
              </div>

              {/* 2. HOD */}
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>2. Head of the Department (HOD)</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem', marginTop: '2px' }}>{signatories?.hod?.name || 'Head of the Department'}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>{signatories?.hod?.designation || 'Professor & Head'}</div>
              </div>

              {/* 3. Principal */}
              <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '10px 14px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>3. Institutional Principal</div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.86rem', marginTop: '2px' }}>{signatories?.principal?.name || 'Dr. N. R. Alamelu'}</div>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>{signatories?.principal?.designation || 'Principal, SREC'}</div>
              </div>
            </div>
          </div>

          {/* Participant Import & Table Container */}
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileSpreadsheet size={18} color="hsl(var(--primary))" /> 2. Participant Roster ({participants.length} Records)
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Upload Excel/CSV spreadsheet or add participant rows manually below.
                </span>
              </div>

              {/* Upload Dropzone Button */}
              <label style={{
                background: '#f0fdf4',
                color: '#166534',
                border: '1.5px solid #86efac',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Upload size={14} /> Upload Excel / CSV List
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleParticipantFileUpload} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Validation Table */}
            <div style={{ overflowX: 'auto', maxHeight: '380px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', color: '#475569', fontWeight: 800, position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>S.No</th>
                    <th style={{ padding: '10px 12px' }}>Participant Name *</th>
                    <th style={{ padding: '10px 12px' }}>Designation</th>
                    <th style={{ padding: '10px 12px' }}>Organization</th>
                    <th style={{ padding: '10px 12px' }}>Email</th>
                    <th style={{ padding: '10px 12px' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((p, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fbfcfd' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.sno || idx + 1}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{p.name || <em style={{ color: '#ef4444' }}>Missing Name</em>}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{p.designation}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.organization}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>{p.email || '—'}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: p.status === 'Ready' ? '#dcfce7' : p.status === 'Duplicate' ? '#fef3c7' : '#fee2e2',
                          color: p.status === 'Ready' ? '#15803d' : p.status === 'Duplicate' ? '#b45309' : '#b91c1c'
                        }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSinglePreviewCert(p)}
                          style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontWeight: 700, marginRight: '10px' }}
                        >
                          👁 Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => setParticipants(participants.filter((_, i) => i !== idx))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bulk Action Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setParticipants([...participants, { sno: participants.length + 1, name: 'New Participant', designation: 'Participant', organization: 'Sri Ramakrishna Engineering College', email: '', status: 'Ready', errorReason: '' }])}
                  style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Plus size={14} /> Add Row
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={handleDownloadCombinedCertPdf}
                  style={{
                    background: '#f8fafc',
                    color: '#0f172a',
                    border: '1.5px solid #cbd5e1',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <FileText size={16} /> Download Combined Multi-Page PDF
                </button>

                <button
                  type="button"
                  disabled={isBulkGenerating}
                  onClick={handleGenerateBulkCertificates}
                  style={{
                    background: 'linear-gradient(135deg, #b45309, #d97706)',
                    color: '#ffffff',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    border: 'none',
                    cursor: isBulkGenerating ? 'not-allowed' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)'
                  }}
                >
                  <Archive size={16} /> {isBulkGenerating ? `Generating (${bulkProgress.percentage}%)...` : `Generate & Download All (${participants.length}) as ZIP`}
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Generation Progress Modal */}
          {isBulkGenerating && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                <Sparkles size={36} color="#b45309" style={{ margin: '0 auto 12px auto' }} />
                <h3 style={{ margin: '0 0 6px 0', fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>Generating Participation Certificates</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.82rem', color: '#64748b' }}>
                  Processing {bulkProgress.current} of {bulkProgress.total}: <strong>{bulkProgress.participantName}</strong>
                </p>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '14px' }}>
                  <div style={{ width: `${bulkProgress.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #b45309, #f59e0b)', transition: 'width 0.2s ease' }} />
                </div>

                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#b45309' }}>{bulkProgress.percentage}% Completed</div>
              </div>
            </div>
          )}

          {/* Single Certificate Preview Modal */}
          {singlePreviewCert && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
              <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '900px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>Individual Certificate Preview — {singlePreviewCert.name}</div>
                  <button type="button" onClick={() => setSinglePreviewCert(null)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#64748b' }}>✕</button>
                </div>

                <div
                  dangerouslySetInnerHTML={{
                    __html: renderCertificateHtml(selectedCertificateTemplate, {
                      participantName: singlePreviewCert.name,
                      designation: singlePreviewCert.designation,
                      organization: singlePreviewCert.organization,
                      eventTitle: eventForm.title,
                      eventType: eventForm.type,
                      department: facultyDept,
                      fromDate: eventForm.fromDate,
                      toDate: eventForm.toDate,
                      certificateNumber: singlePreviewCert.certificateNumber || `SREC/${facultyDeptCode}/${new Date().getFullYear()}/EVT/001`,
                      signatories
                    })
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingleCertPdf(singlePreviewCert)}
                    style={{ background: 'hsl(var(--primary))', color: '#ffffff', padding: '9px 18px', borderRadius: '6px', fontWeight: 800, fontSize: '0.85rem', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Download size={15} /> Download PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setSinglePreviewCert(null)}
                    style={{ background: '#f1f5f9', color: '#475569', padding: '9px 18px', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEMPLATE GALLERY                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'gallery' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
              Institutional Template Catalog
            </h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'POSTER', 'INVITATION', 'CERTIFICATE'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setGalleryFilter(f)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    border: '1px solid #cbd5e1',
                    background: galleryFilter === f ? '#0f172a' : '#ffffff',
                    color: galleryFilter === f ? '#ffffff' : '#475569',
                    cursor: 'pointer'
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {[
              ...(galleryFilter === 'ALL' || galleryFilter === 'POSTER' ? POSTER_TEMPLATES : []),
              ...(galleryFilter === 'ALL' || galleryFilter === 'INVITATION' ? INVITATION_TEMPLATES : []),
              ...(galleryFilter === 'ALL' || galleryFilter === 'CERTIFICATE' ? CERTIFICATE_TEMPLATES : [])
            ].map(t => (
              <div
                key={t.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1.5px solid #e2e8f0',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 900, fontSize: '1.1rem', color: t.accentColor }}>{t.id}</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '12px' }}>
                      {t.type}
                    </span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0f172a', marginBottom: '4px' }}>{t.name}</div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>{t.description}</p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (t.type === 'POSTER') {
                      setSelectedPosterTemplate(t.id);
                      setActiveTab('poster');
                    } else if (t.type === 'INVITATION') {
                      setSelectedInvitationTemplate(t.id);
                      setActiveTab('invitation');
                    } else {
                      setSelectedCertificateTemplate(t.id);
                      setActiveTab('certificate');
                    }
                  }}
                  style={{
                    marginTop: '16px',
                    background: '#f8fafc',
                    border: '1.5px solid #cbd5e1',
                    color: '#0f172a',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  Use Template <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MY GENERATED DESIGNS HISTORY                                      */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                My Generated Event Designs ({generatedDesigns.length})
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#64748b' }}>
                Audit history of posters, invitations, and certificate batches generated by your faculty account.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchGeneratedDesigns}
              style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <RefreshCw size={12} /> Refresh History
            </button>
          </div>

          {generatedDesigns.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
              <Palette size={40} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#64748b' }}>No Designs Generated Yet</div>
              <p style={{ fontSize: '0.8rem', margin: '4px 0 16px 0' }}>Select the Poster, Invitation, or Certificate tab to generate your first document.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead style={{ background: '#f8fafc', color: '#475569', fontWeight: 800 }}>
                  <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '10px 12px' }}>Type</th>
                    <th style={{ padding: '10px 12px' }}>Event Title</th>
                    <th style={{ padding: '10px 12px' }}>Template</th>
                    <th style={{ padding: '10px 12px' }}>Batch / Count</th>
                    <th style={{ padding: '10px 12px' }}>Generated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedDesigns.map((d, idx) => (
                    <tr key={d.id || idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '12px',
                          background: d.design_type === 'POSTER' ? '#ecfdf5' : d.design_type === 'INVITATION' ? '#e0f2fe' : '#fffbeb',
                          color: d.design_type === 'POSTER' ? '#059669' : d.design_type === 'INVITATION' ? '#0284c7' : '#b45309'
                        }}>
                          {d.design_type}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>{d.event_title}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontWeight: 800 }}>{d.template_id}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>
                        {d.design_type === 'CERTIFICATE' ? `${d.certificate_count || 1} certificates` : 'Single Document'}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>
                        {new Date(d.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
