import "dotenv/config";
import express from "express";
import { groqService } from "./services/groq";
import { cerebrasService } from "./services/cerebras";
import type { AIService, ChatMessage } from "./types";

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());

const services: AIService[] = [groqService, cerebrasService];
let currentServiceIndex = 0;

function getNextService() {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}

app.post("/chat", async (req, res) => {
    try {
        const { messages } = req.body as { messages: ChatMessage[] };
        const service = getNextService();
        const stream = await service?.chat(messages);

        console.log(`Using service: ${service?.name}`);

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        for await (const chunk of stream) {
            res.write(chunk);
        }

        res.end();
    } catch (error) {
        console.error("Error handling /chat request:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
