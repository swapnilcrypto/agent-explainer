import { initialState, recorder } from '../simulation/engine'
import type { ScenarioDefinition } from '../simulation/types'

export const prematureDone: ScenarioDefinition = {
  id: 'premature-done',
  revision: 1,
  title: 'The premature “done”',
  shortTitle: 'The premature “done”',
  subtitle: 'Accepted is not completed.',
  topic: 'Tools & verification',
  description:
    'The tool accepts a request. The agent says “done.” There is just one problem: the report does not exist yet.',
  objective:
    'Distinguish request acceptance from task completion and verify the result in the system that owns it.',
  task: 'Generate my weekly report and tell me when it is ready.',
  repair: 'Verify before claiming completion',
  repairExplanation:
    'Read the job’s authoritative status. Acknowledge that it is pending, then report completion only after the job finishes and the report exists.',
  limitation:
    'Virtual time and job progress are scripted. Real polling needs deadlines, backoff, error handling, and a way to report failure or uncertainty instead of waiting forever.',
  takeaway: 'A successful tool call is not always a successful task.',
  sources: [
    {
      title: 'MDN: HTTP 202 Accepted',
      url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status/202',
    },
    {
      title: 'Microsoft: Asynchronous request-reply pattern',
      url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/async-request-reply',
    },
  ],
  initialConditions: initialState([
    'Generate the weekly report.',
    'Tell the user when the report is ready.',
  ]),
  simulate(variant, initialConditions) {
    const fixed = variant === 'repaired'
    const { state, frames, add } = recorder(initialConditions)
    add(
      {
        actor: 'User',
        label: 'Ask for a finished report',
        input: 'Generate my weekly report.',
        result: 'Task received.',
        change: 'No job or report exists yet.',
      },
      'context',
      'The goal is an available report, not merely a submitted request.',
      ['acceptance-criteria'],
    )
    add(
      {
        actor: 'Agent',
        label: 'Start the report job',
        input: 'generate_report("weekly")',
        result: 'Request sent.',
        change: 'The agent is waiting for an acknowledgement.',
      },
      'agent',
      'The report takes time to generate. The tool creates a background job.',
      ['tool-calling'],
    )
    add(
      {
        actor: 'Tool',
        label: 'The request is accepted',
        input: 'Create background job.',
        result: '202 Accepted · job RPT-208',
        change: 'Job status: accepted. Report: absent.',
      },
      'world',
      'Accepted means the request was received. It does not mean processing has completed.',
      ['async-job', 'system-of-record'],
      (s) => {
        s.world.job = 'accepted'
        s.context.push('Tool response: accepted, job RPT-208.')
      },
    )
    add(
      {
        actor: 'World',
        label: 'The job is still pending',
        input: 'Background worker prepares the report.',
        result: 'Status: pending.',
        change: 'The report still does not exist.',
      },
      'world',
      'The authoritative world state and the response the agent saw are different pieces of information.',
      ['state', 'uncertainty'],
      (s) => {
        s.world.job = 'pending'
      },
    )
    if (fixed) {
      add(
        {
          actor: 'Agent',
          label: 'Check before announcing success',
          input: 'get_job_status("RPT-208")',
          result: 'Pending. No report available.',
          change: 'The agent keeps the task open.',
        },
        'agent',
        'The repair checks the system of record and treats “pending” as unfinished.',
        ['outcome-verification'],
        (s) => {
          s.agentClaim = 'Your report is still being generated.'
          s.context.push('Verified status: pending.')
        },
      )
      add(
        {
          actor: 'World',
          label: 'The report finishes',
          input: 'Worker completes the job at the next virtual tick.',
          result: 'Status: completed. Report saved.',
          change: 'The report now exists.',
        },
        'world',
        'This deterministic virtual tick models the background operation finishing. No real waiting or external service is involved.',
        ['state'],
        (s) => {
          s.world.job = 'completed'
          s.world.reportExists = true
        },
      )
      add(
        {
          actor: 'Tool',
          label: 'Verify the completed result',
          input: 'get_job_status("RPT-208")',
          result: 'Completed · weekly-report.pdf exists.',
          change: 'The agent has evidence of completion.',
          tone: 'success',
        },
        'agent',
        'The completed job and available artifact satisfy the original requirement.',
        ['system-of-record', 'outcome-verification'],
        (s) => {
          s.context.push('Verified status: completed. Report exists.')
        },
      )
    }
    add(
      {
        actor: 'Agent',
        label: 'The agent says “done”',
        input: fixed ? 'Verified completed job and report.' : 'Earlier response: 202 Accepted.',
        result: '“Your weekly report is ready.”',
        change: fixed
          ? 'The claim matches the actual result.'
          : 'The claim arrives before the result.',
        tone: fixed ? 'success' : 'warning',
      },
      'agent',
      fixed
        ? 'The completion message is supported by a read of the authoritative state.'
        : 'The baseline mistakes acceptance for completion. Its confident wording does not make the report exist.',
      ['outcome-verification'],
      (s) => {
        s.agentClaim = 'Your weekly report is ready.'
      },
    )
    add(
      {
        actor: 'World',
        label: 'Check whether the report exists',
        input: 'Read job status and artifact existence.',
        result: `${state.world.job}. Report ${state.world.reportExists ? 'exists' : 'absent'}.`,
        change: fixed ? 'The task is actually complete.' : 'The task is not complete when claimed.',
        tone: fixed ? 'success' : 'warning',
      },
      'world',
      'The assessment checks the result at the moment of the completion claim. A later completion cannot make an earlier claim accurate.',
      ['acceptance-criteria'],
    )
    return frames
  },
  assess: (s) => ({
    passed: s.world.job === 'completed' && s.world.reportExists,
    headline: s.world.reportExists ? '“Done” means done.' : 'The report is not ready.',
    evidence: `Job status: ${s.world.job}. Report exists: ${s.world.reportExists ? 'yes' : 'no'}.`,
    value: s.world.reportExists ? 'Ready' : 'Not ready',
    label: 'report at completion claim',
  }),
}
