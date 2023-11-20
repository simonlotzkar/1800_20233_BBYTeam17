# McWorking

## 1. Project Description
Our team is developing "McWorking" to inform everyone of which McDonalds have broken ice cream machines before visiting by checking our site.

## 2. Names and Roles of Contributors 
* Simon Lotzkar - Project Manager, Lead Developer, Lead Designer
* Yongseong Choi - Designer
* Jacob Ardelean - Designer
	
## 3. Technologies and Resources Used
* HTML, CSS, JavaScript
* Bootstrap 5.0 (Frontend library)
* Firebase 8.0 (BAAS - Backend as a Service)

## 4. Complete setup/installion/usage
The app is ready straight away for viewing, but to submit data users must sign up for an account. This can be done from any page using the website's navbar.

## 5. Bugs, Limitations, and Security Risks
Here are some known bugs, limitations, and security risks:
* [Bug] When displaying last updated, adds a comma before "ago" (eg. 10 minutes, ago)
* [Bug] Decatrouble achievement awarded even after earning it
* [Bug] Restaurant displays in order of users then time, when it should just be based off time
* [Bug] Update log in profile page doesn't update when deleting updates
* [SecurityRisk] Github commits contain api key!!!
* [Limitation] Last updated and status don't change after deleting updates
    => replace lastUpdated and status fields with listeners that iterate through the update collection to determine last updated and status
* [Limitation] If the user denies or doesnt have geolocation, breaks app
    => display restaurants without distance information if the user's geolocation fails
* [Limitation] Each update has an upvote/downvote number field and an upvoterID/downvoterID array field, this is redundant.
    => can be simplified to just the latter. The score can be simply found by counting the number of voterIDs.
* [Limitation] Code is repeated for displaying restaurant cards 3 times: 1. for unfiltered display on catalog, 2. for filtered display on catalog, and 3. for short display on home
    => Refactor into single function with parameters that change behavior
* [Bug] New updates aren't shown on catalog or home page until refresh
    
## 5. Future Features
* Expanding from just icecream machines to all products (eg. smoothies)
* Expanding to other businesses (eg. TimHortons)
* Add google sign-up/log-in
* Anti-Spam
    * Email verification: only allow user to submit posts after verifying
    * Prevent users from adding updates within a time fram (eg 3min)
* Profile page
    * Display update owners' total score, average score, and number of posts
    * Add a preview 'dummy update' of what the user's posts will look like
* Add customization adder (like restaurant adder), accessible to admins only
	
## 6. Contents of Folder
Content of the project folder:

```
 Top level of project folder: 
├── .gitignore               # Git ignore file
├── about.html               # info page on app and authors
├── catalog.html             # restaurant browser page
├── eachRestaurant.html      # individual restaurant page
├── index.html               # landing page
├── profile.html             # user profile page
└── README.md
└── signUp.html              # signs up user with firebase auth
├── submitRestaurant.html    # page for adding new restaurants to database
├── template.html            # template for making pages

It has the following subfolders and files:
├── .git                     # Folder for git repo
├── images                   # Folder for image files
    /icecream-bw.png             # icecream logo (black and white)
    /icecream-green.png          # icecream logo (green)
    /icecream-red.png            # icecream logo (red)
├── scripts                  # Folder for java script files
    /catalog.js                  # runs catalog page
    /eachRestauarant.js          # runs restaurant page
    /firebaseAPI_TEAM17.js       # connects to firebase API
    /index.js                    # runs index (home) page
    /login.js                    # logs in user to firebase auth
    /profile.js                  # runs profile page
    /script.js                   # general functions used by multiple pages
    /signUp.js                   # runs sign up page
    /skeleton.js                 # loads content on all pages (footer, header, etc)
    /submitRestaurant.js         # runs submit restaurant page
├── styles                   # Folder for cascading style sheet files
    /style.css                   # styles all pages
├── text                     # Folder for insertable html files
    /footer.html                 # footer information
    /navAfterLogin.html          # navigation bar (after login)
    /navBeforeLogin.html         # navigation bar (after login)
    /restaurantCardTemplate.html # template for generating restaurant cards
```

## 7. Contents of Database
Content of the firestore database:

```
├── restaurants              # [collection] mcdonalds restaurant locations
    /ID                          
        .location                # [geopoint] lat and long coordinates
        .city                    # [string] name of location's city
        .dateUpdated             # [timestamp] last time an update was submitted
        .postalCode              # [string] name of location's postal code
        .status                  # [boolean] status of ice cream machine
        .address                 # [string] street number and name of location
        /updates                 # [subcollection] icecream machine status updates
            /ID
                .dateSubmitted       # [timestamp] when the update was submitted
                .upvotes             # [number] indicates a user thought the update was accurate
                .downvotes           # [number] indicates a user thought the update was inaccurate
                .status              # [boolean] status of icecream machine
                .userID              # [string] update owner's user id
                .upvoterIDList       # [string array] list of users' IDs that upvoted on the update
                .downvoterIDList     # [string array] list of users' IDs that downvoted on the update
├── users                    # [collection] user profiles
    /ID
        .dateSignUp              # [timestamp] when user signed-up
        .username                # [string] display name of user
        .avatar                  # [reference] points to the avatar the user has chosen
        .banner                  # [reference] points to the banner the user has chosen
        .achievements            # [reference array] each reference points to an achievement the user has unlocked
        .admin                   # [boolean] gives access to submit restaurant page and allows the user to delete anyone's updates
        /refUpdates              # [subcollection] points to an update the user submitted
            /ID
                .date                # [timestamp] when the update was submitted (this is needed for easy sequential ordering on profile page)
                .restaurantID        # [string] restaurant id where update was submitted
                .updateID            # [string] update's id
├── customizations           # [collection] profile customizations
    /ID
        .name                    # [string] name of the customization
        .type                    # [string] type of the customization (one of: avatar, banner, achievement)
        .imageURL                # [string] name of image in url
        .description             # [string] description of the customization
```

## 8. TODO List
Features and tasks needed to be done (in order of priority):
* Data entry
    * Add all avatars to the db
    * Add all banners to the db
    * Implement achievement unlock conditions:
        * changeUp              =not_started
        * detective             =not_started
        * explorer              =not_started
        * firstSubmission       =not_started
        * frigophilBoss         =not_started
        * qualityControl        =not_started
        * respectedFrigophil    =not_started
        * touchUp               =not_started
        * updater               =in_progress
        * voter                 =not_started
    * Add all McDonalds in vancouver to the db
    * About page content