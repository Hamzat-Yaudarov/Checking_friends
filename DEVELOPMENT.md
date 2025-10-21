# Development Guide - Friendship Check Bot

This guide helps developers understand the codebase structure and how to contribute.

## 📋 Architecture Overview

### High-Level Flow

```
User Message/Button Click
    ↓
Telegram Update
    ↓
Bot Handler (command/action/message)
    ↓
Model Layer (Database Operations)
    ↓
Database (PostgreSQL/Neon)
    ↓
Response Message/Keyboard
    ↓
Telegram API
    ↓
User's Telegram Client
```

### Core Components

1. **Bot Server** (`src/server.ts`)
   - HTTP server for webhook (production) or polling (development)
   - Bot event routing
   - Error handling

2. **Database Service** (`src/services/db.ts`)
   - Connection pool management
   - Query execution
   - Error handling

3. **Models** (`src/models/`)
   - User data operations
   - Test/Quiz operations
   - Session state management

4. **Handlers** (`src/handlers/`)
   - Command handlers (`/start`, etc.)
   - Message handlers (user text input)
   - Callback handlers (button clicks)

5. **Utilities** (`src/utils/`)
   - Keyboard builders (inline buttons)
   - Message formatting
   - Test utilities

## 🗂️ File Structure Explained

### src/models/User.ts
**Purpose**: Handle user-related database operations

```typescript
// Create or find user
await findOrCreateUser(telegramId, username, firstName, lastName);

// Get user by ID
await getUserById(userId);

// Get user by Telegram ID
await getUserByTelegramId(telegramId);
```

### src/models/Test.ts
**Purpose**: Handle test/quiz database operations

Key functions:
- `createTest()` - Create new test
- `addQuestion()` - Add question to test
- `addAnswer()` - Add answer to question
- `getTestWithQuestions()` - Get full test with all questions and answers
- `getUserTests()` - Get all tests by user
- `deleteTest()` - Remove test

### src/models/Session.ts
**Purpose**: Track conversation state during test creation

Session states:
- `idle` - User is in main menu
- `creating_test` - User is creating a test
- `entering_question` - User is entering a question
- `entering_answers` - User is entering answers

Session data:
```typescript
{
  testId: number;
  currentQuestion: number;
  currentQuestionText: string;
  currentAnswers: string[];
  lastMessageId: number;
}
```

### src/handlers/commands.ts
**Purpose**: Handle Telegram commands

Handlers:
- `startCommand` - `/start` command
- `createTestCallback` - "✨ Создать тест ✨" button
- `myTestsCallback` - "���� Мои тесты" button
- `stopCreationCallback` - "⏹️ Остановить создание теста" button

### src/handlers/messages.ts
**Purpose**: Handle user messages and quiz creation

Handlers:
- `handleMessage()` - Process user text input during test creation
- `nextQuestionCallback()` - "➕ Следующий вопрос" button
- `saveTestCallback()` - "💾 Сохранить тест" button

### src/handlers/test-handlers.ts
**Purpose**: Handle test viewing, sharing, and deletion

Handlers:
- `viewMyTestsCallback()` - Show user's tests list
- `viewTestCallback()` - Show test details
- `deleteTestCallback()` - Delete a test
- `shareTestCallback()` - Generate share link
- `backToTestsCallback()` - Navigation
- `backToMenuCallback()` - Navigation

### src/utils/keyboards.ts
**Purpose**: Build Telegram inline keyboards (buttons)

Functions:
- `mainMenuKeyboard()` - Main menu with two buttons
- `stopCreationKeyboard()` - Stop button
- `nextQuestionKeyboard()` - Next question button
- `finishTestKeyboard()` - Next + Save buttons
- `removeKeyboard()` - Remove inline keyboard

### src/utils/messages.ts
**Purpose**: Format and compose messages

Functions:
- `startMessage()` - Welcome message
- `createTestInstructions()` - How to create test
- `questionStatusMessage()` - Show question and answers
- `testSavedMessage()` - Confirmation message
- `formatAnswersFromText()` - Parse user input for answers

### src/utils/test-utilities.ts
**Purpose**: Test-specific utilities

Functions:
- `formatTestForDisplay()` - Format test summary
- `formatTestDetails()` - Format full test details
- `testListKeyboard()` - Keyboard for test list
- `testDetailKeyboard()` - Keyboard for test details
- `generateTestShareLink()` - Create shareable link

## 🔄 Quiz Creation Flow (Detailed)

### 1. User Clicks "✨ Создать тест ✨"

```
Bot Action: create_test
Handler: createTestCallback()
Steps:
  1. Get user from database
  2. Create new test in database
  3. Save session state (creating_test)
  4. Edit previous message with instructions
  5. Send "Введите ваш первый вопрос"
```

### 2. User Types Question

```
Message: "What's my favorite color?"
Handler: handleMessage()
Steps:
  1. Check session state is "creating_test"
  2. Check if currentQuestionText is set (it's not)
  3. Save question to database
  4. Send "Введите варианты ответов"
  5. Update session with question text
  6. Save message ID for editing
```

### 3. User Types Answers

```
Message: "Ответ: Blue\nОтвет: Red"
Handler: handleMessage()
Steps:
  1. Check session state is "creating_test"
  2. Check if currentQuestionText is set (it is)
  3. Parse answers from text
  4. Save each answer to database
  5. Get all answers for question
  6. Format status message with answers
  7. Edit previous message with status
  8. Add buttons based on answer count
     - If < 2 answers: Show stop button only
     - If >= 2 answers: Show next question + stop buttons
     - If 5+ questions: Show save test button
```

### 4. User Clicks "➕ Следующий вопрос"

```
Bot Action: next_question
Handler: nextQuestionCallback()
Steps:
  1. Update session for next question
  2. Clear currentQuestionText
  3. Send prompt for next question
```

