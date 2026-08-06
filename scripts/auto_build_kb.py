#!/usr/bin/env python3
import asyncio
import sys
from pathlib import Path
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from rag_knowledge_base.builder import build_kb_from_network, build_kb_from_local, kb_stats
import argparse


def main():
    parser = argparse.ArgumentParser(description="RAG 知识库自动构建")
    parser.add_argument("--mode", choices=["network", "local", "stats"], default="network")
    parser.add_argument("--incremental", action="store_true")
    args = parser.parse_args()

    if args.mode == "stats":
        kb_stats()
        return

    if args.mode == "network":
        if not args.incremental:
            if input("⚠️ 全量重建将清空现有数据，确认? [y/N]: ").lower() != 'y':
                return
        asyncio.run(build_kb_from_network(incremental=args.incremental))
    elif args.mode == "local":
        build_kb_from_local(incremental=args.incremental)


if __name__ == "__main__":
    main()