import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';


interface DashboardProps {
  onNavigate: (tab: 'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings' | 'how-it-works') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const tools = [
    { id: 'video', name: 'Video Analysis', desc: 'Spatial anomalies & Deepfake check', icon: 'movie' as const, color1: '#8a0000', color2: '#500000' },
    { id: 'image', name: 'Image Forensics', desc: 'JPEG Compression & Clone analysis', icon: 'image' as const, color1: '#5d0000', color2: '#350000' },
    { id: 'pdf', name: 'PDF Analyzer', desc: 'Audit structural objects and metadata', icon: 'picture-as-pdf' as const, color1: '#700000', color2: '#400000' },
    { id: 'text', name: 'Text Forensics', desc: 'Scan prose for generative AI markers', icon: 'article' as const, color1: '#4a0000', color2: '#2a0000' },
    { id: 'history', name: 'Analysis Logs', desc: 'View complete forensic records history', icon: 'history' as const, color1: '#300000', color2: '#1a0000' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroSection}>
        <Text style={styles.logoText}>FORENSIQ <Text style={styles.logoAccent}>AI</Text></Text>
        <Text style={styles.heroTagline}>Clinical Digital Evidence Analysis Suite</Text>
        <Text style={styles.heroDesc}>
          Scientific validation of document integrity, text generation origins, image editing signatures, and video deepfake metadata.
        </Text>
      </View>

      <Text style={styles.sectionTitle}>ANALYSIS MODULES</Text>

      <View style={styles.grid}>
        {tools.map((tool) => {
          const isHovered = hoveredId === tool.id;
          return (
            <TouchableOpacity
              key={tool.id}
              style={[
                styles.card,
                isHovered && styles.cardHovered,
                { borderLeftColor: tool.color1 }
              ]}
              onPress={() => onNavigate(tool.id as any)}
              // Web hover event handlers
              {...(Platform.OS === 'web' ? {
                onMouseEnter: () => setHoveredId(tool.id),
                onMouseLeave: () => setHoveredId(null)
              } : {})}
            >
              <View style={[styles.iconBox, { backgroundColor: tool.color1 }]}>
                <MaterialIcons name={tool.icon} size={28} color="#fff" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{tool.name}</Text>
                <Text style={styles.cardDesc}>{tool.desc}</Text>
              </View>
              <View style={styles.arrowBox}>
                <MaterialIcons name="chevron-right" size={24} color="#800000" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#edebe6',
    flexGrow: 1,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
    maxWidth: 600,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#300000',
    letterSpacing: -1,
  },
  logoAccent: {
    color: '#800000',
    letterSpacing: 4,
  },
  heroTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: '#800000',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
  },
  heroDesc: {
    fontSize: 14,
    color: 'rgba(48, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#300000',
    letterSpacing: 2,
    marginBottom: 16,
    width: '100%',
    maxWidth: 800,
    textAlign: 'left',
  },
  grid: {
    width: '100%',
    maxWidth: 800,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    borderLeftWidth: 6,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    ...Platform.select({
      web: {
        transitionProperty: 'transform, shadow',
        transitionDuration: '0.2s',
      }
    })
  },
  cardHovered: {
    shadowOpacity: 0.12,
    shadowRadius: 15,
    transform: [{ translateY: -2 }],
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#300000',
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
  },
  arrowBox: {
    paddingLeft: 8,
  }
});
