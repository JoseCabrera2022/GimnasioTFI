import { google } from 'googleapis';
import { oAuth2Client } from './googleAuth.js';
import fs from 'fs';

export const enviarEmailConGmailAPI = async ({ to, subject, html, attachmentPath }) => {
  oAuth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

  // Codificar el asunto en UTF-8 MIME
  const encodedSubject = `=?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`;

  let messageParts;

  if (attachmentPath) {
    const fileContent = fs.readFileSync(attachmentPath).toString('base64');
    const boundary = '__BOUNDARY__';

    messageParts = [
      `From: ${process.env.GMAIL_USER}`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
      '',
      `--${boundary}`,
      'Content-Type: application/pdf',
      'Content-Disposition: attachment; filename="comprobante.pdf"',
      'Content-Transfer-Encoding: base64',
      '',
      fileContent,
      `--${boundary}--`
    ];
  } else {
    messageParts = [
      `From: ${process.env.GMAIL_USER}`,
      `To: ${to}`,
      `Subject: ${encodedSubject}`,
      'Content-Type: text/html; charset=UTF-8',
      '',
      html
    ];
  }

  const rawMessage = Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage
    }
  });
};
