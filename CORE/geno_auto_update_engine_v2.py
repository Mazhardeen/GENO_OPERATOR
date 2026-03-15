import time
import json
import os
import datetime
import requests

INTEREST_FILE = os.path.expanduser("~/GENO_OPERATOR/learning_memory.json")

def load_interests():

    if not os.path.exists(INTEREST_FILE):
        return []

    with open(INTEREST_FILE,"r") as f:
        data=json.load(f)

    return list(data.keys())

def fetch(topic):

    print("\nSEARCHING:",topic)

    try:

        url=f"https://api.duckduckgo.com/?q={topic}&format=json"

        r=requests.get(url)

        data=r.json()

        abstract=data.get("Abstract","")

        if abstract:

            print("FOUND:",abstract[:120])

    except:

        print("internet error")

def run_update():

    print("\n=== GENO AUTO UPDATE ENGINE ===")
    print("TIME:",datetime.datetime.now())

    interests=load_interests()

    if not interests:
        print("NO INTEREST DATA")
        return

    for topic in interests:

        fetch(topic)

def main():

    print("GENO: بوس میں ہر 6 گھنٹے بعد خود سیکھوں گا")

    while True:

        run_update()

        print("\nNEXT UPDATE IN 6 HOURS")

        time.sleep(21600)

if __name__=="__main__":
    main()
