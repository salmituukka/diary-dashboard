import { db } from './firebase';

export const getNotes = (userId, branchId, date, callback, errorCallback) => {
  return db.ref(`diary_bodies/${userId}/${branchId}/${date}`).once('value').then(callback).catch(errorCallback);
};

export const getMetaRatings = (userId, branchId, callback) => {
  const ref = db.ref(`diary_meta_ratings/${userId}/${branchId}`).orderByChild("date");
  ref.on("value", callback, function(error) {
    // Something went wrong.
    console.error(error);
  });
  return ref;
};

export const getMetaTags = (userId, branchId, callback) => {
  const ref = db.ref(`diary_meta_tags/${userId}/${branchId}`).orderByChild("date");
  ref.on("value", callback, function(error) {
    // Something went wrong.
    console.error(error);
  });
  return ref;
};


export const getMissions = (userId, branchId, callback) => {
  const ref = db.ref(`missions/${userId}/${branchId}`).orderByChild("date");
  ref.on("value", callback);
  return ref;
};

export const getPlans = (userId, branchId, callback) => {
  const ref = db.ref(`plans/${userId}/${branchId}`).orderByChild("date");
  ref.on("value", callback);
  return ref;
};

export const getDynamicsEvents = (userId, branchId, callback) => {
  const ref = db.ref(`dynamics_events/${userId}/${branchId}`).orderByChild("date");
  ref.on("value", callback);
  return ref;
};

export const getLatestDynamics = (userId, branchId, callback) => {
  const ref = db.ref(`dynamics/${userId}/${branchId}`);
  ref.on("value", callback);
  return ref;
};

export const getPrivacySettings = (userId, branchId, callback) => {
  const ref = db.ref(`privacy_settings/${userId}/${branchId}`);
  ref.on("value", callback);
  return ref;
};

export const getPublicBranches = (callback, errorCallback) => {
  const ref = db.ref(`public_branches`);
  ref.on("value", callback, errorCallback);
  return ref;
};

export const getBranches = (userId, callback, errorCallback) => {
  const ref = db.ref(`branches/${userId}`);
  ref.on("value", callback, errorCallback);
  return ref;
};

export const getLatestBioEvents = (userId, branchId, callback, errorCallback) => {
  const ref = db.ref(`bio_events/${userId}/${branchId}`);
  ref.on("value", callback, errorCallback);
  return ref;
};

export const getLatestBioSkills = (userId, branchId, callback, errorCallback) => {
  const ref = db.ref(`bio_skills/${userId}/${branchId}`);
  ref.on("value", callback, errorCallback);
  return ref;
};

export const getBioImage = (userId, branchId, callback, errorCallback) => {
  const ref = db.ref(`bio_images/${userId}/${branchId}`);
  ref.on("value", callback, errorCallback);
  return ref;
};


const put = (dbRef, data) => {
  return new Promise(function(resolve, reject) {
    dbRef.set(data, function(error) {
      if (error) {
        reject({message: `Saving to database failed due to ${error.message || error}`})
      } else {
        resolve()
      }
    });
  });
}

const remove = (dbRef) => {
  return new Promise(function(resolve, reject) {
    dbRef.remove(function(error) {
      if (error) {
        reject({message: `Deleting from database failed due to ${error.message || error}`})
      } else {
        resolve()
      }
    });
  });
}

const post = (dbRef, data) => {
  return new Promise(function(resolve, reject) {
    const id = dbRef.push(data, function(error) {
      if (error) {
        reject({message: `Saving to database failed due to ${error.message || error}`})
      } else {
        resolve(id);
      }
    });
  });
}

export const putMetaRatings = (userId, branchId, meta) => {
  return put(db.ref(`diary_meta_ratings/${userId}/${branchId}/${meta.date}`), meta);
};
export const deleteMetaRatings = (userId, branchId) => {
  return remove(db.ref(`diary_meta_ratings/${userId}/${branchId}`),);
};

export const putMetaTags = (userId, branchId, meta) => {
  return put(db.ref(`diary_meta_tags/${userId}/${branchId}/${meta.date}`), meta);
};
export const deleteMetaTags = (userId, branchId) => {
  return remove(db.ref(`diary_meta_tags/${userId}/${branchId}`));
};

export const putNotes = (userId, branchId, notes) => {
  return put(db.ref(`diary_bodies/${userId}/${branchId}/${notes.date}`), notes);
};
export const deleteNotes = (userId, branchId) => {
  return remove(db.ref(`diary_bodies/${userId}/${branchId}`));
};

export const putMission = (userId, branchId, mission) => {
  return put(db.ref(`missions/${userId}/${branchId}/${mission.date}`), mission);
};
export const deleteMissions = (userId, branchId) => {
  return remove(db.ref(`missions/${userId}/${branchId}`));
};

export const putPlan = (userId, branchId, plan) => {
  return put(db.ref(`plans/${userId}/${branchId}/${plan.date}`), plan);
};
export const deletePlans = (userId, branchId) => {
  return remove(db.ref(`plans/${userId}/${branchId}`));
};

