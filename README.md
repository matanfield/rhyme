Just Rhyme is a Next.js app that sends your text to the Sim AI rhyming agent and returns a single rhyming word. The UI is styled with Tailwind CSS and shadcn/ui, and supports light/dark themes.

## Getting Started

Install dependencies and launch the dev server:

```bash
npm install
npm run dev
```

Visit [http://localhost:3001](http://localhost:3001) to use the app.

### Environment Variables

Create `.env.local` in the project root with your Sim AI API key:

```bash
SIM_API_KEY=your_sim_api_key_here
```

Restart the dev server after setting the environment variable so the API route can authenticate requests.

## Tech Stack

- Next.js App Router with React Server Components
- Tailwind CSS + shadcn/ui theming
- `next-themes` for persisted light/dark mode
- Proxy API route at `/api/rhyme` forwarding to the Sim AI workflow


See API call method and example in ./documentation/sim-api.md