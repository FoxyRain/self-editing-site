// src/githubApi.js

const API_BASE = 'https://api.github.com';

// Функции для корректного кодирования/декодирования UTF-8 (чтобы кириллица не ломалась)
const encodeBase64 = (str) => btoa(unescape(encodeURIComponent(str)));
const decodeBase64 = (str) => decodeURIComponent(escape(atob(str)));

export const fetchContent = async (owner, repo, path, token) => {
  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    headers: { Authorization: `token ${token}` }
  });
  
  if (!response.ok) throw new Error('Ошибка загрузки контента');
  
  const data = await response.json();
  return {
    content: JSON.parse(decodeBase64(data.content)),
    sha: data.sha // SHA нужен для обновления файла
  };
};

export const updateContent = async (owner, repo, path, token, sha, newContent) => {
  const response = await fetch(`${API_BASE}/repos/${owner}/${repo}/contents/${path}`, {
    method: 'PUT',
    headers: { 
      Authorization: `token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update site content via CMS',
      content: encodeBase64(JSON.stringify(newContent, null, 2)),
      sha: sha
    })
  });

  if (!response.ok) throw new Error('Ошибка сохранения контента');
  return await response.json();
};
