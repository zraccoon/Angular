applozic.factory('apzService', function($q, $location, $http) {
    var apzService = {};
    var preHeaders = {
        'UserId-Enabled': true
    };
    var APZ_BASE_URL = 'https://apps.applozic.com';
    var APZ_FILE_URL = 'https://applozic.appspot.com';
    var urls = {
        initChatApp: APZ_BASE_URL + '/v2/tab/initialize.page', //  initialize chat app
        sendMessage: APZ_BASE_URL + '/rest/ws/message/v2/send', //  send message
        getMessageList: APZ_BASE_URL + '/rest/ws/message/list?', // get messages
        messageDeliveryUpdate: APZ_BASE_URL + '/rest/ws/message/delivered?key=', // delivery update
        messageReadUpdate: APZ_BASE_URL + '/rest/ws/message/read?key=', // send read update 
        getContactList: APZ_BASE_URL + '/rest/ws/user/filter?startIndex=0&pageSize=30&orderBy=1', //get search contacts 
        deleteMessage: APZ_BASE_URL + '/rest/ws/message/delete?key=', // delete message
        clearMessages: APZ_BASE_URL + '/rest/ws/message/delete/conversation?', // clear messages
        getUserDetail: APZ_BASE_URL + '/rest/ws/user/detail?', // user detail
        getChatUsersList: APZ_BASE_URL + '/rest/ws/user/chat/status', // users list with already conversations
        blockUser: APZ_BASE_URL + '/rest/ws/user/block?', // toggle block
        getGroupList: APZ_BASE_URL + '/rest/ws/group/list', // get group list
        createGroup: APZ_BASE_URL + '/rest/ws/group/create', // create group
        updateGroup: APZ_BASE_URL + '/rest/ws/group/update', // update group
        getGroupFeed: APZ_BASE_URL + '/rest/ws/group/info', // get group feed
        exitGroup: APZ_BASE_URL + '/rest/ws/group/left?', // exit group 
        addGroupMember: APZ_BASE_URL + '/rest/ws/group/add/member?', // add group member
        removeGroupMember: APZ_BASE_URL + '/rest/ws/group/remove/member?', // remove group member
        getConversationFeedByProxy: APZ_BASE_URL + '/rest/ws/conversation/id', // get conversation feed
        getConversationFeedById: APZ_BASE_URL + '/rest/ws/conversation/topicId?', // get conversation feed
        fileUpload: APZ_FILE_URL + '/rest/ws/aws/file/url?', // file upload  
        fileUploadToAWS : APZ_BASE_URL + '/rest/ws/upload/file', // upload file to AWS
        deleteFileMeta: APZ_FILE_URL + '/rest/ws/aws/file/delete?key=', // delete file meta
        updateServiceWorkerId: APZ_BASE_URL + '/rest/ws/plugin/update/sw/id' // update service worker id
    };
    apzService.initChatApp = function(actionString) {
        var accessToken = actionString.accessToken;
        if(!accessToken && actionString.password) {
            accessToken = actionString.password;
        }
        delete actionString.accessToken;
        var request = createRequest({
            url: urls.initChatApp,
            method: 'post',
            data: JSON.stringify(actionString)
        });
        request.then(function(response) {
            if (typeof response.data === 'object') {
                var data = response.data;
                var AUTH_CODE = btoa(data.userId + ':' + data.deviceKey);
                preHeaders['Application-Key'] = actionString.applicationId;
                preHeaders['Authorization'] = 'Basic ' + AUTH_CODE;
                if (data.deviceKey) {
                    preHeaders['Device-Key'] = data.deviceKey;
                }
                if (actionString.accessToken) {
                    preHeaders['Access-Token'] =actionString.accessToken;
                }
                if (actionString.appModuleName) {
                    preHeaders['App-Module-Name'] = actionString.appModuleName;
                }
            }
        }, function() {});
        return request;
    }
    apzService.getPreHeaders = function() {
        return preHeaders;
    }
    apzService.getMessageList = function(actionString) {
        var request = createRequest({
            url: urls.getMessageList + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.sendMessage = function(actionString) {
        var request = createRequest({
            url: urls.sendMessage,
            method: 'post',
            data: JSON.stringify(actionString)
        });
        return request;
    }
    apzService.getContactList = function(actionString) {
        var request = createRequest({
            url: urls.getContactList,
            method: 'get'
        });
        return request;
    }
    apzService.sendMessageDeliveryUpdate = function(actionString) {
        var request = createRequest({
            url: urls.messageDeliveryUpdate + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.sendMessageReadUpdate = function(actionString) {
        var request = createRequest({
            url: urls.messageReadUpdate + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.deleteMessage = function(actionString) {
        var request = createRequest({
            url: urls.deleteMessage + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.clearMessages = function(actionString) {
        var request = createRequest({
            url: urls.clearMessages + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.getUserDetail = function(actionString) {
        var request = createRequest({
            url: urls.getUserDetail + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.getChatUsersList = function() {
        var request = createRequest({
            url: urls.getChatUsersList,
            method: 'get'
        });
        return request;
    }
    apzService.blockUser = function(actionString) {
        var request = createRequest({
            url: urls.blockUser + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.getGroupList = function() {
        var request = createRequest({
            url: urls.getGroupList,
            method: 'get'
        });
        return request;
    }
    apzService.createGroup = function(actionString) {
        var request = createRequest({
            url: urls.createGroup,
            method: 'post',
            data: JSON.stringify(actionString)
        });
        return request;
    }
    apzService.updateGroup = function(actionString) {
        var request = createRequest({
            url: urls.updateGroup,
            method: 'post',
            data: JSON.stringify(actionString)
        });
        return request;
    }
    apzService.getGroupFeed = function(actionString) {
        var request = createRequest({
            url: urls.getGroupFeed + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.exitGroup = function(actionString) {
        var request = createRequest({
            url: urls.exitGroup + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.addGroupMember = function(actionString) {
        var request = createRequest({
            url: urls.addGroupMember + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.removeGroupMember = function(actionString) {
        var request = createRequest({
            url: urls.removeGroupMember + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.getConversationFeedById = function(actionString) {
        var request = createRequest({
            url: urls.getConversationFeedById + actionString,
            method: 'get'
        });
        return request;
    }
    apzService.getConversationFeedByProxy = function(actionString) {
        var request = createRequest({
            url: urls.getConversationFeedByProxy,
            method: 'post',
            data: JSON.stringify(actionString)
        });
        return request;
    }
    apzService.uploadFile = function(actionString) {
        var request = createRequest({
            url: urls.fileUpload + 'data=' + new Date().getTime(),
            method: 'get'
        });
        return request;
    }
    apzService.uploadFileToAWS = function(xhr, file) {
        var data = new FormData();
        data.append('file', file);
        xhr.open('post', urls.fileUploadToAWS , true);
        xhr.setRequestHeader('UserId-Enabled', preHeaders['UserId-Enabled']);
        xhr.setRequestHeader('Authorization', preHeaders['Authorization']);
        xhr.setRequestHeader('Application-Key', preHeaders['Application-Key']);
        if (preHeaders['Access-Token']) {
            xhr.setRequestHeader('Access-Token', preHeaders['Access-Token']);
         }
         if ( preHeaders['Device-Key']) {
              xhr.setRequestHeader('Device-Key', preHeaders['Device-Key']);
         }
         if (preHeaders['App-Module-Name']) {
              xhr.setRequestHeader('App-Module-Name', preHeaders['App-Module-Name']);
         }
        xhr.send(data);
    }
    apzService.saveFileMeta = function(xhr, url, data) {
        var fd = new FormData();
        fd.append('files[]', data);
        xhr.open('POST', url, true);
        xhr.send(fd);
    }
    apzService.deleteFileMeta = function(actionString) {
        var request = createRequest({
            url: urls.deleteFileMeta + actionString,
            method: 'post'
        });
        return request;
    }
    apzService.updateServiceWorkerId = function(actionString) {
        var request = createRequest({
            url: urls.updateServiceWorkerId,
            data: 'registrationId=' + actionString,
            method: 'post'
        });
        return request;
    }
    apzService.flush = function(id) {
        var request = createRequest({
            url: urls.flush + id,
            method: 'post'
        });
        return request;
    }
    return apzService;
    // ------------------------PRIVATE FUNCTIONS-------------------------------//
    function createRequest(options) {
        /*        var result = options.headersOptions;
                MCK_TOKEN = result.token;
                MCK_USER_ID = result.userId;
                USER_COUNTRY_CODE = result.countryCode;
                USER_DEVICE_KEY = result.deviceKey;
                MCK_WEBSOCKET_URL = result.websocketUrl;
                MCK_IDLE_TIME_LIMIT = result.websocketIdleTimeLimit;
                MCK_USER_TIMEZONEOFFSET = result.timeZoneOffset;
                MCK_FILE_URL = result.fileBaseUrl;
                IS_MCK_USER_DEACTIVATED = result.deactivated;
                AUTH_CODE = btoa(result.userId + ":" + result.deviceKey);
                MCK_CONNECTED_CLIENT_COUNT = result.connectedClientCount;*/
        // $.ajaxPrefilter(function(options) {
        // if (!options.beforeSend && (options.url.indexOf(MCK_BASE_URL) !== -1)) {
        // // _this.manageIdleTime();
        // options.beforeSend = function(jqXHR) {
        // jqXHR.setRequestHeader("UserId-Enabled", true);
        // jqXHR.setRequestHeader("Authorization", "Basic " + AUTH_CODE);
        // jqXHR.setRequestHeader("Application-Key", "applozic-sample-app");
        // };
        // }
        // });
        var reqObject = {};
        reqObject['url'] = options.url;
        reqObject['method'] = options.method;
        reqObject['crossDomain'] = true;
        if(options.url.indexOf(APZ_FILE_URL) === -1) {
           reqObject['headers'] = preHeaders;
        }
        reqObject['contentType'] = 'application/json';
        if (reqObject.method.toLowerCase() == 'post' || reqObject.method.toLowerCase() == 'put') {
            reqObject['data'] = options.data;
            reqObject['dataType'] = 'application/json';
        }
        return $http(reqObject);
    }
});