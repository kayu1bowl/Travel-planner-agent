#!/usr/bin/env python3
"""
RAG 知识库自动构建脚本

依赖于 builder.py 的运行时配置（os.environ），CLI 参数通过环境变量传递。
与 builder.py --mode 语义一致。

用法:
  python scripts/auto_build_kb.py --mode local --build-mode fast
  python scripts/auto_build_kb.py --mode network --no-qwen3 --no-classify --no-precision
  python scripts/auto_build_kb.py --mode stats
"""
import asyncio
import argparse
import os
import sys
from pathlib import Path

# ── 第一步：预先解析关键参数，设置环境变量，再 import 模块 ──
# (config.py 在 import 时就读 BUILD_MODE 了，所以必须先设好)
_parser = argparse.ArgumentParser(description="RAG 知识库自动构建", add_help=False)
_parser.add_argument("--build-mode", choices=["fast", "balanced", "precise"], default=None)
_parser.add_argument("--backend", choices=["chroma", "faiss"], default=None)
_parser.add_argument("--no-qwen3", action="store_true")
_parser.add_argument("--no-classify", action="store_true")
_parser.add_argument("--no-summary", action="store_true")
_parser.add_argument("--no-precision", action="store_true")
_parser.add_argument("--no-rerank", action="store_true")
_parser.add_argument("--no-bm25", action="store_true")
_parser.add_argument("--no-semantic-chunking", action="store_true")
_parser.add_argument("--use-hyde", action="store_true")
_early_args, _remaining_argv = _parser.parse_known_args()

# ── 在 import config 之前注入环境变量 ──
if _early_args.build_mode:
    os.environ["BUILD_MODE"] = _early_args.build_mode
if _early_args.backend:
    os.environ["VECTOR_BACKEND"] = _early_args.backend
if _early_args.no_qwen3:
    os.environ["CLEANER_BACKEND"] = "rule"
if _early_args.no_summary:
    os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
if _early_args.no_classify:
    os.environ["ENABLE_AUTO_CLASSIFY"] = "false"
if _early_args.no_precision:
    os.environ["ENABLE_PRECISION"] = "false"
if _early_args.no_rerank:
    os.environ["ENABLE_RERANK"] = "false"
if _early_args.no_bm25:
    os.environ["USE_BM25"] = "false"
if _early_args.no_semantic_chunking:
    os.environ["SEMANTIC_CHUNKING"] = "false"
if _early_args.use_hyde:
    os.environ["USE_HYDE"] = "true"

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


def _env_flag(name: str, default: str) -> str:
    return os.environ.get(name, default)


def _print_summary(args):
    """打印配置摘要"""
    print("\n" + "=" * 60)
    print("  🗺️  NZ Travel RAG 知识库构建器")
    print(f"  模式: {args.mode}")
    print(f"  --build-mode:         {_env_flag('BUILD_MODE', 'balanced')}")
    print(f"  --backend:            {_env_flag('VECTOR_BACKEND', 'faiss')}")
    print(f"  --no-qwen3:           {'skip' if _env_flag('CLEANER_BACKEND', 'qwen3') == 'rule' else _env_flag('CLEANER_BACKEND', 'qwen3')} "
          f"(-> CLEANER_BACKEND={_env_flag('CLEANER_BACKEND', 'qwen3')})")
    print(f"  --no-classify:        {_env_flag('ENABLE_AUTO_CLASSIFY', 'true')}")
    print(f"  --no-summary:         {_env_flag('ENABLE_ADVANCED_SUMMARY', 'true')}")
    print(f"  --no-precision:       {_env_flag('ENABLE_PRECISION', 'true')}")
    print(f"  --no-rerank:          {_env_flag('ENABLE_RERANK', 'true')}")
    print(f"  --no-bm25:            {_env_flag('USE_BM25', 'true')}")
    print(f"  --no-semantic-chunk:  {_env_flag('SEMANTIC_CHUNKING', 'true')}")
    print(f"  --use-hyde:           {_env_flag('USE_HYDE', 'false')}")
    print(f"  分片大小:              {_env_flag('CHUNK_SIZE', '512')}")
    print(f"  增量模式:              {'yes' if args.incremental else 'no'}")
    print("=" * 60 + "\n")


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
    parser.add_argument("--no-precision", action="store_true",
                        help="跳过精密等级评分")
    parser.add_argument("--no-rerank", action="store_true",
                        help="跳过检索重排")
    parser.add_argument("--no-bm25", action="store_true",
                        help="跳过 BM25 混合检索（仅建 BM25 索引）")
    parser.add_argument("--no-semantic-chunking", action="store_true",
                        help="关闭分层语义分片，使用纯 token 切分")
    parser.add_argument("--use-hyde", action="store_true",
                        help="启用 HyDE 假设文档检索（默认关闭）")
    parser.add_argument("--build-mode", choices=["fast", "balanced", "precise"], default=None,
                        help="构建模式: fast(最快/rule) balanced(均衡/1.5B) precise(最准/14B)")
    args = parser.parse_args()

    # 再次应用（覆盖可能被 import 覆盖的值）
    if args.build_mode:
        os.environ["BUILD_MODE"] = args.build_mode
    if args.backend:
        os.environ["VECTOR_BACKEND"] = args.backend
    if args.no_qwen3:
        os.environ["CLEANER_BACKEND"] = "rule"
    if args.no_summary:
        os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
    if args.no_classify:
        os.environ["ENABLE_AUTO_CLASSIFY"] = "false"
    if args.no_precision:
        os.environ["ENABLE_PRECISION"] = "false"
    if args.no_rerank:
        os.environ["ENABLE_RERANK"] = "false"
    if args.no_bm25:
        os.environ["USE_BM25"] = "false"
    if args.no_semantic_chunking:
        os.environ["SEMANTIC_CHUNKING"] = "false"
    if args.use_hyde:
        os.environ["USE_HYDE"] = "true"

    if args.mode == "stats":
        _print_summary(args)
        kb_stats(backend=args.backend)
        return

    _print_summary(args)

    if args.mode == "network":
        if not args.incremental:
            if input("⚠️ 全量重建将清空现有数据，确认? [y/N]: ").lower() != 'y':
                return
        asyncio.run(build_kb_from_network(incremental=args.incremental, backend=args.backend))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental, backend=args.backend)


if __name__ == "__main__":
    main()