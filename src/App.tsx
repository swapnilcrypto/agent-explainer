import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  BookOpen,
  Braces,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  FileCheck2,
  FlaskConical,
  GitBranch,
  CodeXml,
  Info,
  Layers3,
  Link,
  Monitor,
  Moon,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Sun,
  Ticket,
  TriangleAlert,
  Wrench,
  X,
} from 'lucide-react'
import { scenarios, getScenario } from './scenarios'
import { runScenario } from './simulation/engine'
import {
  decodeRoute,
  encodeRoute,
  readPreferences,
  savePreferences,
  type Route,
  type Preferences,
} from './lib/navigation'
import { glossary } from './lib/glossary'
import { Dialog } from './components/Dialog'
import { WorldView } from './components/WorldView'
import { LearningCheck } from './components/LearningCheck'
import { getLessonQuestions } from './learning/questions'
import { explanationFeedbackURL } from './lib/feedback'
import type { Variant } from './simulation/types'

const REPO = 'https://github.com/swapnilcrypto/agent-explainer'
const icons = [Ticket, Layers3, FileCheck2]
const initial = () => decodeRoute(window.location.hash)
function withCompletion(preferences: Preferences, route: Route): Preferences {
  const scenario = getScenario(route.id, route.revision)
  if (route.variant !== 'repaired' || !scenario || preferences.completed.includes(route.id))
    return preferences
  if (route.step !== runScenario(scenario, route.variant).frames.length - 1) return preferences
  return { ...preferences, completed: [...preferences.completed, route.id] }
}

