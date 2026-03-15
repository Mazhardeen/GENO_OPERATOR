import json
import os
import datetime

MEMORY_FILE = os.path.expanduser("~/GENO_OPERATOR/memory_db.json")

def load_memory():

    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE,"r") as f:
            return json.load(f)

    return {}

def save_memory(data):

    with open(MEMORY_FILE,"w") as f:
        json.dump(data,f,indent=2)

def learn(topic,info):

    data = load_memory()

    if topic not in data:
        data[topic] = []

    data[topic].append({
        "info":info,
        "time":str(datetime.datetime.now())
    })

    save_memory(data)

    print("\n=== GENO MEMORY UPDATED ===")
    print("TOPIC:",topic)
    print("INFO:",info)

def show_memory():

    data = load_memory()

    print("\n=== GENO MEMORY DATABASE ===")

    for topic in data:
        print("\nTOPIC:",topic)

        for item in data[topic]:
            print("-",item["info"])

def main():

    print("=== GENO MEMORY ENGINE ===")

    command = input("جینو: بوس حکم دیں (learn/show): ")

    if command == "learn":

        topic = input("TOPIC: ")
        info = input("INFO: ")

        learn(topic,info)

    elif command == "show":

        show_memory()

    else:

        print("UNKNOWN COMMAND")

if __name__ == "__main__":
    main()
