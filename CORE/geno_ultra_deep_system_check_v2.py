import os,ast,datetime

BASE=os.path.expanduser("~/GENO_OPERATOR")

def has_input(path):
    with open(path) as f:
        return "input(" in f.read()

ok=0
empty=0
broken=0
skip=0

print("\n=== GENO ULTRA DEEP CHECK V2 ===\n")
print("TIME:",datetime.datetime.now(),"\n")

for root,dirs,files in os.walk(BASE):

    for f in files:

        if f.endswith(".py") and "geno_" in f:

            path=os.path.join(root,f)

            if os.path.getsize(path)==0:
                print(f.ljust(40),"EMPTY")
                empty+=1
                continue

            try:
                with open(path) as code:
                    ast.parse(code.read())
            except:
                print(f.ljust(40),"BROKEN")
                broken+=1
                continue

            if has_input(path):
                print(f.ljust(40),"INTERACTIVE (SKIP EXEC)")
                skip+=1
            else:
                print(f.ljust(40),"OK")
                ok+=1

print("\nOK:",ok)
print("EMPTY:",empty)
print("BROKEN:",broken)
print("INTERACTIVE:",skip)
