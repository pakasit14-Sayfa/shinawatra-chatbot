/**
 * validate-contact.js
 * ด่านสกัดความปลอดภัย (Security Interceptor) 
 * ป้องกันไม่ให้ AI แจกเบอร์โทรศัพท์หรือข้อมูลการติดต่อโดยพลการ
 */

// รูปแบบเบอร์โทรศัพท์ในไทย (ดักได้ทั้ง 0812345678, 081-234-5678, 02-123-4567)
const THAI_PHONE_REGEX = /(?:0|\+66)\d{1,2}-?\d{3}-?\d{4}/g;

/**
 * ตรวจสอบข้อความว่ามีการหลุดเบอร์โทรศัพท์หรือไม่
 * 
 * @param {string} botMessage ข้อความที่ Dify ตอบกลับมา
 * @param {string} userMessage ข้อความที่ลูกค้าพิมพ์มา (เผื่อเช็คว่าลูกค้าขอคุยกับแอดมินหรือเปล่า)
 * @returns {object} { isLeak: boolean, safeMessage: string, foundPhones: string[] }
 */
function validateContact(botMessage, userMessage = '') {
    if (!botMessage || typeof botMessage !== 'string') {
        return { isLeak: false, safeMessage: botMessage, foundPhones: [] };
    }

    // 1. เช็คว่าลูกค้ามีเจตนา "ขอเบอร์" หรือ "ติดต่อคน" หรือไม่
    const allowKeywords = ['ติดต่อแอดมิน', 'ขอเบอร์', 'คุยกับคน', 'โทร', 'สายด่วน'];
    const isUserRequestingContact = allowKeywords.some(keyword => userMessage.includes(keyword));

    // 2. ค้นหาเบอร์โทรศัพท์ในคำตอบของบอท
    const foundPhones = botMessage.match(THAI_PHONE_REGEX) || [];

    // 3. ถ้าเจอเบอร์โทรศัพท์ และลูกค้าไม่ได้ขอ = ถือว่าหลุด (Leak)
    if (foundPhones.length > 0 && !isUserRequestingContact) {
        return {
            isLeak: true,
            foundPhones: foundPhones,
            // เซ็นเซอร์ข้อความ หรือส่งข้อความปลอดภัยกลับไปแทน
            safeMessage: "หากต้องการติดต่อโดยตรง รบกวนแจ้งความประสงค์ทิ้งไว้ แอดมินจะรีบเข้ามาดูแลนะคะ"
        };
    }

    // ถ้าปลอดภัย หรือลูกค้าอนุญาตให้ส่งเบอร์ได้
    return {
        isLeak: false,
        safeMessage: botMessage,
        foundPhones: foundPhones
    };
}

module.exports = {
    validateContact
};
