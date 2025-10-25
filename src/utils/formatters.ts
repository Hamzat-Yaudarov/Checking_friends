import { UserSession } from '../types';

export function formatStartMessage(): string {
  return `😊 Привет! Добро пожаловать в Проверку Дружбы! 🎉

Здесь ты сможешь создать свой уникальный тест, чтобы узнать, насколько хорошо твои друзья тебя знают. Поделись тестом со своими друзьями и получай интересные ДОСТИЖЕНИЯ ДРУЖБЫ! 🏆

Создавай вопросы о себе, давай варианты ответов, и пусть твои друзья проверят свои знания о тебе. Это весело, интересно и укрепляет дружбу! 💪`;
}

export function formatCreateTestInstructions(): string {
  return `📝 Инструкции по созданию теста:

1️⃣ Напиши вопрос о себе
2️⃣ Добавь варианты ответов (минимум 2)
3️⃣ Продолжай добавлять вопросы
4️⃣ Сохрани тест, когда будет 5+ вопросов

Ты можешь добавлять ответы по одному или сразу несколько, используя формат:
Ответ: Первый ответ
Ответ: Второй ответ
Ответ: Третий ответ

Поехали! 🚀`;
}

export function formatQuestionPrompt(questionIndex: number): string {
  return `📌 Введите вопрос #${questionIndex + 1}:`;
}

export function formatQuestionStatus(questionIndex: number, questionText: string, options: string[]): string {
  const optionsList = options.map((opt, idx) => `${idx + 1} - ${opt}`).join('\n');
  return `📋 Вопрос ${questionIndex + 1}: ${questionText}

Варианты ответов:
${optionsList}

➕ Добавьте еще варианты ответов и��и перейдите к следующему вопросу`;
}

export function formatTestSummary(questions: any[]): string {
  let summary = `✅ Ваш тест содержит ${questions.length} вопросов:\n\n`;
  questions.forEach((q, idx) => {
    summary += `${idx + 1}. ${q.text}\n`;
    q.options.forEach((opt: string, optIdx: number) => {
      summary += `   ${String.fromCharCode(97 + optIdx)}) ${opt}\n`;
    });
    summary += '\n';
  });
  return summary;
}

export function formatWaitingForAnswers(): string {
  return `📍 Введите варианты ответов:\n(минимум 2 варианта)`;
}

export function formatMinAnswersError(): string {
  return `❌ Ошибка: нужно минимум 2 варианта ответов. Добавьте ещё!`;
}

export function formatTestSaved(testId: number): string {
  return `✨ Тест успешно сохранён! ✨

ID вашего теста: ${testId}

Теперь вы можете поделиться ссылкой с друзьями!

🔗 Ссылка для друзей: https://t.me/${process.env.TELEGRAM_BOT_USERNAME}?start=quiz_${testId}`;
}
