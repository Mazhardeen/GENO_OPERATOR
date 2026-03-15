import os
import json
import datetime

BASE=os.path.expanduser("~/GENO_OPERATOR")
MEM=BASE+"/learning_memory.json"

def save_learning(cmd):

    words=cmd.lower().split()

    data={}

    if os.path.exists(MEM):

        with open(MEM) as f:
            data=json.load(f)

    for w in words:

        data[w]=data.get(w,0)+1

    with open(MEM,"w") as f:
        json.dump(data,f,indent=4)

def run():

    print("\n=== GENO BASIC LEARNING BRAIN ===\n")

    cmd=input("جینو: بوس مجھے کچھ سکھائیں: ")

    save_learning(cmd)

    print("\nTIME:",datetime.datetime.now())
    print("LEARNED FROM:",cmd)

    print("\nSTATUS: MEMORY UPDATED")

if __name__=="__main__":
    run()
