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
        await connection.connect();
        console.log("database connected.")
        resolve({
            success: true
        });
    })
}

function disconnect()
{
    return new Promise(async function(resolve, reject) {
        await connection.end();
        console.log("database disconnected.")
        resolve({
            success: true
        });
    })
}

//stored procedures
function signUpUser(email, hashedPassword)
{
    const queryString = `call signUpUser('${email}', '${hashedPassword}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: {}
            });
        })
    })
}

function deleteAccount(email)
{
    const queryString = `call deleteAccount('${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: {}
            });
        })
    })
}

function createToggleActivationRequest(serialNumber, email)
{
    const queryString = `call createToggleActivationRequest('${serialNumber}', '${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: {}
            });
        })
    })
}

function deleteToggleActivationRequest(serialNumber)
{
    const queryString = `call deleteToggleActivationRequest('${serialNumber}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: {}
            });
        })
    })
}

function toggleTrackerActive(serialNumber, hashedPhysicalSecurityKey, email)
{
    const queryString = `call toggleTrackerActive('${serialNumber}', '${hashedPhysicalSecurityKey}', '${email}')`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: {}
            });
        })
    })
}

//database functions
function userExists(email)
{
    const queryString = `select userExists('${email}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0].returnValue
            });
        })
    })
}

function validTrackerCredentials(serialNumber, hashedPhysicalSecurityKey)
{
    const queryString = `select validTrackerCredentials('${serialNumber}', '${hashedPhysicalSecurityKey}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0].returnValue
            });
        })
    })
}

function validToggleActivationRequest(serialNumber, email)
{
    const queryString = `select validToggleActivationRequest('${serialNumber}', '${email}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0].returnValue
            });
        })
    })
}

function toggleActivationRequestExists(serialNumber)
{
    const queryString = `select toggleActivationRequestExists('${serialNumber}') as 'returnValue';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0].returnValue
            });
        })
    })
}

function getToggleRequest(serialNumber)
{
    const queryString = `select * from ToggleActivationRequest where trackerSerialNumber = ${serialNumber};`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0]
            });
        })
    })
}

function getUser(email)
{ 
    const queryString = `select * from User where email = '${email}';`;

    return new Promise((resolve, reject) => {
        connection.query(queryString, (err, rows, fields) => {
            if(err) console.log(err)
            resolve({
                err: err,
                data: rows[0]
            });
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

    //övrigt
    connect: connect,
    disconnect: disconnect
}