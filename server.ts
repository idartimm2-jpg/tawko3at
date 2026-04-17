import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "settings.json");

const defaultSettings = {
  logoUrl: "https://picsum.photos/seed/gift/150/150",
  fbLink: "https://facebook.com",
  googleWebhookUrl: "",
  headlineText1: "شارك معنا ",
  headlineText2: "واكسب جوائز قيمة!",
  guessLabel: "توقع اسم المحل و سيبله التوقع 🎯",
  phoneLabel: "اكتب رقم فونك علشان لو كسبت 📱",
  buttonText: "اضغط هنا واعمل فولو واكسب",
};

// Initialize settings file if it doesn't exist
if (!fs.existsSync(SETTINGS_FILE)) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/submit", async (req, res) => {
    const { guess, phone } = req.body;
    
    if (!guess || !phone) {
      return res.status(400).json({ error: "Missing data" });
    }

    try {
      // 1. Save locally to a text file
      const logLine = `[${new Date().toISOString()}] التوقع: ${guess} | الهاتف: ${phone}\n`;
      fs.appendFileSync(path.join(process.cwd(), "submissions.txt"), logLine);

      // 2. Fetch current settings
      let currentSettings = defaultSettings;
      if (fs.existsSync(SETTINGS_FILE)) {
        currentSettings = { ...defaultSettings, ...JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8")) };
      }

      // 3. Send to Google Webhook if available
      if (currentSettings.googleWebhookUrl) {
        try {
          await fetch(currentSettings.googleWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guess, phone, date: new Date().toISOString() })
          });
        } catch (webhookErr) {
          console.error("Failed to send to Google Webhook:", webhookErr);
        }
      }

      res.json({ success: true });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Failed to process submission" });
    }
  });

  app.get("/api/submissions", (req, res) => {
    const { password } = req.query;
    if (password !== "130199") {
      return res.status(401).send("Unauthorized");
    }

    const submissionsFile = path.join(process.cwd(), "submissions.txt");
    if (fs.existsSync(submissionsFile)) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.sendFile(submissionsFile);
    } else {
      res.send("لا توجد أي توقعات بعد.");
    }
  });

  app.get("/api/settings", (req, res) => {
    try {
      const data = fs.readFileSync(SETTINGS_FILE, "utf-8");
      const savedSettings = JSON.parse(data);
      res.json({ ...defaultSettings, ...savedSettings });
    } catch (e) {
      res.json(defaultSettings);
    }
  });

  app.post("/api/settings", (req, res) => {
    const { password, settings } = req.body;
    
    if (password !== "130199") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    try {
      let currentSettings = defaultSettings;
      if (fs.existsSync(SETTINGS_FILE)) {
        currentSettings = JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf-8"));
      }
      
      const newSettings = { ...currentSettings, ...settings };
      fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2));
      res.json({ success: true, settings: newSettings });
    } catch (e) {
      res.status(500).json({ error: "Failed to save settings" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Support React Router fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
