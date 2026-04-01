import React from 'react';
import { getModelRecommendations, getSetupInstructions } from '../services/ollamaDetection';

const OllamaSetupModal = ({ isOpen, onClose, onRetry, detectedModels = [], ollamaIsRunning = false }) => {
  if (!isOpen) return null;

  const { recommendations } = getModelRecommendations();
  const instructions = getSetupInstructions();
  
  // Check if we're in "model not found" mode (Ollama is running but models were detected)
  const modelNotFoundMode = ollamaIsRunning && detectedModels && detectedModels.length > 0;
  const detectedModelNames = detectedModels.map(m => typeof m === 'string' ? m : m.name || '').filter(Boolean);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="ollama-setup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{modelNotFoundMode ? '⚙️ Model Configuration' : '🤖 Set Up Local AI Analysis'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-content">
          {modelNotFoundMode ? (
            <>
              {/* Model Not Found Mode */}
              <div className="info-section">
                <p className="info-text">
                  ✅ Ollama is running, but the wrong model is configured. Here's what you have installed:
                </p>
              </div>

              <div className="setup-section">
                <h3>📦 Your Installed Models</h3>
                <div className="detected-models-list">
                  {detectedModelNames.length > 0 ? (
                    detectedModelNames.map((model, idx) => (
                      <div key={idx} className="detected-model-item">
                        <span className="model-checkmark">✓</span>
                        <span className="model-name">{model}</span>
                        <button 
                          className="use-model-button"
                          title={`Use ${model} for analysis`}
                          onClick={() => {
                            // Note: In a real implementation, you'd save this choice
                            // For now, just retry which will auto-select from available
                            onRetry();
                            onClose();
                          }}
                        >
                          Use This
                        </button>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: '#aaa' }}>No models detected (this shouldn't happen!)</p>
                  )}
                </div>
              </div>

              <div className="setup-section">
                <h3>💡 Next Steps</h3>
                <ol className="instructions-list">
                  <li>Click "Check Again" button to retry with the first available model</li>
                  <li>Or go to User Settings to change the default model</li>
                  <li>If you want a different model: <code>ollama pull phi</code></li>
                </ol>
              </div>
            </>
          ) : (
            <>
              {/* Normal Setup Mode */}
              <div className="info-section">
                <p className="info-text">
                  Local AI analysis requires <strong>Ollama</strong>, a free tool that runs on your device. 
                  It's easy to install and gives you private, offline food analysis!
                </p>
              </div>

              {/* Quick Start Steps */}
              <div className="setup-section">
                <h3>📥 Quick Start (5 minutes)</h3>
                <ol className="instructions-list">
                  {instructions.map((instruction, idx) => (
                    <li key={idx}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {/* Model Recommendations */}
              <div className="setup-section">
                <h3>⚙️ Recommended Model for Your Device</h3>
                <div className="models-grid">
                  {recommendations.map((model, idx) => (
                    <div key={idx} className={`model-card ${idx === 0 ? 'primary' : ''}`}>
                      <div className="model-header">
                        <div className="model-name">{model.name}</div>
                        {idx === 0 && <span className="recommended-badge">Recommended</span>}
                      </div>
                      <p className="model-reason">{model.reason}</p>
                      <div className="model-specs">
                        <div className="spec">
                          <span className="spec-label">Size:</span>
                          <span className="spec-value">{model.downloadSize}</span>
                        </div>
                        <div className="spec">
                          <span className="spec-label">Speed:</span>
                          <span className="spec-value">{model.speed}</span>
                        </div>
                        <div className="spec">
                          <span className="spec-label">Needs:</span>
                          <span className="spec-value">{model.ramRequired}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="setup-section benefits-section">
                <h3>✨ Why Use Local AI?</h3>
                <ul className="benefits-list">
                  <li>🔒 <strong>Private</strong> - All processing happens on your device</li>
                  <li>🌐 <strong>Offline</strong> - Works without internet (after setup)</li>
                  <li>⚡ <strong>Fast</strong> - No cloud latency</li>
                  <li>💰 <strong>Free</strong> - No API costs or subscriptions</li>
                </ul>
              </div>

              {/* FAQ */}
              <details className="setup-section faq">
                <summary>❓ Common Questions</summary>
                <div className="faq-content">
                  <div className="faq-item">
                    <strong>Q: Is Ollama safe?</strong>
                    <p>Yes! It's open-source and developed by the Ollama team. Your data never leaves your device.</p>
                  </div>
                  <div className="faq-item">
                    <strong>Q: Can I use it offline?</strong>
                    <p>Yes! After downloading a model once, it works completely offline - no internet needed.</p>
                  </div>
                  <div className="faq-item">
                    <strong>Q: How much storage do I need?</strong>
                    <p>Models range from 637MB (TinyLlama) to 4.1GB (Mistral). Choose based on your device.</p>
                  </div>
                  <div className="faq-item">
                    <strong>Q: Can I skip this?</strong>
                    <p>Absolutely! You can still use the manual prompt option to paste results manually.</p>
                  </div>
                </div>
              </details>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button
            className="action-button secondary"
            onClick={onClose}
          >
            📋 Use Manual Prompts Instead
          </button>
          {!modelNotFoundMode && (
            <a
              href="https://ollama.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="action-button primary"
            >
              📥 Download Ollama Now
            </a>
          )}
          <button
            className="action-button action"
            onClick={onRetry}
            title={modelNotFoundMode ? "Retry with available model" : "Check if Ollama is now installed"}
          >
            🔄 Check Again
          </button>
        </div>

        <div className="modal-footer">
          <p className="footer-note">
            💡 Tip: After installing Ollama and pulling a model, FoodTracker will automatically detect it!
          </p>
        </div>
      </div>
    </div>
  );
};

export default OllamaSetupModal;
