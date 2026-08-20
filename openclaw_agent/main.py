"""
OpenClaw Agent 主入口

在 OpenClaw 环境中运行时，本模块作为智能体核心被调度。
也可作为 Python 模块直接调用 plan_trip()。

用法（独立测试）:
    python openclaw_agent/main.py --query "新西兰南岛14天自驾"

作为模块导入:
    from openclaw_agent.main import run_planner
    result = run_planner("新西兰南岛14天自驾")
"""

import sys
import argparse
from pathlib import Path

_project_root = Path(__file__).resolve().parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from openclaw_agent.workflows.travel_planner import plan_trip


def run_planner(user_input: str) -> dict:
    """运行旅行规划器（供外部调用）"""
    return plan_trip(user_input)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NZ Travel Planner Agent")
    parser.add_argument("--query", "-q", type=str, default="新西兰南岛14天自驾",
                        help="旅行需求描述")
    args = parser.parse_args()

    print("\n" + "=" * 60)
    print("  🐱 NZ Travel Planner Agent")
    print("=" * 60)
    print(f"\n用户需求: {args.query}\n")

    result = plan_trip(args.query)

    print("\n" + "=" * 60)
    if result["success"]:
        if result["needs_more_info"]:
            print(f"\n📝 需要补充信息:\n{result['follow_up_question']}")
        elif result["plan"]:
            print(f"\n✅ 旅行计划已生成\n")
            print(result["plan"].get("raw_markdown", "")[:2000])
            if len(result["plan"].get("raw_markdown", "")) > 2000:
                print("\n...(内容截断)")
    else:
        print(f"\n❌ 生成失败: {result['error']}")
    print()
