from llama_cpp import Llama
import subprocess

def extract_audio(video_path, audio_path):
    subprocess.run(["ffmpeg", "-i", video_path, "-q:a", "0", "-map", "a", audio_path])

extract_audio("windsurf.mov", "uploads/audio.wav")



llm = Llama(model_path="./mistral-7b-q4.gguf", n_ctx=2048)

with open("uploads/transcript.txt", "r") as f:
    transcript = f.read()

prompt = f"""
Transcript:
{transcript}

Generate:
1. A catchy YouTube video title (max 100 characters).
2. A short engaging description (max 100 words).
"""

output = llm(prompt)
print(output['choices'][0]['text'])
