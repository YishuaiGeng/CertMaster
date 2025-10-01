import React, { useState, useRef } from 'react';
import { Template } from '../types';
import { storage } from '../utils/storage';
import { fileToDataUrl } from '../utils/imageUtils';
import { scanTemplateFiles } from '../utils/templateScanner';
import { TemplateEditor } from './TemplateEditor';
import { exportConfigs, importConfigs } from '../utils/configBackup';
import { saveConfig, fetchConfigs } from '../utils/api';
import { Upload, Trash2, Image as ImageIcon, X, Eye, Settings as SettingsIcon, Download, FileUp } from 'lucide-react';

interface TemplateManagerProps {
  onClose: () => void;
  onUpdate: () => void;
  backendAvailable?: boolean;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose, onUpdate, backendAvailable = false }) => {
  const [activeTab, setActiveTab] = useState<Template['type']>('certificate');
  const importInputRef = useRef<HTMLInputElement>(null);
  
  // 合并内置模板和用户上传的模板，并加载配置
  const loadTemplatesWithConfig = async (): Promise<Template[]> => {
    const builtInTemplates = scanTemplateFiles();
    const userTemplates = storage.getTemplates();
    
    // 尝试从后端加载配置
    let allConfigs: any = {};
    if (backendAvailable) {
      try {
        allConfigs = await fetchConfigs();
        console.log(`✅ 模板管理器：从后端加载了 ${Object.keys(allConfigs).length} 个配置`);
      } catch (error) {
        console.error('模板管理器：从后端加载配置失败:', error);
      }
    }
    
    return [
      ...builtInTemplates.map(t => {
        // 优先使用后端配置
        const configKey = `template_config_${t.id}`;
        let config = allConfigs[configKey];
        if (!config) {
          const savedConfig = localStorage.getItem(configKey);
          config = savedConfig ? JSON.parse(savedConfig) : undefined;
        }
        return {
          id: t.id,
          name: t.name,
          type: t.type,
          path: t.path,
          config: config,
          createdAt: new Date().toISOString(),
        };
      }),
      ...userTemplates
    ];
  };
  
  const [templates, setTemplates] = useState<Template[]>([]);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  
  // 初始化加载模板
  React.useEffect(() => {
    loadTemplatesWithConfig().then(setTemplates);
  }, [backendAvailable]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: Template['type']) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }

    try {
      const imageUrl = await fileToDataUrl(file);
      const template: Template = {
        id: `${type}_${Date.now()}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        type,
        imageUrl,
        createdAt: new Date().toISOString(),
      };

      storage.saveTemplate(template);
      const refreshedTemplates = await loadTemplatesWithConfig();
      setTemplates(refreshedTemplates);
      onUpdate();
      alert('模板上传成功！');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    }

    e.target.value = '';
  };

  const handleDelete = async (id: string, template: Template) => {
    // 检查是否为内置模板（有path字段）
    if (template.path) {
      alert('内置模板不能删除');
      return;
    }
    
    if (confirm('确定要删除这个模板吗？')) {
      storage.deleteTemplate(id);
      
      // 重新加载模板列表
      const refreshedTemplates = await loadTemplatesWithConfig();
      setTemplates(refreshedTemplates);
      onUpdate();
    }
  };
  
  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
  };

  const handleEdit = (template: Template) => {
    // 只允许编辑证书模板
    if (template.type !== 'certificate') {
      alert('只有证书模板可以编辑字段配置');
      return;
    }
    
    console.log('🔧 开始编辑模板:', template.name);
    
    // 确保加载最新的配置
    let templateWithConfig = template;
    if (template.path) {
      const configKey = `template_config_${template.id}`;
      const savedConfig = localStorage.getItem(configKey);
      if (savedConfig) {
        const parsedConfig = JSON.parse(savedConfig);
        templateWithConfig = {
          ...template,
          config: parsedConfig
        };
        console.log(`✅ 加载模板配置: ${template.name}`);
        console.log('   完整配置:', parsedConfig);
        
        // 特别检查授权时间配置
        if (parsedConfig.authTime) {
          console.log('   ✨ 授权时间配置:', {
            align: parsedConfig.authTime.align,
            x: parsedConfig.authTime.x,
            y: parsedConfig.authTime.y,
            fontSize: parsedConfig.authTime.fontSize,
          });
        }
      } else {
        console.log(`ℹ️ 模板 ${template.name} 没有保存的配置，将使用默认值`);
      }
    }
    
    setEditingTemplate(templateWithConfig);
  };

  const handleSaveTemplate = async (updatedTemplate: Template) => {
    console.log('💾 保存模板配置:', updatedTemplate.name);
    console.log('   配置内容:', JSON.stringify(updatedTemplate.config, null, 2));
    
    // 特别检查授权时间的配置
    if (updatedTemplate.config?.authTime) {
      console.log('   ✨ 授权时间配置详情:', {
        align: updatedTemplate.config.authTime.align,
        x: updatedTemplate.config.authTime.x,
        y: updatedTemplate.config.authTime.y,
        fontSize: updatedTemplate.config.authTime.fontSize,
      });
    }
    
    if (updatedTemplate.path) {
      // 内置模板，保存配置
      const configKey = `template_config_${updatedTemplate.id}`;
      
      // 优先保存到后端
      if (backendAvailable) {
        try {
          await saveConfig(updatedTemplate.id, updatedTemplate.config);
          console.log(`✅ 配置已保存到后端: ${configKey}`);
          
          // 验证保存
          const savedConfigJson = JSON.stringify(updatedTemplate.config);
          console.log('   验证: 保存的数据长度:', savedConfigJson.length, '字节');
        } catch (error) {
          console.error('保存到后端失败，回退到 LocalStorage:', error);
          localStorage.setItem(configKey, JSON.stringify(updatedTemplate.config));
          console.log(`✅ 配置已保存到 LocalStorage: ${configKey}`);
        }
      } else {
        // 后端不可用，保存到 LocalStorage
        const configJson = JSON.stringify(updatedTemplate.config);
        localStorage.setItem(configKey, configJson);
        console.log(`✅ 配置已保存到 LocalStorage: ${configKey}`);
        console.log('   验证: 保存的数据长度:', configJson.length, '字节');
        
        // 立即读取验证
        const savedConfig = localStorage.getItem(configKey);
        if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          console.log('   验证: 读取授权时间配置:', parsed.authTime);
        }
      }
    } else {
      // 用户模板，直接更新
      storage.deleteTemplate(updatedTemplate.id);
      storage.saveTemplate(updatedTemplate);
      console.log(`✅ 用户模板已更新`);
    }
    
    // 重新加载模板列表（带配置）
    const refreshedTemplates = await loadTemplatesWithConfig();
    setTemplates(refreshedTemplates);
    setEditingTemplate(null);
    onUpdate();
    
    alert('✅ 模板配置已保存！\n下次编辑此模板时会自动加载这些配置。');
  };

  // 导出配置
  const handleExportConfigs = () => {
    try {
      const count = exportConfigs();
      alert(`✅ 成功导出 ${count} 个模板配置！\n\n文件已保存到下载目录。\n建议定期备份配置文件。`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('❌ 导出失败，请查看控制台了解详情');
    }
  };

  // 导入配置
  const handleImportConfigs = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('❌ 请选择 JSON 格式的配置文件');
      e.target.value = '';
      return;
    }

    try {
      const count = await importConfigs(file);
      
      // 重新加载模板列表
      const refreshedTemplates = await loadTemplatesWithConfig();
      setTemplates(refreshedTemplates);
      onUpdate();
      
      alert(`✅ 成功导入 ${count} 个模板配置！\n\n配置已生效，可以在模板编辑器中查看。`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('❌ 导入失败，请确保文件格式正确');
    }

    e.target.value = '';
  };

  const getTemplatesByType = (type: Template['type']) => {
    return templates.filter(t => t.type === type);
  };

  const getTabLabel = (type: Template['type']) => {
    switch (type) {
      case 'certificate': return '证书模板';
      case 'stamp': return '盖章模板';
      case 'watermark': return '水印模板';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header with Tabs and Close Button */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
          <div className="flex gap-2">
            {(['certificate', 'stamp', 'watermark'] as Template['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeTab === type
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 text-gray-400 hover:text-white'
                }`}
              >
                {getTabLabel(type)}
              </button>
            ))}
          </div>
          
          {/* Config Backup Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportConfigs}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              title="导出所有模板配置"
            >
              <Download className="w-4 h-4" />
              <span>导出配置</span>
            </button>
            
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              title="导入模板配置"
            >
              <FileUp className="w-4 h-4" />
              <span>导入配置</span>
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".json"
              onChange={handleImportConfigs}
              className="hidden"
            />
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload button */}
          <div className="mb-6">
            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              上传{getTabLabel(activeTab)}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, activeTab)}
                className="hidden"
              />
            </label>
          </div>

          {/* Templates grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {getTemplatesByType(activeTab).map((template) => (
              <div
                key={template.id}
                className="bg-slate-700 rounded-lg overflow-hidden group relative"
              >
                <div 
                  className="aspect-square bg-slate-600 flex items-center justify-center cursor-pointer"
                  onClick={() => template.type === 'certificate' ? handleEdit(template) : handlePreview(template)}
                >
                  <img
                    src={template.path || template.imageUrl}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="p-3">
                  <p className="text-white text-sm font-medium truncate">
                    {template.name}
                    {template.path && <span className="ml-2 text-xs text-blue-400">(内置)</span>}
                    {template.config && <span className="ml-2 text-xs text-green-400">(已配置)</span>}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(template.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {template.type === 'certificate' && (
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg"
                      title="编辑配置"
                    >
                      <SettingsIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handlePreview(template)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    title="预览"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {!template.path && (
                    <button
                      onClick={() => handleDelete(template.id, template)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {getTemplatesByType(activeTab).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
                <p>暂无{getTabLabel(activeTab)}</p>
                <p className="text-sm mt-2">点击上方按钮上传模板</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] bg-slate-800 rounded-lg overflow-hidden">
            <div className="flex justify-between items-center p-4 bg-slate-900 border-b border-slate-700">
              <div>
                <h3 className="text-xl font-bold text-white">{previewTemplate.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {previewTemplate.path ? '内置模板' : '用户上传'} • {new Date(previewTemplate.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center overflow-auto">
              <img
                src={previewTemplate.path || previewTemplate.imageUrl}
                alt={previewTemplate.name}
                className="max-w-full max-h-[70vh] object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        </div>
      )}

      {/* Template Editor Modal */}
      {editingTemplate && (
        <TemplateEditor
          template={editingTemplate}
          onClose={() => setEditingTemplate(null)}
          onSave={handleSaveTemplate}
        />
      )}
    </div>
  );
};
