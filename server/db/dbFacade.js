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
function signUpUser(email, hashedPassword, salt)
{
    return queryProcedure(
        `call signUpUser('${email}', '${hashedPassword}', '${salt}')`,
        `stored procedure "signUpUser" succeded.`,
        `stored procedure "signUpUser" failed.`
    )
}

function deleteAccount(email)
{
    return queryProcedure(
        `call deleteAccount('${email}')`,
        `stored procedure "deleteAccount" succeded.`,
        `stored procedure "deleteAccount" failed.`
    )
}

function createToggleActivationRequest(serialNumber, email)
{
    return queryProcedure(
        `call createToggleActivationRequest('${serialNumber}', '${email}')`,
        `stored procedure "createToggleActivationRequest" succeded.`,
        `stored procedure "createToggleActivationRequest" failed.`
    )
}

function deleteToggleActivationRequest(serialNumber)
{
    return queryProcedure(
        `call deleteToggleActivationRequest('${serialNumber}')`,
        `stored procedure "deleteToggleActivationRequest" succeded.`,
        `stored procedure "deleteToggleActivationRequest" failed.`
    )
}

function toggleTrackerActive(serialNumber, hashedPhysicalSecurityKey)
{
    return queryProcedure(
        `call toggleTrackerActive('${serialNumber}', '${hashedPhysicalSecurityKey}')`,
        `stored procedure "toggleTrackerActive" succeded.`,
        `stored procedure "toggleTrackerActive" failed.`
    )
}

//database functions
function userExists(email)
{
    return queryFunction(
        `select userExists('${email}')`,
        `database function "userExists" succeded.`,
        `database function "userExists" failed.`
    )
}

function validUserCredentials(email, hashedPassword)
{
    return queryFunction(
        `select validCredentials('${email}', '${hashedPassword}')`,
        `database function "validCredentials" succeded.`,
        `database function "validCredentials" failed.`
    )
}

function validTrackerCredentials(serialNumber, hashedPhysicalSecurityKey)
{
    return queryFunction(
        `select validTrackerCredentials('${serialNumber}', '${hashedPhysicalSecurityKey}')`,
        `database function "validTrackerCredentials" succeded.`,
        `database function "validTrackerCredentials" failed.`
    )
}

function validToggleActivationRequest(serialNumber, hashedPhysicalSecurityKey, email)
{
    return queryFunction(
        `select validToggleActivationRequest('${serialNumber}', '${hashedPhysicalSecurityKey}', '${email}')`,
        `database function "validToggleActivationRequest" succeded.`,
        `database function "validToggleActivationRequest" failed.`
    )
}

function toggleActivationRequestExists(serialNumber)
{
    return queryFunction(
        `select toggleActivationRequestExists('${serialNumber}')`,
        `database function "toggleActivationRequestExists" succeded.`,
        `database function "toggleActivationRequestExists" failed.`
    )
}

//"private" helper functions
function queryProcedure(queryString, onSuccessMessage, onFailiureMessage)
{
    return new Promise(async function(resolve, reject) {
        await connection.query(queryString,
            (err, rows, fields) => {
                if(err)
                {
                    console.log(err)
                }
                else
                {
                    console.log(onSuccessMessage)
                    resolve({
                        success: true
                    });
                }
            }
        )
    })
}

function queryFunction(queryString, onSuccessMessage, onFailiureMessage)
{
    return new Promise(async function(resolve, reject) {
        await connection.query(`${queryString} as queryResponse`,
            (err, rows, fields) => {
                if(err)
                {
                    console.log(err)
                }
                else
                {
                    console.log(onSuccessMessage)
                    resolve({
                        success: true,
                        returnValue: rows[0].queryResponse
                    });
                }
            }
        )
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
    validUserCredentials: validUserCredentials,
    validTrackerCredentials: validTrackerCredentials,
    validToggleActivationRequest: validToggleActivationRequest,
    toggleActivationRequestExists: toggleActivationRequestExists,

    //övrigt
    connect: connect,
    disconnect: disconnect
}