import React, { useState, useEffect } from "react";
import { Loader2, Save, LogOut, Settings, ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  
  const [settings, setSettings] = useState({ 
    logoUrl: "", fbLink: "", googleWebhookUrl: "",
    headlineText1: "", headlineText2: "",
    guessLabel: "", phoneLabel: "", buttonText: ""
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "130199") {
      setIsAuthenticated(true);
      fetchSettings();
    } else {
      setError("كلمة المرور غير صحيحة");
    }
  };

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    fetch("/api/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: password,
        settings: settings
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setStatusMsg({ type: 'success', text: "تم حفظ الإعدادات بنجاح" });
        setSaving(false);
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      })
      .catch((err) => {
        setStatusMsg({ type: 'error', text: "فشل في الحفظ، تأكد من كلمة المرور" });
        setSaving(false);
        setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
      });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center p-4 relative">
        <Link to="/" className="absolute top-[20px] right-[20px] sm:top-[40px] sm:right-[40px] bg-white px-4 py-2 rounded-xl shadow-sm text-slate-500 hover:text-blue-600 font-semibold text-sm transition-all border border-slate-200 flex items-center gap-2">
          <ArrowRight className="w-4 h-4" />
          العودة للصفحة الرئيسية
        </Link>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-sm bg-white rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] p-[40px] text-center border border-black/5"
        >
          <div className="text-center mb-8">
            <div className="bg-blue-50 w-[72px] h-[72px] rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-[24px] font-extrabold text-slate-800">لوحة الإدارة</h2>
            <p className="text-[14px] text-slate-500 mt-2">قم بتسجيل الدخول للوصول للإعدادات</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="text-right">
              <label className="block text-[14px] font-semibold text-slate-900 mb-2">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900 text-left"
                dir="ltr"
                required
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-[16px] rounded-[12px] text-[18px] shadow-[0_4px_6px_-1px_rgba(37,99,235,0.4)] transition-colors"
            >
              دخول
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 p-4 sm:p-8 relative">
      <Link to="/" className="absolute top-[20px] right-[20px] sm:top-[40px] sm:right-[40px] bg-white px-4 py-2 rounded-xl shadow-sm text-slate-500 hover:text-blue-600 font-semibold text-sm transition-all border border-slate-200 flex items-center gap-2 z-20">
        <ArrowRight className="w-4 h-4" />
        العودة للصفحة الرئيسية
      </Link>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[800px] mx-auto mt-12 bg-white rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] border border-black/5 overflow-hidden relative"
      >
        
        <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">إعدادات لوحة التحكم</h1>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-sm font-medium"
          >
            <span>خروج</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-8 space-y-8">
          
          {/* Logo Setting */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">اللوجو الإفتراضي</h3>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-1 space-y-2 w-full text-right">
                  <label className="block text-[14px] font-semibold text-slate-900 mb-2">رابط صورة اللوجو (URL)</label>
                  <input
                    type="url"
                    value={settings.logoUrl}
                    onChange={(e) => setSettings({...settings, logoUrl: e.target.value})}
                    placeholder="https://..."
                    className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900 text-left"
                    dir="ltr"
                    required
                  />
                  <p className="text-xs text-slate-500">حجم مفضل 150x150 بكسل</p>
                </div>
                {settings.logoUrl && (
                  <div className="w-[120px] h-[120px] bg-slate-50 rounded-[20px] overflow-hidden border-2 border-slate-100 flex-shrink-0 flex items-center justify-center p-2">
                    <img src={settings.logoUrl} alt="Preview" className="max-w-full max-h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Links and Numbers */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">الروابط</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">رابط بوست المسابقة على الفيسبوك (URL)</label>
                <input
                  type="url"
                  value={settings.fbLink}
                  onChange={(e) => setSettings({...settings, fbLink: e.target.value})}
                  placeholder="https://facebook.com/..."
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900 text-left"
                  dir="ltr"
                  required
                />
                <p className="text-xs text-slate-500">سيتم توجيه المستخدم لهذا الرابط بعد نجاح الإرسال</p>
              </div>

              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">رابط Google Sheet (Webhook)</label>
                <input
                  type="url"
                  value={settings.googleWebhookUrl || ""}
                  onChange={(e) => setSettings({...settings, googleWebhookUrl: e.target.value})}
                  placeholder="https://script.google.com/macros/s/..."
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900 text-left"
                  dir="ltr"
                />
                <p className="text-xs text-slate-500">لجمع البيانات في Google Docs/Sheets (أتركه فارغاً إذا لم يطلب)</p>
              </div>
            </div>
          </div>

          {/* Texts Setting */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2 mb-4">النصوص والكلمات</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">العنوان (الجزء الأول)</label>
                <input
                  type="text"
                  value={settings.headlineText1}
                  onChange={(e) => setSettings({...settings, headlineText1: e.target.value})}
                  placeholder="شارك معنا"
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">العنوان (الجزء الثاني)</label>
                <input
                  type="text"
                  value={settings.headlineText2}
                  onChange={(e) => setSettings({...settings, headlineText2: e.target.value})}
                  placeholder="واكسب جوائز قيمة!"
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">عنوان خانة التوقع</label>
                <input
                  type="text"
                  value={settings.guessLabel}
                  onChange={(e) => setSettings({...settings, guessLabel: e.target.value})}
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div className="space-y-2 text-right">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">عنوان خانة الهاتف</label>
                <input
                  type="text"
                  value={settings.phoneLabel}
                  onChange={(e) => setSettings({...settings, phoneLabel: e.target.value})}
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>

              <div className="space-y-2 text-right md:col-span-2">
                <label className="block text-[14px] font-semibold text-slate-900 mb-2">نص زر الإرسال</label>
                <input
                  type="text"
                  value={settings.buttonText}
                  onChange={(e) => setSettings({...settings, buttonText: e.target.value})}
                  className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col gap-4">
            <a href="/api/submissions?password=130199" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold p-[16px] rounded-[12px] text-[16px] transition-colors">
              تحميل / مشاهدة ملف التوقعات (محلياً)
            </a>
            {statusMsg.text && (
              <div className={`mb-4 p-4 rounded-xl text-center font-bold ${statusMsg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {statusMsg.text}
              </div>
            )}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold p-[16px] rounded-[12px] text-[18px] shadow-[0_4px_6px_-1px_rgba(37,99,235,0.4)] transition-colors"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span>{saving ? "جاري الحفظ..." : "حفظ الإعدادات"}</span>
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
