import os
import sys
import json
import logging
import asyncio

from langgraph.graph import StateGraph, START, END
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from backend.agent.state import AgentState
from backend.config import MCP_SERVER_PATH

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

SEVERITY_ORDER = {"Critical": 0, "Warning": 1, "Normal": 2}


async def _call_mcp_tool(session: ClientSession, tool_name: str, arguments: dict) -> dict:
    result = await session.call_tool(tool_name, arguments=arguments)
    text = result.content[0].text if result.content else "{}"
    return json.loads(text)


async def classify_node(state: AgentState) -> dict:
    labs = state["labs"]
    if not labs:
        return {"classified": []}

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[MCP_SERVER_PATH],
    )

    async def _classify_single(session: ClientSession, lab: dict) -> dict:
        try:
            result = await _call_mcp_tool(session, "classify_value", {
                "test_name": lab["test_name"],
                "value": str(lab["value"]),
                "unit": lab["unit"],
            })
            return {
                "test_name": lab["test_name"],
                "value": str(lab["value"]),
                "unit": lab["unit"],
                "status": result.get("status", "Warning"),
                "reference_range": result.get("reference_range", "Unknown"),
            }
        except Exception as e:
            logger.error(f"Classification error for {lab['test_name']}: {e}")
            return {
                "test_name": lab["test_name"],
                "value": str(lab["value"]),
                "unit": lab["unit"],
                "status": "Warning",
                "reference_range": "Error during classification",
            }

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            classified = await asyncio.gather(*[_classify_single(session, lab) for lab in labs])

    return {"classified": list(classified)}


async def route_node(state: AgentState) -> dict:
    classified = state["classified"]
    routed = sorted(classified, key=lambda x: SEVERITY_ORDER.get(x["status"], 1))
    return {"routed": routed}


async def explain_node(state: AgentState) -> dict:
    routed = state["routed"]
    if not routed:
        return {"results": []}

    server_params = StdioServerParameters(
        command=sys.executable,
        args=[MCP_SERVER_PATH],
    )

    async def _explain_single(session: ClientSession, item: dict) -> dict:
        try:
            result = await _call_mcp_tool(session, "generate_explanation", {
                "test_name": item["test_name"],
                "value": item["value"],
                "unit": item["unit"],
                "status": item["status"],
                "reference_range": item["reference_range"],
            })
            return {
                **item,
                "explanation": result.get("explanation", "No explanation available."),
                "next_step": result.get("next_step", "Consult healthcare provider."),
            }
        except Exception as e:
            logger.error(f"Explanation error for {item['test_name']}: {e}")
            return {
                **item,
                "explanation": f"{item['test_name']} is {item['status']}.",
                "next_step": "Consult healthcare provider.",
            }

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            results = await asyncio.gather(*[_explain_single(session, item) for item in routed])

    return {"results": list(results)}


def build_graph() -> StateGraph:
    graph = StateGraph(AgentState)

    graph.add_node("classify", classify_node)
    graph.add_node("route", route_node)
    graph.add_node("explain", explain_node)

    graph.add_edge(START, "classify")
    graph.add_edge("classify", "route")
    graph.add_edge("route", "explain")
    graph.add_edge("explain", END)

    return graph.compile()


agent = build_graph()
