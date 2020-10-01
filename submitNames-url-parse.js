// Services
const httpService = require ('http');
const fileService = require ('fs');
const urlService  = require ('url-parse');

// Variables
const mainHTMLFileName = "submitNames-url-parse.html"
const usersListJsonFile = 'usersList.json';
const activePort = 8080;
let   requestCounter = 0;

// create listener to port 8080
console.clear();
printWecomeMessage(`START LISTENING on port ${activePort}`);

httpService.createServer ( (request, response) => {
    let userArray=[];
    printWecomeMessage(`REQUEST #${++requestCounter} ARRIVED on port ${activePort}`);

    console.log ( 'BEFORE ANY ACTION.  request.url ---  ' + request.url);
    if ( request.url === "/favicon.ico") {
        console.log ('_____FAVICON______:  return with not action');
        return ;
    }

    // Load HTML file to a local variable
    let = myHTMLFileContent = fileService.readFileSync (mainHTMLFileName, {'encoding': 'utf-8'});

    let newName = '';
    if ( request.url.search('clearList') >= 0 ) {
        newName = ''; // no new name
        clearList();  // now just delete the file
    } else if ( request.url.search ('simulateSubmitNames') >= 0 ) {
        simulateSubmitName();
    } else {
        // parseNameFromURL will return the data as a valid JSON object (not an array)
        newName = parseNameFromURL (request.url);
        console.log ( 'AFTER  parseNameFromURL() ... ' + JSON.stringify ( newName ));
    }    
    // read the previous list of Users from physcial JSON File. If file missing or Empty: create it with
    // valid empty array []
    userArray = loadUsersListFromJsonFile (usersListJsonFile, newName);

    // Single Page Application: replace relevant section in HTML File
    myHTMLFileContent = replaceDOMUserCounters(myHTMLFileContent, userArray.length);
    myHTMLFileContent = replaceDOMUserList(myHTMLFileContent, userArray);

    // load HTML file, after replacement of (user counter) & (user list)
    loadHTMLPageToDOM (response, myHTMLFileContent);


}).listen(activePort);

//===========================================================
function printWecomeMessage(pMessage) {
    console.log('======================');
    console.log(pMessage);
};

//===========================================================
function loadHTMLPageToDOM (pResponse, pPage) {
    pResponse.writeHead (200, {'Content-type': 'text/html'});
    pResponse.write ( pPage );
    pResponse.end();
}

//===========================================================
function replaceDOMUserCounters(pHTMLFile, pCounter) {
    // let usersCounter = parseInt(pCounter);
    let text = ( parseInt(pCounter) > 0 ? pCounter.toString() : 'List is empty');
    
    return ( pHTMLFile.replace ('###TotalSubmittedUsers###' , text) );
}
    
//===========================================================
function replaceDOMUserList(pHTMLFile, pUsersArray) {
    let text='';
    if ( (!pUsersArray) || ( pUsersArray.length<=0) ) {
        text = ''; // List is Empty
    } else {
        // List is NOT empty. Convert the Array into a list of <li> items in <ol>
        pUsersArray.forEach(item => {
            text += `<li>${item.firstName} ${item.lastName}, age: ${item.age}, nickname: ${item.nickName}</li>`
        });
    }
    return ( pHTMLFile.replace ('###FullListOfUsers###' , text));
}

//===========================================================
function loadUsersListFromJsonFile (usersListJsonFile, pNewUser) {
    // if file does not exist, create it with an content of empty Array = []
    try {

        if ( fileService.existsSync(usersListJsonFile)  )      {

            console.log ('loadUsersListFromJsonFile() --> file found');
            // do nothing. We read the file at the end of function as a check all is OK
        } else {

            console.log ('loadUsersListFromJsonFile() --> file NOT found');
            
            try {
                fileService.writeFileSync (usersListJsonFile , '[ ]');
                console.log ('loadUsersListFromJsonFile() --> created empty [ ] file');
            }  catch (e) {
                console.log ('loadUsersListFromJsonFile() --> FAILED creating empty [ ] file: ' + e);    
            } // end try & catch on writeFileSync
            
        }
     }   // end try on existsSync
     catch (errMsg) {
        console.log ('ERROR from loadUsersListFromJsonFile() --> ' + errMsg);
     }   // end catch

    // When reaching here we should have a valid file, with data, or with [] case no data

    let result = fileService.readFileSync (usersListJsonFile, 'utf8' ); 
    let usersData = JSON.parse (result);

    if (pNewUser !=='') {
        usersData.push ( pNewUser);
        // Add the new NAME both to file and to returned array
        // let temp = JSON.parse (result.push (pNewUser));
        fileService.writeFileSync (usersListJsonFile , JSON.stringify(usersData));
    }   
    
    console.log ('loadUsersListFromJsonFile() --> successful read of file. #users: '); // + usersData.length);
    
    console.log ('loadUsersListFromJsonFile() --> done');
    // Now return an Array. 
    return usersData;
}

function parseNameFromURL (pURL) {
    let urlObject = new urlService ( pURL, true) ;
    let singleUserInfo='';
    // console.log (`parseNameFromURL(): url = ${pURL}`)

    if ( pURL.search('firstName') == -1 ) {
        console.log ('parseNameFromURL(): ignore url request: firstName NOT FOUND');
    } else if (pURL.search('firstName=&lastName') != -1) {
        console.log ('parseNameFromURL(): ignore url request: firstName IS EMPTY');
    }  else {
        console.log ('parseNameFromURL(): valid url input: processing');
        singleUserInfo = {
            "firstName": urlObject.query.firstName,
            "lastName": urlObject.query.lastName,
            "age": urlObject.query.age,
            "nickName": urlObject.query.nickName,
        }
    }
    return singleUserInfo;
}

function clearList () {
    // clearFile
    console.log ('START clearList()');
    try {
        fileService.unlinkSync (usersListJsonFile);
    }
    catch (e) {
        console.log ('____clearList: file not found while unlink, BUT THIS IS OK. ' + e);
    }
}

function simulateSubmitName () {
    console.log ('START simulateSubmitName()');
    // artificailly insert 3 names into an Array, write them into the file
    let tmpArray=[ {'firstName': 'Dani', 'lastName': 'Cohen', 'age': '34', 'nickName': '007'},
                    {'firstName': 'Lili', 'lastName': 'Eliyahoo', 'age': '29', 'nickName': 'ZooZoo'},
                    {'firstName': 'Eid', 'lastName': 'Merfe', 'age': '59', 'nickName': 'Jibotero'}
                  ];
    fileService.writeFileSync ( usersListJsonFile, JSON.stringify (tmpArray)) ;
}
