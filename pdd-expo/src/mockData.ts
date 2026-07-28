import { ForensicRecord, TextAnalysisResult, PDFAnalysisResult, ImageAnalysisResult, VideoAnalysisResult } from './types';

export const INITIAL_RECORDS: ForensicRecord[] = [
  {
    id: 'rec_1',
    name: 'deepfake_detection_v09.mp4',
    hash: '4f8263bdcee927fd2ee98a1e9a7cbb05b583f7a28e08d6c8b9de2ef4f8251e9a',
    type: 'video',
    date: 'Oct 24, 2023 • 14:32',
    score: 97,
    verdict: 'Original',
    status: 'Completed',
    anomaliesCount: 0
  },
  {
    id: 'rec_2',
    name: 'sat_imagery_iran_base.jpg',
    hash: 'd91a92e8ca84b802e6c42a22830f88bbcd1aaef902e11d2eef29d91ac82b4ea1',
    type: 'image',
    date: 'Oct 24, 2023 • 11:05',
    score: 14,
    verdict: 'Altered',
    status: 'Completed',
    anomaliesCount: 3
  },
  {
    id: 'rec_3',
    name: 'legal_affidavit_scanned.pdf',
    hash: 'e8f3956bf1a94d8de1eaef503ba88e0acff03dd28a47ff02bc3aaee8f3777d12',
    type: 'pdf',
    date: 'Oct 23, 2023 • 18:50',
    score: 82,
    verdict: 'Potential',
    status: 'Review Required',
    anomaliesCount: 4
  },
  {
    id: 'rec_4',
    name: 'ai_generated_prose_log.txt',
    hash: 'b2a16d8e8c843aa2b0e927ad9fdeab12093844fa0e2c882bcfaef1ab2a144f9c',
    type: 'text',
    date: 'Oct 23, 2023 • 09:12',
    score: 99,
    verdict: 'Human',
    status: 'Completed',
    anomaliesCount: 0
  },
  {
    id: 'rec_5',
    name: 'confidential_contracts_v1.pdf',
    hash: '7a1bd28ef0e9ea9baef0182fc1a2a4bdf3cd2a9ff0891dbeaebd7a1bd28e18ef',
    type: 'pdf',
    date: 'Oct 22, 2023 • 16:15',
    score: 35,
    verdict: 'Altered',
    status: 'Completed',
    anomaliesCount: 2
  }
];

export const DEFAULT_TEXT_RESULT: TextAnalysisResult = {
  verdict: 'Likely AI Generated',
  subTitle: 'Analysis shows significant markers of synthetic generation.',
  authenticityScore: 15,
  probabilityAI: 85,
  modelMatch: 'GPT-4o',
  patterns: 'Repetitive',
  perplexity: 'Low (12.4)',
  structure: 'Linear',
  insights: [
    {
      id: 'ins_t1',
      type: 'error',
      title: 'Syntax Inconsistency',
      description: "Sentence 3 shows a formal shift inconsistent with the rest of the document's established voice."
    },
    {
      id: 'ins_t2',
      type: 'warning',
      title: 'Repetitive Token Sequencing',
      description: 'Highly predictable linguistic sequences typically associated with AI generation patterns in 64% of paragraph 2.'
    }
  ],
  rawText: `The rapid advancement of generative AI has fundamentally altered the landscape of digital journalism. While traditional newsrooms grapple with declining revenues, the integration of large language models offers a potential solution for scaling content production. However, this efficiency comes at a cost to editorial integrity.`,
  highlights: [
    { text: 'The rapid advancement of generative AI has fundamentally altered the landscape of digital journalism.', type: 'human' },
    { text: ' While traditional newsrooms grapple with declining revenues, ', type: 'neutral' },
    { text: 'the integration of large language models offers a potential solution for scaling content production. However, this efficiency comes at a cost to editorial integrity.', type: 'ai' }
  ]
};

export const DEFAULT_PDF_RESULT: PDFAnalysisResult = {
  riskScore: 70,
  verdict: 'Likely Altered',
  description: '4 structural anomalies detected in metadata and layered objects.',
  pages: [
    {
      pageNumber: 1,
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
      status: 'Anomalous',
      altText: 'A clean, clinical scan of a forensic document page with visible text and formal headers.'
    },
    {
      pageNumber: 2,
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
      status: 'Authentic',
      altText: 'A high-resolution top-down photograph of a professional document page with structured tables.'
    }
  ],
  extractedText: `[EXTRACTED_PAGE_01]\n\nCASE NO: 882-QX-2024\nSUBJECT: FINANCIAL DISCLOSURE 12\n\nThe following assets were accounted for during the audit of the subsidiary holdings...`,
  insights: [
    {
      id: 'ins_p1',
      icon: 'error-outline',
      iconColor: 'error',
      title: 'Syntax Inconsistency',
      description: "Sentence 3 shows a formal shift inconsistent with the rest of the document's established voice."
    },
    {
      id: 'ins_p2',
      icon: 'history-edu',
      iconColor: 'secondary',
      title: 'Font Layering Mismatch',
      description: '"Subsidiary holdings" uses a slightly different kerning profile than the surrounding text block.'
    }
  ],
  imageData: {
    resolution: '300 DPI',
    colorSpace: 'DeviceCMYK',
    compression: 'NONE (Artifacts)',
    isAnomalous: true
  },
  systemInfo: {
    creator: 'Adobe PDF Library 15.0',
    producer: 'Acrobat Distiller 15.0',
    version: '1.6 (Acrobat 7.x)'
  },
  timeline: {
    created: '10/12/2023 • 14:32',
    modified: '10/24/2023 • 09:15',
    analyzed: 'JUST NOW'
  }
};

export const DEFAULT_IMAGE_RESULT: ImageAnalysisResult = {
  riskScore: 86,
  verdict: 'Altered',
  description: 'Double JPEG compression and copy-move forgery markers detected.',
  imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80',
  metadata: {
    resolution: '4032 x 3024 (12 MP)',
    cameraBrand: 'Apple',
    cameraModel: 'iPhone 13 Pro',
    software: 'Adobe Photoshop 24.5 (Windows)',
    gpsCoordinates: '35.6762° N, 139.6503° E',
    originalCodec: 'HEVC / H.265'
  },
  anomalies: [
    {
      id: 'anom_1',
      title: 'ELA Brightness Spike',
      x: 35,
      y: 45,
      description: 'Higher error level analysis density indicates this structure was digitally pasted or modified.'
    },
    {
      id: 'anom_2',
      title: 'Clone Stamp Pattern',
      x: 72,
      y: 60,
      description: 'Direct correlation with background pixel distributions in section 4A, suggesting cloned noise layers.'
    }
  ]
};

export const DEFAULT_VIDEO_RESULT: VideoAnalysisResult = {
  riskScore: 76,
  verdict: 'Altered (Deepfake)',
  description: 'AI face-swapping indicators and inconsistent audio-to-mouth timing.',
  videoUrl: '',
  framesAnalyzed: 145,
  temporalIncoherence: 'High (0.84)',
  codecMismatch: true,
  insights: [
    'Face landmarks show spatial inconsistencies across frames 42-78.',
    'Blendshape coefficients indicate AI-generated eye blinking cycles (under 4/min).',
    'Audio track shows minor phase offset of 42ms relative to vocal tract movements.'
  ]
};
