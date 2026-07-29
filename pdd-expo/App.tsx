import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions, ActivityIndicator, NativeModules } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Import Types and Mock Data
import { UserProfile, ForensicRecord, AssetType } from './src/types';

// Import Components
import Registration from './src/components/Registration';
import Dashboard from './src/components/Dashboard';
import TextAnalysis from './src/components/TextAnalysis';
import ImageAnalysis from './src/components/ImageAnalysis';
import PDFAnalysis from './src/components/PDFAnalysis';
import VideoAnalysis from './src/components/VideoAnalysis';
import HistoryLogs from './src/components/HistoryLogs';
import Settings from './src/components/Settings';
import HowItWorks from './src/components/HowItWorks';

// Helper to dynamically detect computer's IP when running in development
const getDefaultBackendUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://127.0.0.1:5001';
  }
  try {
    // 1. Try Expo Constants hostUri (standard in Expo Go)
    const hostUri = Constants.expoConfig?.hostUri;
    console.log("[DEBUG] Constants.expoConfig.hostUri is:", hostUri);
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip) {
        return `http://${ip}:5001`;
      }
    }

    // 2. Fallback to NativeModules scriptURL
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    console.log("[DEBUG] NativeModules.SourceCode.scriptURL is:", scriptURL);
    if (scriptURL) {
      const match = scriptURL.match(/^(?:https?|exp):\/\/([^:/]+)(:\d+)?/);
      if (match && match[1]) {
        return `http://${match[1]}:5001`;
      }
    }
  } catch (e) {
    console.log('Error getting default backend URL:', e);
  }
  return 'http://127.0.0.1:5001';
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'Dr. Elias Vance',
    email: 'e.vance@forensiq.ai',
    role: 'Chief Forensic Investigator',
    avatarUrl: ''
  });

  const [currentTab, setCurrentTab] = useState<'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings' | 'how-it-works'>('home');
  const [records, setRecords] = useState<ForensicRecord[]>(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('forensiq_records');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return [];
  });

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('forensiq_records', JSON.stringify(records));
    }
  }, [records]);

  const [backendUrl, setBackendUrl] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem('forensiq_backend_url');
      if (saved) return saved;
    }
    return getDefaultBackendUrl();
  });

  // Keep saved backend URL synchronized on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('forensiq_backend_url', backendUrl);
    }
  }, [backendUrl]);

  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [modelsReady, setModelsReady] = useState<boolean | null>(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);

  // Resize listener for responsive layout updates
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  const testBackendConnection = async () => {
    try {
      const res = await fetch(`${backendUrl}/status?t=${Date.now()}`, {
        method: 'GET',
        cache: 'no-store'
      });
      if (res.status >= 200 && res.status < 500) {
        const data = await res.json().catch(() => ({}));
        setBackendOnline(true);
        setModelsReady(data.models_ready === true);
        return { online: true, ready: data.models_ready === true };
      }
    } catch (e) {
      console.log('Backend check failed for URL:', backendUrl, e);
    }
    setBackendOnline(false);
    setModelsReady(null);
    return { online: false, ready: false };
  };

  // Poll server connection
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    const poll = async () => {
      const status = await testBackendConnection();
      if (!status.online) {
        timer = setTimeout(poll, 6000);
      } else if (!status.ready) {
        timer = setTimeout(poll, 3000);
      } else {
        timer = setTimeout(poll, 20000);
      }
    };
    
    poll();
    return () => clearTimeout(timer);
  }, [backendUrl]);

  // Keep-alive ping
  useEffect(() => {
    const keepAlive = setInterval(async () => {
      try {
        await fetch(`${backendUrl}/ping`);
      } catch (e) {}
    }, 4 * 60 * 1000);
    
    return () => clearInterval(keepAlive);
  }, [backendUrl]);

  const handleAddAnalyzedLog = (
    name: string, 
    type: AssetType, 
    score: number, 
    verdict: string, 
    status: 'Completed' | 'Review Required'
  ) => {
    const randomHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newRecord: ForensicRecord = {
      id: 'rec_' + Date.now(),
      name,
      hash: randomHash,
      type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      score,
      verdict: verdict as ForensicRecord['verdict'],
      status,
      anomaliesCount: verdict === 'Original' || verdict === 'Human' ? 0 : 3
    };

    setRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSelectRecord = (record: ForensicRecord) => {
    setCurrentTab(record.type as any);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.appContainer}>
        <Registration
          backendUrl={backendUrl}
          onRegisterSuccess={(profile) => {
            setUser(profile);
            setIsAuthenticated(true);
            setCurrentTab('home');
          }}
          onMockSignIn={() => {
            setIsAuthenticated(true);
            setCurrentTab('home');
          }}
        />
        <StatusBar style="dark" />
      </View>
    );
  }

  const isDesktop = windowWidth > 850;

  return (
    <View style={styles.appContainer}>
      {/* Top Header Connection Status bar */}
      <View style={styles.topStatusLine}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusDot, { backgroundColor: backendOnline ? (modelsReady ? '#28a745' : '#ffc107') : '#dc3545' }]} />
          <Text style={styles.statusText}>
            {backendOnline ? (modelsReady ? 'Forensic System Active' : 'AI Models Initializing...') : 'Forensic System Offline'}
          </Text>
        </View>
      </View>

      {/* Main Container Layout */}
      <View style={styles.mainLayout}>
        {/* SIDEBAR FOR DESKTOP */}
        {isDesktop && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarLogo}>FORENSIQ <Text style={styles.sidebarLogoAccent}>AI</Text></Text>
              <Text style={styles.sidebarInvestigator}>{user.name}</Text>
              <Text style={styles.sidebarRole}>{user.role}</Text>
            </View>

            <View style={styles.sidebarMenu}>
              {[
                { id: 'home', name: 'Dashboard', icon: 'dashboard' as const },
                { id: 'video', name: 'Video Analyzer', icon: 'movie' as const },
                { id: 'image', name: 'Image Forensics', icon: 'image' as const },
                { id: 'pdf', name: 'PDF Analyzer', icon: 'picture-as-pdf' as const },
                { id: 'text', name: 'Text Forensics', icon: 'article' as const },
                { id: 'history', name: 'Analysis Logs', icon: 'history' as const },
                { id: 'how-it-works', name: 'How It Works', icon: 'help-outline' as const },
                { id: 'settings', name: 'Settings', icon: 'settings' as const },
              ].map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.sidebarMenuItem, isActive && styles.sidebarMenuItemActive]}
                    onPress={() => setCurrentTab(item.id as any)}
                  >
                    <MaterialIcons name={item.icon} size={20} color={isActive ? '#fff' : '#666'} style={{ marginRight: 12 }} />
                    <Text style={[styles.sidebarMenuText, isActive && styles.sidebarMenuTextActive]}>{item.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialIcons name="exit-to-app" size={20} color="#800000" style={{ marginRight: 8 }} />
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* WORKSPACE AREA */}
        <View style={styles.workspaceArea}>
          {currentTab === 'home' && <Dashboard onNavigate={setCurrentTab} />}
          {currentTab === 'text' && <TextAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'image' && <ImageAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'pdf' && <PDFAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'video' && <VideoAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'history' && <HistoryLogs records={records} onSelectRecord={handleSelectRecord} onDeleteRecord={handleDeleteRecord} />}
          {currentTab === 'how-it-works' && <HowItWorks />}
          {currentTab === 'settings' && (
            <Settings
              user={user}
              onUpdateUser={setUser}
              backendUrl={backendUrl}
              setBackendUrl={setBackendUrl}
              backendOnline={backendOnline}
              testBackendConnection={testBackendConnection}
            />
          )}
        </View>
      </View>

      {/* BOTTOM TAB BAR FOR MOBILE */}
      {!isDesktop && (
        <View style={styles.bottomTabBar}>
          {[
            { id: 'home', name: 'Home', icon: 'home' as const },
            { id: 'video', name: 'Video', icon: 'movie' as const },
            { id: 'image', name: 'Image', icon: 'image' as const },
            { id: 'pdf', name: 'PDF', icon: 'picture-as-pdf' as const },
            { id: 'text', name: 'Text', icon: 'article' as const },
            { id: 'history', name: 'Logs', icon: 'history' as const },
            { id: 'settings', name: 'Config', icon: 'settings' as const },
          ].map((item) => {
            const isActive = currentTab === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.bottomTabItem}
                onPress={() => setCurrentTab(item.id as any)}
              >
                <MaterialIcons name={item.icon} size={22} color={isActive ? '#800000' : '#888'} />
                <Text style={[styles.bottomTabText, isActive && styles.bottomTabTextActive]}>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#edebe6',
  },
  topStatusLine: {
    height: 48,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 99,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#300000',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urlHeaderInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    width: Platform.OS === 'web' ? 180 : 120,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#fafafa',
  },
  connectHeaderBtn: {
    backgroundColor: '#800000',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  connectHeaderBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.06)',
    padding: 20,
    justifyContent: 'space-between',
  },
  sidebarHeader: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sidebarLogo: {
    fontSize: 22,
    fontWeight: '900',
    color: '#300000',
    letterSpacing: -0.5,
  },
  sidebarLogoAccent: {
    color: '#800000',
    letterSpacing: 2,
  },
  sidebarInvestigator: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  sidebarRole: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  sidebarMenu: {
    flex: 1,
    gap: 4,
  },
  sidebarMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sidebarMenuItemActive: {
    backgroundColor: '#800000',
  },
  sidebarMenuText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666',
  },
  sidebarMenuTextActive: {
    color: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#800000',
  },
  workspaceArea: {
    flex: 1,
    backgroundColor: '#edebe6',
  },
  bottomTabBar: {
    height: 56,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomTabText: {
    fontSize: 9,
    color: '#888',
    marginTop: 3,
    fontWeight: '600',
  },
  bottomTabTextActive: {
    color: '#800000',
    fontWeight: 'bold',
  }
});
