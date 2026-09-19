import { useId, useState } from 'react'
import { ChevronDown, CircleHelp } from 'lucide-react'
import type { LearningQuestion } from '../learning/questions'

export function LearningCheck({
  title,
  question,
  answerId,
  onAnswer,
  reveal = false,
}: {
  title: string
  question: LearningQuestion
  answerId?: string
  onAnswer: (id: string) => void
  reveal?: boolean
}) {
  const id = useId()
  const [open, setOpen] = useState(Boolean(answerId))
  const selected = question.options.find((option) => option.id === answerId)
  const correct = question.options.find((option) => option.id === question.correctOption)!
  return (
    <section className="learning-check" aria-label={title}>
      <button
        className="question-toggle"
        aria-label={`${title} (optional)`}
        aria-expanded={open}
        aria-controls={`${id}-body`}
        onClick={() => setOpen((value) => !value)}
      >
        <CircleHelp size={17} />
        <span>{title}</span>
        <span className="question-optional">Optional</span>
        <ChevronDown size={16} className={open ? 'question-open' : ''} />
      </button>
      <div id={`${id}-body`} hidden={!open} className="question-body">
        <fieldset>
          <legend>{question.prompt}</legend>
          <div className="question-options">
            {question.options.map((option) => (
              <label
                key={option.id}
                className={`question-option ${answerId === option.id ? 'answer-selected' : ''}`}
              >
                <input
                  type="radio"
                  name={id}
                  value={option.id}
                  checked={answerId === option.id}
                  onChange={() => onAnswer(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        {selected && (
          <div className="answer-feedback" role="status">
            <strong>
              {!reveal
                ? 'Prediction noted.'
                : selected.id === question.correctOption
                  ? 'That’s right.'
                  : 'Here’s what happens.'}
            </strong>
            <p>
              {reveal
                ? selected.explanation
                : 'Run the experiment to see what happens. Your choice does not change the simulation.'}
            </p>
            {reveal && selected.id !== question.correctOption && (
              <p>
                <b>The answer:</b> {correct.label}
              </p>
            )}
          </div>
        )}
        <p className="question-privacy">
          Answers stay in this tab. They are never saved or shared.
        </p>
      </div>
    </section>
  )
}
