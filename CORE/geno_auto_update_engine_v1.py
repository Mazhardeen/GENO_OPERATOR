import time
import datetime
import os

def run_update():

    print("\n=== GENO AUTO UPDATE ENGINE ===")
    print("TIME:", datetime.datetime.now())

    try:
        os.system("python3 ~/GENO_OPERATOR/CORE/geno_online_knowledge_engine_v1.py")
    except:
        print("ONLINE ENGINE ERROR")

    print("STATUS: UPDATE COMPLETE")

def main():

    print("GENO: بوس میں ہر 6 گھنٹے بعد خود اپڈیٹ کروں گا")

    while True:

        run_update()

        print("\nNEXT UPDATE IN 6 HOURS\n")

        time.sleep(21600)   # 6 hours

if __name__ == "__main__":
    main()
