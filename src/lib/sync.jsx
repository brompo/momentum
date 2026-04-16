import { useState, useCallback, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const DRIVE_FOLDER_NAME = 'Momentum Backups';
const DRIVE_FILE_NAME = 'momentum_backup.json';

export const useGoogleSync = (onSuccess) => {
  const [token, setToken] = useState(() => localStorage.getItem('ga_google_token'));
  const [user, setUser] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const REDIRECT_URI = window.location.origin + window.location.pathname;

  const login = useGoogleLogin({
    onSuccess: (response) => {
      console.log('Google Auth: Popup/Success flow');
      setToken(response.access_token);
      localStorage.setItem('ga_google_token', response.access_token);
      fetchUserInfo(response.access_token);
      if (onSuccess) onSuccess(response.access_token);
    },
    scope: 'https://www.googleapis.com/auth/drive.file',
    ux_mode: 'redirect',
    redirect_uri: REDIRECT_URI,
    flow: 'implicit'
  });

  // Handle Redirect Callback & Boot
  useEffect(() => {
    // 1. Check URL Hash (Standard OAuth Impicit)
    const hashParams = new URLSearchParams(window.location.hash.replace('#', '?'));
    const hashToken = hashParams.get('access_token');
    
    // 2. Check URL Query (Fallback if transformed)
    const queryParams = new URLSearchParams(window.location.search);
    const queryToken = queryParams.get('access_token');

    const foundToken = hashToken || queryToken;
    
    if (foundToken) {
      console.log('Google Auth: Found token in URL');
      setToken(foundToken);
      localStorage.setItem('ga_google_token', foundToken);
      fetchUserInfo(foundToken);
      
      // Clean up the URL to prevent re-processing and keep it clean
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (token && !user) {
      // 3. Boot: If we have a token but no user, fetch info
      fetchUserInfo(token);
    }
  }, []);

  const fetchUserInfo = async (accessToken) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Auth check failed:', res.status, errorData);
        
        // ONLY clear if it's a 401/403 (invalid token)
        if (res.status === 401 || res.status === 403) {
          alert('Google Connection Expired or Invalid. Please re-connect. (' + res.status + ')');
          setToken(null);
          localStorage.removeItem('ga_google_token');
          setUser(null);
        } else {
          // Likely a temporary network issue, keep the token but notify
          console.warn('Temporary Google API error:', res.status);
        }
        return;
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error('Failed to fetch user info:', err);
      // For generic network errors, don't clear the token!
      // This allows the user to stay "logged in" even if offline for a bit
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
