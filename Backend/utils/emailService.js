const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Create a transporter
// NOTE: For real email sending, USER needs to provide valid credentials in .env
// For now, these are placeholders or will fall back to Ethereal if not provided
// Create a transporter
// NOTE: For real email sending, USER needs to provide valid credentials in .env
// We wrap this in a helper or check env vars to avoid crashing if they are missing
let transporter = null;
try {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        console.warn("Email service: EMAIL_USER or EMAIL_PASS not set. Emails will not be sent.");
    }
} catch (err) {
    console.error("Failed to create email transporter:", err);
}

const sendCampNotification = async (recipients, campDetails) => {
    if (!transporter) {
        console.warn("Email service not configured (missing credentials). Skipping email notification.");
        return;
    }
    if (!recipients || recipients.length === 0) return;

    // Join emails for BCC to avoid exposing all emails
    const bccList = recipients.join(',');

    const mailOptions = {
        from: `"Blood Donation Camp" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to self, BCC everyone else
        bcc: bccList,
        subject: `Upcoming Blood Donation Camp: ${campDetails.institution_name}!`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #d9534f; text-align: center;">Upcoming Blood Donation Camp!</h1>
                <p>Dear Donor,</p>
                <p>We are organizing a blood donation camp and would love to see you there!</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>🏥 Camp Name:</strong> ${campDetails.institution_name}</p>
                    <p><strong>📅 Date:</strong> ${campDetails.camp_date}</p>
                    <p><strong>⏰ Time:</strong> ${campDetails.camp_time || '10:00 AM - 3:00 PM'}</p>
                    <p><strong>📍 Location:</strong> ${campDetails.location}</p>
                    <p><strong>📞 Contact:</strong> ${campDetails.contact_person}</p>
                </div>

                <p>Please join us and make a difference! Your donation can save lives.</p>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="#" style="background-color: #d9534f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">CONFIRM YOUR ATTENDANCE ></a>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <img src="cid:campImage" alt="Blood Donation" style="width: 100%; max-width: 500px; border-radius: 8px;">
                </div>

                <p style="text-align: center; color: #777; font-size: 12px; margin-top: 20px;">Thank you for your support!</p>
            </div>
        `,
        attachments: [
            {
                filename: 'camp_image.jpg',
                path: __dirname + '/../camp_image.jpg',
                cid: 'campImage' // same cid value as in the html img src
            }
        ]
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        // Don't crash the server if email fails
    }
};

module.exports = { sendCampNotification };
