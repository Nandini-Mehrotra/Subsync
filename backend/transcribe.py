from faster_whisper import WhisperModel
import sys
import json

audio_file = sys.argv[1]

model = WhisperModel("base")

segments, info = model.transcribe(audio_file)

result = []

for segment in segments:
    result.append({
        "start": segment.start,
        "end": segment.end,
        "text": segment.text.strip()
    })

print(json.dumps(result, ensure_ascii=False))