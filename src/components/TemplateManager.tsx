import React, { useState } from 'react';
import { Template } from '../types';
import { storage } from '../utils/storage';
import { fileToDataUrl } from '../utils/imageUtils';
import { scanTemplateFiles } from '../utils/templateScanner';
import { TemplateEditor } from './TemplateEditor';
import { Upload, Trash2, Image as ImageIcon, X, Eye, Settings as SettingsIcon } from 'lucide-react';

interface TemplateManagerProps {
  onClose: () => void;
  onUpdate: () => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onClose, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<Template['type']>('certificate');
  
  // 合并内置模板和用户上传的模板，并加载配置
  const loadTemplatesWithConfig = (): Template[] => {
    const builtInTemplates = scanTemplateFiles();
    const userTemplates = storage.getTemplates();
    
    return [
      ...builtInTemplates.map(t => {
        // 加载内置模板的配置
        const configKey = `template_config_${t.id}`;
        const savedConfig = localStorage.getItem(configKey);
        return {
          id: t.id,
          name: t.name,
          type: t.type,
          path: t.path,
          config: savedConfig ? JSON.parse(savedConfig) : undefined,
          createdAt: new Date().toISOString(),
        };
      }),
      ...userTemplates
    ];
  };
  
  const [templates, setTemplates] = useState<Template[]>(loadTemplatesWithConfig());
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);

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
      setTemplates(storage.getTemplates());
      onUpdate();
      alert('模板上传成功！');
    } catch (error) {
      console.error('Upload failed:', error);
      alert('上传失败，请重试');
    }

    e.target.value = '';
  };

  const handleDelete = (id: string, template: Template) => {
    // 检查是否为内置模板（有path字段）
    if (template.path) {
      alert('内置模板不能删除');
      return;
    }
    
    if (confirm('确定要删除这个模板吗？')) {
      storage.deleteTemplate(id);
      
      // 重新加载模板列表
      const builtIn = scanTemplateFiles();
      const userTpls = storage.getTemplates();
      const all: Template[] = [
        ...builtIn.map(t => ({
          id: t.id,
          name: t.name,
          type: t.type,
          path: t.path,
          createdAt: new Date().toISOString(),
        })),
        ...userTpls
      ];
      setTemplates(all);
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
    
    // 确保加载最新的配置
    let templateWithConfig = template;
    if (template.path) {
      const configKey = `template_config_${template.id}`;
      const savedConfig = localStorage.getItem(configKey);
      if (savedConfig) {
        templateWithConfig = {
          ...template,
          config: JSON.parse(savedConfig)
        };
        console.log(`✅ 加载模板配置: ${template.name}`, templateWithConfig.config);
      } else {
        console.log(`ℹ️ 模板 ${template.name} 没有保存的配置，将使用默认值`);
      }
    }
    
    setEditingTemplate(templateWithConfig);
  };

  const handleSaveTemplate = (updatedTemplate: Template) => {
    console.log('💾 保存模板配置:', updatedTemplate.name);
    console.log('   配置内容:', updatedTemplate.config);
    
    if (updatedTemplate.path) {
      // 内置模板，保存配置到 localStorage
      const configKey = `template_config_${updatedTemplate.id}`;
      localStorage.setItem(configKey, JSON.stringify(updatedTemplate.config));
      console.log(`✅ 配置已保存到 LocalStorage: ${configKey}`);
    } else {
      // 用户模板，直接更新
      storage.deleteTemplate(updatedTemplate.id);
      storage.saveTemplate(updatedTemplate);
      console.log(`✅ 用户模板已更新`);
    }
    
    // 重新加载模板列表（带配置）
    setTemplates(loadTemplatesWithConfig());
    onUpdate();
    
    alert('✅ 模板配置已保存！\n下次编辑此模板时会自动加载这些配置。');
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
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
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
