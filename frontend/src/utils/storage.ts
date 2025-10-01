import { CertificateData, Template } from '../types';

const STORAGE_KEYS = {
  CERTIFICATES: 'certmaster_certificates',
  TEMPLATES: 'certmaster_templates',
};

export const storage = {
  // Certificate operations
  getCertificates(): CertificateData[] {
    const data = localStorage.getItem(STORAGE_KEYS.CERTIFICATES);
    return data ? JSON.parse(data) : [];
  },

  saveCertificate(certificate: CertificateData): void {
    const certificates = this.getCertificates();
    const index = certificates.findIndex(c => c.id === certificate.id);
    if (index >= 0) {
      certificates[index] = certificate;
    } else {
      certificates.push(certificate);
    }
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  },

  deleteCertificate(id: string): void {
    const certificates = this.getCertificates().filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CERTIFICATES, JSON.stringify(certificates));
  },

  // Template operations
  getTemplates(): Template[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  },

  saveTemplate(template: Template): void {
    const templates = this.getTemplates();
    templates.push(template);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  deleteTemplate(id: string): void {
    const templates = this.getTemplates().filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  getTemplatesByType(type: Template['type']): Template[] {
    return this.getTemplates().filter(t => t.type === type);
  },
};
