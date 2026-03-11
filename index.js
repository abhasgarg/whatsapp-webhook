const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "my_secret_token_123";

// Paste your values from Meta's dashboard here
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Verification endpoint (already working)
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Webhook verified!");
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Receive messages and send replies
app.post("/webhook", async (req, res) => {
  try {
    const body = req.body;
    console.log("FULL BODY:", JSON.stringify(body, null, 2));

    // Check if this is a real message
    if (
      body.object &&
      body.entry &&
      body.entry[0].changes &&
      body.entry[0].changes[0].value.messages &&
      body.entry[0].changes[0].value.messages[0]
    ) {
      const message = body.entry[0].changes[0].value.messages[0];
      const senderNumber = message.from;
      const messageText = message.text ? message.text.body : "";

      console.log("Message from " + senderNumber + ": " + messageText);

      // Decide what to reply
      let replyText = getReply(messageText);

      // Send the reply
      await sendMessage(senderNumber, replyText);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Error:", error);
    res.sendStatus(200);
  }
});

// Simple chatbot logic - customize this however you want
function getReply(messageText) {
  const text = messageText.toLowerCase();

  if (text === "hi" || text === "hello" || text === "hey") {
    return "Hey there! Welcome. How can I help you today?";
  } else if (text === "help") {
    return "Here are things I can help with:\n1. Business hours\n2. Pricing\n3. Contact info\n\nJust type what you need!";
  } else if (text === "hours" || text === "business hours") {
    return "We are open Monday to Friday, 9 AM to 6 PM.";
  } else if (text === "pricing" || text === "price") {
    return "Our plans start at $10/month. Want more details?";
  } else if (text === "contact") {
    return "You can email us at hello@yourbusiness.com";
  } else {
    return "Thanks for your message! I didn't quite understand that. Type 'help' to see what I can do.";
  }
}

// Function that sends a message via WhatsApp API
async function sendMessage(to, text) {
  const url = "https://graph.facebook.com/v21.0/" + PHONE_NUMBER_ID + "/messages";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + WHATSAPP_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: to,
      type: "text",
      text: { body: text },
    }),
  });

  const data = await response.json();
  console.log("Reply sent:", JSON.stringify(data));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
