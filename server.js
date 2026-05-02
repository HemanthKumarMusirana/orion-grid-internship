const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Google Sheets Setup
const SPREADSHEET_ID = '1mOov_7Qv9qnrZv0Sz-3v6diNA_AVx9AkRns2uyEKShE'; // Replace with your Google Sheet ID
const SHEET_NAME = 'Sheet1'; // Your sheet name

// Google Service Account Credentials
// You'll get this file from Google Cloud Console
const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials.json', // Download this from Google Cloud
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Function to add data to Google Sheet
async function addToGoogleSheet(studentData) {
    try {
        const values = [[
            new Date().toISOString(), // Timestamp
            studentData.name,
            studentData.email,
            studentData.college,
            studentData.year,
            studentData.contact,
            studentData.department,
            studentData.course,
            studentData.mode
        ]];
        
        const request = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:I`,
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: { values },
        };
        
        const response = await sheets.spreadsheets.values.append(request);
        console.log('✅ Data added to Google Sheet:', response.data);
        return true;
    } catch (error) {
        console.error('❌ Google Sheet error:', error);
        return false;
    }
}

// Email configuration
const emailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'hemanth27062006@gmail.com',  // Replace
        pass: 'vhrp ycll idjq ueug'       // Replace
    }
});

// Send auto-reply email
// Send auto-reply email
// Send auto-reply email
async function sendAutoReply(studentData) {
    // Get course price
    const coursePrices = {
        "Full Stack Web Development": "₹15,000",
        "Artificial Intelligence & ML": "₹18,000",
        "Data Science & Analytics": "₹16,000",
        "Cloud Computing & DevOps": "₹17,000",
        "Embedded Systems & IoT": "₹15,000",
        "VLSI Design": "₹18,000",
        "Robotics & Automation": "₹16,000",
        "Wireless Communication": "₹15,000",
        "Power Systems & Smart Grid": "₹15,000",
        "Electric Vehicles & Battery Tech": "₹18,000",
        "Renewable Energy Systems": "₹16,000",
        "Industrial Automation & PLC": "₹15,000"
    };
    
    const courseFee = coursePrices[studentData.course] || "Contact for price";
    
    const mailOptions = {
        from: 'Orion Grid <hemanth27062006@gmail.com>',
        to: studentData.email,
        subject: 'Summer Internship 2026 - Registration Confirmed',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #0a2e4a; margin-bottom: 5px;">Orion Grid</h2>
                <p style="color: #666; margin-top: 0;">Summer Internship Program 2026</p>
                
                <hr style="border: none; border-top: 2px solid #0a2e4a; margin: 20px 0;">
                
                <p><strong>Dear ${studentData.name},</strong></p>
                
                <p>Thank you for registering for the Summer Internship Program in Pondicherry!</p>
                
                <h3 style="color: #0a2e4a; margin: 20px 0 10px 0;">Details:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Duration:</strong> 2 Months</li>
                    <li><strong>Mode:</strong> Offline (Pondicherry)</li>
                    <li><strong>Course:</strong> ${studentData.course}</li>
                    <li><strong>Fee:</strong> ${courseFee}</li>
                </ul>
                
                <p style="margin-top: 20px;">We'll contact you soon with further instructions.</p>
                
                <p style="margin-top: 30px;">
                    Best regards,<br>
                    <strong>Orion Grid</strong>
                </p>
                
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                
                <p style="font-size: 12px; color: #999; text-align: center;">
                    Orion Grid, Pondicherry | Engineer your future.
                </p>
            </div>
        `
    };
    
    try {
        await emailTransporter.sendMail(mailOptions);
        console.log(`✅ Auto-email sent to ${studentData.email}`);
        return true;
    } catch (error) {
        console.error('❌ Email error:', error);
        return false;
    }
}

// API endpoint
app.post('/api/register', async (req, res) => {
    const studentData = {
        name: req.body.name,
        email: req.body.email,
        college: req.body.college,
        year: req.body.year,
        contact: req.body.contact,
        department: req.body.department,
        course: req.body.course,
        mode: req.body.mode
    };
    
    // Validate
    if (!studentData.name || !studentData.email || !studentData.college || 
        !studentData.year || !studentData.contact || !studentData.department || 
        !studentData.course || !studentData.mode) {
        return res.status(400).json({ 
            success: false, 
            message: 'All fields are required!' 
        });
    }
    
    // Add to Google Sheet
    const sheetSuccess = await addToGoogleSheet(studentData);
    
    // Send auto-reply email
    const emailSuccess = await sendAutoReply(studentData);
    
    if (sheetSuccess && emailSuccess) {
        res.json({ 
            success: true, 
            message: 'Registration successful! Check your email for confirmation.' 
        });
    } else if (sheetSuccess) {
        res.json({ 
            success: true, 
            message: 'Registration saved! But email could not be sent. Please contact support.' 
        });
    } else {
        res.json({ 
            success: false, 
            message: 'Registration failed. Please try again or contact support.' 
        });
    }
});

// Serve pages
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/internship', (req, res) => res.sendFile(path.join(__dirname, 'public', 'internship.html')));
app.get('/courses', (req, res) => res.sendFile(path.join(__dirname, 'public', 'courses.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'public', 'contact.html')));

app.listen(PORT, () => {
    console.log(`🚀 Orion Grid server running at http://localhost:${PORT}`);
    console.log(`📊 Data will be saved directly to Google Sheet`);
});