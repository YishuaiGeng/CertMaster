import React, { useState, useEffect } from 'react';
import { CertificateData, Template } from './types';
import { storage } from './utils/storage';
import { scanTemplateFiles } from './utils/templateScanner';
import { CertificateEditor } from './components/CertificateEditor';
import { CertificatePreview } from './components/CertificatePreview';
import { TemplateManager } from './components/TemplateManager';
import { CertificateList } from './components/CertificateList';
import { Settings, Plus, Award } from 'lucide-react';

function App() {
  const [currentCertificate, setCurrentCertificate] = useState<CertificateData>({
    id: `cert_${Date.now()}`,
    title: '',
    name: '',
    content: '',
    guidanceUnit: '',
    certNumber: '',
    authTime: new Date().toISOString().split('T')[0],
    authUnit: '',
    certificateTemplateId: '',
    stampTemplateId: '',
    watermarkTemplateId: '',
    createdAt: new Date().toISOString(),
  });

  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [showCertificateList, setShowCertificateList] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      console.log('🚀 初始化应用...');
      
      // 清理 LocalStorage 中的旧模板数据（之前用 DataURL 保存的）
      // 新系统使用动态加载，不需要在 LocalStorage 中保存内置模板
      const oldTemplates = storage.getTemplates();
      console.log(`📊 检查 LocalStorage: 发现 ${oldTemplates.length} 个旧模板`);
      
      if (oldTemplates.length > 0) {
        console.log('🧹 正在清理旧的模板数据...');
        console.log('   旧模板列表:', oldTemplates.map(t => `${t.type}: ${t.name}`));
        localStorage.removeItem('certmaster_templates'); // 正确的 key
        console.log('✅ 旧模板数据已清理');
      }
      
      loadData();
      setIsLoading(false);
    };
    initApp();
  }, []);

  const loadData = () => {
    setCertificates(storage.getCertificates());
    
    // 重新扫描内置模板并合并用户模板
    const builtInTemplates = scanTemplateFiles();
    const userTemplates = storage.getTemplates();
    const allTemplates: Template[] = [
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
    setTemplates(allTemplates);
  };

  const handleSave = () => {
    if (!currentCertificate.name) {
      alert('请填写姓名');
      return;
    }

    if (!currentCertificate.certificateTemplateId) {
      alert('请选择证书模板');
      return;
    }

    if (!currentCertificate.stampTemplateId) {
      alert('请选择盖章模板');
      return;
    }

    storage.saveCertificate(currentCertificate);
    loadData();
    alert('证书保存成功！');
  };

  const handleNew = () => {
    setCurrentCertificate({
      id: `cert_${Date.now()}`,
      title: '',
      name: '',
      content: '',
      guidanceUnit: '',
      certNumber: '',
      authTime: new Date().toISOString().split('T')[0],
      authUnit: '',
      certificateTemplateId: '',
      stampTemplateId: '',
      watermarkTemplateId: '',
      createdAt: new Date().toISOString(),
    });
  };

  const handleSelectCertificate = (cert: CertificateData) => {
    setCurrentCertificate(cert);
    setShowCertificateList(false);
  };

  const handleDeleteCertificate = (id: string) => {
    storage.deleteCertificate(id);
    loadData();
    if (currentCertificate.id === id) {
      handleNew();
    }
  };

  const certificateTemplates = templates.filter(t => t.type === 'certificate');
  const stampTemplates = templates.filter(t => t.type === 'stamp');
  const watermarkTemplates = templates.filter(t => t.type === 'watermark');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/gold_certificate.png" 
            alt="证书Logo" 
            className="w-20 h-20 mx-auto mb-4 animate-pulse object-contain"
          />
          <p className="text-white text-xl">正在加载模板...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800 shadow-lg border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/gold_certificate.png" 
                alt="证书Logo" 
                className="w-10 h-10 object-contain"
              />
              <h1 className="text-2xl font-bold text-white">证书制作器</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                新建证书
              </button>
              <button
                onClick={() => setShowCertificateList(!showCertificateList)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Award className="w-5 h-5" />
                我的证书
              </button>
              <button
                onClick={() => setShowTemplateManager(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <Settings className="w-5 h-5" />
                模板管理
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-140px)]">
          {/* Left Sidebar - Certificate List */}
          {showCertificateList && (
            <div className="col-span-3 bg-slate-800 rounded-lg shadow-xl p-4 overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">已保存的证书</h2>
              <CertificateList
                certificates={certificates}
                onSelect={handleSelectCertificate}
                onDelete={handleDeleteCertificate}
                selectedId={currentCertificate.id}
              />
            </div>
          )}

          {/* Left Panel - Editor */}
          <div className={`${showCertificateList ? 'col-span-4' : 'col-span-5'} bg-slate-800 rounded-lg shadow-xl overflow-hidden`}>
            <CertificateEditor
              data={currentCertificate}
              onChange={setCurrentCertificate}
            />
          </div>

          {/* Right Panel - Preview */}
          <div className={`${showCertificateList ? 'col-span-5' : 'col-span-7'} bg-slate-900 rounded-lg shadow-xl overflow-hidden`}>
            <CertificatePreview
              data={currentCertificate}
              templates={templates}
              certificateTemplates={certificateTemplates}
              stampTemplates={stampTemplates}
              watermarkTemplates={watermarkTemplates}
              onChange={setCurrentCertificate}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          onClose={() => setShowTemplateManager(false)}
          onUpdate={loadData}
        />
      )}
    </div>
  );
}

export default App;
