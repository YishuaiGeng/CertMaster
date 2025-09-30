import React from 'react';
import { CertificateData } from '../types';
import { FileText, Trash2, Calendar } from 'lucide-react';

interface CertificateListProps {
  certificates: CertificateData[];
  onSelect: (certificate: CertificateData) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

export const CertificateList: React.FC<CertificateListProps> = ({
  certificates,
  onSelect,
  onDelete,
  selectedId,
}) => {
  return (
    <div className="space-y-2">
      {certificates.map((cert) => (
        <div
          key={cert.id}
          className={`p-4 rounded-lg cursor-pointer transition-all ${
            selectedId === cert.id
              ? 'bg-blue-600 shadow-lg'
              : 'bg-slate-700 hover:bg-slate-600'
          }`}
          onClick={() => onSelect(cert)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 flex-shrink-0" />
                <h3 className="font-semibold text-white truncate">
                  {cert.title || '未命名证书'}
                </h3>
              </div>
              <p className="text-sm text-gray-300 truncate">{cert.name}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <Calendar className="w-3 h-3" />
                <span>{new Date(cert.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个证书吗？')) {
                  onDelete(cert.id);
                }
              }}
              className="ml-2 p-2 text-gray-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {certificates.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>暂无保存的证书</p>
          <p className="text-sm mt-2">填写表单后点击保存按钮</p>
        </div>
      )}
    </div>
  );
};
