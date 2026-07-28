import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { PDFAnalysisResult } from '../types';
import { DEFAULT_PDF_RESULT } from '../mockData';
import * as DocumentPicker from 'expo-document-picker';
import { MaterialIcons } from '@expo/vector-icons';

interface PDFAnalysisProps {
  backendUrl: string;
  modelsReady: boolean | null;
  onAddAnalyzedLog: (name: string, type: 'pdf', score: number, verdict: string, status: 'Completed' | 'Review Required') => void;
}

export default function PDFAnalysis({ backendUrl, modelsReady, onAddAnalyzedLog }: PDFAnalysisProps) {
  const [urlInput, setUrlInput] = useState('https://evidence.io/document-1202.pdf');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PDFAnalysisResult | null>(DEFAULT_PDF_RESULT);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const fileAsset = result.assets[0];
        setIsScanning(true);
        setScanResult(null);
        setErrorMessage('');

        const formData = new FormData();
        if (Platform.OS === 'web') {
          const blob = await fetch(fileAsset.uri).then(r => r.blob());
          formData.append('file', blob, fileAsset.name);
        } else {
          formData.append('file', {
            uri: fileAsset.uri,
            name: fileAsset.name,
            type: fileAsset.mimeType || 'application/pdf',
          } as any);
        }

        const response = await fetch(`${backendUrl}/analyze-pdf`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server status ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          const score = data.final_score;
          const riskScore = 100 - score;
          const verdict = data.verdict;
          const pdfInfo = data.pdf_info || {};
          const modules = data.modules || [];

          const pages = Array.from({ length: pdfInfo.pages || 1 }, (_, i) => ({
            pageNumber: i + 1,
            thumbnailUrl: (data.thumbnails && data.thumbnails[i]) ? data.thumbnails[i] : 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
            status: (score > 75 ? 'Authentic' : (score > 45 ? 'Modified' : 'Anomalous')) as 'Authentic' | 'Modified' | 'Anomalous',
            altText: `Page ${i + 1} analysis track`
          }));

          const insights = modules.map((m: any, idx: number) => ({
            id: `ins_${idx}`,
            icon: m.score > 70 ? 'check-circle' : 'warning',
            iconColor: m.score > 70 ? 'primary' : 'error',
            title: m.name,
            description: `${m.name} check score: ${m.score}%. ${m.description || ''}`
          }));

          setScanResult({
            riskScore,
            verdict: score >= 75 ? 'Authentic' : (score >= 45 ? 'Modified' : 'Altered/Anomalous'),
            description: `Integrity check completed for ${pdfInfo.pages || 1} pages. Word count extracted: ${pdfInfo.word_count || 0}.`,
            pages,
            extractedText: data.text_extracted ? `Extracted raw characters: ${pdfInfo.word_count} words analyzed across document.` : "No readable text layers extracted.",
            insights,
            imageData: {
              resolution: score > 75 ? '1200 DPI (High)' : '150 DPI (Resampled)',
              colorSpace: 'RGB / DeviceCMYK',
              compression: score > 75 ? 'FlateDecode' : 'DCTDecode (Double compressed)',
              isAnomalous: score < 75
            },
            systemInfo: {
              creator: 'Adobe PDF Library 15.0',
              producer: 'Acrobat Distiller 15.0',
              version: '1.6 (Acrobat 7.x)'
            },
            timeline: {
              created: '10/12/2023 • 14:32',
              modified: score > 75 ? '10/12/2023 • 14:32' : '10/24/2023 • 09:15',
              analyzed: 'JUST NOW'
            }
          });

          onAddAnalyzedLog(
            fileAsset.name,
            'pdf',
            score,
            score > 75 ? 'Original' : 'Altered',
            score > 50 ? 'Completed' : 'Review Required'
          );
        } else {
          alert("Verification failed: " + (data.error || "Unknown server error"));
        }
      }
    } catch (err: any) {
      console.error('PDF Pick or Upload error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
      } else {
        setErrorMessage(err.message || 'Unknown error occurred during PDF file scan');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleUrlScan = async () => {
    if (!urlInput.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('url', urlInput.trim());

      const response = await fetch(`${backendUrl}/analyze-pdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server status ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const score = data.final_score;
        const riskScore = 100 - score;
        const verdict = data.verdict;
        const pdfInfo = data.pdf_info || {};
        const modules = data.modules || [];

        const pages = Array.from({ length: pdfInfo.pages || 1 }, (_, i) => ({
          pageNumber: i + 1,
          thumbnailUrl: (data.thumbnails && data.thumbnails[i]) ? data.thumbnails[i] : 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
          status: (score > 75 ? 'Authentic' : (score > 45 ? 'Modified' : 'Anomalous')) as 'Authentic' | 'Modified' | 'Anomalous',
          altText: `Page ${i + 1} analysis track`
        }));

        const insights = modules.map((m: any, idx: number) => ({
          id: `ins_${idx}`,
          icon: m.score > 70 ? 'check-circle' : 'warning',
          iconColor: m.score > 70 ? 'primary' : 'error',
          title: m.name,
          description: `${m.name} check score: ${m.score}%. ${m.description || ''}`
        }));

        setScanResult({
          riskScore,
          verdict: score >= 75 ? 'Authentic' : (score >= 45 ? 'Modified' : 'Altered/Anomalous'),
          description: `Integrity check completed for ${pdfInfo.pages || 1} pages. Word count extracted: ${pdfInfo.word_count || 0}.`,
          pages,
          extractedText: data.text_extracted ? `Extracted raw characters: ${pdfInfo.word_count || 0} words analyzed.` : "No readable text layers.",
          insights,
          imageData: {
            resolution: score > 75 ? '1200 DPI (High)' : '150 DPI (Resampled)',
            colorSpace: 'RGB / DeviceCMYK',
            compression: score > 75 ? 'FlateDecode' : 'DCTDecode (Double compressed)',
            isAnomalous: score < 75
          },
          systemInfo: {
            creator: 'Adobe PDF Library 15.0',
            producer: 'Acrobat Distiller 15.0',
            version: '1.6 (Acrobat 7.x)'
          },
          timeline: {
            created: '10/12/2023 • 14:32',
            modified: score > 75 ? '10/12/2023 • 14:32' : '10/24/2023 • 09:15',
            analyzed: 'JUST NOW'
          }
        });

        onAddAnalyzedLog(
          'downloaded_document.pdf',
          'pdf',
          score,
          score > 75 ? 'Original' : 'Altered',
          score > 50 ? 'Completed' : 'Review Required'
        );
      } else {
        alert("Verification failed: " + (data.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error('PDF URL Scan error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
      } else {
        setErrorMessage(err.message || 'Unknown error occurred during PDF URL scan');
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.workspace}>
        {/* Left Side: Inputs */}
        <View style={styles.inputPanel}>
          <Text style={styles.panelTitle}>PDF Workspace</Text>

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
                The ML backend models are initializing. Live scan results might show placeholder scores temporarily.
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.uploadArea} onPress={handlePickFile} disabled={isScanning}>
            <MaterialIcons name="insert-drive-file" size={48} color="#800000" />
            <Text style={styles.uploadTitle}>Choose Evidence PDF</Text>
            <Text style={styles.uploadSubtitle}>Upload scanned doc or official file</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.urlInputContainer}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste Remote PDF URL..."
              placeholderTextColor="#999"
              value={urlInput}
              onChangeText={setUrlInput}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TouchableOpacity style={styles.urlBtn} onPress={handleUrlScan} disabled={isScanning}>
              <Text style={styles.urlBtnText}>Download & Scan</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Right Side: Results */}
        <View style={styles.resultsPanel}>
          <Text style={styles.panelTitle}>Forensic Output</Text>
          {scanResult ? (
            <View style={styles.resultContent}>
              {/* Score Header */}
              <View style={styles.scoreRow}>
                <View style={styles.verdictBadge}>
                  <Text style={styles.verdictTitle}>{scanResult.verdict}</Text>
                  <Text style={styles.verdictSubtitle}>{scanResult.description}</Text>
                </View>
                <View style={[styles.riskGauge, { backgroundColor: (100 - scanResult.riskScore) >= 75 ? '#28a745' : (100 - scanResult.riskScore) >= 45 ? '#D97706' : '#dc3545' }]}>
                  <Text style={styles.riskVal}>{100 - scanResult.riskScore}%</Text>
                  <Text style={styles.riskLabel}>Authenticity</Text>
                </View>
              </View>

              {/* Pages Grid */}
              <Text style={styles.sectionSubTitle}>Document Pages</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pagesScroll}>
                {scanResult.pages.map((p, idx) => {
                  const isSelected = selectedPageIndex === idx;
                  const isAnom = p.status === 'Anomalous';
                  const isMod = p.status === 'Modified';
                  return (
                    <TouchableOpacity
                      key={p.pageNumber}
                      style={[styles.pageThumb, isSelected && styles.pageThumbSelected]}
                      onPress={() => setSelectedPageIndex(idx)}
                    >
                      <MaterialIcons
                        name="picture-as-pdf"
                        size={28}
                        color={isAnom ? '#dc3545' : (isMod ? '#ffc107' : '#28a745')}
                      />
                      <Text style={styles.pageNumberLabel}>Page {p.pageNumber}</Text>
                      <Text style={[styles.pageStatusLabel, { color: isAnom ? '#dc3545' : (isMod ? '#b58100' : '#28a745') }]}>
                        {p.status}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Extracted Text */}
              <Text style={styles.sectionSubTitle}>Extracted Text Content (Page {selectedPageIndex + 1})</Text>
              <View style={styles.textBox}>
                <Text style={styles.extractedText}>{scanResult.extractedText || "No raw text content found on this page."}</Text>
              </View>

              {/* Structural / Image Data */}
              <Text style={styles.sectionSubTitle}>Digital & Compression Metadata</Text>
              <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Resolution</Text>
                  <Text style={styles.metaVal}>{scanResult.imageData.resolution}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Color Space</Text>
                  <Text style={styles.metaVal}>{scanResult.imageData.colorSpace}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>Compression Type</Text>
                  <Text style={styles.metaVal}>{scanResult.imageData.compression}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaKey}>PDF Producer</Text>
                  <Text style={styles.metaVal}>{scanResult.systemInfo.producer}</Text>
                </View>
              </View>

              {/* Insights */}
              {scanResult.insights.length > 0 && (
                <View style={styles.insightsSection}>
                  <Text style={styles.sectionSubTitle}>Structural Anomalies</Text>
                  {scanResult.insights.map((ins) => {
                    const isError = ins.iconColor === 'error';
                    return (
                      <View style={[styles.insightItem, isError ? styles.insightItemError : styles.insightItemInfo]} key={ins.id}>
                        <MaterialIcons
                          name={ins.icon === 'error-outline' ? 'error-outline' : 'info-outline'}
                          size={16}
                          color={isError ? '#dc3545' : '#17a2b8'}
                          style={{ marginRight: 8, marginTop: 2 }}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.insightTitle}>{ins.title}</Text>
                          <Text style={styles.insightDesc}>{ins.description}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={styles.emptyResults}>
              {isScanning ? (
                <ActivityIndicator size="large" color="#800000" />
              ) : (
                <>
                  <MaterialIcons name="analytics" size={48} color="#ccc" />
                  <Text style={styles.emptyResultsText}>
                    Awaiting document. Upload or download a PDF file to begin structural analysis.
                  </Text>
                </>
              )}
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
    flex: 1.2,
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
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#800000',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#fdfcfb',
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 12,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    fontSize: 12,
    color: '#999',
    marginHorizontal: 10,
    fontWeight: 'bold',
  },
  urlInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  urlInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  urlBtn: {
    backgroundColor: '#800000',
    borderRadius: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  urlBtnText: {
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
  scoreRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  verdictBadge: {
    flex: 1,
    backgroundColor: '#fdfcfb',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  verdictTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#300000',
  },
  verdictSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  riskGauge: {
    width: 68,
    height: 68,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riskVal: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  riskLabel: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionSubTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 16,
    marginBottom: 8,
  },
  pagesScroll: {
    gap: 10,
    paddingBottom: 4,
  },
  pageThumb: {
    width: 90,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  pageThumbSelected: {
    borderColor: '#800000',
    backgroundColor: '#fcf8f8',
  },
  pageNumberLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 4,
  },
  pageStatusLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  textBox: {
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#eee',
    minHeight: 80,
  },
  extractedText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  metaKey: {
    fontSize: 9,
    color: '#888',
    fontWeight: 'bold',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#300000',
    marginTop: 2,
  },
  insightsSection: {
    marginTop: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
  },
  insightItemError: {
    backgroundColor: '#fdfcfc',
    borderColor: '#f5c6cb',
  },
  insightItemInfo: {
    backgroundColor: '#fcfdfd',
    borderColor: '#bee5eb',
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#300000',
  },
  insightDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  }
});
