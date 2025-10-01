#!/usr/bin/env python3
"""
清理脚本 - 删除重构后的旧文件
"""
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent

print("=" * 60)
print("🧹 开始清理旧文件...")
print("=" * 60)

# 要删除的文件和目录
items_to_remove = [
    "server",
    "src",
    "public",
    "index.html",
    "node_modules",
    "package.json",
    "package-lock.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.node.json",
    "tailwind.config.js",
    "postcss.config.js",
    "templates",
    "DEPLOYMENT.md",
    "START.md",
    "WHY_TWO_NODE_MODULES.md"
]

for item in items_to_remove:
    item_path = ROOT_DIR / item
    if item_path.exists():
        try:
            if item_path.is_dir():
                shutil.rmtree(item_path)
                print(f"  ✅ 删除目录: {item}")
            else:
                item_path.unlink()
                print(f"  ✅ 删除文件: {item}")
        except Exception as e:
            print(f"  ❌ 删除失败 {item}: {e}")
    else:
        print(f"  ⏭️  跳过: {item} (不存在)")

print("\n" + "=" * 60)
print("✅ 清理完成！")
print("=" * 60)
print("\n现在的项目结构:")
print("""
CertMaster/
├── frontend/           # 前端
├── backend/            # 后端
├── data/               # 数据
├── docs/               # 文档
├── scripts/            # 脚本
└── README.md
""")