export const postDynamicsEvent = (userId, branchId, id, dynamics) => {
  return post(db.ref(`dynamics_events/${userId}/${branchId}/${id}`), dynamics);
};
export const deleteDynamicsEvents = (userId, branchId) => {
  return remove(db.ref(`dynamics_events/${userId}/${branchId}`));
};

export const postLatestDynamics = (userId, branchId, dynamics) => {
  return post(db.ref(`dynamics/${userId}/${branchId}`), dynamics);
};
export const putLatestDynamics = (userId, branchId, id, dynamics) => {
  return put(db.ref(`dynamics/${userId}/${branchId}/${id}`), dynamics);
};
export const deleteLatestDynamics = (userId, branchId, id) => {
  return remove(db.ref(`dynamics/${userId}/${branchId}/${id}`));
};
export const deleteLatestDynamicss = (userId, branchId) => {
  return remove(db.ref(`dynamics/${userId}/${branchId}`));
};
export const deleteLatestBioSkill = (userId, branchId, id) => {
  return remove(db.ref(`bio_skills/${userId}/${branchId}/${id}`));
};
export const deleteLatestBioEvent = (userId, branchId, id) => {
  return remove(db.ref(`bio_events/${userId}/${branchId}/${id}`));
};
export const deleteLatestBioSkills = (userId, branchId) => {
  return remove(db.ref(`bio_skills/${userId}/${branchId}`));
};
export const deleteLatestBioEvents = (userId, branchId) => {
  return remove(db.ref(`bio_events/${userId}/${branchId}`));
};
export const deleteBioEventEvents = (userId, branchId) => {
  return remove(db.ref(`bio_event_events/${userId}/${branchId}`));
};
export const deleteBioSkillEvents = (userId, branchId) => {
  return remove(db.ref(`bio_skill_events/${userId}/${branchId}`));
};
export const deleteBioImage = (userId, branchId) => {
  return remove(db.ref(`bio_images/${userId}/${branchId}`));
};

export const putPrivacySettings = (userId, branchId, privacySettings) => {
  return put(db.ref(`privacy_settings/${userId}/${branchId}`), privacySettings);
};
export const deletePrivacySettings = (userId, branchId) => {
  return remove(db.ref(`privacy_settings/${userId}/${branchId}`));
};

export const putPublicBranch = (branchId, account) => {
  return put(db.ref(`public_branches/${branchId}`), account);
};
export const deletePublicBranch = (branchId) => {
  return new Promise(function(resolve, reject) {
    db.ref(`public_branches`).once('value', function(snapshot) {
      if (snapshot.hasChild(branchId)) {
        remove(db.ref(`public_branches/${branchId}`)).then(resolve).catch(reject)
      };
      resolve();
    });
  });
};

export const putBranch = (userId, branchId, branch) => 
  put(db.ref(`branches/${userId}/${branchId}`), branch);
export const postBranch = (userId, branch) => 
  post(db.ref(`branches/${userId}`), branch);
export const deleteBranch = (userId, branchId) => 
  Promise.all([
    deleteMetaRatings(userId, branchId),
    deleteMetaTags(userId, branchId),
    deleteNotes(userId, branchId),
    deleteMissions(userId, branchId),
    deletePlans(userId, branchId),
    deleteDynamicsEvents(userId, branchId),
    deleteLatestDynamicss(userId, branchId),
    deletePrivacySettings(userId, branchId),
    deletePublicBranch(branchId),
    deleteLatestBioSkills(userId, branchId),
    deleteLatestBioEvents(userId, branchId),
    deleteBioSkillEvents(userId, branchId),
    deleteBioEventEvents(userId, branchId),
    deleteBioImage(userId, branchId)    
  ]).then(() => 
    remove(db.ref(`branches/${userId}/${branchId}`)))

export const postLatestBioEvent = (userId, branchId, event) => 
  post(db.ref(`bio_events/${userId}/${branchId}`), event);
export const postBioEventEvent = (userId, branchId, eventId, event) => 
  post(db.ref(`bio_event_events/${userId}/${branchId}/${eventId}`), event);
export const putLatestBioEvent = (userId, branchId, eventId, event) => {
  return put(db.ref(`bio_events/${userId}/${branchId}/${eventId}`), event);
};  
export const postLatestBioSkill = (userId, branchId, skill) => 
  post(db.ref(`bio_skills/${userId}/${branchId}`),skill);
export const postBioSkillEvent = (userId, branchId, skillId, event) => 
  post(db.ref(`bio_skill_events/${userId}/${branchId}/${skillId}`), event);
export const putLatestBioSkill = (userId, branchId, skillId, skill) => {
  return put(db.ref(`bio_skills/${userId}/${branchId}/${skillId}`), skill);
};
export const putBioImage = (userId, branchId, image) => {
  return put(db.ref(`bio_images/${userId}/${branchId}`), image);
}; 