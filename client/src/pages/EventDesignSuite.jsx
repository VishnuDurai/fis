/**
 * SREC FIS V3.2.2 — PROFESSIONAL EVENT DESIGNER & MULTI-FORMAT PUBLISHING SUITE
 * Complete institutional design suite for Event Posters, Invitations, Multi-Format Social Media Packs,
 * and Bulk Participation Certificates with Canva/Photoshop-style manual-first design customization.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  FileSpreadsheet,
  QrCode,
  Sliders,
  Type,
  Undo,
  Redo,
  Lock,
  Crop,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sun,
  Check,
  X,
  Share2,
  Sparkle,
  Smartphone,
  Monitor,
  Maximize2,
  Users,
  MoveUp,
  MoveDown
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
import {
  THEMES,
  APPROVED_FONTS,
  FONT_SIZE_BOUNDS,
  SOCIAL_PRESETS,
  PERSON_ROLES,
  SPEAKER_LAYOUT_MODES,
  createDefaultPerson,
  normalizeEventPersons,
  generateQRCodeSVG,
  calculateSmartLayout,
  auditDesignRules
} from '../utils/eventDesign/designPresets.js';
import { exportHighResPng, exportSocialMediaPackZip } from '../utils/eventDesign/pngExportEngine.js';
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

  // Base Form State (Shared / Reused)
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

  // =========================================================================
  // V3.2.2 DESIGN CUSTOMIZATION STATES
  // =========================================================================
  const [selectedThemeId, setSelectedThemeId] = useState('institutional_default');
  const [customColors, setCustomColors] = useState({
    primary: THEMES.institutional_default.primary,
    secondary: THEMES.institutional_default.secondary,
    accent: THEMES.institutional_default.accent,
    background: THEMES.institutional_default.background,
    cardBg: THEMES.institutional_default.cardBg,
    text: THEMES.institutional_default.text
  });

  const [typography, setTypography] = useState({
    headingFont: 'Montserrat',
    titleFont: 'Montserrat',
    bodyFont: 'Inter',
    speakerFont: 'Poppins',
    titleFontSize: 36,
    subtitleFontSize: 22,
    speakerFontSize: 26,
    bodyFontSize: 16,
    dateTimeVenueFontSize: 18
  });

  const [photoEdit, setPhotoEdit] = useState({
    cropShape: 'circle', // 'circle' | 'square' | 'rounded_rectangle'
    zoom: 1.0,
    panX: 0,
    panY: 0,
    rotate: 0,
    border: true,
    shadow: true,
    brightness: 100,
    contrast: 100,
    removeBg: false,
    faceAware: false
  });

  // Multiple Resource Persons / Chief Guests Collection
  const [eventPersons, setEventPersons] = useState([
    createDefaultPerson(1, 'Chief Guest', 'Dr. V. Rajesh', 'Principal AI Architect & Fellow', 'Cognitive Computing Labs, Bangalore')
  ]);
  const [speakerLayout, setSpeakerLayout] = useState('auto'); // 'auto' | 'two_column' | 'three_column' | 'grid' | 'compact_grid'
  const [displayOptions, setDisplayOptions] = useState({
    showPhoto: true,
    showName: true,
    showDesignation: true,
    showOrganization: true,
    showProfile: false
  });
  const [activePersonIndex, setActivePersonIndex] = useState(0);

  const [qrConfig, setQrConfig] = useState({
    enabled: false,
    type: 'registration_url',
    url: 'https://forms.gle/srec-event-registration',
    caption: 'Scan to Register',
    size: 140,
    position: 'bottom-right'
  });

  const [selectedSocialPreset, setSelectedSocialPreset] = useState('instagram_portrait');
  const [previewMode, setPreviewMode] = useState('standard'); // 'standard' | 'social' | 'print'
  const [activeCustomizeAccordion, setActiveCustomizeAccordion] = useState('speakers'); // 'speakers' | 'theme' | 'typography' | 'photo' | 'qr' | 'content'

  // Undo / Redo History Stack
  const [historyStack, setHistoryStack] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // AI Assistance Modals State
  const [showAiDesignModal, setShowAiDesignModal] = useState(false);
  const [showAiContentModal, setShowAiContentModal] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDesignSuggestion, setAiDesignSuggestion] = useState(null);
  const [aiContentSuggestion, setAiContentSuggestion] = useState(null);

  // Professional Design Check Modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [designAuditResult, setDesignAuditResult] = useState(null);

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

  // Complete Event Package States
  const [isPackageGenerating, setIsPackageGenerating] = useState(false);
  const [packageProgress, setPackageProgress] = useState({ step: 0, stepName: '', percentage: 0, status: 'IDLE' });
  const [packageResult, setPackageResult] = useState(null);
  const [packagePosterTmpl, setPackagePosterTmpl] = useState('P01');
  const [packageInvTmpl, setPackageInvTmpl] = useState('I01');
  const [packageCertTmpl, setPackageCertTmpl] = useState('C01');

  // Push design snapshot to Undo/Redo stack
  const pushStateToHistory = useCallback(() => {
    const snapshot = {
      eventForm: { ...eventForm },
      eventPersons: JSON.parse(JSON.stringify(eventPersons)),
      speakerLayout,
      displayOptions: { ...displayOptions },
      selectedThemeId,
      customColors: { ...customColors },
      typography: { ...typography },
      photoEdit: { ...photoEdit },
      qrConfig: { ...qrConfig }
    };
    setHistoryStack(prev => [...prev.slice(0, historyIndex + 1), snapshot]);
    setHistoryIndex(prev => prev + 1);
  }, [eventForm, eventPersons, speakerLayout, displayOptions, selectedThemeId, customColors, typography, photoEdit, qrConfig, historyIndex]);

  // Undo Handler
  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = historyStack[historyIndex - 1];
      if (prev) {
        if (prev.eventForm) setEventForm(prev.eventForm);
        if (prev.eventPersons) setEventPersons(prev.eventPersons);
        if (prev.speakerLayout) setSpeakerLayout(prev.speakerLayout);
        if (prev.displayOptions) setDisplayOptions(prev.displayOptions);
        if (prev.selectedThemeId) setSelectedThemeId(prev.selectedThemeId);
        if (prev.customColors) setCustomColors(prev.customColors);
        if (prev.typography) setTypography(prev.typography);
        if (prev.photoEdit) setPhotoEdit(prev.photoEdit);
        if (prev.qrConfig) setQrConfig(prev.qrConfig);
        setHistoryIndex(i => i - 1);
      }
    }
  };

  // Redo Handler
  const handleRedo = () => {
    if (historyIndex < historyStack.length - 1) {
      const next = historyStack[historyIndex + 1];
      if (next) {
        if (next.eventForm) setEventForm(next.eventForm);
        if (next.eventPersons) setEventPersons(next.eventPersons);
        if (next.speakerLayout) setSpeakerLayout(next.speakerLayout);
        if (next.displayOptions) setDisplayOptions(next.displayOptions);
        if (next.selectedThemeId) setSelectedThemeId(next.selectedThemeId);
        if (next.customColors) setCustomColors(next.customColors);
        if (next.typography) setTypography(next.typography);
        if (next.photoEdit) setPhotoEdit(next.photoEdit);
        if (next.qrConfig) setQrConfig(next.qrConfig);
        setHistoryIndex(i => i + 1);
      }
    }
  };

  // Keyboard Shortcuts for Undo / Redo
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [historyIndex, historyStack]);

  // Reset Theme to Institutional Default
  const handleResetTheme = () => {
    setSelectedThemeId('institutional_default');
    setCustomColors({
      primary: THEMES.institutional_default.primary,
      secondary: THEMES.institutional_default.secondary,
      accent: THEMES.institutional_default.accent,
      background: THEMES.institutional_default.background,
      cardBg: THEMES.institutional_default.cardBg,
      text: THEMES.institutional_default.text
    });
    showSuccess('Theme reset to SREC Institutional Default.');
  };

  // Reset Typography
  const handleResetTypography = () => {
    setTypography({
      headingFont: 'Montserrat',
      titleFont: 'Montserrat',
      bodyFont: 'Inter',
      speakerFont: 'Poppins',
      titleFontSize: 36,
      subtitleFontSize: 22,
      speakerFontSize: 26,
      bodyFontSize: 16,
      dateTimeVenueFontSize: 18
    });
    showSuccess('Typography settings reset to standard.');
  };

  // Reset Photo
  const handleResetPhoto = () => {
    setPhotoEdit({
      cropShape: 'circle',
      zoom: 1.0,
      panX: 0,
      panY: 0,
      rotate: 0,
      border: true,
      shadow: true,
      brightness: 100,
      contrast: 100,
      removeBg: false,
      faceAware: false
    });
    showInfo('Photo adjustments reset.');
  };

  // Theme change handler
  const handleThemeSelect = (themeId) => {
    setSelectedThemeId(themeId);
    if (THEMES[themeId]) {
      setCustomColors({
        primary: THEMES[themeId].primary,
        secondary: THEMES[themeId].secondary,
        accent: THEMES[themeId].accent,
        background: THEMES[themeId].background,
        cardBg: THEMES[themeId].cardBg,
        text: THEMES[themeId].text
      });
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

  const handleEventSelect = (eventId) => {
    setSelectedEventId(eventId);
    if (!eventId) return;

    const evt = facultyEvents.find(e => String(e.id) === String(eventId));
    if (evt) {
      const initialPersons = evt.design_metadata?.eventPersons || (evt.res_person || evt.resource_person ? [
        createDefaultPerson(1, evt.chief_guest ? 'Chief Guest' : 'Resource Person', evt.res_person || evt.resource_person, evt.res_designation || '', evt.res_organization || '', evt.speaker_photo || '')
      ] : [createDefaultPerson(1)]);

      setEventPersons(initialPersons);
      setActivePersonIndex(0);

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

  const handleAddPerson = () => {
    const newPerson = createDefaultPerson(eventPersons.length + 1, 'Resource Person');
    setEventPersons(prev => [...prev, newPerson]);
    setActivePersonIndex(eventPersons.length);
    pushStateToHistory();
    showSuccess('Added new dignitary / resource person.');
  };

  const handleUpdatePerson = (idx, fields) => {
    setEventPersons(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], ...fields };
      // Sync first person to legacy eventForm fields for backward compatibility
      if (idx === 0) {
        setEventForm(ef => ({
          ...ef,
          resourcePerson: updated[0].name || ef.resourcePerson,
          resDesignation: updated[0].designation || ef.resDesignation,
          resOrganization: updated[0].organization || ef.resOrganization,
          speakerPhoto: updated[0].photo || ef.speakerPhoto
        }));
      }
      return updated;
    });
  };

  const handleDeletePerson = async (idx) => {
    if (eventPersons.length <= 1) {
      setEventPersons([createDefaultPerson(1)]);
      setActivePersonIndex(0);
      showInfo('Reset to default single dignitary.');
      return;
    }
    const personToDelete = eventPersons[idx];
    if (personToDelete?.photo) {
      const filename = personToDelete.photo.split('/').pop();
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
    }
    setEventPersons(prev => {
      const filtered = prev.filter((_, i) => i !== idx);
      return filtered.map((p, i) => ({ ...p, order: i + 1 }));
    });
    setActivePersonIndex(prev => Math.max(0, Math.min(prev, eventPersons.length - 2)));
    pushStateToHistory();
    showSuccess('Dignitary removed.');
  };

  const handleMovePersonUp = (idx) => {
    if (idx <= 0) return;
    setEventPersons(prev => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx - 1];
      updated[idx - 1] = temp;
      return updated.map((p, i) => ({ ...p, order: i + 1 }));
    });
    setActivePersonIndex(idx - 1);
    pushStateToHistory();
  };

  const handleMovePersonDown = (idx) => {
    if (idx >= eventPersons.length - 1) return;
    setEventPersons(prev => {
      const updated = [...prev];
      const temp = updated[idx];
      updated[idx] = updated[idx + 1];
      updated[idx + 1] = temp;
      return updated.map((p, i) => ({ ...p, order: i + 1 }));
    });
    setActivePersonIndex(idx + 1);
    pushStateToHistory();
  };

  const handlePersonPhotoUpload = async (idx, e) => {
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
      handleUpdatePerson(idx, { photo: fullUrl });

      if (data.isLowResolution && data.warningMessage) {
        setPhotoWarning(data.warningMessage);
        showInfo(data.warningMessage);
      } else {
        showSuccess(`Photo attached for ${eventPersons[idx]?.name || 'Dignitary'}.`);
      }
      pushStateToHistory();
    } catch (err) {
      showError(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePersonPhotoRemove = async (idx) => {
    const person = eventPersons[idx];
    if (!person?.photo) return;
    const filename = person.photo.split('/').pop();
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
    handleUpdatePerson(idx, { photo: '' });
    showInfo(`Photo removed for ${person.name || 'Dignitary'}.`);
    pushStateToHistory();
  };

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
            theme: selectedThemeId,
            customColors,
            typography,
            qrConfig,
            photoEdit,
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

  // =========================================================================
  // AI DESIGN & CONTENT ASSISTANCE (OPTIONAL & NON-AUTONOMOUS)
  // =========================================================================
  const handleRequestAiDesign = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/ai/suggest-design`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventTitle: eventForm.title,
          category: eventForm.type,
          speakerName: eventForm.resourcePerson,
          department: facultyDept
        })
      });
      const data = await res.json();
      if (data.suggestions) {
        setAiDesignSuggestion(data.suggestions);
        setShowAiDesignModal(true);
      } else {
        showInfo('AI suggestions unavailable. Manual design remains fully active.');
      }
    } catch (err) {
      console.warn('AI Suggestion error:', err);
      showInfo('AI service offline. You can continue using manual customization tools.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiDesign = () => {
    if (!aiDesignSuggestion) return;
    if (aiDesignSuggestion.theme) handleThemeSelect(aiDesignSuggestion.theme);
    if (aiDesignSuggestion.typography) {
      setTypography(prev => ({
        ...prev,
        titleFont: aiDesignSuggestion.typography.titleFont || prev.titleFont,
        bodyFont: aiDesignSuggestion.typography.bodyFont || prev.bodyFont,
        speakerFont: aiDesignSuggestion.typography.speakerFont || prev.speakerFont
      }));
    }
    if (aiDesignSuggestion.template) {
      if (activeTab === 'poster') setSelectedPosterTemplate(aiDesignSuggestion.template);
      if (activeTab === 'invitation') setSelectedInvitationTemplate('I01');
    }
    setShowAiDesignModal(false);
    showSuccess('AI design suggestion applied to current workspace!');
  };

  const handleRequestAiContent = async () => {
    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/ai/generate-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventTitle: eventForm.title,
          category: eventForm.type,
          speakerName: eventForm.resourcePerson,
          date: eventForm.fromDate,
          venue: eventForm.venue,
          department: facultyDept
        })
      });
      const data = await res.json();
      if (data.content) {
        setAiContentSuggestion(data.content);
        setShowAiContentModal(true);
      } else {
        showInfo('AI content generator unavailable. Manual entry active.');
      }
    } catch (err) {
      showInfo('AI content service offline. You can continue entering text manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleApplyAiContent = (field, value) => {
    setEventForm(prev => ({ ...prev, [field]: value }));
    showSuccess(`Applied content to ${field}.`);
  };

  // Run Professional Design Check
  const handleRunDesignAudit = () => {
    const audit = auditDesignRules({
      eventTitle: eventForm.title,
      speakerName: eventForm.resourcePerson,
      eventPersons,
      customColors,
      qrConfig,
      photoConfig: { width: 300, height: 300 }
    });
    setDesignAuditResult(audit);
    setShowAuditModal(true);
  };

  // Download PDF Handler
  const handleDownloadPdf = () => {
    if (activeTab === 'poster') {
      try {
        const doc = generatePosterPdf(selectedPosterTemplate, {
          ...eventForm,
          eventPersons,
          speakerLayout,
          displayOptions,
          customColors,
          typography,
          qrConfig,
          photoEdit
        });
        const filename = `SREC_Poster_${selectedPosterTemplate}_${sanitizeFilenamePart(eventForm.title)}.pdf`;
        doc.save(filename);
        logGeneratedDesign('POSTER', selectedPosterTemplate, 1);
        showSuccess('Poster PDF downloaded successfully.');
      } catch (err) {
        showError('Failed to generate poster PDF: ' + err.message);
      }
    } else if (activeTab === 'invitation') {
      try {
        const doc = generateInvitationPdf(selectedInvitationTemplate, {
          ...eventForm,
          eventPersons,
          speakerLayout,
          displayOptions,
          customColors,
          typography,
          qrConfig,
          photoEdit
        });
        const filename = `SREC_Invitation_${selectedInvitationTemplate}_${sanitizeFilenamePart(eventForm.title)}.pdf`;
        doc.save(filename);
        logGeneratedDesign('INVITATION', selectedInvitationTemplate, 1);
        showSuccess('Formal Invitation PDF downloaded successfully.');
      } catch (err) {
        showError('Failed to generate invitation PDF: ' + err.message);
      }
    }
  };

  // Download High-Res PNG Handler
  const handleDownloadPng = async () => {
    try {
      const targetPreset = SOCIAL_PRESETS[selectedSocialPreset] || SOCIAL_PRESETS.instagram_portrait;
      const dims = previewMode === 'social' ? { width: targetPreset.width, height: targetPreset.height } : { width: 1080, height: 1350 };
      
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/event-design/export-png`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          eventTitle: eventForm.title,
          templateId: activeTab === 'poster' ? selectedPosterTemplate : selectedInvitationTemplate,
          theme: selectedThemeId,
          customColors,
          typography,
          photoUrl: eventForm.resourcePersonPhoto || eventForm.speakerPhoto,
          eventPersons,
          speakerLayout,
          displayOptions,
          qr: qrConfig,
          department: facultyDept,
          speakerName: eventForm.resourcePerson,
          date: eventForm.fromDate,
          venue: eventForm.venue,
          dimensions: dims
        })
      });
      const data = await res.json();
      if (data.svg) {
        const filename = `SREC_${activeTab.toUpperCase()}_${dims.width}x${dims.height}_${sanitizeFilenamePart(eventForm.title)}.png`;
        await exportHighResPng(data.svg, filename, dims.width, dims.height);
        logGeneratedDesign(activeTab.toUpperCase(), activeTab === 'poster' ? selectedPosterTemplate : selectedInvitationTemplate, 1);
        showSuccess(`High-Resolution PNG (${dims.width}×${dims.height}) downloaded.`);
      } else {
        throw new Error(data.error || 'Failed to render PNG');
      }
    } catch (err) {
      showError('PNG export error: ' + err.message);
    }
  };

  // Download All Social Media Sizes ZIP
  const handleDownloadAllSocialZip = async () => {
    try {
      showInfo('Compiling Social Media Pack (all 8 formats)...');
      await exportSocialMediaPackZip(
        {
          ...eventForm,
          event_title: eventForm.title,
          resource_person: eventForm.resourcePerson,
          department: facultyDept,
          date: eventForm.fromDate,
          venue: eventForm.venue,
          eventPersons,
          speakerLayout,
          displayOptions
        },
        activeTab === 'poster' ? selectedPosterTemplate : selectedInvitationTemplate,
        selectedThemeId,
        {
          colors: customColors,
          typography,
          qr: qrConfig,
          photoUrl: eventForm.resourcePersonPhoto || eventForm.speakerPhoto,
          eventPersons,
          speakerLayout,
          displayOptions
        }
      );
      showSuccess('Social Media Pack ZIP downloaded successfully!');
    } catch (err) {
      showError('Failed to generate Social Media Pack: ' + err.message);
    }
  };

  // Complete Package Generation
  const handleGenerateCompletePackage = async () => {
    setIsPackageGenerating(true);
    setPackageResult(null);
    try {
      const idempotencyKey = `pkg_${selectedEventId || 'manual'}_${Date.now()}`;
      const res = await generateCompleteEventPackage({
        eventData: {
          ...eventForm,
          eventPersons,
          speakerLayout,
          displayOptions,
          customColors,
          typography,
          selectedThemeId,
          qrConfig
        },
        posterTemplate: packagePosterTmpl,
        invitationTemplate: packageInvTmpl,
        certificateTemplate: packageCertTmpl,
        participants,
        signatories,
        onProgress: (p) => setPackageProgress(p)
      });

      setPackageResult(res);

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

  // Bulk Certificate Generation
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
    <div style={{ padding: '24px 28px', maxWidth: '1480px', margin: '0 auto', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Top Header Card */}
      <div style={{
        background: 'linear-gradient(135deg, #0b2545 0%, #133c55 100%)',
        color: '#ffffff',
        borderRadius: '16px',
        padding: '22px 28px',
        marginBottom: '20px',
        boxShadow: '0 10px 25px -5px rgba(11, 37, 69, 0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.8rem' }}>🎨</span>
            <h1 style={{ margin: 0, fontSize: '1.55rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.5px' }}>
              Professional Event Designer & Publishing Suite
            </h1>
            <span style={{
              background: 'linear-gradient(135deg, #d4af37, #b8860b)',
              color: '#0b2545',
              fontSize: '0.72rem',
              fontWeight: 900,
              padding: '3px 10px',
              borderRadius: '20px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              V3.2.2 Multi-Format
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', color: '#cbd5e1', fontSize: '0.86rem' }}>
            Design once → Publish everywhere: Print Vector PDFs, High-Res PNGs, and 8 Social Media Presets with controlled institutional typography, themes, and QR codes.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '8px 16px',
            fontSize: '0.82rem',
            textAlign: 'right'
          }}>
            <div style={{ color: '#d4af37', fontWeight: 800 }}>Dept of {facultyDept}</div>
            <div style={{ color: '#e2e8f0', fontSize: '0.74rem' }}>{facultyName || 'Authenticated Faculty'}</div>
          </div>
        </div>
      </div>

      {/* Main Suite Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        gap: '8px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'package', label: '📦 One-Click Complete Package', badge: 'V3.2.2 Pro' },
          { id: 'poster', label: '🎨 Poster Designer', badge: '5 Templates' },
          { id: 'invitation', label: '📨 Invitation Studio', badge: '5 Templates' },
          { id: 'certificate', label: '📜 Participation Certificates', badge: 'Bulk Engine' },
          { id: 'gallery', label: '🏛️ Template Gallery', badge: '15 Designs' },
          { id: 'history', label: '📁 Design History', badge: generatedDesigns.length }
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
              borderBottom: activeTab === tab.id ? '3.5px solid #0b2545' : '3.5px solid transparent',
              color: activeTab === tab.id ? '#0b2545' : '#64748b',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
            <span style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === tab.id ? 'rgba(11, 37, 69, 0.12)' : '#f1f5f9',
              color: activeTab === tab.id ? '#0b2545' : '#64748b'
            }}>
              {tab.badge}
            </span>
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* POSTER & INVITATION DESIGNER (V3.2.2 WITH CANVA/PHOTOSHOP CUSTOMIZATION) */}
      {/* ========================================================================= */}
      {(activeTab === 'poster' || activeTab === 'invitation') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 480px) 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Design Customization Studio */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Toolbar: Undo / Redo / Design Audit / AI Buttons */}
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              border: '1.5px solid #e2e8f0',
              padding: '12px 16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  title="Undo (Ctrl+Z)"
                  onClick={handleUndo}
                  disabled={historyIndex <= 0}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: historyIndex > 0 ? 'pointer' : 'not-allowed',
                    color: historyIndex > 0 ? '#0f172a' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <Undo size={14} /> Undo
                </button>
                <button
                  type="button"
                  title="Redo (Ctrl+Shift+Z)"
                  onClick={handleRedo}
                  disabled={historyIndex >= historyStack.length - 1}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: historyIndex < historyStack.length - 1 ? 'pointer' : 'not-allowed',
                    color: historyIndex < historyStack.length - 1 ? '#0f172a' : '#94a3b8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <Redo size={14} /> Redo
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleRunDesignAudit}
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}
                >
                  <ShieldCheck size={14} /> Design Check
                </button>

                <button
                  type="button"
                  onClick={handleRequestAiDesign}
                  style={{
                    background: 'linear-gradient(135deg, #fdf4ff, #fae8ff)',
                    border: '1px solid #d8b4fe',
                    borderRadius: '6px',
                    padding: '6px 10px',
                    cursor: 'pointer',
                    color: '#7e22ce',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}
                >
                  <Sparkles size={14} /> ✨ AI Suggest
                </button>
              </div>
            </div>

            {/* Customization Accordion Nav */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(6, 1fr)',
              background: '#f1f5f9',
              borderRadius: '10px',
              padding: '4px',
              gap: '4px'
            }}>
              {[
                { id: 'speakers', icon: <Users size={14} />, label: `Dignitaries (${eventPersons.length})` },
                { id: 'theme', icon: <Palette size={14} />, label: 'Themes' },
                { id: 'typography', icon: <Type size={14} />, label: 'Fonts' },
                { id: 'photo', icon: <Crop size={14} />, label: 'Photo' },
                { id: 'qr', icon: <QrCode size={14} />, label: 'QR Code' },
                { id: 'content', icon: <FileText size={14} />, label: 'Content' }
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveCustomizeAccordion(sec.id)}
                  style={{
                    padding: '8px 4px',
                    border: 'none',
                    borderRadius: '7px',
                    background: activeCustomizeAccordion === sec.id ? '#ffffff' : 'transparent',
                    color: activeCustomizeAccordion === sec.id ? '#0b2545' : '#64748b',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: activeCustomizeAccordion === sec.id ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {sec.icon}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>{sec.label}</span>
                </button>
              ))}
            </div>

            {/* SECTION 0: MULTIPLE DIGNITARIES & RESOURCE PERSONS */}
            {activeCustomizeAccordion === 'speakers' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={16} color="#0b2545" /> Dignitaries & Resource Persons
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPerson}
                    style={{
                      background: '#0b2545',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Plus size={13} /> Add Person
                  </button>
                </div>

                {/* Speaker Layout Controls */}
                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '12px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.74rem', fontWeight: 800, color: '#334155' }}>
                      Layout Style ({eventPersons.length} {eventPersons.length === 1 ? 'Person' : 'People'})
                    </label>
                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Adaptive Grid Engine</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                    {[
                      { id: 'auto', label: '⚡ Auto Adaptive' },
                      { id: 'two_column', label: '2 Columns' },
                      { id: 'three_column', label: '3 Columns' },
                      { id: 'grid', label: '2×2 Grid' },
                      { id: 'compact_grid', label: 'Compact Grid' }
                    ].map(layout => (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => { setSpeakerLayout(layout.id); pushStateToHistory(); }}
                        style={{
                          padding: '6px 4px',
                          border: speakerLayout === layout.id ? '2px solid #0b2545' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: speakerLayout === layout.id ? '#f0f9ff' : '#ffffff',
                          color: speakerLayout === layout.id ? '#0b2545' : '#475569',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {layout.label}
                      </button>
                    ))}
                  </div>

                  {/* Display Option Toggles */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                    {[
                      { key: 'showPhoto', label: 'Photos' },
                      { key: 'showName', label: 'Names' },
                      { key: 'showDesignation', label: 'Designations' },
                      { key: 'showOrganization', label: 'Organizations' },
                      { key: 'showProfile', label: 'Short Bio' }
                    ].map(opt => (
                      <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', fontWeight: 700, color: '#475569', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={displayOptions[opt.key] !== false}
                          onChange={(e) => {
                            setDisplayOptions(prev => ({ ...prev, [opt.key]: e.target.checked }));
                            pushStateToHistory();
                          }}
                          style={{ accentColor: '#0b2545' }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Persons List & Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {eventPersons.map((person, idx) => (
                    <div
                      key={person.id || idx}
                      style={{
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '10px',
                        background: '#ffffff',
                        padding: '14px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#0b2545', color: '#ffffff', fontSize: '0.7rem', fontWeight: 900, padding: '2px 8px', borderRadius: '12px' }}>
                            #{idx + 1}
                          </span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                            {person.name || `Dignitary ${idx + 1}`}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMovePersonUp(idx)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '4px',
                              cursor: idx === 0 ? 'not-allowed' : 'pointer',
                              color: idx === 0 ? '#cbd5e1' : '#475569'
                            }}
                            title="Move Up"
                          >
                            <MoveUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === eventPersons.length - 1}
                            onClick={() => handleMovePersonDown(idx)}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '4px',
                              padding: '4px',
                              cursor: idx === eventPersons.length - 1 ? 'not-allowed' : 'pointer',
                              color: idx === eventPersons.length - 1 ? '#cbd5e1' : '#475569'
                            }}
                            title="Move Down"
                          >
                            <MoveDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePerson(idx)}
                            style={{
                              background: '#fee2e2',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '4px',
                              cursor: 'pointer',
                              color: '#b91c1c',
                              marginLeft: '4px'
                            }}
                            title="Delete Person"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Person Details Form */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '10px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Role / Honorific</label>
                          <select
                            value={person.role || 'Resource Person'}
                            onChange={(e) => { handleUpdatePerson(idx, { role: e.target.value }); pushStateToHistory(); }}
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', fontWeight: 700, background: '#ffffff', color: '#0f172a' }}
                          >
                            {PERSON_ROLES.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Full Name</label>
                          <input
                            type="text"
                            value={person.name || ''}
                            onChange={(e) => handleUpdatePerson(idx, { name: e.target.value })}
                            onBlur={pushStateToHistory}
                            placeholder="e.g. Dr. K. Sundar"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Designation</label>
                          <input
                            type="text"
                            value={person.designation || ''}
                            onChange={(e) => handleUpdatePerson(idx, { designation: e.target.value })}
                            onBlur={pushStateToHistory}
                            placeholder="e.g. Senior Principal Scientist"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: '3px' }}>Organization / Institution</label>
                          <input
                            type="text"
                            value={person.organization || ''}
                            onChange={(e) => handleUpdatePerson(idx, { organization: e.target.value })}
                            onBlur={pushStateToHistory}
                            placeholder="e.g. Apex Tech Labs"
                            style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.78rem', boxSizing: 'border-box' }}
                          />
                        </div>
                      </div>

                      {/* Photo Section for Individual Person */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '8px' }}>
                        {person.photo ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <img
                              src={person.photo}
                              alt={person.name}
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: person.photoCrop === 'circle' ? '50%' : person.photoCrop === 'rounded_rectangle' ? '6px' : '0px',
                                objectFit: 'cover',
                                border: '2px solid #0b2545'
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0f172a' }}>Photo Attached</div>
                              <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                                {['circle', 'rounded_rectangle', 'square'].map(crop => (
                                  <button
                                    key={crop}
                                    type="button"
                                    onClick={() => handleUpdatePerson(idx, { photoCrop: crop })}
                                    style={{
                                      padding: '2px 5px',
                                      fontSize: '0.64rem',
                                      borderRadius: '4px',
                                      border: (person.photoCrop || 'circle') === crop ? '1px solid #0b2545' : '1px solid #cbd5e1',
                                      background: (person.photoCrop || 'circle') === crop ? '#0b2545' : '#ffffff',
                                      color: (person.photoCrop || 'circle') === crop ? '#ffffff' : '#64748b',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    {crop === 'circle' ? 'Circle' : crop === 'rounded_rectangle' ? 'Round' : 'Square'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handlePersonPhotoRemove(idx)}
                              style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: '4px', padding: '4px 6px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Remove
                            </button>
                          </div>
                        ) : (
                          <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', cursor: 'pointer', padding: '6px' }}>
                            <Upload size={14} color="#64748b" />
                            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#334155' }}>Attach Photo for {person.name || `Person ${idx + 1}`}</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePersonPhotoUpload(idx, e)}
                              style={{ display: 'none' }}
                            />
                          </label>
                        )}
                      </div>

                      {/* Short Profile / Bio (Optional) */}
                      <div>
                        <input
                          type="text"
                          value={person.profile || ''}
                          onChange={(e) => handleUpdatePerson(idx, { profile: e.target.value })}
                          onBlur={pushStateToHistory}
                          placeholder="Optional profile snippet or keynote focus..."
                          style={{ width: '100%', padding: '5px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.72rem', fontStyle: 'italic', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 1: THEMES & COLOR PALETTES */}
            {activeCustomizeAccordion === 'theme' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Palette size={16} color="#0b2545" /> Institutional Themes & Palettes
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetTheme}
                    style={{ background: 'none', border: 'none', color: '#0369a1', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reset to Default
                  </button>
                </div>

                {/* Theme Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '16px' }}>
                  {Object.values(THEMES).map(th => (
                    <div
                      key={th.id}
                      onClick={() => {
                        handleThemeSelect(th.id);
                        pushStateToHistory();
                      }}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        border: selectedThemeId === th.id ? '2px solid #0b2545' : '1px solid #e2e8f0',
                        background: selectedThemeId === th.id ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>{th.name.split('(')[0]}</div>
                        {th.isProtected && <Lock size={12} color="#64748b" title="SREC Institutional Protected Theme" />}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: th.primary, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: th.secondary, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: th.accent, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                        <span style={{ width: '16px', height: '16px', borderRadius: '50%', background: th.background, display: 'inline-block', border: '1px solid rgba(0,0,0,0.1)' }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Fine-Grained Color Controls */}
                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Primary Brand Color</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                        style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={customColors.primary}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, primary: e.target.value }))}
                        style={{ width: '80px', padding: '4px 6px', fontSize: '0.76rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Accent Color</label>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="color"
                        value={customColors.accent}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                        style={{ width: '32px', height: '32px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                      />
                      <input
                        type="text"
                        value={customColors.accent}
                        onChange={(e) => setCustomColors(prev => ({ ...prev, accent: e.target.value }))}
                        style={{ width: '80px', padding: '4px 6px', fontSize: '0.76rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Institutional Locking Notice */}
                <div style={{ marginTop: '12px', background: '#f8fafc', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#64748b' }}>
                  <Lock size={12} color="#0b2545" />
                  <span>🔒 SREC Official Seal & Institutional Signatory Footers remain locked to ensure accreditation integrity.</span>
                </div>
              </div>
            )}

            {/* SECTION 2: TYPOGRAPHY & SIZES */}
            {activeCustomizeAccordion === 'typography' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Type size={16} color="#0b2545" /> Typography & Controlled Sizes
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetTypography}
                    style={{ background: 'none', border: 'none', color: '#0369a1', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reset Typography
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Title Font Family</label>
                    <select
                      value={typography.titleFont}
                      onChange={(e) => setTypography(prev => ({ ...prev, titleFont: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    >
                      {APPROVED_FONTS.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      <span>Event Title Size ({typography.titleFontSize}px)</span>
                      <span style={{ color: '#94a3b8' }}>24–72 px</span>
                    </div>
                    <input
                      type="range"
                      min={FONT_SIZE_BOUNDS.eventTitle.min}
                      max={FONT_SIZE_BOUNDS.eventTitle.max}
                      value={typography.titleFontSize}
                      onChange={(e) => setTypography(prev => ({ ...prev, titleFontSize: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: '#0b2545' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      <span>Speaker Name Size ({typography.speakerFontSize}px)</span>
                      <span style={{ color: '#94a3b8' }}>20–48 px</span>
                    </div>
                    <input
                      type="range"
                      min={FONT_SIZE_BOUNDS.speakerName.min}
                      max={FONT_SIZE_BOUNDS.speakerName.max}
                      value={typography.speakerFontSize}
                      onChange={(e) => setTypography(prev => ({ ...prev, speakerFontSize: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: '#0b2545' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 3: PHOTO EDITOR */}
            {activeCustomizeAccordion === 'photo' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Crop size={16} color="#0b2545" /> Chief Guest / Speaker Photo Editor
                  </h4>
                  <button
                    type="button"
                    onClick={handleResetPhoto}
                    style={{ background: 'none', border: 'none', color: '#0369a1', fontSize: '0.74rem', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Reset Adjustments
                  </button>
                </div>

                {/* Upload & Replace Area */}
                <div style={{ marginBottom: '14px' }}>
                  {(eventForm.resourcePersonPhoto || eventForm.speakerPhoto) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <img
                        src={eventForm.resourcePersonPhoto || eventForm.speakerPhoto}
                        alt="Preview"
                        style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: photoEdit.cropShape === 'circle' ? '50%' : photoEdit.cropShape === 'rounded_rectangle' ? '8px' : '0px',
                          objectFit: 'cover',
                          border: photoEdit.border ? '2px solid #0b2545' : 'none',
                          filter: `brightness(${photoEdit.brightness}%) contrast(${photoEdit.contrast}%)`
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#0f172a' }}>Speaker Photo Attached</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Accredited format (JPG/PNG/WEBP)</div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        style={{ background: '#fee2e2', border: 'none', color: '#b91c1c', borderRadius: '6px', padding: '6px', cursor: 'pointer' }}
                        title="Remove Photo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', cursor: 'pointer', background: '#f8fafc' }}>
                      <Upload size={20} color="#64748b" />
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginTop: '4px' }}>Upload Speaker / Chief Guest Photo</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Max 5 MB | JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                    </label>
                  )}
                </div>

                {/* Crop Shape Options */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>Crop Geometry</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'circle', label: 'Circular' },
                      { id: 'square', label: 'Square' },
                      { id: 'rounded_rectangle', label: 'Rounded' }
                    ].map(sh => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => setPhotoEdit(prev => ({ ...prev, cropShape: sh.id }))}
                        style={{
                          padding: '6px',
                          border: photoEdit.cropShape === sh.id ? '2px solid #0b2545' : '1px solid #cbd5e1',
                          borderRadius: '6px',
                          background: photoEdit.cropShape === sh.id ? '#f0f9ff' : '#ffffff',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {sh.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brightness & Contrast Sliders */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Brightness ({photoEdit.brightness}%)</span>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={photoEdit.brightness}
                      onChange={(e) => setPhotoEdit(prev => ({ ...prev, brightness: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: '#0b2545' }}
                    />
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: '#475569', marginBottom: '2px' }}>Contrast ({photoEdit.contrast}%)</span>
                    <input
                      type="range"
                      min="60"
                      max="140"
                      value={photoEdit.contrast}
                      onChange={(e) => setPhotoEdit(prev => ({ ...prev, contrast: parseInt(e.target.value, 10) }))}
                      style={{ width: '100%', accentColor: '#0b2545' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 4: QR CODE GENERATOR */}
            {activeCustomizeAccordion === 'qr' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <QrCode size={16} color="#0b2545" /> Event QR Code Generator
                  </h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 800, color: '#0b2545' }}>
                    <input
                      type="checkbox"
                      checked={qrConfig.enabled}
                      onChange={(e) => setQrConfig(prev => ({ ...prev, enabled: e.target.checked }))}
                    />
                    Include QR Code
                  </label>
                </div>

                {qrConfig.enabled && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Target URL / Form Link</label>
                      <input
                        type="url"
                        placeholder="https://forms.gle/srec-event-registration"
                        value={qrConfig.url}
                        onChange={(e) => setQrConfig(prev => ({ ...prev, url: e.target.value }))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Caption</label>
                        <input
                          type="text"
                          value={qrConfig.caption}
                          onChange={(e) => setQrConfig(prev => ({ ...prev, caption: e.target.value }))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Position</label>
                        <select
                          value={qrConfig.position}
                          onChange={(e) => setQrConfig(prev => ({ ...prev, position: e.target.value }))}
                          style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.8rem' }}
                        >
                          <option value="bottom-right">Bottom Right</option>
                          <option value="bottom-left">Bottom Left</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 5: EVENT CONTENT DETAILS */}
            {activeCustomizeAccordion === 'content' && (
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '18px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FileText size={16} color="#0b2545" /> Event Activity Information
                  </h4>
                  <button
                    type="button"
                    onClick={handleRequestAiContent}
                    style={{ background: '#fae8ff', border: '1px solid #d8b4fe', color: '#7e22ce', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Sparkles size={12} /> ✨ AI Copy
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Event Title</label>
                    <input
                      type="text"
                      value={eventForm.title}
                      onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Resource Person / Chief Guest</label>
                    <input
                      type="text"
                      value={eventForm.resourcePerson}
                      onChange={(e) => setEventForm(prev => ({ ...prev, resourcePerson: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Date</label>
                      <input
                        type="date"
                        value={eventForm.fromDate}
                        onChange={(e) => setEventForm(prev => ({ ...prev, fromDate: e.target.value }))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Time</label>
                      <input
                        type="text"
                        value={eventForm.time}
                        onChange={(e) => setEventForm(prev => ({ ...prev, time: e.target.value }))}
                        style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>Venue</label>
                    <input
                      type="text"
                      value={eventForm.venue}
                      onChange={(e) => setEventForm(prev => ({ ...prev, venue: e.target.value }))}
                      style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Multi-Format Preview & Publishing Toolbar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Top Preview Format Switcher */}
            <div style={{
              background: '#ffffff',
              borderRadius: '14px',
              border: '1.5px solid #e2e8f0',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>Output Canvas:</span>
                <select
                  value={selectedSocialPreset}
                  onChange={(e) => {
                    setSelectedSocialPreset(e.target.value);
                    setPreviewMode('social');
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#0b2545',
                    background: '#f8fafc'
                  }}
                >
                  <optgroup label="Print Standards">
                    <option value="a4_print">A4 Standard Print (Vector PDF)</option>
                  </optgroup>
                  <optgroup label="Social Media Formats">
                    {Object.values(SOCIAL_PRESETS).map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.name} ({pr.width}×{pr.height})</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  style={{
                    background: '#0b2545',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(11,37,69,0.2)'
                  }}
                >
                  <Download size={14} /> Download PDF
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(2,132,199,0.2)'
                  }}
                >
                  <ImageIcon size={14} /> High-Res PNG
                </button>

                <button
                  type="button"
                  onClick={handleDownloadAllSocialZip}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 14px',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 6px rgba(16,185,129,0.2)'
                  }}
                >
                  <Archive size={14} /> Social Pack ZIP
                </button>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div style={{
              background: '#e2e8f0',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '640px',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <div
                style={{
                  width: '100%',
                  maxWidth: '560px',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  background: customColors.background,
                  border: `2px solid ${customColors.primary}`
                }}
                dangerouslySetInnerHTML={{
                  __html: activeTab === 'poster'
                    ? renderPosterHtml(selectedPosterTemplate, {
                        ...eventForm,
                        resourcePersonPhoto: eventForm.resourcePersonPhoto || eventForm.speakerPhoto,
                        eventPersons
                      }, {
                        customColors,
                        typography,
                        qrConfig,
                        photoEdit,
                        speakerLayout,
                        showPhoto: displayOptions.showPhoto,
                        showProfile: displayOptions.showProfile
                      })
                    : renderInvitationHtml(selectedInvitationTemplate, {
                        ...eventForm,
                        resourcePersonPhoto: eventForm.resourcePersonPhoto || eventForm.speakerPhoto,
                        eventPersons
                      }, {
                        customColors,
                        typography,
                        qrConfig,
                        photoEdit,
                        speakerLayout,
                        showPhoto: displayOptions.showPhoto,
                        showProfile: displayOptions.showProfile
                      })
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 0: ONE-CLICK COMPLETE EVENT PACKAGE STUDIO (V3.2.2 EXTENDED)         */}
      {/* ========================================================================= */}
      {activeTab === 'package' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: 'linear-gradient(135deg, #0b2545, #1e3a8a)', borderRadius: '16px', padding: '24px 28px', color: '#ffffff', boxShadow: '0 10px 25px -5px rgba(11,37,69,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>📦</span>
                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: '#ffffff' }}>
                  One-Click Complete Event Package Studio
                </h2>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.86rem', color: '#bfdbfe', maxWidth: '680px' }}>
                Generate all institutional event artifacts in a single automated pass: Print Vector Poster, High-Res PNG, Formal Invitation Card, Multi-Format Social Media Pack, Individual Participant Certificates, Combined Merged PDF, and Official Event Summary Sheet.
              </p>
            </div>

            <button
              type="button"
              disabled={isPackageGenerating}
              onClick={handleGenerateCompletePackage}
              style={{
                background: isPackageGenerating ? '#94a3b8' : '#ffffff',
                color: isPackageGenerating ? '#ffffff' : '#0b2545',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 900,
                fontSize: '0.95rem',
                cursor: isPackageGenerating ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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

          {/* Progress Tracker Card */}
          {isPackageGenerating && (
            <div style={{ background: '#ffffff', borderRadius: '14px', border: '2px solid #0b2545', padding: '20px 24px', boxShadow: '0 4px 12px rgba(11,37,69,0.08)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0b2545', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RefreshCw size={16} className="animate-spin" color="#0b2545" />
                  Step {packageProgress.step} of 7: {packageProgress.stepName}
                </div>
                <div style={{ fontWeight: 900, fontSize: '1rem', color: '#0b2545' }}>
                  {packageProgress.percentage}%
                </div>
              </div>
              <div style={{ width: '100%', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ width: `${packageProgress.percentage}%`, height: '100%', background: 'linear-gradient(90deg, #0b2545, #10b981)', transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          {/* Configuration Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '24px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>📋 Target Event Information</h4>
                  {selectedEventId && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 800, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '10px' }}>
                      Linked #{selectedEventId}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{eventForm.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  <div><strong>Category:</strong> {eventForm.type}</div>
                  <div><strong>Dept:</strong> {facultyDept} ({facultyDeptCode})</div>
                  <div><strong>Date:</strong> {eventForm.fromDate || 'N/A'}</div>
                  <div><strong>Resource Person:</strong> {eventForm.resourcePerson || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '20px' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>📦 Artifacts Generated in Package</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.82rem' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📄 01_Poster.pdf</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>🖼️ 02_Poster.png</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📨 03_Invitation.pdf</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>🖼️ 04_Invitation.png</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📜 05_Certificates/</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📑 06_Combined_Certificates.pdf</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📊 07_Event_Summary.pdf</div>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>📲 08_Social_Media_Pack/</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PARTICIPATION CERTIFICATES TAB                                            */}
      {/* ========================================================================= */}
      {activeTab === 'certificate' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', border: '1.5px solid #e2e8f0', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Bulk Participation Certificates Engine</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.84rem' }}>
                Accredited 3-signatory certificates (Faculty Coordinator, HOD, Principal) with deterministic unique serial numbers.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                disabled={isBulkGenerating}
                onClick={handleGenerateBulkCertificates}
                style={{
                  background: '#0b2545',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 18px',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  cursor: isBulkGenerating ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {isBulkGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Archive size={16} />}
                Generate & Download Bulk ZIP ({participants.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI DESIGN SUGGESTION MODAL                                                */}
      {/* ========================================================================= */}
      {showAiDesignModal && aiDesignSuggestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>✨</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>AI Design Suggestions</h3>
              </div>
              <button type="button" onClick={() => setShowAiDesignModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, marginBottom: '18px' }}>
              <p style={{ margin: '0 0 12px 0', background: '#f5f3ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #ddd6fe', color: '#6b21a8' }}>
                <strong>Rationale:</strong> {aiDesignSuggestion.rationale}
              </p>
              <div><strong>Suggested Theme:</strong> {THEMES[aiDesignSuggestion.theme]?.name || aiDesignSuggestion.theme}</div>
              <div><strong>Typography:</strong> {aiDesignSuggestion.typography?.titleFont} (Title) & {aiDesignSuggestion.typography?.bodyFont} (Body)</div>
              <div><strong>Social Format:</strong> {SOCIAL_PRESETS[aiDesignSuggestion.recommendedSocialFormat]?.name || 'Instagram Portrait'}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAiDesignModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Reject
              </button>
              <button
                type="button"
                onClick={handleApplyAiDesign}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#7e22ce', color: '#ffffff', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Accept Suggestion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AI CONTENT GENERATION MODAL                                               */}
      {/* ========================================================================= */}
      {showAiContentModal && aiContentSuggestion && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '600px', width: '100%', maxHeight: '85vh', overflowY: 'auto', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.4rem' }}>📝</span>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>AI Generated Event Copy</h3>
              </div>
              <button type="button" onClick={() => setShowAiContentModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Subtitle:</strong>
                  <button type="button" onClick={() => handleApplyAiContent('theme', aiContentSuggestion.subtitle)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}>Apply</button>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>{aiContentSuggestion.subtitle}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ fontSize: '0.78rem', color: '#0f172a' }}>Formal Invitation Copy:</strong>
                  <button type="button" onClick={() => handleApplyAiContent('description', aiContentSuggestion.invitationParagraph)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}>Apply</button>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#334155' }}>{aiContentSuggestion.invitationParagraph}</div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '0.78rem', color: '#0f172a', display: 'block', marginBottom: '4px' }}>WhatsApp Announcement:</strong>
                <pre style={{ margin: 0, fontSize: '0.76rem', whiteSpace: 'pre-wrap', color: '#334155', fontFamily: 'inherit' }}>{aiContentSuggestion.whatsappAnnouncement}</pre>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAiContentModal(false)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0b2545', color: '#ffffff', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL DESIGN CHECK MODAL                                           */}
      {/* ========================================================================= */}
      {showAuditModal && designAuditResult && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={22} color={designAuditResult.valid ? '#16a34a' : '#dc2626'} />
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Professional Design Check</h3>
              </div>
              <button type="button" onClick={() => setShowAuditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: '0.84rem', color: '#334155', marginBottom: '18px' }}>
              <div style={{
                background: designAuditResult.valid ? '#f0fdf4' : '#fef2f2',
                border: designAuditResult.valid ? '1px solid #bbf7d0' : '1px solid #fecaca',
                borderRadius: '8px',
                padding: '10px 14px',
                color: designAuditResult.valid ? '#166534' : '#991b1b',
                fontWeight: 700,
                marginBottom: '12px'
              }}>
                {designAuditResult.summary}
              </div>

              {designAuditResult.issues.length === 0 ? (
                <div style={{ color: '#16a34a', fontSize: '0.82rem' }}>✓ All typography, color contrast, safe margins, and QR formats conform to institutional guidelines.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {designAuditResult.issues.map((iss, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.78rem' }}>
                      <span style={{ fontWeight: 800, color: iss.level === 'CRITICAL' ? '#dc2626' : iss.level === 'WARNING' ? '#d97706' : '#2563eb' }}>[{iss.level}]</span>
                      <span>{iss.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#0b2545', color: '#ffffff', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
