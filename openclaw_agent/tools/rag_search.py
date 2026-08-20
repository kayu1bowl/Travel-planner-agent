"""
RAG 知识库检索工具

直接调用王同学的 retriever.rag_search()，零改造。
兼容 FAISS 和 Chroma 双后端。

用例:
    >>> from openclaw_agent.tools.rag_search import rag_retrieve
    >>> result = rag_retrieve("新西兰南岛自驾路线推荐", top_k=5)
    >>> print(result)
"""

import sys
from pathlib import Path
from typing import Optional, Dict, Any

# 动态将项目根加入 sys.path（兼容直接运行工具脚本的场景）
_project_root = Path(__file__).resolve().parents[2]  # Travel-planner-agent/
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from openclaw_agent.config.agent_config import RAG_TOP_K


def rag_retrieve(
    query: str,
    top_k: int = RAG_TOP_K,
    where: Optional[Dict[str, Any]] = None,
) -> str:
    """从 RAG 知识库检索相关内容。

    Args:
        query: 检索关键词（中文或英文均可，embedding 模型支持多语言）
        top_k: 返回的片段数量，默认 5
        where: 可选的 metadata 过滤条件，如 {"category": "food"}
               (仅 Chroma 后端生效，FAISS 后端会忽略)

    Returns:
        格式化后的检索结果文本，直接供 LLM 阅读。
        若检索失败，返回以 ❌ 开头的错误信息。
    """
    from rag_knowledge_base.retriever.retriever import rag_search
    return rag_search(query, top_k=top_k, where=where)


def rag_retrieve_raw(
    query: str,
    top_k: int = RAG_TOP_K,
    where: Optional[Dict[str, Any]] = None,
) -> list[dict]:
    """获取原始结构化结果（供程序内进一步处理使用）。

    Returns:
        列表，每项含 content / metadata / score 字段
    """
    from rag_knowledge_base.retriever.retriever import RAGRetriever
    try:
        retriever = RAGRetriever(top_k=top_k)
        return retriever.search(query, where=where)
    except Exception as e:
        return []


def list_available_categories() -> list[str]:
    """列出知识库中所有可用的分类（如 food, driving, nature...）。

    通过检索一个空查询，从元数据中提取分类信息。
    """
    try:
        from rag_knowledge_base.retriever.retriever import RAGRetriever
        retriever = RAGRetriever(top_k=1)
        stats = retriever.count()
        return [f"总片段数: {stats}"]
    except Exception:
        return ["无法获取，请先构建知识库"]


if __name__ == "__main__":
    # 测试
    q = "皇后镇摄影最佳时间"
    print(f"🔍 检索: {q}")
    print("=" * 60)
    result = rag_retrieve(q)
    print(result)
