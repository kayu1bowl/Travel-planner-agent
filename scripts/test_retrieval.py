#!/usr/bin/env python3
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from rag_knowledge_base.retriever.retriever import RAGRetriever


def main():
    retriever = RAGRetriever(top_k=3)
    queries = [
        "新西兰南岛自驾路线推荐",
        "皇后镇摄影机位",
        "新西兰最佳旅行季节",
        "新西兰租车注意事项",
        "米尔福德峡湾游玩攻略"
    ]
    for q in queries:
        print(f"\n{'='*50}")
        print(f"🔍 {q}")
        results = retriever.search(q)
        if results:
            for i, r in enumerate(results[:2], 1):
                print(f"  {i}. [{r['metadata'].get('category')}] {r['content'][:100]}...")
        else:
            print("  ⚠️ 无结果")


if __name__ == "__main__":
    main()