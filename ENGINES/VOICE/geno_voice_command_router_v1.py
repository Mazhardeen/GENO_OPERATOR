import speech_recognition as sr
import subprocess
import os

r = sr.Recognizer()

r.energy_threshold = 450
r.pause_threshold = 2
r.dynamic_energy_threshold = True

wake_words=["jino","geno","jeno","gino","jano"]

def listen():

    with sr.Microphone() as source:

        audio=r.listen(source)

    try:

        text=r.recognize_google(audio).lower()

        print("heard:",text)

        return text

    except:

        return ""

def run_engine(path):

    path=os.path.expanduser(path)

    if os.path.exists(path):

        subprocess.run(["python3",path])

def process(text):

    if "health" in text:

        print("\nGENO: سسٹم ہیلتھ چیک")
        run_engine("~/GENO_OPERATOR/CORE/geno_master_health_engine_v2.py")

    elif "repair" in text:

        print("\nGENO: ریپیئر نیٹ ورک چل رہا ہے")
        run_engine("~/GENO_OPERATOR/CORE/geno_repair_network_engine_v1.py")

    elif "workers" in text:

        print("\nGENO: ورکرس چیک")
        run_engine("~/GENO_OPERATOR/CORE/geno_repair_company_engine_v1.py")

    elif "scan" in text or "audit" in text:

        print("\nGENO: سسٹم آڈٹ")
        run_engine("~/GENO_OPERATOR/CORE/geno_full_system_audit_engine_v2.py")

    else:

        print("\nGENO: بوس حکم سمجھ نہیں آیا")

def main():

    print("\n=== GENO VOICE COMMAND ROUTER ===\n")

    print("GENO: بوس میں انتظار کر رہا ہوں...")

    while True:

        text=listen()

        for word in wake_words:

            if word in text:

                print("\nGENO: جی بوس")

                process(text)

                break

if __name__=="__main__":

    main()
