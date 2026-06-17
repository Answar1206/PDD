import os
import re

files = [
    'forensiq-ai/src/components/VideoAnalysis.tsx',
    'forensiq-ai/src/components/ImageAnalysis.tsx',
    'forensiq-ai/src/components/TextAnalysis.tsx',
    'forensiq-ai/src/components/PDFAnalysis.tsx'
]

for fpath in files:
    with open(fpath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace ping error message
    content = re.sub(
        r"'Backend is offline\. Please:\\n'\s*\+\s*'1\. Run python launcher\.py\\n'\s*\+\s*'2\. Copy the new URL shown\\n'\s*\+\s*'3\. Paste it in the Backend URL field above'",
        "'Backend is starting up...\\nMake sure launcher.py is running.'",
        content
    )
    
    # Replace catch block error message
    content = re.sub(
        r"message = `Cannot connect to backend server\.[^`]+`;",
        "message = 'Backend is starting up...\\nMake sure launcher.py is running.';",
        content
    )

    # Remove copy command rendering block
    content = re.sub(
        r"\{errorMessage\.includes\('python launcher\.py'\) && \([\s\S]*?Copy Command\s*</button>\s*\)\}",
        "",
        content
    )

    # To avoid blocking the upload zone, we can change setState('error') to not do that if error is connection error.
    # Actually, the prompt says "Never block upload zone when backend is offline."
    # If state is 'error', the upload zone is blocked. So let's replace `setState('error')` with `if (state === 'analyzing') setState('error'); else setState(state);`
    # Wait, simple way: replace `setState('error');` with `// setState('error');` inside the catch block. 
    # But wait, there is `setState('error')` for file size too. Let's just find the `setState('error')` in the catch block.
    # It's at the end of `runVerificationRequest`. Let's just replace `setState('error');` at the end of the catch block with nothing or `setState(isUrl ? 'empty' : 'selected')`. But wait, in `VideoAnalysis`, there is `isUrl`. In `TextAnalysis`, there isn't.
    # Let's just do `setState('empty');` or remove it so it stays empty/selected.
    # Let's write back first.

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

# Update App.tsx default URL and retry logic
app_path = 'forensiq-ai/src/App.tsx'
with open(app_path, 'r', encoding='utf-8') as f:
    app_content = f.read()

app_content = app_content.replace('const DEFAULT_URL = "http://localhost:5001";', 'const DEFAULT_URL = "http://localhost:5000";')

# Replace the useEffect to have a setInterval
app_content = app_content.replace(
    '''  React.useEffect(() => {
    testBackendConnection();
  }, []);''',
    '''  React.useEffect(() => {
    testBackendConnection();
    const interval = setInterval(testBackendConnection, 10000);
    return () => clearInterval(interval);
  }, [backendUrl]);'''
)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(app_content)
