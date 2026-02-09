// app/hooks/useLanguage.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'zh';

const translations = {
  en: {
    glossary: 'Glossary',
    login: 'Login',
    logout: 'Logout',
    admin: 'Admin',
    search: 'Search terms...',
    addNew: 'Add New Term',
    noTerms: 'No terms found.',
    category: 'Category',
    english: 'English Term',
    chinese: 'Chinese',
    shortForm: 'Short Form',
    desc: 'Description',
    actions: 'Actions',
    showing: 'Showing',
    terms: 'terms',
    suggestNew: 'Suggest New Term',
    suggestEdit: 'Suggest Edit',
  },
  zh: {
    glossary: '术语表',
    login: '登录',
    logout: '登出',
    admin: '管理员',
    search: '搜索术语...',
    addNew: '新增术语',
    noTerms: '未找到相关术语',
    category: '分类',
    english: '英文术语',
    chinese: '中文',
    shortForm: '简称',
    desc: '描述',
    actions: '操作',
    showing: '显示',
    terms: '条记录',
    suggestNew: '建议新增术语',
    suggestEdit: '建议修改术语',
  }
};

const LanguageContext = createContext<{
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: keyof typeof translations['en']) => string;
}>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>('en');

  const t = (key: keyof typeof translations['en']) => {
    return translations[lang][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
