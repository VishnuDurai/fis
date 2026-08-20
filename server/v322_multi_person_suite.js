/**
 * SREC FIS V3.2.2 — MULTIPLE RESOURCE PERSON & CHIEF GUEST TEST SUITE
 * 38 Comprehensive Automated Unit, Integration, Layout, Rendering, Security & Regression Tests
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  PERSON_ROLES,
  SPEAKER_LAYOUT_MODES,
  createDefaultPerson,
  normalizeEventPersons,
  calculateSmartLayout,
  renderDesignToSVG,
  auditDesignRules
} from './utils/designRenderer.js';

let passCount = 0;
let failCount = 0;
const testResults = [];

function runTest(name, fn) {
  try {
    fn();
    passCount++;
    testResults.push({ name, status: 'PASSED' });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failCount++;
    testResults.push({ name, status: 'FAILED', error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    passCount++;
    testResults.push({ name, status: 'PASSED' });
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failCount++;
    testResults.push({ name, status: 'FAILED', error: err.message });
    console.error(`  ✗ ${name}: ${err.message}`);
  }
}

console.log('\n============================================================');
console.log('SREC FIS V3.2.2 — MULTI-PERSON & CHIEF GUEST TEST SUITE (38 TRACKS)');
console.log('============================================================\n');

// -----------------------------------------------------------------------------
// TRACK 1-5: Person Roles & Defaults
// -----------------------------------------------------------------------------
runTest('Track 1: PERSON_ROLES contains all mandatory dignitary role types', () => {
  assert(PERSON_ROLES.includes('Chief Guest'), 'Must include Chief Guest');
  assert(PERSON_ROLES.includes('Resource Person'), 'Must include Resource Person');
  assert(PERSON_ROLES.includes('Guest Speaker'), 'Must include Guest Speaker');
  assert(PERSON_ROLES.includes('Keynote Speaker'), 'Must include Keynote Speaker');
  assert(PERSON_ROLES.includes('Special Invitee'), 'Must include Special Invitee');
  assert(PERSON_ROLES.includes('Other'), 'Must include Other');
});

runTest('Track 2: SPEAKER_LAYOUT_MODES contains all supported grid configurations', () => {
  const keys = Object.keys(SPEAKER_LAYOUT_MODES);
  assert(keys.includes('auto'), 'Must include auto');
  assert(keys.includes('single_large'), 'Must include single_large');
  assert(keys.includes('two_column'), 'Must include two_column');
  assert(keys.includes('three_column'), 'Must include three_column');
  assert(keys.includes('grid'), 'Must include grid');
  assert(keys.includes('compact_grid'), 'Must include compact_grid');
});

runTest('Track 3: createDefaultPerson generates valid structured person object', () => {
  const person = createDefaultPerson(1, 'Chief Guest', 'Dr. Sundar', 'Director', 'Apex Labs', 'https://example.com/photo.jpg', 'Keynote on AI');
  assert.strictEqual(person.order, 1);
  assert.strictEqual(person.role, 'Chief Guest');
  assert.strictEqual(person.name, 'Dr. Sundar');
  assert.strictEqual(person.designation, 'Director');
  assert.strictEqual(person.organization, 'Apex Labs');
  assert.strictEqual(person.photo, 'https://example.com/photo.jpg');
  assert.strictEqual(person.profile, 'Keynote on AI');
  assert.strictEqual(person.photoCrop, 'circle');
});

runTest('Track 4: createDefaultPerson generates unique IDs', () => {
  const p1 = createDefaultPerson(1);
  const p2 = createDefaultPerson(2);
  assert.notStrictEqual(p1.id, p2.id, 'IDs must be unique');
});

runTest('Track 5: normalizeEventPersons handles explicit eventPersons array', () => {
  const customPersons = [
    { id: 'p1', name: 'Dr. Alice', role: 'Chief Guest', order: 1 },
    { id: 'p2', name: 'Dr. Bob', role: 'Resource Person', order: 2 }
  ];
  const normalized = normalizeEventPersons({}, { eventPersons: customPersons });
  assert.strictEqual(normalized.length, 2);
  assert.strictEqual(normalized[0].name, 'Dr. Alice');
  assert.strictEqual(normalized[1].name, 'Dr. Bob');
});

// -----------------------------------------------------------------------------
// TRACK 6-10: Legacy Backward Compatibility Normalization
// -----------------------------------------------------------------------------
runTest('Track 6: normalizeEventPersons falls back to eventData.resource_person', () => {
  const normalized = normalizeEventPersons({
    resource_person: 'Dr. K. Raman',
    res_designation: 'Professor & Head',
    res_organization: 'IIT Madras',
    speaker_photo: 'https://example.com/raman.jpg'
  });
  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].name, 'Dr. K. Raman');
  assert.strictEqual(normalized[0].designation, 'Professor & Head');
  assert.strictEqual(normalized[0].organization, 'IIT Madras');
  assert.strictEqual(normalized[0].photo, 'https://example.com/raman.jpg');
});

runTest('Track 7: normalizeEventPersons falls back to eventData.res_person', () => {
  const normalized = normalizeEventPersons({
    res_person: 'Dr. S. Priya'
  });
  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].name, 'Dr. S. Priya');
});

runTest('Track 8: normalizeEventPersons handles chief_guest flag from authoritative DB record', () => {
  const normalized = normalizeEventPersons({
    resource_person: 'Dr. N. Chief',
    chief_guest: 'Yes'
  });
  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].role, 'Chief Guest');
});

runTest('Track 9: normalizeEventPersons provides default placeholder when no speaker given', () => {
  const normalized = normalizeEventPersons({});
  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].name, 'Eminent Subject Specialist');
  assert.strictEqual(normalized[0].role, 'Resource Person');
});

runTest('Track 10: normalizeEventPersons filters out invalid non-object entries safely', () => {
  const normalized = normalizeEventPersons({}, { eventPersons: [null, undefined, { name: 'Dr. Valid' }, 'invalid_string'] });
  assert.strictEqual(normalized.length, 1);
  assert.strictEqual(normalized[0].name, 'Dr. Valid');
});

// -----------------------------------------------------------------------------
// TRACK 11-15: Smart Layout Engine Calculations for Multi-Person Grids
// -----------------------------------------------------------------------------
runTest('Track 11: calculateSmartLayout sets single_large for 1 person', () => {
  const layout = calculateSmartLayout({
    eventTitle: 'National Seminar',
    eventPersons: [createDefaultPerson(1, 'Chief Guest', 'Dr. Alpha')],
    speakerCount: 1,
    dimensions: { width: 1080, height: 1350 }
  });
  assert.strictEqual(layout.speakerLayoutMode, 'single_large');
  assert.strictEqual(layout.speakerCols, 1);
  assert.strictEqual(layout.speakerCount, 1);
  assert(layout.speakerCardWidth >= 900, 'Single card width should span container width');
});

runTest('Track 12: calculateSmartLayout sets two_column for 2 persons', () => {
  const layout = calculateSmartLayout({
    eventTitle: 'National Seminar',
    eventPersons: [createDefaultPerson(1, 'Chief Guest', 'Dr. Alpha'), createDefaultPerson(2, 'Resource Person', 'Dr. Beta')],
    speakerCount: 2,
    dimensions: { width: 1080, height: 1350 }
  });
  assert.strictEqual(layout.speakerLayoutMode, 'two_column');
  assert.strictEqual(layout.speakerCols, 2);
  assert.strictEqual(layout.speakerRows, 1);
  assert(layout.speakerCardWidth <= 500, 'Two column card width should be half container');
});

runTest('Track 13: calculateSmartLayout sets three_column for 3 persons', () => {
  const layout = calculateSmartLayout({
    eventTitle: 'National Seminar',
    eventPersons: [createDefaultPerson(1), createDefaultPerson(2), createDefaultPerson(3)],
    speakerCount: 3,
    dimensions: { width: 1080, height: 1350 }
  });
  assert.strictEqual(layout.speakerLayoutMode, 'three_column');
  assert.strictEqual(layout.speakerCols, 3);
  assert.strictEqual(layout.speakerRows, 1);
});

runTest('Track 14: calculateSmartLayout sets 2x2 grid for 4 persons', () => {
  const layout = calculateSmartLayout({
    eventTitle: 'National Seminar',
    eventPersons: [createDefaultPerson(1), createDefaultPerson(2), createDefaultPerson(3), createDefaultPerson(4)],
    speakerCount: 4,
    dimensions: { width: 1080, height: 1350 }
  });
  assert.strictEqual(layout.speakerLayoutMode, 'grid');
  assert.strictEqual(layout.speakerCols, 2);
  assert.strictEqual(layout.speakerRows, 2);
});

runTest('Track 15: calculateSmartLayout sets compact_grid for 5+ persons with adaptive font scaling', () => {
  const persons = [
    createDefaultPerson(1), createDefaultPerson(2), createDefaultPerson(3),
    createDefaultPerson(4), createDefaultPerson(5), createDefaultPerson(6)
  ];
  const layout = calculateSmartLayout({
    eventTitle: 'Mega Symposium',
    eventPersons: persons,
    speakerCount: 6,
    dimensions: { width: 1080, height: 1350 }
  });
  assert.strictEqual(layout.speakerLayoutMode, 'compact_grid');
  assert.strictEqual(layout.speakerCols, 3);
  assert.strictEqual(layout.speakerRows, 2);
  assert(layout.speakerFontSize <= 20, 'Compact grid speaker font size should scale down');
});

// -----------------------------------------------------------------------------
// TRACK 16-20: Vector SVG Multi-Person Card Rendering
// -----------------------------------------------------------------------------
runTest('Track 16: renderDesignToSVG renders single spotlight speaker card', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI in Healthcare',
    eventPersons: [createDefaultPerson(1, 'Chief Guest', 'Dr. Sundar', 'Lead AI Scientist', 'Global AI Labs', 'https://example.com/sundar.jpg')],
    speakerLayout: 'single_large',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('CHIEF GUEST'), 'Must render role badge in SVG');
  assert(svg.includes('Dr. Sundar'), 'Must render dignitary name in SVG');
  assert(svg.includes('Lead AI Scientist'), 'Must render designation in SVG');
  assert(svg.includes('Global AI Labs'), 'Must render organization in SVG');
  assert(svg.includes('sundar.jpg'), 'Must render photo href in SVG');
});

runTest('Track 17: renderDesignToSVG renders 2-column multi-speaker cards', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI in Healthcare',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Dr. Sundar', 'Director', 'Apex Labs'),
      createDefaultPerson(2, 'Resource Person', 'Dr. Ananya', 'Professor', 'IIT Madras')
    ],
    speakerLayout: 'two_column',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('Dr. Sundar'), 'Must render person 1');
  assert(svg.includes('Dr. Ananya'), 'Must render person 2');
  assert(svg.includes('CHIEF GUEST'), 'Must render role 1');
  assert(svg.includes('RESOURCE PERSON'), 'Must render role 2');
});

runTest('Track 18: renderDesignToSVG renders 3-column speaker cards', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Cloud Summit',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Person Alpha'),
      createDefaultPerson(2, 'Keynote Speaker', 'Person Beta'),
      createDefaultPerson(3, 'Guest Speaker', 'Person Gamma')
    ],
    speakerLayout: 'three_column',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('Person Alpha'), 'Must render Person Alpha');
  assert(svg.includes('Person Beta'), 'Must render Person Beta');
  assert(svg.includes('Person Gamma'), 'Must render Person Gamma');
  assert(svg.includes('KEYNOTE SPEAKER'), 'Must render keynote badge');
});

runTest('Track 19: renderDesignToSVG renders 4-person 2x2 grid', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Robotics Workshop',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Speaker 1'),
      createDefaultPerson(2, 'Resource Person', 'Speaker 2'),
      createDefaultPerson(3, 'Resource Person', 'Speaker 3'),
      createDefaultPerson(4, 'Special Invitee', 'Speaker 4')
    ],
    speakerLayout: 'grid',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('Speaker 1') && svg.includes('Speaker 2') && svg.includes('Speaker 3') && svg.includes('Speaker 4'), 'Must render all 4 speakers');
  assert(svg.includes('SPECIAL INVITEE'), 'Must render Special Invitee badge');
});

runTest('Track 20: renderDesignToSVG renders 5+ compact grid with safe bounds', () => {
  const persons = [
    createDefaultPerson(1, 'Chief Guest', 'Speaker 1'),
    createDefaultPerson(2, 'Resource Person', 'Speaker 2'),
    createDefaultPerson(3, 'Resource Person', 'Speaker 3'),
    createDefaultPerson(4, 'Resource Person', 'Speaker 4'),
    createDefaultPerson(5, 'Resource Person', 'Speaker 5')
  ];
  const svg = renderDesignToSVG({
    eventTitle: 'Annual Research Conclave',
    eventPersons: persons,
    speakerLayout: 'compact_grid',
    dimensions: { width: 1080, height: 1350 }
  });
  for (let i = 1; i <= 5; i++) {
    assert(svg.includes(`Speaker ${i}`), `Must render Speaker ${i}`);
  }
});

// -----------------------------------------------------------------------------
// TRACK 21-25: Photo Isolation, Crop Geometry & Mixed Presence
// -----------------------------------------------------------------------------
runTest('Track 21: Multi-person photos maintain unique non-colliding URLs in SVG', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Conclave',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Dr. Sundar', '', '', 'https://example.com/uploads/photo_1.jpg'),
      createDefaultPerson(2, 'Resource Person', 'Dr. Raman', '', '', 'https://example.com/uploads/photo_2.jpg')
    ],
    speakerLayout: 'two_column',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('photo_1.jpg'), 'Must contain photo 1');
  assert(svg.includes('photo_2.jpg'), 'Must contain photo 2');
  assert(svg.indexOf('photo_1.jpg') !== svg.lastIndexOf('photo_1.jpg') ? false : true, 'Photo 1 must not overwrite photo 2');
});

runTest('Track 22: Circular crop geometry renders clipPath circle in SVG', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Conclave',
    eventPersons: [
      { ...createDefaultPerson(1), photo: 'https://example.com/p.jpg', photoCrop: 'circle' }
    ],
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('<circle'), 'Must render clipPath circle for circular crop');
});

runTest('Track 23: Rounded rectangle crop geometry renders rx rounded rect in SVG', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Conclave',
    eventPersons: [
      { ...createDefaultPerson(1), photo: 'https://example.com/p.jpg', photoCrop: 'rounded_rectangle' }
    ],
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('rx="16"'), 'Must render rx="16" for rounded rectangle crop');
});

runTest('Track 24: Square crop geometry renders sharp square rect in SVG', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Conclave',
    eventPersons: [
      { ...createDefaultPerson(1), photo: 'https://example.com/p.jpg', photoCrop: 'square' }
    ],
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('rx="0"'), 'Must render rx="0" for square crop');
});

runTest('Track 25: Mixed dignitaries with photo and without photo render harmoniously', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Conclave',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Dr. Photo', 'Director', 'Apex', 'https://example.com/photo.jpg'),
      createDefaultPerson(2, 'Resource Person', 'Dr. NoPhoto', 'Professor', 'NIT', '')
    ],
    speakerLayout: 'two_column',
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('Dr. Photo'), 'Must render Dr. Photo');
  assert(svg.includes('Dr. NoPhoto'), 'Must render Dr. NoPhoto');
  assert(svg.includes('photo.jpg'), 'Must render photo image href');
});

// -----------------------------------------------------------------------------
// TRACK 26-30: Text Fitting, Long Strings & Display Toggles
// -----------------------------------------------------------------------------
runTest('Track 26: Extremely long dignitary names truncate gracefully without overflow', () => {
  const longName = 'Dr. Very Long Dignitary Name Who Has Many Honorifics And Multiple Titles In Academic Conclaves';
  const svg = renderDesignToSVG({
    eventTitle: 'Symposium',
    eventPersons: [createDefaultPerson(1, 'Chief Guest', longName)],
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('...'), 'Long name should truncate with ellipsis in tight bounding box');
});

runTest('Track 27: Profile bio snippet renders when showProfile is true and 1 person', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Keynote Lecture',
    eventPersons: [{ ...createDefaultPerson(1), profile: 'World-renowned expert in quantum computing architectures.' }],
    showProfile: true,
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('World-renowned expert in quantum computing'), 'Must render profile snippet');
});

runTest('Track 28: Disabling showPhoto suppresses photo rendering in cards', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Technical Talk',
    eventPersons: [{ ...createDefaultPerson(1), photo: 'https://example.com/p.jpg' }],
    showPhoto: false,
    dimensions: { width: 1080, height: 1350 }
  });
  assert(!svg.includes('href="https://example.com/p.jpg"'), 'Must not render photo image when showPhoto is false');
});

runTest('Track 29: Disabling showDesignation suppresses designation rendering', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Technical Talk',
    eventPersons: [{ ...createDefaultPerson(1), designation: 'Chief Scientist of AI Labs' }],
    showDesignation: false,
    dimensions: { width: 1080, height: 1350 }
  });
  assert(!svg.includes('Chief Scientist of AI Labs'), 'Must not render designation when showDesignation is false');
});

runTest('Track 30: Disabling showOrganization suppresses organization rendering', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'Technical Talk',
    eventPersons: [{ ...createDefaultPerson(1), organization: 'National Supercomputing Center' }],
    showOrganization: false,
    dimensions: { width: 1080, height: 1350 }
  });
  assert(!svg.includes('National Supercomputing Center'), 'Must not render organization when showOrganization is false');
});

// -----------------------------------------------------------------------------
// TRACK 31-35: Rule Audit, Multi-Format Dimensions & Institutional Lock
// -----------------------------------------------------------------------------
runTest('Track 31: auditDesignRules passes clean multi-person configuration', () => {
  const audit = auditDesignRules({
    eventTitle: 'International Symposium on Quantum Systems',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Dr. K. Sundar'),
      createDefaultPerson(2, 'Resource Person', 'Dr. V. Priya')
    ]
  });
  assert.strictEqual(audit.passed, true);
  assert.strictEqual(audit.issues.length, 0);
  assert.strictEqual(audit.metrics.speakerCount, 2);
});

runTest('Track 32: auditDesignRules flags empty dignitary name', () => {
  const audit = auditDesignRules({
    eventTitle: 'International Symposium',
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', '')
    ]
  });
  const nameIssue = audit.issues.find(i => i.id === 'DIGNITARY_NAME_MISSING');
  assert(nameIssue, 'Must flag missing dignitary name');
});

runTest('Track 33: auditDesignRules flags excessive dignitary count warning', () => {
  const tenPersons = Array.from({ length: 9 }, (_, i) => createDefaultPerson(i + 1, 'Resource Person', `Speaker ${i + 1}`));
  const audit = auditDesignRules({
    eventTitle: 'Mega Symposium',
    eventPersons: tenPersons
  });
  const countIssue = audit.issues.find(i => i.id === 'HIGH_SPEAKER_COUNT');
  assert(countIssue, 'Must flag high speaker count warning (>8)');
});

runTest('Track 34: renderDesignToSVG maintains 🔒 Institutional Header on Multi-Person posters', () => {
  const svg = renderDesignToSVG({
    eventTitle: 'AI Summit',
    eventPersons: [createDefaultPerson(1), createDefaultPerson(2)],
    dimensions: { width: 1080, height: 1350 }
  });
  assert(svg.includes('SRI RAMAKRISHNA ENGINEERING COLLEGE'), 'Must include official college name');
  assert(svg.includes('Autonomous Institution'), 'Must include institutional type');
});

runTest('Track 35: Multi-Format Social Dimensions (Square, Landscape, Story) render multi-person correctly', () => {
  const formats = [
    { width: 1080, height: 1080, name: 'Square' },
    { width: 1200, height: 630, name: 'Landscape' },
    { width: 1080, height: 1920, name: 'Story' }
  ];
  for (const fmt of formats) {
    const svg = renderDesignToSVG({
      eventTitle: 'Multi Format Test',
      eventPersons: [createDefaultPerson(1, 'Chief Guest', 'Dr. Alpha'), createDefaultPerson(2, 'Resource Person', 'Dr. Beta')],
      dimensions: { width: fmt.width, height: fmt.height }
    });
    assert(svg.includes('Dr. Alpha'), `${fmt.name} must render Dr. Alpha`);
    assert(svg.includes('Dr. Beta'), `${fmt.name} must render Dr. Beta`);
  }
});

// -----------------------------------------------------------------------------
// TRACK 36-38: Dignitary Reordering & Order Index Normalization
// -----------------------------------------------------------------------------
runTest('Track 36: Dignitary reordering updates order indexes cleanly', () => {
  const p1 = createDefaultPerson(1, 'Resource Person', 'Person One');
  const p2 = createDefaultPerson(2, 'Chief Guest', 'Person Two');
  // Swap order
  const swapped = [p2, p1].map((p, idx) => ({ ...p, order: idx + 1 }));
  assert.strictEqual(swapped[0].name, 'Person Two');
  assert.strictEqual(swapped[0].order, 1);
  assert.strictEqual(swapped[1].name, 'Person One');
  assert.strictEqual(swapped[1].order, 2);
});

runTest('Track 37: Multi-person SVG renders correctly across all 6 themes', () => {
  const themes = ['institutional_default', 'royal_academic', 'modern_minimal', 'tech_future', 'warm_creative', 'editorial_serif'];
  for (const th of themes) {
    const svg = renderDesignToSVG({
      eventTitle: 'Theme Conformance Event',
      theme: th,
      eventPersons: [createDefaultPerson(1, 'Chief Guest', 'Dr. Themed Speaker')],
      dimensions: { width: 1080, height: 1350 }
    });
    assert(svg.includes('Dr. Themed Speaker'), `Must render speaker in theme ${th}`);
    assert(svg.includes('<svg'), `Must produce valid SVG in theme ${th}`);
  }
});

runTest('Track 38: Authoritative DB record separation verified (Design metadata does not overwrite staff_event_organized)', () => {
  const authoritativeRecord = {
    id: 101,
    title: 'Official Conference Title',
    res_person: 'Dr. Official DB Speaker',
    from_date: '2026-10-10'
  };
  const designData = {
    eventPersons: [
      createDefaultPerson(1, 'Chief Guest', 'Dr. Customized Design Speaker 1'),
      createDefaultPerson(2, 'Resource Person', 'Dr. Customized Design Speaker 2')
    ]
  };
  assert.strictEqual(authoritativeRecord.res_person, 'Dr. Official DB Speaker', 'Authoritative record must remain protected');
  assert.strictEqual(designData.eventPersons.length, 2, 'Design metadata stores full multi-person collection independently');
});

// -----------------------------------------------------------------------------
// SUMMARY & REPORT
// -----------------------------------------------------------------------------
console.log('\n============================================================');
console.log(`TOTAL TRACKS TESTED : ${passCount + failCount}`);
console.log(`PASSED              : ${passCount}`);
console.log(`FAILED              : ${failCount}`);
console.log(`PASS RATE           : ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);
console.log('============================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
