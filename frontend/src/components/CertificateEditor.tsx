import React from 'react';
import { CertificateData } from '../types';
import { Calendar, FileText, Building2, Hash, User, AlignLeft, Shuffle } from 'lucide-react';
import { dateToChinese } from '../utils/dateUtils';

interface CertificateEditorProps {
  data: CertificateData;
  onChange: (data: CertificateData) => void;
}

export const CertificateEditor: React.FC<CertificateEditorProps> = ({
  data,
  onChange,
}) => {
  const handleChange = (field: keyof CertificateData, value: string | boolean) => {
    onChange({ ...data, [field]: value });
  };

  // 生成随机证书编号
  const generateCertNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const certNumber = `${year}${month}${day}${random}`;
    handleChange('certNumber', certNumber);
  };

  const chineseDate = dateToChinese(data.authTime, data.showDay);

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-800">
      <h2 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
        <FileText className="w-6 h-6" />
        证书编辑器
      </h2>

      <div className="space-y-6">
        {/* 姓名 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <User className="w-4 h-4" />
            姓名
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="请输入姓名"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 证书内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <AlignLeft className="w-4 h-4" />
            证书内容
            <span className="text-red-400">*</span>
          </label>
          <textarea
            value={data.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="请输入证书内容描述"
            rows={8}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-base"
          />
        </div>

        {/* 指导单位 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            指导单位
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.guidanceUnit || ''}
            onChange={(e) => handleChange('guidanceUnit', e.target.value)}
            placeholder="请输入指导单位"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 证书编号 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <Hash className="w-4 h-4" />
            证书编号
            <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={data.certNumber}
              onChange={(e) => handleChange('certNumber', e.target.value)}
              placeholder="例如：202410022968"
              className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={generateCertNumber}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              title="随机生成编号"
            >
              <Shuffle className="w-4 h-4" />
              生成
            </button>
          </div>
        </div>

        {/* 授权时间 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            授权时间
            <span className="text-red-400">*</span>
          </label>
          <input
            type="date"
            value={data.authTime}
            onChange={(e) => handleChange('authTime', e.target.value)}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {chineseDate && (
            <div className="mt-2 px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="text-sm text-gray-400">中文格式：</span>
                  <span className="text-sm text-blue-400 ml-2 font-medium">{chineseDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-400">显示日：</label>
                  <input
                    type="checkbox"
                    checked={data.showDay || false}
                    onChange={(e) => handleChange('showDay', e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-500 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 授权单位 */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            授权单位
            <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={data.authUnit || ''}
            onChange={(e) => handleChange('authUnit', e.target.value)}
            placeholder="请输入授权单位"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
