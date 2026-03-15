import requests
import datetime
import json
import os

MEMORY_FILE = os.path.expanduser("~/GENO_OPERATOR/memory_db.json")

def save_memory(topic, info):

    if os.path.exists(MEMORY_FILE):
        with open(MEMORY_FILE,"r") as f:
            data=json.load(f)
    else:
        data={}

    if topic not in data:
        data[topic]=[]

    data[topic].append({
        "info":info,
        "time":str(datetime.datetime.now())
    })

    with open(MEMORY_FILE,"w") as f:
        json.dump(data,f,indent=2)

def fetch_online(topic):

    print("\n=== GENO ONLINE KNOWLEDGE ===")
    print("SEARCHING:",topic)
    print("TIME:",datetime.datetime.now())

    try:

        url=f"https://api.duckduckgo.com/?q={topic}&format=json"

        r=requests.get(url)

        data=r.json()

        abstract=data.get("Abstract","")

        if abstract:

            print("\nNEW KNOWLEDGE FOUND")
            print(abstract[:200])

            save_memory(topic,abstract)

        else:

            print("\nNO DIRECT ABSTRACT FOUND")

    except Exception as e:

        print("INTERNET ERROR:",e)

def main():

    topic=input("جینو: بوس کیا سیکھوں؟ ")

    fetch_online(topic)

if __name__=="__main__":
    main()
