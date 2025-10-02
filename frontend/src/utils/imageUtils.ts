export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      console.log(`Image loaded successfully: ${url}`);
      resolve(img);
    };
    
    img.onerror = (error) => {
      console.error(`Failed to load image: ${url}`, error);
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 清理姓名，提取真正的姓名部分
 * 例如："亲爱的张三：" -> "张三"
 *       "李四同学：" -> "李四"
 */
export const cleanName = (name: string): string => {
  if (!name) return 'unnamed';
  
  let cleaned = name;
  
  // 如果包含冒号（中文或英文），只保留冒号之前的内容
  if (cleaned.includes('：')) {
    cleaned = cleaned.split('：')[0];
  } else if (cleaned.includes(':')) {
    cleaned = cleaned.split(':')[0];
  }
  
  // 去掉常见的前缀
  cleaned = cleaned
    .replace(/^亲爱的/g, '')
    .replace(/^尊敬的/g, '')
    .replace(/^敬爱的/g, '');
  
  // 去掉常见的后缀
  cleaned = cleaned
    .replace(/同学$/g, '')
    .replace(/老师$/g, '')
    .replace(/先生$/g, '')
    .replace(/女士$/g, '');
  
  // 去掉空格
  cleaned = cleaned.trim();
  
  return cleaned || 'unnamed';
};

export const downloadCanvas = (canvas: HTMLCanvasElement, filename: string) => {
  canvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
};