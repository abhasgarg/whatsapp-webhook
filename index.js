const express = require("express");
const app = express();
app.use(express.json());

const VERIFY_TOKEN = "my_secret_token_123";

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

app.post("/webhook", (req, res) => {
  console.log("Received message:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
```

5. Click **Commit changes**
6. Delete the old `index.js` if there's a duplicate

Wait for Railway to redeploy, then try the browser test again:
```
https://your-domain.up.railway.app/webhook?hub.mode=subscribe&hub.verify_token=my_secret_token_123&hub.challenge=test123
