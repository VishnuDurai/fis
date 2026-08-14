import { API_BASE_URL } from "../config";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Download, FileSignature, Search, Edit } from 'lucide-react';
import Navbar from '../components/Navbar.jsx';
import Dropzone from '../components/Dropzone.jsx';
import ReportButtons from '../components/ReportButtons.jsx';

function SearchableMultiSelect({ options, value, onChange, placeholder = "Search & select indexings..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);

  const selectedList = value 
    ? value.split(',').map(s => s.trim()).filter(Boolean) 
    : [];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt) => {
    let updated;
    if (selectedList.includes(opt)) {
      updated = selectedList.filter(item => item !== opt);
    } else {
      updated = [...selectedList, opt];
    }
    onChange(updated.join(', '));
  };

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        onClick={() => setIsOpen(true)}
        style={{
          minHeight: '44px',
          padding: '6px 12px',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          background: '#ffffff',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '6px',
          cursor: 'text'
        }}
      >
        {selectedList.map((opt, i) => (
          <span 
            key={i} 
            style={{ 
              background: 'hsla(var(--primary), 0.12)', 
              color: 'hsl(var(--primary))', 
              border: '1px solid hsla(var(--primary), 0.3)',
              padding: '2px 10px', 
              borderRadius: '16px', 
              fontSize: '0.82rem', 
              fontWeight: 700, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}
          >
            {opt}
            <span 
              onClick={(e) => { e.stopPropagation(); toggleOption(opt); }} 
              style={{ cursor: 'pointer', opacity: 0.8, fontWeight: 900 }}
            >
              ×
            </span>
          </span>
        ))}

        <input 
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedList.length === 0 ? placeholder : 'Add more indexing...'}
          style={{
            border: 'none',
            outline: 'none',
            flex: 1,
            minWidth: '120px',
            fontSize: '0.9rem',
            background: 'transparent'
          }}
        />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          right: 0,
          maxHeight: '200px',
          overflowY: 'auto',
          background: '#ffffff',
          border: '1.5px solid #cbd5e1',
          borderRadius: '8px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.12)',
          zIndex: 1000,
          padding: '4px'
        }}>
          {filteredOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '0.85rem', color: '#64748b' }}>No matching indexing found.</div>
          ) : (
            filteredOptions.map((opt, idx) => {
              const isSelected = selectedList.includes(opt);
              return (
                <div
                  key={idx}
                  onClick={() => toggleOption(opt)}
                  style={{
                    padding: '8px 12px',
                    fontSize: '0.88rem',
                    fontWeight: isSelected ? 700 : 500,
                    color: isSelected ? 'hsl(var(--primary))' : '#0f172a',
                    background: isSelected ? 'hsla(var(--primary), 0.08)' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}
                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = '#f1f5f9'; }}
                  onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                >
                  <span>{opt}</span>
                  {isSelected && <span style={{ fontWeight: 800 }}>✓</span>}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

const activityConfigs = {
  publications: {
    title: 'Publications',
    headers: [
      'Category',
      'Domain Scope',
      'Publication Title',
      'Journal / Conference Name',
      'Co-Authors',
      'Author Position',
      'ISSN / ISBN',
      'Vol / Issue / Venue',
      'Date & Month',
      'Publisher / Organizer',
      'DOI / URL',
      'Indexing',
      'Citations & Impact',
      'Attachment'
    ],
    fields: [
      { name: 'type_pub', label: 'Publication Category', type: 'select', options: ['Journal', 'Conference'], required: true },
      { name: 'type', label: 'Domain Scope', type: 'select', options: ['International', 'National'], required: true },
      { name: 'title', label: 'Publication Title', type: 'text', required: true },
      { name: 'journel', label: 'Journal / Conference Name', type: 'text', required: true },
      { name: 'co_authors', label: 'Co-Author(s) List', type: 'text', required: true },
      { name: 'author_position', label: 'Author Position', type: 'select', options: ['First Author', 'Corresponding Author', 'Second Author', 'Co-Author', 'Other'], required: false },
      { name: 'date_con', label: 'Date of Publication', type: 'date', required: true },
      { name: 'month_pub', label: 'Month of Publication', type: 'select', options: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], required: true },
      { name: 'organizer', label: 'Organizer / Publisher', type: 'text', required: true },
      { name: 'doi', label: 'DOI Number', type: 'text', required: false },
      { name: 'paper_url', label: 'Paper URL / Publisher URL', type: 'text', required: false },
      { name: 'pp', label: 'Page Range (PP)', type: 'text', required: false },
      { name: 'index_pub', label: 'Indexing (Scopus, WoS, SCI, SCIE, ESCI, UGC Care)', type: 'multiselect', options: ['Scopus', 'WoS', 'SCI', 'SCIE', 'ESCI', 'UGC Care', 'Other'], required: true },
      { name: 'citations', label: 'Citations Count', type: 'number', required: false },

      // Journal & Conference Fields
      { name: 'issn_no', label: 'ISSN Number (e.g. 1611-3349)', type: 'text', required: false },
      { name: 'volume_pub', label: 'Volume Number', type: 'text', journalOnly: true, required: false },
      { name: 'issue_no', label: 'Issue Number', type: 'text', journalOnly: true, required: false },
      { name: 'impact', label: 'Impact Factor', type: 'number', step: '0.01', journalOnly: true, required: false },

      // Conference Specific Fields
      { name: 'isbn', label: 'ISBN Number (Proceedings)', type: 'text', confOnly: true, required: false },
      { name: 'conf_venue', label: 'Conference Venue', type: 'text', confOnly: true, required: false },
      { name: 'conf_dates', label: 'Conference Date', type: 'date', confOnly: true, required: false }
    ],
    renderRow: (row) => [
      row.type_pub || 'Journal',
      row.type || 'International',
      row.title || 'N/A',
      row.journel || 'N/A',
      row.co_authors || 'N/A',
      row.author_position || 'N/A',
      (row.issn_no ? `ISSN: ${row.issn_no}` : (row.isbn ? `ISBN: ${row.isbn}` : 'N/A')),
      ((row.type_pub || '').toLowerCase() === 'conference' ? (row.conf_venue || row.conf_dates ? `${row.conf_venue || ''} ${row.conf_dates ? `(${row.conf_dates})` : ''}`.trim() : 'N/A') : `Vol: ${row.volume_pub || '-'}, Issue: ${row.issue_no || '-'}`),
      `${row.date_con || ''} ${row.month_pub ? `(${row.month_pub})` : ''}`.trim() || 'N/A',
      row.organizer || 'N/A',
      row.paper_url || row.doi || 'N/A',
      row.index_pub || 'N/A',
      `Citations: ${row.citations || 0}${row.impact ? ` | IF: ${row.impact}` : ''}`
    ]
  },
  books: {
    title: 'Books Published',
    headers: ['Book Title', 'Co-Authors', 'Publisher', 'Edition', 'ISBN', 'Date of Pub', 'Attachment'],
    fields: [
      { name: 'title', label: 'Book Title', type: 'text', required: true },
      { name: 'coauthor', label: 'Co-Author Details', type: 'text', required: true },
      { name: 'publisher', label: 'Publisher Name', type: 'text', required: true },
      { name: 'edition', label: 'Edition', type: 'text', required: true },
      { name: 'isbn', label: 'ISBN Code', type: 'text', required: true },
      { name: 'dateofpublication', label: 'Date of Publication', type: 'date', required: true }
    ],
    renderRow: (row) => [
      row.title,
      row.coauthor || 'None',
      row.publisher,
      row.edition || '1st',
      row.isbn,
      row.dateofpublication
    ]
  },
  awards: {
    title: 'Awards Received',
    headers: ['Award Name', 'Awarded By', 'Event Name', 'Award Date', 'Attachment'],
    fields: [
      { name: 'awardname', label: 'Award Title', type: 'text', required: true },
      { name: 'awardby', label: 'Awarding Body / Agency', type: 'text', required: true },
      { name: 'event', label: 'Name of the Event', type: 'text', required: true },
      { name: 'awa_date', label: 'Date of Award', type: 'date', required: true }
    ],
    renderRow: (row) => [
      row.awardname,
      row.awardby,
      row.event || 'N/A',
      row.awa_date
    ]
  },
  resource: {
    title: 'Resource Person Details',
    headers: ['Scope', 'Topic / Title', 'Acted As', 'From Date', 'To Date', 'Organizer', 'Beneficiaries', 'Attachment'],
    fields: [
      { name: 'type', label: 'Scope', type: 'select', options: ['International', 'National', 'State', 'Local'], required: true },
      { name: 'title', label: 'Topic of Lecture / Talk', type: 'text', required: true },
      { name: 'actedas', label: 'Role / Designation (e.g. Speaker, Chair)', type: 'text', required: true },
      { name: 'from_date', label: 'From Date', type: 'date', required: true },
      { name: 'to_date', label: 'To Date', type: 'date', required: true },
      { name: 'organizer', label: 'Organizer Agency', type: 'text', required: true },
      { name: 'ben', label: 'Beneficiary Student/Faculty Count', type: 'number', required: true }
    ],
    renderRow: (row) => [
      row.type,
      row.title,
      row.actedas,
      row.from_date,
      row.to_date,
      row.organizer,
      row.ben || 0
    ]
  },
  funding: {
    title: 'Research Funding & Event Grants',
    headers: ['Project / Event Title', 'Category & Type', 'Role & Co-PI', 'Funding Agency', 'Amount', 'Duration', 'Grant No / Date', 'Status', 'Attachment'],
    fields: [
      { name: 'title', label: 'Project / Event Title', type: 'text', required: true },
      { name: 'grant_category', label: 'Grant Category', type: 'select', options: ['Research Project', 'Workshops/Seminars/STTP/FDP/Conference'], required: true },
      { name: 'project_type', label: 'Project / Event Type', type: 'select', options: ['Major Project', 'Minor Project', 'Student Project', 'Workshop', 'Seminar', 'STTP', 'FDP', 'Conference'], required: false },
      { name: 'faculty_role', label: 'Faculty Role', type: 'select', options: ['PI', 'Co-PI'], required: true },
      { name: 'copiname', label: 'Co-PI Staff Name(s)', type: 'text', required: false },
      { name: 'copiid', label: 'Co-PI Staff ID(s)', type: 'text', required: false },
      { name: 'fa', label: 'Funding Agency Name', type: 'text', required: true },
      { name: 'amount', label: 'Grant Amount (INR)', type: 'number', required: true },
      { name: 'from_date', label: 'Duration From Date', type: 'date', required: false },
      { name: 'to_date', label: 'Duration To Date', type: 'date', required: false },
      { name: 'referenceno', label: 'Grant No & Order Date', type: 'text', required: false },
      { name: 'status', label: 'Current Status', type: 'select', options: ['Sanctioned', 'Received', 'Applied', 'Ongoing', 'Completed'], required: true }
    ],
    renderRow: (row) => [
      row.title,
      `${row.grant_category || 'Research Project'}${row.project_type ? ` - ${row.project_type}` : ''}`,
      `${row.faculty_role || 'PI'}${row.copiname ? ` (Co-PI: ${row.copiname})` : ''}`,
      row.fa,
      `₹ ${Number(row.amount || 0).toLocaleString('en-IN')}`,
      [row.from_date, row.to_date].filter(Boolean).join(' to ') || row.date || 'N/A',
      row.referenceno || 'N/A',
      row.status || 'Sanctioned'
    ]
  },
  seed_money: {
    title: 'Funded Consultancy Projects & Seed Money for Research',
    headers: ['Title / Work Description', 'Category', 'Client / Agency', 'Role & Faculty Involved', 'Sanctioned Date / Duration', 'Amount (College Account)', 'Status', 'Attachment'],
    fields: [
      { name: 'entry_type', label: 'Category Type', type: 'select', options: ['Seed Money for Research', 'Consultancy'], required: true },
      { name: 'title', label: 'Project Title / Nature of Consultation', type: 'text', required: true },
      { name: 'client_type', label: 'Client / Sponsoring Agency', type: 'select', options: ['Internal / SREC Seed Fund', 'Individual', 'Industry', 'Agency / Sponsoring Body', 'Others'], required: false },
      { name: 'consultants', label: 'Name of Faculty Members Involved / Consultants', type: 'text', required: false },
      { name: 'faculty_role', label: 'Faculty Role', type: 'select', options: ['PI', 'Co-PI', 'Consultant', 'Principal Consultant'], required: true },
      { name: 'sanctioned_date', label: 'Sanctioned Date', type: 'date', required: false },
      { name: 'duration', label: 'Duration (e.g. 6 Months / 1 Year)', type: 'text', required: false },
      { name: 'amount', label: 'Amount (INR - Only Through College Account)', type: 'number', required: true },
      { name: 'status', label: 'Current Status', type: 'select', options: ['Received', 'Sanctioned', 'Applied', 'Ongoing', 'Completed'], required: true }
    ],
    renderRow: (row) => [
      row.title,
      row.entry_type || 'Seed Money for Research',
      row.client_type || 'SREC Seed Fund',
      `${row.faculty_role || 'PI'}${row.consultants ? ` (${row.consultants})` : ''}`,
      [row.sanctioned_date, row.duration].filter(Boolean).join(' | ') || 'N/A',
      `₹ ${Number(row.amount || 0).toLocaleString('en-IN')}`,
      row.status || 'Received'
    ]
  },
  ipr: {
    title: 'IPR / Copyrights',
    headers: ['Category', 'Title', 'Status', 'File Number', 'Filing Date', 'Summary', 'Attachment'],
    fields: [
      { name: 'ip_type', label: 'IPR Category', type: 'select', options: ['Patent', 'Copyright'], required: true },
      { name: 'patent', label: 'Patent / Design Title', type: 'text', required: true },
      { name: 'patent_status', label: 'Patent Status', type: 'select', options: ['Filed', 'Published', 'Granted'], required: true },
      { name: 'institution', label: 'File Number', type: 'text', required: true },
      { name: 'generation', label: 'Date of Filing/Publication', type: 'date', required: true },
      { name: 'propose', label: 'Purpose / Brief Summary', type: 'textarea', required: true }
    ],
    renderRow: (row) => [
      row.ip_type || 'Patent',
      row.patent,
      row.patent_status || 'Filed',
      row.institution || 'N/A',
      row.generation,
      row.propose || 'N/A'
    ]
  },
  certifications: {
    title: 'Online Certifications',
    headers: ['Course Title', 'Platform / Organization', 'Duration (Weeks)', 'Grade / Mark', 'Date of Exam', 'Attachment'],
    fields: [
      { name: 'course_name', label: 'Course Name', type: 'text', required: true },
      { name: 'organisation', label: 'Issuing Authority (NPTEL/Coursera)', type: 'text', required: true },
      { name: 'duration_weeks', label: 'Course Duration (Weeks)', type: 'select', options: ['4 Weeks', '8 Weeks', '12 Weeks'], required: true },
      { name: 'mark', label: 'Marks / Percentage / Grade', type: 'text', required: true },
      { name: 'data_of_exam', label: 'Completion Date', type: 'date', required: true }
    ],
    renderRow: (row) => [
      row.course_name,
      row.organisation,
      row.duration_weeks || '8 Weeks',
      row.mark || 'Passed',
      row.data_of_exam
    ]
  },
  events: {
    title: 'Events Organized',
    headers: ['Category', 'Event Title', 'Organizer Role', 'Duration', 'Organizer', 'Resource Person', 'Grant Received (INR)', 'Attachment'],
    fields: [
      { name: 'type', label: 'Event Category', type: 'select', options: ['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'], required: true },
      { name: 'title', label: 'Event Name / Title', type: 'text', required: true },
      { name: 'role', label: 'Organizer Role', type: 'select', options: ['Convener', 'Coordinator', 'Organizing Member'], required: true },
      { name: 'from_date', label: 'From Date', type: 'date', required: true },
      { name: 'to_date', label: 'To Date', type: 'date', required: true },
      { name: 'organizer', label: 'Organizing Department / Venue', type: 'text', required: true },
      { name: 'res_person', label: 'Resource Person Details', type: 'textarea', required: true },
      { name: 'ben_person', label: 'Number of Beneficiaries', type: 'number', required: true },
      { name: 'sponsership', label: 'Sponsor Details', type: 'text', required: true },
      { name: 'granted', label: 'Sponsorship Grant Amount (INR)', type: 'number', required: true }
    ],
    renderRow: (row) => [
      row.type,
      row.title,
      row.role || 'Coordinator',
      `${row.from_date} to ${row.to_date}`,
      row.organizer,
      row.res_person || 'N/A',
      row.granted ? `₹ ${row.granted?.toLocaleString('en-IN')}` : 'N/A'
    ]
  },
  memberships: {
    title: 'Professional Memberships',
    headers: ['Membership ID', 'Society / Organization', 'Membership Type', 'Attachment'],
    fields: [
      { name: 'membershipid', label: 'Membership ID / Number', type: 'text', required: true },
      { name: 'organization', label: 'Professional Society / Organization', type: 'text', required: true, list: 'societies-list' },
      { name: 'membership_type', label: 'Membership Type', type: 'select', options: ['Annual Member', 'Life Member'], required: true }
    ],
    renderRow: (row) => [
      row.membershipid,
      row.organization,
      row.membership_type || 'Annual Member'
    ]
  },
  interactions: {
    title: 'Interaction Details',
    headers: ['Type', 'Title', 'From Date', 'To Date', 'Organizer', 'Attachment'],
    fields: [
      { 
        name: 'type', 
        label: 'Interaction Type', 
        type: 'select', 
        options: ['FDP', 'Seminar', 'Workshop', 'Short Term Course', 'Industry Interaction', 'Webinar', 'Guest Lecture'], 
        required: true 
      },
      { name: 'title', label: 'Interaction Title', type: 'text', required: true },
      { name: 'from_date', label: 'From Date', type: 'date', required: true },
      { name: 'to_date', label: 'To Date', type: 'date', required: true },
      { name: 'organizer', label: 'Organizer Agency / Venue', type: 'text', required: true }
    ],
    renderRow: (row) => [
      row.type,
      row.title,
      row.from_date,
      row.to_date,
      row.organizer
    ]
  },
  scholars: {
    title: 'Research Scholar',
    headers: ['Scholar Reg No', 'Scholar Name', 'Registration Year', 'Supervisor Type', 'Supervisor Name', 'Institution', 'Research Status', 'Attachment'],
    fields: [
      { name: 'res_id', label: 'Scholar Reg / Ref No', type: 'text', required: true },
      { name: 'staff_name', label: 'Scholar Full Name', type: 'text', required: true, readOnly: true },
      { name: 'registration_year', label: 'Registration Month & Year', type: 'month', required: true },
      { name: 'supervisor_type', label: 'Supervisor Type', type: 'select', options: ['Internal', 'External'], required: true },
      { name: 'sup_name', label: 'Supervisor Name', type: 'text', required: true, list: 'supervisors-list' },
      { name: 'organisation', label: 'Institution', type: 'text', required: true, readOnly: true },
      { name: 'university', label: 'Affiliated University', type: 'text', required: true },
      { name: 'desgination', label: 'Category', type: 'select', options: ['Full Time', 'Part Time'], required: true },
      { name: 'status', label: 'Research Status', type: 'select', options: ['Provisionally Registered', 'Provisionally Confirmed', 'Submitted Synopsis', 'Submitted Thesis', 'Degree Awarded'], required: true }
    ],
    renderRow: (row) => [
      row.res_id || 'N/A',
      row.staff_name || 'N/A',
      row.registration_year || row.date || 'N/A',
      row.supervisor_type || 'Internal',
      row.sup_name || 'N/A',
      row.organisation || 'Sri Ramakrishna Engineering College',
      row.status || 'Provisionally Registered'
    ]
  },
  supervisors: {
    title: 'Research Supervisorship',
    headers: ['Supervisor Ref No', 'Recognition Month & Year', 'Internal Scholars Count', 'External Scholars Count', 'Attachment'],
    fields: [
      { name: 'res_sup_id', label: 'Supervisor Reference Number', type: 'text', required: true },
      { name: 'recognition_month_year', label: 'Recognition Month & Year', type: 'month', required: true }
    ],
    renderRow: (row) => [
      row.res_sup_id || 'N/A',
      row.recognition_month_year || row.date || 'N/A',
      row.internal || 0,
      row.external || 0
    ]
  },
  clubs: {
    title: 'Clubs Activity Organized',
    headers: ['Club Name', 'Category', 'Event Title', 'Organizer Role', 'Duration', 'Organizer', 'Resource Person', 'Grant Received (INR)', 'Attachment'],
    fields: [
      { name: 'club', label: 'Club Name', type: 'text', required: true },
      { name: 'type', label: 'Event Category', type: 'select', options: ['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'], required: true },
      { name: 'title', label: 'Event Name / Title', type: 'text', required: true },
      { name: 'role', label: 'Organizer Role', type: 'select', options: ['Convener', 'Coordinator', 'Organizing Member'], required: true },
      { name: 'from_date', label: 'From Date', type: 'date', required: true },
      { name: 'to_date', label: 'To Date', type: 'date', required: true },
      { name: 'organizer', label: 'Organizing Department / Venue', type: 'text', required: true },
      { name: 'res_person', label: 'Resource Person Details', type: 'textarea', required: true },
      { name: 'ben_person', label: 'Number of Beneficiaries', type: 'number', required: true },
      { name: 'sponsership', label: 'Sponsor Details', type: 'text', required: true },
      { name: 'granted', label: 'Sponsorship Grant Amount (INR)', type: 'number', required: true }
    ],
    renderRow: (row) => [
      row.club || 'N/A',
      row.type,
      row.title,
      row.role || 'Coordinator',
      `${row.from_date} to ${row.to_date}`,
      row.organizer,
      row.res_person || 'N/A',
      row.granted ? `₹ ${row.granted?.toLocaleString('en-IN')}` : 'N/A'
    ]
  }
};

export default function Activities({ auth }) {
  const { type } = useParams();
  const config = activityConfigs[type];

  const [activitiesList, setActivitiesList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  // Form states
  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [societies, setSocieties] = useState([]);
  const [allFacultySupervisors, setAllFacultySupervisors] = useState([]);

  const [deptFaculty, setDeptFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedPubCategory, setSelectedPubCategory] = useState('');
  const [selectedEventCategory, setSelectedEventCategory] = useState('');
  const [selectedInteractionType, setSelectedInteractionType] = useState('');

  // Research Supervisorship Mapped Scholars State
  const [mappedScholars, setMappedScholars] = useState([]);
  const [showExternalScholarModal, setShowExternalScholarModal] = useState(false);
  const [editingExtScholar, setEditingExtScholar] = useState(null);
  const [extScholarForm, setExtScholarForm] = useState({
    res_id: '',
    staff_name: '',
    organisation: '',
    registration_year: '',
    status: 'Provisionally Registered'
  });
  const [extScholarFile, setExtScholarFile] = useState(null);

  const fetchMappedScholars = async () => {
    if (type === 'supervisors') {
      try {
        const res = await fetch(`${API_BASE_URL}/api/activities/scholars`, {
          headers: { 'Authorization': `Bearer ${auth.token}` }
        });
        if (res.ok) {
          const allScholars = await res.json();
          setMappedScholars(allScholars);
        }
      } catch (err) {
        console.error('Failed to fetch mapped scholars:', err);
      }
    }
  };

  useEffect(() => {
    if (type === 'supervisors') {
      fetchMappedScholars();
    }
  }, [type, auth]);

  const handleOpenAddExtScholar = () => {
    setEditingExtScholar(null);
    setExtScholarForm({
      res_id: '',
      staff_name: '',
      organisation: '',
      registration_year: '',
      status: 'Provisionally Registered'
    });
    setExtScholarFile(null);
    setShowExternalScholarModal(true);
  };

  const handleEditExternalScholar = (scholar) => {
    setEditingExtScholar(scholar);
    setExtScholarForm({
      res_id: scholar.res_id || '',
      staff_name: scholar.staff_name || '',
      organisation: scholar.organisation || '',
      registration_year: scholar.registration_year || '',
      status: scholar.status || 'Provisionally Registered'
    });
    setExtScholarFile(null);
    setShowExternalScholarModal(true);
  };

  const handleDeleteExternalScholar = async (scholarId) => {
    if (!window.confirm('Are you sure you want to delete this external scholar?')) return;
    setMessage('');
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/scholars/${scholarId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });

      if (!res.ok) throw new Error('Failed to delete external scholar');

      setMessage('External scholar deleted successfully.');
      fetchMappedScholars();
      fetchActivities(selectedFaculty);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSaveExternalScholar = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const data = new FormData();
      data.append('res_id', extScholarForm.res_id);
      data.append('staff_name', extScholarForm.staff_name);
      data.append('organisation', extScholarForm.organisation);
      data.append('registration_year', extScholarForm.registration_year);
      data.append('status', extScholarForm.status);
      data.append('supervisor_type', 'External');
      data.append('sup_name', auth.name);
      data.append('university', 'Anna University');
      data.append('desgination', 'External Scholar');
      if (extScholarFile) {
        data.append('file', extScholarFile);
      }

      const url = editingExtScholar
        ? `${API_BASE_URL}/api/activities/scholars/${editingExtScholar.id}`
        : `${API_BASE_URL}/api/activities/scholars`;

      const method = editingExtScholar ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${auth.token}` },
        body: data
      });

      if (!res.ok) throw new Error(`Failed to ${editingExtScholar ? 'update' : 'save'} external scholar`);

      setMessage(`External scholar ${editingExtScholar ? 'updated' : 'added'} successfully!`);
      setShowExternalScholarModal(false);
      setEditingExtScholar(null);
      setExtScholarForm({ res_id: '', staff_name: '', organisation: '', registration_year: '', status: 'Provisionally Registered' });
      setExtScholarFile(null);
      fetchMappedScholars();
      fetchActivities(selectedFaculty);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (type === 'scholars') {
      fetch(`${API_BASE_URL}/api/activities/all-supervisors`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setAllFacultySupervisors(data))
      .catch(err => console.error(err));
    }
  }, [type, auth]);

  const [citationMetrics, setCitationMetrics] = useState(null);
  const [syncingCitations, setSyncingCitations] = useState(false);
  const [topPerformers, setTopPerformers] = useState(null);

  const [sysPageConfig, setSysPageConfig] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/system-page-configs/${type}`, {
      headers: { 'Authorization': `Bearer ${auth.token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setSysPageConfig(data); })
      .catch(err => console.error('SysPageConfig fetch error:', err));
  }, [type, auth]);

  const buildCitationMetricsUrl = () => {
    if (selectedFaculty) {
      return `${API_BASE_URL}/api/faculty/fetch-citation-metrics?staffId=${encodeURIComponent(selectedFaculty)}`;
    }
    if (auth.role === 'dept_admin') {
      return `${API_BASE_URL}/api/faculty/fetch-citation-metrics?department=${encodeURIComponent(auth.department || auth.dept || '')}`;
    }
    if (auth.role === 'admin') {
      return `${API_BASE_URL}/api/faculty/fetch-citation-metrics?department=${encodeURIComponent(selectedDepartment || '')}`;
    }
    return `${API_BASE_URL}/api/faculty/fetch-citation-metrics?staffId=${encodeURIComponent(auth.staffId)}`;
  };

  useEffect(() => {
    if (type === 'publications') {
      fetch(buildCitationMetricsUrl(), {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setCitationMetrics(data); })
      .catch(err => console.error('Citation metrics error:', err));
    }
  }, [type, selectedFaculty, selectedDepartment, auth]);

  useEffect(() => {
    if (type === 'publications' && (auth.role === 'dept_admin' || auth.role === 'admin')) {
      let url = `${API_BASE_URL}/api/faculty/top-performing-bibliometrics`;
      if (auth.role === 'dept_admin') {
        url += `?department=${encodeURIComponent(auth.department || auth.dept || '')}`;
      } else if (auth.role === 'admin' && selectedDepartment) {
        url += `?department=${encodeURIComponent(selectedDepartment)}`;
      }

      fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) setTopPerformers(data); })
      .catch(err => console.error('Top performers error:', err));
    }
  }, [type, selectedDepartment, auth]);

  const handleSyncCitations = async () => {
    setSyncingCitations(true);
    try {
      const res = await fetch(buildCitationMetricsUrl(), {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) setCitationMetrics(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setSyncingCitations(false);
    }
  };

  useEffect(() => {
    if (auth.role === 'dept_admin' || auth.role === 'admin') {
      fetch(`${API_BASE_URL}/api/faculty/personal`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDeptFaculty(data))
      .catch(err => console.error(err));

      fetch(`${API_BASE_URL}/api/admin/departments`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setDepartments(data))
      .catch(err => console.error(err));
    }
  }, [auth]);

  useEffect(() => {
    if (type === 'memberships') {
      fetch(`${API_BASE_URL}/api/admin/societies`, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      })
      .then(res => res.ok ? res.json() : [])
      .then(data => setSocieties(data))
      .catch(err => console.error(err));
    }
  }, [type, auth]);

  // Initializing default form fields
  useEffect(() => {
    if (config) {
      setEditItem(null);
      const initial = {};
      config.fields.forEach(f => {
        initial[f.name] = f.type === 'select' ? f.options[0] : '';
      });
      if (type === 'scholars') {
        initial.staff_name = auth.name || '';
        initial.organisation = 'Sri Ramakrishna Engineering College';
        initial.supervisor_type = 'Internal';
      }
      if (type === 'clubs' && auth?.myClubs && auth.myClubs.length > 0) {
        initial.club = auth.myClubs[0];
      }
      setFormData(initial);
      setFile(null);
      setShowAddForm(false);
      setMessage('');
      setError('');
      fetchActivities(selectedFaculty);
    }
  }, [type]);

  const openEditModal = (item) => {
    setEditItem(item);
    const initial = {};
    config.fields.forEach(f => {
      initial[f.name] = item[f.name] || (f.type === 'select' ? f.options[0] : '');
    });
    if (type === 'scholars') {
      initial.staff_name = item.staff_name || auth.name || '';
      initial.organisation = item.organisation || 'Sri Ramakrishna Engineering College';
      initial.supervisor_type = item.supervisor_type || 'Internal';
    }
    setFormData(initial);
    setFile(null);
    setShowAddForm(true);
  };

  const fetchActivities = async (staffIdFilter = selectedFaculty) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/activities/${type}`;
      
      if (staffIdFilter) {
        url = `${API_BASE_URL}/api/activities/${type}?staffId=${staffIdFilter}`;
      } else if (auth.role !== 'dept_admin' && auth.role !== 'admin') {
        url = `${API_BASE_URL}/api/activities/${type}?staffId=${auth.staffId}`;
      }

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setActivitiesList(data);
        if (type === 'supervisors' && data.length > 0) {
          setFormData(prev => ({
            ...prev,
            res_sup_id: prev.res_sup_id || data[0].res_sup_id || '',
            recognition_month_year: prev.recognition_month_year || data[0].recognition_month_year || data[0].date || ''
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      if (type === 'ipr' && name === 'ip_type') {
        const isCopyright = value === 'Copyright';
        if (isCopyright && (next.patent_status === 'Published' || next.patent_status === 'Granted')) {
          next.patent_status = 'Filed';
        }
      }
      return next;
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    setMessage('');
    setError('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/activities/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${auth.token}` }
      });
      if (res.ok) {
        setMessage('Record deleted successfully.');
        setActivitiesList(prev => prev.filter(item => item.id !== id));
      } else {
        throw new Error('Failed to delete record');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Strict JavaScript Form Validation for Mandatory Active Fields based on Publication Type
    const activeFields = config.fields.filter(f => {
      if (type === 'publications') {
        const isConf = (formData.type_pub || 'Journal') === 'Conference';
        if (f.journalOnly && isConf) return false;
        if (f.confOnly && !isConf) return false;
      }
      return true;
    });

    for (const f of activeFields) {
      if (f.readOnly || !f.required) continue; // Skip read-only & optional fields
      const val = formData[f.name];
      let fieldLabel = f.label;
      if (type === 'ipr') {
        const isCopyright = (formData.ip_type || 'Patent') === 'Copyright';
        if (f.name === 'patent') fieldLabel = isCopyright ? 'Copyright Title' : 'Patent / Design Title';
        else if (f.name === 'patent_status') fieldLabel = isCopyright ? 'Copyright Status' : 'Patent Status';
        else if (f.name === 'institution') fieldLabel = 'File Number';
      }
      if (val === undefined || val === null || String(val).trim() === '') {
        setError(`Mandatory Field Missing: Please provide a valid entry for "${fieldLabel}".`);
        return;
      }
    }

    // Mandatory Supporting Document Attachment Validation for New Records
    if (!editItem && config.headers.includes('Attachment') && !file) {
      setError('Mandatory Attachment Missing: Please attach a supporting document (PDF / Image) for this activity entry.');
      return;
    }

    const form = new FormData();
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key]);
    });
    if (file) {
      form.append('file', file);
    }

    try {
      const url = editItem 
        ? `${API_BASE_URL}/api/activities/${type}/${editItem.id}` 
        : `${API_BASE_URL}/api/activities/${type}`;

      const method = editItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${auth.token}`
        },
        body: form
      });

      if (!res.ok) {
        throw new Error('Failed to save record details');
      }

      setMessage(editItem ? `${config.title} record updated successfully!` : `New ${config.title} record added successfully!`);
      setShowAddForm(false);
      setEditItem(null);
      
      // Reset form fields
      const initial = {};
      config.fields.forEach(f => {
        initial[f.name] = f.type === 'select' ? f.options[0] : '';
      });
      setFormData(initial);
      setFile(null);

      // Refresh list
      fetchActivities();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!config) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Invalid Activity Type</div>;
  }

  const isSupervisorEligible = auth.role === 'admin' || 
                                auth.role === 'dept_admin' || 
                                !!auth.isSupervisorEligible || 
                                (auth.name || '').toLowerCase().includes('dr.') || 
                                (auth.name || '').toLowerCase().includes('dr ');

  if (type === 'supervisors' && !isSupervisorEligible) {
    return (
      <div>
        <Navbar title="Research Supervisorship" userName={auth.name} profilePic={auth.profilePic} auth={auth} />
        <div className="card" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '600px', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: 'hsl(var(--danger))', marginBottom: '12px', fontWeight: 800, fontSize: '1.3rem' }}>Access Restricted</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Research Supervisorship details are applicable only for Faculty Members with Ph.D. / 'Dr.' salutation.
          </p>
        </div>
      </div>
    );
  }

  // Disable research scholar page for faculty members having salutation Dr. or Qualification Ph.D
  if (type === 'scholars' && auth.role === 'faculty' && (auth.isSupervisorEligible || (auth.name || '').toLowerCase().includes('dr.') || (auth.name || '').toLowerCase().includes('dr '))) {
    return (
      <div>
        <Navbar title="Research Scholar Details" userName={auth.name} profilePic={auth.profilePic} auth={auth} />
        <div className="card" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '600px', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: '#d97706', marginBottom: '12px', fontWeight: 800, fontSize: '1.3rem' }}>Section Disabled</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
            The Research Scholar page is disabled for your account because it is applicable only for non-Ph.D faculty members who are currently pursuing research. Since you hold a Ph.D / 'Dr.' salutation, please use the Research Supervisorship module instead.
          </p>
        </div>
      </div>
    );
  }

  if (type === 'clubs' && auth.role !== 'admin' && auth.role !== 'dept_admin' && !auth.isClubCoordinator && (!auth.myClubs || auth.myClubs.length === 0)) {
    return (
      <div>
        <Navbar title="Clubs Activity Organized" userName={auth.name} profilePic={auth.profilePic} auth={auth} />
        <div className="card" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '600px', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <h3 style={{ color: 'hsl(var(--danger))', marginBottom: '12px', fontWeight: 800, fontSize: '1.3rem' }}>Access Restricted</h3>
          <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: '1.6' }}>
            The Clubs activity portal is reserved exclusively for official <strong>Faculty Club Coordinators</strong>.
          </p>
        </div>
      </div>
    );
  }

  const itemLabel = config.title.endsWith('s') ? config.title.slice(0, -1) : config.title;

  const filteredActivities = activitiesList.filter(item => {
    if (type === 'publications' && selectedPubCategory) {
      const pCat = (item.type_pub || item.type1 || '').trim().toLowerCase();
      if (pCat !== selectedPubCategory.trim().toLowerCase()) {
        return false;
      }
    }
    if (type === 'events' && selectedEventCategory) {
      const eCat = (item.type || '').trim().toLowerCase();
      if (eCat !== selectedEventCategory.trim().toLowerCase()) {
        return false;
      }
    }
    if (type === 'interactions' && selectedInteractionType) {
      const iType = (item.type || '').trim().toLowerCase();
      if (iType !== selectedInteractionType.trim().toLowerCase()) {
        return false;
      }
    }
    if (selectedDepartment) {
      const itemDept = (item.Department || '').trim().toLowerCase();
      const selDept = selectedDepartment.trim().toLowerCase();
      const matches = itemDept === selDept || departments.some(d => (d.acronym?.toLowerCase() === selDept || d.name?.toLowerCase() === selDept) && (d.acronym?.toLowerCase() === itemDept || d.name?.toLowerCase() === itemDept));
      if (!matches) return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return Object.values(item).some(val => 
      val && val.toString().toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Navbar title={config.title} userName={auth.name} profilePic={auth.profilePic} auth={auth} />

      {message && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--success), 0.15)', border: '1px solid hsla(var(--success), 0.3)', color: 'hsl(var(--success))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', background: 'hsla(var(--danger), 0.15)', border: '1px solid hsla(var(--danger), 0.3)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius)', marginBottom: '24px', fontWeight: 500 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <h3 style={{ fontSize: '1.25rem' }}>List of Records</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <ReportButtons 
            pageTitle={config.title} 
            departmentName={auth.role === 'admin' ? selectedDepartment : (auth.department || auth.dept || '')} 
            headers={['Faculty Name', 'Designation', 'Department', ...config.headers.filter(h => h !== 'Attachment')]} 
            rows={filteredActivities.map(row => {
              const fullRow = config.renderRow(row);
              return [
                row.staff_name || 'N/A',
                row.Designation || 'N/A',
                row.Department || 'N/A',
                ...fullRow.slice(0, config.headers.length - 1)
              ];
            })} 
            auth={auth}
            records={filteredActivities}
          />
          {auth.role !== 'dept_admin' && (
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={16} />
              {showAddForm ? 'Close Form' : `Add ${itemLabel}`}
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="card" style={{ marginBottom: '32px' }}>
          <h3 style={{ marginBottom: '20px', fontSize: '1.15rem' }}>Create Entry</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginBottom: '20px' }}>
              {(sysPageConfig && Array.isArray(sysPageConfig.fields) && sysPageConfig.fields.length > 0
                ? sysPageConfig.fields.map(sf => {
                    const baseF = (config.fields || []).find(bf => bf.name === sf.name) || {};
                    return {
                      ...baseF,
                      ...sf,
                      options: sf.options ? (Array.isArray(sf.options) ? sf.options : sf.options.split(',').map(s => s.trim())) : baseF.options
                    };
                  })
                : config.fields
              )
                .filter(f => {
                  if (f.status === 'hidden') return false;
                  if (type === 'publications') {
                    const selectedCat = formData.type_pub || 'Journal';
                    if (sysPageConfig && sysPageConfig.publication_type_constraints && sysPageConfig.publication_type_constraints[selectedCat]) {
                      const catRules = sysPageConfig.publication_type_constraints[selectedCat];
                      if (catRules.hiddenFields && catRules.hiddenFields.includes(f.name)) {
                        return false;
                      }
                    } else {
                      const isConf = selectedCat === 'Conference';
                      if (f.journalOnly && isConf) return false;
                      if (f.confOnly && !isConf) return false;
                    }
                  }
                  return true;
                })
                .map((f, idx) => {
                  let fieldLabel = f.label;
                  let selectOptions = f.options;
                  let fieldPlaceholder = `Enter ${f.label.toLowerCase()}`;
                  let isRequired = f.required;

                  if (type === 'publications') {
                    const selectedCat = formData.type_pub || 'Journal';
                    if (sysPageConfig && sysPageConfig.publication_type_constraints && sysPageConfig.publication_type_constraints[selectedCat]) {
                      const catRules = sysPageConfig.publication_type_constraints[selectedCat];
                      if (catRules.requiredFields && catRules.requiredFields.includes(f.name)) {
                        isRequired = true;
                      } else if (catRules.optionalFields && catRules.optionalFields.includes(f.name)) {
                        isRequired = false;
                      }
                    }
                  }

                  if (type === 'ipr') {
                    const isCopyright = (formData.ip_type || 'Patent') === 'Copyright';
                    if (f.name === 'patent') {
                      fieldLabel = isCopyright ? 'Copyright Title' : 'Patent / Design Title';
                      fieldPlaceholder = isCopyright ? 'Enter copyright title' : 'Enter patent / design title';
                    } else if (f.name === 'patent_status') {
                      fieldLabel = isCopyright ? 'Copyright Status' : 'Patent Status';
                      selectOptions = isCopyright ? ['Filed', 'Registered'] : ['Filed', 'Published', 'Granted'];
                    } else if (f.name === 'institution') {
                      fieldLabel = 'File Number';
                      fieldPlaceholder = 'Enter file number';
                    }
                  }

                  return (
                  <div className="form-group" key={idx} style={{ gridColumn: f.type === 'textarea' ? 'span 2' : 'span 1' }}>
                    <label className="form-label">
                      {fieldLabel} {isRequired && !f.readOnly && <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>}
                    </label>
                    {f.name === 'club' && auth?.myClubs && auth.myClubs.length > 0 ? (
                      <select 
                        className="form-control" 
                        value={formData[f.name]} 
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        required={isRequired}
                      >
                        {auth.myClubs.map((clubName, i) => (
                          <option key={i} value={clubName}>{clubName}</option>
                        ))}
                      </select>
                    ) : f.type === 'multiselect' ? (
                      <SearchableMultiSelect 
                        options={selectOptions || f.options}
                        value={formData[f.name]}
                        onChange={(val) => handleInputChange(f.name, val)}
                        placeholder={`Select ${fieldLabel}`}
                      />
                    ) : f.type === 'select' ? (
                      <select 
                        className="form-control" 
                        value={formData[f.name]} 
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        required={isRequired}
                      >
                        {(selectOptions || f.options).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : f.type === 'textarea' ? (
                      <textarea 
                        className="form-control" 
                        placeholder={fieldPlaceholder}
                        value={formData[f.name]} 
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        required={isRequired}
                        style={{ minHeight: '80px' }}
                      />
                    ) : f.name === 'sup_name' && formData['supervisor_type'] === 'Internal' ? (
                      <select
                        className="form-control"
                        value={formData[f.name]}
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        required={isRequired}
                      >
                        <option value="">-- Select Internal Supervisor --</option>
                        {allFacultySupervisors.map((fac, idx) => (
                          <option key={fac.id || fac.staff_id || idx} value={fac.staff_name}>
                            {fac.staff_name} ({fac.Department || 'Faculty'}{fac.res_sup_id ? ` - Ref: ${fac.res_sup_id}` : ''})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input 
                        type={f.type} 
                        step={f.step}
                        className="form-control" 
                        placeholder={fieldPlaceholder}
                        value={formData[f.name]} 
                        onChange={(e) => handleInputChange(f.name, e.target.value)}
                        list={f.list}
                        required={isRequired}
                        readOnly={f.readOnly}
                        style={f.readOnly ? { background: '#f1f5f9', cursor: 'not-allowed', fontWeight: 600, color: '#475569' } : {}}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {config.headers.includes('Attachment') && (
              <div style={{ marginBottom: '24px' }}>
                <label className="form-label">
                  Attach Supporting Document (Certificate / PDF / Image) <span style={{ color: '#ef4444', fontWeight: 800 }}>*</span>
                </label>
                <Dropzone onFileSelect={(f) => setFile(f)} accept=".pdf,.jpg,.jpeg,.png" />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" className="btn btn-primary">Save Entry</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Live Citation & Bibliometric Profile Widget */}
      {type === 'publications' && (
        <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#ffffff', border: '1px solid #334155', padding: '20px 24px', boxShadow: '0 4px 20px rgba(15,23,42,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{citationMetrics?.isAggregate ? '🏢 Cumulative Department Bibliometrics' : '📚 Live Bibliometrics & Citation Profile'}</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
                {citationMetrics?.isAggregate 
                  ? `Department aggregate citation metrics across ${citationMetrics.faculty_count || 0} department faculty members`
                  : 'Integrated metrics from Google Scholar, Scopus, ORCID & Web of Science'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSyncCitations}
              disabled={syncingCitations}
              className="btn"
              style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, padding: '8px 16px', fontSize: '0.82rem', borderRadius: '20px', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
            >
              {syncingCitations ? 'Syncing Metrics...' : '🔄 Sync Scholar & Scopus Metrics'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', alignItems: 'stretch' }}>
            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {citationMetrics?.isAggregate ? 'Dept Total Citations' : 'Total Citations'}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{citationMetrics ? (citationMetrics.total_citations || 0) : 0}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {citationMetrics?.isAggregate ? 'Max h-Index' : 'h-Index'}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>{citationMetrics ? (citationMetrics.h_index || 0) : 0}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {citationMetrics?.isAggregate ? 'Dept Total i10-Index' : 'i10-Index'}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>{citationMetrics ? (citationMetrics.i10_index || 0) : 0}</span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {citationMetrics?.isAggregate ? 'Dept Scopus Pubs' : 'Scopus Pubs'}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc', marginTop: '4px' }}>
                {citationMetrics?.scopus_publications_count !== undefined ? citationMetrics.scopus_publications_count : (activitiesList || []).filter(p => (p.index_pub || '').toLowerCase().includes('scopus')).length}
              </span>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {citationMetrics?.isAggregate ? 'Dept WoS Pubs' : 'Web of Science Pubs'}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb923c', marginTop: '4px' }}>
                {citationMetrics?.wos_publications_count !== undefined ? citationMetrics.wos_publications_count : (activitiesList || []).filter(p => { const idx = (p.index_pub || '').toLowerCase(); const wos = (p.web_of_science || '').toString().toLowerCase(); return idx.includes('wos') || idx.includes('sci') || (wos && wos !== '0' && wos !== 'null' && wos !== 'false'); }).length}
              </span>
            </div>

            {citationMetrics?.isAggregate ? (
              <>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Department Scope</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#e2e8f0' }}>{citationMetrics.department || 'Department'}</span>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Faculty Directory Count</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#38bdf8' }}>👥 {citationMetrics.faculty_count || 0} Faculty Members</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>Google Scholar</span>
                  {citationMetrics && citationMetrics.scholar_id ? (
                    <a
                      href={citationMetrics.scholar_id.startsWith('http') ? citationMetrics.scholar_id : `https://scholar.google.com/citations?user=${citationMetrics.scholar_id.includes('user=') ? citationMetrics.scholar_id.split('user=')[1].split('&')[0] : citationMetrics.scholar_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#38bdf8',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        background: 'rgba(56,189,248,0.12)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(56,189,248,0.25)'
                      }}
                      title={citationMetrics.scholar_id}
                    >
                      🔗 {citationMetrics.scholar_id.includes('user=') ? citationMetrics.scholar_id.split('user=')[1].split('&')[0] : citationMetrics.scholar_id}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Not Linked</span>
                  )}
                </div>

                <div style={{ background: 'rgba(255,255,255,0.06)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>ORCID / Scopus Profile</span>
                  {citationMetrics && (citationMetrics.scopus_id || citationMetrics.orcid_id) ? (
                    <a
                      href={
                        citationMetrics.scopus_id
                          ? (citationMetrics.scopus_id.startsWith('http') ? citationMetrics.scopus_id : `https://www.scopus.com/authid/detail.uri?authorId=${citationMetrics.scopus_id.includes('authorId=') ? citationMetrics.scopus_id.split('authorId=')[1].split('&')[0] : citationMetrics.scopus_id}`)
                          : (citationMetrics.orcid_id.startsWith('http') ? citationMetrics.orcid_id : `https://orcid.org/${citationMetrics.orcid_id}`)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#34d399',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        textDecoration: 'none',
                        background: 'rgba(52,211,153,0.12)',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(52,211,153,0.25)'
                      }}
                      title={citationMetrics.scopus_id || citationMetrics.orcid_id}
                    >
                      🔗 {citationMetrics.scopus_id ? `Scopus: ${citationMetrics.scopus_id.includes('authorId=') ? citationMetrics.scopus_id.split('authorId=')[1].split('&')[0] : citationMetrics.scopus_id}` : `ORCID: ${citationMetrics.orcid_id}`}
                    </a>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Not Linked</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top Performers Leaderboards (For Dept Admin and System Admin) */}
      {type === 'publications' && (auth.role === 'dept_admin' || auth.role === 'admin') && topPerformers && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: auth.role === 'admin' ? 'repeat(auto-fit, minmax(400px, 1fr))' : '1fr', gap: '20px' }}>
            
            {/* Top Faculty Leaderboard */}
            {topPerformers.topFaculty && topPerformers.topFaculty.length > 0 && (
              <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      🏆 Top Performing Faculty Leaderboard
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', margin: 0 }}>
                      {auth.role === 'dept_admin' || topPerformers.department 
                        ? `Top faculty research citation performers in ${topPerformers.department}`
                        : 'System-wide top faculty citation performers across all departments'}
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    Live Rankings
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topPerformers.topFaculty.map((fac, idx) => (
                    <div key={fac.staff_id || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: idx === 0 ? 'rgba(251, 191, 36, 0.12)' : idx === 1 ? 'rgba(148, 163, 184, 0.12)' : idx === 2 ? 'rgba(180, 83, 9, 0.12)' : 'rgba(255, 255, 255, 0.04)', border: idx === 0 ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <span style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          fontSize: '0.85rem',
                          background: idx === 0 ? '#fbbf24' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#d97706' : 'rgba(255,255,255,0.1)',
                          color: idx < 3 ? '#0f172a' : '#94a3b8',
                          flexShrink: 0
                        }}>
                          #{idx + 1}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {fac.staff_name || fac.staff_id}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                            {fac.Designation ? `${fac.Designation} • ` : ''}{fac.Department} ({fac.staff_id})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', display: 'block' }}>
                            {fac.total_citations} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>cites</span>
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 700 }}>
                            h-index: {fac.h_index} | i10: {fac.i10_index}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Departments Leaderboard (For System Admin) */}
            {auth.role === 'admin' && topPerformers.topDepartments && topPerformers.topDepartments.length > 0 && (
              <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#f8fafc' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      🏛️ Top Performing Department Leaderboard
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', margin: 0 }}>
                      Institution-wide department aggregate citation metrics ranking
                    </p>
                  </div>
                  <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 10px', borderRadius: '12px', fontWeight: 700 }}>
                    System-Wide
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {topPerformers.topDepartments.map((dept, idx) => (
                    <div key={dept.department || idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: '8px', background: idx === 0 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.04)', border: idx === 0 ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <span style={{ 
                          width: '28px', 
                          height: '28px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          fontSize: '0.85rem',
                          background: idx === 0 ? '#38bdf8' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#d97706' : 'rgba(255,255,255,0.1)',
                          color: idx < 3 ? '#0f172a' : '#94a3b8',
                          flexShrink: 0
                        }}>
                          #{idx + 1}
                        </span>
                        <div style={{ overflow: 'hidden' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {dept.department}
                          </span>
                          <span style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                            👥 {dept.faculty_count} Faculty Members
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#34d399', display: 'block' }}>
                            {dept.total_citations} <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>cites</span>
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 700 }}>
                            Max h-Index: {dept.max_h_index}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 1. Real-time Search Filter Bar */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            className="form-control" 
            placeholder={`Search ${config.title} by title, organizer, journal, dates, keywords...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px', fontSize: '0.95rem' }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'hsl(var(--text-muted))', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {/* 2. Department & Faculty Filter Dropdown */}
      {(auth.role === 'dept_admin' || auth.role === 'admin') && (
        <div className="card" style={{ marginBottom: '20px', padding: '16px 20px', background: '#f8fafc', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            {auth.role === 'admin' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                  Filter Department:
                </label>
                <select 
                  className="form-control" 
                  value={selectedDepartment} 
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  style={{ maxWidth: '280px', fontWeight: 600 }}
                >
                  <option value="">-- All Departments --</option>
                  {departments.map(dept => (
                    <option key={dept.id || dept.acronym} value={dept.acronym || dept.name}>
                      {dept.name} ({dept.acronym})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
              <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Select Faculty Member:
              </label>
              <select 
                className="form-control" 
                value={selectedFaculty} 
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedFaculty(val);
                  fetchActivities(val);
                }}
                style={{ maxWidth: '420px', fontWeight: 600 }}
              >
                <option value="">-- All Faculty Members --</option>
                {deptFaculty
                  .filter(fac => !selectedDepartment || (fac.Department || '').trim().toLowerCase() === selectedDepartment.trim().toLowerCase())
                  .map(fac => (
                    <option key={fac.staff_id} value={fac.staff_id}>
                      {fac.staff_name || 'Faculty Member'}{fac.Designation ? ` (${fac.Designation})` : ''}
                    </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 3. Publication Category Filter for Publications */}
      {type === 'publications' && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
              Filter Report by Publication Category:
            </label>
            <select
              className="form-control"
              value={selectedPubCategory}
              onChange={(e) => setSelectedPubCategory(e.target.value)}
              style={{ maxWidth: '320px', fontWeight: 700, background: '#ffffff' }}
            >
              <option value="">-- All Publication Categories (Journal & Conference) --</option>
              <option value="Journal">Journal Publications Only</option>
              <option value="Conference">Conference Publications Only</option>
            </select>
            {selectedPubCategory && (
              <button
                type="button"
                onClick={() => setSelectedPubCategory('')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '4px 12px', fontWeight: 700 }}
              >
                Clear Category Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Event Category Filter for Events Organized */}
      {type === 'events' && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
              Filter Report by Event Category:
            </label>
            <select
              className="form-control"
              value={selectedEventCategory}
              onChange={(e) => setSelectedEventCategory(e.target.value)}
              style={{ maxWidth: '320px', fontWeight: 700, background: '#ffffff' }}
            >
              <option value="">-- All Event Categories --</option>
              {['FDP', 'Seminar', 'Conference', 'Workshop', 'Symposium', 'Webinar', 'Industry Interaction', 'Guest Lecture', 'Alumni Talk', 'Short Term Course', 'Coding Contest', 'Hackathon', 'Rally', 'Parade'].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {selectedEventCategory && (
              <button
                type="button"
                onClick={() => setSelectedEventCategory('')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '4px 12px', fontWeight: 700 }}
              >
                Clear Category Filter
              </button>
            )}
          </div>
        </div>
      )}

      {/* Interaction Type Filter for Interaction Details */}
      {type === 'interactions' && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px 20px', background: '#f8fafc', border: '1.5px solid #cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem', whiteSpace: 'nowrap' }}>
              Filter Report by Interaction Type:
            </label>
            <select
              className="form-control"
              value={selectedInteractionType}
              onChange={(e) => setSelectedInteractionType(e.target.value)}
              style={{ maxWidth: '320px', fontWeight: 700, background: '#ffffff' }}
            >
              <option value="">-- All Interaction Types --</option>
              {['FDP', 'Seminar', 'Workshop', 'Short Term Course', 'Industry Interaction', 'Webinar', 'Guest Lecture'].map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {selectedInteractionType && (
              <button
                type="button"
                onClick={() => setSelectedInteractionType('')}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '4px 12px', fontWeight: 700 }}
              >
                Clear Type Filter
              </button>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading records...</div>
      ) : activitiesList.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'hsl(var(--text-muted))' }}>
          No records found. Click the "Add {itemLabel}" button to insert your first record.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                {(auth.role === 'dept_admin' || auth.role === 'admin') && (
                  <>
                    <th>Faculty Name</th>
                    <th>Designation</th>
                    <th>Department</th>
                  </>
                )}
                {config.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
                {auth.role !== 'dept_admin' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((item) => {
                const cols = config.renderRow(item);
                return (
                  <tr key={item.id}>
                    {(auth.role === 'dept_admin' || auth.role === 'admin') && (
                      <>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{item.staff_name || 'N/A'}</td>
                        <td><span className="badge badge-success">{item.Designation || 'N/A'}</span></td>
                        <td><span className="badge badge-secondary">{item.Department || 'N/A'}</span></td>
                      </>
                    )}
                    {cols.map((colVal, idx) => (
                      <td key={idx} style={{ fontWeight: idx === 1 ? 600 : 400 }}>
                        {colVal}
                      </td>
                    ))}
                    {config.headers.includes('Attachment') && (
                      <td>
                        {item.file ? (
                          <a 
                            href={`${API_BASE_URL}/uploads/document/${item.file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`} 
                            target="_blank" 
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                          >
                            <Download size={14} />
                            File
                          </a>
                        ) : (
                          <span style={{ color: 'hsl(var(--text-muted))', fontSize: '0.85rem' }}>No file</span>
                        )}
                      </td>
                    )}
                    {auth.role !== 'dept_admin' && (
                      <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <button 
                          onClick={() => openEditModal(item)} 
                          title="Edit Record"
                          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--primary))', cursor: 'pointer', padding: '4px' }}
                        >
                          <FileSignature size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)} 
                          title="Delete Record"
                          style={{ background: 'transparent', border: 'none', color: 'hsl(var(--danger))', cursor: 'pointer', padding: '4px' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* For Research Supervisorship Page: Mapped Internal & External Scholars Table */}
      {type === 'supervisors' && (
        <div style={{ marginTop: '36px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                Registered Research Scholars (Internal & External)
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Internal scholars are automatically mapped from the faculty portal. Add external scholars manually below.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <ReportButtons 
                pageTitle="Registered Research Scholars" 
                departmentName={auth.dept || auth.department || selectedDepartment || 'Information Technology'} 
                headers={['Scholar Reg No', 'Scholar Full Name', 'Scholar Type', 'Institution', 'Reg Date / Year', 'Research Status']} 
                rows={mappedScholars.map(s => [
                  s.res_id || 'N/A',
                  s.staff_name || '',
                  (s.supervisor_type || 'Internal').toLowerCase() === 'internal' ? 'Internal (Auto-Mapped)' : 'External Scholar',
                  s.organisation || ((s.supervisor_type || 'Internal').toLowerCase() === 'internal' ? 'Sri Ramakrishna Engineering College' : 'N/A'),
                  s.registration_year || s.date || 'N/A',
                  s.status || 'Pursuing'
                ])} 
                auth={auth}
              />
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={handleOpenAddExtScholar}
                style={{ background: '#0284c7', color: '#ffffff', borderColor: '#0284c7', fontWeight: 700, padding: '8px 16px', fontSize: '0.85rem' }}
              >
                <Plus size={16} /> Add External Scholar
              </button>
            </div>
          </div>

          {/* Add / Edit External Scholar Form Modal */}
          {showExternalScholarModal && (
            <div className="card" style={{ marginBottom: '24px', border: '2px solid #0284c7', background: '#f8fafc', padding: '24px' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', marginBottom: '16px' }}>
                {editingExtScholar ? 'Edit External Research Scholar Details' : 'Add External Research Scholar Details'}
              </h4>
              <form onSubmit={handleSaveExternalScholar}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Scholar Registration Number <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" className="form-control" required value={extScholarForm.res_id} onChange={(e) => setExtScholarForm({ ...extScholarForm, res_id: e.target.value })} placeholder="e.g. 21147191101" />
                  </div>
                  <div>
                    <label className="form-label">Scholar Full Name <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" className="form-control" required value={extScholarForm.staff_name} onChange={(e) => setExtScholarForm({ ...extScholarForm, staff_name: e.target.value })} placeholder="Full name of scholar" />
                  </div>
                  <div>
                    <label className="form-label">External Institution / Organization <span style={{ color: 'red' }}>*</span></label>
                    <input type="text" className="form-control" required value={extScholarForm.organisation} onChange={(e) => setExtScholarForm({ ...extScholarForm, organisation: e.target.value })} placeholder="e.g. PSG Tech / CIT / External College" />
                  </div>
                  <div>
                    <label className="form-label">Registration Month & Year <span style={{ color: 'red' }}>*</span></label>
                    <input type="month" className="form-control" required value={extScholarForm.registration_year} onChange={(e) => setExtScholarForm({ ...extScholarForm, registration_year: e.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Research Status</label>
                    <select className="form-control" value={extScholarForm.status} onChange={(e) => setExtScholarForm({ ...extScholarForm, status: e.target.value })}>
                      <option value="Provisionally Registered">Provisionally Registered</option>
                      <option value="Provisionally Confirmed">Provisionally Confirmed</option>
                      <option value="Submitted Synopsis">Submitted Synopsis</option>
                      <option value="Submitted Thesis">Submitted Thesis</option>
                      <option value="Degree Awarded">Degree Awarded</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Attach Proof Document</label>
                  <Dropzone onFileSelect={(f) => setExtScholarFile(f)} accept=".pdf,.jpg,.jpeg,.png" />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                    {editingExtScholar ? 'Update External Scholar' : 'Save External Scholar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowExternalScholarModal(false);
                      setEditingExtScholar(null);
                    }} 
                    style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mapped Scholars Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr style={{ background: '#0284c7', color: '#ffffff' }}>
                  <th style={{ color: '#ffffff', width: '50px' }}>S.No</th>
                  <th style={{ color: '#ffffff' }}>Scholar Reg No</th>
                  <th style={{ color: '#ffffff' }}>Scholar Full Name</th>
                  <th style={{ color: '#ffffff' }}>Scholar Type</th>
                  <th style={{ color: '#ffffff' }}>Institution</th>
                  <th style={{ color: '#ffffff' }}>Reg Date / Year</th>
                  <th style={{ color: '#ffffff' }}>Research Status</th>
                  <th style={{ color: '#ffffff' }}>Attachment</th>
                  <th style={{ color: '#ffffff', textAlign: 'center', width: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {mappedScholars.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', color: '#64748b', fontStyle: 'italic', padding: '24px' }}>
                      No research scholars mapped yet under your supervisorship.
                    </td>
                  </tr>
                ) : (
                  mappedScholars.map((s, i) => {
                    const isInternal = (s.supervisor_type || 'Internal').toLowerCase() === 'internal';
                    return (
                      <tr key={s.id || i}>
                        <td>{i + 1}</td>
                        <td style={{ fontWeight: 700 }}>{s.res_id || 'N/A'}</td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{s.staff_name}</td>
                        <td>
                          <span className={`badge ${isInternal ? 'badge-success' : 'badge-primary'}`}>
                            {isInternal ? 'Internal (Auto-Mapped)' : 'External Scholar'}
                          </span>
                        </td>
                        <td>{s.organisation || (isInternal ? 'Sri Ramakrishna Engineering College' : 'N/A')}</td>
                        <td>{s.registration_year || s.date || 'N/A'}</td>
                        <td><span className="badge badge-secondary">{s.status || 'Pursuing'}</span></td>
                        <td>
                          {s.file ? (
                            <a href={`${API_BASE_URL}/uploads/document/${s.file}?token=${auth?.token || localStorage.getItem("srec_token") || ""}`} target="_blank" rel="noreferrer" style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Download size={14} /> File
                            </a>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>No file</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {!isInternal ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button 
                                type="button" 
                                className="btn btn-secondary" 
                                onClick={() => handleEditExternalScholar(s)} 
                                style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                title="Edit External Scholar"
                              >
                                <Edit size={13} /> Edit
                              </button>
                              <button 
                                type="button" 
                                className="btn btn-danger" 
                                onClick={() => handleDeleteExternalScholar(s.id)} 
                                style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
                                title="Delete External Scholar"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Auto-Mapped</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {type === 'memberships' && (
        <datalist id="societies-list">
          {societies.map(s => (
            <option key={s.id} value={s.pro_name} />
          ))}
        </datalist>
      )}

      {type === 'scholars' && (
        <datalist id="supervisors-list">
          {allFacultySupervisors.map(fac => (
            <option key={fac.id || fac.staff_id} value={fac.staff_name}>
              {fac.staff_name} ({fac.Department || 'Faculty'})
            </option>
          ))}
        </datalist>
      )}
    </div>
  );
}
