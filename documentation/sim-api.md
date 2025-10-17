These are the instructions to call the "just-rhyme" Sim AI Agent API.
The agent accepts the user short text and returns a single rhyming word.

API Endpoint

https://www.sim.ai/api/workflows/3905b4c9-e21a-4778-8152-bcb0b8e7dc91/execute



Examples

Sync

curl -X POST -H "X-API-Key: $SIM_API_KEY" -H "Content-Type: application/json" https://www.sim.ai/api/workflows/3905b4c9-e21a-4778-8152-bcb0b8e7dc91/execute


Async


curl -X POST -H "X-API-Key: $SIM_API_KEY" -H "Content-Type: application/json" -d '{"just-rhyme":"example"}' https://www.sim.ai/api/workflows/3905b4c9-e21a-4778-8152-bcb0b8e7dc91/execute

