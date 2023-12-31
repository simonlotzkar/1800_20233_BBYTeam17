/* --------------------------------------------------------
CONTRIBUTORS: SimonLotzkar, CarlyOrr("SRC" comment where contributed)
DESCRIPTION: contains functions needed on most pages
-------------------------------------------------------- */

// EFFECTS: Attempts to log out user.
function logout() {
  firebase.auth().signOut()
    .then(
      () => {
        // Successfully logged out user
        window.location.assign("index.html"); 
      }
    )
    .catch(
      (error) => {
        ("ERROR: could not log out user: " + error);
      }
    );
}

// EFFECTS: Returns a string that represents whether the given boolean
//          represents a working ice cream machine or a broken one.
function generateWorkingString(boolean) {
  if (boolean) {
    return "Working";
  } else {
    return "Broken"
  }
}

// EFFECTS: Returns a string that represents the number of:
//              - days,
//              - hours, and
//              - minutes
//          between the server's current timestamp and the given timestamp. 
//          Excludes units that have a value of 0 and prints the unit name 
//          without a pluralization if the value is 1. 
//          Exceptions: 
//              - If the time delta is less than 1 minute, returns "just now".
//              - If the day delta is greater than 28, returns whether 
//                the timestamp was one of the following (in order):
//                  - more than 1 year ago,
//                  - last year, 
//                  - more than 1 month ago, or
//                  - last month.
function generateTimeSinceString(timestamp) {
  let timeSinceString = "";
  let now = firebase.firestore.Timestamp.now();

  // Delta variables
  let millisDifference = now.toMillis() - timestamp.toMillis();

  // Seconds check
  if ((millisDifference / 1000) < 60) {
    return "now";
  }

  let daysSince = Math.floor(millisDifference / 1000 / 60 / 60 / 24);
  millisDifference -= daysSince * 24 * 60 * 60 * 1000;

  let hoursSince = Math.floor(millisDifference / 1000 / 60 / 60);
  millisDifference -= hoursSince * 60 * 60 * 1000;

  let minutesSince = Math.floor(millisDifference / 1000 / 60);

  // Year Check (returns "last year" or "more than 1 year" ago)
  let thenYear = timestamp.toDate().getFullYear();
  let nowYear = now.toDate().getFullYear();
  if ((thenYear != nowYear) && (daysSince > 28)) {
    if (thenYear == (nowYear - 1)) {
      return "last year";
    } else {
      return "more than 1 year ago";
    }
  }

  // Month Check (returns "last month" or "more than 1 month ago")
  let thenMonth = timestamp.toDate().getMonth();
  let nowMonth = now.toDate().getMonth();
  if ((thenMonth != nowMonth) && (daysSince > 28)) {
    if (thenMonth == (nowMonth - 1)) {
      return "last month";
    } else {
      return "more than 1 month ago";
    }
  }

  // Day check (returns "1 day", "# days", or does nothing)
  let daysSinceString = daysSince;
  if (daysSince != 0) {
    if (daysSince == 1) {
      daysSinceString += " day, ";
    } else {
      daysSinceString +=" days, ";
    }
    timeSinceString += daysSinceString;
  }

  // Hours check (returns "1 hr", "# hrs", or does nothing)
  let hoursSinceString = hoursSince;
  if (hoursSince != 0) {
      if (hoursSince == 1) {
        hoursSinceString += " hr, ";
      } else {
        hoursSinceString +=" hrs, ";
      }
      timeSinceString += hoursSinceString;
  }

  // Minute check (returns "# min" or does nothing)
  let minutesSinceString = minutesSince;
  if (minutesSince != 0) {
      timeSinceString += minutesSinceString + " min";
  }

  return timeSinceString;
}

