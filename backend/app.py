import os
import subprocess
import whisper
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

# Step 1: Extract Audio from Video
def extract_audio(video_path, audio_path):
    command = [
        "ffmpeg", "-i", video_path, "-vn", "-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", audio_path
    ]
    subprocess.run(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Audio extracted: {audio_path}")

# Step 2: Transcribe Audio using Whisper
def transcribe_audio(audio_path):
    model = whisper.load_model("base")  # Choose 'small', 'medium', or 'large' for better accuracy
    result = model.transcribe(audio_path)
    print("Transcription completed.")
    return result["text"]

# Step 3: Generate Summary & Title with LLM
def generate_summary_and_title(text):
    model_name = "google/flan-t5-large"
    
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
    summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
    
    summary_prompt = f"Summarize this video transcript: {text[:4000]}"
    title_prompt = f"Suggest an engaging YouTube title for this transcript: {text[:4000]}"
    
    summary = summarizer(summary_prompt, max_length=200, num_return_sequences=1)[0]["summary_text"]
    title = summarizer(title_prompt, max_length=60, num_return_sequences=1)[0]["summary_text"]
    
    return summary, title

if __name__ == "__main__":
    video_path = "Windsurf.mp4"
    audio_path = "audio.wav"
    
    # extract_audio(video_path, audio_path)
    transcript = transcribe_audio(audio_path)
    summary, title = generate_summary_and_title(transcript)

    print("Video Title:", title)
    print("Video Summary:", summary)
