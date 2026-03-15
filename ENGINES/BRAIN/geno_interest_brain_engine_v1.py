import json
import os
import datetime

MEMORY = os.path.expanduser("~/GENO_OPERATOR/learning_memory.json")

def load_memory():
    if os.path.exists(MEMORY):
        with open(MEMORY,"r") as f:
            return json.load(f)
    return {}

def save_memory(data):
    with open(MEMORY,"w") as f:
        json.dump(data,f,indent=2)

def learn(text):

    words=text.lower().split()

    data=load_memory()

    for w in words:
        data[w]=data.get(w,0)+1

    save_memory(data)

    print("\n=== GENO INTEREST LEARNING ===")
    print("INPUT:",text)

    sorted_words=sorted(data.items(),key=lambda x:x[1],reverse=True)

    print("\nTOP INTERESTS:")

    for w,c in sorted_words[:5]:
        print(w,"→",c)

    print("\nTIME:",datetime.datetime.now())


def main():

    text=input("جینو: بوس کیا سیکھوں؟ ")

    learn(text)


if __name__=="__main__":
    main()
