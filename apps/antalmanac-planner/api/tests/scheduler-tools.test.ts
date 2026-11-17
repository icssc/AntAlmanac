import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    authenticated: true,
    allowed: true,
    rateLimit: vi.fn(),
    getSchedules: vi.fn(),
    getSchedule: vi.fn(),
    searchSections: vi.fn(),
    writeAiSchedule: vi.fn(),
}));
vi.mock('../src/controllers/mcp/provider', () => ({ userIdFromAuthInfo: () => (mocks.authenticated ? 6 : undefined) }));
vi.mock('../src/controllers/mcp/rateLimit', () => ({
    consumeRateLimit: mocks.rateLimit,
    nextResetDate: () => new Date('2026-11-17'),
}));
vi.mock('../src/controllers/mcp/scheduler', () => ({
    getSchedules: mocks.getSchedules,
    getSchedule: mocks.getSchedule,
    searchSections: mocks.searchSections,
    writeAiSchedule: mocks.writeAiSchedule,
}));

import { registerSchedulerTools } from '../src/controllers/mcp/tools/scheduler';

let client: Client;
let server: McpServer;
beforeEach(async () => {
    vi.clearAllMocks();
    mocks.authenticated = true;
    mocks.allowed = true;
    mocks.rateLimit.mockImplementation(async () => ({ allowed: mocks.allowed, limit: 200 }));
    mocks.getSchedules.mockResolvedValue([]);
    mocks.writeAiSchedule.mockResolvedValue({ id: 'persistent', name: 'ai-schedule' });
    client = new Client({ name: 'scheduler-test', version: '1.0.0' });
    server = new McpServer({ name: 'scheduler-test', version: '1.0.0' });
    registerSchedulerTools(server);
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    await server.connect(serverTransport);
    await client.connect(clientTransport);
});
afterEach(async () => {
    await client.close();
    await server.close();
});

describe('scheduler MCP protocol and guard', () => {
    it('discovers all five tools without deletion or sharing controls', async () => {
        expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual([
            'get_schedules',
            'get_schedule',
            'search_sections',
            'create_ai_schedule',
            'update_ai_schedule',
        ]);
    });
    it('routes reads and consumes the existing shared quota with authenticated identity', async () => {
        await client.callTool({ name: 'get_schedules', arguments: {} });
        expect(mocks.getSchedules).toHaveBeenCalledWith(6);
        expect(mocks.rateLimit).toHaveBeenCalledWith(6);
    });
    it('denies unauthenticated and quota-exhausted requests before accessing storage', async () => {
        mocks.authenticated = false;
        expect(await client.callTool({ name: 'get_schedules', arguments: {} })).toMatchObject({ isError: true });
        expect(mocks.rateLimit).not.toHaveBeenCalled();
        mocks.authenticated = true;
        mocks.allowed = false;
        const result = await client.callTool({ name: 'get_schedules', arguments: {} });
        expect(result).toMatchObject({
            isError: true,
            content: [{ text: expect.stringContaining('Daily MCP request limit') }],
        });
        expect(mocks.getSchedules).not.toHaveBeenCalled();
    });
    it('keeps omitted fields absent and forwards clear arrays with the persistent ID', async () => {
        await client.callTool({
            name: 'update_ai_schedule',
            arguments: { scheduleId: 'persistent', sections: [], notes: '' },
        });
        expect(mocks.writeAiSchedule).toHaveBeenCalledWith(6, { sections: [], notes: '' }, 'persistent');
        await client.callTool({ name: 'create_ai_schedule', arguments: {} });
        expect(mocks.writeAiSchedule).toHaveBeenLastCalledWith(6, {});
    });
    it('reports invalid inputs and storage failures as readable MCP errors', async () => {
        expect(await client.callTool({ name: 'search_sections', arguments: { term: 'nonsense' } })).toMatchObject({
            isError: true,
        });
        expect(mocks.searchSections).not.toHaveBeenCalled();
        mocks.getSchedules.mockRejectedValue(new Error('Sign into the scheduler first.'));
        expect(await client.callTool({ name: 'get_schedules', arguments: {} })).toMatchObject({
            isError: true,
            content: [{ text: 'Sign into the scheduler first.' }],
        });
    });
});
