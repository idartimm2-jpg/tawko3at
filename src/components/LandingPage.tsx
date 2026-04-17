import React, { useState, useEffect } from "react";
import { Loader2, Gift, Edit } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const [guess, setGuess] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [settings, setSettings] = useState({ 
    logoUrl: "", fbLink: "", googleWebhookUrl: "", 
    headlineText1: "شارك معنا", headlineText2: "واكسب جوائز قيمة!",
    guessLabel: "توقع اسم المحل و سيبله التوقع 🎯",
    phoneLabel: "اكتب رقم فونك علشان لو كسبت 📱",
    buttonText: "اضغط هنا واعمل فولو واكسب"
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load settings:", err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guess.trim() || !phone.trim()) {
      setFormError("برجاء إدخال التوقع ورقم الهاتف");
      return;
    }
    setFormError("");

    // Setup redirect URL and open blank tab immediately to bypass popup blockers
    let fbWindow: Window | null = null;
    let targetUrl = settings.fbLink;
    if (targetUrl) {
      if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl;
      fbWindow = window.open("about:blank", "_blank");
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guess, phone })
      });
      
      if (!response.ok) throw new Error("Network error");
      
      // Redirect the opened tab to Facebook
      if (fbWindow && targetUrl) {
        fbWindow.location.href = targetUrl;
      }
      
      // Reset form
      setGuess("");
      setPhone("");
      
      if (!targetUrl) {
        alert("تم إرسال توقعك بنجاح! شكراً لمشاركتك.");
      }
    } catch (err) {
      // Close the tab if submission failed
      if (fbWindow) fbWindow.close();
      setFormError("حدث خطأ أثناء الإرسال، برجاء المحاولة مرة أخرى.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[600px] p-[40px] bg-white rounded-[24px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] text-center border border-black/5 z-10 relative"
      >
        
        {/* Header Section */}
        <div className="text-center">
          <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold mb-4">مسابقة حصرية</div>
          
          {settings.logoUrl ? (
            <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-600 to-slate-800 rounded-[30px] mx-auto mb-[30px] flex items-center justify-center text-white font-bold text-2xl shadow-[0_10px_15px_-3px_rgba(37,99,235,0.3)] overflow-hidden">
              <img 
                src={settings.logoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : (
            <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-600 to-slate-800 rounded-[30px] mx-auto mb-[30px] flex items-center justify-center text-white font-bold text-2xl shadow-[0_10px_15px_-3px_rgba(37,99,235,0.3)]">
              LOGO
            </div>
          )}
          
          <h1 className="text-[28px] mb-[30px] text-slate-800 font-extrabold flex flex-col sm:block gap-2">
            <span>{settings.headlineText1} </span><span>{settings.headlineText2}</span>
          </h1>
        </div>

        {/* Form Section */}
        <div>
          <form onSubmit={handleSubmit}>
            
            <div className="mb-5 text-right w-full">
              <label htmlFor="guess" className="block mb-2 font-semibold text-slate-900 text-sm">
                {settings.guessLabel}
              </label>
              <input
                id="guess"
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                placeholder="اكتب توقعك هنا..."
                className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900"
                required
              />
            </div>

            <div className="mb-5 text-right w-full">
              <label htmlFor="phone" className="block mb-2 font-semibold text-slate-900 text-sm">
                {settings.phoneLabel}
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="رقم الهاتف (مثال: 010...)"
                className="w-full px-[18px] py-[14px] border-2 border-slate-200 rounded-xl text-base outline-none transition-colors bg-[#fcfcfc] focus:border-blue-600 focus:bg-white text-slate-900 text-left"
                dir="ltr"
                required
              />
            </div>

            {formError && (
              <p className="text-red-500 text-sm font-semibold mb-4 text-center bg-red-50 p-2 rounded-lg">{formError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={submitting}
              type="submit"
              className="mt-[10px] bg-blue-600 text-white border-none w-full p-[16px] rounded-[12px] text-[18px] font-bold cursor-pointer flex items-center justify-center gap-[10px] shadow-[0_4px_6px_-1px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:cursor-wait"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Gift className="w-5 h-5" />}
              <span>{submitting ? "جاري الإرسال..." : settings.buttonText}</span>
            </motion.button>
            <a href={settings.fbLink || "#"} onClick={(e) => { if(!settings.fbLink) e.preventDefault(); }} className="mt-[15px] block text-slate-500 text-[13px] no-underline">
              سيتم توجيهك لصفحتنا على فيسبوك للمتابعة
            </a>
          </form>
        </div>
      </motion.div>

      <Link to="/admin" className="absolute top-[20px] left-[20px] sm:top-[40px] sm:left-[40px] bg-white p-4 rounded-full shadow-lg text-slate-400 hover:text-blue-600 transition-all z-20 border border-slate-100 hover:scale-110 flex items-center justify-center" title="تعديل الإعدادات (Admin)">
        <Edit className="w-6 h-6" />
      </Link>
    </div>
  );
}
