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