import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
// Validate required environment variables
if (!process.env.AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required');
}
if (!process.env.AWS_ACCESS_KEY_ID) {
    throw new Error('AWS_ACCESS_KEY_ID environment variable is required');
}
if (!process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS_SECRET_ACCESS_KEY environment variable is required');
}
// Initialize SES client with credentials from environment variables
const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});
/**
 * Send email using AWS SES
 * @param params - Email parameters (to, subject, html, text)
 * @returns Promise with SES response
 */
export async function sendEmail({ to, subject, html, text }) {
    if (!process.env.AWS_SES_FROM_EMAIL) {
        throw new Error('AWS_SES_FROM_EMAIL environment variable is required');
    }
    const params = {
        Source: process.env.AWS_SES_FROM_EMAIL,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: html,
                    Charset: 'UTF-8',
                },
                ...(text && {
                    Text: {
                        Data: text,
                        Charset: 'UTF-8',
                    },
                }),
            },
        },
    };
    try {
        const command = new SendEmailCommand(params);
        const response = await sesClient.send(command);
        console.log('Email sent successfully:', response.MessageId);
        return response;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
/**
 * Send verification email with token
 * @param email - User email address
 * @param token - Verification token
 * @param frontendUrl - Frontend URL of the application
 */
export async function sendVerificationEmail(email, token, frontendUrl) {
    // Frontend verification page will handle the API call to backend
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 10px;">
          <h1 style="color: #4a5568; margin-bottom: 20px;">Verify Your Email Address</h1>
          <p style="margin-bottom: 20px;">Thank you for registering! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>
          <p style="color: #718096; font-size: 14px;">Or copy and paste this link in your browser:</p>
          <p style="color: #4299e1; word-break: break-all; font-size: 14px;">${verificationUrl}</p>
          <p style="color: #718096; font-size: 12px; margin-top: 30px;">This link will expire in 24 hours.</p>
          <p style="color: #718096; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
        </div>
      </body>
    </html>
  `;
    const text = `
    Verify Your Email Address
    
    Thank you for registering! Please verify your email address by visiting this link:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    
    If you didn't create an account, you can safely ignore this email.
  `;
    return sendEmail({
        to: email,
        subject: 'Verify Your Email Address',
        html,
        text,
    });
}
