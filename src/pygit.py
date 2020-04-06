import os
import sys

msg = sys.argv[1]
branch = sys.argv[2]

cmd = "git stage .; git commit -m \"{}\"; git push -u origin {}".format(msg, branch)

print("running {}".format(cmd))

os.system(cmd)