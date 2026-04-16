import { useState, useCallback, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const DRIVE_FOLDER_NAME = 'Momentum Backups';
const DRIVE_FILE_NAME = 'momentum_backup.json';

export const useGoogleSync = (onSuccess) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const REDIRECT_URI = window.location.origin + window.location.pathname;

  const login = useGoogleLogin({
    onSuccess: (response) => {
      setToken(response.access_token);
      fetchUserInfo(response.access_token);
      if (onSuccess) onSuccess(response.access_token);
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    ux_mode: 'redirect',
    redirect_uri: REDIRECT_URI,
    flow: 'implicit'
  });

  // Handle Redirect Callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.replace('#', '?'));
    const accessToken = params.get('access_token');
    
    if (accessToken) {
      setToken(accessToken);
      fetchUserInfo(accessToken);
      
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  const getOrCreateFolder = async (accessToken) => {
    // 1. Search for folder
    const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=name='${DRIVE_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const searchData = await searchRes.json();
    
    if (searchData.files && searchData.files.length > 0) {
      return searchData.files[0].id;
    }

    // 2. Create if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: DRIVE_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder'
      })
    });
    const createData = await createRes.json();
    return createData.id;
  };

  const findBackupFile = async (accessToken, folderId) => {
    const q = `name='${DRIVE_FILE_NAME}' and '${folderId}' in parents and trashed=false`;
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name,modifiedTime)`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0] : null;
  };

  const uploadBackup = async (data) => {
    if (!token) return;
    setIsSyncing(true);
    try {
      const folderId = await getOrCreateFolder(token);
      const existingFile = await findBackupFile(token, folderId);
      
      const metadata = {
        name: DRIVE_FILE_NAME,
        mimeType: 'application/json',
        parents: existingFile ? undefined : [folderId]
      };
      
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }));

      let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      let method = 'POST';

      if (existingFile) {
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=multipart`;
        method = 'PATCH';
      }

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: form
      });
      
      const result = await res.json();

      setLastSync(new Date().toISOString());
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const getCloudMetadata = async () => {
    if (!token) return null;
    try {
      const folderId = await getOrCreateFolder(token);
      return await findBackupFile(token, folderId);
    } catch (err) {
      console.error('Failed to get cloud metadata:', err);
      return null;
    }
  };

  const downloadBackup = async () => {
    if (!token) return null;
    setIsSyncing(true);
    try {
      const folderId = await getOrCreateFolder(token);
      const existingFile = await findBackupFile(token, folderId);
      if (!existingFile) return null;

      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { 
        data: await res.json(), 
        modifiedTime: existingFile.modifiedTime 
      };
    } catch (err) {
      console.error('Download failed:', err);
      return null;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    login,
    user,
    token,
    isSyncing,
    lastSync,
    uploadBackup,
    downloadBackup,
    getCloudMetadata
  };
};
