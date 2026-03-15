import json
import os
import datetime

MEMORY_FILE=os.path.expanduser("~/GENO_OPERATOR/memory_db.json")

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return {}
    with open(MEMORY_FILE,"r") as f:
        return json.load(f)

def save_memory(data):
    with open(MEMORY_FILE,"w") as f:
        json.dump(data,f,indent=2)

def update_knowledge(topic,new_info):

    data=load_memory()

    if topic not in data:
        data[topic]=new_info
        print("NEW KNOWLEDGE ADDED:",topic)

    else:

        old=data[topic]

        if len(new_info) > len(old):

            data[topic]=new_info
            print("OLD KNOWLEDGE REPLACED:",topic)

        else:

            print("OLD KNOWLEDGE KEPT:",topic)

    save_memory(data)

def main():

    print("\n=== GENO ADAPTIVE BRAIN ===")
    print("TIME:",datetime.datetime.now())

    topic=input("TOPIC: ")
    info=input("NEW INFORMATION: ")

    update_knowledge(topic,info)

if __name__=="__main__":
    main()
