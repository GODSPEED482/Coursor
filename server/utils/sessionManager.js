const { v4: uuidv4 } = require('uuid');

class SessionManager {
    constructor() {
        this.sessions = new Map();
    }

    addSession(ws) {
        const sessionId = uuidv4();
        this.sessions.set(sessionId, ws);
        
        ws.on('close', () => {
            this.removeSession(sessionId);
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
