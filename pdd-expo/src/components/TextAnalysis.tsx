import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Dimensions } from 'react-native';
import { TextAnalysisResult } from '../types';
import { DEFAULT_TEXT_RESULT } from '../mockData';
import { MaterialIcons } from '@expo/vector-icons';

interface TextAnalysisProps {
  backendUrl: string;
  modelsReady: boolean | null;
  onAddAnalyzedLog: (name: string, type: 'text', score: number, verdict: string, status: 'Completed' | 'Review Required') => void;
}

export default function TextAnalysis({ backendUrl, modelsReady, onAddAnalyzedLog }: TextAnalysisProps) {
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TextAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  const handleRunScan = async () => {
    if (text.trim().length < 15) {
      alert("Please paste more text (at least 15 characters) for evaluation.");
      return;
    }

    setIsScanning(true);
    setScanResult(null);
    setErrorMessage('');

    try {
      const response = await fetch(`${backendUrl}/analyze-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const score = data.final_score; // Higher is more human
        const probabilityAI = 100 - score;
        const verdict = data.verdict;

        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const highlights = sentences.map((sentence) => {
          const lower = sentence.toLowerCase();
          const hasAITriggers = lower.includes("furthermore") || lower.includes("moreover") || lower.includes("delve") || lower.includes("in conclusion");
          return {
            text: sentence.trim() + '. ',
            type: (hasAITriggers ? 'ai' : (score > 70 ? 'human' : 'ai')) as 'human' | 'ai' | 'neutral'
          };
        });

        const matchedModel = score < 45 ? "GPT-4 / Claude 3.5" : "Organic Human Profile";
        const insightsList = data.modules.map((m: any, idx: number) => ({
          id: `dyn_${idx}`,
          type: m.score > 70 ? 'info' as const : (m.score > 45 ? 'warning' as const : 'error' as const),
          title: m.name,
          description: `${m.name} verification completed with a score of ${m.score}%.`
        }));

        const result: TextAnalysisResult = {
          verdict,
          subTitle: score > 75 ? 'Linguistic markers align closely with organic human output.' : 'High correlation with automated generative prose models.',
          authenticityScore: score,
          probabilityAI,
          modelMatch: matchedModel,
          patterns: score > 60 ? 'Diverse' : 'Repetitive',
          perplexity: score > 60 ? 'High' : 'Low',
          structure: score > 60 ? 'Dynamic' : 'Linear',
          rawText: text,
          highlights,
          insights: insightsList
        };

        setScanResult(result);
        onAddAnalyzedLog(
          text.substring(0, 20).replace(/[^\w\s]/gi, '').trim() + '_evaluation.txt',
          'text',
          score,
          score > 75 ? 'Human' : (score > 45 ? 'Potential' : 'Altered'),
          score > 45 ? 'Completed' : 'Review Required'
        );
      } else {
        alert("Verification failed: " + (data.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error('Full error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
      } else {
        setErrorMessage(err.message || 'Unknown error occurred');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadSample = () => {
    setText(DEFAULT_TEXT_RESULT.rawText);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.workspace}>
        {/* Left Side: Input Panel */}
        <View style={styles.inputPanel}>
          <Text style={styles.panelTitle}>Text Workspace</Text>

          {errorMessage ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={20} color="#721c24" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          {modelsReady === false && (
            <View style={styles.warningBox}>
              <MaterialIcons name="hourglass-empty" size={20} color="#856404" />
              <Text style={styles.warningText}>
                AI models are currently warming up on the backend. Analysis may be slow or temporarily return fallback scores.
              </Text>
            </View>
          )}

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Paste your investigator notes, legal filings, transcripts or suspect articles here for linguistic analysis (min 15 chars)..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Words: <Text style={styles.infoValue}>{wordCount}</Text></Text>
            <Text style={styles.infoLabel}>Characters: <Text style={styles.infoValue}>{charCount}</Text></Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.sampleBtn} onPress={handleLoadSample}>
              <Text style={styles.sampleBtnText}>Load Sample Prose</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.scanBtn} onPress={handleRunScan} disabled={isScanning}>
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="security" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.scanBtnText}>Analyze Linguistic Markers</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Results Panel */}
        <View style={styles.resultsPanel}>
          <Text style={styles.panelTitle}>Forensic Output</Text>
          {scanResult ? (
            <View style={styles.resultContent}>
              <View style={styles.scoreHeader}>
                <View style={styles.scoreGauge}>
                  <Text style={styles.scoreVal}>{scanResult.authenticityScore}%</Text>
                  <Text style={styles.scoreLabel}>Authentic</Text>
                </View>
                <View style={styles.verdictInfo}>
                  <Text style={styles.verdictTitle}>{scanResult.verdict}</Text>
                  <Text style={styles.verdictSub}>{scanResult.subTitle}</Text>
                </View>
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statName}>Linguistic Patterns</Text>
                  <Text style={styles.statVal}>{scanResult.patterns}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statName}>Linguistic Perplexity</Text>
                  <Text style={styles.statVal}>{scanResult.perplexity}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statName}>Structural Flow</Text>
                  <Text style={styles.statVal}>{scanResult.structure}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statName}>Suspected Generator</Text>
                  <Text style={styles.statVal}>{scanResult.modelMatch}</Text>
                </View>
              </View>

              <Text style={styles.subTitleLabel}>Highlighted Segments</Text>
              <View style={styles.highlightsContainer}>
                {scanResult.highlights.map((h, i) => {
                  const isAI = h.type === 'ai';
                  return (
                    <Text
                      key={i}
                      style={[
                        styles.highlightText,
                        isAI ? styles.highlightAI : styles.highlightHuman
                      ]}
                    >
                      {h.text}
                    </Text>
                  );
                })}
              </View>
            </View>
          ) : (
            <View style={styles.emptyResults}>
              <MaterialIcons name="analytics" size={48} color="#ccc" />
              <Text style={styles.emptyResultsText}>
                Awaiting input. Submit text to view the linguistic breakdown and AI-generation markers.
              </Text>
            </View>
          )}
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
  },
  workspace: {
    flexDirection: Platform.OS === 'web' && Dimensions.get('window').width > 800 ? 'row' : 'column',
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
    gap: 16,
  },
  inputPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  resultsPanel: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    minHeight: 300,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeeba',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#300000',
    height: 250,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontWeight: 'bold',
    color: '#300000',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  sampleBtn: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleBtnText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 13,
  },
  scanBtn: {
    flex: 1,
    backgroundColor: '#800000',
    borderRadius: 8,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyResultsText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 12,
  },
  resultContent: {
    flex: 1,
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fdfcfb',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(128, 0, 0, 0.05)',
  },
  scoreGauge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  scoreVal: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 18,
  },
  scoreLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  verdictInfo: {
    flex: 1,
  },
  verdictTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#300000',
  },
  verdictSub: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 16,
  },
  statBox: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  statName: {
    fontSize: 11,
    color: '#777',
    fontWeight: 'bold',
  },
  statVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 2,
  },
  subTitleLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#300000',
    marginBottom: 8,
  },
  highlightsContainer: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 20,
  },
  highlightAI: {
    backgroundColor: 'rgba(220, 38, 38, 0.12)',
    color: '#b91c1c',
  },
  highlightHuman: {
    backgroundColor: 'rgba(22, 163, 74, 0.08)',
    color: '#15803d',
  }
});
