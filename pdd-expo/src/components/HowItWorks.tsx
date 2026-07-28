import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function HowItWorks() {
  const steps = [
    {
      title: "1. Select a Module",
      description: "Choose the specific analysis tool from the home page. Whether you're working with video footage, images, text logs, or PDF documents, our specialized AI models are ready.",
      icon: "grid-view" as const
    },
    {
      title: "2. Upload Evidence",
      description: "Upload your files securely. All data is processed using clinical-grade encryption to ensure chain of custody and maintain forensic integrity.",
      icon: "cloud-upload" as const
    },
    {
      title: "3. AI Analysis & Processing",
      description: "Our advanced models will scan the media for anomalies, deepfakes, alterations, and hidden metadata. This process typically takes only a few seconds.",
      icon: "memory" as const
    },
    {
      title: "4. Review the Report",
      description: "Get a comprehensive, detailed breakdown of the findings. Export the results as certified PDF reports suitable for legal and investigative use.",
      icon: "assignment" as const
    }
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How It Works</Text>
        <Text style={styles.subtitle}>
          Forensiq AI simplifies complex digital forensics. Follow these straightforward steps to analyze your digital evidence.
        </Text>
      </View>

      <View style={styles.grid}>
        {steps.map((step, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.iconCircle}>
              <MaterialIcons name={step.icon} size={28} color="#fff" />
            </View>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardDesc}>{step.description}</Text>
          </View>
        ))}
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
    maxWidth: 600,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#300000',
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(48, 0, 0, 0.65)',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
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
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  }
});
