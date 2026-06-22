import sys
import os

app_path = r'c:\Users\darma\OneDrive\Desktop\PDD\app.py'

with open(app_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Append the three new functions at the top or after imports
# Actually, the user says 'Add this function to app.py'. We can put them right before 'def analyze_video('

new_funcs = '''
import json
import subprocess
import tempfile
import os

def check_c2pa_credentials(file_path):
    score = 60
    result = {
        "has_c2pa": False,
        "is_authentic": False,
        "has_ai_edits": False,
        "camera_signature": False,
        "ai_tool_logged": False,
        "manifest_valid": False,
        "details": "No C2PA data found"
    }

    try:
        import c2pa
        
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
        
        # Read C2PA manifest from file
        try:
            manifest_json = c2pa.read_file(
                file_path, None)
            
            if manifest_json:
                result["has_c2pa"] = True
                manifest = json.loads(manifest_json)
                
                # Check active manifest
                active = manifest.get(
                    "active_manifest", "")
                manifests = manifest.get(
                    "manifests", {})
                
                if active and active in manifests:
                    m = manifests[active]
                    
                    # Check claim generator
                    # Camera = real, AI tool = fake
                    generator = m.get(
                        "claim_generator", "")
                    
                    # Known AI tools that log C2PA
                    ai_tools = [
                        "adobe firefly",
                        "dall-e",
                        "openai",
                        "midjourney",
                        "stable diffusion",
                        "runway",
                        "pika",
                        "sora",
                        "heygen",
                        "synthesia",
                        "kling",
                        "google",
                        "gemini"
                    ]
                    
                    gen_lower = generator.lower()
                    is_ai_gen = any(
                        tool in gen_lower
                        for tool in ai_tools)
                    
                    # Check ingredients (history)
                    ingredients = m.get(
                        "ingredients", [])
                    
                    # Check assertions
                    assertions = m.get(
                        "assertions", [])
                    
                    has_ai_assertion = False
                    has_camera = False
                    
                    for assertion in assertions:
                        label = assertion.get(
                            "label", "").lower()
                        
                        # AI training data usage
                        if "training" in label:
                            has_ai_assertion = True
                        
                        # AI generative assertion
                        if "generative" in label:
                            has_ai_assertion = True
                            result["ai_tool_logged"] = True
                        
                        # Camera capture assertion
                        if ("capture" in label or
                                "camera" in label):
                            has_camera = True
                            result["camera_signature"] = True
                    
                    result["has_ai_edits"] = (
                        is_ai_gen or has_ai_assertion)
                    result["manifest_valid"] = True
                    
                    # Score based on findings
                    if has_camera and not is_ai_gen:
                        # Real camera with no AI = real
                        score = 92
                        result["is_authentic"] = True
                        result["details"] = (
                            "Camera signature verified. "
                            "No AI tools logged.")
                    
                    elif is_ai_gen or has_ai_assertion:
                        # AI tool signature found = fake
                        score = 8
                        result["details"] = (
                            f"AI tool detected in C2PA: "
                            f"{generator}")
                    
                    elif result["has_c2pa"]:
                        # Has C2PA but unclear
                        score = 65
                        result["details"] = (
                            "C2PA manifest found. "
                            "Origin unclear.")
                
                else:
                    # Has C2PA but no valid manifest
                    score = 55
                    result["details"] = (
                        "C2PA data present but "
                        "manifest invalid or stripped")
            
            else:
                # No C2PA at all
                # Could be real (old cameras) or AI
                score = 55
                result["details"] = (
                    "No C2PA metadata found. "
                    "Older media or AI-generated.")
        
        except Exception as e:
            print(f"C2PA read error: {e}")
            score = 55
            result["details"] = f"C2PA parse error: {e}"
    
    except ImportError:
        # c2pa not installed - use fallback
        print("c2pa library not available")
        score = check_c2pa_fallback(file_path)
        result["details"] = "C2PA checked via fallback"
    
    except Exception as e:
        print(f"C2PA check failed: {e}")
        score = 55
    
    result["score"] = score
    print(f"C2PA Score: {score} - {result['details']}")
    return result

def check_c2pa_fallback(file_path):
    # Fallback: check EXIF and file metadata manually
    # Real cameras embed EXIF, AI tools often don't
    score = 55
    try:
        from PIL import Image
        from PIL.ExifTags import TAGS
        
        img = Image.open(file_path)
        exif_data = img._getexif()
        
        if exif_data:
            has_make = False
            has_model = False
            has_datetime = False
            has_gps = False
            
            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                if tag == "Make":
                    has_make = True
                if tag == "Model":
                    has_model = True
                if tag == "DateTime":
                    has_datetime = True
                if tag == "GPSInfo":
                    has_gps = True
            
            if has_make and has_model:
                score = 82  # Camera signature
            elif has_datetime:
                score = 68  # Some metadata
            else:
                score = 45  # Minimal metadata
        else:
            score = 40  # No EXIF = likely AI
    except:
        score = 55
    
    return score

import numpy as np
from scipy import stats
from scipy.fft import fft2, fftshift

def detect_synthid_watermark(frames_or_image):
    score = 55
    watermark_indicators = {
        "spectral_pattern_found": False,
        "pixel_pattern_found": False,
        "frequency_anomaly": False,
        "confidence": 0.0,
        "verdict": "No watermark detected"
    }
    
    try:
        frames = frames_or_image
        if not isinstance(frames, list):
            frames = [frames_or_image]
        
        spectral_scores = []
        pixel_scores = []
        
        for frame in frames[:8]:
            try:
                import cv2
                
                # Convert to different color spaces
                gray = cv2.cvtColor(
                    frame, cv2.COLOR_BGR2GRAY)
                
                float_gray = gray.astype(np.float64)
                
                # DETECTION 1: DCT analysis
                # SynthID embeds patterns in DCT domain
                # similar to JPEG but at specific freqs
                h, w = float_gray.shape
                
                # Divide into 8x8 blocks (DCT standard)
                block_scores = []
                for y in range(0, h-8, 8):
                    for x in range(0, w-8, 8):
                        block = float_gray[y:y+8, x:x+8]
                        dct_block = cv2.dct(
                            np.float32(block))
                        
                        # Check mid-frequency components
                        # SynthID modifies these
                        mid_freq = dct_block[2:6, 2:6]
                        variance = np.var(mid_freq)
                        block_scores.append(variance)
                
                if block_scores:
                    variance_mean = np.mean(block_scores)
                    variance_std = np.std(block_scores)
                    
                    # SynthID creates subtle but
                    # statistically consistent
                    # variance patterns
                    coefficient_of_variation = (
                        variance_std /
                        (variance_mean + 1e-10))
                    
                    # Natural images: high CV (random)
                    # SynthID watermarked: lower CV
                    # (structured pattern)
                    if coefficient_of_variation < 0.8:
                        spectral_scores.append(25)
                        watermark_indicators[
                            "spectral_pattern_found"
                        ] = True
                    elif coefficient_of_variation < 1.2:
                        spectral_scores.append(50)
                    else:
                        spectral_scores.append(80)
                
                # DETECTION 2: LSB (Least Significant Bit)
                # Watermarks often embed in LSB layer
                lsb_layer = gray & 1
                lsb_mean = np.mean(lsb_layer)
                lsb_std = np.std(lsb_layer)
                
                # Natural images: LSB close to 0.5 mean
                # Watermarked: slight statistical shift
                lsb_deviation = abs(lsb_mean - 0.5)
                
                if lsb_deviation > 0.08:
                    pixel_scores.append(20)
                    watermark_indicators[
                        "pixel_pattern_found"] = True
                elif lsb_deviation > 0.04:
                    pixel_scores.append(45)
                else:
                    pixel_scores.append(75)
                
                # DETECTION 3: Frequency domain
                # FFT analysis for embedded patterns
                fft_result = np.fft.fft2(float_gray)
                fft_shifted = np.fft.fftshift(fft_result)
                magnitude = np.abs(fft_shifted)
                
                # Check for periodic patterns
                # in frequency domain
                # Watermarks create subtle peaks
                log_mag = np.log1p(magnitude)
                
                # Autocorrelation of magnitude
                autocorr = np.correlate(
                    log_mag.flatten()[:1000],
                    log_mag.flatten()[:1000],
                    mode='full'
                )
                
                # Check for periodicity
                center = len(autocorr) // 2
                side_peaks = np.max(
                    np.abs(autocorr[center+10:center+100]))
                center_val = autocorr[center]
                
                periodicity = (
                    side_peaks / (center_val + 1e-10))
                
                if periodicity > 0.3:
                    watermark_indicators[
                        "frequency_anomaly"] = True
                
            except Exception as e:
                print(f"Watermark frame error: {e}")
                continue
        
        # Calculate final watermark score
        all_scores = spectral_scores + pixel_scores
        
        if all_scores:
            avg = np.mean(all_scores)
            
            indicators_found = sum([
                watermark_indicators[
                    "spectral_pattern_found"],
                watermark_indicators[
                    "pixel_pattern_found"],
                watermark_indicators[
                    "frequency_anomaly"]
            ])
            
            confidence = indicators_found / 3.0
            watermark_indicators["confidence"] = (
                round(confidence, 2))
            
            if indicators_found >= 2:
                score = 15
                watermark_indicators["verdict"] = (
                    "SynthID-style watermark detected. "
                    "Likely AI-generated content.")
            elif indicators_found == 1:
                score = 40
                watermark_indicators["verdict"] = (
                    "Possible watermark patterns found.")
            else:
                score = avg
                watermark_indicators["verdict"] = (
                    "No watermark patterns detected.")
    
    except Exception as e:
        print(f"SynthID detection error: {e}")
        score = 55
    
    watermark_indicators["score"] = round(score)
    print(f"SynthID Score: {round(score)} - "
          f"{watermark_indicators['verdict']}")
    return watermark_indicators

def detect_audio_watermark(video_path):
    score = 55
    result = {
        "has_audio": False,
        "watermark_detected": False,
        "score": 55,
        "details": "No audio analyzed"
    }
    
    try:
        import librosa
        import numpy as np
        
        # Extract audio from video
        audio, sr = librosa.load(
            video_path,
            sr=22050,
            duration=30,
            mono=True
        )
        
        if len(audio) < 1000:
            result["details"] = "Audio too short"
            return result
        
        result["has_audio"] = True
        
        # SynthID audio embeds in specific
        # frequency ranges using psychoacoustic masking
        
        # 1. Spectrogram analysis
        stft = librosa.stft(audio)
        magnitude = np.abs(stft)
        
        # Check statistical uniformity
        # of frequency bands
        freq_stds = np.std(magnitude, axis=1)
        
        uniformity = np.std(freq_stds) / (
            np.mean(freq_stds) + 1e-10)
        
        # 2. Check for periodic patterns
        # in spectral centroid
        centroid = librosa.feature.spectral_centroid(
            y=audio, sr=sr)[0]
        
        centroid_autocorr = np.correlate(
            centroid - np.mean(centroid),
            centroid - np.mean(centroid),
            mode='full'
        )
        
        half = len(centroid_autocorr) // 2
        period_strength = np.max(
            np.abs(
                centroid_autocorr[half+5:half+50]
            )
        ) / (centroid_autocorr[half] + 1e-10)
        
        # 3. High frequency energy distribution
        mfcc = librosa.feature.mfcc(
            y=audio, sr=sr, n_mfcc=20)
        high_mfcc_energy = np.mean(
            np.abs(mfcc[12:, :]))
        
        # Score based on findings
        watermark_signals = 0
        
        if uniformity < 0.5:
            watermark_signals += 1
        
        if period_strength > 0.25:
            watermark_signals += 1
        
        if high_mfcc_energy > 15:
            watermark_signals += 1
        
        if watermark_signals >= 2:
            score = 18
            result["watermark_detected"] = True
            result["details"] = (
                "Audio watermark patterns detected. "
                "Possibly AI-generated audio.")
        elif watermark_signals == 1:
            score = 45
            result["details"] = (
                "Possible audio watermark signals.")
        else:
            score = 82
            result["details"] = (
                "Natural audio patterns detected.")
        
    except Exception as e:
        print(f"Audio watermark error: {e}")
        score = 55
        result["details"] = f"Audio check error: {e}"
    
    result["score"] = score
    print(f"Audio Watermark Score: {score}")
    return result

'''

if "def check_c2pa_credentials" not in content:
    content = content.replace("def preprocess_video_for_speed(video_path):", new_funcs + "\n\n" + "def preprocess_video_for_speed(video_path):")

# 2. Update analyze_video
v_find = '''        texture_scores = fixed_texture_analysis(frames_orig)
        module7_score = fixed_metadata_analysis(temp_filepath, duration, width, height, fps, total_frames)

        # Determine if face is present across frames'''

v_repl = '''        texture_scores = fixed_texture_analysis(frames_orig)
        module7_score = fixed_metadata_analysis(temp_filepath, duration, width, height, fps, total_frames)

        # C2PA check
        c2pa_result = check_c2pa_credentials(temp_filepath)
        c2pa_score = c2pa_result["score"]

        # SynthID pixel watermark check
        synthid_result = detect_synthid_watermark(frames_orig)
        synthid_score = synthid_result["score"]

        # Audio watermark check
        audio_result = detect_audio_watermark(temp_filepath)
        audio_score = audio_result["score"]

        # Combined watermark score
        watermark_score = round(
            c2pa_score * 0.40 +
            synthid_score * 0.40 +
            audio_score * 0.20
        )

        # Determine if face is present across frames'''

content = content.replace(v_find, v_repl)

# Update analyze_video final_score formula
v_final_find = '''            final_score = (
                module1_score * 0.70 +
                module2_score * 0.15 +
                module5_score * 0.10 +
                module7_score * 0.05
            )'''

v_final_repl = '''            final_score = (
                module1_score * 0.56 +
                module2_score * 0.12 +
                module5_score * 0.08 +
                module7_score * 0.04 +
                watermark_score * 0.20
            )'''

content = content.replace(v_final_find, v_final_repl)

v_final_noface_find = '''            final_score = (
                module1_score * 0.70 +
                module5_score * 0.10 +
                module7_score * 0.05
            ) / 0.85'''

v_final_noface_repl = '''            final_score = (
                module1_score * 0.56 +
                module5_score * 0.08 +
                module7_score * 0.04 +
                watermark_score * 0.17
            ) / 0.85'''

content = content.replace(v_final_noface_find, v_final_noface_repl)

# Update analyze_video modules list
v_mod_find = '''                {
                    "name": "Metadata Forensics",
                    "score": int(module7_score),
                    "weight": "3%",
                    "description": "Verified file headers, FPS consistency, and resolution properties."
                }
            ],'''

v_mod_repl = '''                {
                    "name": "Metadata Forensics",
                    "score": int(module7_score),
                    "weight": "2%",
                    "description": "Verified file headers, FPS consistency, and resolution properties."
                },
                {
                    "name": "C2PA Content Credentials",
                    "score": int(c2pa_score),
                    "weight": "8%",
                    "description": c2pa_result.get("details", "Cryptographic content history checked")
                },
                {
                    "name": "SynthID Watermark Detection",
                    "score": int(synthid_score),
                    "weight": "8%",
                    "description": synthid_result.get("verdict", "Pixel-level AI watermark patterns scanned")
                },
                {
                    "name": "Audio Watermark Analysis",
                    "score": int(audio_score),
                    "weight": "4%",
                    "description": audio_result.get("details", "Audio frequency watermark patterns checked")
                }
            ],'''

# Also fix the weight of M1 in video if needed? The user only specified "Only ADD 3 new entries". 
content = content.replace(v_mod_find, v_mod_repl)

# 3. Update analyze_fast
f_find = '''        # ---- MODULE 9: Video Generation Artifact Detection (new) ----
        flicker_score = detect_video_generation_artifacts(frames)

        if has_face:'''

f_repl = '''        # ---- MODULE 9: Video Generation Artifact Detection (new) ----
        flicker_score = detect_video_generation_artifacts(frames)

        # C2PA check
        c2pa_result = check_c2pa_credentials(temp_path)
        c2pa_score = c2pa_result["score"]

        # SynthID pixel watermark check
        synthid_result = detect_synthid_watermark(frames)
        synthid_score = synthid_result["score"]

        # Audio watermark check
        audio_result = detect_audio_watermark(temp_path)
        audio_score = audio_result["score"]

        # Combined watermark score
        watermark_score = round(
            c2pa_score * 0.40 +
            synthid_score * 0.40 +
            audio_score * 0.20
        )

        if has_face:'''

content = content.replace(f_find, f_repl)

f_final_find = '''            final = round(
                ai_score       * 0.30 +
                ai_human_score * 0.25 +
                flicker_score  * 0.10 +
                meta           * 0.15 +
                # fill remaining 20% equally with existing checks
                min(ai_score, ai_human_score) * 0.20  # conservative blend
            )'''

f_final_repl = '''            final = round(
                ai_score       * 0.24 +
                ai_human_score * 0.20 +
                flicker_score  * 0.08 +
                meta           * 0.12 +
                min(ai_score, ai_human_score) * 0.16 +
                watermark_score * 0.20
            )'''

content = content.replace(f_final_find, f_final_repl)

f_final_noface_find = '''            final = round(
                ai_score * 0.80 +
                meta     * 0.20
            )'''

f_final_noface_repl = '''            final = round(
                ai_score * 0.64 +
                meta     * 0.16 +
                watermark_score * 0.20
            )'''

content = content.replace(f_final_noface_find, f_final_noface_repl)

f_mod_find = '''                {"name": "Metadata Forensics",
                 "score": int(meta),
                 "weight": "15%" if has_face else "20%",
                 "description": "File properties, FPS standard, and file size checked"}
            ]'''

f_mod_repl = '''                {"name": "Metadata Forensics",
                 "score": int(meta),
                 "weight": "12%" if has_face else "16%",
                 "description": "File properties, FPS standard, and file size checked"},
                {"name": "C2PA Content Credentials",
                 "score": int(c2pa_score),
                 "weight": "8%",
                 "description": c2pa_result.get("details", "Cryptographic content history checked")},
                {"name": "SynthID Watermark Detection",
                 "score": int(synthid_score),
                 "weight": "8%",
                 "description": synthid_result.get("verdict", "Pixel-level AI watermark patterns scanned")},
                {"name": "Audio Watermark Analysis",
                 "score": int(audio_score),
                 "weight": "4%",
                 "description": audio_result.get("details", "Audio frequency watermark patterns checked")}
            ]'''

content = content.replace(f_mod_find, f_mod_repl)

# 4. Update analyze_image
i_find = '''        # MODULE 6: Metadata EXIF Analysis (weight: 0.03)
        module6_score, has_exif = analyze_exif(pil_img)

        # Dynamic weight redistribution if face is not present
        weights = {
            "model": 0.40,
            "ela": 0.25,
            "noise": 0.15,
            "face": 0.10,
            "color": 0.07,
            "exif": 0.03
        }'''

i_repl = '''        # MODULE 6: Metadata EXIF Analysis (weight: 0.03)
        module6_score, has_exif = analyze_exif(pil_img)

        # C2PA check on image
        c2pa_result = check_c2pa_credentials(temp_filepath)
        c2pa_score = c2pa_result["score"]

        # SynthID check on single image
        synthid_result = detect_synthid_watermark([img_np])
        synthid_score = synthid_result["score"]

        # Combined (no audio for images)
        watermark_score = round(
            c2pa_score * 0.55 +
            synthid_score * 0.45
        )

        # Dynamic weight redistribution if face is not present
        weights = {
            "model": 0.32,
            "ela": 0.20,
            "noise": 0.12,
            "face": 0.08,
            "color": 0.05,
            "exif": 0.03,
            "watermark": 0.20
        }'''

content = content.replace(i_find, i_repl)

i_final_find = '''        # Calculate final ensembled score
        final_score = (
            module1_score * weights["model"] +
            module2_score * weights["ela"] +
            module3_score * weights["noise"] +
            (module4_score * weights["face"] if face_score is not None else 0.0) +
            module5_score * weights["color"] +
            module6_score * weights["exif"]
        )
        final_score = float(np.clip(final_score, 0.0, 100.0))'''

i_final_repl = '''        # Calculate final ensembled score
        final_score = (
            module1_score * weights["model"] +
            module2_score * weights["ela"] +
            module3_score * weights["noise"] +
            (module4_score * weights["face"] if face_score is not None else 0.0) +
            module5_score * weights["color"] +
            module6_score * weights["exif"] +
            watermark_score * weights.get("watermark", 0.0)
        )
        final_score = float(np.clip(final_score, 0.0, 100.0))
        
        if c2pa_result.get("ai_tool_logged"):
            final_score = min(final_score, 30.0)
            watermark_score = 10

        if c2pa_result.get("camera_signature"):
            final_score = max(final_score, 75.0)
            watermark_score = 92'''

content = content.replace(i_final_find, i_final_repl)

i_mod_find = '''                {
                    "name": "Metadata EXIF Analysis",
                    "score": int(module6_score),
                    "weight": f"{int(weights['exif']*100)}%",
                    "description": "Verified camera make, model, datetime, and GPS metadata records."
                }
            ],'''

i_mod_repl = '''                {
                    "name": "Metadata EXIF Analysis",
                    "score": int(module6_score),
                    "weight": f"{int(weights['exif']*100)}%",
                    "description": "Verified camera make, model, datetime, and GPS metadata records."
                },
                {
                    "name": "C2PA Content Credentials",
                    "score": int(c2pa_score),
                    "weight": f"{int(weights.get('watermark', 0.20)*100*0.55)}%",
                    "description": c2pa_result.get("details", "Cryptographic content history checked")
                },
                {
                    "name": "SynthID Watermark Detection",
                    "score": int(synthid_score),
                    "weight": f"{int(weights.get('watermark', 0.20)*100*0.45)}%",
                    "description": synthid_result.get("verdict", "Pixel-level AI watermark patterns scanned")
                }
            ],'''

content = content.replace(i_mod_find, i_mod_repl)

with open(app_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch applied successfully.")
