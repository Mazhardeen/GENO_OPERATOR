import datetime
import subprocess
import os

ROOT = os.path.expanduser("~/GENO_OPERATOR")

def run_engine(path):

    try:
        subprocess.run(["python3", path])
    except Exception as e:
        print("ENGINE ERROR:", e)

def orchestrate(command):

    print("\n=== GENO ORCHESTRATOR ===")
    print("COMMAND:",command)
    print("TIME:",datetime.datetime.now())

    cmd = command.lower()

    if "interest" in cmd:
        run_engine(os.path.join(ROOT,"ENGINES/BRAIN/geno_interest_brain_engine_v1.py"))

    elif "factory" in cmd or "create engine" in cmd:
        run_engine(os.path.join(ROOT,"FACTORY/geno_factory_architect_engine_v1.py"))

    elif "brain" in cmd:
        run_engine(os.path.join(ROOT,"ENGINES/BRAIN/geno_brain_engine_v2.py"))

    else:
        print("GENO: بوس ابھی اس حکم کیلئے انجن موجود نہیں")

def main():

    print("=== GENO ORCHESTRATOR ENGINE V2 ===")

    command = input("جینو: بوس حکم دیں: ")

    orchestrate(command)

if __name__=="__main__":
    main()
