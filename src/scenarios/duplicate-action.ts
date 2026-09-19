import { createTicket, initialState, recorder } from '../simulation/engine'
import type { ScenarioDefinition } from '../simulation/types'

export const duplicateAction: ScenarioDefinition = {
  id: 'duplicate-action',
  revision: 1,
  title: 'The duplicate action',
  shortTitle: 'The duplicate action',
  subtitle: 'One request. Two tickets.',
  topic: 'Retries & idempotency',
  description:
    'A tool succeeds, but its response gets lost. Does trying again make things better—or twice as bad?',
  objective:
    'Understand why retrying an uncertain operation can duplicate its effect, and how idempotency makes the retry safe.',
  task: 'Create one support ticket to change my delivery address.',
  repair: 'Reuse an idempotency key',
  repairExplanation:
    'Both attempts carry the same operation key. The tool remembers the first result and returns it on retry, instead of creating another ticket.',
  limitation:
    'This simulation models a tool that stores its idempotency result atomically with the ticket. Real services must implement this guarantee; attaching a key alone is not enough.',
  takeaway: 'A missing response is not proof that an action failed.',
  sources: [
    {
      title: 'AWS: Making retries safe with idempotent APIs',
      url: 'https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/',
    },
    {
      title: 'Stripe: Idempotent requests',
      url: 'https://docs.stripe.com/api/idempotent_requests',
    },
  ],
  initialConditions: initialState([
    'Create one support ticket.',
    'Subject: Delivery address change.',
  ]),
  simulate(variant, initialConditions) {
    const fixed = variant === 'repaired'
    const key = fixed ? 'address-change-001' : undefined
    const { state, frames, add } = recorder(initialConditions)
    const request = fixed
      ? 'create_ticket(subject, key: "address-change-001")'
      : 'create_ticket(subject)'
    add(
      {
        actor: 'User',
        label: 'A simple request',
        input: 'Create one support ticket.',
        result: 'Task received.',
        change: 'No tickets exist yet.',
      },
      'context',
      'The goal is one ticket. Watch the difference between what the agent sees and what the tool actually does.',
      ['agent', 'tool'],
    )
    add(
      {
        actor: 'Agent',
        label: 'Call the tool',
        input: request,
        result: 'Request sent.',
        change: fixed
          ? 'The request carries a stable operation key.'
          : 'The request has no operation key.',
      },
      'agent',
      fixed
        ? 'The harness assigns one key to this intended operation, and will reuse it for retries.'
        : 'The agent asks the support tool to create a ticket.',
      ['tool-calling', 'idempotency'],
    )
    add(
      {
        actor: 'Tool',
        label: 'The ticket is created',
        input: request,
        result: 'TKT-1042 created.',
        change: 'The support system now has one ticket.',
      },
      'world',
      'The write succeeds. This fact exists in the support system even before the agent receives a response.',
      ['system-of-record'],
      (s) => {
        createTicket(s.world, key)
      },
    )
    add(
      {
        actor: 'Tool',
        label: 'The response gets lost',
        input: 'Return TKT-1042 to the agent.',
        result: 'Timeout. No response received.',
        change: 'The ticket still exists. The agent does not know that.',
        tone: 'warning',
      },
      'agent',
      'Only the response was lost. A timeout leaves the outcome uncertain; it does not roll back the write.',
      ['timeout', 'uncertainty'],
      (s) => {
        s.context.push('Tool response: timeout.')
        s.agentClaim = 'I did not receive a result.'
      },
    )
    add(
      {
        actor: 'Agent',
        label: 'Try the request again',
        input: request,
        result: 'Retry sent.',
        change: fixed
          ? 'The exact same operation key is reused.'
          : 'The tool sees a new create request.',
        tone: fixed ? 'neutral' : 'warning',
      },
      'agent',
      fixed
        ? 'The retry refers to the original operation, not a new one.'
        : 'The agent retries. Without an operation identifier, the tool cannot distinguish this retry from a second request.',
      ['retry', 'idempotency'],
    )
    const retry = createTicket(state.world, key)
    add(
      {
        actor: 'Tool',
        label: retry.reused ? 'Return the original ticket' : 'A second ticket is created',
        input: request,
        result: `${retry.id} ${retry.reused ? 'reused' : 'created'}.`,
        change: `The support system has ${state.world.tickets.length} ${state.world.tickets.length === 1 ? 'ticket' : 'tickets'}.`,
        tone: retry.reused ? 'success' : 'warning',
      },
      'world',
      retry.reused
        ? 'The stored key points to TKT-1042. The tool returns that result without another write.'
        : 'Both calls succeeded. The agent has only seen the response to the second one.',
      ['idempotency', 'side-effect'],
    )
    add(
      {
        actor: 'Agent',
        label: 'The agent reports success',
        input: `${retry.id} returned.`,
        result: '“Your support ticket is ready.”',
        change: 'The agent claims the task is complete.',
      },
      'agent',
      'A plausible completion message does not establish how many tickets were created.',
      ['outcome-verification'],
      (s) => {
        s.agentClaim = 'Your support ticket is ready.'
      },
    )
    add(
      {
        actor: 'World',
        label: 'Check the actual outcome',
        input: 'Count tickets in the support system.',
        result: `${state.world.tickets.length} ${state.world.tickets.length === 1 ? 'ticket' : 'tickets'} found.`,
        change: fixed
          ? 'The one-ticket requirement is satisfied.'
          : 'The one-ticket requirement is violated.',
        tone: fixed ? 'success' : 'warning',
      },
      'world',
      fixed
        ? 'Same lost response, same retry—one ticket. The repair changes the tool’s treatment of repeated operations.'
        : 'The task required one ticket. Two exist. The failure is in the real effect, even though the agent sounded successful.',
      ['acceptance-criteria', 'system-of-record'],
    )
    return frames
  },
  assess: (s) => ({
    passed: s.world.tickets.length === 1,
    headline:
      s.world.tickets.length === 1 ? 'One request. One ticket.' : 'One request. Two tickets.',
    evidence: `The support system contains ${s.world.tickets.length} ticket${s.world.tickets.length === 1 ? '' : 's'} for one intended request.`,
    value: String(s.world.tickets.length),
    label: 'tickets created',
  }),
}
