import os

def speak(text):
    os.system(f'termux-tts-speak "{text}"')

print("=== GENO JARVIS VOICE TEST ===")

while True:

    txt=input("بوس: ")

    if txt=="exit":
        break

    speak(txt)
