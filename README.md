# Continous Learning Service

This file describes how to deploy the service on Firebase. For usage instructions, see separate [usage document](./Usage.md) 

## Deployment
### Setup Firebase project
https://firebase.google.com/
### Make database rules
```json
{
  "rules": {
    "diary_meta_tags": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {  
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('diary_meta_tags').val() == true"
        }
      }
    },
    "diary_meta_ratings": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {  
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('diary_meta_ratings').val() == true"
        }
      }
    },      
    "diary_bodies": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {  
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('diary_body').val() == true"
        }
      }
    },
    "missions": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('mission').val() == true"
        }
      }
    },
    "plans": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('plan').val() == true"
        }
      }
    },
    "principles": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {  
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('principles').val() == true",
        }
      }
    },      
    "principle_events": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('principles').val() == true",
        }
      }
    },
    "bio_events": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('bio_events').val() == true",
        }
      }
    },
    "bio_event_events": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('bio_events').val() == true",
        }
      }
    },      
    "bio_skills": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('bio_skills').val() == true",
        }
      }
    },
    "bio_skill_events": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".indexOn": "date",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('privacy_settings').child($uid).child($bid).child('bio_skills').val() == true",
        }
      }
    },        
    "privacy_settings": {
      "$uid": {
        ".write": "$uid == auth.uid",
        "$bid": {
      		".read": "$uid == auth.uid || root.child('public_branches').child($bid).exists()"
        }
      }
    },
    "public_branches": {
      ".read": "true",
      "$bid": {
        ".write": "root.child('branches').child(auth.uid).child($bid).exists()",
      }
    },
    "branches": {
      "$uid": {
        ".write": "$uid == auth.uid",
      	".read": "$uid == auth.uid",
      }
    },
  }
}
```

### Deploy the service
https://firebase.google.com/docs/hosting/deploying