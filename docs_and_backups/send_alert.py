import requests

SLACK_WEBHOOK = "https://hooks.slack.com/services/YOUR_SLACK_WEBHOOK_HERE"  # ← ใส่ Webhook URL จริงตรงนี้

def send_alert(message, severity='warning'):
    """
    ส่ง alert ไป Slack

    Args:
        message:  ข้อความที่ต้องการส่ง
        severity: 'info' / 'warning' / 'critical'

    Returns:
        True ถ้าส่งสำเร็จ, False ถ้าล้มเหลว
    """
    colors = {
        'info':     '#0099FF',
        'warning':  '#FFAA00',
        'critical': '#FF0000'
    }

    emojis = {
        'info':     'ℹ️',
        'warning':  '⚠️',
        'critical': '🚨'
    }

    # Guard: ถ้า severity ผิด → default เป็น warning
    if severity not in colors:
        severity = 'warning'

    payload = {
        'text': f'{emojis[severity]} *{severity.upper()}*: {message}',
        'attachments': [{
            'color': colors[severity],
            'text': message,
            'footer': 'Shinawatra Chatbot Alert'
        }]
    }

    try:
        response = requests.post(
            SLACK_WEBHOOK,
            json=payload,
            timeout=5  # หยุดรอหลัง 5 วินาที
        )
        if response.status_code == 200:
            print(f'✅ Alert sent! [{severity.upper()}] {message}')
            return True
        else:
            print(f'❌ Failed: HTTP {response.status_code}')
            return False
    except requests.exceptions.Timeout:
        print('❌ Timeout: Slack ไม่ตอบใน 5 วิ')
        return False
    except Exception as e:
        print(f'❌ Error: {e}')
        return False


# ===== Test =====
if __name__ == '__main__':
    print("Testing Slack alerts...\n")
    send_alert('Bot ทำงานปกติ', 'info')
    send_alert('Error rate สูงกว่าปกติ', 'warning')
    send_alert('P0 Contact Leak Detected!', 'critical')
