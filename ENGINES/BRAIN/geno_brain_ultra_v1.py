import json,os
MEM="geno_memory.json"
class UltraBrain:
    def decide(self,cmd):
        if os.path.exists(MEM):
            with open(MEM) as f:
                data=json.load(f)
                if data:
                    last=data[-1]["decision"]
                else:
                    last=None
        else:
            last=None
        if "video" in cmd: return "video_engine"
        if last: return last
        return "unknown"
def verify():
    u=UltraBrain()
    r=u.decide("video edit")
    print("ULTRA:",r)
if __name__=="__main__":
    verify()
