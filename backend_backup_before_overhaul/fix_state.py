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

    # Never block upload zone by restoring the state to 'empty' or 'selected'
    # Actually, the easiest way is to NOT change state to 'error' at all for connection issues!
    # Instead of setState('error'), we just do nothing, or revert to the previous state.
    # In runVerificationRequest, we have:
    # setState('error');
    # We can replace the last `setState('error');` with `setState(isUrl ? 'empty' : (selectedFile ? 'selected' : 'empty'));` 
    # But wait, TextAnalysis might not have `isUrl`.
    # Let's just find `setState('error');` inside the `catch (err: any)` block.
    # The simplest is to replace all `setState('error');` in the catch blocks.
    # A quick way is to replace `setState('error');` with `// setState('error');` so it just stays on `analyzing`? No, if it stays on analyzing, the progress bar keeps going!
    # We must revert state so the upload zone comes back.
    # TextAnalysis: `setState(textInput ? 'selected' : 'empty');`
    # Image/Video/PDF: `setState(isUrl ? 'empty' : 'selected');`
    
    # A safe fallback is to set it to 'empty' so the user can just paste/upload again.
    
    content = content.replace("setState('error');", "setState('empty'); /* Error but keep upload zone open */")
    
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)
