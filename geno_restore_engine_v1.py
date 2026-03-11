import os
import shutil

CLOUD_FOLDER=os.path.expanduser("~/storage/shared/GENO_CLOUD_MAIN")
LOCAL_FOLDER=os.path.expanduser("~/GENO_OPERATOR")

def restore():
    print("GENO restore starting...")

    if not os.path.exists(CLOUD_FOLDER):
        print("Cloud backup not found")
        return

    files=os.listdir(CLOUD_FOLDER)

    for f in files:
        src=os.path.join(CLOUD_FOLDER,f)
        dst=os.path.join(LOCAL_FOLDER,f)

        if os.path.isfile(src):
            shutil.copy2(src,dst)
            print("Restored:",f)

    print("GENO restore complete")

if __name__=="__main__":
    restore()
