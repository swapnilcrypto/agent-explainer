export interface LearningQuestion {
  prompt: string
  correctOption: string
  options: { id: string; label: string; explanation: string }[]
}

export interface LessonQuestions {
  prediction: LearningQuestion
  reflection: LearningQuestion
}

// Teaching prompts are supplementary UI content, separate from immutable simulation frames.
// Match an exact scenario revision so a future experiment cannot inherit an obsolete answer.
export const lessonQuestions: Record<string, LessonQuestions> = {
  'duplicate-action@1': {
    prediction: {
      prompt:
        'The first ticket is created, but its response is lost. Without the repair, what will the retry do?',
      correctOption: 'duplicate',
      options: [
        {
          id: 'reuse',
          label: 'Automatically return the first ticket.',
          explanation:
            'The baseline tool has no operation key to recognize this retry. It treats the second request as another create operation.',
        },
        {
          id: 'duplicate',
          label: 'Create a second ticket.',
          explanation:
            'The first write succeeded. Without idempotency, the retry makes another write, so two tickets exist.',
        },
        {
          id: 'undo',
          label: 'Undo the first ticket before trying again.',
          explanation:
            'Losing a response does not undo a successful write. The original ticket remains, and the retry creates a second one.',
        },
      ],
    },
    reflection: {
      prompt: 'Why is there only one ticket after the repair?',
      correctOption: 'same-key',
      options: [
        {
          id: 'no-retry',
          label: 'The agent stops retrying.',
          explanation:
            'The retry still happens. The tool recognizes the same operation key and returns its original result without creating another ticket.',
        },
        {
          id: 'faster',
          label: 'The tool replies faster this time.',
          explanation:
            'The first response is still lost. The repair changes how the tool handles the repeated operation, not the response speed.',
        },
        {
          id: 'same-key',
          label: 'The tool recognizes the same operation key and reuses its result.',
          explanation:
            'Exactly. Both attempts identify one intended operation. The service must store and enforce that relationship; attaching a key alone is not enough.',
        },
      ],
    },
  },
  'forgotten-instruction@1': {
    prediction: {
      prompt:
        'The summary drops “draft only.” What will this rule-based agent do next without the repair?',
      correctOption: 'publish',
      options: [
        {
          id: 'publish',
          label: 'Publish the update.',
          explanation:
            'This scripted policy publishes when the restriction is missing from its current context. That illustrates a possible failure, not universal model behavior.',
        },
        {
          id: 'remember',
          label: 'Remember the original rule automatically.',
          explanation:
            'The baseline has no separate constraint record. Once the summary drops the restriction, this simulated agent no longer sees it and publishes.',
        },
        {
          id: 'permission',
          label: 'Automatically ask for permission.',
          explanation:
            'This scripted policy does not ask for permission, and its publish tool is permissive. It publishes after losing the rule; a real system should enforce authorization independently.',
        },
      ],
    },
    reflection: {
      prompt: 'Why does the repaired run leave the document unpublished?',
      correctOption: 'retained-rule',
      options: [
        {
          id: 'perfect-summary',
          label: 'Compression now preserves every detail.',
          explanation:
            'The summary is still lossy. The draft-only rule survives because the harness retains it separately and adds it back to the next context.',
        },
        {
          id: 'retained-rule',
          label: 'The harness supplies the separately retained restriction.',
          explanation:
            'Exactly. The rule is visible again, so this simulated policy follows it. Real models may still disobey; permissions must independently constrain publication.',
        },
        {
          id: 'guarantee',
          label: 'Retaining an instruction guarantees every model will obey it.',
          explanation:
            'Keeping a rule visible does not guarantee real-model compliance. This simulation follows a visible rule by construction; production tools still need independent permissions.',
        },
      ],
    },
  },
  'premature-done@1': {
    prediction: {
      prompt:
        'The report tool returns “202 Accepted.” What is true at that moment in this simulation?',
      correctOption: 'accepted',
      options: [
        {
          id: 'ready',
          label: 'The report already exists and is ready.',
          explanation:
            'The response acknowledges the request. The job has been accepted, but the report does not exist yet.',
        },
        {
          id: 'failed',
          label: 'The job has failed.',
          explanation:
            'Accepted is not a failure. The background job can continue, but a successful acknowledgement does not establish that the report is ready.',
        },
        {
          id: 'accepted',
          label: 'The request is accepted, but the report is not ready.',
          explanation:
            'Exactly. Request acceptance and task completion are different facts. The world state shows no report at this point.',
        },
      ],
    },
    reflection: {
      prompt: 'What justifies the repaired agent saying “done”?',
      correctOption: 'verified',
      options: [
        {
          id: 'verified',
          label: 'It checks that the job completed and the report exists.',
          explanation:
            'Exactly. The completion claim follows evidence from the authoritative system, rather than relying on the initial acknowledgement.',
        },
        {
          id: 'delay',
          label: 'It waits a fixed amount of time and assumes success.',
          explanation:
            'Elapsed time alone is not proof. The repaired agent reads the job status and confirms that the report exists before claiming completion.',
        },
        {
          id: 'accepted',
          label: 'It trusts the first “Accepted” response.',
          explanation:
            'That is the baseline mistake. The repair checks the later completed state and the actual report before announcing success.',
        },
      ],
    },
  },
}

export function getLessonQuestions(id: string, revision: number) {
  return lessonQuestions[`${id}@${revision}`]
}