export default function App() {
  const [route, setRoute] = useState(() => initial().route)
  const [notice, setNotice] = useState(() => initial().notice)
  const [playing, setPlaying] = useState(false)
  const [preferences, setPreferences] = useState(() =>
    withCompletion(readPreferences(), initial().route),
  )
  const [modal, setModal] = useState<'concepts' | 'share' | null>(null)
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null)
  const [copyState, setCopyState] = useState('')
  const [answers, setAnswers] = useState<{ prediction?: string; reflection?: string }>({})
  const scenario = getScenario(route.id, route.revision)!
  const questions = getLessonQuestions(scenario.id, scenario.revision)
  const result = useMemo(() => runScenario(scenario, route.variant), [scenario, route.variant])
  const baseline = useMemo(() => runScenario(scenario, 'baseline'), [scenario])
  const frame = result.frames[route.step]
  const finished = route.step === result.frames.length - 1
  const repaired = route.variant === 'repaired'
  const shareURL = `${window.location.origin}${window.location.pathname}${encodeRoute(route)}`
  const progress = Math.round((route.step / (result.frames.length - 1)) * 100)

  useEffect(() => {
    const listener = () => {
      const parsed = decodeRoute(window.location.hash)
      setRoute(parsed.route)
      setNotice(parsed.notice)
      setPlaying(false)
      setSelectedTerm(null)
      setAnswers({})
      setPreferences((p) => withCompletion(p, parsed.route))
    }
    window.addEventListener('hashchange', listener)
    return () => window.removeEventListener('hashchange', listener)
  }, [])
  useEffect(() => {
    window.history.replaceState(null, '', encodeRoute(route))
  }, [route])
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      document.documentElement.dataset.theme =
        preferences.theme === 'system' ? (mq.matches ? 'dark' : 'light') : preferences.theme
    }
    apply()
    mq.addEventListener('change', apply)
    savePreferences(preferences)
    return () => mq.removeEventListener('change', apply)
  }, [preferences])
  useEffect(() => {
    if (!playing || finished) return
    const timer = window.setTimeout(() => {
      const next = { ...route, step: Math.min(route.step + 1, result.frames.length - 1) }
      setRoute(next)
      if (next.step === result.frames.length - 1) setPlaying(false)
      setPreferences((p) => withCompletion(p, next))
    }, 1800)
    return () => window.clearTimeout(timer)
  }, [playing, route, finished, result.frames.length])
  useEffect(() => {
    document.title = `${scenario.title} · Agent Explainer`
  }, [scenario.title])

  function navigate(next: Route, play = false) {
    window.history.pushState(null, '', encodeRoute(next))
    setRoute(next)
    setPlaying(play)
    setNotice(undefined)
    setSelectedTerm(null)
    setAnswers({})
    setPreferences((p) => withCompletion(p, next))
  }
  function selectScenario(id: string) {
    const next = scenarios.find((s) => s.id === id)!
    navigate({ id, revision: next.revision, variant: 'baseline', step: 0 })
  }
  function replay(variant: Variant) {
    navigate({ ...route, variant, step: 0 }, true)
  }
  function selectStep(step: number) {
    const next = { ...route, step }
    setPlaying(false)
    setSelectedTerm(null)
    setRoute(next)
    setPreferences((p) => withCompletion(p, next))
  }
  function primaryAction() {
    if (finished) replay('repaired')
    else setPlaying((p) => !p)
  }
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareURL)
      setCopyState('Link copied. It opens this exact step, paused.')
    } catch {
      setCopyState('Copy is unavailable. Select and copy the link below.')
      document.getElementById('share-url')?.focus()
    }
  }
  const primaryLabel = finished
    ? repaired
      ? 'Replay with repair'
      : 'Apply repair and replay'
    : playing
      ? 'Pause experiment'
      : route.step === 0
        ? 'Run experiment'
        : 'Continue experiment'

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main-content')?.focus()
        }}
      >
        Skip to experiment
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a
            className="brand"
            href={encodeRoute({
              id: 'duplicate-action',
              revision: 1,
              variant: 'baseline',
              step: 0,
            })}
            onClick={(e) => {
              e.preventDefault()
              selectScenario('duplicate-action')
            }}
            aria-label="Agent Explainer home"
          >
            <span className="brand-icon">
              <GitBranch size={22} />
            </span>
            <span>
              Agent<span className="brand-light">Explainer</span>
            </span>
            <span className="beta-label">BETA</span>
          </a>
          <nav aria-label="Main navigation">
            <button
              className="nav-button"
              aria-label="Concepts"
              onClick={() => {
                setPlaying(false)
                setModal('concepts')
              }}
            >
              <BookOpen size={16} />
              <span>Concepts</span>
            </button>
            <a
              className="nav-button github-link"
              aria-label="View on GitHub"
              href={REPO}
              target="_blank"
              rel="noreferrer"
            >
              <CodeXml size={17} />
              <span>GitHub</span>
              <ExternalLink size={12} />
            </a>
            <div className="header-divider" />
            <button
              className="icon-button theme-button"
              aria-label={`Theme: ${preferences.theme}. Switch to ${preferences.theme === 'system' ? 'light' : preferences.theme === 'light' ? 'dark' : 'system'}`}
              onClick={() =>
                setPreferences((p) => ({
                  ...p,
                  theme: p.theme === 'system' ? 'light' : p.theme === 'light' ? 'dark' : 'system',
                }))
              }
            >
              {preferences.theme === 'system' ? (
                <Monitor size={18} />
              ) : preferences.theme === 'light' ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="page-shell">
        <section className="hero" aria-labelledby="page-title">
          <div>
            <div className="hero-kicker">
              <span className="status-dot" />
              THE INTERACTIVE AGENT LAB
            </div>
            <h1 id="page-title">
              See the failure.
              <br />
              <span>Understand the fix.</span>
            </h1>
          </div>
          <div className="hero-description">
            <p>
              AI agents don’t always get it right.
              <br />
              Find out why. Change one thing.
              <br />
              <strong>Watch what happens next.</strong>
            </p>
            <div className="hero-features">
              <span>
                <Check size={13} />
                No API keys
              </span>
              <span>
                <Check size={13} />
                Runs in your browser
              </span>
            </div>
          </div>
        </section>

        <section aria-label="Choose an experiment" className="experiment-picker">
          {scenarios.map((s, index) => {
            const Icon = icons[index] || FlaskConical
            return (
              <button
                key={s.id}
                className={`experiment-tab ${s.id === scenario.id ? 'selected' : ''}`}
                aria-label={`${s.shortTitle} — ${s.topic}`}
                aria-pressed={s.id === scenario.id}
                onClick={() => selectScenario(s.id)}
              >
                <span className="experiment-index">0{index + 1}</span>
                <Icon size={21} />
                <span className="tab-copy">
                  <strong>{s.shortTitle}</strong>
                  <span>{s.topic}</span>
                </span>
                {preferences.completed.includes(s.id) ? (
                  <CheckCircle2
                    size={17}
                    aria-label="Repaired experiment completed"
                    className="completed-icon"
                  />
                ) : (
                  <ArrowRight size={17} className="tab-arrow" />
                )}
              </button>
            )
          })}
        </section>

        {notice && (
          <div className="notice" role="alert">
            <Info size={18} />
            <span>{notice}</span>
            <button onClick={() => navigate({ ...route, step: 0 })}>Start this experiment</button>
            <button
              className="icon-button"
              aria-label="Dismiss notice"
              onClick={() => setNotice(undefined)}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <section className="lab" aria-labelledby="experiment-title">
          <div className="lab-heading">
            <div>
              <div className="eyebrow">
                EXPERIMENT 0{scenarios.findIndex((s) => s.id === scenario.id) + 1}
                <span className="eyebrow-separator">/</span>
                <span className="simulation-label">RULE-BASED SIMULATION</span>
              </div>
              <h2 id="experiment-title">{scenario.subtitle}</h2>
              <p>{scenario.description}</p>
            </div>
            <button
              className="secondary-button share-button"
              onClick={() => {
                setPlaying(false)
                setCopyState('')
                setModal('share')
              }}
            >
              <Link size={15} />
              Share experiment
            </button>
          </div>
          <div className="task-strip">
            <span className="task-label">
              <Braces size={15} />
              THE TASK
            </span>
            <p>“{scenario.task}”</p>
          </div>

          {questions && !repaired && route.step === 0 && (
            <div className="prediction-slot">
              <LearningCheck
                title="Make a prediction"
                question={questions.prediction}
                answerId={answers.prediction}
                onAnswer={(prediction) => setAnswers((current) => ({ ...current, prediction }))}
              />
            </div>
          )}

          <div className="simulation-toolbar">
            <div className={`mode-label ${repaired ? 'mode-repaired' : ''}`}>
              {repaired ? <ShieldCheck size={15} /> : <FlaskConical size={15} />}
              <span>{repaired ? 'With the repair' : 'Without the repair'}</span>
            </div>
            <div className="step-counter">
              Step <strong>{String(route.step + 1).padStart(2, '0')}</strong>
              <span>/ {String(result.frames.length).padStart(2, '0')}</span>
              <span className={`play-state ${playing ? 'is-playing' : ''}`}>
                <span />
                {playing
                  ? 'Playing'
                  : finished
                    ? 'Complete'
                    : route.step === 0
                      ? 'Ready'
                      : 'Paused'}
              </span>
            </div>
          </div>

          <div className="playback">
            <div className="playback-actions">
              <button className="primary-button" onClick={primaryAction}>
                {finished ? (
                  <Wrench size={16} />
                ) : playing ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} fill="currentColor" />
                )}
                {primaryLabel}
              </button>
              <div className="step-controls">
                <button
                  className="icon-button"
                  aria-label="Previous step"
                  disabled={route.step === 0}
                  onClick={() => selectStep(route.step - 1)}
                >
                  <ChevronLeft size={19} />
                </button>
                <button
                  className="icon-button"
                  aria-label="Next step"
                  disabled={finished}
                  onClick={() => selectStep(route.step + 1)}
                >
                  <ChevronRight size={19} />
                </button>
                <span className="control-divider" />
                <button
                  className="icon-button"
                  aria-label="Restart experiment"
                  onClick={() => {
                    navigate({ ...route, step: 0 })
                  }}
                >
                  <RotateCcw size={17} />
                </button>
              </div>
            </div>
            <div className="playback-note">
              {repaired ? (
                <>
                  <ShieldCheck size={14} />
                  <span>{scenario.repair}</span>
                </>
              ) : (
                <>
                  <span className="hint-dot" />
                  <span>Run it. Spot the failure. Then try the repair.</span>
                </>
              )}
            </div>
          </div>

          <div className="simulation-grid" aria-label="Agent simulation state">
            <section
              className={`sim-panel ${frame.focus === 'context' ? 'panel-active' : ''}`}
              aria-labelledby="context-heading"
            >
              <div className="panel-header">
                <span className="panel-number">01</span>
                <BookOpen size={16} />
                <h3 id="context-heading">What the agent knows</h3>
              </div>
              <div className="panel-body">
                <span className="small-label">CURRENT CONTEXT</span>
                <ul className="context-list">
                  {frame.context.map((line, i) => (
                    <li
                      key={`${i}-${line}`}
                      className={line.includes('Do not publish') ? 'constraint-line' : ''}
                    >
                      {line.includes('Do not publish') ? (
                        <ShieldCheck size={14} />
                      ) : (
                        <span className="context-bullet" />
                      )}
                      {line}
                    </li>
                  ))}
                </ul>
                {frame.constraints.length > 0 && (
                  <div className="persistent-rule">
                    <LockIcon />
                    <div>
                      <b>Retained task constraint</b>
                      <span>{frame.constraints.join(' ')}</span>
                    </div>
                  </div>
                )}
                <div className="context-footer">
                  <span className="small-label">AGENT’S LAST CLAIM</span>
                  <p>“{frame.agentClaim}”</p>
                </div>
              </div>
            </section>
            <div className="flow-connector" aria-hidden="true">
              <ArrowRight size={18} />
            </div>
            <section
              className={`sim-panel activity-panel ${frame.focus === 'agent' ? 'panel-active' : ''}`}
              aria-labelledby="activity-heading"
            >
              <div className="panel-header">
                <span className="panel-number">02</span>
                <GitBranch size={16} />
                <h3 id="activity-heading">What happens</h3>
              </div>
              <div className="panel-body">
                <div className="activity-top">
                  <span className={`actor-label actor-${frame.activity.actor.toLowerCase()}`}>
                    {frame.activity.actor}
                  </span>
                  <span className="virtual-step">
                    EVENT {String(route.step + 1).padStart(2, '0')}
                  </span>
                </div>
                <h4>{frame.activity.label}</h4>
                <div className="tool-input">
                  <span>INPUT</span>
                  <code>{frame.activity.input}</code>
                </div>
                <div className={`tool-result ${frame.activity.tone}`}>
                  <span>RESULT</span>
                  <p>
                    {frame.activity.tone === 'warning' ? (
                      <TriangleAlert size={15} />
                    ) : frame.activity.tone === 'success' ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      <ArrowDown size={14} />
                    )}
                    {frame.activity.result}
                  </p>
                </div>
                <div className="state-change">
                  <span className="small-label">STATE CHANGE</span>
                  <p>{frame.activity.change}</p>
                </div>
              </div>
            </section>
            <div className="flow-connector" aria-hidden="true">
              <ArrowRight size={18} />
            </div>
            <section
              className={`sim-panel ${frame.focus === 'world' ? 'panel-active' : ''}`}
              aria-labelledby="world-heading"
            >
              <div className="panel-header">
                <span className="panel-number">03</span>
                <GlobeIcon />
                <h3 id="world-heading">What is actually true</h3>
              </div>
              <div className="panel-body">
                <WorldView scenario={scenario} frame={frame} />
              </div>
            </section>
          </div>

          <div className="frame-explanation" aria-live="polite" aria-atomic="true">
            <span className="explanation-icon">
              <CircleHelp size={17} />
            </span>
            <p>{frame.explanation}</p>
          </div>
          <div className="step-feedback">
            <a
              href={explanationFeedbackURL(route, scenario, frame)}
              target="_blank"
              rel="noreferrer"
              onClick={() => setPlaying(false)}
              aria-describedby="feedback-destination"
            >
              This step is confusing <ExternalLink size={12} />
            </a>
            <span id="feedback-destination">Review on GitHub. Sign-in required to post.</span>
          </div>

          <div className="timeline-section">
            <div className="timeline-label">
              <span className="small-label">EXECUTION TIMELINE</span>
              <span>Choose a step to inspect it</span>
            </div>
            <div
              className="timeline-progress"
              role="progressbar"
              aria-label="Experiment progress"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <span style={{ width: `${progress}%` }} />
            </div>
            <ol className="timeline">
              {result.frames.map((f) => (
                <li key={f.step}>
                  <button
                    className={`${f.step === route.step ? 'current' : ''} ${f.step < route.step ? 'visited' : ''} ${f.activity.tone === 'warning' ? 'event-warning' : ''}`}
                    aria-current={f.step === route.step ? 'step' : undefined}
                    aria-label={`Step ${f.step + 1}: ${f.activity.label}`}
                    onClick={() => selectStep(f.step)}
                  >
                    <span className="timeline-dot">
                      {f.step < route.step ? (
                        <Check size={11} />
                      ) : (
                        String(f.step + 1).padStart(2, '0')
                      )}
                    </span>
                    <span>{f.activity.label}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {finished && (
          <section
            className={`outcome-section ${repaired ? 'outcome-success' : ''}`}
            aria-labelledby="outcome-title"
          >
            <div className="outcome-intro">
              <span className="outcome-icon">
                {result.assessment.passed ? <ShieldCheck size={25} /> : <TriangleAlert size={25} />}
              </span>
              <div>
                <div className="eyebrow">
                  {result.assessment.passed
                    ? 'REPAIR VERIFIED IN THIS SIMULATION'
                    : 'THE FAILURE, EXPOSED'}
                </div>
                <h2 id="outcome-title">{result.assessment.headline}</h2>
                <p>{result.assessment.evidence}</p>
              </div>
            </div>
            {repaired ? (
              <>
                <div className="comparison">
                  <div>
                    <span className="small-label">BEFORE</span>
                    <strong>{baseline.assessment.value}</strong>
                    <span>{baseline.assessment.label}</span>
                  </div>
                  <ArrowRight size={24} />
                  <div className="comparison-fixed">
                    <span className="small-label">AFTER THE REPAIR</span>
                    <strong>{result.assessment.value}</strong>
                    <span>{result.assessment.label}</span>
                  </div>
                </div>
                <p className="repair-mechanism">{scenario.repairExplanation}</p>
                <div className="outcome-actions">
                  <button className="secondary-button" onClick={() => replay('baseline')}>
                    <RotateCcw size={15} />
                    Replay the failure
                  </button>
                  <button
                    className="text-button"
                    onClick={() =>
                      selectScenario(
                        scenarios[
                          (scenarios.findIndex((s) => s.id === scenario.id) + 1) % scenarios.length
                        ].id,
                      )
                    }
                  >
                    Try the next experiment <ArrowRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="repair-preview">
                <Wrench size={19} />
                <div>
                  <strong>The repair: {scenario.repair.toLowerCase()}</strong>
                  <p>{scenario.repairExplanation}</p>
                </div>
                <button className="primary-button" onClick={() => replay('repaired')}>
                  Apply repair <ArrowRight size={16} />
                </button>
              </div>
            )}
            {questions && repaired && (
              <LearningCheck
                title="Check your understanding"
                question={questions.reflection}
                answerId={answers.reflection}
                onAnswer={(reflection) => setAnswers((current) => ({ ...current, reflection }))}
                reveal
              />
            )}
            {questions && !repaired && answers.prediction && (
              <LearningCheck
                title="Review your prediction"
                question={questions.prediction}
                answerId={answers.prediction}
                onAnswer={(prediction) => setAnswers((current) => ({ ...current, prediction }))}
                reveal
              />
            )}
          </section>
        )}

        <div className="below-lab">
          <section className="learning-note">
            <div className="small-label">
              <Sparkles size={14} />
              THE IDEA TO TAKE WITH YOU
            </div>
            <h2>{scenario.takeaway}</h2>
            <p>{scenario.objective}</p>
          </section>
          <section className="concepts-note">
            <div className="small-label">
              <BookOpen size={14} />
              CONCEPTS IN THIS STEP
            </div>
            <div className="term-buttons">
              {frame.terms.map((id) => (
                <button
                  key={id}
                  aria-label={`Explain ${glossary[id]?.name}`}
                  aria-expanded={selectedTerm === id}
                  onClick={() => setSelectedTerm((t) => (t === id ? null : id))}
                >
                  {glossary[id]?.name}
                  <span>+</span>
                </button>
              ))}
            </div>
            {selectedTerm && (
              <p className="term-definition" role="status">
                <strong>{glossary[selectedTerm]?.name}. </strong>
                {glossary[selectedTerm]?.definition}
              </p>
            )}
          </section>
        </div>

        <details className="method-note">
          <summary>
            <Info size={15} />
            About this simulation and its limits
            <ChevronRight size={15} />
          </summary>
          <div>
            <p>
              This is a deterministic, rule-based teaching experiment. No live model is running, and
              all actions happen in a simulated world. The visible decisions are scripted—not a
              model’s hidden reasoning. These outcomes are not model benchmarks.
            </p>
            <p>{scenario.limitation}</p>
            <h3>Read the source material</h3>
            <ul>
              {scenario.sources.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <ExternalLink size={12} />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </details>
        <footer className="site-footer">
          <span>
            <FlaskConical size={15} />
            Small experiments. Better mental models.
          </span>
          <div>
            <span>Open source · MIT</span>
            <a href={`${REPO}/blob/main/CONTRIBUTING.md`} target="_blank" rel="noreferrer">
              Contribute an experiment <ArrowRight size={13} />
            </a>
          </div>
        </footer>
      </main>

      {modal === 'concepts' && (
        <Dialog title="A little less jargon." onClose={() => setModal(null)}>
          <p className="dialog-description">
            The concepts behind the experiments, in plain language.
          </p>
          <dl className="glossary-list">
            {Object.entries(glossary).map(([id, term]) => (
              <div key={id}>
                <dt>{term.name}</dt>
                <dd>{term.definition}</dd>
              </div>
            ))}
          </dl>
        </Dialog>
      )}
      {modal === 'share' && (
        <Dialog title="Share this exact moment." onClose={() => setModal(null)}>
          <p className="dialog-description">
            {scenario.title} · {repaired ? 'With repair' : 'Without repair'} · Step {route.step + 1}
            . This link opens paused, with the same simulated state.
          </p>
          <label className="share-label" htmlFor="share-url">
            Experiment link
          </label>
          <input
            id="share-url"
            className="share-input"
            value={shareURL}
            readOnly
            onFocus={(e) => e.target.select()}
          />
          <button className="primary-button copy-button" onClick={() => void copyLink()}>
            <Link size={16} />
            Copy link
          </button>
          <p className="copy-status" role="status">
            {copyState ||
              'Only the experiment, revision, variant, and step are shared. No personal data.'}
          </p>
        </Dialog>
      )}
    </>
  )
}

function LockIcon() {
  return <ShieldCheck size={16} aria-hidden="true" />
}
function GlobeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18" />
    </svg>
  )
}
