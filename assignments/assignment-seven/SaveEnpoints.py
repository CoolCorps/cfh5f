import json
import requests

urls = [
    'http://czi2.osshealth.io:5153/api/unstable/repos/26062/code-changes-lines',
    'http://czi2.osshealth.io:5153/api/unstable/repos/26006/contributors',
    'http://czi2.osshealth.io:5153/api/unstable/repos/25997/code-changes'
]

for i in range(3):
    request = requests.get(urls[i]) 
    data = request.json()
    data_json = json.dumps(data, indent = 4)
    with open('visualize_' + str(i + 1) + ".json", "w") as outfile: 
        outfile.write(data_json)