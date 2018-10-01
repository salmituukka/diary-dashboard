import { db } from '../firebase';
import moment from 'moment';
import map from 'lodash/map';

export const uploadDiary = (userId, branchId, diaryFile) => {
  var reader = new FileReader();
  const fileOpenPromise = new Promise(function(resolve, reject) {
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };      
  });
  reader.readAsText(diaryFile);
  return fileOpenPromise.then(rawText => {
    const textParts = rawText.split("---")
    if (textParts.length > 2) {
      const metadataRaw = textParts[1];
      const keyValues = metadataRaw.match(/(\w+):(.*)/g)
      const metaRatings = keyValues.reduce(((accum, keyVal) => {
        const keyValSeparated = keyVal.split(':'); 
        const valueCommentSeparated = keyValSeparated[1].split('[');
        return {...accum,
          [keyValSeparated[0].trim()]: valueCommentSeparated[0].trim()
        }
      }),{});
      metaRatings.comments = keyValues.reduce(((accum, keyVal) => {
        const keyValSeparated = keyVal.split(':');
        const valueCommentSeparated = keyValSeparated[1].split('[');
        if (valueCommentSeparated.length > 1) {
          const comment = valueCommentSeparated[1].split(']');
          return {...accum,
            [keyValSeparated[0].trim()]: comment[0].trim()
          }          
        } else {
          return accum;
        }
      }),{});
      const tagsRaw = map(metadataRaw.match(/#\w(\w|-|_|\s)*/g), tag => tag.slice(1));
      const planTagsRaw = map(metadataRaw.match(/@\w(\w|-|_|\s)*/g), tag => tag.slice(1).trim());
      const metaTags = {
        tags: map(tagsRaw, x=> x.replace(/\n|\r/g,'')),
        planTags: map(planTagsRaw, x=> x.replace(/\n|\r/g,'')),
        date: moment(metaRatings.date, "DD.MM.YYYY").format('YYYYMMDD')
      };
      metaRatings['date'] = metaTags['date'];
      const body = {
        'text': textParts[2], 
        'date': metaRatings['date']
      };
      return Promise.all(
        [db.putMetaRatings(userId, branchId, metaRatings), db.putMetaTags(userId, branchId, metaTags), db.putNotes(userId, branchId, body)]
      );
    } else {
      return Promise.reject('Invalid document');
    }        
  });
};

export const uploadPlan = (userId, branchId, planFile) => {
  var reader = new FileReader();
  const fileOpenPromise = new Promise(function(resolve, reject) {
    reader.onload = function(event) {
      resolve(event.target.result);
    };
    reader.onerror = function(error) {
      reject(error);
    };      
  });
  reader.readAsText(planFile);
  return fileOpenPromise.then(rawText => {
    const plan = {
      date: moment().format('YYYYMMDD'),
      plan: rawText
    };
    return db.putPlan(userId, branchId, plan)
  });
};

export const uploadBio = (userId, branchId, bioSkillFile) => {
  var reader = new FileReader();
  const fileOpenPromise = new Promise(function(resolve, reject) {
    reader.onload = function(event) {
      try {
        const jsonData = JSON.parse(event.target.result);
        resolve(jsonData);
      } catch(error) {
        reject(error);
      }
    };
    reader.onerror = function(error) {
      reject(error);
    };      
  });
  reader.readAsText(bioSkillFile);
  return fileOpenPromise.then(jsonData => {
    var promise = Promise.resolve();
    if (!!jsonData.skills) {
      const skills = jsonData.skills;
      promise = promise.then(() => db.deleteLatestBioSkills(userId, branchId).then(() => {
        const date = moment().format('YYYYMMDD');
        const skillPostPromises = skills.map(skill => {
          skill['date'] = date;
          return db.postLatestBioSkill(userId, branchId, skill);
        });
        return Promise.all(skillPostPromises);
      }));
    }
    if (!!jsonData.events) {
      const events = jsonData.events;
      promise = promise.then(() => db.deleteLatestBioEvents(userId, branchId).then(() => {
        const date = moment().format('YYYYMMDD');
        const eventPostPromises = events.map(event => {
          event['date'] = date;
          return db.postLatestBioEvent(userId, branchId, event);
        });
        return Promise.all(eventPostPromises);
      }));
    }
    return promise;
  });
};