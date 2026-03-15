import os
import json
import datetime

BASE=os.path.expanduser("~/GENO_OPERATOR")
MEM=BASE+"/learning_memory.json"

def analyze():

    if not os.path.exists(MEM):
        print("No learning memory found")
        return

    with open(MEM) as f:
        data=json.load(f)

    print("\n=== GENO ULTRA LEARNING ANALYSIS ===\n")

    sorted_words=sorted(data.items(),key=lambda x:x[1],reverse=True)

    for word,count in sorted_words:

        if count >= 2:

            print("High importance word:",word,"→",count)

        else:

            print("Low importance word:",word,"→",count)

def auto_learn():

    print("\nGENO: بوس میں ڈیٹا سے سیکھ رہا ہوں\n")

def run():

    print("\n=== GENO ULTRA LEARNING BRAIN ===\n")

    analyze()

    auto_learn()

    print("\nTIME:",datetime.datetime.now())

    print("\nSTATUS: ULTRA LEARNING COMPLETE")

if __name__=="__main__":
    run()
