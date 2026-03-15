import os
import json
import datetime

BASE=os.path.expanduser("~/GENO_OPERATOR")
MEM=BASE+"/learning_memory.json"

def analyze():

    if not os.path.exists(MEM):
        print("No learning data found")
        return

    with open(MEM) as f:
        data=json.load(f)

    sorted_words=sorted(data.items(),key=lambda x:x[1],reverse=True)

    print("\n=== GENO SMART LEARNING ANALYSIS ===\n")

    for w,c in sorted_words[:10]:
        print(w,"→",c)

def run():

    print("\n=== GENO SMART LEARNING BRAIN ===\n")

    analyze()

    print("\nTIME:",datetime.datetime.now())
    print("\nSTATUS: PATTERN ANALYSIS COMPLETE")

if __name__=="__main__":
    run()
