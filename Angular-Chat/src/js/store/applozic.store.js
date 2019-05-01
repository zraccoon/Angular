applozic.factory('apzStore', function(apzService) {
    var APZ_AUTHENTICATION_TYPE_ID_MAP = [ 0, 1, 2 ];
    var apzStore = {};
    var appOptions = {};
    var default_options = {
            baseUrl : 'https://apps.applozic.com',
            fileBaseUrl : 'https://mobi-com-alpha.appspot.com',
            notificationIconLink : '',
            applicationId : '',
            email : '',
            userId : '',
            userName : '',
            imageLink : '',
            supportId : '',
            visitor : false,
            olStatusEnable : false,
            locShareEnable : true,
            mode : 'standard',
            contactNumber : '',
            maxGroupSize : 100,
            notification : true,
            appVersionCode : 108,
            maxAttachmentSize : 25, // default size is 25MB
            loadOwnContacts : false,
            authenticationTypeId : 0,
            desktopNotification : false,
            launchOnUnreadMessage : false
        };   
        apzStore.init = function(optns) {
        optns = angular.extend({}, default_options, optns);
        optns.applicationId = $.trim(optns.applicationId);
        optns.userId = (optns.visitor) ? 'guest' : $.trim(optns.userId);
        optns.authenticationTypeId = (APZ_AUTHENTICATION_TYPE_ID_MAP.indexOf(optns.authenticationTypeId) === -1) ? 0 : appOptions.authenticationTypeId;
        if (!optns.appId || !optns.userId || optns.appId === '' || optns.userId === '') {
            if (typeof optns.onInit === 'function') {
                optns.onInit({
                    'status' : 'error',
                    'errorMessage' : 'INVALID APPID OR USERID'
                });
            }
            return;
        }
        var userPxy = {
            'applicationId' : optns.appId,
            'userId' : optns.userId,
            'authenticationTypeId' : optns.authenticationTypeId
        };
        if (optns.userName) {
            userPxy.displayName = optns.userName;
        }
        if (optns.email) {
            userPxy.email = optns.email;
        }
        if (optns.contactNumber) {
            userPxy.contactNumber = optns.contactNumber;
        }
        if (appOptions.imageLink) {
            userPxy.imageLink = optns.imageLink;
        }
        if (optns.appModuleName) {
            userPxy.appModuleName = optns.appModuleName;
        }
        if (optns.password) {
            userPxy.password = optns.password;
        }
        if(optns.accessToken) {
            userPxy.accessToken = optns.accessToken;
        }
        userPxy.appVersionCode = 108;
        var stateCreated = apzService.initChatApp(userPxy);
        stateCreated.then(function(response) {
            var data = response.data;
                if (data === 'INVALID_PASSWORD') {
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'error',
                            'errorMessage' : 'INVALID PASSWORD'
                        });
                    }
                    return;
                } else if (data === 'INVALID_APPID') {
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'error',
                            'errorMessage' : 'INVALID APPID'
                        });
                        return;
                    }
                } else if (data === 'error' || data === 'USER_NOT_FOUND') {
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'error',
                            'errorMessage' : 'USER NOT FOUND'
                        });
                    }
                    return;
                } else if (data === 'APPMODULE_NOT_FOUND') {
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'error',
                            'errorMessage' : 'APPMODULE NOT FOUND'
                        });
                        return;
                    }
                }
                if (typeof data === 'object' && data !== null) {
                    apzStore.setAppOptions(data, optns);
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'success'
                        });
                    }
                    return;
                } else {
                    if (typeof optns.onInit === 'function') {
                        optns.onInit({
                            'status' : 'error',
                            'errorMessage' : 'UNABLE TO PROCESS REQUEST'
                        });
                    }
                }
        }, function(e) {
            if (typeof optns.onInit === 'function') {
                optns.onInit({
                    'status' : 'error',
                    'errorMessage' : 'UNABLE TO PROCESS REQUEST'
                });
            }
        })
    };  
    apzStore.getAppOptions = function() {
        return appOptions;
    }
    apzStore.setAppOptions = function(data, optns) {
        appOptions.BASE_URL = optns.baseUrl;
        appOptions.FILE_URL = data.fileBaseUrl;
        appOptions.WEBSOCKET_URL = data.websocketUrl;
        appOptions.IDLE_TIME_LIMIT = data.websocketIdleTimeLimit;
        appOptions.USER_ID = data.userId;
        appOptions.TOKEN = data.token;
        appOptions.DEVICE_KEY = data.deviceKey;
        appOptions.APP_ID = optns.appId;
        appOptions.AUTH_CODE = btoa(data.userId + ':' + data.deviceKey);
        appOptions.IS_USER_DEACTIVATED = data.isDeactivated;
        appOptions.CONNECTED_CLIENT_COUNT = data.connectedClientCount;
        appOptions.AUTHENTICATION_TYPE_ID = optns.authenticationTypeId;
        appOptions.USER_NAME = optns.userName;
        appOptions.USER_EMAIL = optns.email;
        appOptions.USER_NUMBER = optns.contactNumber;
        appOptions.USER_IMAGE_LINK = optns.imageLink;
        appOptions.APP_MODULE_NAME = optns.appModuleName;
        appOptions.ACCESS_TOKEN = optns.accessToken;
        appOptions.IS_VISITOR = optns.visitor;
        appOptions.IS_CHECK_BUSY_STATUS = (typeof optns.checkUserBusyWithStatus === 'boolean') ? (optns.checkUserBusyWithStatus) : false;
        appOptions.MODE = optns.mode;
        appOptions.IS_LOCSHARE_ENABLED = optns.locationShareEnable;
        appOptions.DISPLAY_TEXT = optns.displayText;
        appOptions.GROUPMAXSIZE = optns.maxGroupSize;
        appOptions.FILEMAXSIZE = optns.maxAttachmentSize;
        appOptions.GETTOPICDETAIL = optns.getTopicDetail;
        appOptions.GETUSERNAME = optns.getContactName;
        appOptions.MSG_VALIDATION = optns.validateMessage;
        appOptions.GETUSERIMAGE = optns.getContactImage;
        appOptions.GETCONVERSATIONDETAIL = optns.getConversationDetail;
        appOptions.NOTIFICATION_ICON_LINK = optns.notificationIconLink;
        appOptions.GOOGLE_API_KEY = (appOptions.isLocShareEnabled) ? optns.googleApiKey : 'NO_ACCESS';
        appOptions.IS_TOPIC_BOX_ENABLED = (typeof optns.topicBoxEnable === 'boolean') ? (optns.topicBox) : false;
        appOptions.IS_OL_STATUS_ENABLED = (typeof optns.olStatusEnable === 'boolean') ? (optns.olStatus) : false;
        appOptions.IS_AUTO_TYPE_SEARCH_ENABLED = (typeof optns.autoTypeSearchEnable === 'boolean') ? (optns.autoTypeSearchEnable) : true;
        appOptions.IS_LOAD_OWN_CONTACTS = (typeof optns.loadOwnContacts === 'boolean') ? (optns.loadOwnContacts) : false;
        appOptions.IS_DESKTOP_NOTIFICATION_ENABLED = (typeof optns.desktopNotificationEnable === 'boolean') ? optns.desktopNotificationEnable : false;
        appOptions.IS_NOTIFICATION_ENABLED = (typeof optns.notificationEnable === 'boolean') ? optns.notificationEnable : true;
    }
    return apzStore;
});