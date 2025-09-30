import React, { useState, useEffect, useRef } from 'react';
import { Template, FieldConfig, TemplateConfig, StampConfig } from '../types';
import { X, Save } from 'lucide-react';

interface TemplateEditorProps {
  template: Template;
  onClose: () => void;
  onSave: (template: Template) => void;
}

const DEFAULT_FIELD_CONFIG: FieldConfig = {
  x: 400,
  y: 300,
  fontSize: 40,
  fontFamily: 'SimSun, serif',
  fontWeight: 'normal',
  color: '#000000',
  align: 'left',
};

const DEFAULT_STAMP_CONFIG: StampConfig = {
  x: 600,
  y: 600,
  width: 120,
  height: 120,
  rotation: Math.random() * 20 - 10, // -10 到 +10 度
};

const FIELD_LABELS: Record<keyof TemplateConfig, string> = {
  name: '姓名',
  content: '证书内容',
  guidanceUnit: '指导单位',
  certNumber: '证书编号',
  authTime: '授权时间',
  authUnit: '授权单位',
  stamp: '盖章',
};

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ template, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [config, setConfig] = useState<TemplateConfig>(
    template.config || {
      name: { ...DEFAULT_FIELD_CONFIG, y: 200, fontSize: 48 },
      content: { ...DEFAULT_FIELD_CONFIG, y: 300 },
      guidanceUnit: { ...DEFAULT_FIELD_CONFIG, y: 500 },
      certNumber: { ...DEFAULT_FIELD_CONFIG, x: 150, y: 650 },
      authTime: { ...DEFAULT_FIELD_CONFIG, x: 650, y: 650, align: 'right' },
      authUnit: { ...DEFAULT_FIELD_CONFIG, y: 550 },
      stamp: { ...DEFAULT_STAMP_CONFIG },
    }
  );
  const [activeField, setActiveField] = useState<keyof TemplateConfig>('name');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragField, setDragField] = useState<keyof TemplateConfig | null>(null);
  
  // 随机生成盖章旋转角度
  const generateRandomRotation = () => {
    const rotation = Math.random() * 20 - 10; // -10 到 +10 度
    setConfig({
      ...config,
      stamp: {
        ...config.stamp,
        rotation,
      },
    });
  };

  useEffect(() => {
    drawPreview();
  }, [config, activeField, imageLoaded]);

  const drawPreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制模板图片
      ctx.drawImage(img, 0, 0);
      
      // 绘制所有字段的位置标记
      Object.entries(config).forEach(([field, fieldConfig]) => {
        const isActive = field === activeField;
        
        // 盖章特殊处理
        if (field === 'stamp') {
          const stampConf = fieldConfig as StampConfig;
          ctx.save();
          
          // 绘制盖章矩形框
          ctx.strokeStyle = isActive ? '#ef4444' : '#94a3b8';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.setLineDash(isActive ? [] : [5, 5]);
          
          // 平移到盖章中心点
          ctx.translate(stampConf.x, stampConf.y);
          ctx.rotate((stampConf.rotation * Math.PI) / 180);
          
          // 绘制矩形框
          ctx.strokeRect(
            -stampConf.width / 2,
            -stampConf.height / 2,
            stampConf.width,
            stampConf.height
          );
          
          // 绘制中心点
          ctx.setLineDash([]);
          ctx.fillStyle = isActive ? '#ef4444' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();
          
          // 绘制旋转角度文字
          ctx.rotate(-(stampConf.rotation * Math.PI) / 180);
          ctx.font = '12px Arial';
          ctx.fillText(
            `${FIELD_LABELS.stamp} (${stampConf.rotation.toFixed(1)}°)`,
            10,
            -10
          );
          
          ctx.restore();
        } else {
          // 文字字段处理
          const textConf = fieldConfig as FieldConfig;
          
          // 绘制文本框范围（如果设置了maxWidth和maxHeight）
          if (textConf.maxWidth && textConf.maxHeight) {
            ctx.strokeStyle = isActive ? '#10b981' : '#6b7280';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            
            // 根据对齐方式确定矩形起始位置
            let rectX = textConf.x;
            if (textConf.align === 'center') {
              rectX = textConf.x - textConf.maxWidth / 2;
            } else if (textConf.align === 'right') {
              rectX = textConf.x - textConf.maxWidth;
            }
            
            ctx.strokeRect(
              rectX,
              textConf.y - textConf.fontSize,
              textConf.maxWidth,
              textConf.maxHeight
            );
          }
          
          // 绘制垂直线
          ctx.strokeStyle = isActive ? '#ef4444' : '#94a3b8';
          ctx.lineWidth = isActive ? 2 : 1;
          ctx.setLineDash(isActive ? [] : [5, 5]);
          ctx.beginPath();
          ctx.moveTo(textConf.x, 0);
          ctx.lineTo(textConf.x, canvas.height);
          ctx.stroke();
          
          // 绘制水平线
          ctx.beginPath();
          ctx.moveTo(0, textConf.y);
          ctx.lineTo(canvas.width, textConf.y);
          ctx.stroke();
          
          // 绘制交叉点标记（可拖动）
          ctx.setLineDash([]);
          ctx.fillStyle = isActive ? '#ef4444' : '#94a3b8';
          ctx.beginPath();
          ctx.arc(textConf.x, textConf.y, 8, 0, Math.PI * 2);
          ctx.fill();
          
          // 绘制内圈（增强可见性）
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(textConf.x, textConf.y, 3, 0, Math.PI * 2);
          ctx.fill();
          
          // 绘制字段名称
          ctx.font = 'bold 14px Arial';
          ctx.fillStyle = isActive ? '#ef4444' : '#94a3b8';
          ctx.fillText(
            FIELD_LABELS[field as keyof TemplateConfig],
            textConf.x + 12,
            textConf.y - 12
          );
        }
      });
      
      setImageLoaded(true);
    };
    
    img.src = template.path || template.imageUrl || '';
  };

  const handleFieldChange = (field: keyof TemplateConfig, key: string, value: any) => {
    setConfig({
      ...config,
      [field]: {
        ...config[field],
        [key]: value,
      },
    });
  };

  const handleSave = () => {
    const updatedTemplate = {
      ...template,
      config,
    };
    onSave(updatedTemplate);
    onClose();
  };

  // 鼠标拖动处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // 检查是否点击在某个字段的定位点附近
    for (const [field, fieldConfig] of Object.entries(config)) {
      const distance = Math.sqrt(
        Math.pow(mouseX - fieldConfig.x, 2) + Math.pow(mouseY - fieldConfig.y, 2)
      );

      // 如果点击在15px范围内，开始拖动
      if (distance < 15) {
        setIsDragging(true);
        setDragField(field as keyof TemplateConfig);
        setActiveField(field as keyof TemplateConfig);
        e.preventDefault();
        break;
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !isDragging || !dragField) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    // 更新字段位置
    setConfig({
      ...config,
      [dragField]: {
        ...config[dragField],
        x: Math.round(mouseX),
        y: Math.round(mouseY),
      },
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragField(null);
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragField(null);
    }
  };

  const activeConfig = config[activeField];
  const isStampField = activeField === 'stamp';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white">编辑模板：{template.name}</h2>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Save className="w-5 h-5" />
              保存配置
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Field Configuration */}
          <div className="w-96 border-r border-slate-700 overflow-y-auto p-4">
            <h3 className="text-lg font-bold text-white mb-4">字段配置</h3>
            
            {/* Field Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">选择字段</label>
              <select
                value={activeField}
                onChange={(e) => setActiveField(e.target.value as keyof TemplateConfig)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(FIELD_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Configuration Form */}
            <div className="space-y-4">
              {/* X 坐标 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  X 坐标{isStampField && ' (中心点)'}
                </label>
                <input
                  type="number"
                  value={activeConfig.x}
                  onChange={(e) => handleFieldChange(activeField, 'x', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Y 坐标 */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Y 坐标{isStampField && ' (中心点)'}
                </label>
                <input
                  type="number"
                  value={activeConfig.y}
                  onChange={(e) => handleFieldChange(activeField, 'y', Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {isStampField ? (
                <>
                  {/* 盖章专属配置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      宽度 (px)
                    </label>
                    <input
                      type="number"
                      value={(activeConfig as StampConfig).width}
                      onChange={(e) => handleFieldChange(activeField, 'width', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      高度 (px)
                    </label>
                    <input
                      type="number"
                      value={(activeConfig as StampConfig).height}
                      onChange={(e) => handleFieldChange(activeField, 'height', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      旋转角度 (度)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={(activeConfig as StampConfig).rotation}
                        onChange={(e) => handleFieldChange(activeField, 'rotation', Number(e.target.value))}
                        step="0.1"
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={generateRandomRotation}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors whitespace-nowrap"
                        title="随机角度 (-10° ~ +10°)"
                      >
                        随机
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      推荐：-10° ~ +10° 之间
                    </p>
                  </div>
                </>
              ) : (
                <>
                  {/* 文字字段配置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      字体大小 (px)
                    </label>
                    <input
                      type="number"
                      value={(activeConfig as FieldConfig).fontSize}
                      onChange={(e) => handleFieldChange(activeField, 'fontSize', Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      字体
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={(activeConfig as FieldConfig).fontFamily}
                        onChange={(e) => handleFieldChange(activeField, 'fontFamily', e.target.value)}
                        className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="SimSun, serif">宋体 (SimSun)</option>
                        <option value="SimHei, sans-serif">黑体 (SimHei)</option>
                        <option value="KaiTi, serif">楷体 (KaiTi)</option>
                        <option value="FangSong, serif">仿宋 (FangSong)</option>
                        <option value="Microsoft YaHei, sans-serif">微软雅黑 (Microsoft YaHei)</option>
                        <option value="STSong, serif">华文宋体 (STSong)</option>
                        <option value="STKaiti, serif">华文楷体 (STKaiti)</option>
                        <option value="STHeiti, sans-serif">华文黑体 (STHeiti)</option>
                        <option value="STFangsong, serif">华文仿宋 (STFangsong)</option>
                        <option value="LiSu, cursive">隶书 (LiSu)</option>
                        <option value="YouYuan, cursive">幼圆 (YouYuan)</option>
                        <option value="Arial, sans-serif">Arial</option>
                        <option value="Times New Roman, serif">Times New Roman</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Verdana, sans-serif">Verdana</option>
                        <option value="Courier New, monospace">Courier New</option>
                      </select>
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg whitespace-nowrap">
                        <input
                          type="checkbox"
                          id={`bold-${activeField}`}
                          checked={(activeConfig as FieldConfig).fontWeight === 'bold'}
                          onChange={(e) => handleFieldChange(activeField, 'fontWeight', e.target.checked ? 'bold' : 'normal')}
                          className="w-4 h-4 text-blue-600 bg-slate-600 border-slate-500 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor={`bold-${activeField}`} className="text-white cursor-pointer select-none">
                          <strong>加粗</strong>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      颜色
                    </label>
                    <input
                      type="color"
                      value={(activeConfig as FieldConfig).color}
                      onChange={(e) => handleFieldChange(activeField, 'color', e.target.value)}
                      className="w-full h-10 px-2 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      对齐方式
                    </label>
                    <select
                      value={(activeConfig as FieldConfig).align}
                      onChange={(e) => handleFieldChange(activeField, 'align', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="left">左对齐</option>
                      <option value="center">居中</option>
                      <option value="right">右对齐</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-slate-600">
                    <h4 className="text-sm font-medium text-gray-300 mb-3">文本框范围限制（可选）</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          最大宽度 (px)
                        </label>
                        <input
                          type="number"
                          value={(activeConfig as FieldConfig).maxWidth || ''}
                          onChange={(e) => handleFieldChange(activeField, 'maxWidth', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="不限制"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-gray-400 mb-1">
                          最大高度 (px)
                        </label>
                        <input
                          type="number"
                          value={(activeConfig as FieldConfig).maxHeight || ''}
                          onChange={(e) => handleFieldChange(activeField, 'maxHeight', e.target.value ? Number(e.target.value) : undefined)}
                          placeholder="不限制"
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <p className="text-xs text-gray-500">
                        💡 设置后文本会在此范围内自动换行
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tips */}
            <div className="mt-6 p-4 bg-slate-900 rounded-lg">
              <p className="text-xs text-gray-400 mb-2">💡 操作提示：</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• 🖱️ <strong>鼠标拖动</strong>圆点可快速定位</li>
                <li>• 红色标记表示当前选中的字段</li>
                <li>• 灰色虚线标记其他字段位置</li>
                {isStampField ? (
                  <li>• 盖章中心点：印章旋转的中心位置</li>
                ) : (
                  <>
                    <li>• 定位点说明：
                      <ul className="ml-4 mt-1">
                        <li>- <strong>左对齐</strong>：定位点在文本左侧起点</li>
                        <li>- <strong>居中</strong>：定位点在文本水平中心</li>
                        <li>- <strong>右对齐</strong>：定位点在文本右侧终点</li>
                        <li>- <strong>Y坐标</strong>：文本基线位置</li>
                      </ul>
                    </li>
                    <li>• 绿色虚线框：文本范围限制区域</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 overflow-auto p-4 bg-slate-900">
            <div className="flex items-center justify-center min-h-full">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="max-w-full h-auto shadow-2xl cursor-crosshair"
                style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
