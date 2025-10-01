/**
 * 后端 API 调用工具
 */

const API_BASE_URL = 'http://localhost:8000/api';

// ==================== 证书 API ====================

export interface CertificateWithImage {
  certificateData: any;
  imageData: string; // Base64 图片数据
}

/**
 * 获取所有证书
 */
export async function fetchCertificates() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/certificates`);
    if (!response.ok) throw new Error('获取证书列表失败');
    return await response.json();
  } catch (error) {
    console.error('获取证书列表失败:', error);
    throw error;
  }
}

/**
 * 保存证书（包含图片）
 */
export async function saveCertificate(certificateData: any, imageData: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/certificates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ certificateData, imageData }),
    });
    
    if (!response.ok) throw new Error('保存证书失败');
    return await response.json();
  } catch (error) {
    console.error('保存证书失败:', error);
    throw error;
  }
}

/**
 * 删除证书
 */
export async function deleteCertificate(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/certificates/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('删除证书失败');
    return await response.json();
  } catch (error) {
    console.error('删除证书失败:', error);
    throw error;
  }
}

// ==================== 配置 API ====================

/**
 * 获取所有模板配置
 */
export async function fetchConfigs() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/configs`);
    if (!response.ok) throw new Error('获取配置失败');
    return await response.json();
  } catch (error) {
    console.error('获取配置失败:', error);
    throw error;
  }
}

/**
 * 保存模板配置
 */
export async function saveConfig(templateId: string, config: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/configs/${templateId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) throw new Error('保存配置失败');
    return await response.json();
  } catch (error) {
    console.error('保存配置失败:', error);
    throw error;
  }
}

/**
 * 导出所有配置
 */
export async function exportConfigs() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/configs/export`);
    if (!response.ok) throw new Error('导出配置失败');
    const backup = await response.json();
    
    // 创建下载链接
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certmaster_configs_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return Object.keys(backup.configs).length;
  } catch (error) {
    console.error('导出配置失败:', error);
    throw error;
  }
}

/**
 * 导入配置
 */
export async function importConfigs(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup = JSON.parse(content);
        
        if (!backup.version || !backup.configs) {
          throw new Error('Invalid backup file format');
        }
        
        const response = await fetch(`${API_BASE_URL}/v1/configs/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ configs: backup.configs }),
        });
        
        if (!response.ok) throw new Error('导入配置失败');
        const result = await response.json();
        resolve(result.count);
      } catch (error) {
        console.error('导入配置失败:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

// ==================== 模板 API ====================

/**
 * 获取用户上传的模板列表
 */
export async function fetchTemplates() {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/templates`);
    if (!response.ok) throw new Error('获取模板列表失败');
    return await response.json();
  } catch (error) {
    console.error('获取模板列表失败:', error);
    throw error;
  }
}

/**
 * 保存用户模板
 */
export async function saveTemplate(template: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });
    
    if (!response.ok) throw new Error('保存模板失败');
    return await response.json();
  } catch (error) {
    console.error('保存模板失败:', error);
    throw error;
  }
}

/**
 * 删除用户模板
 */
export async function deleteTemplate(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/v1/templates/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('删除模板失败');
    return await response.json();
  } catch (error) {
    console.error('删除模板失败:', error);
    throw error;
  }
}

// ==================== 健康检查 ====================

/**
 * 检查后端服务是否可用
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) throw new Error('Service unavailable');
    return await response.json();
  } catch (error) {
    console.error('后端服务不可用:', error);
    return null;
  }
}

