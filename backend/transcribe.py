from faster_whisper import WhisperModel
from indic_transliteration import sanscript
from indic_transliteration.sanscript import transliterate
import sys
import json

audio_file = sys.argv[1]

# Load model
model = WhisperModel("small", compute_type="int8")

# Transcribe audio/video
segments, info = model.transcribe(
    audio_file,
    language="hi",
    task="transcribe"
)

result_segments = []
full_text = ""
full_hinglish = ""

for segment in segments:
    original_text = segment.text.strip()

    # Convert Hindi script to Hinglish
    try:
        hinglish_text = transliterate(
            original_text,
            sanscript.DEVANAGARI,
            sanscript.HK
        )
    except Exception:
        hinglish_text = original_text

    result_segments.append({
        "start": segment.start,
        "end": segment.end,
        "text": original_text,
        "hinglishText": hinglish_text
    })

    full_text += original_text + " "
    full_hinglish += hinglish_text + " "

output = {
    "transcriptText": full_text.strip(),
    "hinglishText": full_hinglish.strip(),
    "segments": result_segments
}

sys.stdout.reconfigure(encoding="utf-8")
print(json.dumps(output, ensure_ascii=False))