import { Answer } from '../models/Test';

export function startMessage(): string {
  return `🌟 Привет! Добро пожаловать в "Проверка дружбы"! 🌟

Здесь ты сможешь создать свой тест, чтобы узнать, насколько хорошо тебя знают твои друзья и получать удивительные ДОСТИЖЕНИЯ ДРУЖБЫ! 🏆

Создавай тесты с вопросами о себе, делись ими с друзьями и смотри, как хорошо они тебя знают. Чем больше правильных ответов, тем лучше вы друзья! 💫

Просто нажми на кнопку "✨ Создать тес�� ✨" и следуй инструкциям ⤵️`;
}

export function createTestInstructions(): string {
  return `📝 Инструкции по созданию теста:

1️⃣ Введите свой вопрос о себе (например: "Какой мой любимый цвет?", "В каком городе я родился?")
2️⃣ Добавьте минимум 2 варианта ответа
3️⃣ Повторите для каждого вопроса (максимум 5 вопросов)
4️⃣ Сохраните тест и поделитесь с друзьями!

Вы можете добавлять ответы по одному или несколько сразу в формате:
Ответ: вариант 1
Ответ: вариант 2
Ответ: вариант 3

Давайте начнём! 🚀`;
}

export function firstQuestionPrompt(): string {
  return `❓ Введите ваш первый вопрос о себе:`;
}

export function questionStatusMessage(
  questionNumber: number,
  questionText: string,
  answers: string[]
): string {
  let message = `📌 Вопрос ${questionNumber}: ${questionText}\n\n`;
  message += `Варианты ответов:\n`;
  
  answers.forEach((answer, index) => {
    message += `${index + 1} - ${answer}\n`;
  });

  if (answers.length < 2) {
    message += `\n⚠️ Нужно минимум 2 варианта ответа\n`;
    message += `Введите варианты ответов в формате:\nОтвет: вариант ответа`;
  } else {
    message += `\n✅ Введите ещё ответы или нажмите "Следующий вопрос"`;
  }

  return message;
}

export function answersPrompt(questionNumber: number, questionText: string): string {
  return `📌 Вопрос ${questionNumber}: ${questionText}\n\n⬇️ Введите варианты ответов (минимум 2):\n\nФормат:\nОтвет: вариант 1\nОтвет: вариант 2`;
}

export function testSavedMessage(testCount: number): string {
  return `✅ Тест успешно сохранён! 🎉\n\nУ вас уже ${testCount} тест(ов). Поделитесь тестом с друзьями и смотрите, как хорошо они вас знают!`;
}

export function myTestsMessage(testCount: number): string {
  if (testCount === 0) {
    return `📋 У вас нет созданных тестов\n\nСоздайте свой первый тест и поделитесь с друзьями! ✨`;
  }
  return `📋 Ваши тесты (всего: ${testCount})`;
}

export function errorMessage(error: string): string {
  return `❌ Ошибка: ${error}`;
}

export function formatAnswersFromText(text: string): string[] {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  const answers: string[] = [];

  for (const line of lines) {
    if (line.toLowerCase().startsWith('ответ:')) {
      const answer = line.substring(6).trim();
      if (answer) {
        answers.push(answer);
      }
    }
  }

  return answers;
}
