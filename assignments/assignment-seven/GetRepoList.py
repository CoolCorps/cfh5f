import requests
import json

request = requests.get('http://czi2.osshealth.io:5153/api/unstable/repos') 
data = request.json()
data_json = json.dumps(data, indent = 4)

with open("repo_list.json", "w") as outfile: 
    outfile.write(data_json)