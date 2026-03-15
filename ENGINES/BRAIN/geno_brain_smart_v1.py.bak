class SmartBrain:
    def decide(self,cmd):
        c=cmd.lower()
        if "video" in c: return "video_engine"
        if "memory" in c: return "memory_engine"
        if "status" in c: return "system_status"
        return "unknown"
def verify():
    b=SmartBrain()
    r=b.decide("video edit")
    print("SMART:",r)
if __name__=="__main__":
    verify()
