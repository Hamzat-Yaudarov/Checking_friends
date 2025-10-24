# 🚀 Развертывание бота на Vercel

## Шаг 1: Подготовка кода

Все файлы уже готовы к развертыванию. Просто выполните:

```bash
git add .
git commit -m "Готово к развертыванию на Vercel"
git push origin main
```

## Шаг 2: Создание проекта на Vercel

1. Перейдите на https://vercel.com/dashboard
2. Нажмите кнопку **"Add New"** → **"Project"**
3. Выберите ваш GitHub репозиторий
4. Нажмите **"Deploy"**

Vercel автоматически начнет развертывание. Подождите, пока оно завершится.

## Шаг 3: Добавление переменных среды ⚙️

**Важно!** Это нужно сделать ДО того, как бот начнет работать.

1. В Vercel Dashboard откройте ваш проект
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте две переменные:

### Переменная 1: BOT_TOKEN
- **Name**: `BOT_TOKEN`
- **Value**: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
- Нажмите **"Add"**

### Переменная 2: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://neondb_owner:npg_5Q1JLwpTliPo@ep-sweet-firefly-agmtcj1n-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
- Нажмите **"Add"**

## Шаг 4: Пересоздание развертывания

После добавления переменных среды нужно пересоздать развертывание:

1. Перейдите на вкладку **"Deployments"**
2. Нажмите на последнее развертывание (должно быть вверху)
3. Нажмите кнопку **"Redeploy"** справа вверху

Подождите, пока новое развертывание завершится. Вы должны увидеть зеленую галочку ✅

## Шаг 5: Получение URL вашего бота 🌐

После успешного развертывания:

1. Откройте вкладку **"Deployments"** в Vercel Dashboard
2. Нажмите на успешное развертывание
3. Вверху вы увидите URL вашего проекта, например:
   ```
   https://friendship-bot.vercel.app
   ```

**Запомните этот URL - он понадобится на следующем шаге!**

## Шаг 6: Установка Webhook для Telegram 📱

Telegram должен знать, где находится ваш бот. Для этого нужно установить "webhook" (это просто адрес, по которому Telegram будет отправлять обновления).

### Способ 1: Через браузер (Самый простой) ✨

1. Замените в ссылке:
   - `YOUR_BOT_TOKEN` на `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`
   - `your-vercel-url` на ваш URL из Шага 5 (например: `friendship-bot.vercel.app`)

2. Скопируйте эту ссылку в адресную строку браузера и откройте:
   ```
   https://api.telegram.org/bot8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8/setWebhook?url=https://friendship-bot.vercel.app
   ```

3. Нажмите **Enter**

Если всё правильно, вы увидите в браузере:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

### Способ 2: Через командную строку (Если знаете, как)

Откройте терминал и выполните:
```bash
curl -X POST https://api.telegram.org/bot8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8/setWebhook \
  -d "url=https://friendship-bot.vercel.app"
```

Замените `friendship-bot.vercel.app` на ваш реальный URL из Шага 5.

## Шаг 7: Проверка работы ✅

1. Откройте Telegram
2. Найдите бота **@friendlyquizbot**
3. Отправьте команду `/start`
4. Бот должен ответить приветственным сообщением

**Если бот ответил** - все работает! 🎉

**Если бот не ответил** - смотрите раздел "Что делать, если не работает" ниже.

## Что делать, если не работает 🔧

### Шаг 1: Проверить логи
1. В Vercel Dashboard откройте ваш проект
2. Перейдите на вкладку **"Logs"**
3. Посмотрите, есть ли красные ошибки

### Шаг 2: Проверить webhook

Откройте в браузере (замените `YOUR_BOT_TOKEN`):
```
https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo
```

Вместо `YOUR_BOT_TOKEN` подставьте: `8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8`

Полная ссылка:
```
https://api.telegram.org/bot8357920603:AAEcRZlAzCebZxQCIRLPQWRASZL-3upZOC8/getWebhookInfo
```

Должно показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-url.vercel.app",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Шаг 3: Проверить переменные среды

1. В Vercel Dashboard → **Settings** → **Environment Variables**
2. Убедитесь, что `BOT_TOKEN` и `DATABASE_URL` добавлены
3. Если изменяли - нажмите **"Redeploy"** на вкладке Deployments

### Шаг 4: Проверить базу данных

Убедитесь, что база данных на Neon работает:
- Перейдите на https://console.neon.tech
- Проверьте, что в��ш проект активен

## Часто задаваемые вопросы

**Q: Бот не отвечает на команды**
A: Проверьте логи в Vercel и убедитесь, что переменные среды установлены. Может потребоваться перезагрузить бот.

**Q: Что такое webhook?**
A: Это просто адрес (URL), на который Telegram отправляет обновления о сообщениях. Вместо того, чтобы ваш бот спрашивал "Есть ли новые сообщения?", Telegram сам говорит боту "У тебя новое сообщение!"

**Q: Могу ли я отменить развертывание?**
A: Да, в Vercel Dashboard → Deployments → нажмите на развертывание → нажмите меню → "Promote to Production" для старой версии.

**Q: Как часто обновляется бот?**
A: Каждый раз, когда вы делаете `git push`, Vercel автоматически развертывает новую версию.

## Готово! 🎉

Ваш бот теперь работает на Vercel! Если у вас есть вопросы - свяжитесь с поддержкой Vercel или проверьте их документацию на https://vercel.com/docs
