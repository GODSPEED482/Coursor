const amqp = require('amqplib');
const sessionManager = require('./sessionManager');

class RabbitMQManager {
    constructor() {
        this.connection = null;
        this.channel = null;
        this.logChannel = null;
        this.replyQueue = 'server_reply_queue';
        this.logQueue = 'server_log_queue';
    }

    async init() {
        this.connection = await amqp.connect('amqp://localhost');
        this.channel = await this.connection.createChannel();
        this.logChannel = await this.connection.createChannel();

        // Declare our central queues
        await this.channel.assertQueue(this.replyQueue, { durable: false, autoDelete: true });
        await this.logChannel.assertQueue(this.logQueue, { durable: false, autoDelete: true });

        // Declare queues we need to publish to
        await this.channel.assertQueue('course_details_initializer_queue', { durable: false });
        await this.channel.assertQueue('course_details_finalizer_queue', { durable: false });
        await this.channel.assertQueue('course_planner_queue', { durable: false });

        // Set up consumers
        this.channel.consume(this.replyQueue, (msg) => this.onResponse(msg), { noAck: true });
        this.logChannel.consume(this.logQueue, (msg) => this.onLog(msg), { noAck: true });

        console.log('[RabbitMQManager] Initialized central reply/log queues.');
    }

    onResponse(msg) {
        if (!msg) return;
        const sessionId = msg.properties.messageId;
        const bodyContent = msg.content.toString();
        
        let payload;
        try {
            payload = JSON.parse(bodyContent);
        } catch (e) {
            payload = { data: bodyContent };
        }

        const isQuestion = msg.properties.headers && msg.properties.headers['content_type'] === 'question';
        const contentType = msg.properties.headers && msg.properties.headers['content_type'] ? msg.properties.headers['content_type'] : (isQuestion ? 'question' : 'response');
        
        const delivered = sessionManager.sendToSession(sessionId, {
            type: contentType,
            data: payload,
            headers: msg.properties.headers || {}
        });

        if (!delivered) {
            console.warn(`[RabbitMQManager] Dropped response for unknown or closed session: ${sessionId}`);
        }
    }

    onLog(msg) {
        if (!msg) return;
        const sessionId = msg.properties.messageId;
        const bodyContent = msg.content.toString();

        let payload;
        try {
            payload = JSON.parse(bodyContent);
        } catch (e) {
            payload = { log: bodyContent };
        }

        const delivered = sessionManager.sendToSession(sessionId, {
            type: 'log',
            data: payload
        });
    }

    async sendToInitializer(sessionId, text) {
        const payload = JSON.stringify({ text });
        
        const ok = this.channel.sendToQueue('course_details_initializer_queue', Buffer.from(payload), {
            messageId: sessionId,
            replyTo: this.replyQueue,
            headers: {
                log_to: this.logQueue
            }
        });
        
        console.log(`[RabbitMQManager] Session ${sessionId} sent request to initializer. OK=${ok}`);
    }

    async sendAnswersToFinalizer(sessionId, courseDetails, unspecifiedProperties, userResponses) {
        const payload = JSON.stringify({
            course_details: courseDetails,
            unspecified_properties: unspecifiedProperties,
            user_responses: userResponses
        });
        
        // Finalizer preserves message properties it receives, so we send our properties
        const ok = this.channel.sendToQueue('course_details_finalizer_queue', Buffer.from(payload), {
            messageId: sessionId,
            replyTo: this.replyQueue,
            headers: {
                log_to: this.logQueue
            }
        });
        
        console.log(`[RabbitMQManager] Session ${sessionId} sent answers to finalizer. OK=${ok}`);
    }
}

module.exports = new RabbitMQManager();
