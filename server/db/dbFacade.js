const mysql = require('mysql')
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'urytururur',
  database: 'tracker_api'
})

//connect/disconnect
function connect()
{
    return new Promise(async function(resolve, reject) {
        try {
            await connection.connect();
            resolve();
        } catch (err) {
            console.log(err)
            reject()    
        }
    })
}

function disconnect()
{
    return new Promise(async function(resolve, reject) {
        try {
            await connection.end();
            resolve();
        } catch (err) {
            console.log(err)
            reject()
        }
    })
}

//stored procedures
function signUpUser(email, hashedPassword)
{
    const queryString = `call signUpUser('${email}', '${hashedPassword}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function deleteAccount(email)
{
    const queryString = `call deleteAccount('${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function createToggleActivationRequest(serialNumber, email)
{
    const queryString = `call createToggleActivationRequest('${serialNumber}', '${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function deleteToggleActivationRequest(serialNumber)
{
    const queryString = `call deleteToggleActivationRequest('${serialNumber}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function toggleTrackerActive(serialNumber, hashedPhysicalSecurityKey, email)
{
    const queryString = `call toggleTrackerActive('${serialNumber}', '${hashedPhysicalSecurityKey}', '${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

//database functions
function userExists(email)
{
    const queryString = `select userExists('${email}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function validTrackerCredentials(serialNumber, hashedPhysicalSecurityKey)
{
    const queryString = `select validTrackerCredentials('${serialNumber}', '${hashedPhysicalSecurityKey}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function validToggleActivationRequest(serialNumber, email)
{
    const queryString = `select validToggleActivationRequest('${serialNumber}', '${email}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function toggleActivationRequestExists(serialNumber)
{
    const queryString = `select toggleActivationRequestExists('${serialNumber}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function getToggleRequest(serialNumber)
{
    const queryString = `select * from ToggleActivationRequest where trackerSerialNumber = ${serialNumber};`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve();
        })
    })
}

function getUser(email)
{ 
    const queryString = `select * from User where email = '${email}';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }
            resolve(rows[0]);
        })
    })
}

function getAllUserTrackers(email)
{ 
    const queryString = `select * from Tracker where userEmail = '${email}';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err)
            {
                console.log(err)
                reject()
            }

            for(i = 0; i < rows.length; i++)
            {
                //delete properties
                delete rows[0].hashedPhysicalSecurityKey
                delete rows[0].userEmail

                //add properties
                rows[0].type = "Tracker"
            }
            resolve(rows);
        })
    })
}


module.exports = {
    //stored procedures
    signUpUser: signUpUser,
    deleteAccount: deleteAccount,
    createToggleActivationRequest: createToggleActivationRequest,
    deleteToggleActivationRequest: deleteToggleActivationRequest,
    toggleTrackerActive: toggleTrackerActive,

    //database functions
    userExists: userExists,
    validTrackerCredentials: validTrackerCredentials,
    validToggleActivationRequest: validToggleActivationRequest,
    toggleActivationRequestExists: toggleActivationRequestExists,

    //queries
    getToggleRequest: getToggleRequest,
    getUser: getUser,
    getAllUserTrackers: getAllUserTrackers,

    //övrigt
    connect: connect,
    disconnect: disconnect
}