// EFFECTS: Returns a descriptive string of the given timestamp
function generateDateString(timestamp) {
  let dateString = "";
  let timestampDate = timestamp.toDate();

  let year = timestampDate.getUTCFullYear();
  let month = "January";
  switch (timestampDate.getUTCMonth()) {
    case 1:
      month = "February";
      break;
    case 2:
      month = "March";
      break;
    case 3:
      month = "April";
      break;
    case 4:
      month = "May";
      break;
    case 5:
      month = "June";
      break;
    case 6:
      month = "July";
      break;
    case 7:
      month = "August";
      break;
    case 8:
      month = "September";
      break;
    case 9:
      month = "October";
      break;
    case 10:
      month = "November";
      break;
    case 11:
      month = "December";
      break;
  }

  let date = timestampDate.getUTCDate();

  let day = "Sunday";
  switch (timestampDate.getUTCDay()) {
    case 1:
      day = "Monday";
      break;
    case 2:
      day = "Tuesday";
      break;
    case 3:
      day = "Wednesday";
      break;
    case 4:
      day = "Thursday";
      break;
    case 5:
      day = "Friday";
      break;
    case 6:
      day = "Saturday";
      break;
  }

  let minute = timestampDate.getUTCMinutes();
  if (minute < 10) {
    minute = "0" + minute;
  }

  let hour = timestampDate.getUTCHours();
  if (hour > 12) {
    hour -= 12;
    minute += "PM";
  } else {
    minute += "AM";
  }

  dateString = 
    day + ", " 
    + month + " " 
    + date + " " 
    + year + " at "
    + hour + ":"
    + minute + " (GMT)";

  return dateString;
}

// EFFECTS: Attempts to submit an update, first checks to see if it has been greater
//          than 60 seconds since the last. If it has, or the user hasn't submitted
//          yet, the update is submitted and the time is logged for future calculations.
function trySubmitUpdate(status, restaurantID) {
  let nowTime = firebase.firestore.Timestamp.now().toDate().getTime();
  let secsToWait = 60;
  let secsRemaining = 0;

  let canUpdateTime = localStorage.getItem("canUpdateTime");
  if (canUpdateTime) {
    secsRemaining = (canUpdateTime - nowTime) / 1000;
  }

  if (!firebase.auth().currentUser.emailVerified) {
    alert("Verify your email before submitting an update.")
  } else if (secsRemaining <= 0) {
    let newCanUpdateTime = nowTime + (secsToWait * 1000);
    submitUpdate(status, restaurantID);
    localStorage.setItem("canUpdateTime", newCanUpdateTime);
  } else {
    alert("You must wait: " + (secsRemaining) + "s before submitting again!");
  }
}

// REQUIRES: A user to be logged in.
// EFFECTS: Adds an update to the given restaurant with the given status value.
//          Sets the user name to the name of the currently logged-in user and the
//          date to the current time.
//          Also changes the restaurant's date and status fields to
//          reflect the new update.
function submitUpdate(status, restaurantID) {
  let currentUser = firebase.auth().currentUser;
  let now = firebase.firestore.Timestamp.now();

  // Get currently logged in user from users collection
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {    
      // get restaurant's updates subcollection
      db.collection("restaurants/" + restaurantID + "/updates")
        // ...add new update
        .add({
          status: status,
          userID: doc.id,
          dateSubmitted: now,
          upvotes: 0,
          downvotes: 0,
          upvoterIDList: [],
          downvoterIDList: [],
        })
        // ...add new update to user's reference updates subcollection
        .then(docRef => {
          let refUpdates = db.collection("users/" + doc.id + "/refUpdates");
          
          // update user's reference updates
          refUpdates.add({
            restaurantID: restaurantID,
            updateID: docRef.id,
            date: now,
          });

          checkAndRewardUpdateAchievements(currentUser, refUpdates, status);
        })
        // Catch and alert errors
        .catch((error) => {
            alert("Error adding update: ", error);
        });
    });
}

// EFFECTS: checks to see if user earned an achievement after updating and awards if so
function checkAndRewardUpdateAchievements(currentUser, refUpdates, status) {
  let updatesCount = 0;
  let locationIDArray = [];
  
  // count user's ref update collection size
  refUpdates.get().then(refUpdatesCollection => {
    refUpdatesCollection.forEach(refUpdateDoc => {
      let rid = refUpdateDoc.data().restaurantID;
      if (!locationIDArray.includes(rid)) {
        locationIDArray[locationIDArray.length + 1] = rid;
      }
      updatesCount += 1;
    });

    checkAndRewardFirstSubmission(currentUser);

    // if (prevStatus != status) {
    //   checkAndRewardDetective(currentUser);
    // }
    
    if (updatesCount >= 10) {
      checkAndRewardUpdaterBronze(currentUser);
    } else if (updatesCount >= 25) {
      checkAndRewardUpdaterSilver(currentUser);
    } else if (updatesCount >= 50) {
      checkAndRewardUpdaterGold(currentUser);
    }

    if (locationIDArray.length >= 10) {
      checkAndRewardExplorerBronze(currentUser);
    } else if (locationIDArray.length >= 25) {
      checkAndRewardExplorerSilver(currentUser);
    } else if (locationIDArray.length >= 50) {
      checkAndRewardExplorerGold(currentUser);
    }
  });      
}

