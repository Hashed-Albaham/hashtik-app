import { useState } from 'react';
import './App.css';

export default function App() {
  const [connection, setConnection] = useState({
    ip: '192.168.88.1',
    port: '80',
    username: 'admin',
    password: '',
    path: 'flash/hotspot'
  });

  const [config, setConfig] = useState({
    mode: 'user_only',
    rosVersion: '7',
    theme: 'dark',
    networkName: '🔴 شبكة جورية نت 🟢',
    welcomeText: 'مرحبا بكم في شبكة جورية نت .. سرعة عالية .. أداء مستقر',
    verseText: '( وَمَنْ يَتَّقِ اللَّهَ يَجْعَلْ لَهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لا يَحْتَسِبُ )',
    adminWhatsApp: '+967713354555',
    distributorWhatsApp: '+967717458921',
    communityLink: '',
    umServer: 'statushotsput.com:1580',
    streamingText: '📺 البث المباشر',
    streamingLink: '',
    restText: '🛒 الاستراحة',
    restLink: ''
  });

  const [speeds, setSpeeds] = useState([
    { value: '', text: 'افتراضية' },
    { value: '1M/2M', text: 'متوسطة' }
  ]);

  const [packages, setPackages] = useState([
    { name: 'فئة 200 ريال', price: '200', tier: 'tier-1', data: '1200 ميجا', time: '10 ساعات', validity: '3 ايام' }
  ]);

  const [posLocations, setPosLocations] = useState([
    { title: 'جميع البقالات والاماكن المجاورة', description: '' }
  ]);

  const [announcements, setAnnouncements] = useState([
    { type: 'text', title: 'عنوان الإعلان', text: 'نص الإعلان الهام للشبكة' }
  ]);

  const [adsList, setAdsList] = useState(['img/logo.jpg']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [statusMsg, setStatusMsg] = useState('');

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAds = [];
    const newFiles = [];

    files.forEach((file) => {
      const ext = file.name.split('.').pop();
      const uniqueName = `ad_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
      const internalPath = `img/${uniqueName}`;

      newAds.push(internalPath);
      newFiles.push({ file, internalPath, previewUrl: URL.createObjectURL(file) });
    });

    setAdsList((prev) => [...prev, ...newAds]);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setStatusMsg('✅ تم تجهيز الصور بنجاح، يرجى حفظ ملف الـ config وتحميل الصور المرفقة يدوياً عبر WinBox.');
  };

  const handleRemoveImage = (index) => {
    setAdsList((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const generateConfigJS = () => {
    return `var h_login_settings = {
    "mode": "${config.mode}",
    "enableSpeeds": true,
    "chapEnabled": false,
    "forceSpeedSelection": false,
    "updatesEnable": true,
    "theme": "${config.theme}",
    "announcementsEnabled": true,
    "announcements": ${JSON.stringify(announcements, null, 8)}
};
var ros_version = "${config.rosVersion}";
var ui_config = {
    theme: "${config.theme}",
    networkName: "${config.networkName}",
    welcomeText: "${config.welcomeText}",
    verseText: "${config.verseText}",
    speeds: ${JSON.stringify(speeds, null, 8)},
    ads: ${JSON.stringify(adsList, null, 8)},
    packages: ${JSON.stringify(packages, null, 8)},
    posLocations: ${JSON.stringify(posLocations, null, 8)},
    streamingText: "${config.streamingText}",
    streamingLink: "${config.streamingLink}",
    restText: "${config.restText}",
    restLink: "${config.restLink}",
    adminWhatsApp: "${config.adminWhatsApp}",
    distributorWhatsApp: "${config.distributorWhatsApp}",
    communityLink: "${config.communityLink}",
    umServer: "${config.umServer}"
};`;
  };

  const downloadConfigJS = () => {
    const element = document.createElement("a");
    const file = new Blob([generateConfigJS()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "config.js";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setStatusMsg('💾 تم تحميل ملف config.js بنجاح على جهازك!');
  };

  return (
    <div style={{
      direction: 'rtl',
      minHeight: '100vh',
      background: '#090d16',
      color: '#f8fafc',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '20px'
    }}>
      {/* الهيدر الاحترافي */}
      <header style={{
        maxWidth: '900px',
        margin: '0 auto 25px auto',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid #334155',
        borderRadius: '16px',
        padding: '20px 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', color: '#38bdf8' }}>⚙️ لوحة تحكم HashTik</h1>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>إدارة هوتسبوت المايكروتك (v6 / v7)</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('editor')}
            style={{
              background: activeTab === 'editor' ? '#0284c7' : '#1e293b',
              color: '#fff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
            }}>
            🛠️ لوحة الإعدادات
          </button>
          <button 
            onClick={() => setActiveTab('preview')}
            style={{
              background: activeTab === 'preview' ? '#0284c7' : '#1e293b',
              color: '#fff', border: '1px solid #475569', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s'
            }}>
            📄 معاينة الملف
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto' }}>
        {activeTab === 'editor' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* كارت الاتصال */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0, marginBottom: '15px' }}>🔌 إعدادات الاتصال والمسار</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#94a3b8' }}>إصدار الراوتر:</label>
                  <select 
                    value={config.rosVersion} 
                    onChange={(e) => setConfig({ ...config, rosVersion: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px' }}
                  >
                    <option value="7">RouterOS v7</option>
                    <option value="6">RouterOS v6</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '5px', color: '#94a3b8' }}>مسار الهوتسبوت في الراوتر:</label>
                  <input 
                    type="text" 
                    value={connection.path} 
                    onChange={(e) => setConnection({ ...connection, path: e.target.value })} 
                    style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* كارت إعدادات الواجهة والشبكة */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0, marginBottom: '15px' }}>🌐 بيانات الشبكة والواجهة</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="text" 
                  placeholder="اسم الشبكة" 
                  value={config.networkName} 
                  onChange={(e) => setConfig({ ...config, networkName: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', boxSizing: 'border-box' }}
                />
                <textarea 
                  placeholder="نص الترحيب" 
                  value={config.welcomeText} 
                  onChange={(e) => setConfig({ ...config, welcomeText: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', height: '70px', boxSizing: 'border-box' }}
                />
                <input 
                  type="text" 
                  placeholder="نص الآية أو الحكمة" 
                  value={config.verseText} 
                  onChange={(e) => setConfig({ ...config, verseText: e.target.value })}
                  style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input 
                    type="text" 
                    placeholder="رقم واتساب الإدارة" 
                    value={config.adminWhatsApp} 
                    onChange={(e) => setConfig({ ...config, adminWhatsApp: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                  <input 
                    type="text" 
                    placeholder="رقم الموزع" 
                    value={config.distributorWhatsApp} 
                    onChange={(e) => setConfig({ ...config, distributorWhatsApp: e.target.value })}
                    style={{ width: '100%', padding: '10px', background: '#1f2937', color: '#fff', border: '1px solid #374151', borderRadius: '8px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>
            </div>

            {/* كارت الصور */}
            <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
              <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0, marginBottom: '15px' }}>🖼️ صور والإعلانات</h2>
              <label style={{
                display: 'inline-block',
                background: '#1e293b',
                border: '1px dashed #38bdf8',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#38bdf8',
                fontWeight: 'bold',
                textAlign: 'center'
              }}>
                📁 اختر صور الإعلانات والـ Logo
                <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
              </label>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '15px' }}>
                {selectedFiles.map((item, index) => (
                  <div key={index} style={{ position: 'relative', background: '#1f2937', padding: '8px', borderRadius: '8px', border: '1px solid #374151' }}>
                    <img src={item.previewUrl} alt="preview" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '6px', display: 'block' }} />
                    <button onClick={() => handleRemoveImage(index)} style={{ position: 'absolute', top: '-5px', left: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontSize: '12px' }}>✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* شريط الإشعارات والحالة */}
            {statusMsg && (
              <div style={{ padding: '12px 15px', background: '#064e3b', border: '1px solid #059669', borderRadius: '8px', color: '#34d399', fontSize: '0.9rem' }}>
                {statusMsg}
              </div>
            )}

            {/* زر التنزيل الآمن */}
            <button 
              onClick={downloadConfigJS}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)',
                color: '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                transition: '0.2s'
              }}
            >
              💾 تحميل ملف config.js المحدث (لرفعه عبر WinBox)
            </button>

          </div>
        ) : (
          <div style={{ background: '#111827', border: '1px solid #1f2937', borderRadius: '14px', padding: '20px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#38bdf8', marginTop: 0, marginBottom: '15px' }}>📄 معاينة الكود النهائي</h2>
            <pre style={{
              direction: 'ltr',
              textAlign: 'left',
              background: '#030712',
              padding: '15px',
              borderRadius: '8px',
              overflowX: 'auto',
              color: '#34d399',
              fontSize: '0.85rem',
              border: '1px solid #1f2937'
            }}>
              {generateConfigJS()}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}
