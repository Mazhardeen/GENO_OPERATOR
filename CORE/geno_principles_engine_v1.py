import datetime

# خطرناک الفاظ
BLOCKED_COMMANDS = [
    "delete system",
    "remove core",
    "rm -rf",
    "format disk",
    "delete geno",
    "shutdown system"
]

# محفوظ انجن
PROTECTED_ENGINES = [
    "geno_core_engine",
    "geno_factory",
    "geno_orchestrator",
    "geno_brain"
]

def check_command(command):

    cmd = command.lower()

    for bad in BLOCKED_COMMANDS:
        if bad in cmd:
            return False, "COMMAND BLOCKED: اصولوں کے خلاف"

    return True, "COMMAND SAFE"


def protect_engine(engine_name):

    for e in PROTECTED_ENGINES:
        if e in engine_name:
            return False, "ENGINE PROTECTED"

    return True, "ENGINE SAFE"


def run():

    print("=== GENO PRINCIPLES ENGINE ===")

    command = input("جینو: بوس حکم دیں: ")

    safe, msg = check_command(command)

    print("\nTIME:", datetime.datetime.now())
    print("RESULT:", msg)

    if safe:
        print("STATUS: COMMAND APPROVED")
    else:
        print("STATUS: COMMAND REJECTED")


if __name__ == "__main__":
    run()
