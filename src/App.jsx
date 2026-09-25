import { useState } from 'react';
import './App.css';

function App() {
  // 1. بيانات الاتصال بالمايكروتك (REST API - RouterOS v7/v6)
  const [connection, setConnection] = useState({
    ip: '192.168.88.1',
    port: '80', // منفذ الـ HTTP / REST API
    username: 'admin',
    password: '',
    path: 'flash/hotspot' // مسار مجلد الهوتسبوت
  });

  // 2. الإعدادات الأساسية للهوتسبوت
  const [config, setConfig] = useState({
    mode: 'user_only',
    rosVersion: '7',
    theme: 'dark',
    chapEnabled: false,
    enableSpeeds: true,
    forceSpeedSelection: false,
    updatesEnable: true,
    announcementsEnabled: true,
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

  // 3. القوائم الديناميكية
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

  // 4. إدارة الصور والإعلانات
  const [adsList, setAdsList] = useState(['img/logo.jpg']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('editor'); // editor | preview
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // إضافات للقوائم
  const addSpeed = () => setSpeeds([...speeds, { value: '', text: '' }]);
  const addPackage = () => setPackages([...packages, { name: '', price: '', tier: 'tier-1', data: '', time: '', validity: '' }]);
  const addPos = () => setPosLocations([...posLocations, { title: '', description: '' }]);

  // التعامل مع اختيار الصور من الهاتف
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

  const handleRemoveImage = (index) => {
    setAdsList((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // توليد نص ملف config.js الكامل والدقيق
  const generateConfigJS = () => {
    return `var h_login_settings = {
    "mode": "${config.mode}",
    "enableSpeeds": ${config.enableSpeeds},
    "chapEnabled": ${config.chapEnabled},
    "forceSpeedSelection": ${config.forceSpeedSelection},
    "updatesEnable": ${config.updatesEnable},
    "theme": "${config.theme}",
    "announcementsEnabled": ${config.announcementsEnabled},
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

  // 🚀 الاتصال والرفع الفعلي إلى المايكروتك عبر REST API
  const handleDeploy = async () => {
    setLoading(true);
    setStatusMsg('⌛ جاري بدء الاتصال برواتر المايكروتك...');
    const credentials = btoa(`${connection.username}:${connection.password}`);
    const baseUrl = `http://${connection.ip}:${connection.port}/rest/file`;

    try {
      // 1. رفع كل صورة جديدة مختارة
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setStatusMsg(`⌛ جاري رفع الصورة (${i + 1}/${selectedFiles.length}): ${item.file.name}...`);

        const imgUrl = `${baseUrl}/${connection.path}/${item.internalPath}`;
        const imgRes = await fetch(imgUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': item.file.type || 'image/jpeg'
          },
          body: item.file
        });

        if (!imgRes.ok) {
          throw new Error(`فشل رفع الصورة ${item.file.name} - الرمز: ${imgRes.status}`);
        }
      }

      // 2. رفع واستبدال ملف config.js
      setStatusMsg('⌛ جاري استبدال ملف config.js في المايكروتك...');
      const configContent = generateConfigJS();
      const configUrl = `${baseUrl}/${connection.path}/js/config.js`;

      const configRes = await fetch(configUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body: configContent
      });

      if (!configRes.ok) {
        throw new Error(`فشل استبدال config.js - الرمز: ${configRes.status}`);
      }

      setStatusMsg('✅ تم رفع جميع الصور واستبدال ملف config.js بنجاح!');
      alert('✅ تم التحديث والاستبدال بنجاح في راوتر المايكروتك!');
    } catch (error) {
      console.error(error);
      setStatusMsg(`❌ خطأ: ${error.message}`);
      alert(`❌ حدث خطأ أثناء الاتصال بالمايكروتك: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ direction: 'rtl', padding: '15px' }}>
      <header className="app-header">
        <h1>⚙️ لوحة تحكم HashTik للميكروتك</h1>
        <div className="tab-buttons">
          <button className={activeTab === 'editor' ? 'active' : ''} onClick={() => setActiveTab('editor')}>
            الواجهة الإدارية
          </button>
          <button className={activeTab === 'preview' ? 'active' : ''} onClick={() => setActiveTab('preview')}>
            معاينة config.js
          </button>
        </div>
      </header>

      {activeTab === 'editor' ? (
        <main className="main-content">
          {/* كارت الاتصال */}
          <section className="card">
            <h2>🔌 الاتصال بالراوتر (MikroTik REST API)</h2>
            <div className="grid-2">
              <input type="text" placeholder="IP / الكلاود" value={connection.ip} onChange={(e) => setConnection({ ...connection, ip: e.target.value })} />
              <input type="text" placeholder="البورت (Port)" value={connection.port} onChange={(e) => setConnection({ ...connection, port: e.target.value })} />
            </div>
            <div className="grid-2">
              <input type="text" placeholder="اسم المستخدم" value={connection.username} onChange={(e) => setConnection({ ...connection, username: e.target.value })} />
              <input type="password" placeholder="كلمة السر" value={connection.password} onChange={(e) => setConnection({ ...connection, password: e.target.value })} />
            </div>
            <input type="text" placeholder="مسار مجلد الهوتسبوت" value={connection.path} onChange={(e) => setConnection({ ...connection, path: e.target.value })} />
          </section>

          {/* كارت الإعدادات الأساسية */}
          <section className="card">
            <h2>⚙️ إعدادات النظام والشعارات</h2>
            <input type="text" placeholder="اسم الشبكة" value={config.networkName} onChange={(e) => setConfig({ ...config, networkName: e.target.value })} />
            <textarea placeholder="نص الترحيب" value={config.welcomeText} onChange={(e) => setConfig({ ...config, welcomeText: e.target.value })} />
            <input type="text" placeholder="نص الآية/الحكمة" value={config.verseText} onChange={(e) => setConfig({ ...config, verseText: e.target.value })} />
            
            <div className="grid-2">
              <input type="text" placeholder="رقم واتساب الإدارة" value={config.adminWhatsApp} onChange={(e) => setConfig({ ...config, adminWhatsApp: e.target.value })} />
              <input type="text" placeholder="رقم الموزع" value={config.distributorWhatsApp} onChange={(e) => setConfig({ ...config, distributorWhatsApp: e.target.value })} />
            </div>
          </section>

          {/* كارت إدارة صور الإعلانات */}
          <section className="card">
            <h2>🖼️ رفع صور الإعلانات إلى المايكروتك</h2>
            <label className="file-upload-btn">
              📁 اختيار صور من الهاتف
              <input type="file" multiple accept="image/*" onChange={handleImageChange} hidden />
            </label>

            <div className="image-grid">
              {selectedFiles.map((item, index) => (
                <div key={index} className="image-card">
                  <img src={item.previewUrl} alt={`ad-${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                  <span className="path-tag">{item.internalPath}</span>
                  <button className="delete-btn" onClick={() => handleRemoveImage(index)}>✕</button>
                </div>
              ))}
            </div>
          </section>

          {/* شريط حالة الاتصال والرفع */}
          {statusMsg && <div style={{ padding: '12px', background: '#1e293b', borderRadius: '8px', marginBottom: '15px', color: '#00f3ff' }}>{statusMsg}</div>}

          {/* زر التثبيت والرفع الفعلي */}
          <button className="deploy-btn" onClick={handleDeploy} disabled={loading}>
            {loading ? 'جاري الرفع والاستبدال...' : '🚀 إرسال واستبدال مباشر في المايكروتك'}
          </button>
        </main>
      ) : (
        /* تبويب المعاينة */
        <main className="main-content">
          <section className="card">
            <h2>📄 معاينة ملف config.js التلقائي</h2>
            <pre className="code-preview" style={{ direction: 'ltr', textAlign: 'left', background: '#0b0d14', padding: '15px', borderRadius: '8px', overflowX: 'auto' }}>
              {generateConfigJS()}
            </pre>
          </section>
        </main>
      )}
    </div>
  );
}

export default App;

