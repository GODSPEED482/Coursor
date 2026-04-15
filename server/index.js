require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const sessionManager = require('./utils/sessionManager');
const rabbitMQManager = require('./utils/rabbitmq');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routers/auth.route.js'));
app.use('/api/courses', require('./routers/course.route.js'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    const sessionId = sessionManager.addSession(ws);
    console.log(`[Server] Client connected. Assigned session ID: ${sessionId}`);

    // Send a welcome / initialization message
    ws.send(JSON.stringify({ type: 'connected', sessionId: sessionId }));

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log(`[Server] Received from ${sessionId}:`, data);

            switch (data.action) {
                case 'start_course':
                    if (data.text) {
                        await rabbitMQManager.sendToInitializer(sessionId, data.text);
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'Missing "text" field in start_course request' }));
                    }
                    break;
                case 'answer_questions':
                    if (data.course_details && data.unspecified_properties && Array.isArray(data.user_responses)) {
                        await rabbitMQManager.sendAnswersToFinalizer(
                            sessionId,
                            data.course_details,
                            data.unspecified_properties,
                            data.user_responses
                        );
                    } else {
                        ws.send(JSON.stringify({ type: 'error', message: 'Invalid payload for answer_questions' }));
                    }
                    break;
                default:
                    ws.send(JSON.stringify({ type: 'error', message: `Unknown action: ${data.action}` }));
            }
        } catch (err) {
            console.error(`[Server] Error processing message from session ${sessionId}:`, err);
            ws.send(JSON.stringify({ type: 'error', message: 'Invalid JSON payload format.' }));
        }
    });

    ws.on('close', () => {
        console.log(`[Server] Connection closed for session ${sessionId}`);
    });
});

const PORT = process.env.PORT || 8080;

async function bootstrap() {
    try {
        await connectDB();
        await rabbitMQManager.init();
        server.listen(PORT, () => {
            console.log(`[Server] WebSocket & HTTP Server listening on port ${PORT}`);
        });
    } catch (err) {
        console.error('[Server] Failed to initialize RabbitMQ connection:', err);
        process.exit(1);
    }
}

bootstrap();
