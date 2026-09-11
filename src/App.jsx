// src/App.jsx
import { useState, useEffect } from 'react';
import { fetchContent, updateContent } from './githubApi';
import './App.css';

function App() {
  // Настройки репозитория
  const [config, setConfig] = useState({
    owner: 'ВАШ_ЛОГИН_GITHUB', // Замените на ваш логин
    repo: 'self-editing-site', // Замените на имя репозитория
    path: 'content.json',
    token: ''
  });

  const [content, setContent] = useState(null);
  const [editData, setEditData] = useState(null);
  const [sha, setSha] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Загрузка контента
  const loadContent = async () => {
    if (!config.token) {
      setError('Введите GitHub токен в настройках');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { content: data, sha: fileSha } = await fetchContent(config.owner, config.repo, config.path, config.token);
      setContent(data);
      setEditData({ ...data });
      setSha(fileSha);
    } catch (err) {
      setError('Не удалось загрузить контент. Проверьте токен и настройки репозитория.');
    }
    setIsLoading(false);
  };

  // Сохранение контента
  const saveContent = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await updateContent(config.owner, config.repo, config.path, config.token, sha, editData);
      setContent({ ...editData });
      setSha(result.content.sha);
      setIsEditing(false);
      alert('Изменения успешно сохранены в GitHub!');
    } catch (err) {
      setError('Не удалось сохранить. Возможно, токен не имеет прав на запись.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Попытка загрузить настройки из localStorage
    const savedConfig = localStorage.getItem('github_cms_config');
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      setConfig(parsed);
      if (parsed.token) {
        // Автоматическая загрузка, если токен уже есть
        setTimeout(() => {
          setConfig(prev => ({ ...prev, token: parsed.token }));
          // loadContent вызывается ниже через useEffect
        }, 100);
      }
    }
  }, []);

  useEffect(() => {
    if (config.token && config.owner && config.repo) {
      loadContent();
    }
  }, [config.token, config.owner, config.repo]);

  const handleConfigChange = (e) => {
    const newConfig = { ...config, [e.target.name]: e.target.value };
    setConfig(newConfig);
    localStorage.setItem('github_cms_config', JSON.stringify(newConfig));
  };

  return (
    <div className="app">
      {/* Панель управления */}
      <div className="toolbar">
        <button onClick={() => setShowSettings(!showSettings)}>⚙️ Настройки</button>
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} disabled={!content}>✏️ Редактировать</button>
        ) : (
          <>
            <button onClick={saveContent} disabled={isLoading}>💾 Сохранить в GitHub</button>
            <button onClick={() => { setIsEditing(false); setEditData({ ...content }); }}>❌ Отмена</button>
          </>
        )}
      </div>

      {/* Окно настроек */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Настройки GitHub</h3>
          <input name="owner" placeholder="Владелец репозитория (Login)" value={config.owner} onChange={handleConfigChange} />
          <input name="repo" placeholder="Имя репозитория" value={config.repo} onChange={handleConfigChange} />
          <input name="token" type="password" placeholder="GitHub Personal Access Token" value={config.token} onChange={handleConfigChange} />
          <button onClick={loadContent}>Перезагрузить</button>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      {isLoading && <div className="loading">Загрузка...</div>}

      {/* Контент сайта */}
      <main className="content">
        {content && !isEditing ? (
          <>
            <h1>{content.title}</h1>
            <p className="description">{content.description}</p>
            <footer>{content.footer}</footer>
          </>
        ) : isEditing && editData ? (
          <div className="edit-mode">
            <h2>Режим редактирования</h2>
            <label>Заголовок:</label>
            <input value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} />
            
            <label>Описание:</label>
            <textarea rows="4" value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} />
            
            <label>Футер:</label>
            <input value={editData.footer} onChange={(e) => setEditData({...editData, footer: e.target.value})} />
          </div>
        ) : (
          <p>Настройте подключение к GitHub, чтобы начать.</p>
        )}
      </main>
    </div>
  );
}

export default App;
