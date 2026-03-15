import os,subprocess,datetime

BASE=os.path.expanduser("~/GENO_OPERATOR")

BRAIN=os.path.join(BASE,"ENGINES","BRAIN","geno_brain_engine_v1.py")
HEALTH=os.path.join(BASE,"CORE","geno_master_health_engine_v2.py")
REPAIR=os.path.join(BASE,"CORE","geno_repair_network_engine_v1.py")
AUDIT=os.path.join(BASE,"CORE","geno_full_system_audit_engine_v2.py")
CEO=os.path.join(BASE,"CORE","geno_ceo_engine_v1.py")

def decide(cmd):

    cmd=cmd.lower()

    if "health" in cmd or "system" in cmd:
        return HEALTH

    if "repair" in cmd or "fix" in cmd:
        return REPAIR

    if "audit" in cmd or "check" in cmd:
        return AUDIT

    if "company" in cmd or "workers" in cmd:
        return CEO

    return None


def run():

    print("\n=== GENO GENERAL COMMAND CENTER ===\n")
    print("TIME:",datetime.datetime.now(),"\n")

    while True:

        cmd=input("جینو حکم دیں: ")

        if cmd=="exit":
            print("جینو بند ہو رہا ہے")
            break

        engine=decide(cmd)

        if engine:
            subprocess.run(["python3",engine])
        else:
            print("حکم سمجھ نہیں آیا")

if __name__=="__main__":
    run()
