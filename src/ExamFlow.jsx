import React, { useState, useEffect, useRef } from "react";
import {
  X, ChevronLeft, ChevronRight, Check, AlertCircle,
  Clock, Award, RotateCcw, Zap, GraduationCap, BookOpen, Loader2,
} from "lucide-react";
import { generateExamQuestions, getCachedQuestions } from "./examService";
import * as storage from "./storage/index.js";

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function getTopicOptions(node) {
  const opts = [{ id: node.id, text: node.text, isMain: true }];
  for (const c of node.children || []) opts.push({ id: c.id, text: c.text, isMain: false });
  return opts;
}

export default function ExamFlow({ node, onClose, autoStart }) {
  const [step, setStep] = useState("confirm");
  const [difficulty, setDifficulty] = useState(autoStart?.difficulty || "medium");
  const [numQ, setNumQ]         = useState(autoStart?.numQ || 10);
  const topicOptions            = getTopicOptions(node);
  const [selTopics, setSelTopics] = useState(() => topicOptions.map(t => t.id));
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx]           = useState(0);
  const [answers, setAnswers]   = useState({});
  const [revealed, setRevealed] = useState(false);
  const [loadErr, setLoadErr]   = useState("");
  const [forceRegenerate, setForceRegenerate] = useState(false);
  const [elapsed, setElapsed]   = useState(0);
  const [examEnd, setExamEnd]   = useState(null);
  const timerRef = useRef(null);

  const allChecked = selTopics.length === topicOptions.length;

  // Timer
  useEffect(() => {
    if (step === "question") {
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const toggleAll = () =>
    setSelTopics(allChecked ? [] : topicOptions.map(t => t.id));

  const toggleTopic = id =>
    setSelTopics(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const handleGenerate = async () => {
    if (selTopics.length === 0) { setLoadErr("Select at least one topic."); return; }
    setLoadErr("");
    setStep("loading");
    try {
      const qs = await generateExamQuestions({
        node,
        difficulty,
        numQuestions: numQ,
        selectedIds: selTopics,
        useCache: !forceRegenerate,
      });
      setQuestions(qs);
      setIdx(0);
      setAnswers({});
      setRevealed(false);
      setElapsed(0);
      setExamEnd(null);
      setStep("question");
    } catch (err) {
      setLoadErr(err.message);
      setStep("setup");
    }
  };

  const handleAnswer = letter => {
    if (answers[idx] !== undefined) return;
    setAnswers(p => ({ ...p, [idx]: letter }));
    setRevealed(true);
  };

  const handleNext = () => {
    if (idx < questions.length - 1) {
      setIdx(p => p + 1);
      setRevealed(false);
    } else {
      clearInterval(timerRef.current);
      const end = elapsed;
      setExamEnd(end);
      const sc = questions.filter((q, i) => answers[i] === q.correct).length;
      const pct = Math.round((sc / questions.length) * 100);
      storage.saveExamResult({
        id: uuid(),
        nodeId: node.id,
        nodeName: node.text,
        difficulty,
        numQuestions: questions.length,
        score: sc,
        percentage: pct,
        timeTakenSecs: end,
        questionsJson: JSON.stringify(questions),
      }).catch(() => {});
      setStep("results");
    }
  };

  const score = questions.filter((q, i) => answers[i] === q.correct).length;
  const pct   = questions.length ? Math.round((score / questions.length) * 100) : 0;
  const scoreColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  // ── CONFIRM ────────────────────────────────────────────────────────────────
  if (step === "confirm") return (
    <div className="exam-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="exam-modal exam-confirm-modal">
        <button className="exam-close-btn" onClick={onClose}><X size={18} /></button>
        <div className="exam-confirm-icon"><GraduationCap size={36} /></div>
        <h2 className="exam-confirm-title">Start Exam?</h2>
        <p className="exam-confirm-node">
          <BookOpen size={14} /> {node.text}
        </p>
        <p className="exam-confirm-desc">
          {autoStart
            ? `Reattempt this exam — same ${autoStart.questions?.length} questions, reset timer and answers.`
            : "Test your knowledge on this topic using AI-generated MCQ questions powered by Mistral AI."}
        </p>
        <div className="exam-confirm-meta">
          {autoStart ? (
            <>
              <span>{autoStart.questions?.length} questions</span>
              <span>·</span>
              <span className={`exam-diff-badge exam-diff-${difficulty}`}>{difficulty}</span>
            </>
          ) : (
            <>
              <span>{topicOptions.length} topic{topicOptions.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>Multiple Choice</span>
              <span>·</span>
              <span>Instant Results</span>
            </>
          )}
        </div>
        <div className="exam-confirm-actions">
          <button className="exam-btn-secondary" onClick={onClose}>Cancel</button>
          <button className="exam-btn-primary" onClick={() => {
            if (autoStart?.questions?.length) {
              setQuestions(autoStart.questions);
              setIdx(0); setAnswers({}); setRevealed(false); setElapsed(0); setExamEnd(null);
              setStep("question");
            } else {
              setStep("setup");
            }
          }}>
            {autoStart ? "Reattempt" : "Yes, Start Exam"} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  // ── SETUP ──────────────────────────────────────────────────────────────────
  if (step === "setup") return (
    <div className="exam-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="exam-modal exam-setup-modal">
        <div className="exam-modal-hdr">
          <button className="exam-back-btn" onClick={() => setStep("confirm")}><ChevronLeft size={16} /></button>
          <span className="exam-modal-title">Exam Setup</span>
          <button className="exam-close-btn exam-close-btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="exam-setup-body">
          {/* Difficulty */}
          <div className="exam-section">
            <label className="exam-label">Difficulty</label>
            <div className="exam-pill-row">
              {["easy", "medium", "hard"].map(d => (
                <button
                  key={d}
                  className={`exam-pill${difficulty === d ? " active" : ""} exam-pill-${d}`}
                  onClick={() => setDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <p className="exam-hint">
              {difficulty === "easy" && "Basic recall and concept recognition"}
              {difficulty === "medium" && "Understanding and application of concepts"}
              {difficulty === "hard" && "Analysis, edge-cases, and deep problem-solving"}
            </p>
          </div>

          {/* Number of questions */}
          <div className="exam-section">
            <label className="exam-label">Number of Questions</label>
            <div className="exam-pill-row">
              {[5, 10, 15, 20].map(n => (
                <button
                  key={n}
                  className={`exam-pill${numQ === n ? " active" : ""}`}
                  onClick={() => setNumQ(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="exam-section">
            <label className="exam-label">Topics</label>
            <div className="exam-topics-list">
              <label className="exam-topic-item exam-topic-all">
                <input
                  type="checkbox"
                  checked={allChecked}
                  onChange={toggleAll}
                />
                <span className="exam-topic-check" />
                <span className="exam-topic-text">All Topics</span>
              </label>
              {topicOptions.map(t => (
                <label key={t.id} className="exam-topic-item">
                  <input
                    type="checkbox"
                    checked={selTopics.includes(t.id)}
                    onChange={() => toggleTopic(t.id)}
                  />
                  <span className="exam-topic-check" />
                  <span className="exam-topic-text">
                    {t.text}
                    {t.isMain && <span className="exam-topic-badge">main</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Cache banner */}
          {(() => {
            const hasCached = getCachedQuestions(node.id, difficulty, numQ, selTopics);
            if (!hasCached) return null;
            return (
              <div className="exam-cache-banner">
                <Check size={14} />
                <span>Cached questions available — no API call needed</span>
                <label className="exam-cache-toggle">
                  <input
                    type="checkbox"
                    checked={forceRegenerate}
                    onChange={e => setForceRegenerate(e.target.checked)}
                  />
                  <span className="exam-topic-check" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 12 }}>Regenerate fresh</span>
                </label>
              </div>
            );
          })()}

          {loadErr && (
            <div className="exam-error">
              <AlertCircle size={15} /> {loadErr}
            </div>
          )}
        </div>

        <div className="exam-setup-footer">
          {(() => {
            const hasCached = getCachedQuestions(node.id, difficulty, numQ, selTopics);
            const useCache = hasCached && !forceRegenerate;
            return (
              <button
                className="exam-btn-primary exam-btn-full"
                onClick={handleGenerate}
                disabled={selTopics.length === 0}
              >
                {useCache
                  ? <><Check size={16} /> Use Cached Questions</>
                  : <><Zap size={16} /> Generate Questions</>}
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (step === "loading") return (
    <div className="exam-overlay">
      <div className="exam-loading-screen">
        <div className="exam-loading-spinner"><Loader2 size={52} /></div>
        <h3 className="exam-loading-title">Generating {numQ} questions…</h3>
        <p className="exam-loading-sub">Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} · {node.text}</p>
        <div className="exam-loading-badge">
          <Zap size={13} /> Powered by Mistral via Puter
        </div>
      </div>
    </div>
  );

  // ── QUESTION ───────────────────────────────────────────────────────────────
  if (step === "question") {
    const q = questions[idx];
    const chosen = answers[idx];
    const progressPct = Math.round(((idx + (chosen !== undefined ? 1 : 0)) / questions.length) * 100);

    return (
      <div className="exam-overlay">
        <div className="exam-question-screen">
          {/* Top bar */}
          <div className="exam-q-topbar">
            <div className="exam-q-progress-info">
              <span className="exam-q-counter">Q {idx + 1} / {questions.length}</span>
              <div className="exam-q-progbar">
                <div className="exam-q-progbar-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div className="exam-q-timer">
              <Clock size={13} /> {formatTime(elapsed)}
            </div>
            <button className="exam-q-exit" onClick={onClose} title="Exit exam"><X size={16} /></button>
          </div>

          {/* Difficulty + topic pill */}
          <div className="exam-q-meta">
            <span className={`exam-diff-badge exam-diff-${difficulty}`}>{difficulty}</span>
            <span className="exam-q-topic">{node.text}</span>
          </div>

          {/* Question */}
          <div className="exam-q-body">
            <p className="exam-q-text">{q.question}</p>

            {/* Options */}
            <div className="exam-options">
              {q.options.map((opt, oi) => {
                const letter = ["A", "B", "C", "D"][oi];
                let cls = "exam-option";
                if (chosen !== undefined) {
                  if (letter === q.correct) cls += " exam-option-correct";
                  else if (letter === chosen) cls += " exam-option-wrong";
                  else cls += " exam-option-dim";
                } else {
                  cls += " exam-option-idle";
                }
                return (
                  <button key={letter} className={cls} onClick={() => handleAnswer(letter)} disabled={chosen !== undefined}>
                    <span className="exam-opt-letter">{letter}</span>
                    <span className="exam-opt-text">{opt.slice(3)}</span>
                    {chosen !== undefined && letter === q.correct && <Check size={15} className="exam-opt-icon" />}
                    {chosen !== undefined && letter === chosen && letter !== q.correct && <X size={15} className="exam-opt-icon" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation */}
            {revealed && q.explanation && (
              <div className={`exam-explanation${answers[idx] === q.correct ? " exam-expl-correct" : " exam-expl-wrong"}`}>
                <strong>{answers[idx] === q.correct ? "Correct! " : "Incorrect. "}</strong>
                {q.explanation}
              </div>
            )}
          </div>

          {/* Next button */}
          <div className="exam-q-footer">
            {chosen !== undefined && (
              <button className="exam-btn-primary" onClick={handleNext}>
                {idx < questions.length - 1 ? <>Next <ChevronRight size={16} /></> : <>Finish Exam <Award size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if (step === "results") {
    const timeTaken = examEnd ?? elapsed;
    return (
      <div className="exam-overlay">
        <div className="exam-results-screen">
          <div className="exam-results-hdr">
            <h2 className="exam-results-title">Exam Results</h2>
            <p className="exam-results-node">{node.text}</p>
          </div>

          {/* Score card */}
          <div className="exam-score-card">
            <div className="exam-score-circle" style={{ "--score-color": scoreColor }}>
              <span className="exam-score-num">{score}</span>
              <span className="exam-score-denom">/ {questions.length}</span>
            </div>
            <div className="exam-score-pct" style={{ color: scoreColor }}>{pct}%</div>
            <div className="exam-score-label">
              {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep practicing" : "Needs more study"}
            </div>
          </div>

          {/* Stats row */}
          <div className="exam-stats-row">
            <div className="exam-stat">
              <span className="exam-stat-val exam-stat-correct">{score}</span>
              <span className="exam-stat-label">Correct</span>
            </div>
            <div className="exam-stat">
              <span className="exam-stat-val exam-stat-wrong">{questions.length - score}</span>
              <span className="exam-stat-label">Wrong</span>
            </div>
            <div className="exam-stat">
              <span className="exam-stat-val">{formatTime(timeTaken)}</span>
              <span className="exam-stat-label">Time</span>
            </div>
            <div className="exam-stat">
              <span className={`exam-stat-val exam-diff-badge exam-diff-${difficulty}`}>{difficulty}</span>
              <span className="exam-stat-label">Difficulty</span>
            </div>
          </div>

          {/* Question review */}
          <div className="exam-review">
            <h3 className="exam-review-title">Question Review</h3>
            <div className="exam-review-list">
              {questions.map((q, i) => {
                const correct = answers[i] === q.correct;
                return (
                  <details key={i} className={`exam-review-item${correct ? " exam-review-correct" : " exam-review-wrong"}`}>
                    <summary className="exam-review-summary">
                      <span className={`exam-review-dot${correct ? " correct" : " wrong"}`} />
                      <span className="exam-review-qtext">Q{i + 1}. {q.question}</span>
                    </summary>
                    <div className="exam-review-detail">
                      <p><strong>Your answer:</strong> {answers[i] ? q.options[["A","B","C","D"].indexOf(answers[i])] : "Not answered"}</p>
                      <p><strong>Correct answer:</strong> {q.options[["A","B","C","D"].indexOf(q.correct)]}</p>
                      {q.explanation && <p className="exam-review-expl">{q.explanation}</p>}
                    </div>
                  </details>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="exam-results-actions">
            <button
              className="exam-btn-secondary"
              title="Restart with the same questions"
              onClick={() => {
                setAnswers({});
                setIdx(0);
                setRevealed(false);
                setElapsed(0);
                setExamEnd(null);
                setStep("question");
              }}
            >
              <RotateCcw size={15} /> Reattempt
            </button>
            <button
              className="exam-btn-secondary"
              title="Generate a fresh set of questions"
              onClick={() => { setStep("setup"); setAnswers({}); setIdx(0); setElapsed(0); }}
            >
              New Exam
            </button>
            <button className="exam-btn-primary" onClick={onClose}>
              <X size={15} /> Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
