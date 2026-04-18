const { v4: uuidv4 } = require('uuid');

class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    addSession(ws, providedSessionId = null) {
        const sessionId = providedSessionId || uuidv4();
        this.sessions.set(sessionId, ws);
        
        ws.on('close', () => {
            console.log(`[SessionManager] WebSocket closed for ${sessionId}. Keeping session mapping for potential reconnection.`);
            // Note: We don't remove it immediately to allow RabbitMQ responses to "wait" 
            // or we can remove it but the messages will be dropped.
            // For now, let's keep the user's request: "Once complete, save against session_id"
        });

        // Optionally, an error handler
        ws.on('error', (err) => {
            console.error(`[Session ${sessionId}] WebSocket error:`, err);
            this.removeSession(sessionId);
        });

        return sessionId;
    }

    removeSession(sessionId) {
        if (this.sessions.has(sessionId)) {
            console.log(`[SessionManager] Removing session ${sessionId}`);
            this.sessions.delete(sessionId);
        }
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    sendToSession(sessionId, payload) {
        const ws = this.getSession(sessionId);
        if (ws && ws.readyState === 1) { // 1 means OPEN
            ws.send(JSON.stringify(payload));
            return true;
        }
        return false;
    }
}

module.exports = new SessionManager();
