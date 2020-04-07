import os
import sys

msg = sys.argv[1]
branch = sys.argv[2]

def run(cmd):
    print("running {}".format(cmd))

    os.system(cmd)

stage = "git stage ."
run(stage)

commit = "git commit -m \"{}\"".format(msg)
run(commit)

push = "git push -u origin {}".format(branch)
run(push)
