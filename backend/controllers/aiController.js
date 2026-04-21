// Mock AI logic (can be replaced with OpenAI/Gemini API later)

const getTaskHelp = async (req, res) => {
  const { taskTitle } = req.body;
  
  // Placeholder response
  const helpText = `For your task "${taskTitle}", I recommend breaking it into three 25-minute Pomodoro sessions. Focus on the most complex part first.`;
  
  res.json({ helpText });
};

const getSuggestions = async (req, res) => {
  const suggestions = [
    { type: 'tip', text: 'Try to study in the morning when your brain is most fresh.' },
    { type: 'info', text: 'You have 3 tasks due tomorrow. Better start soon!' },
    { type: 'warning', text: 'You have been working for 2 hours. Take a break!' }
  ];
  
  res.json({ suggestions });
};

const chatWithAssistant = async (req, res) => {
  const { message } = req.body;
  
  // Placeholder chatbot response
  const response = `I'm your AI study assistant. You said: "${message}". How can I help you organize your schedule today?`;
  
  res.json({ response });
};

module.exports = { getTaskHelp, getSuggestions, chatWithAssistant };
