const { google } = require('googleapis');
const path = require('path');

const SPREADSHEET_ID = process.env.CANTANSWER_SHEET_ID;
const SHEET_NAME = process.env.CANTANSWER_SHEET_NAME || 'ชีต1';
const KEY_FILE = path.join(__dirname, 'google-service-account.json');

let sheetsClient = null;

function getSheetsClient() {
    if (sheetsClient) return sheetsClient;
    const auth = new google.auth.GoogleAuth({
        keyFile: KEY_FILE,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    sheetsClient = google.sheets({ version: 'v4', auth });
    return sheetsClient;
}

// บันทึก 1 แถวลง Sheet เวลา AI ตอบคำถามลูกค้าไม่ได้ (ไม่ throttle เหมือน Telegram กันข้อมูลตกหาย ใช้รวบรวมไว้สอน AI เพิ่ม)
async function logCantAnswer({ campusPage, customerName, question, platform }) {
    if (!SPREADSHEET_ID) return; // ยังไม่ตั้งค่า Sheet ID ข้ามไปเฉยๆ ไม่ throw กันกระทบ flow หลัก

    try {
        const sheets = getSheetsClient();
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${SHEET_NAME}!A:E`,
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [[
                    new Date().toISOString(),
                    campusPage || '',
                    customerName || '',
                    question || '',
                    platform || '',
                ]],
            },
        });
    } catch (err) {
        console.error('[Sheets Logger Failed]', err.message);
    }
}

module.exports = { logCantAnswer };
