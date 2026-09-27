# Nugen Intelligence — EventFlow Role Assistant

Nugen is implemented as a **separate aligned AI feature**, not as part of the Weather Digital Twin.

## Mandatory HackCelestial chain

`Base model -> Nugen alignment/customization -> EventFlow Role Assistant model -> deployed aligned model -> runtime inference`

The domain corpus is:

`nugen/eventflow-role-assistant-corpus.txt`

It teaches EventFlow terminology and strict role boundaries for:

- attendee tickets, event hub, indoor navigation, help requests and notifications,
- organizer events, published indoor maps, live attendee counts, volunteer dispatch and crowd operations,
- operator resources, capacity, field assignments, checklists and notifications,
- EventFlow weather operations terminology where it is already part of the role context.

The runtime assistant is intentionally **role scoped**. An attendee request receives attendee context only; organizer and operator data are not included. The same isolation applies to the other roles. The server prompt also instructs the aligned model to refuse requests for another role's private context or unrelated general information.

## One-command alignment

Set the private key only in your shell/server environment, then run:

```bash
export NUGEN_API_KEY='YOUR_PRIVATE_KEY'
npm run nugen:align
```

The script:

1. verifies the alignment-ready base model,
2. uploads the EventFlow role-assistant corpus,
3. waits for document processing,
4. creates the Nugen alignment project,
5. waits for alignment completion,
6. resolves the aligned model ID,
7. deploys the aligned model,
8. waits for deployment,
9. runs an aligned-model smoke inference,
10. writes non-secret IDs to `.nugen.env.generated`.

## Vercel environment variables

```text
NUGEN_API_KEY=your-private-key
NUGEN_MODEL_ID=model_...
NUGEN_ALIGNMENT_ID=alignment_...
NUGEN_BASE_MODEL=qwen-v2p5-0p5b-instruct
NUGEN_ALIGNMENT_NAME=EventFlow Role Assistant Intelligence
```

Never prefix the API key with `VITE_` and never commit it to GitHub.

## Runtime integration

The chatbot is mounted in all three authenticated shells:

- Attendee
- Organizer
- Operator

The frontend calls:

`POST /api/nugen/chat`

The server calls Nugen with `NUGEN_MODEL_ID`, a strict role-isolation system prompt, and only the requesting role's current EventFlow context.

This makes Nugen a distinct aligned AI assistant while the Weather Digital Twin remains a separate deterministic/live-data feature.
