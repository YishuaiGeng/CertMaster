/**
 * 模板配置的导出和导入工具
 */

import { TemplateConfig } from '../types';

interface ConfigBackup {
  version: string;
  timestamp: string;
  configs: Record<string, TemplateConfig>; // key: template_config_${templateId}
}

/**
 * 导出所有模板配置到 JSON 文件
 */
export const exportConfigs = () => {
  const configs: Record<string, TemplateConfig> = {};
  
  // 遍历 LocalStorage，找到所有以 'template_config_' 开头的配置
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('template_config_')) {
      const value = localStorage.getItem(key);
      if (value) {
        try {
          configs[key] = JSON.parse(value);
        } catch (error) {
          console.error(`Failed to parse config for ${key}:`, error);
        }
      }
    }
  }
  
  const backup: ConfigBackup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    configs,
  };
  
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
  
  console.log(`✅ 已导出 ${Object.keys(configs).length} 个模板配置`);
  return Object.keys(configs).length;
};

/**
 * 从 JSON 文件导入模板配置
 */
export const importConfigs = (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backup: ConfigBackup = JSON.parse(content);
        
        // 验证备份文件格式
        if (!backup.version || !backup.configs) {
          throw new Error('Invalid backup file format');
        }
        
        // 导入配置到 LocalStorage
        let importCount = 0;
        Object.entries(backup.configs).forEach(([key, config]) => {
          if (key.startsWith('template_config_')) {
            localStorage.setItem(key, JSON.stringify(config));
            importCount++;
          }
        });
        
        console.log(`✅ 已导入 ${importCount} 个模板配置`);
        console.log(`   备份时间: ${backup.timestamp}`);
        resolve(importCount);
      } catch (error) {
        console.error('Failed to import configs:', error);
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

/**
 * 清除所有模板配置
 */
export const clearAllConfigs = () => {
  const configKeys: string[] = [];
  
  // 收集所有配置 key
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('template_config_')) {
      configKeys.push(key);
    }
  }
  
  // 删除配置
  configKeys.forEach(key => localStorage.removeItem(key));
  
  console.log(`🗑️ 已清除 ${configKeys.length} 个模板配置`);
  return configKeys.length;
};

/**
 * 获取所有模板配置的统计信息
 */
export const getConfigStats = () => {
  const stats = {
    totalConfigs: 0,
    configKeys: [] as string[],
  };
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('template_config_')) {
      stats.totalConfigs++;
      stats.configKeys.push(key);
    }
  }
  
  return stats;
};

