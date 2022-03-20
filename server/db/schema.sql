SET GLOBAL log_bin_trust_function_creators = 1;

drop table if exists ToggleActivationRequest;
drop table if exists Tracker;
drop table if exists User;

drop procedure if exists signUpUser;
drop procedure if exists deleteAccount;
drop procedure if exists deactivateAllUserTrackers;
drop procedure if exists manifactureTracker;
drop procedure if exists createToggleActivationRequest;
drop procedure if exists deleteToggleActivationRequest;
drop procedure if exists toggleTrackerActive;

drop function if exists userExists;
drop function if exists validUserCredentials;
drop function if exists validTrackerCredentials;
drop function if exists validToggleActivationRequest;
drop function if exists toggleActivationRequestExists;
drop function if exists trackerExists;

create table User(email varchar(255), hashedPassword varchar(1023) not null, primary key(email));
create table Tracker(serialNumber int auto_increment, hashedPhysicalSecurityKey varchar(1023) not null, userEmail varchar(255), active boolean not null default false, primary key(serialNumber), foreign key(userEmail) references User(email));
create table ToggleActivationRequest(trackerSerialNumber int, userEmail varchar(255) not null, primary key(trackerSerialNumber), foreign key(trackerSerialNumber) references Tracker(serialNumber), foreign key(userEmail) references User(email));

-- procedures
delimiter //
create procedure signUpUser(in p_email varchar(255), in p_hashedPassword varchar(1023))
BEGIN
    insert into User(email, hashedPassword) values(p_email, p_hashedPassword);
END //
delimiter ;

delimiter //
create procedure deleteAccount(in p_email varchar(255))
BEGIN
    call deactivateAllUserTrackers(p_email);
    delete from User where email = p_email;
END //
delimiter ;

delimiter //
create procedure deactivateAllUserTrackers(in p_email varchar(255))
BEGIN
    update Tracker
    set userEmail = null,
        active = false
    where userEmail = p_email;
END //
delimiter ;

delimiter //
create procedure manifactureTracker(in p_hashedPhysicalSecurityKey varchar(1023))
BEGIN
    insert into Tracker(hashedPhysicalSecurityKey) values(p_hashedPhysicalSecurityKey);
END //
delimiter ;

delimiter //
create procedure createToggleActivationRequest(in p_serialNumber varchar(32), in p_email varchar(255))
BEGIN
    insert into ToggleActivationRequest(trackerSerialNumber, userEmail)
    values(p_serialNumber, p_email);
END //
delimiter ;

delimiter //
create procedure deleteToggleActivationRequest(in p_serialNumber varchar(32))
BEGIN
    delete from ToggleActivationRequest
    where trackerSerialNumber = p_serialNumber;
END //
delimiter ;

delimiter //
create procedure toggleTrackerActive(in p_serialNumber varchar(32), in p_hashedPhysicalSecurityKey varchar(1023), in p_email varchar(255))
BEGIN
    update Tracker
    set userEmail = if(Tracker.active, null, p_email),
    active = not Tracker.active
    where serialNumber = p_serialNumber
    and hashedPhysicalSecurityKey = p_hashedPhysicalSecurityKey;
END //
delimiter ;

-- functions
delimiter //
create function userExists(p_email varchar(255)) returns boolean
BEGIN
    IF EXISTS (
        select * from User where email = p_email
    )   THEN
            return true;
        ELSE
            return false;
    END IF;
END//
delimiter ;

delimiter //
create function validTrackerCredentials(p_serialNumber varchar(255), p_hashedPhysicalSecurityKey varchar(1023)) returns boolean
BEGIN
    IF EXISTS (
        select * from Tracker where serialNumber = p_serialNumber and hashedPhysicalSecurityKey = p_hashedPhysicalSecurityKey
    )   THEN
            return true;
        ELSE
            return false;
    END IF;
END//
delimiter ;

delimiter //
create function validToggleActivationRequest(p_serialNumber varchar(32), p_email varchar(255)) returns boolean
BEGIN
    if(
        (select trackerExists(p_serialNumber)) and 
        (select userExists(p_email))
    )  THEN
            return true;
        ELSE
            return false;
    END IF;
END//
delimiter ;

delimiter //
create function toggleActivationRequestExists(p_serialNumber varchar(32)) returns boolean
BEGIN
    IF EXISTS (
        select * from ToggleActivationRequest where trackerSerialNumber = p_serialNumber
    )   THEN
            return true;
        ELSE
            return false;
    END IF;
END//
delimiter ;

delimiter //
create function trackerExists(p_serialNumber int) returns boolean
BEGIN
    if exists(
        select * from Tracker where serialNumber = p_serialNumber
    )   THEN
            return true;
        ELSE
            return false;
    end if;
END//
delimiter ;

-- actions
call manifactureTracker('aaa');