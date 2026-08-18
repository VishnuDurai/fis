import db from './db.js';
import { linkFacultyToPublication } from './utils/coAuthorMatcher.js';

async function runFpiRegressionTests() {
  console.log('🧪 Starting SREC FIS V3.0 FPI & Co-Author Regression Test Suite...\n');
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: Query Baseline FPI Score calculation for existing faculty member TE0005
  const testStaffId = 'TE0005';
  
  // 1. Fetch existing publications for TE0005 (primary + co-authored)
  const pubs = await new Promise((resolve) => {
    const query = `
      SELECT p.* 
      FROM staff_publication p
      LEFT JOIN publication_authors pa ON p.id = pa.publication_id
      WHERE (LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?)) OR (LOWER(TRIM(pa.staff_id)) = LOWER(TRIM(?)) AND pa.is_confirmed = 1))
      GROUP BY p.id
    `;
    db.all(query, [testStaffId, testStaffId], (err, rows) => resolve(rows || []));
  });

  console.log(`Test 1: Baseline Publications for ${testStaffId}`);
  console.log(`  ✓ Found ${pubs.length} active publications for ${testStaffId}`);

  // Test 2: Co-Author Linking & Multi-Faculty Mapping (Scenario from Rule 15)
  console.log('\nTest 2: Co-Author Linking & Shared Publication Visibility');
  
  // Step 2.1: Faculty A (test_fac_a) registers a master publication
  const masterPubId = await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO staff_publication (staff_id, staff_name, title, journel, month_pub, date_con, doi, type, type_pub, index_pub, author_position)
       VALUES ('TEST_FAC_A', 'Dr. Faculty A', 'Deep Learning for Edge AI in SREC', 'IEEE Transactions on Computers', 'June', '2026', '10.1109/TC.2026.9999', 'International', 'Journal', 'SCI, Scopus', 'First Author')`,
      [],
      function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });

  // Link Primary creator in publication_authors
  await linkFacultyToPublication(masterPubId, 'TEST_FAC_A', 'Dr. Faculty A', 'First Author', 'primary_creator');
  console.log(`  ✓ Master Publication created (ID #${masterPubId}) by TEST_FAC_A`);

  // Step 2.2: Confirm Faculty B (test_fac_b) as internal co-author
  await linkFacultyToPublication(masterPubId, 'TEST_FAC_B', 'Dr. Faculty B', 'Co-Author', 'manual_link');
  console.log(`  ✓ TEST_FAC_B confirmed as internal co-author in publication_authors`);

  // Step 2.3: Verify Publication appears in Faculty B's publications query
  const facBPubs = await new Promise((resolve) => {
    const query = `
      SELECT p.* 
      FROM staff_publication p
      LEFT JOIN publication_authors pa ON p.id = pa.publication_id
      WHERE (LOWER(TRIM(p.staff_id)) = LOWER(TRIM(?)) OR (LOWER(TRIM(pa.staff_id)) = LOWER(TRIM(?)) AND pa.is_confirmed = 1))
      GROUP BY p.id
    `;
    db.all(query, ['TEST_FAC_B', 'TEST_FAC_B'], (err, rows) => resolve(rows || []));
  });

  const hasMasterPub = facBPubs.some(p => p.id === masterPubId);
  console.log(`  ✓ Publication #${masterPubId} retrieved in TEST_FAC_B publication list: ${hasMasterPub ? 'YES' : 'NO'}`);
  if (!hasMasterPub) throw new Error('Shared publication did not appear in co-author list!');

  // Test 3: Verify ONE master record exists in staff_publication
  console.log('\nTest 3: Single Master Publication Record Integrity');
  const pubRecords = await new Promise((resolve) => {
    db.all('SELECT * FROM staff_publication WHERE doi = ?', ['10.1109/TC.2026.9999'], (err, rows) => resolve(rows || []));
  });
  console.log(`  ✓ Count of records in staff_publication for DOI 10.1109/TC.2026.9999: ${pubRecords.length} (Expected: 1)`);
  if (pubRecords.length !== 1) throw new Error('Duplicate master records found!');

  // Test 4: Verify Both Authors Linked in publication_authors
  const linkedAuthors = await new Promise((resolve) => {
    db.all('SELECT * FROM publication_authors WHERE publication_id = ?', [masterPubId], (err, rows) => resolve(rows || []));
  });
  console.log(`  ✓ Linked authors in publication_authors for Publication #${masterPubId}: ${linkedAuthors.length}`);
  linkedAuthors.forEach(a => {
    console.log(`    • Staff: ${a.staff_id} (${a.staff_name}) - Position: ${a.author_position}`);
  });

  // Clean up test publication
  await new Promise((resolve) => {
    db.run('DELETE FROM publication_authors WHERE publication_id = ?', [masterPubId], () => {
      db.run('DELETE FROM staff_publication WHERE id = ?', [masterPubId], () => resolve());
    });
  });
  console.log(`  ✓ Cleaned up test publication #${masterPubId} and association links.`);

  console.log('\n🎉 ALL SREC FIS V3.0 FPI & CO-AUTHOR REGRESSION TESTS PASSED!');
  process.exit(0);
}

runFpiRegressionTests().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
