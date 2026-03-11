import os, sys, json, socket, datetime
from google.cloud import storage

BASE = os.path.expanduser("~/GENO_OPERATOR")
KEY_PATH = os.path.join(BASE, "cloud_key.json")
DNA_PATH = os.path.join(BASE, "geno_dna.json")

def die(msg):
    print("ERROR:", msg); sys.exit(1)

if not os.path.exists(KEY_PATH):
    die("cloud_key.json not found in ~/GENO_OPERATOR")

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = KEY_PATH

try:
    client = storage.Client()
except Exception as e:
    die(f"Cloud client init failed: {e}")

project = client.project
bucket_name = f"geno-brain-{project}".lower()

# ensure bucket
bucket = client.bucket(bucket_name)
if not bucket.exists():
    bucket = client.create_bucket(bucket_name, location="US")
    print("Bucket created:", bucket_name)
else:
    print("Bucket exists:", bucket_name)

# ensure DNA
if not os.path.exists(DNA_PATH):
    dna = {
        "GENO_ID": "unknown",
        "DEVICE_ID": socket.gethostname(),
        "OWNER": "BOSS",
        "CREATED": datetime.datetime.utcnow().isoformat()+"Z"
    }
    with open(DNA_PATH,"w") as f: json.dump(dna,f,indent=2)

# upload DNA
blob = bucket.blob("dna/geno_dna.json")
blob.upload_from_filename(DNA_PATH)
print("Uploaded DNA to GCS")

# list test
print("Objects in bucket:")
for b in client.list_blobs(bucket_name):
    print("-", b.name)

# download test
local_test = os.path.join(BASE,"geno_dna_from_cloud.json")
bucket.blob("dna/geno_dna.json").download_to_filename(local_test)
print("Downloaded test file:", local_test)

print("\n=== GENO GCS CLOUD LINK ACTIVE ===")
