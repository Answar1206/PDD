/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type AssetType = 'video' | 'image' | 'text' | 'pdf';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
}

export interface ForensicRecord {
  id: string;
  name: string;
  hash: string;
  type: AssetType;
  date: string;
  score: number; // e.g., 97 (means 97% human or 97% original)
  verdict: 'Original' | 'Human' | 'Altered' | 'Modified' | 'Potential';
  status: 'Completed' | 'Review Required' | 'Analyzing';
  anomaliesCount: number;
}

export interface TextAnalysisResult {
  verdict: string;
  subTitle: string;
  authenticityScore: number; // e.g., 15 (stands for 15% authentic, 85% probability AI)
  probabilityAI: number;
  modelMatch: string;
  patterns: string;
  perplexity: string;
  structure: string;
  insights: {
    id: string;
    type: 'error' | 'warning' | 'info';
    title: string;
    description: string;
  }[];
  rawText: string;
  highlights: {
    text: string;
    type: 'human' | 'ai' | 'neutral';
  }[];
}

export interface PDFAnalysisResult {
  riskScore: number; // e.g., 70% risk
  verdict: string;
  description: string;
  pages: {
    pageNumber: number;
    thumbnailUrl: string;
    status: 'Anomalous' | 'Authentic' | 'Modified';
    altText: string;
  }[];
  extractedText: string;
  insights: {
    id: string;
    icon: string;
    iconColor: string;
    title: string;
    description: string;
  }[];
  imageData: {
    resolution: string;
    colorSpace: string;
    compression: string;
    isAnomalous: boolean;
  };
  systemInfo: {
    creator: string;
    producer: string;
    version: string;
  };
  timeline: {
    created: string;
    modified: string;
    analyzed: string;
  };
}

export interface ImageAnalysisResult {
  riskScore: number;
  verdict: string;
  description: string;
  imageUrl: string;
  metadata: {
    resolution: string;
    cameraBrand: string;
    cameraModel: string;
    software: string;
    gpsCoordinates: string;
    originalCodec: string;
  };
  anomalies: {
    id: string;
    title: string;
    x: number; // percentage coordinate
    y: number;
    description: string;
  }[];
}

export interface VideoAnalysisResult {
  riskScore: number;
  verdict: string;
  description: string;
  videoUrl: string;
  downloadedVideoUrl?: string;
  framesAnalyzed: number;
  temporalIncoherence: string;
  codecMismatch: boolean;
  insights: string[];
}
