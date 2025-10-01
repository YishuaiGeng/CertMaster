import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CertificateData, Template } from '../types';
import { downloadCanvas } from '../utils/imageUtils';
import { loadTemplateImage } from '../utils/templateScanner';
import { dateToChinese } from '../utils/dateUtils';
import { Download, Loader2, Save, Eye } from 'lucide-react';

interface CertificatePreviewProps {
  data: CertificateData;
  templates: Template[];
  certificateTemplates: Template[];
  stampTemplates: Template[];
  watermarkTemplates: Template[];
  onChange: (data: CertificateData) => void;
  onSave: () => void;
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  data,
  templates,
  certificateTemplates,
  stampTemplates,
  watermarkTemplates,
  onChange,
  onSave,
  canvasRef: externalCanvasRef,
}) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string>('');
  const [canvasReady, setCanvasReady] = useState(false);

  // 当 canvas 元素创建后初始化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (!canvasReady) {
        canvas.width = 1200;
        canvas.height = 900;
        setCanvasReady(true);
        console.log('✅ Canvas initialized with default size');
      }
    } else {
      console.log('⏳ Canvas element not yet mounted');
    }
  }, [canvasReady, data.certificateTemplateId]); // 添加 certificateTemplateId 依赖

  const handleChange = (field: keyof CertificateData, value: string) => {
    console.log(`📝 字段变化: ${field} = ${value}`);
    console.log(`   当前 templates 数量: ${templates.length}`);
    console.log(`   certificateTemplates 数量: ${certificateTemplates.length}`);
    
    // 如果是选择证书模板，检查是否有预设内容需要填充
    if (field === 'certificateTemplateId' && value) {
      const selectedTemplate = templates.find(t => t.id === value);
      const defaultContent = selectedTemplate?.config?.defaultContent;
      
      if (defaultContent) {
        console.log('🔄 检测到预设内容，开始自动填充...');
        
        // 创建更新后的数据，只填充空白字段
        const updatedData = { ...data, [field]: value };
        
        // 只有当前字段为空时才填充预设内容
        if (!data.name && defaultContent.name) {
          updatedData.name = defaultContent.name;
          console.log(`  ✅ 填充姓名: ${defaultContent.name}`);
        }
        if (!data.content && defaultContent.content) {
          updatedData.content = defaultContent.content;
          console.log(`  ✅ 填充证书内容: ${defaultContent.content.substring(0, 30)}...`);
        }
        if (!data.guidanceUnit && defaultContent.guidanceUnit) {
          updatedData.guidanceUnit = defaultContent.guidanceUnit;
          console.log(`  ✅ 填充指导单位: ${defaultContent.guidanceUnit}`);
        }
        if (!data.certNumber && defaultContent.certNumber) {
          updatedData.certNumber = defaultContent.certNumber;
          console.log(`  ✅ 填充证书编号: ${defaultContent.certNumber}`);
        }
        if (!data.authTime && defaultContent.authTime) {
          updatedData.authTime = defaultContent.authTime;
          console.log(`  ✅ 填充授权时间: ${defaultContent.authTime}`);
        }
        if (!data.authUnit && defaultContent.authUnit) {
          updatedData.authUnit = defaultContent.authUnit;
          console.log(`  ✅ 填充授权单位: ${defaultContent.authUnit}`);
        }
        
        onChange(updatedData);
        console.log('✅ 预设内容填充完成');
        return;
      } else {
        console.log('ℹ️ 该模板没有配置预设内容');
      }
    }
    
    onChange({ ...data, [field]: value });
  };

  const renderCertificate = useCallback(async () => {
    // 如果没有选择证书模板，不执行渲染
    if (!data.certificateTemplateId) {
      console.log('⏭️ 未选择证书模板，跳过渲染');
      setError('请选择证书模板');
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error('❌ Canvas ref not available');
      console.error('   Canvas element:', document.querySelector('canvas'));
      setError('Canvas 初始化失败，请刷新页面');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('❌ Canvas context not available');
      setError('Canvas context 获取失败');
      return;
    }

    setIsRendering(true);
    setError('');
    console.log('🎬 Starting certificate render...');

    try {
      // Find templates
      const certTemplate = templates.find(t => t.id === data.certificateTemplateId);
      const stampTemplate = templates.find(t => t.id === data.stampTemplateId);
      const watermarkTemplate = templates.find(t => t.id === data.watermarkTemplateId);

      console.log('📋 Templates found:', {
        certificate: certTemplate?.name,
        stamp: stampTemplate?.name,
        watermark: watermarkTemplate?.name
      });

      if (!certTemplate) {
        setError('证书模板未找到');
        setIsRendering(false);
        return;
      }

      // 加载证书模板配置
      let templateConfig = certTemplate.config;
      
      // 如果是内置模板，尝试从 LocalStorage 加载配置
      if (!templateConfig && certTemplate.path) {
        const configKey = `template_config_${certTemplate.id}`;
        const savedConfig = localStorage.getItem(configKey);
        if (savedConfig) {
          templateConfig = JSON.parse(savedConfig);
          console.log('✅ 从 LocalStorage 加载模板配置');
        }
      }

      // Load certificate template (动态加载)
      const certImageSrc = certTemplate.path || certTemplate.imageUrl;
      if (!certImageSrc) {
        setError('证书模板路径无效');
        setIsRendering(false);
        return;
      }
      console.log('📥 动态加载证书模板:', certImageSrc);
      const certImage = await loadTemplateImage(certImageSrc);
      
      // Set canvas size based on certificate template
      canvas.width = certImage.width;
      canvas.height = certImage.height;
      console.log('Canvas size set to:', canvas.width, 'x', canvas.height);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw certificate template
      ctx.drawImage(certImage, 0, 0);
      console.log('Certificate template drawn');

      // Draw watermark if exists
      if (watermarkTemplate) {
        try {
          const watermarkSrc = watermarkTemplate.path || watermarkTemplate.imageUrl;
          if (watermarkSrc) {
            console.log('📥 动态加载水印模板:', watermarkSrc);
            const watermarkImage = await loadTemplateImage(watermarkSrc);
            ctx.globalAlpha = 0.3;
            ctx.drawImage(watermarkImage, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
            console.log('✅ 水印绘制完成');
          }
        } catch (e) {
          console.error('❌ 水印加载失败:', e);
        }
      }

      // 如果有模板配置，使用配置参数绘制；否则使用默认参数
      if (templateConfig) {
        console.log('🎨 使用模板配置参数绘制');
        console.log('   授权时间配置:', templateConfig.authTime);
        
        // Helper function to draw text with config
        const drawTextField = (text: string, config: any, fieldName: string) => {
          if (!text) return;
          
          console.log(`   📝 绘制字段 ${fieldName}:`, {
            text: text.substring(0, 20) + '...',
            x: config.x,
            y: config.y,
            fontSize: config.fontSize,
            align: config.align,
            fontWeight: config.fontWeight,
          });
          
          // 构建字体字符串，包含粗细
          const fontWeight = config.fontWeight || 'normal';
          ctx.font = `${fontWeight} ${config.fontSize}px ${config.fontFamily}`;
          ctx.fillStyle = config.color;
          ctx.textAlign = config.align;
          
          const lineHeight = config.fontSize * 1.5;
          
          // 如果设置了最大宽度，进行自动换行
          if (config.maxWidth) {
            const words = text.split('');
            let line = '';
            let y = config.y;
            const lines: string[] = [];
            
            // 按字符分割并计算换行
            for (let i = 0; i < words.length; i++) {
              const testLine = line + words[i];
              const metrics = ctx.measureText(testLine);
              
              if (metrics.width > config.maxWidth && line !== '') {
                lines.push(line);
                line = words[i];
              } else {
                line = testLine;
              }
            }
            lines.push(line); // 添加最后一行
            
            // 检查是否超出最大高度限制
            const totalHeight = lines.length * lineHeight;
            if (config.maxHeight && totalHeight > config.maxHeight) {
              console.warn(`文本 "${text}" 超出设置的最大高度 ${config.maxHeight}px`);
            }
            
            // 绘制所有行
            lines.forEach((line, index) => {
              ctx.fillText(line, config.x, y + index * lineHeight);
            });
          } else if (text.includes('\n')) {
            // 处理手动换行
            const lines = text.split('\n');
            lines.forEach((line, index) => {
              ctx.fillText(line, config.x, config.y + index * lineHeight);
            });
          } else {
            // 单行文本
            ctx.fillText(text, config.x, config.y);
          }
        };

        // Draw all fields using config
        drawTextField(data.name, templateConfig.name, '姓名');
        drawTextField(data.content, templateConfig.content, '证书内容');
        drawTextField(data.guidanceUnit ? `指导单位：${data.guidanceUnit}` : '', templateConfig.guidanceUnit, '指导单位');
        drawTextField(data.certNumber ? `证书编号：${data.certNumber}` : '', templateConfig.certNumber, '证书编号');
        drawTextField(data.authTime ? `授权时间：${dateToChinese(data.authTime)}` : '', templateConfig.authTime, '授权时间');
        drawTextField(data.authUnit, templateConfig.authUnit, '授权单位');
        
        console.log('✅ 使用配置参数绘制完成');
      } else {
        // 使用默认参数绘制（旧逻辑）
        console.log('📝 使用默认参数绘制');
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';

        // Draw name (姓名)
        if (data.name) {
          ctx.font = 'bold 48px SimSun, serif';
          ctx.fillText(data.name, canvas.width / 2, canvas.height * 0.25);
        }

        // Draw content (证书内容)
        if (data.content) {
          ctx.font = '26px SimSun, serif';
          const lines = data.content.split('\n');
          const lineHeight = 40;
          const startY = canvas.height * 0.4;
          lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
          });
        }

        // Draw guidance unit (指导单位)
        if (data.guidanceUnit) {
          ctx.font = '20px SimSun, serif';
          ctx.fillText(`指导单位：${data.guidanceUnit}`, canvas.width / 2, canvas.height * 0.68);
        }

        // Draw certificate number (证书编号)
        if (data.certNumber) {
          ctx.font = '18px SimSun, serif';
          ctx.textAlign = 'left';
          ctx.fillText(`证书编号：${data.certNumber}`, canvas.width * 0.1, canvas.height * 0.85);
        }

        // Draw auth time (授权时间)
        if (data.authTime) {
          const chineseDate = dateToChinese(data.authTime);
          ctx.font = '18px SimSun, serif';
          ctx.textAlign = 'right';
          ctx.fillText(`授权时间：${chineseDate}`, canvas.width * 0.9, canvas.height * 0.85);
        }

        // Draw auth unit (授权单位)
        if (data.authUnit) {
          ctx.font = '20px SimSun, serif';
          ctx.textAlign = 'center';
          ctx.fillText(data.authUnit, canvas.width * 0.75, canvas.height * 0.75);
        }
      }

      // Draw stamp if exists
      if (stampTemplate) {
        try {
          const stampSrc = stampTemplate.path || stampTemplate.imageUrl;
          if (stampSrc) {
            console.log('📥 动态加载盖章模板:', stampSrc);
            const stampImage = await loadTemplateImage(stampSrc);
            
            // Get stamp configuration from certificate template
            const stampConfig = templateConfig?.stamp;
            
            if (stampConfig) {
              // Use configured position, size, and rotation
              console.log('🎨 使用证书模板配置的盖章参数:', stampConfig);
              
              ctx.save();
              // Move to stamp center point
              ctx.translate(stampConfig.x, stampConfig.y);
              // Apply rotation
              ctx.rotate((stampConfig.rotation * Math.PI) / 180);
              // Draw stamp centered on the rotation point
              ctx.drawImage(
                stampImage,
                -stampConfig.width / 2,
                -stampConfig.height / 2,
                stampConfig.width,
                stampConfig.height
              );
              ctx.restore();
              console.log('✅ 使用配置参数绘制盖章完成');
            } else {
              // Use default position (bottom right) with random rotation if no config
              console.log('📝 使用默认盖章位置和旋转');
              const stampWidth = 120;
              const stampHeight = 120;
              const rotation = Math.random() * 20 - 10; // Random -10 to +10 degrees
              
              ctx.save();
              ctx.translate(
                canvas.width * 0.75,
                canvas.height * 0.78 + stampHeight / 2
              );
              ctx.rotate((rotation * Math.PI) / 180);
              ctx.drawImage(
                stampImage,
                -stampWidth / 2,
                -stampHeight / 2,
                stampWidth,
                stampHeight
              );
              ctx.restore();
              console.log('✅ 使用默认参数绘制盖章完成');
            }
          }
        } catch (e) {
          console.error('❌ 盖章加载失败:', e);
        }
      }

      console.log('Certificate rendered successfully');

    } catch (err) {
      console.error('Error rendering certificate:', err);
      setError('渲染证书时出错');
    } finally {
      setIsRendering(false);
    }
  }, [data, templates]); // 添加依赖

  useEffect(() => {
    // 只在选择了证书模板时才尝试渲染
    if (!data.certificateTemplateId) {
      console.log('⏭️ 未选择证书模板，等待用户选择...');
      return;
    }

    if (!canvasReady) {
      console.log('⏳ Canvas 未初始化，等待...');
      return;
    }

    console.log('🔄 数据变化，触发重新渲染...');
    console.log('📊 当前数据状态:', {
      certificateTemplateId: data.certificateTemplateId,
      stampTemplateId: data.stampTemplateId,
      watermarkTemplateId: data.watermarkTemplateId,
      name: data.name,
      content: data.content?.substring(0, 20) + '...',
      templatesCount: templates.length,
      canvasReady: canvasReady
    });
    console.log('📋 Templates 列表:', templates.map(t => `${t.id}: ${t.name} (${t.type})`));
    
    // 延迟一帧确保 DOM 已更新
    requestAnimationFrame(() => {
      renderCertificate();
    });
  }, [data, templates, renderCertificate, canvasReady]);

  const handleDownload = () => {
    if (canvasRef.current) {
      const filename = `${data.title || '证书'}_${data.name || 'unnamed'}.png`;
      downloadCanvas(canvasRef.current, filename);
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 p-6">
      {/* 证书预览标题和操作按钮 */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Eye className="w-6 h-6" />
          证书预览
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onSave}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
          >
            <Save className="w-5 h-5" />
            保存证书
          </button>
          <button
            onClick={handleDownload}
            disabled={isRendering || !!error}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105 disabled:hover:scale-100"
          >
            {isRendering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            下载证书
          </button>
        </div>
      </div>

      {/* 模板选择 */}
      <div className="mb-4 bg-slate-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 证书模板 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-blue-400">📄</span>
              证书模板
              <span className="text-red-400">*</span>
            </label>
            <select
              value={data.certificateTemplateId}
              onChange={(e) => {
                console.log('📄 选择证书模板:', e.target.value);
                handleChange('certificateTemplateId', e.target.value);
              }}
              className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                data.certificateTemplateId 
                  ? 'border-blue-500 text-white focus:ring-blue-500' 
                  : 'border-slate-600 text-gray-400 focus:ring-gray-500'
              }`}
            >
              <option value="" disabled className="text-gray-500">
                -- 请选择 --
              </option>
              {certificateTemplates.map((template) => (
                <option key={template.id} value={template.id} className="text-white">
                  {template.name.replace(/\.(png|jpg|jpeg)$/i, '')}
                </option>
              ))}
            </select>
            {certificateTemplates.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">暂无可用模板</p>
            )}
          </div>

          {/* 盖章模板 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-red-400">🔴</span>
              盖章模板
              <span className="text-red-400">*</span>
            </label>
            <select
              value={data.stampTemplateId}
              onChange={(e) => {
                console.log('🔴 选择盖章模板:', e.target.value);
                handleChange('stampTemplateId', e.target.value);
              }}
              className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                data.stampTemplateId 
                  ? 'border-red-500 text-white focus:ring-red-500' 
                  : 'border-slate-600 text-gray-400 focus:ring-gray-500'
              }`}
            >
              <option value="" disabled className="text-gray-500">
                -- 请选择 --
              </option>
              {stampTemplates.map((template) => (
                <option key={template.id} value={template.id} className="text-white">
                  {template.name.replace(/\.(png|jpg|jpeg)$/i, '')}
                </option>
              ))}
            </select>
            {stampTemplates.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">暂无可用模板</p>
            )}
          </div>

          {/* 水印模板 */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
              <span className="text-cyan-400">💧</span>
              水印模板
              <span className="text-gray-500 text-xs">(可选)</span>
            </label>
            <select
              value={data.watermarkTemplateId || ''}
              onChange={(e) => {
                console.log('💧 选择水印模板:', e.target.value);
                handleChange('watermarkTemplateId', e.target.value);
              }}
              className={`w-full px-3 py-2.5 bg-slate-700 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
                data.watermarkTemplateId 
                  ? 'border-cyan-500 text-white focus:ring-cyan-500' 
                  : 'border-slate-600 text-gray-400 focus:ring-gray-500'
              }`}
            >
              <option value="" className="text-gray-400">
                -- 不使用水印 --
              </option>
              {watermarkTemplates.map((template) => (
                <option key={template.id} value={template.id} className="text-white">
                  {template.name.replace(/\.(png|jpg|jpeg)$/i, '')}
                </option>
              ))}
            </select>
            {watermarkTemplates.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">暂无可用模板</p>
            )}
          </div>
        </div>
      </div>

      {/* 预览区域 */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-auto bg-slate-800 rounded-lg p-4">
        {!data.certificateTemplateId ? (
          <div className="text-gray-400 text-center">
            <p className="text-lg mb-2">👆 请先选择证书模板</p>
            <p className="text-sm">选择后将在此处显示预览</p>
          </div>
        ) : error ? (
          <div className="text-red-400 text-center">
            <p className="text-lg mb-2">{error}</p>
            <p className="text-sm text-gray-400">请检查模板是否正确</p>
          </div>
        ) : (
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full h-auto shadow-2xl rounded-lg"
              style={{ 
                maxHeight: 'calc(100vh - 300px)',
              }}
            />
            {isRendering && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-2" />
                  <p className="text-white text-sm">正在渲染证书...</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
