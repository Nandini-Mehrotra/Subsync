from faster_whisper import WhisperModel
import sys

audio_file = sys.argv[1]

# Load model
model = WhisperModel("base")

# Transcribe audio
segments, info = model.transcribe(audio_file)

full_text = ""

# Join text
for segment in segments:
    full_text += segment.text + " "

print(full_text)