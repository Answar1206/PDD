import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch, Platform } from 'react-native';
import { UserProfile } from '../types';
import { MaterialIcons } from '@expo/vector-icons';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  backendOnline: boolean | null;
  testBackendConnection: () => Promise<{ online: boolean; ready: boolean }>;
}

export default function Settings({
  user,
  onUpdateUser,
  backendUrl,
  setBackendUrl,
  backendOnline,
  testBackendConnection
}: SettingsProps) {
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [sensitivity, setSensitivity] = useState(85);
  const [autoSave, setAutoSave] = useState(true);

  const handleProfileSave = () => {
    onUpdateUser({
      ...user,
      name: fullName,
      email: email
    });
    alert('Investigator Profile saved successfully!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.panelTitle}>Settings</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Investigator Profile</Text>
        
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map(n => n[0]).join('')}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileRole}>{user.role}</Text>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleProfileSave}>
          <Text style={styles.saveBtnText}>Save Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* Backend Engine Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Forensics Engine</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Endpoint URL</Text>
          <View style={styles.connectionInputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={backendUrl}
              onChangeText={setBackendUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.connectBtn} onPress={testBackendConnection}>
              <Text style={styles.connectBtnText}>Test</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statusRow}>
            <View style={[styles.statusIndicator, { backgroundColor: backendOnline ? '#28a745' : '#dc3545' }]} />
            <Text style={styles.statusText}>
              Backend Engine Status: {backendOnline ? 'CONNECTED' : 'DISCONNECTED'}
            </Text>
          </View>
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.switchLabel}>Auto-Save Records</Text>
            <Text style={styles.switchDesc}>Automatically add successful scans to the analysis logs database.</Text>
          </View>
          <Switch value={autoSave} onValueChange={setAutoSave} trackColor={{ true: '#800000' }} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#edebe6',
    flexGrow: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#800000',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fafafa',
    padding: 12,
    borderRadius: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  profileName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#300000',
  },
  profileRole: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '700',
    marginTop: 2,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#300000',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 13,
    color: '#300000',
  },
  saveBtn: {
    backgroundColor: '#800000',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  connectionInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  connectBtn: {
    backgroundColor: '#300000',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#300000',
  },
  switchDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
    lineHeight: 15,
  }
});
