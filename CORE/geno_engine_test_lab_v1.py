import os
import subprocess
import datetime
import json

GENERATED_PATH = os.path.expanduser("~/GENO_OPERATOR/GENERATED")
REGISTRY_FILE = os.path.expanduser("~/GENO_OPERATOR/engine_registry.json")

def load_registry():

    if not os.path.exists(REGISTRY_FILE):
        return {"engines":[]}

    with open(REGISTRY_FILE,"r") as f:
        return json.load(f)

def save_registry(data):

    with open(REGISTRY_FILE,"w") as f:
        json.dump(data,f,indent=2)

def test_engine(file_path):

    print("\n=== GENO TEST LAB ===")
    print("TESTING:",file_path)
    print("TIME:",datetime.datetime.now())

    try:

        result=subprocess.run(
            ["python3",file_path],
            capture_output=True,
            text=True,
            timeout=10
        )

        if result.returncode==0:

            print("RESULT: ENGINE PASSED")

            return True

        else:

            print("RESULT: ENGINE FAILED")

            return False

    except Exception as e:

        print("ERROR:",e)

        return False

def register_engine(file_path):

    registry=load_registry()

    engine_name=os.path.basename(file_path)

    if engine_name not in registry["engines"]:

        registry["engines"].append(engine_name)

        save_registry(registry)

        print("ENGINE REGISTERED:",engine_name)

def scan_and_test():

    if not os.path.exists(GENERATED_PATH):
        return

    files=os.listdir(GENERATED_PATH)

    for f in files:

        if f.endswith(".py"):

            path=os.path.join(GENERATED_PATH,f)

            if test_engine(path):

                register_engine(path)

def main():

    scan_and_test()

if __name__=="__main__":
    main()
