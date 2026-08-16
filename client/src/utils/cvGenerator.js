import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { API_BASE_URL } from '../config';
import { showSuccess, showError } from '../context/AlertContext.jsx';

export async function generateAcademicCV(auth) {
  try {
    const headers = { 'Authorization': `Bearer ${auth.token}` };
    const res = await fetch(`${API_BASE_URL}/api/faculty/cv-data?staffId=${auth.staffId}`, { headers });
    if (!res.ok) throw new Error('Failed to fetch CV data');

    const data = await res.json();
    const p = data.personal || {};
    const a = data.academics || {};
    const edu = data.education || [];
    const pubs = data.publications || [];
    const books = data.books || [];
    const funding = data.funding || [];
    const ipr = data.ipr || [];
    const awards = data.awards || [];

    const doc = new jsPDF();
    const primaryColor = [21, 88, 59]; // #15583b

    // Header banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SRI RAMAKRISHNA ENGINEERING COLLEGE', 105, 12, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('FACULTY INFORMATION SYSTEM - ACADEMIC CURRICULUM VITAE', 105, 20, { align: 'center' });

    // Faculty Name & Basic Profile
    let y = 38;
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(p.staff_name || auth.name || 'Faculty Member', 14, y);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    y += 6;
    doc.text(`Staff ID: ${p.staff_id || auth.staffId} | Designation: ${a.Designation || auth.designation || 'Faculty'} | Dept: ${a.Department || auth.department || 'N/A'}`, 14, y);
    y += 5;
    doc.text(`Email: ${p.email || 'N/A'} | Mobile: ${p.mobile || 'N/A'} | Date of Joining: ${a.Date_of_joining || 'N/A'}`, 14, y);

    y += 10;

    // 1. Personal & Contact Details
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('1. PERSONAL INFORMATION', 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      head: [['Parameter', 'Details']],
      body: [
        ['Date of Birth & Gender', `${p.dob || 'N/A'} (${p.gender || 'Male'})`],
        ['PAN & Aadhaar Number', `PAN: ${p.pan || 'N/A'} | Aadhaar: ${p.aadhar || 'N/A'}`],
        ['Permanent Contact Address', p.address || 'N/A'],
        ['AICTE & Anna Univ ID', `AICTE ID: ${p.aicte_id || 'N/A'} | Anna Univ ID: ${p.anna_univ_id || 'N/A'}`]
      ]
    });

    y = doc.lastAutoTable.finalY + 10;

    // 2. Academic Qualification
    if (edu.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('2. ACADEMIC QUALIFICATIONS', 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        head: [['Level/Category', 'Degree', 'Specialization', 'Year', 'College / University']],
        body: edu.map(e => [
          e.category || 'N/A',
          e.degree || 'N/A',
          e.specialization || 'N/A',
          e.year || 'N/A',
          e.university || 'N/A'
        ])
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // 3. Publications & Research Work
    if (pubs.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('3. RESEARCH PUBLICATIONS', 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        head: [['Type', 'Paper Title', 'Journal / Conference Name', 'Year', 'Indexing / DOI']],
        body: pubs.slice(0, 10).map(pub => [
          pub.type || 'Journal',
          pub.title || 'N/A',
          pub.journal || 'N/A',
          pub.year || 'N/A',
          pub.indexing || pub.doi || 'N/A'
        ])
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // 4. Research Grants & Projects
    if (funding.length > 0) {
      if (y > 240) { doc.addPage(); y = 20; }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('4. SPONSORED RESEARCH PROJECTS & GRANTS', 14, y);
      y += 3;

      autoTable(doc, {
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold', fontSize: 9 },
        styles: { fontSize: 8, cellPadding: 3 },
        head: [['Project Title', 'Funding Agency', 'Amount (Rs)', 'Status']],
        body: funding.map(f => [
          f.project_title || f.title || 'N/A',
          f.funding_agency || f.agency || 'N/A',
          f.amount ? `Rs. ${f.amount}` : 'N/A',
          f.status || 'Ongoing'
        ])
      });

      y = doc.lastAutoTable.finalY + 10;
    }

    // Footer with verification seal
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(`Page ${i} of ${pageCount} | Official SREC FIS Verified Document | Generated: ${new Date().toLocaleDateString()}`, 105, 290, { align: 'center' });
    }

    const cvFilename = `SREC_FIS_Academic_CV_${(p.staff_id || auth.staffId)}.pdf`;
    doc.save(cvFilename);
    showSuccess(`Academic CV "${cvFilename}" generated and downloaded!`);
  } catch (err) {
    console.error('Error generating Academic CV PDF:', err);
    showError('Failed to generate Academic CV: ' + err.message);
  }
}
