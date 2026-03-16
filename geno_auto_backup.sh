#!/bin/bash

cd ~/GENO_OPERATOR

git add .

git commit -m "GENO AUTO CLOUD BACKUP $(date)" || true

git push origin main
