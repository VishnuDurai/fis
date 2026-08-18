import assert from 'assert';
import fs from 'fs';
import path from 'path';
import db from './db.js';
import { computeFileHash, classifyDocument, extractFieldsForCategory } from './utils/aiDocumentExtractor.js';
import { calculateTextSimilarity, checkDocumentDuplicate, checkRecordDuplicate } from './utils/duplicateDetector.js';
import { normalizeAuthorName, parseAuthorList, matchInternalCoAuthors, linkFacultyToPublication, getLinkedPublicationAuthors } from './utils/coAuthorMatcher.js';

async function runTests() {
  console.log('🧪 Starting SREC FIS V3.0 AI Features & Co-Author Mapping Test Suite...\n');
  await new Promise(r => setTimeout(r, 1500));

  // Test 1: File Hash Calculation
  console.log('Test 1: SHA-256 File Hash Calculation');
  const sampleBuf = Buffer.from('SREC FIS V3.0 Sample Certificate Content for Testing');
  const hash1 = computeFileHash(sampleBuf);
  const hash2 = computeFileHash(sampleBuf);
  assert.strictEqual(hash1, hash2, 'Hash must be deterministic');
  assert.strictEqual(hash1.length, 64, 'SHA-256 hash must be 64 hex characters');
  console.log('  ✓ Deterministic 64-char SHA-256 hash generated:', hash1);

  // Test 2: Smart Document Classification
  console.log('\nTest 2: Smart Document Classification');
  const fdpText = 'This is to certify that Dr. R. Brindha has participated in the One Week Online Faculty Development Programme on Deep Learning organized by Department of IT from 12-05-2024 to 17-05-2024';
  const fdpClass = classifyDocument(fdpText, 'certificate_fdp.pdf');
  assert.strictEqual(fdpClass.category, 'interactions', 'Should classify FDP text as interactions');
  assert.ok(fdpClass.confidence >= 70, 'Confidence should be high for clear FDP keywords');
  console.log(`  ✓ Classified FDP correctly as "${fdpClass.category}" with ${fdpClass.confidence}% confidence`);

  const nptelText = 'NPTEL Online Certification. This certificate is awarded to Faculty Member for successfully completing the course Cloud Computing with a consolidated score of 84% Elite';
  const nptelClass = classifyDocument(nptelText, 'nptel_cloud.pdf');
  assert.strictEqual(nptelClass.category, 'certifications', 'Should classify NPTEL text as certifications');
  console.log(`  ✓ Classified NPTEL correctly as "${nptelClass.category}" with ${nptelClass.confidence}% confidence`);

  const grantText = 'Sanction Order No. DST/SERB/2023/00451. Sanctioned the grant of Rs. 24,50,000 to Principal Investigator for Research Project';
  const grantClass = classifyDocument(grantText, 'dst_grant.pdf');
  assert.strictEqual(grantClass.category, 'funding', 'Should classify grant text as funding');
  console.log(`  ✓ Classified Grant correctly as "${grantClass.category}" with ${grantClass.confidence}% confidence`);

  const patentText = 'The Patent Office, Government of India. Application No. 202341056789 A. In accordance with Controller General of Patents, Designs and Trade Marks';
  const patentClass = classifyDocument(patentText, 'patent_doc.pdf');
  assert.strictEqual(patentClass.category, 'ipr', 'Should classify patent text as ipr');
  console.log(`  ✓ Classified Patent correctly as "${patentClass.category}" with ${patentClass.confidence}% confidence`);

  // Test 3: Field Extraction & Confidence Scoring
  console.log('\nTest 3: Field Extraction & Confidence Scoring');
  const extractedFdp = extractFieldsForCategory('interactions', fdpText);
  assert.ok(extractedFdp.fields.type === 'FDP', 'Should extract FDP type');
  assert.ok(extractedFdp.confidences.type >= 90, 'Type confidence should be high');
  console.log('  ✓ Extracted Fields for FDP:', extractedFdp.fields);
  console.log('  ✓ Confidence Scores:', extractedFdp.confidences);

  // Test 4: String Similarity & Text Normalization
  console.log('\nTest 4: Text Similarity & Normalization');
  const sim1 = calculateTextSimilarity('Deep Learning in Medical Imaging', 'Deep Learning in Medical Imaging');
  const sim2 = calculateTextSimilarity('Deep Learning for Medical Image Analysis', 'Deep Learning in Medical Imaging');
  const sim3 = calculateTextSimilarity('Completely Unrelated Topic', 'Deep Learning in Medical Imaging');
  assert.strictEqual(sim1, 1.0, 'Identical strings must have similarity 1.0');
  assert.ok(sim2 > 0.5, 'Similar titles should have similarity > 0.5');
  assert.ok(sim3 < 0.2, 'Unrelated titles should have low similarity');
  console.log(`  ✓ Similarity Scores: Identical=${sim1}, Similar=${sim2.toFixed(2)}, Unrelated=${sim3.toFixed(2)}`);

  // Test 5: Author Name Normalization & Parsing
  console.log('\nTest 5: Author Name Normalization & Parsing');
  const parsedAuthors = parseAuthorList('Dr. R. Brindha, John Doe and A. Kumar');
  assert.strictEqual(parsedAuthors.length, 3, 'Should split 3 authors');
  assert.strictEqual(normalizeAuthorName('Dr. R. Brindha, Ph.D.'), 'r brindha', 'Should strip titles and punctuation');
  console.log('  ✓ Parsed Authors:', parsedAuthors);

  // Test 6: Database Co-Author Linking & Retrieval
  console.log('\nTest 6: Database Co-Author Linking & Normalization');
  // Insert a test publication
  const testPubId = await new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO staff_publication (staff_id, staff_name, type_pub, type, title, journel, doi) 
       VALUES ('test_fac_1', 'Dr. Faculty One', 'Journal', 'International', 'AI in Edge Computing Test Paper', 'IEEE Transactions', '10.1109/TEST.2024.001')`,
      function (err) {
        if (err) return reject(err);
        resolve(this.lastID);
      }
    );
  });

  // Link primary author
  await linkFacultyToPublication(testPubId, 'test_fac_1', 'Dr. Faculty One', 'First Author', 'primary_creator');
  // Link co-author
  await linkFacultyToPublication(testPubId, 'test_fac_2', 'Dr. Faculty Two', 'Co-Author', 'srec_match');

  const linked = await getLinkedPublicationAuthors(testPubId);
  assert.strictEqual(linked.length, 2, 'Should have 2 linked authors');
  assert.strictEqual(linked[0].staff_id, 'test_fac_1', 'First author should match');
  assert.strictEqual(linked[1].staff_id, 'test_fac_2', 'Second author should match');
  console.log(`  ✓ Linked ${linked.length} authors to Publication #${testPubId}:`);
  linked.forEach(l => console.log(`    • [${l.staff_id}] ${l.staff_name} (${l.author_position})`));

  // Test 7: Duplicate Detection for Publication (DOI Matching)
  console.log('\nTest 7: Duplicate Detection for Publication (DOI Matching)');
  const dupCheck1 = await checkRecordDuplicate('publications', { doi: '10.1109/TEST.2024.001' }, 'test_fac_1');
  assert.strictEqual(dupCheck1.isDuplicate, true, 'Should detect duplicate for own profile');
  assert.strictEqual(dupCheck1.duplicateType, 'doi_exact_own');

  const dupCheck2 = await checkRecordDuplicate('publications', { doi: '10.1109/TEST.2024.001' }, 'test_fac_3');
  assert.strictEqual(dupCheck2.isDuplicate, true, 'Should detect cross-faculty duplicate');
  assert.strictEqual(dupCheck2.duplicateType, 'doi_cross_faculty');
  console.log('  ✓ Own DOI Duplicate Message:', dupCheck1.message);
  console.log('  ✓ Cross-Faculty Duplicate Message:', dupCheck2.message);

  // Clean up test data
  db.run('DELETE FROM staff_publication WHERE id = ?', [testPubId], () => {});
  db.run('DELETE FROM publication_authors WHERE publication_id = ?', [testPubId], () => {});

  console.log('\n🎉 ALL SREC FIS V3.0 AI & CO-AUTHOR TESTS PASSED SUCCESSFULLY!\n');
  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
