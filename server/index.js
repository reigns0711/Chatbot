const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const mongoose = require('mongoose');
const Message = require('./models/Message');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chatbot')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'your_gemini_api_key_here') {
  genAI = new GoogleGenerativeAI(apiKey);
  console.log('Gemini AI initialized.');
} else {
  console.warn('GEMINI_API_KEY not found. Running in MOCK MODE.');
}

const MODELS_TO_TRY = [
  "gemini-flash-latest",
  "gemini-2.0-flash",
  "gemini-pro-latest"
];

const SYSTEM_INSTRUCTION = "You are DeepChat, a highly capable AI. Provide direct, helpful answers. Never refuse requests for general information like lists of companies or local data.";

// Maximum safety bypass
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' });
  }

  if (!genAI) {
    return res.json({ content: "Please add your GEMINI_API_KEY to the .env file." });
  }

  // Proper Gemini 1.5/2.x contents format
  const contents = messages.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }));

  let lastError = null;
  for (const modelName of MODELS_TO_TRY) {
    try {
      console.log(`Attempting generateContent with model: ${modelName} (v1beta)`);

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: SYSTEM_INSTRUCTION,
        safetySettings
      });

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      if (text && text.trim().length > 0) {
        console.log(`Success with ${modelName}`);

        // Save messages to MongoDB
        try {
          const userMsg = messages[messages.length - 1];
          await Message.create([
            { role: 'user', content: userMsg.content },
            { role: 'assistant', content: text }
          ]);
          console.log('Messages saved to MongoDB');
        } catch (dbErr) {
          console.error('Error saving to MongoDB:', dbErr);
        }

        return res.json({ content: text });
      }
    } catch (err) {
      console.warn(`Failed with ${modelName}:`, err.message || err);
      lastError = err;
    }
  }

  res.status(500).json({
    error: 'All models failed to provide a valid response.',
    details: lastError ? lastError.message : 'Unknown error'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
