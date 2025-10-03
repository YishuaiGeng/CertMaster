export interface CertificateData {
  id: string;
  title: string; // 证书名称
  name: string; // 姓名
  content: string; // 证书内容
  guidanceUnit: string; // 指导单位
  certNumber: string; // 证书编号
  authTime: string; // 授权时间
  authUnit: string; // 授权单位
  certificateTemplateId: string;
  stampTemplateId: string;
  watermarkTemplateId: string;
  createdAt: string;
  showDay?: boolean; // 是否显示日期中的"日"
}

export interface Template {
  id: string;
  name: string;
  type: 'certificate' | 'stamp' | 'watermark';
  imageUrl?: string; // DataURL (用于用户上传的模板)
  path?: string; // 文件路径 (用于系统内置模板)
  createdAt: string;
  config?: TemplateConfig; // 模板配置
}

export interface TemplatePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 字段配置
export interface FieldConfig {
  x: number; // X坐标（文本起始点）
  y: number; // Y坐标（文本基线）
  fontSize: number; // 字体大小
  fontFamily: string; // 字体
  fontWeight: 'normal' | 'bold'; // 字体粗细
  fontStyle?: 'normal' | 'italic'; // 字体样式（斜体）
  textDecoration?: 'none' | 'underline'; // 文本装饰（下划线）
  color: string; // 颜色
  align: 'left' | 'center' | 'right'; // 对齐方式
  maxWidth?: number; // 最大宽度（可选，用于文本换行）
  maxHeight?: number; // 最大高度（可选，用于限制文本区域）
  lineHeight?: number; // 行间距（可选，默认为fontSize * 1.5）
  wrapLabel?: boolean; // 是否将标签和内容换行显示（可选，用于"授权单位：xxx"等）
}

// 盖章配置
export interface StampConfig {
  x: number; // X坐标
  y: number; // Y坐标
  width: number; // 宽度
  height: number; // 高度
  rotation: number; // 旋转角度（度）
}

// 默认内容配置
export interface DefaultContent {
  name?: string; // 默认姓名
  content?: string; // 默认证书内容
  guidanceUnit?: string; // 默认指导单位
  certNumber?: string; // 默认证书编号
  authTime?: string; // 默认授权时间
  authUnit?: string; // 默认授权单位
}

// 模板配置
export interface TemplateConfig {
  name: FieldConfig;
  content: FieldConfig;
  guidanceUnit: FieldConfig;
  certNumber: FieldConfig;
  authTime: FieldConfig;
  authUnit: FieldConfig;
  stamp: StampConfig; // 盖章配置
  defaultContent?: DefaultContent; // 默认内容（可选）
}
