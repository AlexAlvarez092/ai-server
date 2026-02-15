const server = Bun.serve({
    port: process.env.PORT || 3000,
    async fetch(request) {
        return new Response("Hello World");
    },
});

console.log(`Server running at http://localhost:${server.port}`);
