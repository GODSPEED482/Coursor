import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUp, History, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import { styles } from './Landing.styles';

export default function Landing() {
  const [prompt, setPrompt] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
     fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/courses`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            setHistory(data);
        }
    } catch (err) {
        console.error('Failed to fetch history:', err);
    } finally {
        setLoadingHistory(false);
    }
  };

  const handleStart = () => {
    if (prompt.trim().length > 5) {
      const sessionId = crypto.randomUUID();
      navigate(`/studio/${sessionId}`, { state: { initialPrompt: prompt } });
    }
  };

  const handleLoadSaved = (course) => {
    navigate(`/studio/${course._id}`, { state: { savedCourse: course } });
  };

  return (
    <div style={styles.landingLayout} className="landing-page">
      {/* App Branding (Top Left) */}
      <div className="app-branding">
        <Sparkles className="app-logo" size={28} />
        <span className="app-name">Coursor AI</span>
      </div>

      {/* Toggle Button */}
      <button 
        style={styles.toggleButton(isHistoryOpen)} 
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        title={isHistoryOpen ? "Close History" : "Open History"}
      >
        {isHistoryOpen ? <ChevronLeft size={20} /> : <History size={20} />}
      </button>

      {/* Poppable Side Panel - History */}
      <div style={styles.sidebar(isHistoryOpen)}>
        <div style={styles.sidebarHeader}>
           <h2 style={styles.sidebarTitle}><History size={18} color="var(--accent-color)"/> Course History</h2>
        </div>
        
        <div style={styles.historyContainer}>
            {loadingHistory ? (
                <div style={styles.emptyState}>Loading history...</div>
            ) : history.length === 0 ? (
                <div style={styles.emptyState}>
                    <Clock size={32} style={{marginBottom: '8px'}}/>
                    <p>No courses found from the past 10 months.</p>
                </div>
            ) : (
                history.map((course) => (
                    <div 
                        key={course._id} 
                        style={styles.historyItem}
                        onClick={() => handleLoadSaved(course)}
                        onMouseEnter={(e) => {
                            Object.assign(e.currentTarget.style, styles.historyItemHover);
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = styles.historyItem.background;
                            e.currentTarget.style.borderColor = styles.historyItem.borderColor;
                            e.currentTarget.style.transform = 'none';
                        }}
                    >
                        <span style={styles.courseTitle}>{course.title}</span>
                        <span style={styles.courseDate}>
                            {new Date(course.createdAt).toLocaleDateString(undefined, { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Main Content (Center) */}
      <div style={styles.mainContent}>
        <div className="prompt-box">
          <h1 className="landing-title">
            What course would you like to build?
          </h1>
          <div className="pill-input-container">
            <input
              type="text"
              className="pill-input"
              placeholder="e.g. Build me a course on Operating Systems."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleStart();
                }
              }}
            />
            <button 
              className="send-btn" 
              disabled={prompt.trim().length <= 5}
              onClick={handleStart}
            >
              <ArrowUp size={20} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
