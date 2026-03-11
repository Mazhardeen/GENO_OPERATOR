import os
import uuid
import time
import json

dna_file="geno_dna.json"

def create_dna():
    dna={
        "GENO_ID":str(uuid.uuid4()),
        "DEVICE_ID":os.uname().nodename,
        "OWNER":"BOSS",
        "CREATED":time.ctime()
    }
    with open(dna_file,"w") as f:
        json.dump(dna,f,indent=4)

    print("GENO DNA CREATED")
    print(json.dumps(dna,indent=4))

if __name__=="__main__":
    if not os.path.exists(dna_file):
        create_dna()
    else:
        print("GENO DNA ALREADY EXISTS")
