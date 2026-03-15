class SuperBrain:

    def decide(self,cmd):

        c=cmd.lower()

        plan=[]

        if "video" in c:
            plan.append("video_engine")

        if "youtube" in c:
            plan.append("seo_engine")
            plan.append("upload_engine")

        if not plan:
            plan.append("unknown")

        return plan


def verify():

    brain=SuperBrain()

    test="youtube video goat farming"

    result=brain.decide(test)

    print("SUPER:",result)


if __name__=="__main__":
    verify()
