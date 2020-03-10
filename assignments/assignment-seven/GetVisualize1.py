import json
import requests
import sys

try:
    with open('repo_list.json', 'r') as openfile: 
        repos = json.load(openfile)
except:
    request = requests.get('http://czi2.osshealth.io:5153/api/unstable/repos') 
    repos = request.json()

activeRepo = None
for repo in repos:
    if repo['commits_all_time'] != None:
        if activeRepo is None:
            activeRepo = repo
        if repo['commits_all_time'] > activeRepo['commits_all_time']:
            activeRepo = repo

repo_id = str(activeRepo['repo_id'])

url = 'http://czi2.osshealth.io:5153/api/unstable/repos/' + repo_id +'/code-changes-lines'
request = requests.get(url) 
lineChangeLog = request.json()

visualize_data = [activeRepo, lineChangeLog]

visual_json = json.dumps(visualize_data, indent = 4)

with open("visualize1.json", "w") as outfile: 
    outfile.write(visual_json)