// // EFFECTS: Adds the detective achievement to the user if they don't already have it
// function checkAndRewardDetective(currentUser) {
//   let achievementID = "jATdpe84S44xsU8MJhCt";
//   let isUnlocked = false;
//   db.collection("users").doc(currentUser.uid).get()
//     .then(doc => {
//       doc.data().achievements.forEach(achievementRef => {
//         if (achievementRef.id == achievementID) {
//           isUnlocked = true;
//         }
//       });
//       if (!isUnlocked) {
//         db.collection("users").doc(currentUser.uid).update({
//           achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
//         });
//         alert("Achievement Awarded! View \"Detective\" in your profile for details.")
//       }
//     });
// }

// EFFECTS: Adds the first submission achievement to the user if they don't already have it
function checkAndRewardFirstSubmission(currentUser) {
  let achievementID = "nfqjZlO2Sg59PHrlDuUO";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"First Submission\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the updater-bronze achievement to the user if they don't already have it
function checkAndRewardUpdaterBronze(currentUser) {
  let achievementID = "yOMHZvh3PGUYwF4q9nEl";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Updater (Bronze)\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the updater-silver achievement to the user if they don't already have it
function checkAndRewardUpdaterSilver(currentUser) {
  let achievementID = "W3xreGfL5O5sfOiy7wtI";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Updater (Silver)\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the updater-gold achievement to the user if they don't already have it
function checkAndRewardUpdaterGold(currentUser) {
  let achievementID = "y1oo3TupIdFsoE439cso";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Updater (Gold)\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the explorer-bronze achievement to the user if they don't already have it
function checkAndRewardExplorerBronze(currentUser) {
  let achievementID = "2W9kMxhD5dzMfo0aOvH0";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Explorer (Bronze)\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the explorer-silver achievement to the user if they don't already have it
function checkAndRewardUpdaterSilver(currentUser) {
  let achievementID = "ihNpUFdLb83f7bNiICU9";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Updater (Silver)\" in your profile for details.")
      }
    });
}

// EFFECTS: Adds the explorer-gold achievement to the user if they don't already have it
function checkAndRewardUpdaterGold(currentUser) {
  let achievementID = "u9BvfwQzHqvU5E235gst";
  let isUnlocked = false;
  db.collection("users").doc(currentUser.uid).get()
    .then(doc => {
      doc.data().achievements.forEach(achievementRef => {
        if (achievementRef.id == achievementID) {
          isUnlocked = true;
        }
      });
      if (!isUnlocked) {
        db.collection("users").doc(currentUser.uid).update({
          achievements: fv.arrayUnion(db.doc("customizations/" + achievementID)),
        });
        alert("Achievement Awarded! View \"Explorer (Gold)\" in your profile for details.")
      }
    });
}

// SRC: 1800-TechTips/B04 (By CarlyOrr)
// REQUIRES: given coordinates are in latitude/longitude format
// EFFECTS: returns the distance between the given coordinate pairs
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

// SRC: 1800-TechTips/B04 (By CarlyOrr)
// EFFECTS: returns the given degree converted to radius format
function deg2rad(deg) {
  return deg * (Math.PI / 180)
}

// EFFECTS: returns a promise of the user's geolocation
function getLocationFromUser() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation
          .getCurrentPosition((position) => {
            resolve(position);
          }, 
          reject);
    } else {
      reject("Geolocation not supported by this browser!");
    }
  });
}

// EFFECTS: Prompts the user for confirmation, on success removes the given update from
//          its restaurant's updates and then removes it from its owner's refUpdates.
function deleteUpdate(restaurantID, updateID) {
  if (confirm("Are you sure you want to delete this update?")) {
      // get this update and delete it
      db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).get()
        .then(updateDoc => {
          let userID = updateDoc.data().userID;
          // get this update and delete it
          db.collection("restaurants/" + restaurantID + "/updates").doc(updateID).delete()
            .then(() => {
              // console.log("Deleted updateID=" + updateID);
            })
            .catch((error) => {
              console.log(error)
            });

          // get the user that posted this update's refUpdates subcollection, then iterate through it and where 
          // the refUpdate has the same updateID as this update, delete that refUpdate from the subcollection
          db.collection("users/" + userID + "/refUpdates").get()
            .then(refUpdatesCollection => {
              refUpdatesCollection.forEach(refUpdateDoc => {
                if (refUpdateDoc.data().updateID == updateID) {
                  db.collection("users/" + userID + "/refUpdates").doc(refUpdateDoc.id).delete()
                    .then(() => {
                        // console.log("Deleted refUpdateID=" + refUpdateDoc.id);
                    })
                    .catch((error) => {
                        console.log(error)
                    });
                  }
              });
            });
        });    
  }
}

