import datetime

def analyze_style(brand):

    brand=brand.lower()

    if "netflix" in brand:
        tone="cinematic storytelling"
        vibe="dramatic suspense emotional"
        audience="series lovers"

    elif "pepsi" in brand:
        tone="energetic youth"
        vibe="fun music friends excitement"
        audience="young audience"

    elif "nike" in brand:
        tone="motivational sports"
        vibe="power determination performance"
        audience="athletes"

    else:
        tone="modern brand tone"
        vibe="clean confident promotional"
        audience="general audience"

    return tone,vibe,audience


def run():

    print("\n=== GENO BRAND STYLE ANALYZER ===\n")

    brand=input("Brand name: ")
    product=input("Product or campaign: ")

    tone,vibe,audience=analyze_style(brand)

    print("\n=== BRAND STYLE PROFILE ===\n")

    print("Brand:",brand)
    print("Product:",product)

    print("\nTone:",tone)
    print("Brand vibe:",vibe)
    print("Audience:",audience)

    print("\nGENO: بوس اس انداز میں تخلیقی مواد بنایا جا سکتا ہے")

    print("\nTIME:",datetime.datetime.now())
    print("STATUS: STYLE ANALYSIS COMPLETE")


if __name__=="__main__":
    run()
