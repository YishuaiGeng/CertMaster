import React, { useState, useEffect, useRef } from 'react';
import { CertificateData, Template } from './types';
import { storage } from './utils/storage';
import { scanTemplateFiles } from './utils/templateScanner';
import { CertificateEditor } from './components/CertificateEditor';
import { CertificatePreview } from './components/CertificatePreview';
import { TemplateManager } from './components/TemplateManager';
import { CertificateList } from './components/CertificateList';
import { Settings, Plus, Award } from 'lucide-react';
import { saveCertificate as saveCertificateToBackend, checkHealth, fetchCertificates, fetchConfigs, deleteCertificate as deleteCertificateFromBackend } from './utils/api';

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
  const [backendAvailable, setBackendAvailable] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      console.log('🚀 初始化应用...');
      
      // 检查后端服务是否可用
      const health = await checkHealth();
      if (health) {
        console.log('✅ 后端服务已连接');
        setBackendAvailable(true);
      } else {
        console.log('⚠️ 后端服务未启动，将使用 LocalStorage');
        setBackendAvailable(false);
      }
      
      // 检查是否已经执行过数据迁移（只执行一次）
      const MIGRATION_KEY = 'certmaster_migration_done';
      const migrationDone = localStorage.getItem(MIGRATION_KEY);
      
      if (!migrationDone) {
        console.log('📦 首次启动或数据迁移...');
        
        // 检查是否有旧的模板数据需要清理
        const oldTemplates = storage.getTemplates();
        const hasOldTemplates = oldTemplates.some(t => t.imageUrl && t.imageUrl.startsWith('data:'));
        
        if (hasOldTemplates) {
          console.log('🧹 清理旧的 Base64 模板数据...');
          const userUploadedTemplates = oldTemplates.filter(t => !t.path);
          
          // 只保留用户上传的模板（非内置模板）
          localStorage.setItem('certmaster_templates', JSON.stringify(userUploadedTemplates));
          console.log(`✅ 保留了 ${userUploadedTemplates.length} 个用户上传的模板`);
        }
        
        // 标记迁移完成，下次启动不再执行
        localStorage.setItem(MIGRATION_KEY, 'true');
        console.log('✅ 数据迁移完成');
      } else {
        console.log('✅ 系统已初始化，跳过迁移');
      }
      
      loadData();
      setIsLoading(false);
    };
    initApp();
  }, []);

  const loadData = async () => {
    // 加载证书：优先从后端，失败则从 LocalStorage
    if (backendAvailable) {
      try {
        const certificatesFromBackend = await fetchCertificates();
        console.log(`✅ 从后端加载了 ${certificatesFromBackend.length} 个证书`);
        setCertificates(certificatesFromBackend);
      } catch (error) {
        console.error('从后端加载证书失败，使用 LocalStorage:', error);
        setCertificates(storage.getCertificates());
      }
    } else {
      setCertificates(storage.getCertificates());
    }
    
    // 重新扫描内置模板并合并用户模板
    const builtInTemplates = scanTemplateFiles();
    const userTemplates = storage.getTemplates();
    
    // 加载模板配置：优先从后端，失败则从 LocalStorage
    let allConfigs: any = {};
    if (backendAvailable) {
      try {
        allConfigs = await fetchConfigs();
        console.log(`✅ 从后端加载了 ${Object.keys(allConfigs).length} 个模板配置`);
      } catch (error) {
        console.error('从后端加载配置失败，使用 LocalStorage:', error);
      }
    }
    
    const allTemplates: Template[] = [
      ...builtInTemplates.map(t => {
        // 优先使用后端配置，否则使用 LocalStorage
        let config;
        const backendConfigKey = `template_config_${t.id}`;
        if (allConfigs[backendConfigKey]) {
          config = allConfigs[backendConfigKey];
        } else {
          const savedConfig = localStorage.getItem(backendConfigKey);
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
    setTemplates(allTemplates);
  };

  const handleSave = async () => {
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

    // 如果没有标题，自动生成一个标题
    let certificateToSave = { ...currentCertificate };
    if (!certificateToSave.title) {
      // 获取证书模板名称
      const certTemplate = templates.find(t => t.id === currentCertificate.certificateTemplateId);
      const templateName = certTemplate?.name.replace(/\.(png|jpg|jpeg)$/i, '') || '证书';
      
      // 生成标题：姓名 + 模板名称
      certificateToSave.title = `${currentCertificate.name} - ${templateName}`;
      
      // 同时更新当前证书对象
      setCurrentCertificate(certificateToSave);
      
      console.log('📝 自动生成证书标题:', certificateToSave.title);
    }

    // 如果后端可用，保存到后端
    if (backendAvailable && canvasRef.current) {
      try {
        // 从 canvas 获取图片数据
        const imageData = canvasRef.current.toDataURL('image/png');
        
        console.log('💾 保存证书到后端...');
        await saveCertificateToBackend(certificateToSave, imageData);
        alert('证书保存成功！文件已保存到 server/data/certificates/ 目录');
      } catch (error) {
        console.error('保存到后端失败，回退到 LocalStorage:', error);
        storage.saveCertificate(certificateToSave);
        alert('证书已保存到浏览器（后端保存失败）');
      }
    } else {
      // 后端不可用，使用 LocalStorage
      storage.saveCertificate(certificateToSave);
      alert('证书已保存到浏览器（后端未启动）');
    }

    loadData();
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

  const handleDeleteCertificate = async (id: string) => {
    // 如果后端可用，从后端删除
    if (backendAvailable) {
      try {
        await deleteCertificateFromBackend(id);
        console.log('✅ 从后端删除证书成功');
      } catch (error) {
        console.error('从后端删除证书失败:', error);
        // 失败也尝试从 LocalStorage 删除
        storage.deleteCertificate(id);
      }
    } else {
      storage.deleteCertificate(id);
    }
    
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
              canvasRef={canvasRef}
            />
          </div>
        </div>
      </div>

      {/* Template Manager Modal */}
      {showTemplateManager && (
        <TemplateManager
          onClose={() => setShowTemplateManager(false)}
          onUpdate={loadData}
          backendAvailable={backendAvailable}
        />
      )}
    </div>
  );
}

export default App;
