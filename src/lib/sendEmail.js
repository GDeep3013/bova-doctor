import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
export async function sendEmail(to, subject, resetLink, firstName, lastName) {
  
  const templatePath = path.join(process.cwd(), 'src/app/templates/resetPasswordTemplate.html');

  // Read the template file
  let templateContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders with actual values
  templateContent = templateContent
    .replace('{{resetLink}}', resetLink)
    .replace('{{firstName}}', firstName)
    .replace('{{lastName}}', lastName);

  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html: templateContent, 
    
  });
}
