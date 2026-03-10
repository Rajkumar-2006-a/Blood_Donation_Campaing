require('dotenv').config({path: './.env'});
const { Groq } = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function testGroq() {
    try {
        console.log("Testing with key:", process.env.GROQ_API_KEY);
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: "Hi" }],
            model: "llama-3.1-8b-instant",
        });
        console.log("Success! Response:", completion.choices[0].message.content);
        process.exit(0);
    } catch (error) {
        console.error("Failed!", error.message);
        process.exit(1);
    }
}
testGroq();
