#!/usr/bin/env python3
"""
RAG 知识库自动构建脚本

依赖于 builder.py 的运行时配置（os.environ），CLI 参数通过环境变量传递。
与 builder.py --mode 语义一致。
"""
import asyncio
import os
import sys
from pathlib import Path

# 动态查找项目根
_root = Path(__file__).resolve()
for p in [_root, *_root.parents]:
    if (p / "rag_knowledge_base").is_dir():
        PROJECT_ROOT = p
        break
else:
    PROJECT_ROOT = _root.parent
sys.path.insert(0, str(PROJECT_ROOT))

from rag_knowledge_base.builder import build_kb_from_network, build_kb_from_local, kb_stats
import argparse


def main():
    parser = argparse.ArgumentParser(description="RAG 知识库自动构建")
    parser.add_argument("--mode", choices=["network", "local", "stats"], default="network",
                        help="构建模式: local=本地raw文件 | network=网络抓取 | stats=查看统计")
    parser.add_argument("--incremental", action="store_true",
                        help="增量模式，不清空已有数据")
    parser.add_argument("--raw-dir", default=None,
                        help="raw 数据目录（仅 local 模式）")
    parser.add_argument("--backend", choices=["chroma", "faiss"], default=None,
                        help="向量后端（默认 config.VECTOR_BACKEND）")
    parser.add_argument("--no-qwen3", action="store_true",
                        help="跳过 Qwen3-14B，使用纯规则清洗（快速测试用）")
    parser.add_argument("--no-classify", action="store_true",
                        help="跳过智能分类，全部归为 general")
    parser.add_argument("--no-summary", action="store_true",
                        help="跳过文档级智能总结")
    args = parser.parse_args()

    # 通过环境变量将 CLI 参数传递给下层运行时配置
    if args.no_qwen3:
        os.environ["CLEANER_BACKEND"] = "rule"
    if args.no_summary:
        os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
    if args.no_classify:
        os.environ["ENABLE_AUTO_CLASSIFY"] = "false"

    if args.mode == "stats":
        kb_stats(backend=args.backend)
        return

    if args.mode == "network":
        if not args.incremental:
            if input("⚠️ 全量重建将清空现有数据，确认? [y/N]: ").lower() != 'y':
                return
        asyncio.run(build_kb_from_network(incremental=args.incremental, backend=args.backend))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental, backend=args.backend)


if __name__ == "__main__":
    main()