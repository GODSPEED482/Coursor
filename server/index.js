require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const WebSocket = require('ws');
const sessionManager = require('./utils/sessionManager');
const rabbitMQManager = require('./utils/rabbitmq');
const connectDB = require('./config/db');
const Course = require('./models/course.model');

const app = express();
app.use(cors({
  origin: '*',
  methods: '*',
  allowedHeaders: '*'
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', require('./routers/auth.route.js'));
app.use('/api/courses', require('./routers/course.route.js'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    let sessionId = null;
    console.log(`[Server] New client connection attempt...`);

    ws.on('message', async (message, isBinary) => {
        try {
            const messageString = isBinary ? message : message.toString();
            const data = JSON.parse(messageString);
            
            // Handle initialization/handshake
            if (data.action === 'init_session') {
                sessionId = data.sessionId;
                sessionManager.addSession(ws, sessionId);
                console.log(`[Server] Client joined/reconnected with session ID: ${sessionId}`);
                ws.send(JSON.stringify({ type: 'connected', sessionId: sessionId }));
                return;
            }

            if (!sessionId) {
                console.warn(`[Server] Missing session ID for message: ${messageString.substring(0, 100)}`);
                ws.send(JSON.stringify({ type: 'error', message: 'Session not initialized. Send init_session first.' }));
                return;
            }

            console.log(`[Server] Received from ${sessionId}:`, data);

            switch (data.action) {
                case 'start_course':
                    if (data.text) {
                        // Check if course already exists or is in progress
                        const existingCourse = await Course.findById(sessionId);
                        if (existingCourse) {
                            console.log(`[Server] Course ${sessionId} already exists in DB. Rehydrating client.`);
                            ws.send(JSON.stringify({ 
                                type: 'rehydrate', 
                                data: {
                                    coursePlan: existingCourse.coursePlan,
                                    skillsMap: existingCourse.skillsMap,
                                    title: existingCourse.title
                                } 
                            }));
                            return;
                        }

                        if (data.text !== 'RECONNECT') {
                            await rabbitMQManager.sendToInitializer(sessionId, data.text);
                        } else {
                             console.log(`[Server] Session ${sessionId} reconnected. Pipeline already in progress.`);
                        }
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
            ws.send(JSON.stringify({ type: 'error', message: `Invalid JSON payload format: ${err.message}` }));
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
