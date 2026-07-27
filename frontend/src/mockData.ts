/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ForensicRecord, TextAnalysisResult, PDFAnalysisResult, ImageAnalysisResult, VideoAnalysisResult } from './types';

export const INITIAL_RECORDS: ForensicRecord[] = [
  {
    id: 'rec_1',
    name: 'deepfake_detection_v09.mp4',
    hash: '4f8263bdcee927fd2ee98a1e9a7cbb05b583f7a28e08d6c8b9de2ef4f8251e9a',
    type: 'video',
    date: 'Oct 24, 2023 • 14:32',
    score: 97, // 97% Original
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
    score: 14, // 14% Altered (meaning 14% original, 86% altered)
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
    score: 82, // 82% Potential
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
    score: 99, // 99% Human
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
  },
  {
    id: 'rec_6',
    name: 'witness_interview_audio.wav',
    hash: 'f92cd1bee9aecca8ef01e2ac182ffed88cb1aaed2b0ca8ebd8cf92cd1beeca8e',
    type: 'video', // we bundle audio/video under 'video' or 'all'
    date: 'Oct 22, 2023 • 13:02',
    score: 91,
    verdict: 'Original',
    status: 'Completed',
    anomaliesCount: 1
  },
  {
    id: 'rec_7',
    name: 'medical_certificate_redacted.jpg',
    hash: '1ebd0f8a9ecca8efc2bd80ef9108bf8adcae2da8ef0eacc1ebd0f8a9ecca8efc',
    type: 'image',
    date: 'Oct 21, 2023 • 10:45',
    score: 42,
    verdict: 'Modified',
    status: 'Completed',
    anomaliesCount: 5
  },
  {
    id: 'rec_8',
    name: 'press_release_leaked_draft.txt',
    hash: '9a8ed2cbda0ff2ecca1eab875fdecf0acbe7de98cb721a9a8ed2cbda0ff2ecca',
    type: 'text',
    date: 'Oct 20, 2023 • 19:22',
    score: 11, // 11% Human confidence (Likely AI Generated)
    verdict: 'Altered',
    status: 'Completed',
    anomaliesCount: 0
  },
  {
    id: 'rec_9',
    name: 'security_cam_terminal_5.mp4',
    hash: '2cbd0f8ebaecca109b4ec8a1ecca8ffcca99b2e8ccba8ef2cbd0f8ebaecca109',
    type: 'video',
    date: 'Oct 20, 2023 • 08:31',
    score: 88,
    verdict: 'Original',
    status: 'Completed',
    anomaliesCount: 1
  },
  {
    id: 'rec_10',
    name: 'presidential_speech_cut.mp4',
    hash: '7d3aa9decf8efea3ca08d6aee71aefa78fbb0e9acb8e88ff7d3aa9decf8efea3',
    type: 'video',
    date: 'Oct 19, 2023 • 17:40',
    score: 24, // 24% Original, Likely deepfake manip
    verdict: 'Altered',
    status: 'Review Required',
    anomaliesCount: 6
  },
  {
    id: 'rec_11',
    name: 'bank_statement_scan_2023.pdf',
    hash: 'ac048cfdecca3b08e2da80ff910fbbdf99aae8d1bc02feacd048cfdecca3b08e',
    type: 'pdf',
    date: 'Oct 19, 2023 • 11:15',
    score: 95,
    verdict: 'Original',
    status: 'Completed',
    anomaliesCount: 0
  },
  {
    id: 'rec_12',
    name: 'academic_thesis_abstract.txt',
    hash: 'ff83aadef0e8f0a2baef77e0fa80deacbe09ff01dbe08afff83aadef0e8f0a2b',
    type: 'text',
    date: 'Oct 18, 2023 • 14:02',
    score: 98,
    verdict: 'Human',
    status: 'Completed',
    anomaliesCount: 0
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
      description: 'Sentence 3 shows a formal shift inconsistent with the rest of the document\'s established voice.'
    },
    {
      id: 'ins_t2',
      type: 'warning',
      title: 'Repetitive Token Sequencing',
      description: 'Highly predictable linguistic sequences typically associated with AI generation patterns in 64% of paragraph 2.'
    },
    {
      id: 'ins_t3',
      type: 'info',
      title: 'Low Token Burstiness',
      description: 'Remarkably consistent sentence lengths and flat perplexity indices across the scanned content.'
    }
  ],
  rawText: `The rapid advancement of generative AI has fundamentally altered the landscape of digital journalism. While traditional newsrooms grapple with declining revenues, the integration of large language models offers a potential solution for scaling content production. However, this efficiency comes at a cost to editorial integrity. In a recent study by the Forensic Media Institute, investigators found that highly predictable linguistic patterns often signify automated generation processes devoid of human nuance or specific cultural context. Researchers suggest that the key to maintaining trust lies in transparent attribution.`,
  highlights: [
    { text: 'The rapid advancement of generative AI has fundamentally altered the landscape of digital journalism.', type: 'human' },
    { text: ' While traditional newsrooms grapple with declining revenues, ', type: 'neutral' },
    { text: 'the integration of large language models offers a potential solution for scaling content production. However, this efficiency comes at a cost to editorial integrity.', type: 'ai' },
    { text: ' In a recent study by the Forensic Media Institute, investigators found that ', type: 'neutral' },
    { text: 'highly predictable linguistic patterns often signify automated generation processes devoid of human nuance or specific cultural context.', type: 'ai' },
    { text: ' Researchers suggest that the key to maintaining trust lies in transparent attribution.', type: 'human' }
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
    },
    {
      pageNumber: 3,
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
      status: 'Authentic',
      altText: 'A macro shot of a forensic document showing detailed signatures.'
    },
    {
      pageNumber: 4,
      thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
      status: 'Modified',
      altText: 'Digital representation of a forensic report page with highlighted potential forgery.'
    }
  ],
  extractedText: `[EXTRACTED_PAGE_01]

CASE NO: 882-QX-2024
SUBJECT: FINANCIAL DISCLOSURE 12
DATE: OCT 12, 2023

The following assets were accounted for during the audit of the subsidiary holdings... Total valuation estimated at approximately $12.4M USD. This value is based on the historical inflation rates of the regional district.

Note: Digital signature verified on server. Any alteration to this document will result in immediate voiding of the contract.`,
  insights: [
    {
      id: 'ins_p1',
      icon: 'error_outline',
      iconColor: 'error',
      title: 'Syntax Inconsistency',
      description: 'Sentence 3 shows a formal shift inconsistent with the rest of the document\'s established voice.'
    },
    {
      id: 'ins_p2',
      icon: 'history_edu',
      iconColor: 'secondary',
      title: 'Font Layering Mismatch',
      description: '"Subsidiary holdings" uses a slightly different kerning profile than the surrounding text block.'
    },
    {
      id: 'ins_p3',
      icon: 'verified',
      iconColor: 'primary',
      title: 'Entity Validation',
      description: 'All dates and case numbers match central repository records.'
    }
  ],
  imageData: {
    resolution: '300 DPI',
    colorSpace: 'DeviceCMYK',
    compression: 'NONE (Artifacts)',
    isAnomalous: true
  },
  systemInfo: {
    creator: 'Adobe Acrobat 11.0',
    producer: 'Quartz PDFContext',
    version: 'PDF-1.4'
  },
  timeline: {
    created: '2023-10-12',
    modified: '2024-01-05*',
    analyzed: 'NOW'
  }
};

