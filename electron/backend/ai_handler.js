require('dotenv').config({ path: require('path').resolve(__dirname, '..', '..', '.env') });
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

async function generateMonitoringContext(userGoal) {
    const prompt = `Based on the user's monitoring goal: "${userGoal}", create a concise, comma-separated list of potential dangers or important events to watch for. This list will be used as context for an AI. For example, for "monitor my baby", a good list would be: "crying, falling, struggling to breathe, stranger in room, blanket over face". Just output the list. MAXIMUM OF 10`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}

async function decideOnAlert(context, activities) {
    const prompt = `
    You are an AI safety monitor. Your task is to decide if an alert is necessary.
    Respond ONLY with a valid JSON object. Do not include any other text or markdown formatting.
    The JSON object must have two keys: "alert" (a boolean) and "message" (a string).

    Here is the situation:
    - Monitoring Context (dangers to watch for): "${context}"
    - Activities Detected in the last few seconds: "${activities}"

    Analyze the detected activities in light of the monitoring context.
    - If any detected activity matches a danger in the context, set "alert" to true and create a clear, concise alert message.
    - If the activities are normal or benign, set "alert" to false and the message can a simple status.
    
    JSON response:
  `;


    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonString);
    } catch (error) {
        console.error("Error parsing Gemini's decision response:", error);
        return { alert: false, message: "Could not get AI decision." };
    }
}

module.exports = { generateMonitoringContext, decideOnAlert };