import os
import datetime

BASE_PATH = os.path.expanduser("~/GENO_OPERATOR/GENERATED")

def design_engine(name,purpose):

    print("\n=== GENO ENGINE DESIGN ===")
    print("ENGINE:",name)
    print("PURPOSE:",purpose)

    code=f'''
import datetime

def main():

    print("=== {name} ENGINE ===")
    print("PURPOSE: {purpose}")
    print("TIME:",datetime.datetime.now())

    print("STATUS: ENGINE RUNNING")

if __name__=="__main__":
    main()
'''

    return code

def create_engine(name,purpose):

    if not os.path.exists(BASE_PATH):
        os.makedirs(BASE_PATH)

    code=design_engine(name,purpose)

    file_path=os.path.join(BASE_PATH,f"{name}.py")

    with open(file_path,"w") as f:
        f.write(code)

    print("\nENGINE CREATED:",file_path)

def main():

    print("\n=== GENO SUPER FACTORY ===")

    name=input("ENGINE NAME: ")
    purpose=input("ENGINE PURPOSE: ")

    create_engine(name,purpose)

if __name__=="__main__":
    main()