### 5. Repeat Steps 2-4 for Each Question

### 6. User Clicks "💾 Сохранить тест"

```
Bot Action: save_test
Handler: saveTestCallback()
Steps:
  1. Get user info
  2. Get user's tests count
  3. Clear session
  4. Send confirmation message
  5. Show main menu
```

## 🗄️ Database Operations

### Creating Records

```typescript
// Create user
const user = await findOrCreateUser(
  BigInt(123456),
  'username',
  'FirstName',
  'LastName'
);

// Create test
const test = await createTest(user.id, 'My Test');

// Add question
const question = await addQuestion(test.id, 'What is my name?', 1);

// Add answer
const answer = await addAnswer(question.id, 'John', 1);
```

### Reading Records

```typescript
// Get user
const user = await getUserByTelegramId(BigInt(123456));

// Get user's tests
const tests = await getUserTests(user.id);

// Get full test with questions and answers
const test = await getTestWithQuestions(testId);

// Get session state
const session = await getSession(BigInt(123456));
```

### Updating Records

```typescript
// Update session
await setSession(telegramId, 'creating_test', {
  testId: 1,
  currentQuestion: 1,
  currentQuestionText: 'Question text',
  currentAnswers: ['answer1', 'answer2'],
  lastMessageId: 12345,
});
```

### Deleting Records

```typescript
// Delete test
await deleteTest(testId);

// Clear session
await clearSession(telegramId);
```

## 🎯 Adding a New Feature

### Example: Add Test Duplication

1. **Add Database Function** (`src/models/Test.ts`):
```typescript
export async function duplicateTest(sourceTestId: number, userId: number): Promise<Test> {
  const pool = getPool();
  
  const sourceTest = await getTestWithQuestions(sourceTestId);
  if (!sourceTest) throw new Error('Test not found');

  // Create new test
  const newTest = await createTest(userId, `${sourceTest.title} (Copy)`);

  // Copy questions and answers
  for (const question of sourceTest.questions) {
    const newQuestion = await addQuestion(newTest.id, question.question_text, question.question_order);
    for (const answer of question.answers) {
      await addAnswer(newQuestion.id, answer.answer_text, answer.answer_order);
    }
  }

  return newTest;
}
```

2. **Add Handler** (`src/handlers/test-handlers.ts`):
```typescript
export async function duplicateTestCallback(ctx: Context): Promise<void> {
  try {
    const from = ctx.from;
    if (!from) return;

    const query = ctx.callbackQuery as any;
    const testIdStr = query?.data?.replace('duplicate_test_', '');
    const testId = parseInt(testIdStr, 10);

    const user = await getUserByTelegramId(BigInt(from.id));
    if (!user) return;

    const newTest = await duplicateTest(testId, user.id);
    await ctx.reply(`✅ Тест скопирован! ID: ${newTest.id}`);
  } catch (error) {
    console.error('Error:', error);
    await ctx.reply('❌ Ошибка при копировании теста');
  }
}
```

3. **Register Handler** (`src/server.ts`):
```typescript
bot.action(/^duplicate_test_\d+$/, duplicateTestCallback);
```

4. **Add Button** (`src/utils/keyboards.ts`):
```typescript
export function testDetailKeyboard(testId: number) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📋 Скопировать', `duplicate_test_${testId}`)],
    [Markup.button.callback('🔗 Поделиться', `share_test_${testId}`)],
    [Markup.button.callback('🗑️ Удалить', `delete_test_${testId}`)],
    [Markup.button.callback('⬅️ Назад', 'back_to_tests')],
  ]);
}
```

## 🧪 Testing Locally

### Setup Test Environment

```bash
# 1. Start bot in dev mode
npm run dev

# 2. Create test user in database
psql $DATABASE_URL
INSERT INTO users (telegram_id, username) VALUES (123456, 'testuser');

# 3. Open Telegram
# Send message to bot
```

### Debug Tips

1. **Check logs**:
   ```bash
   npm run dev  # See console output
   ```

2. **Database queries**:
   ```bash
   psql $DATABASE_URL
   SELECT * FROM users;
   SELECT * FROM tests;
   ```

3. **Session state**:
   ```bash
   SELECT * FROM user_sessions WHERE telegram_id = 123456;
   ```

4. **Add debug logging**:
   ```typescript
   console.log('Debug:', variable);
   ```

## 📦 Dependencies

- **telegraf**: Telegram bot framework
- **pg**: PostgreSQL client
- **dotenv**: Environment variable management
- **typescript**: Type safety
- **ts-node**: Run TypeScript directly

## 🔒 Security Best Practices

1. **Never log secrets**:
   ```typescript
   // ❌ Bad
   console.log('Token:', BOT_TOKEN);
   
   // ✅ Good
   console.log('Bot initialized');
   ```

2. **Validate user input**:
   ```typescript
   if (!text || text.trim().length === 0) {
     return;
   }
   ```

3. **Check permissions**:
   ```typescript
   const user = await getUserByTelegramId(telegramId);
   if (test.user_id !== user.id) {
     return ctx.reply('Not authorized');
   }
   ```

4. **Handle errors gracefully**:
   ```typescript
   try {
     // operation
   } catch (error) {
     console.error('Error:', error);
     ctx.reply('An error occurred');
   }
   ```

## 🚀 Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run typecheck`
- [ ] Bot responds to `/start`
- [ ] Test creation works end-to-end
- [ ] Database queries are optimized
- [ ] Error handling is in place
- [ ] Logs are meaningful

## 📚 Further Reading

- [Telegraf Documentation](https://telegraf.js.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides)

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Run `npm run build`
4. Test locally with `npm run dev`
5. Push to GitHub
6. Create PR with description
