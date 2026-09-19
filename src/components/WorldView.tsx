import { Check, FileText, Globe, LoaderCircle, LockKeyhole, Ticket } from 'lucide-react'
import type { ScenarioDefinition, SimulationFrame } from '../simulation/types'

export function WorldView({
  scenario,
  frame,
}: {
  scenario: ScenarioDefinition
  frame: SimulationFrame
}) {
  const world = frame.world
  if (scenario.id === 'duplicate-action')
    return (
      <div className="world-view">
        <div className="world-metric">
          <strong>{world.tickets.length}</strong>
          <span>
            tickets created <small>Expected: exactly 1</small>
          </span>
        </div>
        <div className="records">
          {world.tickets.length ? (
            world.tickets.map((ticket, index) => (
              <div key={ticket.id} className={`record ${index > 0 ? 'record-warning' : ''}`}>
                <Ticket size={19} />
                <div>
                  <b>{ticket.id}</b>
                  <span>{ticket.subject}</span>
                </div>
                {index > 0 && <span className="mini-status warning">Duplicate</span>}
              </div>
            ))
          ) : (
            <div className="empty-record">
              <Ticket size={23} />
              <span>No tickets yet</span>
            </div>
          )}
        </div>
        <div className="world-foot">
          <span className="status-dot" />
          Support system · authoritative state
        </div>
      </div>
    )
  if (scenario.id === 'forgotten-instruction')
    return (
      <div className="world-view">
        <div className={`document-preview ${world.document.published ? 'published' : ''}`}>
          <div className="document-top">
            <FileText size={24} />
            {world.document.published ? (
              <span className="mini-status warning">
                <Globe size={12} /> Published
              </span>
            ) : (
              <span className="mini-status">{world.document.exists ? 'Draft' : 'Not created'}</span>
            )}
          </div>
          <b>Quarterly update</b>
          <span>
            {world.document.exists
              ? 'Product progress and customer feedback.'
              : 'Waiting for the first draft.'}
          </span>
          <div className="paper-lines">
            <i />
            <i />
            <i />
          </div>
        </div>
        <div className="world-fact">
          <LockKeyhole size={16} />
          <span>
            Required: <b>unpublished draft</b>
          </span>
        </div>
        <div className="world-foot">
          <span className="status-dot" />
          Document store · authoritative state
        </div>
      </div>
    )
  return (
    <div className="world-view">
      <div className="job-status">
        <span className={`job-symbol ${world.reportExists ? 'complete' : ''}`}>
          {world.reportExists ? <Check size={24} /> : <LoaderCircle size={24} />}
        </span>
        <div>
          <span className="eyebrow">JOB RPT-208</span>
          <strong>{world.job.replace('-', ' ')}</strong>
        </div>
      </div>
      <ol className="job-stages" aria-label="Report job progress">
        {['accepted', 'pending', 'completed'].map((stage, index) => (
          <li
            key={stage}
            className={
              ['not-started', 'accepted', 'pending', 'completed'].indexOf(world.job) > index
                ? 'reached'
                : ''
            }
          >
            <span />
            {stage}
          </li>
        ))}
      </ol>
      <div className={`record ${world.reportExists ? 'record-success' : ''}`}>
        <FileText size={20} />
        <div>
          <b>weekly-report.pdf</b>
          <span>
            {world.reportExists ? 'Available in the report store' : 'No report exists yet'}
          </span>
        </div>
      </div>
      <div className="world-foot">
        <span className="status-dot" />
        Report service · authoritative state
      </div>
    </div>
  )
}
