import { useState } from 'react';
import './App.css';

function App() {
  // 1. بيانات الاتصال بالمايكروتك
  const [connection, setConnection] = useState({
    ip: '192.168.88.1',
    port: '21',
    username: 'admin',
    password: '',
    path: 'hotspot'
  });

  // 2. إعدادات الهوتسبوت
  const [config, setConfig] = useState({
    mode: 'user_only',
    networkName: 'شبكة الكرم',
    welcomeText: 'مرحباً بكم في شبكتنا',
    adminWhatsApp: '967770000000',
    chapEnabled: false,
    enableSpeeds: true
  });

  // 3. إدارة الصور والإعلانات
  const [adsList, setAdsList] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // editor | preview
  const [loading, setLoading] = useState(false);

  // التعامل مع اختيار الصور من الهاتف/الكمبيوتر
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
  };

  // حذف صورة من القائمة
  const handleRemoveImage = (index) => {
    setAdsList((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // توليد نص ملف config.js تلقائياً
  const generateConfigJS = () => {
    const formattedAds = adsList.map((ad) => `        "${ad}"`).join(',\n');
    return `var h_login_settings = {
    "mode": "${config.mode}",
    "enableSpeeds": ${config.enableSpeeds},
    "chapEnabled": ${config.chapEnabled}
};

var ui_config = {
    networkName: "${config.networkName}",
    welcomeText: "${config.welcomeText}",
    adminWhatsApp: "${config.adminWhatsApp}",
    ads: [
${formattedAds}
    ]
};`;
  };

  // تنفيذ عملية الرفع والحفظ
  const handleDeploy = async () => {
    setLoading(true);
    const configContent = generateConfigJS();

    try {
      console.log('=== Config.js generated ===\n', configContent);
      console.log('=== Files to upload ===\n', selectedFiles);

      alert('✅ تم توليد ملف config.js وتجهيز الصور بنجاح!');
    } catch (error) {
      alert('❌ حدث خطأ: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* الهيدر */}
      <header className="app-header">
        <h1>⚙️ HashTik Hotspot Configurator</h1>
        <div className="tab-buttons">
          <button 
            className={activeTab === 'editor' ? 'active' : ''} 
            onClick={() => setActiveTab('editor')}
          >
            الواجهة الإدارية
          </button>
          <button 
            className={activeTab === 'preview' ? 'active' : ''} 
            onClick={() => setActiveTab('preview')}
          >
            معاينة config.js
          </button>
        </div>
      </header>

      {activeTab === 'editor' ? (
        <main className="main-content">
          {/* كارت الاتصال */}
          <section className="card">
            <h2>🔌 الاتصال بالراوتر (MikroTik FTP)</h2>
            <div className="grid-2">
              <input
                type="text"
                placeholder="عنوان IP"
                value={connection.ip}
                onChange={(e) => setConnection({ ...connection, ip: e.target.value })}
              />
              <input
                type="number"
                placeholder="البورت (FTP)"
                value={connection.port}
                onChange={(e) => setConnection({ ...connection, port: e.target.value })}
              />
            </div>
            <div className="grid-2">
              <input
                type="text"
                placeholder="اسم المستخدم"
                value={connection.username}
                onChange={(e) => setConnection({ ...connection, username: e.target.value })}
              />
              <input
                type="password"
                placeholder="كلمة السر"
                value={connection.password}
                onChange={(e) => setConnection({ ...connection, password: e.target.value })}
              />
            </div>
            <input
              type="text"
              placeholder="مسار مجلد الهوتسبوت بالراوتر"
              value={connection.path}
              onChange={(e) => setConnection({ ...connection, path: e.target.value })}
            />
          </section>

          {/* كارت إعدادات الهوتسبوت */}
          <section className="card">
            <h2>⚙️ إعدادات واجهة الهوتسبوت</h2>
            <input
              type="text"
              placeholder="اسم الشبكة (networkName)"
              value={config.networkName}
              onChange={(e) => setConfig({ ...config, networkName: e.target.value })}
            />
            <input
              type="text"
              placeholder="نص الترحيب (welcomeText)"
              value={config.welcomeText}
              onChange={(e) => setConfig({ ...config, welcomeText: e.target.value })}
            />
            <input
              type="text"
              placeholder="رقم واتساب الإدارة"
              value={config.adminWhatsApp}
              onChange={(e) => setConfig({ ...config, adminWhatsApp: e.target.value })}
            />

            <div className="grid-2">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.chapEnabled}
                  onChange={(e) => setConfig({ ...config, chapEnabled: e.target.checked })}
                />
                تفعيل CHAP Encryption
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={config.enableSpeeds}
                  onChange={(e) => setConfig({ ...config, enableSpeeds: e.target.checked })}
                />
                عرض خيارات السرعات
              </label>
            </div>
          </section>

          {/* كارت إدارة صور الإعلانات */}
          <section className="card">
            <h2>🖼️ إعلانات الصور (Ads Manager)</h2>
            <label className="file-upload-btn">
              📁 إضافة صور إعلانات من الهاتف
              <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <div className="image-grid">
              {selectedFiles.map((item, index) => (
                <div key={index} className="image-card">
                  <img src={item.previewUrl} alt={`ad-${index}`} />
                  <span className="path-tag">{item.internalPath}</span>
                  <button className="delete-btn" onClick={() => handleRemoveImage(index)}>✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* زر حفظ ورفع */}
          <button className="deploy-btn" onClick={handleDeploy} disabled={loading}>
            {loading ? 'جاري التجهيز والرفع...' : '🚀 حفظ وتجهيز الملفات للمايكروتك'}
          </button>
        </main>
      ) : (
        /* تبويب المعاينة */
        <main className="main-content">
          <section className="card">
            <h2>📄 معاينة ملف config.js المولد</h2>
            <pre className="code-preview">{generateConfigJS()}</pre>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;
