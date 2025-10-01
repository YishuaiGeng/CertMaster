#!/usr/bin/env python3
"""
更新前端 API 地址脚本
将 API 基础 URL 从 localhost:3001 改为 localhost:8000
将 API 路径从 /api/xxx 改为 /api/v1/xxx
"""
import re
from pathlib import Path

ROOT_DIR = Path(__file__).parent.parent
FRONTEND_API_FILE = ROOT_DIR / "frontend" / "src" / "utils" / "api.ts"

print("=" * 60)
print("🔄 更新前端 API 地址...")
print("=" * 60)

if not FRONTEND_API_FILE.exists():
    print(f"❌ 文件不存在: {FRONTEND_API_FILE}")
    exit(1)

# 读取文件
with open(FRONTEND_API_FILE, 'r', encoding='utf-8') as f:
    content = f.read()

# 备份原文件
backup_file = FRONTEND_API_FILE.with_suffix('.ts.backup')
with open(backup_file, 'w', encoding='utf-8') as f:
    f.write(content)
print(f"✅ 创建备份: {backup_file.name}")

# 更新 API 基础 URL
content = re.sub(
    r"const API_BASE_URL = 'http://localhost:3001/api';",
    "const API_BASE_URL = 'http://localhost:8000/api';",
    content
)

# 更新 API 路径（添加 v1）
api_endpoints = [
    'certificates',
    'configs',
    'templates'
]

for endpoint in api_endpoints:
    # /api/certificates -> /api/v1/certificates
    content = re.sub(
        rf'\${{API_BASE_URL}}/{endpoint}',
        f'${{API_BASE_URL}}/v1/{endpoint}',
        content
    )

# 保存更新后的文件
with open(FRONTEND_API_FILE, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✅ 更新 API 地址完成")
print(f"   {FRONTEND_API_FILE.relative_to(ROOT_DIR)}")
print("\n变更:")
print("  • API 端口: 3001 → 8000")
print("  • API 路径: /api/* → /api/v1/*")
print("\n" + "=" * 60)

