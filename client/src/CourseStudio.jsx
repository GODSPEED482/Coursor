import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Send, Terminal, BookOpen, Loader, CheckCircle } from 'lucide-react';
import { styles } from './CourseStudio.styles';

export default function CourseStudio() {
    const location = useLocation();
    const navigate = useNavigate();
    const { initialPrompt, savedCourse } = location.state || {};

    const { id: urlSessionId } = useParams();
    const [ws, setWs] = useState(null);
    const [sessionId, setSessionId] = useState(urlSessionId);
    
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
        if (!initialPrompt && !savedCourse && !urlSessionId) {
            navigate('/');
            return;
        }

        if (savedCourse) {
            setCoursePlan(savedCourse.coursePlan);
            setSkillsMap(savedCourse.skillsMap);
            setLogs([{ type: 'client', status: `Viewing saved course: ${savedCourse.title}` }]);
            
            // Re-calculate stats
            let total = 0;
            const countSkills = (planObj) => {
                if(!planObj || !planObj.sections) return 0;
                let c = 0;
                planObj.sections.forEach(s => {
                    c += (s.skills ? s.skills.length : 0);
                });
                return c;
            };
            total += countSkills(savedCourse.coursePlan.course_plan);
            total += countSkills(savedCourse.coursePlan.prerequisite_plan);
            setStats({ totalSkills: total, generatedSkills: total });
            return;
        }

        const wsUrl = import.meta.env.VITE_BACKEND_URL.replace(/^http/, 'ws');
        const socket = new WebSocket(wsUrl);
        
        socket.onopen = () => {
            console.log("Connected to server. Initializing session...");
            socket.send(JSON.stringify({
                action: 'init_session',
                sessionId: urlSessionId
            }));
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

    // Determine completion (Only for new generations)
    useEffect(() => {
        if (!initialPrompt) return; // Don't trigger for saved courses
        if (stats.totalSkills > 0 && stats.generatedSkills >= stats.totalSkills) {
            console.log("All skills generated. Closing socket.");
            if (ws) {
                ws.close();
            }

            // Save finalized course to DB
            const token = localStorage.getItem('token');
            if (token && coursePlan && Object.keys(skillsMap).length > 0) {
                fetch(`${import.meta.env.VITE_BACKEND_URL}/api/courses`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title: coursePlan?.course_plan?.name || Object.values(skillsMap)[0]?.name || 'My Generated Course',
                        coursePlan: coursePlan,
                        skillsMap: skillsMap,
                        sessionId: urlSessionId
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
            
            // Only initiate a new course generation if we have an initialPrompt
            // and we haven't received a plan yet (prevents double start on reload)
            if (initialPrompt && !coursePlan) {
                console.log("Initiating new course pipeline...");
                socket.send(JSON.stringify({
                    action: 'start_course',
                    text: initialPrompt
                }));
            } else if (!initialPrompt && !coursePlan) {
                console.log("Reconnected. Waiting for state or requesting course data...");
                // In a true "reconnect", we might send a 'get_state' action here.
                // For now, if the pipeline is still active, RabbitMQ messages will start arriving.
                // If the course is finished, the server's Redundancy Check will send the plan.
                socket.send(JSON.stringify({
                    action: 'start_course',
                    text: 'RECONNECT' // The server start_course logic handles existed courses
                }));
            }
        }        else if (payload.type === 'log') {
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
        else if (payload.type === 'rehydrate') {
            const { coursePlan, skillsMap } = payload.data;
            setCoursePlan(coursePlan);
            setSkillsMap(skillsMap);
            
            // Re-calculate stats
            let total = 0;
            const countSkills = (planObj) => {
                if(!planObj || !planObj.sections) return 0;
                let c = 0;
                planObj.sections.forEach(s => {
                    c += (s.skills ? s.skills.length : 0);
                });
                return c;
            };
            total += countSkills(coursePlan.course_plan);
            total += countSkills(coursePlan.prerequisite_plan);
            setStats({ totalSkills: total, generatedSkills: Object.keys(skillsMap).length });
            setLogs(prev => [...prev, { type: 'client', status: `Successfully rehydrated course session.` }]);
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
                <div style={styles.gatheringBlueprint}>
                    {/* Add basic spin animation in index.css for rotation */}
                    <Loader size={16} style={styles.loaderInline} /> Gathering Blueprint...
                </div>
            );
        }

        const renderPlanSections = (planObj, isMain) => {
            if (!planObj || !planObj.sections) return null;
            return planObj.sections.map((sec, dayNo) => (
                <div key={`${isMain ? 'main' : 'pre'}-day-${dayNo}`} style={{marginBottom: '16px'}}>
                    <h4 style={styles.roadmapDayHeading(isMain)}>Day {dayNo+1}: {sec.title}</h4>
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
                                <span style={styles.roadmapItemIcon}>
                                    {isGen ? <CheckCircle size={14} color="var(--success)"/> : <Loader size={12} color="var(--text-secondary)" style={styles.loaderInline}/>}
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
                <h3 style={styles.roadmapHeader}><BookOpen size={18}/> Course Roadmap</h3>
                <div style={styles.roadmapProgress}>
                    Progress: {stats.generatedSkills} / {stats.totalSkills} Skills
                    {stats.totalSkills > 0 && stats.generatedSkills >= stats.totalSkills && (
                        <span style={styles.roadmapComplete}>- Complete!</span>
                    )}
                </div>
                {coursePlan.prerequisite_plan && coursePlan.prerequisite_plan.sections.length > 0 && (
                    <div style={styles.roadmapPreReqContainer}>
                        <h4 style={styles.roadmapPreReqTitle}>Prerequisites</h4>
                        {renderPlanSections(coursePlan.prerequisite_plan, false)}
                    </div>
                )}
                <div>
                   <h4 style={styles.roadmapCurriculumTitle}>Main Curriculum</h4>
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
            return <div style={styles.mainContentPlaceholder}>Select a skill from the roadmap to view contents...</div>;
        }
        
        const skillData = skillsMap[activeSkillId];
        if (!skillData) {
            return (
                <div style={styles.mainContentLoading}>
                    <Loader size={32} style={styles.loaderInline} />
                    <p>Generating AI Content for this skill...</p>
                </div>
            );
        }

        return (
            <div>
                <h1 style={styles.mainTitle}>{skillData.name}</h1>
                {skillData.introduction && (
                    <p style={styles.mainIntro}>{skillData.introduction}</p>
                )}
                
                {skillData.body && skillData.body.map((para, idx) => {
                    if (para.content_type === 'bullet' && para.bullet) {
                        return (
                            <div key={idx} className="glass-panel" style={styles.bulletContainer}>
                                <h3 style={styles.bulletTitle}>{para.bullet.title}</h3>
                                <ul style={styles.bulletPointers}>
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
                            <div key={idx} className="glass-panel" style={styles.tableContainer}>
                                <h3 style={styles.tableTitle}>{para.table.title}</h3>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {para.table.header?.values?.map((v, i) => <th key={i} style={styles.tableHeaderCell}>{v}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {para.table.body?.map((row, i) => (
                                            <tr key={i}>
                                                {row.values?.map((v, j) => <td key={j} style={styles.tableBodyCell}>{v}</td>)}
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
                            <div key={idx} className="glass-panel" style={styles.videoContainer}>
                                <h3 style={styles.videoTitle}>Video Resource: {para.video.title}</h3>
                                {embedUrl ? (
                                    <div style={styles.videoIframeWrapper}>
                                        <iframe 
                                            src={embedUrl}
                                            style={styles.videoIframe}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                            allowFullScreen
                                            title={para.video.title}
                                        />
                                    </div>
                                ) : (
                                    <p style={styles.videoFallback}>
                                        <a href={para.video.url} target="_blank" rel="noreferrer" style={styles.videoLink}>Watch on YouTube</a>
                                    </p>
                                )}
                            </div>
                        )
                    }
                    return null;
                })}

                {skillData.conclusion && (
                    <div className="glass-panel" style={styles.conclusionContainer}>
                        <h3 style={styles.conclusionTitle}>Conclusion</h3>
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
                <div className="copilot-panel" style={styles.copilotHeaderContainer}>
                    <div style={styles.copilotScrollArea}>
                        <h3 style={styles.copilotTitle}><Sparkles size={18} color="var(--accent-color)"/> Copilot</h3>
                        
                        {!questionData && !coursePlan && (
                            <p style={styles.copilotAnalysing}>
                                Analyzing prompt and orchestrating course blueprint...
                            </p>
                        )}
                        {!questionData && coursePlan && (
                            <p style={styles.copilotApproved}>
                                Blueprint Approved. Questioning phase locked.
                            </p>
                        )}
                        
                        {questionData && questionData.questions && questionData.questions.map((q, idx) => (
                            <div key={idx} style={styles.questionCard}>
                                <p style={styles.questionText}>{q.clarification_question}</p>
                                <textarea 
                                    className="input-field" 
                                    style={styles.questionInput} 
                                    rows={2}
                                    placeholder="Your answer..."
                                    value={answerFields[idx] || ""}
                                    onChange={(e) => setAnswerFields({...answerFields, [idx]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>
                    <div style={styles.submitBtnWrapper}>
                        <button 
                            className="btn-primary" 
                            style={styles.submitBtn}
                            disabled={!questionData}
                            onClick={submitAnswers}
                        >
                            <Send size={16} /> Send Answers
                        </button>
                    </div>
                </div>

                {/* Log Stream */}
                <div className="copilot-panel">
                    <div style={styles.logFeedHeader}>
                         <h3 style={styles.logFeedTitle}><Terminal size={16}/> Pipeline Feed</h3>
                    </div>
                    <div style={styles.logFeedBody}>
                        {logs.map((L, i) => (
                            <div key={i} className="log-entry">
                                <span className="log-status-info">[{L.type}]</span>
                                <span>{subjectiveLogs[L.status] || L.status}</span>
                                {L.identifier && <span style={styles.logIdentifier}>(Day {L.identifier.day_no + 1}, Skill {L.identifier.skill_no + 1})</span>}
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
