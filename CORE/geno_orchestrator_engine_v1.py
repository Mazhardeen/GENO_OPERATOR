import datetime
import subprocess

def run_engine(path):

    try:
        subprocess.run(["python3", path])
    except:
        print("ENGINE ERROR")

def orchestrate(command):

    print("\n=== GENO ORCHESTRATOR ===")
    print("COMMAND:",command)
    print("TIME:",datetime.datetime.now())

    cmd=command.lower()

    if "interest" in cmd:
        run_engine("~/GENO_OPERATOR/ENGINES/BRAIN/geno_interest_brain_engine_v1.py")

    elif "factory" in cmd or "create engine" in cmd:
        run_engine("~/GENO_OPERATOR/FACTORY/geno_factory_architect_engine_v1.py")

    elif "brain" in cmd:
        run_engine("~/GENO_OPERATOR/ENGINES/BRAIN/geno_brain_engine_v2.py")

    else:
        print("GENO: بوس ابھی اس حکم کیلئے انجن موجود نہیں")

def main():

    print("=== GENO ORCHESTRATOR ENGINE ===")

    command=input("جینو: بوس حکم دیں: ")

    orchestrate(command)

if __name__=="__main__":
    main()
