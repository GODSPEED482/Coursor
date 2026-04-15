import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowUp } from 'lucide-react';

export default function Landing() {
  const [prompt, setPrompt] = useState('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (prompt.trim().length > 5) {
      navigate('/studio', { state: { initialPrompt: prompt } });
    }
  };

  return (
    <div className="landing-page">
      <div className="app-branding">
        <Sparkles className="app-logo" size={28} />
        <span className="app-name">Coursor AI</span>
      </div>
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
  );
}
