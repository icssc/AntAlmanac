import { handleMcpHttpRequest } from '../controllers/mcp';

/**
 * Next.js route handlers for the MCP server and its OAuth endpoints. Mounted at
 * `/planner/api/mcp/[[...path]]` and at the root `/.well-known/oauth-*` discovery paths.
 */
export const GET = handleMcpHttpRequest;
export const POST = handleMcpHttpRequest;
export const DELETE = handleMcpHttpRequest;
export const OPTIONS = handleMcpHttpRequest;
