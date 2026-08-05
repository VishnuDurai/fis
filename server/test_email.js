import dotenv from 'dotenv';
dotenv.config();
import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || process.env.MAIL_HOST || 'smtp.gmail.com';
const user = process.env.SMTP_USER || process.env.MAIL_USER;
const pass = process.env.SMTP_PASS || process.env.MAIL_PASS;
const port = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || '587', 10);

console.log('\n======================================================');
console.log('        SREC FIS - SMTP TEST DIAGNOSTIC TOOL          ');
console.log('======================================================');
console.log('SMTP Host :', host);
console.log('SMTP Port :', port);
console.log('SMTP User :', user || '❌ MISSING (Set SMTP_USER in server/.env)');
console.log('SMTP Pass :', pass ? '***** (Configured)' : '❌ MISSING (Set SMTP_PASS in server/.env)');
console.log('======================================================\n');

if (!user || !pass) {
  console.error('❌ FAILED: Please add SMTP_USER and SMTP_PASS to ~/fis/server/.env first!');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
  tls: { rejectUnauthorized: false }
});

console.log('Connecting to SMTP server and verifying credentials...');

transporter.verify((error, success) => {
  if (error) {
    console.error('\n❌ SMTP Verification FAILED!');
    console.error('Diagnostic Error:', error.message);
    process.exit(1);
  } else {
    console.log('\n✅ SMTP Connection & Credentials VERIFIED SUCCESSFULLY!');
    console.log('Sending test verification email to:', user);
    
    transporter.sendMail({
      from: `"SREC FIS System" <${user}>`,
      to: user,
      subject: 'SREC FIS - SMTP Email Test Success',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #10b981; border-radius: 8px;">
          <h2 style="color: #0f331f;">SREC FIS Email Test Successful!</h2>
          <p>Congratulations! Your server is now fully configured to send real-time OTP verification emails to users.</p>
        </div>
      `
    }, (mailErr, info) => {
      if (mailErr) {
        console.error('❌ Failed to dispatch test email:', mailErr.message);
      } else {
        console.log('\n🎉 TEST EMAIL DELIVERED SUCCESSFULLY!');
        console.log('Response:', info.response);
      }
      process.exit(0);
    });
  }
});
