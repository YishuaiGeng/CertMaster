import { Template } from '../types';
import { storage } from './storage';

// 定义模板文件路径
const TEMPLATE_PATHS = {
  certificate: [
    { name: '通用技术证书', path: '/templates/certificate-tpls/通用技术证书.png' },
    { name: '研究性课题证书', path: '/templates/certificate-tpls/研究性课题证书.png' },
  ],
  stamp: [
    { name: '印章1', path: '/templates/stamp-tpls/1.jpg' },
  ],
  watermark: [
    // 水印模板可以在这里添加
  ],
};

// 将图片URL转换为Data URL
const urlToDataUrl = async (url: string): Promise<string> => {
  try {
    console.log(`尝试加载模板图片: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    console.log(`图片加载成功，大小: ${blob.size} bytes`);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log(`图片转换为DataURL成功: ${url}`);
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load template from ${url}:`, error);
    throw error;
  }
};

// 初始化默认模板
export const initializeDefaultTemplates = async (): Promise<void> => {
  const existingTemplates = storage.getTemplates();
  
  console.log(`当前已有 ${existingTemplates.length} 个模板`);
  
  // 如果已经有模板，不重复初始化
  if (existingTemplates.length > 0) {
    console.log('模板已存在，跳过初始化');
    return;
  }

  console.log('开始初始化默认模板...');

  try {
    // 加载证书模板
    for (const tmpl of TEMPLATE_PATHS.certificate) {
      try {
        const imageUrl = await urlToDataUrl(tmpl.path);
        const template: Template = {
          id: `cert_${Date.now()}_${Math.random()}`,
          name: tmpl.name,
          type: 'certificate',
          imageUrl,
          createdAt: new Date().toISOString(),
        };
        storage.saveTemplate(template);
        // 添加小延迟确保ID唯一
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`Failed to load ${tmpl.name}:`, error);
      }
    }

    // 加载盖章模板
    for (const tmpl of TEMPLATE_PATHS.stamp) {
      try {
        const imageUrl = await urlToDataUrl(tmpl.path);
        const template: Template = {
          id: `stamp_${Date.now()}_${Math.random()}`,
          name: tmpl.name,
          type: 'stamp',
          imageUrl,
          createdAt: new Date().toISOString(),
        };
        storage.saveTemplate(template);
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`Failed to load ${tmpl.name}:`, error);
      }
    }

    // 加载水印模板（如果有）
    for (const tmpl of TEMPLATE_PATHS.watermark) {
      try {
        const imageUrl = await urlToDataUrl(tmpl.path);
        const template: Template = {
          id: `watermark_${Date.now()}_${Math.random()}`,
          name: tmpl.name,
          type: 'watermark',
          imageUrl,
          createdAt: new Date().toISOString(),
        };
        storage.saveTemplate(template);
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (error) {
        console.error(`Failed to load ${tmpl.name}:`, error);
      }
    }

    console.log('默认模板初始化完成');
    
    // 输出最终的模板数量
    const finalTemplates = storage.getTemplates();
    console.log(`模板初始化结果: 总共 ${finalTemplates.length} 个模板`);
    finalTemplates.forEach(t => console.log(`- ${t.type}: ${t.name}`));
    
  } catch (error) {
    console.error('Failed to initialize templates:', error);
  }
};
