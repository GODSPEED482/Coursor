import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Terminal, BookOpen, Loader, CheckCircle } from 'lucide-react';

export default function CourseStudio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialPrompt } = location.state || {};

    const [ws, setWs] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    
    // Core Data States
    const [logs, setLogs] = useState([]);
    const [questionData, setQuestionData] = useState(null);
    const [answerFields, setAnswerFields] = useState({});
    
    const [coursePlan, setCoursePlan] = useState(null);
    const [skillsMap, setSkillsMap] = useState({}); // key: "day_no-skill_no-type" -> skill data
    const [activeSkillId, setActiveSkillId] = useState(null);

    const [stats, setStats] = useState({ totalSkills: 0, generatedSkills: 0 });
    const logEndRef = useRef(null);

    // Subjective Log Mapper
    const subjectiveLogs = {
        'course_details_init': 'Analyzing user requirements and initiating parameters...',
        'course_details_fin': 'Course parameters perfectly finalized.',
        'cp_gen': 'Course syllabus and blueprint successfully generated.',
        'skill_queued': 'Module queued for AI content generation.',
        'skill_gen_init': 'Agents actively drafting new content...',
        'skill_gen_fin': 'Drafting complete! Module loaded onto roadmap.'
    };

    // Initial WebSocket Connection
    useEffect(() => {
        if (!initialPrompt) {
            navigate('/');
            return;
        }

        const socket = new WebSocket('ws://localhost:8080');
        
        socket.onopen = () => {
            console.log("Connected to server...");
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            handleMessage(socket, data);
        };

        setWs(socket);

        return () => socket.close();
    }, [initialPrompt]);

    // Auto-scroll logs
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Determine completion
    useEffect(() => {
        if (stats.totalSkills > 0 && stats.generatedSkills >= stats.totalSkills) {
            console.log("All skills generated. Closing socket.");
            if (ws) {
                ws.close();
            }

            // Save finalized course to DB
            const token = localStorage.getItem('token');
            if (token && coursePlan && Object.keys(skillsMap).length > 0) {
                fetch('http://localhost:8080/api/courses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: coursePlan?.course_plan?.name || Object.values(skillsMap)[0]?.name || 'My Generated Course',
                        coursePlan: coursePlan,
                        skillsMap: skillsMap
                    })
                })
                .then(res => res.json())
                .then(data => {
                    setLogs(prev => [...prev, { type: 'client', status: 'Course saved successfully to your account vault!'}]);
                })
                .catch(err => console.error('Database Sync Error:', err));
            }
        }
    }, [stats.generatedSkills, stats.totalSkills, ws, coursePlan, skillsMap]);

    const handleMessage = (socket, payload) => {
        if (payload.type === 'connected') {
            setSessionId(payload.sessionId);
            // Initiate the course pipeline
            socket.send(JSON.stringify({
                action: 'start_course',
                text: initialPrompt
            }));
        } 
        else if (payload.type === 'log') {
            setLogs(prev => [...prev, payload.data]);
        }
        else if (payload.type === 'question') {
            const questions = payload.data.questions || [];
            
            if (questions.length === 0) {
                socket.send(JSON.stringify({
                    action: 'answer_questions',
                    course_details: payload.data.course_details,
                    unspecified_properties: [],
                    user_responses: []
                }));
                setLogs(prev => [...prev, { type: 'client', status: 'No clarification needed. Yielding to finalization...'}]);
            } else {
                setQuestionData(payload.data);
                const initialAnswers = {};
                questions.forEach((q, idx) => {
                    initialAnswers[idx] = "";
                });
                setAnswerFields(initialAnswers);
            }
        }
        else if (payload.type === 'plan') {
            setCoursePlan(payload.data);
            setQuestionData(null); // questioning is over
            
            // Calculate total skills
            let total = 0;
            const countSkills = (planObj) => {
                if(!planObj || !planObj.sections) return 0;
                let c = 0;
                planObj.sections.forEach(s => {
                    c += (s.skills ? s.skills.length : 0);
                });
                return c;
            };
            total += countSkills(payload.data.course_plan);
            total += countSkills(payload.data.prerequisite_plan);
            setStats(prev => ({ ...prev, totalSkills: total }));
        }
        else if (payload.type === 'skill') {
            const h = payload.headers || {};
            const key = `${h.day_no}-${h.skill_no}-${h.is_main_content ? 'main' : 'pre'}`;
            setSkillsMap(prev => {
                // If we already received it, avoid redundant increments (though duplicate delivery shouldn't happen)
                if (prev[key]) return prev;
                setStats(currStats => ({ ...currStats, generatedSkills: currStats.generatedSkills + 1 }));
                return { ...prev, [key]: payload.data };
            });
            
            setActiveSkillId(cur => cur ? cur : key);
        }
        else if (payload.type === 'error') {
            setLogs(prev => [...prev, { type: 'error', status: payload.message }]);
        }
    };

    const submitAnswers = () => {
        if (!ws || !questionData) return;
        
        const unspecified_properties = [];
        const user_responses = [];

        questionData.questions.forEach((q, idx) => {
            unspecified_properties.push(q.unspecified_property);
            user_responses.push(answerFields[idx] || "N/A");
        });

        ws.send(JSON.stringify({
            action: 'answer_questions',
            course_details: questionData.course_details,
            unspecified_properties,
            user_responses
        }));

        setQuestionData(null); 
        setLogs(prev => [...prev, { type: 'client', status: 'Answers dispatched to agent.'}]);
    };

    const renderRoadmap = () => {
        if (!coursePlan) {
            return (
                <div style={{color: 'var(--text-secondary)', display: 'flex', alignItems:'center', gap: '8px'}}>
                    {/* Add basic spin animation in index.css for rotation */}
                    <Loader size={16} style={{animation: 'spin 2s linear infinite'}} /> Gathering Blueprint...
                </div>
            );
        }

        const renderPlanSections = (planObj, isMain) => {
            if (!planObj || !planObj.sections) return null;
            return planObj.sections.map((sec, dayNo) => (
                <div key={`${isMain ? 'main' : 'pre'}-day-${dayNo}`} style={{marginBottom: '16px'}}>
                    <h4 style={{fontSize:'0.9rem', color: isMain? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: '8px'}}>Day {dayNo+1}: {sec.title}</h4>
                    {(sec.skills || []).map((sk, skillNo) => {
                        const sKey = `${dayNo}-${skillNo}-${isMain ? 'main' : 'pre'}`;
                        const isGen = !!skillsMap[sKey];
                        const isActive = activeSkillId === sKey;
                        return (
                            <div 
                                key={sKey} 
                                className={`roadmap-item ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveSkillId(sKey)}
                            >
                                <span style={{display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem'}}>
                                    {isGen ? <CheckCircle size={14} color="var(--success)"/> : <Loader size={12} color="var(--text-secondary)" style={{animation: 'spin 2s linear infinite'}}/>}
                                    {sk.name}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ));
        };

        return (
            <>
                <h3 style={{marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px'}}><BookOpen size={18}/> Course Roadmap</h3>
                <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px'}}>
                    Progress: {stats.generatedSkills} / {stats.totalSkills} Skills
                    {stats.totalSkills > 0 && stats.generatedSkills >= stats.totalSkills && (
                        <span style={{color: 'var(--success)', marginLeft:'8px'}}>- Complete!</span>
                    )}
                </div>
                {coursePlan.prerequisite_plan && coursePlan.prerequisite_plan.sections.length > 0 && (
                    <div style={{paddingBottom: '16px', borderBottom: '1px solid var(--border-color)', marginBottom: '16px'}}>
                        <h4 style={{marginBottom:'12px', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing: '1px', color:'var(--warning)'}}>Prerequisites</h4>
                        {renderPlanSections(coursePlan.prerequisite_plan, false)}
                    </div>
                )}
                <div>
                   <h4 style={{marginBottom:'12px', fontSize:'0.9rem', textTransform:'uppercase', letterSpacing: '1px', color:'var(--accent-color)'}}>Main Curriculum</h4>
                    {renderPlanSections(coursePlan.course_plan, true)}
                </div>
            </>
        );
    };

    const extractYouTubeEmbedUrl = (url) => {
        if (!url) return '';
        try {
            let videoId = '';
            if (url.includes('youtube.com/watch')) {
                const urlObj = new URL(url);
                videoId = urlObj.searchParams.get('v');
            } else if (url.includes('youtu.be/')) {
                videoId = url.split('youtu.be/')[1]?.split('?')[0];
            } else if (url.includes('youtube.com/embed/')) {
                return url; // already embed
            }
            return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
        } catch(e) {
            return '';
        }
    };

    const renderMainContent = () => {
        if (!activeSkillId) {
            return <div style={{opacity: 0.5, textAlign: 'center', marginTop: '100px'}}>Select a skill from the roadmap to view contents...</div>;
        }
        
        const skillData = skillsMap[activeSkillId];
        if (!skillData) {
            return (
                <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100%', flexDirection:'column', gap:'16px', color:'var(--text-secondary)'}}>
                    <Loader size={32} style={{animation: 'spin 2s linear infinite'}} />
                    <p>Generating AI Content for this skill...</p>
                </div>
            );
        }

        return (
            <div>
                <h1 style={{fontSize:'2rem', marginBottom: '8px'}}>{skillData.name}</h1>
                {skillData.introduction && (
                    <p style={{color: 'var(--text-secondary)', marginBottom:'24px', fontSize:'1.1rem'}}>{skillData.introduction}</p>
                )}
                
                {skillData.body && skillData.body.map((para, idx) => {
                    if (para.content_type === 'bullet' && para.bullet) {
                        return (
                            <div key={idx} className="glass-panel" style={{padding:'20px', marginBottom:'24px'}}>
                                <h3 style={{marginBottom:'12px', color:'var(--accent-color)'}}>{para.bullet.title}</h3>
                                <ul style={{paddingLeft: '20px', display:'flex', flexDirection:'column', gap:'12px'}}>
                                    {para.bullet.pointers.map((pt, i) => (
                                        <li key={i}>
                                            <strong>{pt.head}:</strong> {pt.body}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    }
                    if (para.content_type === 'table' && para.table) {
                        return (
                            <div key={idx} className="glass-panel" style={{padding:'20px', marginBottom:'24px', overflowX: 'auto'}}>
                                <h3 style={{marginBottom:'12px', color:'var(--accent-color)'}}>{para.table.title}</h3>
                                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                                    <thead>
                                        <tr>
                                            {para.table.header?.values?.map((v, i) => <th key={i} style={{borderBottom:'1px solid var(--border-color)', padding:'8px'}}>{v}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {para.table.body?.map((row, i) => (
                                            <tr key={i}>
                                                {row.values?.map((v, j) => <td key={j} style={{borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'8px'}}>{v}</td>)}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    }
                    if (para.content_type === 'video' && para.video) {
                        const embedUrl = extractYouTubeEmbedUrl(para.video.url);
                        return (
                            <div key={idx} className="glass-panel" style={{padding:'20px', marginBottom:'24px'}}>
                                <h3 style={{marginBottom:'12px', color:'var(--warning)'}}>Video Resource: {para.video.title}</h3>
                                {embedUrl ? (
                                    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', maxWidth: '100%', marginBottom: '16px', borderRadius: '8px' }}>
                                        <iframe 
                                            src={embedUrl}
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            title={para.video.title}
                                        />
                                    </div>
                                ) : (
                                    <p style={{color: 'var(--text-secondary)', marginBottom: '8px'}}>
                                        <a href={para.video.url} target="_blank" rel="noreferrer" style={{color: 'var(--accent-color)'}}>Watch on YouTube</a>
                                    </p>
                                )}
                            </div>
                        )
                    }
                    return null;
                })}

                {skillData.conclusion && (
                    <div className="glass-panel" style={{padding:'20px', marginTop: '24px'}}>
                        <h3 style={{marginBottom:'12px', color:'var(--success)'}}>Conclusion</h3>
                        <p>{skillData.conclusion}</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="studio-layout">
            <div className="glass-panel roadmap-col">
                {renderRoadmap()}
            </div>

            <div className="main-col">
                {renderMainContent()}
            </div>

            <div className="glass-panel copilot-col">
                {/* Copilot Interface */}
                <div className="copilot-panel" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                    <div style={{padding:'16px', display:'flex', flexDirection:'column', gap:'16px', flex:1, overflowY:'auto'}}>
                        <h3 style={{display:'flex', alignItems:'center', gap:'8px'}}><Sparkles size={18} color="var(--accent-color)"/> Copilot</h3>
                        
                        {!questionData && !coursePlan && (
                            <p style={{color:'var(--text-secondary)', fontSize:'0.9rem', fontStyle:'italic'}}>
                                Analyzing prompt and orchestrating course blueprint...
                            </p>
                        )}
                        {!questionData && coursePlan && (
                            <p style={{color:'var(--success)', fontSize:'0.9rem'}}>
                                Blueprint Approved. Questioning phase locked.
                            </p>
                        )}
                        
                        {questionData && questionData.questions && questionData.questions.map((q, idx) => (
                            <div key={idx} style={{background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px'}}>
                                <p style={{fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600}}>{q.clarification_question}</p>
                                <textarea 
                                    className="input-field" 
                                    style={{fontSize:'0.85rem', padding:'8px'}} 
                                    rows={2}
                                    placeholder="Your answer..."
                                    value={answerFields[idx] || ""}
                                    onChange={(e) => setAnswerFields({...answerFields, [idx]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={{padding: '0 16px', marginTop: 'auto'}}>
                        <button 
                            className="btn-primary" 
                            style={{width: '100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
                            disabled={!questionData}
                            onClick={submitAnswers}
                        >
                            <Send size={16} /> Send Answers
                        </button>
                    </div>
                </div>

                {/* Log Stream */}
                <div className="copilot-panel">
                    <div style={{padding: '16px 16px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                         <h3 style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.9rem'}}><Terminal size={16}/> Pipeline Feed</h3>
                    </div>
                    <div style={{flex: 1, padding: '8px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)'}}>
                        {logs.map((L, i) => (
                            <div key={i} className="log-entry">
                                <span className="log-status-info">[{L.type}]</span>
                                <span>{subjectiveLogs[L.status] || L.status}</span>
                                {L.identifier && <span style={{marginLeft:'8px', opacity:0.5}}>(Day {L.identifier.day_no + 1}, Skill {L.identifier.skill_no + 1})</span>}
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sparkles local fallback if missing
const Sparkles = ({size, color}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>;
