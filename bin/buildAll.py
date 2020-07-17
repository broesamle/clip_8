import os
import subprocess
oldwd = os.getcwd()
newwd = os.path.dirname(os.path.realpath(__file__))
print("changing working dir:", newwd)
os.chdir(newwd)
subprocess.run(["python", "buildTutorial.py"])
subprocess.run(["python", "svg2refsheet.py"])
subprocess.run(["python", "svg2demo.py"])
print("restoring working dir:", oldwd)
os.chdir(oldwd)