// EFFECTS: if user is logged in:
//          show all submit update options, hide all log in prompts
//          if user is logged out:
//          hide all submit update options, show all log in prompts
function displayOrHideAllSubmitUpdates() {
  const nodeList_submitUpdate = document.querySelectorAll(".card-restaurant-submitUpdate");
  const nodeList_promptLogIn = document.querySelectorAll(".card-restaurant-promptLogIn");
  
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // User is signed in.
        for (let i = 0; i < nodeList_submitUpdate.length; i++) {
          nodeList_submitUpdate[i].classList.add("d-block");
          nodeList_submitUpdate[i].classList.remove("d-none");
        }
    
        for (let i = 0; i < nodeList_promptLogIn.length; i++) {
          nodeList_promptLogIn[i].classList.add("d-none");
          nodeList_promptLogIn[i].classList.remove("d-block");
        }
    } else {
        // No user is signed in.
        for (let i = 0; i < nodeList_submitUpdate.length; i++) {
          nodeList_submitUpdate[i].classList.add("d-none");
          nodeList_submitUpdate[i].classList.remove("d-block");
        }
    
        for (let i = 0; i < nodeList_promptLogIn.length; i++) {
          nodeList_promptLogIn[i].classList.add("d-block");
          nodeList_promptLogIn[i].classList.remove("d-none");
        }
    }
  });
}

// MODIFIES: insertElement
// EFFECTS: tries to populate the closest N (amountToPopulate) restaurant cards
//          as children in the given element (insertElement). also filters only
//          restaurants address/postalcode/city matching given param.
//          if it fails, displays without sorting by distance.
async function populateClosestRestaurants(insertElement, amountToPopulate, filterParam) {
  let userLocation;
  
  try {
      userLocation = await getLocationFromUser();
      populateClosestRestaurantsWithLocation(insertElement, amountToPopulate, filterParam, userLocation);
  } catch (error) {
      alert("Geolocation denied by browser!" + error);
      populateClosestRestaurantsWithoutLocation(insertElement, amountToPopulate, filterParam);
  }
}

// MODIFIES: insertElement
// EFFECTS: populates N (amountToPopulate) restaurant cards sorted by distance
//          as children in the given element (insertElement). also filters only
//          restaurants address/postalcode/city matching given param
function populateClosestRestaurantsWithLocation(insertElement, amountToPopulate, filterParam, userLocation) {
  insertElement.innerHTML = "";

  // get restaurant collection
  db.collection("restaurants").get()
    .then(restaurantCollection => {
        let unsortedMap = new Map();
        
        // create map with each restaurant and its distance 
        restaurantCollection.forEach(doc => { 
            let distance = getDistanceFromLatLonInKm(
                userLocation.coords.latitude, 
                userLocation.coords.longitude, 
                doc.data().location.latitude, 
                doc.data().location.longitude);
            unsortedMap.set(doc, distance);
        });    
        
        // create new map that is a sorted version of the previous (unsorted) one
        let sortedMap = new Map([...unsortedMap].sort((a,b) => a[1] - b[1]));

        // add restaurant card for each key-value pair in the map
        sortedMap.forEach(function(value, key) {
          let doc = key;
          let distance = value;

          let restaurantID = doc.id;
          let distanceString = distance.toFixed(2) + "km away";
          let address = doc.data().address;
          let city = doc.data().city;
          let postalCode = doc.data().postalCode;
          let containsFilterParam = (address.toLowerCase().includes(filterParam) 
            || city.toLowerCase().includes(filterParam) 
            || postalCode.toLowerCase().includes(filterParam));

          if (containsFilterParam) {       
            let cardTemplate = document.getElementById("restaurantCardTemplate");
            let newcard = cardTemplate.content.cloneNode(true);

            newcard.querySelector(".card-restaurant-address").innerHTML = address;
            newcard.querySelector(".card-restaurant-id").innerHTML = restaurantID;
            newcard.querySelector(".card-restaurant-city").innerHTML = city;
            newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
            newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
            newcard.querySelector("a").href = "eachRestaurant.html?docID=" + doc.id;
            
            newcard.querySelector(".brokenBtn").addEventListener("click", function() {
              trySubmitUpdate(false, doc.id);
            });

            newcard.querySelector(".workingBtn").addEventListener("click", function() {
              trySubmitUpdate(true, doc.id);
            });

            if (insertElement.children.length < amountToPopulate) {
                insertElement.appendChild(newcard);
                displayOrHideAllSubmitUpdates();
                listenAndPopulateAllRestaurantsLastUpdatedStatus(restaurantID);
                let numRestaurantsDisplayed = document.getElementById("restaurants-go-here").childElementCount;
                document.getElementById("currentNumberOfRestaurantsInDisplay").innerHTML = numRestaurantsDisplayed;
                document.getElementById("maxNumberOfRestaurantsToDisplay").innerHTML = amountToPopulate;
            }
          }
        });
    });
}

