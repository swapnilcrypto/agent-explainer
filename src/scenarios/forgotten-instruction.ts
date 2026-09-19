import { initialState, recorder } from '../simulation/engine'
import type { ScenarioDefinition } from '../simulation/types'

const rule = 'Draft only. Do not publish.'
export const forgottenInstruction: ScenarioDefinition = {
  id: 'forgotten-instruction',
  revision: 1,
  title: 'The forgotten instruction',
  shortTitle: 'The forgotten instruction',
  subtitle: 'A shorter memory. A lost rule.',
  topic: 'Context & compaction',
  description:
    'The conversation gets compressed. A small instruction disappears—and changes what happens next.',
  objective:
    'See how a lossy summary can remove a continuing instruction, and how a separate constraint store can retain it.',
  task: 'Prepare the quarterly update as a draft. Do not publish it.',
  repair: 'Keep constraints outside compaction',
  repairExplanation:
    'Store the draft-only restriction separately from conversation history. Reattach it when preparing the next model context, even after the history is compressed.',
  limitation:
    'The rule-based agent in this example always follows a visible restriction. Real models may not. Retained instructions do not replace independent tool permissions and authorization.',
  takeaway: 'A shorter conversation should not mean a smaller set of obligations.',
  sources: [
    {
      title: 'Anthropic: Effective context engineering',
      url: 'https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents',
    },
    { title: 'Research: Lost in Compaction', url: 'https://arxiv.org/abs/2608.11242' },
  ],
  initialConditions: initialState([
    'Prepare the quarterly update.',
    rule,
    'Include product progress and customer feedback.',
  ]),
  simulate(variant, initialConditions) {
    const fixed = variant === 'repaired'
    const { state, frames, add } = recorder(initialConditions)
    add(
      {
        actor: 'User',
        label: 'An instruction with a boundary',
        input: 'Prepare the update. Draft only.',
        result: 'Task and restriction received.',
        change: 'The draft-only rule is in the conversation.',
      },
      'context',
      'The task includes both a goal and a restriction. Both matter for success.',
      ['context', 'constraint'],
    )
    add(
      {
        actor: 'Harness',
        label: fixed ? 'Retain the task constraint' : 'Keep rules in the conversation',
        input: rule,
        result: fixed ? 'Restriction saved separately.' : 'No separate constraint record.',
        change: fixed
          ? 'The restriction now survives history compression.'
          : 'The restriction depends on the conversation history.',
      },
      'context',
      fixed
        ? 'The harness retains this explicit constraint separately and supplies it on later steps.'
        : 'In this baseline, the conversation is the only place the restriction is recorded.',
      ['harness', 'constraint'],
      (s) => {
        if (fixed) s.constraints = [rule]
      },
    )
    add(
      {
        actor: 'Tool',
        label: 'Prepare the draft',
        input: 'save_draft("Quarterly update")',
        result: 'Draft saved.',
        change: 'An unpublished draft now exists.',
      },
      'world',
      'The work is currently within the user’s boundary. Nothing has been published.',
      ['side-effect'],
      (s) => {
        s.world.document.exists = true
        s.context.push('Draft saved. Product progress and feedback collected.')
        s.agentClaim = 'The draft is prepared.'
      },
    )
    add(
      {
        actor: 'Harness',
        label: 'Compress the conversation',
        input: 'Summarize accumulated history.',
        result: '“Quarterly update prepared. Finish the workflow.”',
        change: fixed
          ? 'The lossy summary is combined with the retained constraint.'
          : 'The draft-only restriction is lost.',
        tone: fixed ? 'neutral' : 'warning',
      },
      'context',
      'This intentionally lossy summary drops the restriction. Inspect the context: the repair supplies it from a separate record.',
      ['compaction', 'context-window'],
      (s) => {
        s.context = ['Quarterly update prepared. Finish the workflow.', ...s.constraints]
      },
    )
    const draftOnly = state.context.includes(rule)
    add(
      {
        actor: 'Agent',
        label: 'Choose the next action',
        input: state.context.join(' '),
        result: draftOnly ? 'Keep the document as a draft.' : 'Proceed to publish the update.',
        change: draftOnly
          ? 'The restriction is still visible.'
          : 'No draft-only restriction is visible.',
        tone: draftOnly ? 'success' : 'warning',
      },
      'agent',
      draftOnly
        ? 'This scripted policy checks for the restriction and stops before publishing.'
        : 'This scripted policy publishes when the restriction is absent. This demonstrates a possible failure, not universal model behavior.',
      ['agent', 'authorization'],
    )
    add(
      {
        actor: draftOnly ? 'Harness' : 'Tool',
        label: draftOnly ? 'Leave the draft unpublished' : 'The draft is published',
        input: draftOnly ? 'Finish without calling publish.' : 'publish_document()',
        result: draftOnly ? 'Unpublished draft retained.' : 'Update published.',
        change: draftOnly ? 'Publication state stays false.' : 'Publication state becomes true.',
        tone: draftOnly ? 'success' : 'warning',
      },
      'world',
      draftOnly
        ? 'The original task boundary is preserved.'
        : 'The publish tool is permissive in this simulation. Real authorization should independently prevent this action.',
      ['authorization', 'outcome-verification'],
      (s) => {
        s.world.document.published = !draftOnly
        s.agentClaim = draftOnly
          ? 'Your unpublished draft is ready.'
          : 'The quarterly update has been published.'
      },
    )
    add(
      {
        actor: 'World',
        label: 'Check the original instruction',
        input: 'A draft must exist and remain unpublished.',
        result: draftOnly ? 'Draft exists. Published: no.' : 'Draft exists. Published: yes.',
        change: draftOnly
          ? 'The original boundary is satisfied.'
          : 'The original boundary was violated.',
        tone: draftOnly ? 'success' : 'warning',
      },
      'world',
      'The assessment uses the original instruction and the document’s actual publication state—not the compressed summary.',
      ['acceptance-criteria'],
    )
    return frames
  },
  assess: (s) => ({
    passed: s.world.document.exists && !s.world.document.published,
    headline: s.world.document.published ? 'The draft went public.' : 'The draft stays a draft.',
    evidence: `Document exists: ${s.world.document.exists ? 'yes' : 'no'}. Published: ${s.world.document.published ? 'yes' : 'no'}. The original instruction forbids publication.`,
    value: s.world.document.published ? 'Published' : 'Unpublished',
    label: 'document state',
  }),
}
