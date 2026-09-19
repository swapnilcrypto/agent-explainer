export const glossary: Record<string, { name: string; definition: string }> = {
  agent: {
    name: 'Agent',
    definition:
      'Software that chooses and carries out steps toward a goal. The agent here follows explicit, simulated rules.',
  },
  tool: {
    name: 'Tool',
    definition:
      'An operation an agent can request, such as creating a ticket or reading a job status.',
  },
  'tool-calling': {
    name: 'Tool calling',
    definition:
      'The agent requests a named operation with inputs. The surrounding application executes it and returns a result.',
  },
  idempotency: {
    name: 'Idempotency',
    definition:
      'Repeating the same intended operation does not create an additional effect. The service must recognize and safely handle retries.',
  },
  'system-of-record': {
    name: 'System of record',
    definition:
      'The authoritative system for a fact. For a ticket, that is the support system—not the agent’s completion message.',
  },
  timeout: {
    name: 'Timeout',
    definition:
      'The caller stops waiting for a response. The operation may still have succeeded or may still be running.',
  },
  uncertainty: {
    name: 'Uncertainty',
    definition:
      'The available evidence does not establish what happened. A missing response leaves the outcome unknown.',
  },
  retry: {
    name: 'Retry',
    definition:
      'Another attempt after an error or uncertain result. Retrying a write can repeat its effect unless designed safely.',
  },
  'side-effect': {
    name: 'Side effect',
    definition:
      'A change outside the agent’s conversation, such as creating a ticket or publishing a document.',
  },
  'outcome-verification': {
    name: 'Outcome verification',
    definition:
      'Checking the intended result in the authoritative system rather than trusting a success message.',
  },
  'acceptance-criteria': {
    name: 'Acceptance criteria',
    definition:
      'Observable requirements for correct completion. “Exactly one ticket exists” is a criterion.',
  },
  context: {
    name: 'Context',
    definition:
      'The information available for the agent’s current decision: instructions, history, and tool results.',
  },
  constraint: {
    name: 'Task constraint',
    definition:
      'A continuing restriction on how a task may be done, such as “draft only; do not publish.”',
  },
  harness: {
    name: 'Agent harness',
    definition:
      'The surrounding software that prepares context, runs tools, tracks progress, and enforces limits.',
  },
  compaction: {
    name: 'Compaction',
    definition:
      'Shortening accumulated context, usually by summarizing it. A lossy summary can omit an important instruction.',
  },
  'context-window': {
    name: 'Context window',
    definition:
      'The finite amount of input and output information a model can handle in a call. Accounting varies by model.',
  },
  authorization: {
    name: 'Authorization',
    definition:
      'An enforced decision about which actions are allowed. It must not depend solely on the model remembering a rule.',
  },
  'async-job': {
    name: 'Asynchronous job',
    definition:
      'Work that continues after a request has been accepted. Acceptance and completion are separate states.',
  },
  state: {
    name: 'State',
    definition:
      'Recorded facts at a particular point in time, such as whether a report is pending or completed.',
  },
}
