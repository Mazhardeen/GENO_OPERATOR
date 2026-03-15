import os
import json
import datetime
import time
import subprocess
import requests

BASE_PATH=os.path.expanduser("~/GENO_OPERATOR")
GENERATED=os.path.join(BASE_PATH,"GENERATED")
MAP_FILE=os.path.join(BASE_PATH,"engine_map.json")

def load_map():
    if not os.path.exists(MAP_FILE):
        return {"engines":[]}
    with open(MAP_FILE,"r") as f:
        return json.load(f)

def internet_signal():
    try:
        r=requests.get("https://duckduckgo.com",timeout=5)
        return r.status_code==200
    except:
        return False

def scan_engine(file):
    try:
        r=subprocess.run(
            ["python3",file],
            capture_output=True,
            text=True,
            timeout=8
        )
        if r.returncode!=0:
            return False
        return True
    except:
        return False

def repair_engine(file):
    print("REPAIRING:",file)
    with open(file,"r") as f:
        code=f.read()

    if "if __name__" not in code:
        code+="\nif __name__=='__main__':\n    main()\n"

    with open(file,"w") as f:
        f.write(code)

def evolve_engine(file):

    print("EVOLVING:",file)

    with open(file,"r") as f:
        code=f.read()

    if "logging" not in code:
        code="import logging\n"+code

    with open(file,"w") as f:
        f.write(code)

def run_scan():

    print("\n=== GENO EVOLUTION ENGINE ===")
    print("TIME:",datetime.datetime.now())

    data=load_map()

    for e in data["engines"]:

        path=e["path"]

        ok=scan_engine(path)

        if not ok:
            print("ENGINE BROKEN:",e["name"])
            repair_engine(path)
        else:
            print("ENGINE OK:",e["name"])

        if internet_signal():
            evolve_engine(path)

def main():

    print("GENO: بوس میں مسلسل اپنے نظام کو بہتر کر رہا ہوں")

    while True:

        run_scan()

        print("\nNEXT EVOLUTION CYCLE IN 2 HOURS\n")

        time.sleep(7200)

if __name__=="__main__":
    main()
