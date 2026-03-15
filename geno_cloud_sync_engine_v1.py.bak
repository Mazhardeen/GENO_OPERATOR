import os
import shutil
import time

CLOUD_FOLDER = os.path.expanduser("~/storage/shared/GENO_CLOUD_MAIN")
LOCAL_FOLDER = os.path.expanduser("~/GENO_OPERATOR")

def sync_to_cloud():
    print("GENO starting cloud backup...")
    if not os.path.exists(CLOUD_FOLDER):
        os.makedirs(CLOUD_FOLDER)

    for f in os.listdir(LOCAL_FOLDER):
        if f.endswith(".py") or f.endswith(".json"):
            src=os.path.join(LOCAL_FOLDER,f)
            dst=os.path.join(CLOUD_FOLDER,f)
            shutil.copy2(src,dst)
            print("Synced:",f)

    print("GENO cloud backup complete")

if __name__=="__main__":
    sync_to_cloud()
