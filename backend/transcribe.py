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

    words = hinglish_text.split()

    MAX_WORDS = 7

    if len(words) <= MAX_WORDS:
        result_segments.append({
            "start": segment.start,
            "end": segment.end,
            "text": original_text,
            "hinglishText": hinglish_text
        })
    else:
        total_duration = segment.end - segment.start

        chunks = [
            words[i:i + MAX_WORDS]
            for i in range(0, len(words), MAX_WORDS)
        ]

        chunk_duration = total_duration / len(chunks)

        for idx, chunk in enumerate(chunks):
            result_segments.append({
                "start": segment.start + idx * chunk_duration,
                "end": segment.start + (idx + 1) * chunk_duration,
                "text": " ".join(chunk),
                "hinglishText": " ".join(chunk)
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