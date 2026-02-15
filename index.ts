import { groqService } from "./services/groq";
import type { AIService, ChatMessage } from "./types";

const services: AIService[] = [groqService];
let currentServiceIndex = 0;

function getNextService() {
    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;
    return service;
}

const server = Bun.serve({
    port: process.env.PORT ?? 3000,
    async fetch(request) {
        const { pathname } = new URL(request.url);

        if (request.method === "POST" && pathname === "/chat") {
            try {
                const { messages } = (await request.json()) as { messages: ChatMessage[] };
                const service = getNextService();
                const stream = await service?.chat(messages);
                return new Response(stream, {
                    headers: {
                        "Content-Type": "text/event-stream",
                        "Cache-Control": "no-cache",
                        Connection: "keep-alive",
                    },
                });
            } catch (error) {
                console.error("Error handling /chat request:", error);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server running at http://localhost:${server.port}`);
