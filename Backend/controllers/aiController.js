const { Groq } = require("groq-sdk");
const db = require("../config/db");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const aiController = {
  processMessage: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ response_message: "Message required" });
      }

      // 1️⃣ Ask AI to extract structured info
      const extractCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are an assistant for a blood donation system. Extract the following fields from the user message and return ONLY JSON.\n\nFields:\nintent (greeting, find_donor, eligibility, camp, general)\nblood_group (A+,A-,B+,B-,AB+,AB-,O+,O- or null)\nlocation (city name or null)\n\nExample JSON:\n{\n "intent":"find_donor",\n "blood_group":"A+",\n "location":"Chennai"\n}`
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.1-8b-instant",
        response_format: { type: "json_object" },
      });

      let aiText = extractCompletion.choices[0]?.message?.content || "{}";

      let parsed;
      try {
        parsed = JSON.parse(aiText);
      } catch (e) {
        parsed = { intent: "general", blood_group: null, location: null };
      }

      const { intent, blood_group, location } = parsed;

      // 2️⃣ Greeting
      if (intent === "greeting") {
        return res.json({
          response_message:
            "Hello! I am your AI Blood Assistant 🩸. I can help you find blood donors or answer questions."
        });
      }

      // 3️⃣ Eligibility rules
      if (intent === "eligibility") {
        return res.json({
          response_message:
            "Blood Donation Rules:\n\n• Age: 18-65\n• Weight: Minimum 50kg\n• Must be healthy\n• 3 months gap between donations"
        });
      }

      // 4️⃣ Donor Search
      if (intent === "find_donor" && blood_group) {

        let query =
          "SELECT name, blood_group, location, contact FROM users WHERE blood_group=?";
        let params = [blood_group];

        if (location) {
          query += " AND location=?";
          params.push(location);
        }

        const [donors] = await db.query(query, params);

        if (donors.length === 0) {
          return res.json({
            response_message: "No donors found matching your request."
          });
        }

        const donorList = donors
          .slice(0, 5)
          .map(
            d =>
              `👤 ${d.name} (${d.blood_group})\n📍 ${d.location}\n📞 ${d.contact}`
          )
          .join("\n\n");

        return res.json({
          response_message: `🩸 Found ${donors.length} donor(s):\n\n${donorList}`
        });
      }

      // 5️⃣ Blood Camp Info
      if (intent === "camp") {
        return res.json({
          response_message:
            "To organize a blood donation camp, please use the 'Organize Camp' option on the dashboard."
        });
      }

      // 6️⃣ General AI response (fallback)
      const aiReplyCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant for a Blood Donation platform. Please answer the following user query strictly in the context of blood donation, blood types, or health. Do not assume 'A+' or 'O-' refers to grades or allergy tests; they are blood groups."
          },
          {
            role: "user",
            content: message
          }
        ],
        model: "llama-3.1-8b-instant",
      });

      return res.json({
        response_message: aiReplyCompletion.choices[0]?.message?.content || "Sorry, I could not process your request."
      });

    } catch (error) {
      console.error("AI Error Message:", error.message);
      console.error("AI Error Status:", error.status);
      console.error("AI Error Details:", JSON.stringify(error.error || {}, null, 2));
      res.json({
        response_message: `Error: ${error.message}`
      });
    }
  }
};

module.exports = aiController;