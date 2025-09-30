// 模板扫描器 - 只读取文件列表，不加载图片内容
export interface TemplateFile {
  id: string;
  name: string;
  type: 'certificate' | 'stamp' | 'watermark';
  path: string;
}

// 扫描模板文件列表
export const scanTemplateFiles = (): TemplateFile[] => {
  const templates: TemplateFile[] = [];
  
  // 证书模板
  const certificateFiles = [
    '通用技术学习证书.png',
    '研究性学习成果课题.png',
  ];
  
  // 盖章模板
  const stampFiles = [
    '1.jpg',
    '2.png',
  ];
  
  // 水印模板
  const watermarkFiles = [
    '7168127.jpg',
  ];
  
  // 生成证书模板列表
  certificateFiles.forEach((file, index) => {
    templates.push({
      id: `cert_${index}`,
      name: file,
      type: 'certificate',
      path: `/templates/certificate-tpls/${file}`
    });
  });
  
  // 生成盖章模板列表
  stampFiles.forEach((file, index) => {
    templates.push({
      id: `stamp_${index}`,
      name: file,
      type: 'stamp',
      path: `/templates/stamp-tpls/${file}`
    });
  });
  
  // 生成水印模板列表
  watermarkFiles.forEach((file, index) => {
    templates.push({
      id: `watermark_${index}`,
      name: file,
      type: 'watermark',
      path: `/templates/watermark-tpls/${file}`
    });
  });
  
  console.log(`📁 扫描到 ${templates.length} 个模板文件`);
  console.log(`   - 证书模板: ${certificateFiles.length} 个`);
  console.log(`   - 盖章模板: ${stampFiles.length} 个`);
  console.log(`   - 水印模板: ${watermarkFiles.length} 个`);
  
  return templates;
};

// 动态加载图片（仅在需要时调用）
export const loadTemplateImage = async (path: string): Promise<HTMLImageElement> => {
  console.log(`🔄 开始加载图片: ${path}`);
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 对于同源图片，不需要设置 crossOrigin
    // img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`✅ 图片加载成功: ${path}, 尺寸: ${img.width}x${img.height}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error(`❌ 图片加载失败: ${path}`, error);
      console.error(`   完整路径: ${window.location.origin}${path}`);
      reject(new Error(`Failed to load image: ${path}`));
    };
    
    // 先设置错误处理，再设置 src
    img.src = path;
    console.log(`   图片 src 已设置: ${img.src}`);
  });
};
