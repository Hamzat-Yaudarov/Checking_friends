import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import * as userService from './services/userService';
import * as testService from './services/testService';
import { initializeDatabase } from './db/database';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Root route handler - serves router page that detects Telegram app parameters
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// MiniApp routes
app.get('/miniapp', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/index.html'));
});

app.get('/miniapp/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/index.html'));
});

app.get('/miniapp/create-test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/create-test.html'));
});

app.get('/miniapp/my-tests', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/my-tests.html'));
});

app.get('/miniapp/take-test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/take-test.html'));
});

app.get('/miniapp/edit-test', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/miniapp/edit-test.html'));
});

// Middleware to validate telegram_id
const validateTelegramId = (req: Request, res: Response, next: NextFunction) => {
  const telegramId = req.headers['x-telegram-id'];
  if (!telegramId) {
    return res.status(401).json({ error: 'Missing telegram_id header' });
  }
  req.body.telegramId = parseInt(telegramId as string);
  next();
};

// User endpoints
app.post('/api/users/sync', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, telegramUsername, firstName, lastName, avatarUrl } = req.body;
    const user = await userService.createOrUpdateUser(
      telegramId,
      telegramUsername,
      firstName,
      lastName,
      avatarUrl
    );
    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
});

app.get('/api/users/me', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const user = await userService.getUserByTelegramId(req.body.telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Test CRUD endpoints
app.post('/api/tests', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;
    const { title, description } = req.body;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const test = await testService.createTest(user.id, title, description);
    res.status(201).json(test);
  } catch (error) {
    console.error('Error creating test:', error);
    res.status(500).json({ error: 'Failed to create test' });
  }
});

app.get('/api/tests/:testId', async (req: Request, res: Response) => {
  try {
    const test = await testService.getTestWithQuestions(req.params.testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

app.get('/api/tests/:testId/minimal', async (req: Request, res: Response) => {
  try {
    const test = await testService.getTestById(req.params.testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    res.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ error: 'Failed to fetch test' });
  }
});

app.get('/api/users/:userId/tests', async (req: Request, res: Response) => {
  try {
    const tests = await testService.getTestsByCreator(req.params.userId);
    res.json(tests);
  } catch (error) {
    console.error('Error fetching user tests:', error);
    res.status(500).json({ error: 'Failed to fetch tests' });
  }
});

app.put('/api/tests/:testId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, title, description } = req.body;
    const { testId } = req.params;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const test = await testService.getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.creator_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const updatedTest = await testService.updateTest(testId, title, description);
    res.json(updatedTest);
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

app.delete('/api/tests/:testId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId } = req.body;
    const { testId } = req.params;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const test = await testService.getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.creator_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await testService.deleteTest(testId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// Question endpoints
app.post('/api/questions', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, testId, text, orderIndex } = req.body;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const test = await testService.getTestById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    if (test.creator_id !== user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const question = await testService.createQuestion(testId, text, orderIndex);
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

app.put('/api/questions/:questionId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, text } = req.body;
    const { questionId } = req.params;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const question = await testService.updateQuestion(questionId, text);
    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

app.delete('/api/questions/:questionId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    await testService.deleteQuestion(questionId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

// Answer endpoints
app.post('/api/answers', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, questionId, text, isCorrect, orderIndex } = req.body;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const answer = await testService.createAnswer(questionId, text, isCorrect, orderIndex);
    res.status(201).json(answer);
  } catch (error) {
    console.error('Error creating answer:', error);
    res.status(500).json({ error: 'Failed to create answer' });
  }
});

app.put('/api/answers/:answerId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, text, isCorrect } = req.body;
    const { answerId } = req.params;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const answer = await testService.updateAnswer(answerId, text, isCorrect);
    res.json(answer);
  } catch (error) {
    console.error('Error updating answer:', error);
    res.status(500).json({ error: 'Failed to update answer' });
  }
});

app.delete('/api/answers/:answerId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { answerId } = req.params;
    await testService.deleteAnswer(answerId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting answer:', error);
    res.status(500).json({ error: 'Failed to delete answer' });
  }
});

// Test attempt endpoints
app.post('/api/test-attempts', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { telegramId, testId, displayName, answers } = req.body;

    const user = await userService.getUserByTelegramId(telegramId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if test exists
    const test = await testService.getTestWithQuestions(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if user is the creator
    if (test.creator_id === user.id) {
      return res.status(403).json({ error: 'Cannot take your own test' });
    }

    // Check if user already attempted this test
    const attemptExists = await testService.checkAttemptExists(user.id, testId);
    if (attemptExists) {
      return res.status(409).json({ error: 'You have already taken this test' });
    }

    // Calculate score
    let score = 0;
    const answerMap = answers as Record<string, string>;

    test.questions?.forEach((question) => {
      const selectedAnswerId = answerMap[question.id];
      const selectedAnswer = question.answers?.find((a) => a.id === selectedAnswerId);
      if (selectedAnswer?.is_correct) {
        score++;
      }
    });

    const totalQuestions = test.questions?.length || 0;

    // Create attempt
    const attempt = await testService.createTestAttempt(
      user.id,
      testId,
      displayName,
      score,
      totalQuestions
    );

    // Create individual results
    for (const question of test.questions || []) {
      const selectedAnswerId = answerMap[question.id];
      const selectedAnswer = question.answers?.find((a) => a.id === selectedAnswerId);
      const isCorrect = selectedAnswer?.is_correct || false;

      await testService.createTestResult(attempt.id, question.id, selectedAnswerId, isCorrect);
    }

    res.status(201).json(attempt);
  } catch (error) {
    console.error('Error creating test attempt:', error);
    res.status(500).json({ error: 'Failed to submit test' });
  }
});

app.get('/api/tests/:testId/attempts', async (req: Request, res: Response) => {
  try {
    const attempts = await testService.getTestAttempts(req.params.testId);
    res.json(attempts);
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    res.status(500).json({ error: 'Failed to fetch attempts' });
  }
});

// Update test attempt with display name
app.patch('/api/test-attempts/:attemptId', validateTelegramId, async (req: Request, res: Response) => {
  try {
    const { displayName } = req.body;
    const { attemptId } = req.params;

    const result = await testService.updateTestAttemptDisplayName(attemptId, displayName);
    res.json(result);
  } catch (error) {
    console.error('Error updating test attempt:', error);
    res.status(500).json({ error: 'Failed to update test attempt' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initializeDatabase();
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

export { app, startServer };
