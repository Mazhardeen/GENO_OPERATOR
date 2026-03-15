#!/usr/bin/env python3
import json, os, datetime

ROOT = os.path.expanduser("~/GENO_OPERATOR")
REGISTRY = os.path.join(ROOT, "geno_engine_registry.json")
DNA = os.path.join(ROOT, "geno_dna.json")

def load_json(path, default):
    if os.path.exists(path):
        try:
            with open(path, "r") as f:
                return json.load(f)
        except:
            return default
    return default

def save_json(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

def ensure_files():
    if not os.path.exists(REGISTRY):
        save_json(REGISTRY, {"engines": []})
    if not os.path.exists(DNA):
        save_json(DNA, {"name":"GENO","created":str(datetime.datetime.now()),"version":"core_v1"})

def register_engine(name, path, category="CORE"):
    reg = load_json(REGISTRY, {"engines":[]})
    entry = {"name":name,"path":path,"category":category,"time":str(datetime.datetime.now())}
    if entry not in reg["engines"]:
        reg["engines"].append(entry)
        save_json(REGISTRY, reg)

def system_status():
    reg = load_json(REGISTRY, {"engines":[]})
    print("\n=== GENO CORE STATUS ===")
    print("TIME:", datetime.datetime.now())
    print("REGISTERED ENGINES:", len(reg["engines"]))
    for e in reg["engines"]:
        print("-", e["name"], "(", e["category"], ")")
    print("STATUS: CORE ACTIVE\n")

def main():
    ensure_files()
    register_engine("geno_core_engine_v1.py", __file__, "CORE")
    system_status()

if __name__ == "__main__":
    main()
