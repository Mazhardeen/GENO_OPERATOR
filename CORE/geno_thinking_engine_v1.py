import json
import os
import datetime

INTEREST_FILE = os.path.expanduser("~/GENO_OPERATOR/learning_memory.json")

def load_interests():

    if not os.path.exists(INTEREST_FILE):
        return {}

    with open(INTEREST_FILE,"r") as f:
        return json.load(f)

def suggest_engine(interests):

    print("\n=== GENO THINKING ENGINE ===")
    print("TIME:",datetime.datetime.now())

    if not interests:
        print("NO INTEREST DATA")
        return

    top_topic=max(interests,key=interests.get)

    print("TOP INTEREST:",top_topic)

    if top_topic=="goat":
        suggestion="geno_goat_management_engine"

    elif top_topic=="youtube":
        suggestion="geno_youtube_growth_engine"

    elif top_topic=="video":
        suggestion="geno_video_editor_engine"

    else:
        suggestion="geno_general_ai_engine"

    print("SUGGESTED ENGINE:",suggestion)

    return suggestion

def main():

    interests=load_interests()

    engine=suggest_engine(interests)

    if engine:
        print("\nGENO: بوس میں نیا انجن بنانے کی تجویز دے رہا ہوں")
        print("ENGINE IDEA:",engine)

if __name__=="__main__":
    main()
