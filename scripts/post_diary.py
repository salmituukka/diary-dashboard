import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
import argparse
import re
import datetime

def parse_diary(diary_file):
    with open(diary_file) as f:
        diary_raw = f.read()
    diary_parts = diary_raw.split("---")
    if len(diary_parts) > 2:
        metadata_raw = diary_parts[1]
        key_values = re.findall('(\w+):(.*)\n',metadata_raw)
        metadata = {}
        for key_value in key_values:
            metadata[key_value[0].strip()] = key_value[1].strip()
        tags_raw = metadata_raw.split("#")
        if (len(tags_raw) > 1):
            tags = list(map(lambda x: x.replace('\n',''), tags_raw[1:]))
            metadata['tags'] = tags
    metadata['date'] = datetime.datetime.strptime(metadata['date'], '%d.%m.%Y').strftime("%Y%m%d")
    return {'metadata': metadata, 'body': {'text': diary_parts[2], 'date': metadata['date']}}

def connect_to_firebase():
    cred = credentials.Certificate(os.path.join(os.environ.get('FIREBASE_CREDENTIALS', os.path.join(str(Path.home()),'.firebase')), 'dashboard.json'))
    if (not len(firebase_admin._apps)):
        firebase_admin.initialize_app(cred,  {'databaseURL': 'https://dashboard-1534764692814.firebaseio.com/'})    

def saveToFirebase(parsed_diary):
    # Save parsed markdown metas and markdown file itself to firebase
    root = db.reference('')
    root.child('diary_metas').child(parsed_diary['metadata']['date']).set(
      parsed_diary['metadata']
    )
    root.child('diary_bodies').child(parsed_diary['metadata']['date']).set(
      parsed_diary['body']
    )

# Instantiate the parser
parser = argparse.ArgumentParser(description='Optional app description')
parser.add_argument('diary_file', type=str, help='A required full name for diary file')
args = parser.parse_args()

connect_to_firebase()
if os.path.isdir(args.diary_file):
    for f in os.listdir(args.diary_file):
        print(f'Processing file {f}')
        parsed_diary = parse_diary(os.path.join(args.diary_file, f))
        saveToFirebase(parsed_diary)
else:
    parsed_diary = parse_diary(args.diary_file)
    saveToFirebase(parsed_diary)