// MODIFIES: insertElement
// EFFECTS: populates N (amountToPopulate) randomly sorted restaurant cards
//          as children in the given element (insertElement). also filters only
//          restaurants address/postalcode/city matching given param
function populateClosestRestaurantsWithoutLocation(insertElement, amountToPopulate, filterParam, userLocation) {
  insertElement.innerHTML = "";

  // get restaurant collection
  db.collection("restaurants").get()
    .then(restaurantCollection => {
        restaurantCollection.forEach(doc => { 
          
          let restaurantID = doc.id;
          let distanceString = "unknown km away";
          let address = doc.data().address;
          let city = doc.data().city;
          let postalCode = doc.data().postalCode;
          let containsFilterParam = (address.toLowerCase().includes(filterParam) 
            || city.toLowerCase().includes(filterParam) 
            || postalCode.toLowerCase().includes(filterParam));

          if (containsFilterParam) {       
            let cardTemplate = document.getElementById("restaurantCardTemplate");
            let newcard = cardTemplate.content.cloneNode(true);

            newcard.querySelector(".card-restaurant-address").innerHTML = address;
            newcard.querySelector(".card-restaurant-id").innerHTML = restaurantID;
            newcard.querySelector(".card-restaurant-city").innerHTML = city;
            newcard.querySelector(".card-restaurant-postalCode").innerHTML = postalCode;
            newcard.querySelector(".card-restaurant-distance").innerHTML = distanceString;
            newcard.querySelector("a").href = "eachRestaurant.html?docID=" + doc.id;
            
            newcard.querySelector(".brokenBtn").addEventListener("click", function() {
              trySubmitUpdate(false, doc.id);
            });

            newcard.querySelector(".workingBtn").addEventListener("click", function() {
              trySubmitUpdate(true, doc.id);
            });

            if (insertElement.children.length < amountToPopulate) {
                insertElement.appendChild(newcard);
                displayOrHideAllSubmitUpdates();
                listenAndPopulateAllRestaurantsLastUpdatedStatus(restaurantID);
                let numRestaurantsDisplayed = document.getElementById("restaurants-go-here").childElementCount;
                document.getElementById("currentNumberOfRestaurantsInDisplay").innerHTML = numRestaurantsDisplayed;
                document.getElementById("maxNumberOfRestaurantsToDisplay").innerHTML = amountToPopulate;
            }
          }
        });
    });
}

// EFFECTS: Listens to the given restaurant's updates subcollection for any changes,
//          then reassesses which update was latest and repopulates the restaurant
//          card's elements depending on the new latest status.
function listenAndPopulateAllRestaurantsLastUpdatedStatus(rid) {
  db.collection("restaurants/" + rid + "/updates").orderBy("dateSubmitted", "asc")
    .onSnapshot(querySnapshot => {
        querySnapshot.forEach(doc => {
          let dateSubmitted = doc.data().dateSubmitted;
          let status = doc.data().status;

          let nodeList = document.querySelectorAll(".card-restaurant-id");

          for (i = 0; i < nodeList.length; i++) {
            if (nodeList[i].innerHTML == rid) {
              let parentCardNode = nodeList[i].parentElement.parentElement.parentElement;
              parentCardNode.querySelector(".card-restaurant-status").innerHTML = generateWorkingString(status);
              parentCardNode.querySelector(".card-restaurant-dateUpdatedDelta").innerHTML = generateTimeSinceString(dateSubmitted);
              parentCardNode.querySelector(".card-restaurant-dateUpdated").innerHTML = generateDateString(dateSubmitted);

              if (status) {
                parentCardNode.classList.remove("bg-warning");
                parentCardNode.classList.add("bg-success");
                parentCardNode.classList.remove("bg-danger");
              } else if (!status) {
                parentCardNode.classList.remove("bg-warning");
                parentCardNode.classList.remove("bg-success");
                parentCardNode.classList.add("bg-danger");
              }
            }
          }
        });
    });
}