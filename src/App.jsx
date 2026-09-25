import { useState } from 'react';
import './App.css';

function App() {
  // 1. بيانات الاتصال بالمايكروتك
  const [connection, setConnection] = useState({
    ip: '192.168.88.1',
    port: '80', // منفذ HTTP للـ REST API
    username: 'admin',
    password: '',
    path: 'flash/hotspot' // مسار الهوتسبوت (في v6 عادة تكون hotspot، وفي v7 المقبولة flash/hotspot)
  });

  // 2. الإعدادات الأساسية
  const [config, setConfig] = useState({
    mode: 'user_only',
    rosVersion: '7', // يمكن اختيار 6 أو 7
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

  // 4. إدارة الصور
  const [adsList, setAdsList] = useState(['img/logo.jpg']);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('editor');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // اختيار وتنسيق الصور
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

  // توليد ملف config.js متوافق مع v6 و v7
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

  // تنزيل ملف config.js محلياً (كخيار احتياطي لـ ROS v6 في حال عدم استخدام REST API)
  const downloadConfigJS = () => {
    const element = document.createElement("a");
    const file = new Blob([generateConfigJS()], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = "config.js";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 🚀 دالة الاتصال الموحدة للنسختين v6 و v7
  const handleDeployUnified = async () => {
    setLoading(true);
    setStatusMsg(`⌛ جاري بدء الاتصال بشركة RouterOS v${config.rosVersion}...`);
    
    const credentials = btoa(`${connection.username}:${connection.password}`);
    const cleanPath = connection.path.replace(/^\/+|\/+$/g, '');
    const apiBaseUrl = `http://${connection.ip}:${connection.port}/rest/file`;

    try {
      // 1. رفع الصور
      for (let i = 0; i < selectedFiles.length; i++) {
        const item = selectedFiles[i];
        setStatusMsg(`⌛ جاري رفع الصورة (${i + 1}/${selectedFiles.length}): ${item.file.name}...`);

        const fileBuffer = await item.file.arrayBuffer();
        const fileTargetUrl = `${apiBaseUrl}/${cleanPath}/${item.internalPath}`;

        const imgResponse = await fetch(fileTargetUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/octet-stream'
          },
          body: fileBuffer
        });

        if (!imgResponse.ok) {
          if (imgResponse.status === 404 && config.rosVersion === '6') {
            throw new Error(`إصدار v6 لا يدعم REST API المباشرة عبر HTTP. استخدم زر "تحميل config.js" ورفعه عبر WinBox/FTP.`);
          }
          throw new Error(`فشل رفع الصورة ${item.file.name} - الرمز: ${imgResponse.status}`);
        }
      }

      // 2. رفع واستبدال ملف config.js
      setStatusMsg('⌛ جاري رفع واستبدال config.js...');
      const configJSContent = generateConfigJS();
      const configTargetUrl = `${apiBaseUrl}/${cleanPath}/js/config.js`;

      const configResponse = await fetch(configTargetUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${credentials}`,
          'Content-Type': 'text/plain; charset=utf-8'
        },
        body: configJSContent
      });

      if (!configResponse.ok) {
        throw new Error(`فشل تحديث ملف config.js - الرمز: ${configResponse.status}`);
      }

      setStatusMsg('✅ تم رفع جميع البيانات وتحديث الراوتر بنجاح!');
      alert('✅ تم الرفع والمزامنة المباشرة بنجاح!');
    } catch (err) {
      console.error(err);
      let errorMessage = err.message;
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        errorMessage = 'تعذر الاتصال بالراوتر! تحقق من تفعيل خدمة WWW وقيود المتصفح CORS.';
      }
      setStatusMsg(`❌ خطأ: ${errorMessage}`);
      alert(`❌ خطأ: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ direction: 'rtl', padding: '15px' }}>
      <header className="app-header">
        <h1>⚙️ لوحة تحكم HashTik للميكروتك (v6 / v7)</h1>
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
          {/* إعدادات الاتصال والنسخة */}
          <section className="card">
            <h2>🔌 إعدادات الاتصال والنسخة</h2>
            <div className="grid-2">
              <div>
                <label>إصدار RouterOS:</label>
                <select 
                  value={config.rosVersion} 
                  onChange={(e) => setConfig({ ...config, rosVersion: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                >
                  <option value="7">RouterOS v7 (دعم REST API مباشر)</option>
                  <option value="6">RouterOS v6 (عبر FTP / API Proxy / تنزيل يدوياً)</option>
                </select>
              </div>
              <div>
                <label>مسار الهوتسبوت:</label>
                <input 
                  type="text" 
                  placeholder="مثال: flash/hotspot أو hotspot" 
                  value={connection.path} 
                  onChange={(e) => setConnection({ ...connection, path: e.target.value })} 
                />
              </div>
            </div>

            <div className="grid-2" style={{ marginTop: '10px' }}>
              <input type="text" placeholder="IP / الكلاود" value={connection.ip} onChange={(e) => setConnection({ ...connection, ip: e.target.value })} />
              <input type="text" placeholder="البورت (Default: 80)" value={connection.port} onChange={(e) => setConnection({ ...connection, port: e.target.value })} />
            </div>
            <div className="grid-2">
              <input type="text" placeholder="اسم المستخدم" value={connection.username} onChange={(e) => setConnection({ ...connection, username: e.target.value })} />
              <input type="password" placeholder="كلمة السر" value={connection.password} onChange={(e) => setConnection({ ...connection, password: e.target.value })} />
            </div>
          </section>

          {/* الإعدادات الأساسية */}
          <section className="card">
            <h2>⚙️ إعدادات الواجهة</h2>
            <input type="text" placeholder="اسم الشبكة" value={config.networkName} onChange={(e) => setConfig({ ...config, networkName: e.target.value })} />
            <textarea placeholder="نص الترحيب" value={config.welcomeText} onChange={(e) => setConfig({ ...config, welcomeText: e.target.value })} />
            <input type="text" placeholder="نص الآية/الحكمة" value={config.verseText} onChange={(e) => setConfig({ ...config, verseText: e.target.value })} />
            
            <div className="grid-2">
              <input type="text" placeholder="رقم واتساب الإدارة" value={config.adminWhatsApp} onChange={(e) => setConfig({ ...config, adminWhatsApp: e.target.value })} />
              <input type="text" placeholder="رقم الموزع" value={config.distributorWhatsApp} onChange={(e) => setConfig({ ...config, distributorWhatsApp: e.target.value })} />
            </div>
          </section>

          {/* الصور */}
          <section className="card">
            <h2>🖼️ الصور والإعلانات</h2>
            <label className="file-upload-btn">
              📁 اختيار صور
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

          {/* شريط الحالة */}
          {statusMsg && <div style={{ padding: '12px', background: '#1e293b', borderRadius: '8px', marginBottom: '15px', color: '#00f3ff' }}>{statusMsg}</div>}

          {/* أزرار العمليات */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="deploy-btn" onClick={handleDeployUnified} disabled={loading} style={{ flex: 2 }}>
              {loading ? 'جاري الرفع...' : '🚀 رفع مباشر للراوتر (REST API)'}
            </button>

            <button className="download-btn" onClick={downloadConfigJS} type="button" style={{ flex: 1, background: '#334155', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>
              💾 تحميل config.js يدوياً
            </button>
          </div>
        </main>
      ) : (
        <main className="main-content">
          <section className="card">
            <h2>📄 معاينة config.js المولد</h2>
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
