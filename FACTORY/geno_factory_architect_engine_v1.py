import os
import datetime
import json

ROOT = os.path.expanduser("~/GENO_OPERATOR")
GENERATED = os.path.join(ROOT,"GENERATED")
REGISTRY = os.path.join(ROOT,"geno_engine_registry.json")

def create_engine(name, description):

    filename = f"{name}.py"
    path = os.path.join(GENERATED, filename)

    code = f'''
# AUTO GENERATED ENGINE
# ENGINE: {name}

import datetime

def run():
    print("=== {name} ENGINE ===")
    print("Description: {description}")
    print("TIME:", datetime.datetime.now())
    print("STATUS: ENGINE RUNNING")

if __name__ == "__main__":
    run()
'''

    with open(path,"w") as f:
        f.write(code)

    register_engine(name,path)

    print("ENGINE CREATED:",path)


def register_engine(name,path):

    if not os.path.exists(REGISTRY):
        data={"engines":[]}
    else:
        with open(REGISTRY) as f:
            data=json.load(f)

    data["engines"].append({
        "name":name,
        "path":path,
        "time":str(datetime.datetime.now())
    })

    with open(REGISTRY,"w") as f:
        json.dump(data,f,indent=2)


def main():

    print("=== GENO FACTORY ARCHITECT ===")

    name=input("ENGINE NAME: ")
    description=input("ENGINE PURPOSE: ")

    create_engine(name,description)


if __name__=="__main__":
    main()