export const DEFAULT_IMAGE_RESULT: ImageAnalysisResult = {
  riskScore: 86,
  verdict: 'Altered Narrative',
  description: 'Evidence of metadata scrubbing and localized pixels manipulation in the satellite image.',
  imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD2OvdqL9ZaTEmm8j7tpnN7e6iYWRsEhhrhnAcCfY1ZmbekX7NqirTFU1Z9Ark818bJaWsCnaPasZhFzfoZjScUKJ5Y2UcCPmXbexvikFEGwTJ0Yods50LLZMVaMseLRDifi17_Q4175bH7DcboaOdULhLw7zwM-I8YW3b8X07U6zboC1es7D-71IH2tXnaO8o5hOlkTx-ZcQnfVbsOnrq-b9wxIjcurG00K8xtkxYKiMkkvc27Q6g7UcIJeLGB1Elp3KEa6_1aMJ8',
  metadata: {
    resolution: '4000 x 3000 (12 MP)',
    cameraBrand: 'Teledyne',
    cameraModel: 'IKONOS-2',
    software: 'Adobe Photoshop 24.5 (Mac)',
    gpsCoordinates: '35.6892° N, 51.3890° E',
    originalCodec: 'Uncompressed TIFF'
  },
  anomalies: [
    {
      id: 'an_im1',
      title: 'Cloned Texture Brush',
      x: 35,
      y: 45,
      description: 'Localized texture replication found near hangar zone. Highly likely masking operation.'
    },
    {
      id: 'an_im2',
      title: 'EXIF Discrepancy',
      x: 75,
      y: 20,
      description: 'Software tag indicates save action in consumer raster editors instead of laboratory satellite telemetry pipelines.'
    },
    {
      id: 'an_im3',
      title: 'Resampling Boundary',
      x: 52,
      y: 68,
      description: 'Sharp alteration in noise floor distribution across the southern perimeter fence line.'
    }
  ]
};

export const DEFAULT_VIDEO_RESULT: VideoAnalysisResult = {
  riskScore: 3, // 3% risk, meaning 97% original
  verdict: 'Authentic Media',
  description: 'Excellent block coherence. Consistent sensory noise floor indicating single-source acquisition.',
  videoUrl: '', // empty signifies running local scan
  framesAnalyzed: 4280,
  temporalIncoherence: '0.04ms (Excellent)',
  codecMismatch: false,
  insights: [
    'No localized frame drops detector spikes found.',
    'Color channel phase alignment conforms perfectly to standard H.264 profile.',
    'Consistent background acoustic frequency matching regional power grid phase rate (50Hz).'
  ]
};
