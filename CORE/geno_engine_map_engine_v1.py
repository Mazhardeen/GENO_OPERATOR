import os
import json
import datetime

GENERATED_PATH = os.path.expanduser("~/GENO_OPERATOR/GENERATED")
MAP_FILE = os.path.expanduser("~/GENO_OPERATOR/engine_map.json")

def load_map():
    if not os.path.exists(MAP_FILE):
        return {"engines":[]}
    with open(MAP_FILE,"r") as f:
        return json.load(f)

def save_map(data):
    with open(MAP_FILE,"w") as f:
        json.dump(data,f,indent=2)

def scan_engines():

    print("\n=== GENO ENGINE MAP SYSTEM ===")
    print("TIME:",datetime.datetime.now())

    data = load_map()

    if not os.path.exists(GENERATED_PATH):
        print("NO ENGINE DIRECTORY")
        return

    files=os.listdir(GENERATED_PATH)

    for f in files:

        if f.endswith(".py"):

            engine_path=os.path.join(GENERATED_PATH,f)

            exists=False

            for e in data["engines"]:
                if e["name"]==f:
                    exists=True
                    break

            if not exists:

                engine_info={
                    "name":f,
                    "path":engine_path,
                    "created":str(datetime.datetime.now()),
                    "category":"generated"
                }

                data["engines"].append(engine_info)

                print("ENGINE ADDED TO MAP:",f)

    save_map(data)

    print("\nTOTAL ENGINES:",len(data["engines"]))

def main():
    scan_engines()

if __name__=="__main__":
    main()
