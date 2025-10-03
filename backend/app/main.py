"""
CertMaster 后端服务 - FastAPI
"""
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
import base64
from datetime import datetime
from pathlib import Path
import uuid

# 创建 FastAPI 应用
app = FastAPI(
    title="CertMaster API",
    description="证书制作系统后端 API",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000", "http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件目录（前端构建产物）
STATIC_DIR = Path(__file__).parent.parent / "static"
if STATIC_DIR.exists():
    assets_dir = STATIC_DIR / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
        print(f"✅ 静态资源目录已挂载: {assets_dir}")
    print(f"✅ 静态文件目录存在: {STATIC_DIR}")

# 数据目录配置
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
CERTIFICATES_DIR = DATA_DIR / "certificates"
CONFIGS_DIR = DATA_DIR / "configs"
TEMPLATES_DIR = DATA_DIR / "templates"

# 数据文件
CERTIFICATES_JSON = DATA_DIR / "certificates.json"
TEMPLATES_JSON = DATA_DIR / "templates.json"

# 初始化数据目录
def init_directories():
    """初始化所有必要的目录"""
    directories = [DATA_DIR, CERTIFICATES_DIR, CONFIGS_DIR, TEMPLATES_DIR]
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
    
    # 初始化 JSON 文件
    if not CERTIFICATES_JSON.exists():
        CERTIFICATES_JSON.write_text("[]", encoding="utf-8")
    if not TEMPLATES_JSON.exists():
        TEMPLATES_JSON.write_text("[]", encoding="utf-8")
    
    print("✅ 数据目录初始化完成")

# 启动时初始化
@app.on_event("startup")
async def startup_event():
    init_directories()
    print("\n" + "="*60)
    print("🚀 CertMaster 后端服务已启动！(FastAPI)")
    print("="*60)
    print(f"📍 服务地址: http://localhost:8000")
    print(f"📁 数据目录: {DATA_DIR}")
    print(f"📜 证书存储: {CERTIFICATES_DIR}")
    print(f"⚙️  配置存储: {CONFIGS_DIR}")
    print(f"📚 API 文档: http://localhost:8000/api/docs")
    print("="*60 + "\n")

# 挂载静态文件（仅当目录存在且不为空时）
# 注意：StaticFiles 要求目录必须存在，所以我们只在有内容时才挂载
# if CERTIFICATES_DIR.exists() and any(CERTIFICATES_DIR.iterdir()):
#     app.mount("/data/certificates", StaticFiles(directory=str(CERTIFICATES_DIR)), name="certificates")
# if CONFIGS_DIR.exists() and any(CONFIGS_DIR.iterdir()):
#     app.mount("/data/configs", StaticFiles(directory=str(CONFIGS_DIR)), name="configs")

# ==================== 数据模型 ====================

class CertificateData(BaseModel):
    id: str
    title: str
    name: str
    content: str
    guidanceUnit: str
    certNumber: str
    authTime: str
    authUnit: str
    certificateTemplateId: str
    stampTemplateId: str
    watermarkTemplateId: str
    createdAt: str
    filename: Optional[str] = None
    filepath: Optional[str] = None
    savedAt: Optional[str] = None

class CertificateSaveRequest(BaseModel):
    certificateData: CertificateData
    imageData: str

class TemplateConfig(BaseModel):
    name: Optional[Dict[str, Any]] = None
    content: Optional[Dict[str, Any]] = None
    guidanceUnit: Optional[Dict[str, Any]] = None
    certNumber: Optional[Dict[str, Any]] = None
    authTime: Optional[Dict[str, Any]] = None
    authUnit: Optional[Dict[str, Any]] = None
    stamp: Optional[Dict[str, Any]] = None
    defaultContent: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    timestamp: str
    version: str

# ==================== 工具函数 ====================

def clean_name(name: str) -> str:
    """清理姓名，提取真正的姓名部分"""
    if not name:
        return "unnamed"
    
    cleaned = name
    
    # 如果包含冒号，只保留冒号之前的内容
    if '：' in cleaned:
        cleaned = cleaned.split('：')[0]
    elif ':' in cleaned:
        cleaned = cleaned.split(':')[0]
    
    # 去掉常见的前缀
    for prefix in ['亲爱的', '尊敬的', '敬爱的']:
        if cleaned.startswith(prefix):
            cleaned = cleaned[len(prefix):]
    
    # 去掉常见的后缀
    for suffix in ['同学', '老师', '先生', '女士']:
        if cleaned.endswith(suffix):
            cleaned = cleaned[:-len(suffix)]
    
    # 去掉空格
    cleaned = cleaned.strip()
    
    return cleaned if cleaned else "unnamed"

def generate_filename(name: str, title: str) -> str:
    """生成证书文件名"""
    timestamp = datetime.now()
    date_str = timestamp.strftime("%Y-%m-%d")
    timestamp_ms = int(timestamp.timestamp() * 1000)
    
    # 清理姓名
    cleaned_name = clean_name(name)
    
    # 处理特殊字符（保留中文）
    safe_name = "".join(c if c.isalnum() or '\u4e00' <= c <= '\u9fff' else "_" for c in cleaned_name)
    
    # 文件名格式：证书_姓名_日期_时间戳.png
    return f"证书_{safe_name}_{date_str}_{timestamp_ms}.png"

def read_json_file(file_path: Path) -> List[Dict]:
    """读取 JSON 文件"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"读取文件失败 {file_path}: {e}")
        return []

def write_json_file(file_path: Path, data: List[Dict]):
    """写入 JSON 文件"""
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

# ==================== API 路由 ====================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """健康检查"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.get("/api/v1/certificates", response_model=List[CertificateData])
async def get_certificates():
    """获取所有证书"""
    try:
        certificates = read_json_file(CERTIFICATES_JSON)
        return certificates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取证书列表失败: {str(e)}")

@app.post("/api/v1/certificates")
async def save_certificate(request: CertificateSaveRequest):
    """保存证书"""
    try:
        cert_data = request.certificateData
        image_data = request.imageData
        
        # 生成文件名
        filename = generate_filename(cert_data.name, cert_data.title)
        filepath = CERTIFICATES_DIR / filename
        
        # 保存图片
        if image_data.startswith("data:image"):
            image_data = image_data.split(",")[1]
        
        with open(filepath, "wb") as f:
            f.write(base64.b64decode(image_data))
        
        # 读取证书列表
        certificates = read_json_file(CERTIFICATES_JSON)
        
        # 创建证书记录
        new_certificate = cert_data.dict()
        new_certificate["filename"] = filename
        new_certificate["filepath"] = f"/data/certificates/{filename}"
        new_certificate["savedAt"] = datetime.now().isoformat()
        
        # 更新或添加证书
        existing_index = next((i for i, c in enumerate(certificates) if c["id"] == cert_data.id), None)
        if existing_index is not None:
            # 删除旧文件
            old_filename = certificates[existing_index].get("filename")
            if old_filename:
                old_filepath = CERTIFICATES_DIR / old_filename
                if old_filepath.exists():
                    old_filepath.unlink()
            certificates[existing_index] = new_certificate
        else:
            certificates.append(new_certificate)
        
        # 保存更新后的列表
        write_json_file(CERTIFICATES_JSON, certificates)
        
        return {
            "success": True,
            "certificate": new_certificate,
            "message": f"证书已保存: {filename}"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存证书失败: {str(e)}")

@app.delete("/api/v1/certificates/{certificate_id}")
async def delete_certificate(certificate_id: str):
    """删除证书"""
    try:
        certificates = read_json_file(CERTIFICATES_JSON)
        
        # 找到要删除的证书
        certificate = next((c for c in certificates if c["id"] == certificate_id), None)
        if not certificate:
            raise HTTPException(status_code=404, detail="证书不存在")
        
        # 删除文件
        filename = certificate.get("filename")
        if filename:
            filepath = CERTIFICATES_DIR / filename
            if filepath.exists():
                filepath.unlink()
        
        # 从列表中移除
        certificates = [c for c in certificates if c["id"] != certificate_id]
        write_json_file(CERTIFICATES_JSON, certificates)
        
        return {"success": True, "message": "证书已删除"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除证书失败: {str(e)}")

@app.get("/api/v1/configs")
async def get_configs():
    """获取所有模板配置"""
    try:
        configs = {}
        for config_file in CONFIGS_DIR.glob("*.json"):
            key = config_file.stem
            with open(config_file, "r", encoding="utf-8") as f:
                configs[key] = json.load(f)
        return configs
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取配置失败: {str(e)}")

@app.post("/api/v1/configs/{template_id}")
async def save_config(template_id: str, config: Dict[str, Any]):
    """保存模板配置"""
    try:
        filename = f"template_config_{template_id}.json"
        filepath = CONFIGS_DIR / filename
        
        # 直接保存原始字典，避免 Pydantic 模型的序列化问题
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        print(f"✅ 配置已保存到文件: {filepath}")
        print(f"   配置大小: {len(json.dumps(config))} 字节")
        
        return {"success": True, "message": f"配置已保存: {filename}"}
    except Exception as e:
        print(f"❌ 保存配置失败: {str(e)}")
        raise HTTPException(status_code=500, detail=f"保存配置失败: {str(e)}")

@app.get("/api/v1/configs/export")
async def export_configs():
    """导出所有配置"""
    try:
        configs = {}
        for config_file in CONFIGS_DIR.glob("*.json"):
            key = config_file.stem
            with open(config_file, "r", encoding="utf-8") as f:
                configs[key] = json.load(f)
        
        backup = {
            "version": "2.0",
            "timestamp": datetime.now().isoformat(),
            "configs": configs
        }
        
        return backup
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导出配置失败: {str(e)}")

@app.post("/api/v1/configs/import")
async def import_configs(data: Dict[str, Any]):
    """导入配置"""
    try:
        configs = data.get("configs", {})
        imported_count = 0
        
        for key, config in configs.items():
            filename = f"{key}.json"
            filepath = CONFIGS_DIR / filename
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(config, f, ensure_ascii=False, indent=2)
            imported_count += 1
        
        return {"success": True, "count": imported_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"导入配置失败: {str(e)}")

@app.get("/api/v1/templates")
async def get_templates():
    """获取用户上传的模板列表"""
    try:
        templates = read_json_file(TEMPLATES_JSON)
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取模板列表失败: {str(e)}")

@app.post("/api/v1/templates")
async def save_template(template: Dict[str, Any]):
    """保存用户上传的模板"""
    try:
        templates = read_json_file(TEMPLATES_JSON)
        templates.append(template)
        write_json_file(TEMPLATES_JSON, templates)
        return {"success": True, "template": template}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"保存模板失败: {str(e)}")

@app.delete("/api/v1/templates/{template_id}")
async def delete_template(template_id: str):
    """删除用户模板"""
    try:
        templates = read_json_file(TEMPLATES_JSON)
        templates = [t for t in templates if t["id"] != template_id]
        write_json_file(TEMPLATES_JSON, templates)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除模板失败: {str(e)}")

@app.get("/api/v1/stats")
async def get_stats():
    """获取统计信息"""
    try:
        certificates = read_json_file(CERTIFICATES_JSON)
        templates = read_json_file(TEMPLATES_JSON)
        
        return {
            "certificates_count": len(certificates),
            "templates_count": len(templates),
            "configs_count": len(list(CONFIGS_DIR.glob("*.json"))),
            "data_dir_size": sum(f.stat().st_size for f in DATA_DIR.rglob("*") if f.is_file())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取统计信息失败: {str(e)}")

# ==================== 根路由 ====================

@app.get("/")
async def root():
    """根路径 - 返回前端页面"""
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    return {
        "name": "CertMaster API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "health": "/api/health"
    }

# ==================== SPA 路由支持（必须放在最后） ====================

# 前端 SPA 路由 - 捕获所有未匹配的路由，返回 index.html
# 注意：这个路由必须定义在所有其他路由之后
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """SPA 路由支持 - 捕获所有未匹配的请求"""
    # 尝试返回请求的静态文件
    file_path = STATIC_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    
    # 返回 index.html 用于前端路由
    index_path = STATIC_DIR / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    
    # 如果静态文件不存在，返回 404
    raise HTTPException(status_code=404, detail=f"File not found: {full_path}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)

