import os

files = [
    'forensiq-ai/src/components/VideoAnalysis.tsx',
    'forensiq-ai/src/components/ImageAnalysis.tsx',
    'forensiq-ai/src/components/TextAnalysis.tsx',
    'forensiq-ai/src/components/PDFAnalysis.tsx'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The string looks like:
    # 'Backend is starting up...
    # Make sure launcher.py is running.'
    # We replace it with:
    # 'Backend is starting up...\\nMake sure launcher.py is running.'
    
    bad_str = "'Backend is starting up...\nMake sure launcher.py is running.'"
    good_str = "'Backend is starting up...\\nMake sure launcher.py is running.'"
    
    content = content.replace(bad_str, good_str)
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
