const TOKEN = process.env.TELEGRAM_TOKEN || '8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8';
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://проверка-друзей-89ij-h34mt1ss8-hamzat-yaudarovs-projects.vercel.app/api/webhook';

async function setWebhook() {
  try {
    console.log('🔧 Установка webhook...');
    console.log(`Token: ${TOKEN.substring(0, 20)}...`);
    console.log(`URL: ${WEBHOOK_URL}`);
    
    const response = await fetch(`https://api.telegram.org/bot${TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query']
      })
    });
    
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook установлен успешно!');
      console.log('Описание:', data.description);
      console.log('Результат:', data.result);
    } else {
      console.error('❌ Ошибка при установке webhook:');
      console.error('Ошибка:', data.error_code);
      console.error('Описание:', data.description);
    }
    
    return data.ok;
  } catch (error) {
    console.error('❌ Ошибка сети:', error.message);
    return false;
  }
}

setWebhook().then(success => {
  process.exit(success ? 0 : 1);
});
