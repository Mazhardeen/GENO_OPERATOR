import os
import json
import datetime
import subprocess

BASE=os.path.expanduser("~/GENO_OPERATOR")
MAP_FILE=os.path.join(BASE,"engine_map.json")
INTEREST_FILE=os.path.join(BASE,"learning_memory.json")

def load_map():
    if not os.path.exists(MAP_FILE):
        return {"engines":[]}
    with open(MAP_FILE,"r") as f:
        return json.load(f)

def load_interests():
    if not os.path.exists(INTEREST_FILE):
        return {}
    with open(INTEREST_FILE,"r") as f:
        return json.load(f)

def system_scan():

    print("\n=== GENO MASTER MIND ===")
    print("TIME:",datetime.datetime.now())

    data=load_map()

    print("TOTAL ENGINES:",len(data["engines"]))

    for e in data["engines"]:
        print("ENGINE:",e["name"])

def analyze_interests():

    interests=load_interests()

    if not interests:
        return None

    top=max(interests,key=interests.get)

    print("TOP INTEREST:",top)

    return top

def build_engine(name,purpose):

    subprocess.run(
        ["python3",
         os.path.join(BASE,"FACTORY","geno_super_factory_engine_v1.py")],
        input=f"{name}\n{purpose}\n",
        text=True
    )

def decide_action(topic):

    if topic=="goat":

        engine="geno_goat_management_engine"
        purpose="goat farm management system"

        print("MASTER DECISION: build",engine)

        build_engine(engine,purpose)

    elif topic=="youtube":

        engine="geno_youtube_growth_engine"
        purpose="youtube channel growth automation"

        print("MASTER DECISION: build",engine)

        build_engine(engine,purpose)

    else:

        print("MASTER DECISION: monitor system")

def main():

    system_scan()

    topic=analyze_interests()

    if topic:
        decide_action(topic)

if __name__=="__main__":
    main()
