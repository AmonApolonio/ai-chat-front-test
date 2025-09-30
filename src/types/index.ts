// Shared type definitions

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  isUploading: boolean;
  error?: string;
}

export interface ProductItem {
  title: string;
  product_link: string;
  source: string;
  icon: string;
  price: number;
  photo_url: string;
}

export interface LookDescription {
  item1?: string;
  item2?: string;
  item3?: string;
  item4?: string;
  item5?: string;
}

export interface LookData {
  remaining?: number;
  descricaoLooks?: LookDescription;
  items1?: ProductItem[];
  items2?: ProductItem[];
  items3?: ProductItem[];
  items4?: ProductItem[];
  items5?: ProductItem[];
}

export interface Message {
  id: string;
  text?: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type?: 'text' | 'look' | 'initial';
  looks?: LookData[];
  expectedLooksCount?: number;
  images?: string[];
}

export interface QuickResponse {
  text: string;
  id: string;
}

export interface ModalItemIndices {
  [key: string]: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
}