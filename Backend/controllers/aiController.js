const axios = require("axios");
const db = require("../config/db");

const aiController = {
  processMessage: async (req, res) => {
    try {
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({ response_message: "Message required" });
      }

      // 1️⃣ Ask AI to extract structured info
      const aiExtract = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3",
        prompt: `
You are an assistant for a blood donation system.

Extract the following fields from the user message and return ONLY JSON.

Fields:
intent (greeting, find_donor, eligibility, camp, general)
blood_group (A+,A-,B+,B-,AB+,AB-,O+,O- or null)
location (city name or null)

Message: "${message}"

Example JSON:
{
 "intent":"find_donor",
 "blood_group":"A+",
 "location":"Chennai"
}
`,
        stream: false
      });

      let aiText = aiExtract.data.response.trim();

      let parsed;
      try {
        parsed = JSON.parse(aiText);
      } catch (e) {
        parsed = { intent: "general" };
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
      const aiReply = await axios.post("http://localhost:11434/api/generate", {
        model: "llama3",
        prompt: message,
        stream: false
      });

      return res.json({
        response_message: aiReply.data.response
      });

    } catch (error) {
      console.error("AI Error:", error);
      res.json({
        response_message: "Server error while processing your request."
      });
    }
  }
};

module.exports = aiController;