const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');
let mySessionId = null;

ws.on('open', () => {
    console.log('[Test Client] Connected to server.');
});

ws.on('message', (data) => {
    const payload = JSON.parse(data.toString());
    
    if (payload.type === 'connected') {
        mySessionId = payload.sessionId;
        console.log(`[Test Client] Connection verified! My Session ID is: ${mySessionId}`);
        console.log(`[Test Client] Sending request to start a course...`);
        
        ws.send(JSON.stringify({
            action: 'start_course',
            text: 'I want to build a course on basic Python programming.'
        }));
    } else if (payload.type === 'log') {
        console.log(`[LOG] ->`, payload.data.type, payload.data.status);
    } else if (payload.type === 'question') {
        console.log(`\n[QUESTION RECEIVED]\n`, JSON.stringify(payload.data, null, 2));
        
        // Answer the questions
        if (payload.data.questions && payload.data.questions.length > 0) {
            console.log(`[Test Client] Simulating an answer for the questions in 3 seconds...`);
            
            setTimeout(() => {
                const unspecified_properties = [];
                const user_responses = [];
                
                for (let q of payload.data.questions) {
                    unspecified_properties.push(q.unspecified_property);
                    user_responses.push("Simulation Answer: It should be for beginners.");
                }
                
                ws.send(JSON.stringify({
                    action: 'answer_questions',
                    course_details: payload.data.course_details,
                    unspecified_properties: unspecified_properties,
                    user_responses: user_responses
                }));
            }, 3000);
        }

    } else if (payload.type === 'response') {
        console.log(`\n[FINAL RESPONSE RECEIVED]\n`, JSON.stringify(payload.data, null, 2));
    } else if (payload.type === 'error') {
        console.error(`\n[ERROR RECEIVED]\n`, payload.message);
    }
});

ws.on('close', () => {
    console.log('[Test Client] Disconnected from server.');
});
