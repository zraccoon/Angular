
applozic.controller('apzController', [ '$scope', '$sce', '$stomp', '$interval', '$timeout', 'apzService', 'apzStore', function($scope, $sce, $stomp, $interval, $timeout, apzService, apzStore) {
    var appOptions = {
        appId: 'applozic-sample-app', //Get your application key from https://www.applozic.com 
        userId: 'ABD', //Logged in user's id, a unique identifier for user 
        userName: 'ABD', //User's display name
        imageLink: '', //User's profile picture url
        email: '', // optional, Logged in user's email
        password: '', //optional
        source: '1', // WEB(1),MOBOLE_BROWSER(6)
        desktopNotificationEnable: true,
        notificationIconLink: 'https://www.applozic.com/favicon.ico', //Icon to show in desktop notification, replace with your icon
        authenticationTypeId: 1, //1 for password verification from Applozic server and 0 for access Token verification from your server
        accessToken: '', //optional, leave it blank for testing purpose, read this if you want to add additional security by verifying password from your server https://www.applozic.com/docs/configuration.html#access-token-url
        locationShareEnable: true,
        googleApiKey: 'AIzaSyDKfWHzu9X7Z2hByeW4RRFJrD9SizOzZt4', // your project google api key (required if location sharing is true)
        autoTypeSearchEnable: true, // set to false if you don't want to allow sending message to user who is not in the contact list
        topicBox: true,
        notificationIconLink: 'https://www.applozic.com/resources/images/applozic_icon.png',
        onInit: function(response) {
            if (response.status === 'success') {
                // login successful, perform your actions if any, for example: load contacts, getting unread message count, etc
                apzUtils.onInit();
            } else {
                // error in user login/register (you can hide chat button or refresh page)
                alert(response.errorMessage);
            }
        },
        onTabClicked: function(response) {
            // write your logic to execute task on tab load
            //   object response =  {
            //    tabId : userId or groupId,
            //    isGroup : 'tab is group or not'
            //  }
        }
    };
    apzStore.init(appOptions);
    $scope.files = [];
    $scope.APZ_TAB_MESSAGE_DRAFT = [];
    $scope.APZ_CONVERSATION_MAP = [];
    $scope.APZ_TOPIC_DETAIL_MAP = [];
    $scope.activeContact = {
        htmlId: ''
    };
    $scope.prevActiveContact = {
        htmlId: ''
    };
    $scope.activeFile = {
        id: ''
    };
    $scope.messageMenuOptions = [
        [ 'Delete', function($itemScope) {
            var messageKey = angular.element($itemScope.currentTarget).parents('.apz-m-b').data('key');
            var activeContact = $scope.activeContact;
            var contact = (activeContact.isGroup) ? apzGroupUtils.getGroup(activeContact.id) : apzContactUtils.getContact(activeContact.id);
            var stateCreated = apzService.deleteMessage(messageKey);
            stateCreated.then(function(response) {
                var data = response.data;
                if (data === 'success') {
                    apzMessageLayout.removeDeletedMessage(contact, messageKey);
                } else {
                    alert('Unable to delete message.');
                }
            }, function(e) {
                alert('Unable to delete message.');
            })
        }, null ]
    ];
    var apzUtils = new ApzUtils();
    var apzFileUtils = new ApzFileUtils();
    var apzUserUtils = new ApzUserUtils();
    var apzMapLayout = new ApzMapLayout();
    var apzDateUtils = new ApzDateUtils();
    var apzGroupUtils = new ApzGroupUtils();
    var apzGroupLayout = new ApzGroupLayout();
    var apzContactUtils = new ApzContactUtils();
    var apzMessageUtils = new ApzMessageUtils();
    var apzContactLayout = new ApzContactLayout();
    var apzMessageLayout = new ApzMessageLayout();
    var apzChannelService = new ApzChannelService();
    var apzContextualUtils = new ApzContextualUtils();
    var apzContextualLayout = new ApzContextualLayout();
    var apzNotificationService = new ApzNotificationService();

    // var $original;
    // Applozic App Global Variables

    var TEXT_NODE = 3;
    var FILE_META = [];
    var ELEMENT_NODE = 1;
    var APZ_GROUP_MAP = [];
    var APZ_CONTACT_MAP = [];
    var APZ_TYPING_STATUS = 0;
    var APZ_UNREAD_COUNT_MAP = [];
    var APZ_BLOCKED_TO_MAP = [];
    var APZ_BLOCKED_BY_MAP = [];
    var APZ_USER_DETAIL_MAP = [];
    var APZ_LAST_SEEN_AT_MAP = [];
    var APZ_TAB_CONVERSATION_MAP = [];
    var IS_TAB_FOCUSED = true;
    var APZ_TAB_FILE_DRAFT = [];
    var APZ_CLIENT_GROUP_MAP = [];
    var APZ_TOTAL_UNREAD_COUNT = 0;
    var APZ_TOPIC_CONVERSATION_MAP = [];
    var APZ_GROUP_MEMBER_SEARCH_ARRAY = [];
    var APZ_MESSAGE_MAP = [];
    var APZ_MESSAGE_KEY_MAP = [];
    var APZ_GROUP_TYPE_MAP = [ 1, 2, 5 ];
    var APZ_LAUNCHER = 'applozic-launcher';
    var APZ_CONVERSATION_STATUS_MAP = [ 'DEFAULT', 'NEW', 'OPEN' ];
    var APZ_BLOCK_STATUS_MAP = [ 'BLOCKED_TO', 'BLOCKED_BY', 'UNBLOCKED_TO', 'UNBLOCKED_BY' ];
    var TAGS_BLOCK = [ 'p', 'div', 'pre', 'form' ];
    var APZ_OL_MAP = new Array();
    var APZ_CONTACT_ARRAY = new Array();
    var APZ_GROUP_ARRAY = new Array();
    var APZ_CHAT_CONTACT_ARRAY = new Array();
    var events = {
        'onConnectFailed': function() {},
        'onConnect': function() {},
        'onMessageDelivered': function() {},
        'onMessageRead': function() {},
        'onMessageDeleted': function() {},
        'onConversationDeleted': function() {},
        'onUserConnect': function() {},
        'onUserDisconnect': function() {},
        'onConversationReadFromOtherSource': function() {},
        'onConversationRead': function() {},
        'onMessageReceived': function() {},
        'onMessageSentUpdate': function() {},
        'onMessageSent': function() {},
        'onUserBlocked': function() {},
        'onUserUnblocked': function() {},
        'onUserActivated': function() {},
        'onUserDeactivated': function() {}
    };
    var appOptions = {};
    $scope.isTextReq = {
        textbox: '',
        giTitlebox: '',
        gcTitlebox: ''
    }
    $scope.gcProps = {
        icon: '',
        iconUrl: '',
        overlayStatus: '',
        overlayLabel: 'Add Group Icon',
        iconLoadingStatus: 'n-vis',
        hoverStatus: 'apz-hover-on'
    }
    $scope.giProps = {
        icon: '',
        iconUrl: '',
        overlayLabel: 'Change Group Icon',
        iconLoadingStatus: 'n-vis',
        overlayStatus: 'n-vis',
        adminOptnsStatus: 'n-vis',
        hoverStatus: 'apz-hover-on',
        saveIconStatus: 'n-vis',
        saveTitleStatus: 'n-vis',
        editTitleStatus: 'vis',
        addMemberTitleStatus: 'n-vis',
        emptySearchMemberStatus: 'n-vis'
    }
    $scope.searchProps = {
        noContactStatus: 'n-vis',
        noGroupStatus: 'n-vis',
        loadingIconStatus: 'n-vis'
    }
    $scope.tabProps = {
        typingStatus: 'n-vis',
        typingText: '',
        title: '',
        subtitleText: '',
        icon: '',
        blockedStatus: 'false',
        panelInnerStatus: '',
        titlewtStatus: '',
        titlewsStatus: '',
        subtitleStatus: 'n-vis',
        msgFormStatus: 'vis',
        msgSyncTime: 0,
        blockedText: 'Block User',
        groupMenusStatus: 'n-vis',
        uploadBtnStatus: 'vis',
        uploadMenuStatus: 'n-vis',
        msgMenusStatus: 'n-vis',
        userMenusStatus: 'n-vis',
        blockUserMenuStatus: 'n-vis',
        noMessagesStatus: 'n-vis',
        contentStatus: 'n-vis',
        loadingIconStatus: 'n-vis',
        errorText: '',
        errorStatus: 'n-vis',
        isSyncing: false
    }
    $scope.convProps = {
        noConvStatus: 'n-vis',
        loadingIconStatus: 'n-vis',
        syncTime: 0,
        isSyncing: false
    }
    $scope.productDetail = {
        title: '',
        subtitle: '',
        icon: '',
        caretStatus: 'n-vis',
        pbwcExpr: '',
        pbStatus: 'n-vis',
        clStatus: 'n-vis'
    }
    var $apz_contact_inner = angular.element('#apz-contact-inner');
    var $apz_msg_inner = angular.element('#apz-message-inner');
    function ApzUtils() {
        var _this = this;
        var emojiTimeoutId;
        var refreshIntervalId;
        var $apz_msg_content = angular.element('#apz-message-panel .apz-panel-content');
        var $apz_msg_inner = angular.element('#apz-message-inner');
        var $apz_textbox_container = angular.element('#apz-textbox-container');
        var $apz_text_box = angular.element('#apz-text-box');
        var $apz_group_create_title = angular.element("#apz-group-create-title");
        var $apz_gi_title = angular.element("#apz-group-info-title-box .apz-group-title");
        var APZ_MESSAGE_PREVIEW_BUBBLE = '<div id="apz-msg-preview" class="apz-msg-preview"><a href="javascript:void(0);" class="applozic-launcher applozic-preview-launcher">' + '<div class="apz-row">' + '<div class="blk-lg-3 apz-preview-icon"></div>' + '<div class="blk-lg-9">' + '<div class="apz-row apz-truncate apz-preview-content">' + '<strong class="apz-preview-cont-name"></strong></div>' + '<div class="apz-row apz-preview-content">' + '<div class="apz-preview-msg-content"></div>' + '<div class="apz-preview-file-content apz-msg-text blk-lg-12 apz-attachment n-vis"></div>' + '</div></div></div></a></div>';
        var APZ_IDLE_TIME_COUNTER = appOptions.IDLE_TIME_LIMIT;
        angular.element(document).on('click', '.fancybox', function(e) {
            var $this = angular.element(this);
            var contentType = $this.data('type');
            if (contentType.indexOf('video') !== -1) {
                var videoTag = $this.find('.mck-video-box').html(),
                    video;
                $this.fancybox({
                    content: videoTag,
                    title: $this.data('name'),
                    padding: 0,
                    'openEffect': 'none',
                    'closeEffect': 'none',
                    helpers: {
                        overlay: {
                            locked: false,
                            css: {
                                'background': 'rgba(0, 0, 0, 0.8)'
                            }
                        }
                    },
                    beforeShow: function() {
                        video = angular.element('.fancybox-inner').find('video').get(0);
                        video.load();
                        video.play();
                    }
                });
            } else {
                var href = $this.data('url');
                $this.fancybox({
                    'openEffect': 'none',
                    'closeEffect': 'none',
                    'padding': 0,
                    'href': href,
                    'type': 'image'
                });
            }
        });
        angular.element(document).on('click', '.applozic-preview-launcher', function(e) {
            var $this = angular.element(this);
            var tabId = $this.data('apz-id');
            var isGroup = $this.data('apz-isgroup');
            var conversationId = $this.data('apz-conversationid');
            var params = {
                tabId: tabId,
                isGroup: isGroup
            };
            if (conversationId) {
                params.conversationId = conversationId;
            }
            $scope.loadTab(params);
            angular.element('#apz-msg-preview').hide();
        });
        _this.onInit = function(data, optns) {
            appOptions = apzStore.getAppOptions();
            if (typeof appOptions === 'object' && appOptions.AUTH_CODE) {
                if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                    apzChannelService.init();
                }
                apzMapLayout.init();
                apzUtils.tabFocused();
                apzUtils.initEmojis();
                $scope.loadConversations({});
                apzUtils.appendMessagePreviewBubble();
                apzGroupLayout.loadGroups();
            }
        };

        _this.setEndOfContenteditable = function(contentEditableElement) {
            var range,
                selection;
            if (document.createRange) // Firefox, Chrome, Opera, Safari, IE 9+
            {
                range = document.createRange(); // Create a range (a range is a like the selection but invisible)
                range.selectNodeContents(contentEditableElement); // Select the entire contents of the element with the range
                range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
                selection = window.getSelection(); // get the selection object (allows you to change selection)
                selection.removeAllRanges(); // remove any selections already made
                selection.addRange(range); // make the range you have just created the visible selection
            } else if (document.selection) // IE 8 and lower
            {
                range = document.body.createTextRange(); // Create a range (a range is a like the selection but invisible)
                range.moveToElementText(contentEditableElement); // Select the entire contents of the element with the range
                range.collapse(false); // collapse the range to the end point. false means collapse to end rather than the start
                range.select(); // Select the range (make it the visible selection
            }
        };
        _this.appendMessagePreviewBubble = function() {
            angular.element('body').append(APZ_MESSAGE_PREVIEW_BUBBLE);
            apzNotificationService.init();
        };
        _this.randomId = function() {
            return window.Math.random().toString(36).substring(7);
        };
        _this.textVal = function($element) {
            var lines = [];
            var line = [];
            var flush = function() {
                lines.push(line.join(''));
                line = [];
            };
            var sanitizeNode = function(node) {
                if (node.nodeType === TEXT_NODE) {
                    line.push(node.nodeValue);
                } else if (node.nodeType === ELEMENT_NODE) {
                    var tagName = node.tagName.toLowerCase();
                    var isBlock = TAGS_BLOCK.indexOf(tagName) !== -1;
                    if (isBlock && line.length) {
                        flush();
                    }
                    if (tagName === 'img') {
                        var alt = node.getAttribute('alt') || '';
                        if (alt) {
                            line.push(alt);
                        }
                        return;
                    } else if (tagName === 'br') {
                        flush();
                    }
                    var children = node.childNodes;
                    for (var i = 0; i < children.length; i++) {
                        sanitizeNode(children[i]);
                    }
                    if (isBlock && line.length) {
                        flush();
                    }
                }
            };
            var children = $element.childNodes;
            for (var i = 0; i < children.length; i++) {
                sanitizeNode(children[i]);
            }
            if (line.length) {
                flush();
            }
            return lines.join('\n');
        };
        _this.tabFocused = function() {
            var hidden = 'hidden';
            // Standards:
            if (hidden in document)
                document.addEventListener('visibilitychange', onchange);
            else if ((hidden === 'mozHidden') in document)
                document.addEventListener('mozvisibilitychange', onchange);
            else if ((hidden === 'webkitHidden') in document)
                document.addEventListener('webkitvisibilitychange', onchange);
            else if ((hidden === 'msHidden') in document)
                document.addEventListener('msvisibilitychange', onchange);
            // IE 9 and lower:
            else if ('onfocusin' in document)
                document.onfocusin = document.onfocusout = onchange;
            // All others:
            else
                window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
            function onchange(evt) {
                var v = true,
                    h = false,
                    evtMap = {
                        focus: v,
                        focusin: v,
                        pageshow: v,
                        blur: h,
                        focusout: h,
                        pagehide: h
                    };
                evt = evt || w.event;
                if (evt.type in evtMap) {
                    IS_TAB_FOCUSED = evtMap[evt.type];
                } else {
                    IS_TAB_FOCUSED = this[hidden] ? false : true;
                }
                if (IS_TAB_FOCUSED) {
                    if (APZ_IDLE_TIME_COUNTER < 1) {
                        apzChannelService.checkConnected();
                    }
                    _this.stopIdleTimeCounter();
                } else {
                    if (APZ_TYPING_STATUS === 1) {
                        if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                            apzChannelService.sendTypingStatus(0);
                        }
                    }
                    _this.manageIdleTime();
                }
            }
            // set the initial state (but only if browser supports the Page
            // Visibility API)
            if (document[hidden] !== undefined)
                onchange({
                    type: document[hidden] ? 'blur' : 'focus'
                });
        };
        _this.manageIdleTime = function() {
            APZ_IDLE_TIME_COUNTER = appOptions.IDLE_TIME_LIMIT;
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }
            refreshIntervalId = $interval(function() {
                if (--APZ_IDLE_TIME_COUNTER < 0) {
                    APZ_IDLE_TIME_COUNTER = 0;
                    apzChannelService.stopConnectedCheck();
                    clearInterval(refreshIntervalId);
                    refreshIntervalId = '';
                }
            }, 60000);
        };
        _this.stopIdleTimeCounter = function() {
            APZ_IDLE_TIME_COUNTER = appOptions.IDLE_TIME_LIMIT;
            if (refreshIntervalId) {
                clearInterval(refreshIntervalId);
            }
            refreshIntervalId = '';
        };
        _this.startsWith = function(matcher, str) {
            if (str === null)
                return false;
            var i = str.length;
            if (matcher.length < i)
                return false;
            for (--i; (i >= 0) && (matcher[i] === str[i]); --i)
                continue;
            return i < 0;
        };
        _this.initEmojis = function() {
            try {
                $apz_text_box.emojiarea({
                    button: '#apz-btn-smiley',
                    wysiwyg: true,
                    menuPosition: 'top'
                });
            } catch (ex) {
                if (!emojiTimeoutId) {
                    emojiTimeoutId = $timeout(function() {
                        _this.initEmojis();
                    }, 30000);
                }
            }
        };
        angular.element(document).bind('click', function(e) {
            if (document.activeElement && document.activeElement.id !== 'apz-msg-sbmt') {
                if ($scope.isTextReq.textbox !== '') {
                    $scope.isTextReq.textbox = '';
                    $timeout(function() {
                        $scope.$apply();
                    }, 100)
                }
            //$apz_textbox_container.removeClass('apz-text-req');
            }
            if (document.activeElement && document.activeElement !== $apz_text_box) {
                if (APZ_TYPING_STATUS === 1) {
                    if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                        apzChannelService.sendTypingStatus(0, $scope.activeContact.id);
                    }
                }
            }

            if (document.activeElement && document.activeElement.id !== 'apz-group-title-save') {
                if ($scope.isTextReq.giTitlebox !== '') {
                    $scope.isTextReq.giTitlebox = '';
                    $timeout(function() {
                        $scope.$apply();
                    }, 100)
                }
            }
            if (document.activeElement && document.activeElement.id !== 'apz-btn-group-create') {
                if ($scope.isTextReq.gcTitlebox !== '') {
                    $scope.isTextReq.gcTitlebox = '';
                    $timeout(function() {
                        $scope.$apply();
                    }, 100)

                }
            // $apz_group_create_title.removeClass('apz-req-border');
            }

            angular.element('.apztypeahead.apz-dropdown-menu').hide();
        });
        angular.element(window).on('resize', function() {
            if ($scope.tabProps.contentStatus === 'vis') {
                var scrollHeight = $apz_msg_inner.get(0).scrollHeight;
                if ($apz_msg_inner.height() < scrollHeight) {
                    $apz_msg_inner.animate({
                        scrollTop: $apz_msg_inner.prop("scrollHeight")
                    }, 0);
                }
            }
        });
        $scope.formatContactId = function(contactId) {
            if (contactId.indexOf('+') === 0) {
                contactId = contactId.substring(1);
            }
            contactId = decodeURIComponent(contactId);
            return contactId.replace(/\@/g, 'AT').replace(/\./g, 'DOT').replace(/\*/g, 'STAR').replace(/\#/g, 'HASH').replace(/\|/g, 'VBAR').replace(/\+/g, 'PLUS').replace(/\;/g, 'SCOLON').replace(/\?/g, 'QMARK').replace(/\,/g, 'COMMA').replace(/\:/g, 'COLON');
        };
    }
    function ApzDateUtils() {
        var _this = this;
        var fullDateFormat = "mmm d, h:MM TT";
        var onlyDateFormat = "mmm d";
        var onlyTimeFormat = "h:MM TT";
        var months = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
        _this.getDate = function(createdAtTime) {
            var date = new Date(parseInt(createdAtTime, 10));
            var currentDate = new Date();
            return ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) ? dateFormat(date, onlyTimeFormat, false) : dateFormat(date, fullDateFormat, false);
        };
        _this.getLastSeenAtStatus = function(lastSeenAtTime) {
            var date = new Date(parseInt(lastSeenAtTime, 10));
            var currentDate = new Date();
            if ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) {
                var hoursDiff = currentDate.getHours() - date.getHours();
                var timeDiff = Math.floor((currentDate.getTime() - date.getTime()) / 60000);
                if (timeDiff < 60) {
                    return (timeDiff <= 1) ? 'Last seen 1 min ago' : 'Last seen ' + timeDiff + ' mins ago';
                }
                return (hoursDiff === 1) ? 'Last seen 1 hour ago' : 'Last seen ' + hoursDiff + ' hours ago';
            } else if ( ((currentDate.getDate() - date.getDate() === 1) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) ) {
                return 'Last seen on yesterday';
            } else {
                return 'Last seen on ' + dateFormat(date, onlyDateFormat, false);
            }
        };
        _this.getTimeOrDate = function(createdAtTime, timeFormat) {
            var date = new Date(parseInt(createdAtTime, 10));
            var currentDate = new Date();
            if (timeFormat) {
                return ((currentDate.getDate() === date.getDate()) && (currentDate.getMonth() === date.getMonth()) && (currentDate.getYear() === date.getYear())) ? dateFormat(date, onlyTimeFormat, false) : dateFormat(date, onlyDateFormat, false);
            } else {
                return dateFormat(date, fullDateFormat, false);
            }
        };
        _this.getSystemDate = function(time) {
            var date = new Date(parseInt(time, 10));
            return dateFormat(date, fullDateFormat, false);
        };
        var dateFormat = function() {
            var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
                timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
                timezoneClip = /[^-+\dA-Z]/g,
                pad = function(val, len) {
                    val = String(val);
                    len = len || 2;
                    while (val.length < len)
                    val = "0" + val;
                    return val;
                };
            // Regexes and supporting functions are cached through closure
            return function(date, mask, utc) {
                var dF = dateFormat;
                // You can't provide utc if you skip other args (use the
                // "UTC:" mask prefix)
                if (arguments.length === 1 && Object.prototype.toString.call(date) === '[object String]' && !/\d/.test(date)) {
                    mask = date;
                    date = undefined;
                }
                // Passing date through Date applies Date.parse, if
                // necessary
                date = date ? new Date(date) : new Date;
                if (isNaN(date))
                    throw SyntaxError('invalid date');
                mask = String(mask);
                // mask = String(dF.masks[mask] || mask ||
                // dF.masks["default"]);
                // Allow setting the utc argument via the mask
                if (mask.slice(0, 4) === 'UTC:') {
                    mask = mask.slice(4);
                    utc = true;
                }
                var _ = utc ? 'getUTC' : 'get',
                    d = date[_ + 'Date'](),
                    D = date[_ + 'Day'](),
                    m = date[_ + 'Month'](),
                    y = date[_ + 'FullYear'](),
                    H = date[_ + 'Hours'](),
                    M = date[_ + 'Minutes'](),
                    s = date[_ + 'Seconds'](),
                    L = date[_ + 'Milliseconds'](),
                    o = utc ? 0 : date.getTimezoneOffset(),
                    flags = {
                        d: d,
                        dd: pad(d),
                        ddd: dF.i18n.dayNames[D],
                        dddd: dF.i18n.dayNames[D + 7],
                        m: m + 1,
                        mm: pad(m + 1),
                        mmm: dF.i18n.monthNames[m],
                        mmmm: dF.i18n.monthNames[m + 12],
                        yy: String(y).slice(2),
                        yyyy: y,
                        h: H % 12 || 12,
                        hh: pad(H % 12 || 12),
                        H: H,
                        HH: pad(H),
                        M: M,
                        MM: pad(M),
                        s: s,
                        ss: pad(s),
                        l: pad(L, 3),
                        L: pad(L > 99 ? Math.round(L / 10) : L),
                        t: H < 12 ? 'a' : 'p',
                        tt: H < 12 ? 'am' : 'pm',
                        T: H < 12 ? 'A' : 'P',
                        TT: H < 12 ? 'AM' : 'PM',
                        Z: utc ? 'UTC' : (String(date).match(timezone) || [ '' ]).pop().replace(timezoneClip, ''),
                        o: (o > 0 ? '-' : '+') + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                        S: [ 'th', 'st', 'nd', 'rd' ][d % 10 > 3 ? 0 : (d % 100 - d % 10 !== 10) * d % 10]
                    };
                return mask.replace(token, function($0) {
                    return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
                });
            };
        }();
        // Some common format strings
        dateFormat.masks = {
            'default': "mmm d, yyyy h:MM TT",
            fullDateFormat: "mmm d, yyyy h:MM TT",
            onlyDateFormat: "mmm d",
            onlyTimeFormat: "h:MM TT",
            mailDateFormat: "mmm d, yyyy",
            mediumDate: "mmm d, yyyy",
            longDate: "mmmm d, yyyy",
            fullDate: "dddd, mmmm d, yyyy",
            shortTime: "h:MM TT",
            mediumTime: "h:MM:ss TT",
            longTime: "h:MM:ss TT Z",
            isoDate: "yyyy-mm-dd",
            isoTime: "HH:MM:ss",
            isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
            isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
        };
        // Internationalization strings
        dateFormat.i18n = {
            dayNames: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
            monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]
        };
    }
    function ApzContextualUtils() {
        var _this = this;
        _this.getTopicLink = function(topicLink) {
            return (topicLink) ? '<img src="' + topicLink + '">' : '<span class="apz-icon-no-image"></span>';
        };
    }
    function ApzContactUtils() {
        var _this = this;
        _this.getContactId = function(contact) {
            var contactId = contact.id;
            return $scope.formatContactId(contactId);
        };
        _this.getContact = function(contactId) {
            if (typeof APZ_CONTACT_MAP[contactId] === 'object') {
                return APZ_CONTACT_MAP[contactId];
            } else {
                return;
            }
        };
        _this.fetchContact = function(contactId) {
            var contact = _this.getContact(contactId);
            if (typeof contact === 'undefined') {
                contact = _this.createContact(contactId);
            }
            return contact;
        };
        _this.createContact = function(contactId) {
            var formatId = $scope.formatContactId(contactId);
            var contact = {
                'id': contactId,
                'htmlId': formatId,
                'elementId': 'user-' + formatId,
                'displayName': contactId,
                'imageLink': '',
                'email': '',
                'isGroup': false
            };
            APZ_CONTACT_MAP[contactId] = contact;
            return contact;
        };
        _this.createContactWithDetail = function(data) {
            var displayName = (data.displayName) ? data.displayName : contactId;
            var contactId = data.userId;
            var imageLink = (data.imageLink) ? data.imageLink : '';
            var formatId = $scope.formatContactId(contactId);
            var contact = {
                'id': contactId,
                'htmlId': formatId,
                'elementId': 'user-' + formatId,
                'displayName': displayName,
                'imageLink': '',
                'subTitle': data.subTitle,
                'email': '',
                'isGroup': false
            };
            APZ_CONTACT_MAP[contactId] = contact;
            return contact;
        };
        _this.updateContactDetail = function(contact, data) {
            if (data.displayName) {
                contact.displayName = data.displayName;
            }
            contact.subTitle = data.subTitle;
            if (data.imageLink) {
                contact.imageLink = data.imageLink;
            }
            APZ_CONTACT_MAP[data.userId] = contact;
            return contact;
        };
        _this.getUserIdArrayFromMessage = function(message) {
            var tos = message.to;
            if (tos.lastIndexOf(',') === tos.length - 1) {
                tos = tos.substring(0, tos.length - 1);
            }
            return tos.split(',');
        };
        _this.getTabDisplayName = function(tabId, isGroup, userName) {
            if (isGroup) {
                return apzGroupUtils.getGroupDisplayName(tabId);
            } else {
                var displayName = '';
                if (typeof (appOptions.GETUSERNAME) === 'function') {
                    displayName = appOptions.GETUSERNAME(tabId);
                }
                if (!displayName && userName) {
                    displayName = userName;
                }
                var contact = _this.fetchContact('' + tabId);
                if (!displayName) {
                    displayName = (contact.displayName) ? contact.displayName : contact.id;
                }
                contact.displayName = displayName;
                APZ_CONTACT_MAP[contact.id] = contact;
                return displayName;
            }
        };
        _this.getContactImageLink = function(contact, displayName) {
            var imgsrctag = '';
            if (contact.isGroup) {
                imgsrctag = apzGroupUtils.getGroupImage(contact.imageUrl);
            } else {
                if (typeof (appOptions.GETUSERIMAGE) === 'function') {
                    var imgsrc = appOptions.GETUSERIMAGE(contact.id);
                    if (imgsrc && typeof imgsrc !== 'undefined') {
                        imgsrctag = '<img src="' + imgsrc + '"/>';
                    }
                }
                if (!imgsrctag) {
                    if (contact.imageLink) {
                        imgsrctag = '<img src="' + contact.imageLink + '"/>';
                    } else {
                        if (!displayName) {
                            displayName = contact.displayName;
                        }
                        imgsrctag = _this.getContactImageByAlphabet(displayName);
                    }
                }
            }
            return imgsrctag;
        };
        _this.getContactImageByAlphabet = function(name) {
            if (typeof name === 'undefined' || name === '') {
                return '<div class="apz-alpha-contact-image alpha-user"><span class="apz-icon-user"></span></div>';
            }
            var first_alpha = name.charAt(0);
            var letters = /^[a-zA-Z]+$/;
            if (first_alpha.match(letters)) {
                first_alpha = first_alpha.toUpperCase();
                return '<div class="apz-alpha-contact-image alpha_' + first_alpha + '"><span class="apz-contact-icon">' + first_alpha + '</span></div>';
            } else {
                return '<div class="apz-alpha-contact-image alpha_user"><span class="apz-icon-user"></span></div>';
            }
        };
        _this.getNameTextClassByAlphabet = function(name) {
            if (typeof name === 'undefined' || name === '') {
                return 'apz-text-user';
            }
            name = name.toString();
            var first_alpha = name.charAt(0);
            var letters = /^[a-zA-Z]+$/;
            if (first_alpha.match(letters)) {
                first_alpha = first_alpha.toLowerCase();
                return 'apz-text-' + first_alpha;
            } else {
                return 'apz-text-user';
            }
        };
        _this.updateLastSeenStatus = function(userDetail) {
            if (userDetail.connected) {
                APZ_OL_MAP[userDetail.userId] = true;
            } else {
                APZ_OL_MAP[userDetail.userId] = false;
                if (typeof userDetail.lastSeenAtTime !== 'undefined') {
                    APZ_LAST_SEEN_AT_MAP[userDetail.userId] = userDetail.lastSeenAtTime;
                }
            }
        };
        _this.updateConversationMaps = function(conversationPxy) {
            $scope.APZ_CONVERSATION_MAP[conversationPxy.id] = conversationPxy;
            APZ_TOPIC_CONVERSATION_MAP[conversationPxy.topicId] = [ conversationPxy.id ];
            if (conversationPxy.topicDetail) {
                try {
                    $scope.APZ_TOPIC_DETAIL_MAP[conversationPxy.topicId] = $.parseJSON(conversationPxy.topicDetail);
                } catch (ex) {
                    console.log('Incorect Topic Detail!');
                }
            }
        };
        _this.addConversationPxyToMap = function(contact, conversationPxy) {
            if (typeof APZ_TAB_CONVERSATION_MAP[contact.elementId] !== 'undefined') {
                var tabConvArray = APZ_TAB_CONVERSATION_MAP[contact.elementId];
                var isConversationAdded = false;
                angular.forEach(tabConvArray, function(conv, i) {
                    if (conv.id === conversationPxy.id) {
                        isConversationAdded = true;
                    }
                });
                if (!isConversationAdded) {
                    tabConvArray.push(conversationPxy);
                    APZ_TAB_CONVERSATION_MAP[contact.elementId] = tabConvArray;
                }
            }
        };
    }
    function ApzMessageUtils() {
        var _this = this;
        var $apz_text_box = angular.element('#apz-text-box');
        _this.getMessageTextForContactPreview = function(message, contact, size) {
            var emoji_template = '';
            if (typeof message !== 'undefined') {
                if (message.message) {
                    if (message.contentType === 2) {
                        emoji_template = '<span class="apz-icon-marker"></span>';
                    } else {
                        var msg = message.message;
                        if (apzUtils.startsWith(msg, '<img')) {
                            return '<span class="apz-icon-camera"></span>&nbsp;<span>image</span>';
                        } else {
                            emoji_template = emoji.replace_unified(msg);
                            emoji_template = emoji.replace_colons(emoji_template);
                            emoji_template = (emoji_template.indexOf('</span>') !== -1) ? emoji_template.substring(0, emoji_template.lastIndexOf('</span>')) : emoji_template.substring(0, size);
                        }
                        if (!contact.isGroup) {
                            if (emoji_template.indexOf('emoji-inner') === -1 && message.contentType === 0) {
                                var x = document.createElement('p');
                                x.appendChild(document.createTextNode(emoji_template));
                                emoji_template = x;
                            }
                        }
                    }
                } else if (message.fileMetaKey && typeof message.fileMeta === 'object') {
                    emoji_template = apzFileUtils.getFileIcon(message);
                //  emoji_template = (message.fileMeta.contentType.indexOf("image") !== -1) ? '<span class="mck-icon-camera"></span>&nbsp;<span>image</span>' : '<span class="mck-icon-attachment"></span>&nbsp;<span>file</span>';
                }
                if (contact.isGroup && contact.type !== 3) {
                    var msgFrom = (message.to.split(',')[0] === appOptions.USER_ID) ? 'Me' : apzContactUtils.getTabDisplayName(message.to.split(',')[0], false);
                    if (message.contentType !== 10) {
                        emoji_template = msgFrom + ': ' + emoji_template;
                    }
                    if (emoji_template.indexOf('emoji-inner') === -1 && message && message.message && message.contentType === 0) {
                        var x = document.createElement('p');
                        x.appendChild(document.createTextNode(emoji_template));
                        emoji_template = x;
                    }
                }
            }
            if (typeof emoji_template === 'object') {
                var tmp = document.createElement('div');
                tmp.appendChild(emoji_template);
                emoji_template = tmp.innerHTML;
            }
            return emoji_template;
        };
        _this.getTextForMessagePreview = function(message, contact) {
            var emoji_template = '';
            if (typeof message !== 'undefined') {
                if (message.contentType === 2) {
                    emoji_template = 'Shared location';
                } else if (message.message) {
                    var msg = message.message;
                    if (apzUtils.startsWith(msg, '<img')) {
                        emoji_template = 'Image attachment';
                    } else {
                        var x = document.createElement('div');
                        x.innerHTML = msg;
                        msg = apzUtils.textVal(x).trim();
                        emoji_template = msg.substring(0, 50);
                    }
                } else if (message.fileMetaKey && typeof message.fileMeta === 'object') {
                    emoji_template = (message.fileMeta.contentType.indexOf('image') !== -1) ? 'Image attachment' : 'File attachment';
                }
                if (contact.isGroup && contact.type !== 3) {
                    var msgFrom = (message.to.split(',')[0] === appOptions.USER_ID) ? 'Me' : apzContactUtils.getTabDisplayName(message.to.split(',')[0], false);
                    emoji_template = msgFrom + ': ' + emoji_template;
                }
            }
            return emoji_template;
        };
        _this.getStatusIcon = function(msg) {
            return '<span class="' + _this.getStatusIconName(msg) + ' apz-move-right ' + msg.key + '_status status-icon"></span>';
        };
        _this.getStatusIconName = function(msg) {
            if (msg.type === 7 || msg.type === 6 || msg.type === 4 || msg.type === 0) {
                return '';
            }
            if (msg.status === 5) {
                return 'apz-icon-read';
            }
            if (msg.status === 4) {
                return 'apz-icon-delivered';
            }
            if (msg.type === 3 || msg.type === 5 || (msg.type === 1 && (msg.source === 0 || msg.source === 1))) {
                return 'apz-icon-sent';
            }
            return 'apz-icon-time';
        };
        _this.getStatusTitle = function(statusIcon) {
            switch (statusIcon) {
                case 'apz-icon-time':
                    return "pending";
                    break;
                case 'apz-btn-trash':
                    return 'delete';
                    break;
                case 'apz-icon-sent':
                    return 'sent';
                    break;
                case 'apz-btn-forward':
                    return 'forward message';
                    break;
                case 'apz-icon-delivered':
                    return 'delivered';
                    break;
                case 'apz-icon-read':
                    return 'delivered and read';
                    break;
            }
        };
        _this.getMessageFeed = function(message) {
            var messageFeed = {};
            messageFeed.key = message.key;
            messageFeed.timeStamp = message.createdAtTime;
            messageFeed.message = message.message;
            messageFeed.from = (message.type === 4) ? message.to : appOptions.USER_ID;
            if (message.groupId) {
                messageFeed.to = message.groupId;
            } else {
                messageFeed.to = (message.type === 5) ? message.to : appOptions.USER_ID;
            }
            messageFeed.status = 'read';
            messageFeed.type = (message.type === 4) ? 'inbox' : 'outbox';
            if (message.type === 5) {
                if (message.status === 3) {
                    messageFeed.status = 'sent';
                } else if (message.status === 4) {
                    messageFeed.status = 'delivered';
                }
            }
            if (typeof message.fileMeta === 'object') {
                var file = $.extend({}, message.fileMeta);
                file.url = appOptions.FILE_URL + '/rest/ws/aws/file/' + message.fileMeta.blobKey;
                delete file.blobKey;
                messageFeed.file = file;
            }
            return messageFeed;
        };
        _this.addDraftMessage = function(tabId) {
            if (tabId && typeof $scope.APZ_TAB_MESSAGE_DRAFT[tabId] === 'object') {
                var draftMessage = $scope.APZ_TAB_MESSAGE_DRAFT[tabId];
                $apz_text_box.html(draftMessage.text);
                if (draftMessage.files.length > 0) {
                    $scope.files = draftMessage.files;
                }
            }
        };
        _this.updateDraftMessage = function(tabId, file) {
            if (typeof fileMeta === 'object') {
                var tab_draft = {
                    'text': '',
                    files: []
                };
                if ((typeof tabId !== 'undefined') && (typeof $scope.APZ_TAB_MESSAGE_DRAFT[tabId] === 'object')) {
                    tab_draft = $scope.APZ_TAB_MESSAGE_DRAFT[tabId];
                    angular.forEach(tab_draft.files, function(oldFile, i) {
                        if (oldFile.id === file.id) {
                            tab_draft.files[i] = file;
                        }
                    });
                }
            }
            $scope.APZ_TAB_MESSAGE_DRAFT[tabId] = tab_draft;
        };
    }
    function ApzGroupUtils() {
        var _this = this;
        _this.getGroup = function(groupId) {
            if (typeof APZ_GROUP_MAP[groupId] === 'object') {
                return APZ_GROUP_MAP[groupId];
            } else {
                return;
            }
        };
        _this.getGroupByClientGroupId = function(clientGroupId) {
            if (typeof APZ_CLIENT_GROUP_MAP[clientGroupId] === 'object') {
                return APZ_CLIENT_GROUP_MAP[clientGroupId];
            } else {
                return;
            }
        };
        _this.removeMemberFromGroup = function(group, userId) {
            if (typeof group.removedMembersId !== 'object'
                || group.removedMembersId.length < 1) {
                group.removedMembersId = [ userId ];
            } else {
                var isAdded = false;
                angular.forEach(group.removedMembersId, function(rgm, i) {
                    if (rgm === userId) {
                        isAdded = true;
                    }
                });
                if (!isAdded) {
                    group.removedMembersId.push(userId);
                }
            }
            APZ_GROUP_MAP[group.id] = group;
            return group;
        };
        _this.addMemberToGroup = function(group, userId) {
            if (typeof group.members === 'object') {
                var isAdded = false;
                angular.forEach(group.members, function(gm, i) {
                    if (gm === userId) {
                        isAdded = true;
                    }
                });
                if (!isAdded) {
                    group.members.push(userId);
                }
                if (typeof group.removedMembersId === 'object') {
                    angular.forEach(group.removedMembersId, function(rgm, i) {
                        if (rgm === userId) {
                            group.removedMembersId.splice(i, 1);
                        }
                    });
                }
                APZ_GROUP_MAP[group.id] = group;
            }
            return group;
        };
        _this.getGroupDisplayName = function(groupId) {
            if (typeof APZ_GROUP_MAP[groupId] === 'object') {
                var group = APZ_GROUP_MAP[groupId];
                var displayName = group['displayName'];
                if (group.type === 3) {
                    if (displayName.indexOf(appOptions.USER_ID) !== -1) {
                        displayName = displayName.replace(appOptions.USER_ID, '').replace(':', '');
                        if (typeof (appOptions.GETUSERNAME) === 'function') {
                            var name = (appOptions.GETUSERNAME(displayName));
                            displayName = (name) ? name : displayName;
                        }
                    }
                }
                if (!displayName && group.type === 5) {
                    displayName = 'Broadcast';
                }
                if (!displayName) {
                    displayName = group.id;
                }
                return displayName;
            } else {
                return groupId;
            }
        };
        _this.getGroupImage = function(imageSrc) {
            return (imageSrc) ? '<img src="' + imageSrc + '"/>' : '<img src="' + appOptions.BASE_URL + '/resources/sidebox/css/app/images/mck-icon-group.png"/>';
        };
        _this.getGroupDefaultIcon = function() {
            return '<div class="apz-group-icon-default"></div>';
        };
        _this.addGroup = function(group) {
            var name = (group.name) ? group.name : group.id;
            var formatId = $scope.formatContactId('' + group.id);
            var groupFeed = {
                'id': group.id.toString(),
                'htmlId': formatId,
                'displayName': name,
                'elementId': 'group-' + formatId,
                'adminName': group.adminName,
                'type': group.type,
                'imageUrl': group.imageUrl,
                'members': group.membersName,
                'removedMembersId': group.removedMembersId,
                'clientGroupId': group.clientGroupId,
                'isGroup': true
            };
            APZ_GROUP_MAP[group.id] = groupFeed;
            if (group.clientGroupId) {
                APZ_CLIENT_GROUP_MAP[group.clientGroupId] = groupFeed;
            }
            return groupFeed;
        };
        _this.createGroup = function(groupId) {
            var group = {
                'id': groupId.toString(),
                'htmlId': $scope.formatContactId('' + groupId),
                'displayName': groupId.toString(),
                'type': 2,
                'imageUrl': '',
                'adminName': '',
                'removedMembersId': [],
                'clientGroupId': '',
                'isGroup': true
            };
            APZ_GROUP_MAP[groupId] = group;
            return group;
        };
        _this.loadGroups = function(groups) {
            if (groups.length > 0) {
                APZ_GROUP_ARRAY.length = 0;
                angular.forEach(groups, function(group, i) {
                    if (typeof group.id !== "undefined") {
                        var group = _this.addGroup(group);
                        APZ_GROUP_ARRAY.push(group);
                    }
                });
            }
        };
        _this.isGroupLeft = function(group) {
            var isGroupLeft = false;
            if (group.removedMembersId && group.removedMembersId.length > 0) {
                angular.forEach(group.removedMembersId, function(removedMemberId, i) {
                    if (removedMemberId === appOptions.USER_ID) {
                        isGroupLeft = true;
                    }
                });
            }
            return isGroupLeft;
        };
    }
    function ApzFileUtils() {
        var _this = this;
        var ONE_KB = 1024;
        var ONE_MB = 1048576;
        var APZ_UPLOAD_VIA = [ 'CREATE', 'UPDATE' ];
        var $apz_overlay = angular.element('.apz-overlay');
        var $apz_msg_sbmt = angular.element('#apz-msg-sbmt');
        var $apz_file_input = angular.element('#apz-file-input');
        var $apz_msg_inner = angular.element('#apz-message-inner');
        var $apz_file_upload = angular.element('.apz-file-upload');
        var $file_container = angular.element('#apz-file-container');
        var $apz_group_icon_upload = angular.element('#apz-group-icon-upload');
        var $apz_group_icon_change = angular.element('#apz-group-icon-change');
        var $apz_group_info_icon_panel = angular.element('#apz-group-info-icon-panel');
        var $apz_group_create_icon_panel = angular.element('#apz-group-create-icon-panel');
        var FILE_AWS_UPLOAD_URL = '/rest/ws/upload/file';
        var FILE_PREVIEW_URL = '/rest/ws/aws/file/';
        $scope.$watch('activeFile.id', function(activeFileId) {
            var activeFile = $scope.activeFile;
            if (activeFileId) {
                $scope.uploadFile(activeFile);
            }
        });
        _this.uplaodFileToAWS = function(file, medium) {
            var uploadErrors = [];
            if (typeof file === 'undefined') {
                return;
            }
            if (file['type'].indexOf('image') === -1) {
                uploadErrors.push('Please upload image file.');
            }
            if (uploadErrors.length > 0) {
                alert(uploadErrors.toString());
            } else {
                $apz_overlay.attr('disabled', true);
                if (APZ_UPLOAD_VIA[0] === medium) {
                    $scope.gcProps.overlayStatus = '';
                    $scope.gcProps.hoverStatus = '';
                    $scope.gcProps.iconLoadingStatus = 'vis';
                    $scope.$apply();
                } else {
                    $scope.giProps.overlayStatus = '';
                    $scope.giProps.hoverStatus = '';
                    $scope.giProps.iconLoadingStatus = 'vis';
                    $scope.$apply();
                }
                var xhr = new XMLHttpRequest();
                xhr.addEventListener('load', function(e) {
                    var fileUrl = this.responseText;
                    if (fileUrl) {
                        if (APZ_UPLOAD_VIA[0] === medium) {
                            $scope.gcProps.icon = $sce.trustAsHtml('<img src="' + fileUrl + '"/>');
                            $scope.gcProps.iconUrl = fileUrl;
                            $scope.gcProps.overlayLabel = 'Change Group Icon';
                            $scope.gcProps.iconLoadingStatus = 'n-vis';
                            $scope.gcProps.hoverStatus = 'apz-hover-on';
                            $scope.$apply();
                        } else {
                            $scope.giProps.icon = $sce.trustAsHtml('<img src="' + fileUrl + '"/>');
                            $scope.giProps.iconUrl = fileUrl;
                            $scope.giProps.iconLoadingStatus = 'n-vis';
                            $scope.giProps.hoverStatus = 'apz-hover-on';
                            $timeout(function() {
                                $scope.giProps.saveIconStatus = 'vis';
                                $scope.$apply();
                            }, 1500);
                        }
                        $timeout(function() {
                            if (APZ_UPLOAD_VIA[0] === medium) {
                                $scope.gcProps.overlayStatus = 'n-vis';
                            } else {
                                $scope.giProps.overlayStatus = 'n-vis';
                            }
                        }, 1500);
                    }
                    $apz_overlay.attr('disabled', false);
                    (APZ_UPLOAD_VIA[0] === medium) ? $apz_group_icon_upload.val('') : $apz_group_icon_change.val('');
                    return false;
                });
                apzService.uploadFileToAWS(xhr, file);
            }
        };
        $scope.attachFile = function($event) {
            $apz_file_input.trigger('click');
        };
        $apz_group_icon_upload.on('change', function() {
            var file = angular.element(this)[0].files[0];
            _this.uplaodFileToAWS(file, APZ_UPLOAD_VIA[0]);
            return false;
        });
        $apz_group_icon_change.on('change', function() {
            var file = angular.element(this)[0].files[0];
            _this.uplaodFileToAWS(file, APZ_UPLOAD_VIA[1]);
            return false;
        });
        $apz_file_input.on('change', function() {
            var data = new Object();
            var file = angular.element(this)[0].files[0];
            var uploadErrors = [];
            if (typeof file === 'undefined') {
                return;
            }
            if ($scope.files.length > 4) {
                uploadErrors.push("Can't upload more than 5 files at a time");
            }
            if (file['size'] > (appOptions.FILEMAXSIZE * ONE_MB)) {
                uploadErrors.push('file size can not be more than ' + appOptions.FILEMAXSIZE + ' MB');
            }
            if (uploadErrors.length > 0) {
                alert(uploadErrors.toString());
            } else {
                var randomId = apzUtils.randomId();
                var filebox = apzFileUtils.getFilebox(randomId, file);
                $scope.files.push(filebox);
                $scope.$apply();
                $timeout(function() {
                    $scope.activeFile = filebox;
                }, 'fast');

            }
        });
        $scope.uploadFile = function(activeFile) {
            var $fileContainer = angular.element('.apz-file-box.' + activeFile.id);
            var $file_name = angular.element('.apz-file-box.' + activeFile.id + ' .apz-file-lb');
            var $file_progressbar = angular.element('.apz-file-box.' + activeFile.id + ' .apz-progress-bar .apz-bar-icon');
            var $file_progress = angular.element('.apz-file-box.' + activeFile.id + ' .apz-progress-bar');
            var $file_remove = angular.element('.apz-file-box.' + activeFile.id + ' .apz-remove-file');
            $file_progress.removeClass('n-vis').addClass('vis');
            $file_remove.attr('disabled', true);
            $apz_file_upload.attr('disabled', true);
            $file_container.removeClass('n-vis').addClass('vis');
            if (activeFile.name === angular.element('.apz-file-box.' + activeFile.id + ' .apz-file-lb a').html()) {
                var contact = ($scope.activeContact.isGroup) ? apzGroupUtils.getGroup($scope.activeContact.id) : apzContactUtils.getContact($scope.activeContact.id);
                $apz_msg_sbmt.attr('disabled', true);
                var data = new Object();
                data.files = [ activeFile.file ];
                var xhr = new XMLHttpRequest();
                (xhr.upload || xhr).addEventListener('progress', function(e) {
                    var progress = parseInt(e.loaded / e.total * 100, 10);
                    $file_progressbar.css('width', progress + '%');
                });
                xhr.addEventListener('load', function(e) {
                    var responseJson = $.parseJSON(this.responseText);
                    if (typeof responseJson.fileMeta === 'object') {
                        var file_meta = responseJson.fileMeta;
                        var fileNameExpr = apzFileUtils.getFilePreviewPath(file_meta);
                        var name = file_meta.name;
                        var size = file_meta.size;
                        /*
                         * var uniqueId = name + size; var fileTabId = APZ_TAB_FILE_DRAFT[uniqueId];
                         */
                        activeFile.nameExpr = $sce.trustAsHtml(fileNameExpr);
                        activeFile.fileMeta = file_meta;
                        if (contact.elementId !== $scope.activeContact.htmlId) {
                            apzMessageLayout.updateDraftMessage(contact.elementId, activeFile);
                            /* delete APZ_TAB_FILE_DRAFT[uniqueId]; */
                            return;
                        }
                        $file_remove.attr('disabled', false);
                        $apz_file_upload.attr('disabled', false);
                        $apz_msg_sbmt.attr('disabled', false);
                        /* delete APZ_TAB_FILE_DRAFT[uniqueId]; */
                        angular.forEach($scope.files, function(currFile, i) {
                            if (currFile.id === activeFile.id) {
                                $scope.files[i] = activeFile;
                            }
                        });
                        // $file_name.html(fileNameExpr);
                        $file_progress.removeClass('vis').addClass('n-vis');
                        // FILE_META.push(file_meta);
                        // $fileContainer.data('mckfile', file_meta);
                        $apz_file_input.val('');
                        return false;
                    } else {
                        $file_remove.attr('disabled', false);
                        $apz_msg_sbmt.attr('disabled', false);
                        $file_remove.trigger('click');
                    }
                });
                var stateList = apzService.uploadFile();
                stateList.then(function(response) {
                    apzService.saveFileMeta(xhr, response.data, activeFile.file);
                }, function() {});
            }
        };
        _this.getFilebox = function(randomId, file) {
            return {
                id: randomId,
                name: file.name,
                size: file.size,
                file: file,
                nameExpr: $sce.trustAsHtml('<a href="#">' + file.name + '</a>'),
                sizeExpr: _this.getFilePreviewSize(file.size)
            };
        };
        _this.getFilePath = function(msg) {
            if (msg.contentType === 2) {
                try {
                    var geoLoc = $.parseJSON(msg.message);
                    if (geoLoc.lat && geoLoc.lon) {
                        return '<a href="http://maps.google.com/maps?z=17&t=m&q=loc:' + geoLoc.lat + "," + geoLoc.lon + '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' + geoLoc.lat + "," + geoLoc.lon + '&maptype=roadmap&markers=color:red|' + geoLoc.lat + "," + geoLoc.lon + '"/></a>';
                    }
                } catch (ex) {
                    if (msg.message.indexOf(',') !== -1) {
                        return '<a href="http://maps.google.com/maps?z=17&t=m&q=loc:' + msg.message + '" target="_blank"><img src="https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=200x150&center=' + msg.message + '&maptype=roadmap&markers=color:red|' + msg.message + '" /></a>';
                    }
                }
            }
            if (typeof msg.fileMeta === 'object') {
                if (msg.fileMeta.contentType.indexOf('image') !== -1) {
                    if (msg.fileMeta.contentType.indexOf('svg') !== -1) {
                        return '<a href="javascript:void(0);" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" area-hidden="true"></img></a>';
                    } else if (msg.contentType === 5) {
                        return '<a href="javascript:void(0);" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + msg.fileMeta.blobKey + '" area-hidden="true"></img></a>';
                    } else {
                        return '<a href="javascript:void(0);" role="link" class="file-preview-link fancybox-media fancybox" data-type="' + msg.fileMeta.contentType + '" data-url="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" data-name="' + msg.fileMeta.name + '"><img src="' + msg.fileMeta.thumbnailUrl + '" area-hidden="true" ></img></a>';
                    }
                } else if (msg.fileMeta.contentType.indexOf('video') !== -1) {
                    return '<video controls class="apz-video-player">' + '<source src="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="video/mp4">' + '<source src="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="video/ogg">Your browser does not support the video tag.</video>';
                } else if (msg.fileMeta.contentType.indexOf('audio') !== -1) {
                    return '<audio controls class="apz-audio-player">' +
                        '<source src="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="audio/ogg">' +
                        '<source src="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" type="audio/mpeg">Your browser does not support the audio element.</audio>' +
                        '<p class="mck-file-tag"><span class="file-name">' + msg.fileMeta.name + '</span>&nbsp;<span class="file-size">' + apzFileUtils.getFilePreviewSize(msg.fileMeta.size) + '</span></p>';
                } else {
                    return '<a href="' + appOptions.FILE_URL + FILE_PREVIEW_URL + msg.fileMeta.blobKey + '" role="link" class="file-preview-link" target="_blank"><span class="file-detail"><span class="mck-file-name"><span class="apz-icon-attachment"></span>&nbsp;' + msg.fileMeta.name + '</span>&nbsp;<span class="file-size">' + apzFileUtils.getFilePreviewSize(msg.fileMeta.size) + '</span></span></a>';
                }
            }
            return '';
        };
        _this.getFilePreviewSize = function(fileSize) {
            if (fileSize) {
                if (fileSize > ONE_MB) {
                    return '(' + parseInt(fileSize / ONE_MB) + ' MB)';
                } else if (fileSize > ONE_KB) {
                    return '(' + parseInt(fileSize / ONE_KB) + ' KB)';
                } else {
                    return '(' + parseInt(fileSize) + ' B)';
                }
            }
            return '';
        };
        _this.getFilePreviewPath = function(fileMeta) {
            return (typeof fileMeta === 'object') ? '<a href="' + appOptions.FILE_URL + FILE_PREVIEW_URL + fileMeta.blobKey + '" target="_blank">' + fileMeta.name + '</a>' : "";
        };
        _this.getFileIcon = function(msg) {
            if (typeof msg.fileMeta === 'object') {
                if (msg.fileMeta.contentType.indexOf('image') !== -1) {
                    return '<span class="apz-icon-camera"></span>&nbsp;<span>image</span>'
                } else if (msg.fileMeta.contentType.indexOf('audio') !== -1) {
                    return '<span class="apz-icon-attachment"></span>&nbsp;<span>Audio</span>';
                } else if (msg.fileMeta.contentType.indexOf('video') !== -1) {
                    return '<span class="apz-icon-attachment"></span>&nbsp;<span>Video</span>';
                } else {
                    return '<span class="apz-icon-attachment"></span>&nbsp;<span>File</span>';
                }
            } else {
                return '';
            }
        };
        $scope.deleteFileMeta = function(blobKey) {
            if (blobKey) {
                var stateList = apzService.deleteFileMeta(blobKey);
                stateList.then(function(response) {}, function() {});
            }
        };
    }
    function ApzContextualLayout() {
        var _this = this;
        $scope.setProductProperties = function(topicDetail, hideCaret) {
            if (appOptions.IS_TOPIC_BOX_ENABLED) {
                $scope.productDetail.title = topicDetail.title;
                $scope.productDetail.icon = $sce.trustAsHtml(apzContextualUtils.getTopicLink(topicDetail.link));
                $scope.productDetail.subtitle = (topicDetail.subtitle) ? topicDetail.subtitle : '';
                $scope.productDetail.key1 = (topicDetail.key1) ? topicDetail.key1 : '';
                $scope.productDetail.value1 = (topicDetail.value1) ? ':' + topicDetail.value1 : '';
                $scope.productDetail.key2 = (topicDetail.key2) ? topicDetail.key2 : '';
                $scope.productDetail.value2 = (topicDetail.value2) ? ':' + topicDetail.value2 : '';
                if (hideCaret) {
                    $scope.productDetail.caretStatus = 'n-vis';
                    $scope.productDetail.pbwcExpr = 'apz-product-box-wc';
                    $scope.productDetail.clStatus = 'n-vis';
                    $scope.productDetail.pbStatus = 'vis';
                }
            }
        };
        _this.addConversationMenu = function(contact) {
            var currTabId = $scope.activeContact.id;
            $scope.contextList = [];
            if (contact.id !== currTabId.toString()) {
                return;
            }
            var tabConvArray = APZ_TAB_CONVERSATION_MAP[contact.elementId];
            if (typeof tabConvArray === 'undefined' || tabConvArray.length === 0 || tabConvArray.length === 1) {
                $scope.productDetail.caretStatus = 'n-vis';
                $scope.productDetail.pbwcExpr = 'apz-product-box-wc';
                $scope.productDetail.clStatus = 'n-vis';
                return;
            }
            $scope.productDetail.clStatus = '';
            $scope.productDetail.caretStatus = '';
            $scope.productDetail.pbwcExpr = '';
            var convList = [];
            angular.forEach(tabConvArray, function(convPxy, i) {
                if (angular.element('#li-ctx-' + convPxy.id).length === 0) {
                    var title = '';
                    if (convPxy.topicDetail) {
                        var topicDetail = $.parseJSON(convPxy.topicDetail);
                        title = (typeof topicDetail === 'object') ? topicDetail.title : convPxy.topicDetail;
                    }
                    if (!title) {
                        title = convPxy.topicId;
                    }
                    convList.push({
                        id: convPxy.id,
                        tabId: contact.id,
                        isGroup: contact.isGroup,
                        topicId: convPxy.topicId,
                        title: title
                    });
                }
            });
            $scope.contextList = convList;
            if (convList.length < 2) {
                $scope.productDetail.caretStatus = 'n-vis';
                $scope.productDetail.pbwcExpr = 'apz-product-box-wc';
                $scope.productDetail.clStatus = 'n-vis';
            }
        };
        _this.getConversationFeedById = function(params) {
            if (params.conversationId) {
                var data = 'id=' + params.conversationId;
                var stateList = apzService.getConversationFeedById(data);
                stateList.then(function(response) {
                    var data = response.data;
                    if (typeof data === 'object' && data.status === 'success') {
                        var conversationPxy = data.response;
                        if (typeof conversationPxy === 'object') {
                            apzContactUtils.updateConversationMaps(conversationPxy);
                            if (params.messageType && typeof params.message === 'object') {
                                var contact = (params.message.groupId) ? apzGroupUtils.getGroup(params.message.groupId) : apzContactUtils.fetchContact(params.message.to);
                                if (typeof APZ_TAB_CONVERSATION_MAP[contact.elementId] !== 'undefined') {
                                    APZ_TAB_CONVERSATION_MAP[contact.elementId].push(conversationPxy);
                                }
                                apzMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                            }
                        }
                    }
                }, function() {});
            }
        };
        _this.getConversationFeedByProxy = function(params) {
            var contact;
            if (!params.isGroup && !params.isMessage && (params.topicStatus !== APZ_CONVERSATION_STATUS_MAP[1])) {
                var conversationId = APZ_TOPIC_CONVERSATION_MAP[params.topicId];
                if (conversationId) {
                    conversationPxy = $scope.APZ_CONVERSATION_MAP[conversationId];
                    if (typeof conversationPxy === 'object') {
                        $scope.activeContact.conversationId = conversationPxy.id;
                        params.conversationId = conversationPxy.id;
                        contact = apzContactUtils.fetchContact(params.tabId);
                        apzContactUtils.addConversationPxyToMap(contact, conversationPxy);
                        $scope.loadTab(params);
                        return;
                    }
                }
            }
            if (params.topicId) {
                var conversationPxy = {
                    'topicId': params.topicId,
                    'userId': params.tabId,
                    'status': params.topicStatus
                };
                if (params.isGroup) {
                    conversationPxy.supportIds = [ params.supportId ];
                }
                var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[params.topicId];
                if (typeof topicDetail === 'object') {
                    conversationPxy.topicDetail = JSON.stringify(topicDetail);
                }
                if (params.fallBackTemplatesList && params.fallBackTemplatesList.length > 0) {
                    conversationPxy.fallBackTemplatesList = params.fallBackTemplatesList;
                }
                var stateList = apzService.getConversationFeedByProxy(conversationPxy);
                stateList.then(function(response) {
                    var data = response.data;
                    if (typeof data === 'object' && data.status === 'success') {
                        var groupPxy = data.response;
                        if (params.isGroup) {
                            contact = mckGroupLayout.addGroup(groupPxy);
                            params.tabId = group.id;
                        }
                        if (typeof groupPxy === 'object' && groupPxy.conversationPxy !== 'undefined') {
                            var conversationPxy = groupPxy.conversationPxy;
                            apzContactUtils.updateConversationMaps(conversationPxy);
                            $scope.activeContact.conversationId = conversationPxy.id;
                            params.conversationId = conversationPxy.id;
                            apzContactUtils.addConversationPxyToMap(contact, conversationPxy);
                            (params.isMessage && conversationPxy.created) ? $scope.loadTab(params, apzMessageLayout.dispatchMessage) : $scope.loadTab(params);
                        }
                    }
                }, function() {})

            }
        };
    }
    function ApzMessageLayout() {
        var _this = this;
        var $apz_btn_direct_upload = angular.element("#apz-btn-direct-upload");
        var $apzTotalUnreadCount = angular.element(".apz-total-unread-count");
        var $apz_msg_inner = angular.element("#apz-message-inner");
        var $apz_text_box = angular.element("#apz-text-box");
        var $apz_msg_sbmt = angular.element("#apz-msg-sbmt");
        var $apz_no_more_messages = angular.element("#apz-no-more-messages");
        var $apz_textbox_container = angular.element("#apz-textbox-container");
        var LINK_EXPRESSION = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
        var LINK_MATCHER = new RegExp(LINK_EXPRESSION);
        $apz_msg_inner.bind('scroll', function() {
            if ($apz_msg_inner.scrollTop() === 0) {
                var activeContact = $scope.activeContact;
                if (activeContact && activeContact.id) {
                    if ($scope.tabProps.msgSyncTime > 0 && !$scope.tabProps.isSyncing) {
                        $scope.loadMessageList({
                            'tabId': activeContact.id,
                            'isGroup': activeContact.isGroup,
                            'conversationId': activeContact.conversationId,
                            'startTime': $scope.tabProps.msgSyncTime
                        });
                    }
                }

            }
        });
        _this.updateMessageListStatus = function(contact) {
            var messages = APZ_MESSAGE_MAP[contact.elementId];
            if ($scope.activeContact.htmlId === contact.elementId) {
                angular.forEach($scope.messages, function(cont, i) {
                    if (msg.type !== 7 && msg.type !== 6 && msg.type !== 4 && msg.type !== 0 && msg.contentType !== 4 && msg.contentType !== 10) {
                        $scope.messages[i].statusIcon = 'apz-icon-read';
                        $scope.messages[i].statusTitle = 'delivered and read';
                    }
                });
                if (typeof messages === 'object') {
                    messages.messageList = $scope.messages;
                }
            } else {
                if (typeof messages === 'object' && messages.messageList.length > 0) {
                    angular.forEach(messages.messageList, function(msg, i) {
                        messages.messageList[i].statusIcon = 'apz-icon-read';
                        messages.messageList[i].statusTitle = 'delivered and read';
                    });
                }
            }
            if (typeof messages === 'object' && messages.messageList.length > 0) {
                APZ_MESSAGE_MAP[contact.elementId] = messages;
            }
        };
        _this.submitMessage = function(messagePxy) {
            var randomId = messagePxy.key;
            var tabId = (messagePxy.groupId) ? messagePxy.groupId : messagePxy.to;
            var stateList = apzService.sendMessage(messagePxy);
            stateList.then(function(response) {
                var data = response.data;
                if (data.status === 'success') {
                    data = data.response;
                    var currentTabId = $scope.activeContact.id;
                    var messageKey = data.messageKey;
                    if (currentTabId && currentTabId === tabId) {
                        if (data.conversationId) {
                            $scope.activeContact.conversationId = data.conversationId;
                        }
                        apzMessageLayout.updateMessageOnSent(data, randomId);
                    }
                    if (messagePxy.conversationPxy) {
                        var conversationPxy = messagePxy.conversationPxy;
                        if (messagePxy.topicId) {
                            APZ_TOPIC_CONVERSATION_MAP[messagePxy.topicId] = [ data.conversationId ];
                        }
                        $scope.APZ_CONVERSATION_MAP[data.conversationId] = conversationPxy;
                    }
                } else {
                    data = data.errorResponse[0].description;
                    if (data === "open conversation not found") {
                        apzMessageLayout.removeMessageOnSentFailure(randomId);
                        apzMessageLayout.closeConversation(data);
                    } else {
                        apzMessageLayout.removeMessageOnSentFailure(randomId);
                        $scope.tabProps.errorText = "Unable to process your request. Please try again";
                        $scope.tabProps.errorStatus = 'vis';
                    }
                }
                $apz_msg_sbmt.attr('disabled', false);
            }, function() {
                $apz_msg_sbmt.attr('disabled', false);
                $scope.tabProps.errorText = "Unable to process your request. Please try again";
                $scope.tabProps.errorStatus = 'vis';
                if (randomId) {
                    apzMessageLayout.removeMessageOnSentFailure(randomId);
                }
            });
        };
        $scope.validateMessage = function() {
            if (APZ_TYPING_STATUS === 1) {
                if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                    apzChannelService.sendTypingStatus(0, $scope.activeContact.id);
                }
            }
            var message = $.trim(apzUtils.textVal($apz_text_box[0]));
            if (message.length === 0 && $scope.files.length === 0) {
                $scope.isTextReq.textbox = 'apz-text-req';
                return false;
            }
            if (typeof (appOptions.MSG_VALIDATION) === 'function' && !appOptions.MSG_VALIDATION(message)) {
                return false;
            }
            var messagePxy = {
                'type': 5,
                'contentType': 0,
                'message': message
            };
            var conversationId = $scope.activeContact.conversationid;
            var topicId = $apz_msg_inner.data('apz-topicid');
            if (conversationId) {
                messagePxy.conversationId = conversationId;
            } else if (topicId) {
                var conversationPxy = {
                    'topicId': topicId
                };
                var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[topicId];
                if (typeof topicDetail === "object") {
                    conversationPxy.topicDetail = JSON.stringify(topicDetail);
                }
                messagePxy.conversationPxy = conversationPxy;
            }
            var activeContact = $scope.activeContact;
            if (activeContact.isGroup) {
                messagePxy.groupId = activeContact.id;
            } else {
                messagePxy.to = activeContact.id;
            }
            $apz_msg_sbmt.attr('disabled', true);
            $scope.tabProps.errorText = '';
            $scope.tabProps.errorStatus = 'n-vis';
            apzMessageLayout.sendMessage(messagePxy);
            return false;
        };
        _this.sendMessage = function(messagePxy) {
            if (typeof messagePxy !== 'object') {
                return;
            }
            if (messagePxy.message.length === 0 && $scope.files.length === 0) {
                $scope.isTextReq.textbox = 'apz-text-req';
                return;
            }
            if (messagePxy.conversationId) {
                var conversationPxy = $scope.APZ_CONVERSATION_MAP[messagePxy.conversationId];
                if (conversationPxy === 'object' && conversationPxy.closed) {
                    apzMessageLayout.closeConversation();
                    $apz_msg_sbmt.attr('disabled', false);
                    return;
                }
            }
            var contact = '';
            if (messagePxy.groupId) {
                contact = apzGroupUtils.getGroup(messagePxy.groupId);
                if (typeof contact === 'undefined') {
                    contact = apzGroupUtils.createGroup(messagePxy.groupId);
                }
            } else {
                if ($scope.tabProps.blockedStatus) {
                    apzContactLayout.toggleBlockUser(tabId, true);
                    $apz_msg_sbmt.attr('disabled', false);
                    return;
                }
                contact = apzContactUtils.fetchContact(messagePxy.to);
            }
            $scope.tabProps.noMessagesStatus = 'n-vis';
            if (messagePxy.message && $scope.files.length === 0) {
                var randomId = apzUtils.randomId();
                messagePxy.key = randomId;
                if (messagePxy.contentType !== 12 && $scope.activeContact.htmlId === contact.elementId) {
                    _this.addMessageToTab(messagePxy);
                }
                _this.submitMessage(messagePxy);
            } else if ($scope.files.length > 0) {
                angular.forEach($scope.files, function(file, i) {
                    if (typeof file.fileMeta === 'object') {
                        var randomId = apzUtils.randomId();
                        messagePxy.key = randomId;
                        messagePxy.fileMeta = file.fileMeta;
                        messagePxy.contentType = 1;
                        if ($scope.activeContact.htmlId === contact.elementId) {
                            _this.addMessageToTab(messagePxy);
                        }
                        _this.submitMessage(messagePxy);
                    }
                });
            }
            apzMessageLayout.clearMessageField(true);
            delete $scope.APZ_TAB_MESSAGE_DRAFT[contact.elementId];
        };
        _this.addMessageToTab = function(messagePxy) {
            var message = {
                'to': messagePxy.to,
                'groupId': messagePxy.groupId,
                'deviceKey': messagePxy.deviceKey,
                'contentType': messagePxy.contentType,
                'message': messagePxy.message,
                'conversationId': messagePxy.conversationId,
                'topicId': messagePxy.topicId,
                'sendToDevice': true,
                'createdAtTime': new Date().getTime(),
                'key': messagePxy.key,
                'sent': false
            };
            message.type = (messagePxy.type) ? messagePxy.type : 5;
            if (messagePxy.fileMeta) {
                message.fileMeta = messagePxy.fileMeta;
            }
            apzMessageLayout.updateMessageListOnMessage('', message);
            $timeout(function() {
                $apz_msg_inner.scrollTop($apz_msg_inner[0].scrollHeight);
            }, 500);
        // mckMessageLayout.addMessage(message, true, true, false);
        };
        _this.clearMessageField = function(keyboard) {
            $scope.isTextReq.textbox = '';
            $apz_text_box.html('');
            $apz_msg_sbmt.attr('disabled', false);
            $scope.files = [];
            if (keyboard) {
                $apz_text_box.focus().select();
            } else {
                $apz_text_box.blur();
            }
        };
        $scope.textboxKeydown = function(e) {
            if ($scope.isTextReq.textbox) {
                $scope.isTextReq.textbox = '';
            }
            if (e.keyCode === 13 && (e.shiftKey || e.ctrlKey)) {
                e.preventDefault();
                if (w.getSelection) {
                    var selection = w.getSelection(),
                        range = selection.getRangeAt(0),
                        br = d.createElement("br"),
                        textNode = d.createTextNode("\u00a0"); // Passing
                    range.deleteContents(); // required or not?
                    range.insertNode(br);
                    range.collapse(false);
                    range.insertNode(textNode);
                    range.selectNodeContents(textNode);
                    selection.removeAllRanges();
                    selection.addRange(range);
                    return false;
                }
            } else if (e.keyCode === 13) {
                e.preventDefault();
                if (APZ_TYPING_STATUS === 1) {
                    if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                        apzChannelService.sendTypingStatus(0, $scope.activeContact.id);
                    }
                }
                ($apz_msg_sbmt.is(':disabled') && $scope.files.length > 0) ? alert('Please wait file is uploading.') : $scope.validateMessage();
            } else if (APZ_TYPING_STATUS === 0) {
                if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                    apzChannelService.sendTypingStatus(1, $scope.activeContact.id);
                }
            }
        };
        _this.dispatchMessage = function(params) {
            if (params.messagePxy === 'object') {
                var messagePxy = params.messagePxy;
                if (params.topicId) {
                    var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[params.topicId];
                    if (typeof topicDetail === 'object') {
                        if (topicDetail.title) {
                            if (!messagePxy.message) {
                                messagePxy.message = $.trim(topicDetail.title);
                            }
                            if (params.conversationId) {
                                messagePxy.conversationId = params.conversationId;
                            } else if (params.topicId) {
                                var conversationPxy = {
                                    'topicId': params.topicId
                                };
                                conversationPxy.topicDetail = JSON.stringify(topicDetail);
                                messagePxy.conversationPxy = conversationPxy;
                            }
                        }
                        if (topicDetail.link) {
                            var fileMeta = {
                                'blobKey': $.trim(topicDetail.link),
                                'contentType': "image/png"
                            };
                            messagePxy.fileMeta = fileMeta;
                            messagePxy.contentType = 5;
                            FILE_META = [ fileMeta ];
                        }
                    }

                }
                if (params.isGroup) {
                    messagePxy.groupId = params.tabId;
                } else {
                    messagePxy.to = params.tabId;
                }
                _this.sendMessage(messagePxy);
            }
        };
        $scope.clearMessages = function() {
            if (confirm('Are you sure want to delete all the conversation?')) {
                var tabId = $scope.activeContact.id;
                var isGroup = $scope.activeContact.isGroup;
                var conversationId = $scope.activeContact.conversationId;
                if (tabId) {
                    var data = (isGroup) ? 'groupId=' + tabId : 'userId=' + encodeURIComponent(tabId);
                    if (conversationId) {
                        data += '&conversationId=' + conversationId;
                    }
                    var stateList = apzService.clearMessages(data);
                    stateList.then(function(response) {
                        var data = response.data;
                        if (data === 'success') {
                            var contact = (isGroup) ? apzGroupUtils.getGroup(tabId) : apzContactUtils.fetchContact(tabId);
                            if ($scope.activeContact.htmlId === contact.elementId && conversationId === $scope.activeContact.conversationId) {
                                $scope.tabProps.isSyncing = true;
                                $scope.messages = [];
                                $scope.tabProps.msgSyncTime = 0;
                                $scope.tabProps.msgMenusStatus = 'n-vis';
                                $scope.tabProps.noMessagesStatus = 'vis';
                                apzContactLayout.clearConvMessageData(contact);
                            }
                            APZ_MESSAGE_MAP[contact.elementId] = {
                                messageList: [],
                                startTime: 0
                            };
                        }
                        $timeout(function() {
                            $scope.tabProps.isSyncing = false;
                        }, 100);
                    }, function() {});
                }
            }
        };
        _this.sendMessageDeliveryUpdate = function(key) {
            var stateList = apzService.sendMessageDeliveryUpdate(key);
            stateList.then(function(response) {}, function() {});
        };
        _this.sendMessageReadUpdate = function(key) {
            var stateList = apzService.sendMessageReadUpdate(key);
            stateList.then(function(response) {}, function() {});
        };
        _this.updateMessageStatus = function(contact, messageKey, statusIcon) {
            var statusTitle = apzMessageUtils.getStatusTitle(statusIcon);
            var messages = APZ_MESSAGE_MAP[contact.elementId];
            if ($scope.activeContact.htmlId === contact.elementId) {
                angular.forEach($scope.messages, function(msg, i) {
                    if (msg.key === messageKey) {
                        $scope.messages[i].statusIcon = statusIcon;
                        $scope.messages[i].statusTitle = apzMessageUtils.getStatusTitle(statusIcon);
                        return false;
                    }
                });
                messages.messageList = $scope.messages;
                APZ_MESSAGE_MAP[contact.elementId] = messages;
            } else {
                if (messages && messages.messageList.length > 0) {
                    angular.forEach(messages.messageList, function(msg, i) {
                        if (msg.key === messageKey) {
                            messages.messageList[i].statusIcon = statusIcon;
                            messages.messageList[i].statusTitle = statusTitle;
                            return false;
                        }
                    });
                    APZ_MESSAGE_MAP[contact.elementId] = messages;
                }
            }

        };
        _this.removeConversationThread = function(contact) {
            if (typeof contact === 'object') {
                apzContactLayout.clearConvMessageData(contact);
                if (contact.elementId === $scope.activeContact.htmlId) {
                    $scope.tabProps.msgMenusStatus = 'n-vis';
                    $scope.tabProps.noMessagesStatus = 'n-vis';
                    $scope.messages = [];
                    $scope.tabProps.msgSyncTime = 0;
                    APZ_MESSAGE_MAP[contact.elementId] = {
                        messageList: [],
                        startTime: 0
                    };
                }
            }
        };
        _this.removeDeletedMessage = function(contact, msgKey) {
            if (contact.elementId === $scope.activeContact.htmlId) {
                angular.forEach($scope.messages, function(msg, i) {
                    if (msg.key === msgKey) {
                        $scope.messages.splice(i, 1);
                    }
                });
                $timeout(function() {
                    if ($scope.messages.length === 0) {
                        $scope.tabProps.msgMenusStatus = 'n-vis';
                        $scope.tabProps.noMessagesStatus = 'vis';
                    }
                }, 'fast');
                var messages = APZ_MESSAGE_MAP[contact.elementId];
                messages.messageList = $scope.messages;
                APZ_MESSAGE_MAP[contact.elementId] = messages;
            }
            apzContactLayout.updateConvList(contact);
        };
        _this.getMessageForMessageList = function(message, contextMenu) {
            if (message.type === 6 || message.type === 7) {
                return "";
            }
            var floatWhere = 'apz-msg-right';
            if (message.type === 0 || message.type === 4 || message.type === 6) {
                floatWhere = 'apz-msg-left';
            }
            if (message.contentType === 4 || message.contentType === 10) {
                floatWhere = 'apz-msg-center';
            }
            var statusIcon = apzMessageUtils.getStatusIconName(message);
            var statusTitle = apzMessageUtils.getStatusTitle(statusIcon);
            var messageClass = 'vis';
            var displayName = '';
            var showNameExpr = 'n-vis';
            var nameTextExpr = '';
            if (message.groupId && message.contentType !== 4 && (message.type === 0 || message.type === 4 || message.type === 6)) {
                displayName = apzContactUtils.getTabDisplayName(message.to, false);
                showNameExpr = 'vis';
                nameTextExpr = apzContactUtils.getNameTextClassByAlphabet(displayName);
            }
            if (message.groupId && message.contentType === 10) {
                displayName = '';
            }
            var elementId = (message.groupId) ? 'group-' + message.groupId : 'user-' + $scope.formatContactId(message.to);
            var msgFeatExpr = 'n-vis';
            var isContentExpr = 'vis';
            var isFileExpr = 'n-vis';
            var frwdMsgExpr = message.message;
            if (typeof message.fileMeta === 'object') {
                var fileName = message.fileMeta.name;
                var fileSize = message.fileMeta.size;
                isFileExpr = 'vis';
            }
            var emoji_template = '';
            if (message.message) {
                var msg_text = message.message.replace(/\n/g, '<br/>');
                if (emoji !== null && typeof emoji !== 'undefined') {
                    emoji_template = emoji.replace_unified(msg_text);
                    emoji_template = emoji.replace_colons(emoji_template);
                } else {
                    emoji_template = msg_text;
                }
            } else {
                isContentExpr = 'n-vis';
            }
            if (message.conversationId) {
                var conversationPxy = $scope.APZ_CONVERSATION_MAP[message.conversationId];
                if (typeof conversationPxy !== 'object') {
                    apzContextualLayout.getConversationFeedById({
                        'conversationId': message.conversationId
                    });
                }
                $scope.activeContact.conversationId = message.conversationId;
            }
            if (message.contentType === 4) {
                emoji_template = 'Final agreed price: ' + emoji_template;
            }
            if (emoji_template.indexOf('emoji-inner') === -1 && message.contentType === 0) {
                var nodes = emoji_template.split('<br/>');
                var tmpl = document.createElement('div');
                for (var i = 0; i < nodes.length; i++) {
                    var x = document.createElement('div');
                    x.appendChild(document.createTextNode(nodes[i]));
                    if (nodes[i] && nodes[i].match(LINK_MATCHER)) {
                        x = angular.element(x).linkify({
                            target: '_blank'
                        });
                    }
                    if (x.length > 0) {
                        angular.forEach(x, function(z, i) {
                            tmpl.appendChild(z);
                        })
                    } else {
                        tmpl.appendChild(x);
                    }
                }
                emoji_template = tmpl;
            }
            if (typeof emoji_template === 'object') {
                var tmp = document.createElement('div');
                if (emoji_template.length > 0) {
                    angular.forEach(emoji_template, function(y, i) {
                        tmp.appendChild(y);
                    })
                } else {
                    tmp.appendChild(emoji_template);
                }
                emoji_template = tmp.innerHTML;
            }

            if (message.contentType === 2) {
                isContentExpr = 'n-vis';
                isFileExpr = 'vis';
            }
            if ($scope.tabProps.msgMenusStatus === 'n-vis') {
                $scope.tabProps.msgMenusStatus = 'vis';
            }
            var contextMenuOption = (message.contentType !== 4 && message.contentType !== 10 && contextMenu) ? 'messageMenuOptions' : '';
            // if (msg.contentType === 10 && append) {
            // if (msg.type === 5 && msg.source === 1) {
            // return;
            // }
            // apzGroupService.getGroupFeed({
            // 'groupId': msg.groupId, 'isReloadTab': true
            // });
            // }
            return {
                key: message.key,
                createdAtTime: message.createdAtTime,
                type: message.type,
                statusIcon: statusIcon,
                statusTitle: statusTitle,
                elementId: elementId,
                contactId: message.to,
                contactNameExpr: showNameExpr,
                contactAlphaTextExpr: nameTextExpr,
                contactName: displayName,
                floatExpr: floatWhere,
                createdAtTimeExpr: apzDateUtils.getDate(message.createdAtTime),
                fileKey: message.fileMetaKey,
                fileExpr: $sce.trustAsHtml(apzFileUtils.getFilePath(message)),
                fileName: fileName,
                fileSize: fileSize,
                isContentExpr: isContentExpr,
                isFileExpr: isFileExpr,
                contextMenuOption: contextMenuOption,
                content: $sce.trustAsHtml(emoji_template)
            };
        };
        _this.removeMessageOnSentFailure = function(oldKey) {
            angular.forEach($scope.messages, function(msg, i) {
                if (msg.key === oldKey) {
                    var elementId = $scope.messages[i].elementId;
                    $scope.messages.splice(i, 1);
                    if ($scope.messages.length === 0) {
                        $scope.tabProps.msgMenusStatus = 'n-vis';
                        $scope.tabProps.noMessagesStatus = 'n-vis';
                    }
                    if (elementId) {
                        var messages = APZ_MESSAGE_MAP[elementId];
                        messages.messageList = $scope.messages;
                        APZ_MESSAGE_MAP[elementId] = messages;
                    }
                    return false;
                }
            });
        };
        _this.updateMessageOnSent = function(data, oldKey) {
            angular.forEach($scope.messages, function(msg, i) {
                if (msg.key === oldKey) {
                    $scope.messages[i].key = data.messageKey;
                    $scope.messages[i].createdAtTime = data.createdAt;
                    $scope.messages[i].createdAtTimeExp = apzDateUtils.getDate(data.createdAt);
                    $scope.messages[i].sent = true;
                    $scope.messages[i].statusIcon = 'apz-icon-sent';
                    $scope.messages[i].statusTitle = 'sent';
                    if ($scope.messages.length === 1) {
                        $scope.tabProps.msgSynctime = data.createdAt;
                    }
                    if ($scope.messages[i].elementId) {
                        var messages = APZ_MESSAGE_MAP[$scope.messages[i].elementId];
                        messages.messageList = $scope.messages;
                        APZ_MESSAGE_MAP[$scope.messages[i].elementId] = messages;
                    }
                    return false;
                }
            });
        };
        _this.updateMessageListOnMessage = function(contact, message) {
            var messageElement = _this.getMessageForMessageList(message, true);
            var messages = APZ_MESSAGE_MAP[contact.elementId];
            if ($scope.activeContact && $scope.activeContact.htmlId === contact.elementId) {
                var isUpdated = false;
                angular.forEach($scope.messages, function(msg, i) {
                    if (msg.key === message.key || msg.key === message.oldKey) {
                        $scope.messages[i].statusIcon = messageElement.statusIcon;
                        $scope.messages[i].statusTitle = messageElement.statusTitle;
                        $scope.messages[i].key = message.key;
                        isUpdated = true;
                        return true;
                    }
                });
                if (!isUpdated && messageElement) {
                    var messageList = [ messageElement ];
                    $scope.messages = messageList.concat($scope.messages);
                    $scope.msgOrder = 'createdAtTime';
                    $timeout(function() {
                        $apz_msg_inner.scrollTop($apz_msg_inner[0].scrollHeight);
                        angular.element('.' + message.key + ' .apz-file-text a').trigger('click');
                    }, 'fast');
                }
                if (messages === 'object') {
                    messages.messageList = $scope.messages;
                }
            } else {
                if (typeof messages === 'object' && messages.messageList.length > 0) {
                    if (messageElement) {
                        angular.forEach(messages.messageList, function(msg, i) {
                            if (typeof msg === 'object') {
                                if (msg.key === message.key || msg.key === message.oldKey) {
                                    messages.messageList.splice(i, 1);
                                    return false;
                                }
                            }
                        });
                        var messageList = [ messageElement ];
                        messages.messageList = messageList.concat(messages.messageList);
                    }
                }
            }
            if (contact) {
                if (typeof messages !== 'undefined') {
                    APZ_MESSAGE_MAP[contact.elementId] = messages;
                }
            }
        };
        _this.processMessageList = function(messageList, isLatest) {
            if (typeof messageList === 'undefined' && messageList.length === 0) {
                return;
            }
            if (!isLatest) {
                var $scrollToDiv = $apz_msg_inner.find("div[name='message']:first");
            }
            var msg = messageList[0];
            var contact = (msg.groupId) ? apzGroupUtils.getGroup(msg.groupId) : apzContactUtils.fetchContact(msg.to);
            var showMoreDateTime;
            var messageArray = [];
            angular.forEach(messageList, function(message, i) {
                if (!(typeof message.to === 'undefined')) {
                    var messageElement = _this.getMessageForMessageList(message, true);
                    if (typeof messageElement === 'object') {
                        messageArray.push(messageElement);
                    }
                    showMoreDateTime = message.createdAtTime;
                }
                if (message.key) {
                    APZ_MESSAGE_KEY_MAP[message.key] = message;
                }
            });
            $scope.tabProps.msgSyncTime = showMoreDateTime;
            if (isLatest) {
                $scope.messages = messageArray;
                $scope.msgOrder = 'createdAtTime';
                $timeout(function() {
                    $apz_msg_inner.scrollTop($apz_msg_inner[0].scrollHeight);
                    angular.element('.apz-file-text a').trigger('click');
                }, 'fast');
            } else {
                var apzMessageArray = $scope.messages;
                $scope.messages = (apzMessageArray) ? messageArray.concat(apzMessageArray) : messageArray;
                if ($scrollToDiv.length > 0) {
                    $timeout(function() {
                        $apz_msg_inner.scrollTop($scrollToDiv.position().top + $apz_msg_inner.scrollTop() - $scrollToDiv.height());
                        angular.forEach(messageArray, function(message, i) {
                            angular.element('.' + message.key + ' .apz-file-text a').trigger('click');
                        });
                    }, 'fast');
                }
            }
            if (contact) {
                var messages = APZ_MESSAGE_MAP[contact.elementId];
                if (typeof messages === 'undefined') {
                    messages = {};
                }
                messages.messageList = $scope.messages;
                messages.startTime = showMoreDateTime;
                APZ_MESSAGE_MAP[contact.elementId] = messages;
            }
        };
        _this.updateUnreadCount = function(tabId, count, isTotalUpdate) {
            var previousCount = _this.getUnreadCount(tabId);
            APZ_UNREAD_COUNT_MAP[tabId] = count;
            if (isTotalUpdate && $apzTotalUnreadCount.length > 0) {
                APZ_TOTAL_UNREAD_COUNT += count - previousCount;
                (APZ_TOTAL_UNREAD_COUNT > 0) ? $apzTotalUnreadCount.html(APZ_TOTAL_UNREAD_COUNT) : $apzTotalUnreadCount.html("");
            }
        };
        _this.incrementUnreadCount = function(tabId) {
            APZ_TOTAL_UNREAD_COUNT += 1;
            APZ_UNREAD_COUNT_MAP[tabId] = (typeof (APZ_UNREAD_COUNT_MAP[tabId]) === 'undefined') ? 1 : APZ_UNREAD_COUNT_MAP[tabId] + 1;
            if ($apzTotalUnreadCount.length > 0) {
                $apzTotalUnreadCount.html(APZ_TOTAL_UNREAD_COUNT);
            }
        };
        _this.getUnreadCount = function(tabId) {
            if (typeof (APZ_UNREAD_COUNT_MAP[tabId]) === 'undefined') {
                APZ_UNREAD_COUNT_MAP[tabId] = 0;
                return 0;
            } else {
                return APZ_UNREAD_COUNT_MAP[tabId];
            }
        };
        _this.getConvForMessageCell = function(contact, params) {
            var conversationId = (params && params.conversationId) ? params.conversationId : '';
            var panelExpr = (contact.isGroup) ? 'apz-group-panel' : '';
            return [ {
                htmlId: contact.elementId,
                id: contact.id,
                isGroup: contact.isGroup,
                panelExpr: panelExpr,
                conversationId: conversationId,
            } ];
        }
        _this.setMessagePanelStatus = function(contact, params) {
            $scope.tabProps.title = $scope.activeContact.displayName;
            $scope.tabProps.icon = $scope.activeContact.imgExpr;
            $scope.tabProps.typingStatus = 'n-vis';
            $scope.tabProps.typingText = '';
            $scope.tabProps.subtitleStatus = 'n-vis';
            $scope.tabProps.titlewsStatus = '';
            $scope.tabProps.titlewtStatus = '';
            if (appOptions.IS_USER_DEACTIVATED) {
                $scope.tabProps.errorText = 'Deactivated';
                $scope.tabProps.errorStatus = 'vis';
                $scope.tabProps.msgFormStatus = 'n-vis';
            } else {
                $scope.tabProps.errorText = '';
                $scope.tabProps.errorStatus = 'n-vis';
                $scope.tabProps.msgFormStatus = 'vis';
            }
            if (appOptions.IS_LOCSHARE_ENABLED && google && typeof (google.maps) === 'object') {
                $apz_btn_direct_upload.removeClass("vis").addClass('n-vis');
                $scope.tabProps.uploadBtnStatus = 'n-vis';
                $scope.tabProps.uploadMenuStatus = 'vis';
            } else {
                $scope.tabProps.uploadMenuStatus = 'n-vis';
                $scope.tabProps.uploadBtnStatus = 'vis';
            }
            $scope.tabProps.contentStatus = 'vis';
            if (!appOptions.IS_VISITOR && appOptions.USER_ID !== 'guest') {
                apzChannelService.subscibeToTypingChannel(params.tabId, params.isGroup);
            }
        };
        _this.setTabSubTitle = function(userDetail) {
            if (userDetail.blockedByThis) {
                APZ_BLOCKED_TO_MAP[userDetail.userId] = true;
                apzContactLayout.toggleBlockUser(userDetail.userId, true);
            } else if (userDetail.blockedByOther) {
                apzContactLayout.toggleBlockByOtherUser(userDetail.userId, true);
                $scope.tabProps.blockedStatus = false;
            } else {
                apzContactLayout.toggleBlockUser(userDetail.userId, false);
            }
        }
        _this.closeConversation = function(data) {
            var text;
            if (typeof appOptions.DISPLAY_TEXT === 'function') {
                text = appOptions.DISPLAY_TEXT(data);
            }
            if (!text) {
                text = 'Chat disabled with user';
            }
            $scope.tabProps.errorText = text;
            $scope.tabProps.errorStatus = 'vis';
            $scope.tabProps.msgFormStatus = 'n-vis';
        };
        $scope.loadMessageList = function(params, callback) {
            $scope.files = [];
            var contact = (params.isGroup) ? apzGroupUtils.getGroup(params.tabId) : apzContactUtils.fetchContact(params.tabId);
            if (!params.startTime) {
                $scope.messages = [];
                apzMessageLayout.setMessagePanelStatus(contact, params);
                apzMessageUtils.addDraftMessage(contact.elementId);
            }
            if (!params.startTime && !params.conversationId) {
                var messages = APZ_MESSAGE_MAP[contact.elementId];
                if ((typeof messages === 'object') && messages.messageList.length > 0) {
                    $scope.messages = messages.messageList;
                    $scope.msgOrder = 'createdAtTime';
                    $scope.tabProps.msgSyncTime = messages.startTime;
                    $timeout(function() {
                        if (!appOptions.IS_USER_DEACTIVATED && !params.isGroup) {
                            apzMessageLayout.setTabSubTitle(APZ_USER_DETAIL_MAP[contact.id]);
                        }
                        if (contact.isGroup) {
                            apzGroupLayout.addGroupStatus(contact);
                        }
                        $scope.tabProps.msgMenusStatus = 'vis';
                        $apz_msg_inner.scrollTop($apz_msg_inner[0].scrollHeight);
                        angular.element('.apz-file-text a').trigger('click');
                        apzMessageLayout.updateUnreadCount(contact.elementId, 0, true);
                        apzContactLayout.updateConvListOnUnreadCountChange(contact);
                        $scope.$apply();
                    }, 'fast');
                    return;
                }
            }
            var isConvReq = false;
            var reqData = 'startIndex=0&pageSize=30';
            reqData += (params.isGroup) ? '&groupId=' + params.tabId : '&userId=' + encodeURIComponent(params.tabId);
            if (params.startTime) {
                reqData += '&endTime=' + params.startTime;
            }
            if (appOptions.IS_TOPIC_BOX_ENABLED && params.conversationId) {
                reqData += '&conversationId=' + params.conversationId;
                if (typeof APZ_TAB_CONVERSATION_MAP[contact.elementId] === 'undefined') {
                    isConvReq = true;
                    reqData += '&conversationReq=true';
                } else {
                    apzContextualLayout.addConversationMenu(contact);
                }
            }
            $scope.tabProps.isSyncing = true;
            $scope.tabProps.loadingIconStatus = 'vis';
            var stateList = apzService.getMessageList(reqData);
            stateList.then(function(response) {
                var data = response.data;
                $scope.tabProps.isSyncing = false;
                $scope.tabProps.loadingIconStatus = 'n-vis';
                var currTabId = $scope.activeContact.id;
                var isGroupTab = $scope.activeContact.isGroup;
                if ($scope.activeContact.htmlId === contact.elementId) {
                    if (data.message.length > 0) {
                        if (params.startTime > 0) {
                            apzMessageLayout.processMessageList(data.message, false);
                        } else {
                            apzMessageLayout.processMessageList(data.message, true);
                            $scope.tabProps.msgMenusStatus = 'vis';
                        }
                    } else {
                        if (params.startTime) {
                            $apz_no_more_messages.removeClass('n-vis').addClass('vis');
                            $apz_no_more_messages.fadeOut(3000, function() {
                                $apz_no_more_messages.removeClass('vis').addClass('n-vis');
                            });
                            $scope.tabProps.msgSyncTime = 0;
                        } else if ($apz_msg_inner.find("div[name='message']").length === 0) {
                            $scope.tabProps.msgMenusStatus = 'n-vis';
                            $scope.tabProps.noMessagesStatus = 'vis';
                        }
                    }
                    if (data.userDetails.length > 0) {
                        angular.forEach(data.userDetails, function(userDetail, i) {
                            APZ_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                            if (!params.isGroup) {
                                apzContactUtils.updateLastSeenStatus(userDetail);
                                if (!appOptions.IS_USER_DEACTIVATED) {
                                    if (!params.isGroup) {
                                        apzMessageLayout.setTabSubTitle(userDetail);
                                    }
                                }
                            }
                        });
                    }
                    if (data.groupFeeds.length > 0) {
                        angular.forEach(data.groupFeeds, function(groupFeed, i) {
                            apzGroupUtils.addGroup(groupFeed);
                        });
                    }
                    if (data.conversationPxys.length > 0) {
                        var tabConvArray = new Array();
                        angular.forEach(data.conversationPxys, function(conversationPxy, i) {
                            if (typeof conversationPxy === 'object') {
                                apzContactUtils.updateConversationMaps(conversationPxy);
                                tabConvArray.push(conversationPxy);
                            }
                        });
                        if (isConvReq) {
                            APZ_TAB_CONVERSATION_MAP[contact.elementId] = tabConvArray;
                            apzContextualLayout.addConversationMenu(contact);
                        }
                    }
                    if (params.conversationId) {
                        var conversationPxy = $scope.APZ_CONVERSATION_MAP[params.conversationId];
                        if (typeof conversationPxy === 'object' && conversationPxy.closed) {
                            apzMessageLayout.closeConversation('CONVERSATION_CLOSED');
                        }
                    }
                    if (!params.startTime) {
                        if (params.isGroup) {
                            apzGroupLayout.addGroupStatus(apzGroupUtils.getGroup(params.tabId));
                        }
                        apzMessageLayout.updateUnreadCount(contact.elementId, 0, true);
                        if (typeof callback === 'function') {
                            callback(params);
                        }
                    }
                }
            }, function() {
                $scope.tabProps.isSyncing = false;
                $scope.tabProps.loadingIconStatus = 'n-vis';
            });
        };
        _this.populateMessage = function(messageType, message, notifyUser) {
            var contact = (message.groupId) ? apzGroupUtils.getGroup(message.groupId) : apzContactUtils.getContact(message.to);
            if ($scope.activeContact && $scope.activeContact.htmlId === contact.elementId) {
                if (messageType === 'APPLOZIC_01' || messageType === 'MESSAGE_RECEIVED') {
                    if (message.conversationId && (appOptions.IS_TOPIC_BOX_ENABLED)) {
                        if ($scope.activeContact.conversationId === message.conversationId.toString()) {
                            _this.updateMessageListOnMessage(contact, message);
                            _this.sendMessageReadUpdate(message.pairedMessageKey);
                        }
                    } else {
                        _this.updateMessageListOnMessage(contact, message);
                        _this.sendMessageReadUpdate(message.pairedMessageKey);
                    }
                    if (!message.groupId) {
                        $scope.tabProps.subtitleText = 'Online';
                        apzUserUtils.updateUserStatus({
                            'userId': message.to,
                            'status': 1
                        });
                    }
                    // Todo: use contactNumber instead of contactId
                    // for Google Contacts API.
                    if (notifyUser) {
                        apzNotificationService.notifyUser(message);
                    }
                } else if (messageType === 'APPLOZIC_02') {
                    _this.updateMessageListOnMessage(contact, message);
                }
                apzContactLayout.updateConvListOnMessage(contact, message);
            } else {
                if (messageType === 'APPLOZIC_01' || messageType === 'MESSAGE_RECEIVED') {
                    if (message.contentType !== 10) {
                        apzMessageLayout.incrementUnreadCount(contact.elementId);
                    }
                    apzNotificationService.notifyUser(message);
                    apzMessageLayout.sendMessageDeliveryUpdate(message.pairedMessageKey);
                }
                _this.updateMessageListOnMessage(contact, message);
                apzContactLayout.updateConvListOnMessage(contact, message);
            }
        /*
         * if ((typeof tabId === "undefined") || tabId === "") { if (messageType === "APPLOZIC_01" || messageType === "MESSAGE_RECEIVED") { if (typeof contact === 'undefined') { contact = (message.groupId) ? mckGroupLayout .createGroup(message.groupId) : mckMessageLayout .createContact(message.to); } var ucTabId = (message.groupId) ? 'group_' + contact.contactId : 'user_' + contact.contactId; if (message.contentType !== 10) { mckMessageLayout.incrementUnreadCount(ucTabId); } mckNotificationService.notifyUser(message); var contactHtmlExpr = (message.groupId) ? 'group-' + contact.htmlId : 'user-' + contact.htmlId; $applozic( "#li-" + contactHtmlExpr + " .mck-unread-count-text").html( mckMessageLayout.getUnreadCount(ucTabId)); if (mckMessageLayout.getUnreadCount(ucTabId) > 0) { $applozic( "#li-" + contactHtmlExpr + " .mck-unread-count-box") .removeClass("n-vis").addClass("vis"); } mckMessageService.sendDeliveryUpdate(message); } } else { if (typeof contact === 'undefined') { contact =
         * (message.groupId) ? mckGroupLayout .createGroup(message.groupId) : mckMessageLayout.createContact(message.to); } if (messageType === "APPLOZIC_01" || messageType === "MESSAGE_RECEIVED") { if (typeof contact !== 'undefined') { var isGroupTab = $mck_msg_inner.data('isgroup'); if (typeof tabId !== 'undefined' && tabId === contact.contactId && isGroupTab === contact.isGroup) { if (message.conversationId && (IS_MCK_TOPIC_HEADER || IS_MCK_TOPIC_BOX)) { var currConvId = $mck_msg_inner .data('mck-conversationid'); if (currConvId && currConvId.toString() === message.conversationId .toString()) { mckMessageLayout.addMessage(message, true, true, true); mckMessageService .sendReadUpdate(message.pairedMessageKey); } } else { mckMessageLayout.addMessage(message, true, true, true); mckMessageService .sendReadUpdate(message.pairedMessageKey); } if (!message.groupId) { $applozic("#mck-tab-status").html("Online"); mckUserUtils.updateUserStatus({ 'userId' : message.to, 'status' : 1 }); } //
         * Todo: use contactNumber instead of contactId // for Google Contacts API. } else { if (message.contentType !== 10) { var ucTabId = (message.groupId) ? 'group_' + contact.contactId : 'user_' + contact.contactId; mckMessageLayout .incrementUnreadCount(ucTabId); } mckMessageService.sendDeliveryUpdate(message); } if (notifyUser) { mckNotificationService.notifyUser(message); } } } else if (messageType === "APPLOZIC_02") { if (($applozic("." + message.oldKey).length === 0 && $applozic("." + message.key).length === 0) || message.contentType === 10) { if (mckContactListLength > 0) { mckMessageLayout.addContactsFromMessage( message, true); } else { if (typeof contact !== 'undefined') { var isGroupTab = $mck_msg_inner .data('isgroup'); if (typeof tabId !== 'undefined' && tabId === contact.contactId && isGroupTab === contact.isGroup) { mckMessageLayout.addMessage(message, true, true, true); if (message.type === 3) { $applozic( "." + message.key + " .mck-message-status")
         * .removeClass( 'mck-icon-time') .addClass('mck-icon-sent'); mckMessageLayout .addTooltip(message.key); } } } } } } }
         */
        };
    }
    function ApzContactLayout() {
        var _this = this;
        var CONTACT_SYNCING = false;
        var $apz_contact_search = angular.element("#apz-contact-search");
        var $apz_no_more_conversations = angular.element("#apz-no-more-conversations");
        var $apz_contact_inner = angular.element("#apz-contact-cell .apz-panel-inner");
        var $apz_message_inner = angular.element("#apz-message-inner");
        var $apz_search_box = angular.element("#apz-search-box");
        var $apz_search_tab_link = angular.element("#apz-search-tab-menu li a");
        var $apz_contact_search_tab = angular.element("#apz-contact-search-tab");
        var $apz_group_search_tab = angular.element("#apz-group-search-tab");
        var $apz_contact_search_list = angular.element("#apz-contact-search-list");
        var $apz_group_search_list = angular.element("#apz-group-search-list");
        var $apz_contact_search_input = angular.element("#apz-contact-search-input");
        var $apz_contact_search_input_box = angular.element("#apz-contact-search-input-box");
        var $apz_group_search_input_box = angular.element("#apz-group-search-input-box");
        var $apz_group_search_input = angular.element("#apz-group-search-input");
        var $apz_text_box = angular.element("#apz-text-box");
        $scope.onTabClick = function(e, index) {
            var $this = angular.element(e.currentTarget);
            var tabId = $this.data('apz-elementid');
            tabId = (tabId) ? tabId.toString() : '';
            var activeContact = $scope.contacts.filter(function(obj) {
                return obj.htmlId == tabId;
            });
            if (activeContact.length > 0) {
                $scope.prevActiveContact = $scope.activeContact;
                $scope.activeContact = activeContact[0];
            }
        };
        $scope.$watch(function() {
            return $scope.activeContact.htmlId;
        }, function(activeContact) {
            if (activeContact) {
                activeContact = $scope.activeContact;
                angular.element('.apz-contact-li').removeClass('active');
                var $element = angular.element('#li-' + activeContact.htmlId);
                $element.addClass('active');
                var msgText = $apz_text_box.html();
                if ($scope.prevActiveContact.htmlId) {
                    if (($scope.files && $scope.files.length > 0) || msgText) {
                        $scope.APZ_TAB_MESSAGE_DRAFT[$scope.prevActiveContact.htmlId] = {
                            'text': msgText,
                            'files': $scope.files
                        };
                    } else {
                        delete $scope.APZ_TAB_MESSAGE_DRAFT[$scope.prevActiveContact.htmlId];
                    }
                    $scope.prevActiveContact = {
                        htmlId: ''
                    }
                }
                $apz_text_box.html('');
                if (activeContact.isGroup) {
                    $scope.tabProps.panelInnerStatus = 'apz-group-panel';
                    $scope.tabProps.groupMenusStatus = 'vis';
                    $scope.tabProps.userMenusStatus = 'n-vis';
                } else {
                    $scope.tabProps.panelInnerStatus = '';
                    $scope.tabProps.groupMenusStatus = 'n-vis';
                    $scope.tabProps.userMenusStatus = 'vis';
                }
                if (activeContact.conversationId) {
                    var conversationPxy = $scope.APZ_CONVERSATION_MAP[activeContact.conversationId];
                    if (typeof conversationPxy === 'object') {
                        var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                        if (typeof topicDetail === "object") {
                            $scope.setProductProperties(topicDetail, true);
                        }
                    }
                } else {
                    $scope.productDetail.pbStatus = 'n-vis';
                    $scope.contextList = [];
                }
                $scope.closePanelRight();
                if (activeContact.isSearch) {
                    $apz_contact_inner.scrollTop($element.offset().top - $apz_contact_inner.offset().top + $apz_contact_inner.scrollTop());
                }
                $scope.loadMessageList({
                    'tabId': activeContact.id,
                    'isGroup': activeContact.isGroup,
                    'userName': activeContact.displayName,
                    'conversationId': activeContact.conversationId
                });
            }
        }, true);
        $scope.loadContactsToSearchTab = function() {
            var contactsArray = [],
                userIdArray = [],
                searchArray = [];
            $scope.searchProps.loadingIconStatus = 'vis';
            $scope.searchProps.noContactStatus = 'n-vis';
            $scope.searchProps.noGroupStatus = 'n-vis';
            if (!$apz_contact_search_tab.hasClass('active')) {
                $apz_search_tab_link.removeClass('active');
                $apz_contact_search_tab.addClass('active');
            }
            $apz_group_search_list.removeClass('vis').addClass('n-vis');
            $apz_contact_search_list.removeClass('n-vis').addClass('vis');
            $apz_group_search_input_box.removeClass('vis').addClass('n-vis');
            $apz_contact_search_input_box.removeClass('n-vis').addClass('vis');
            angular.forEach(APZ_CONTACT_ARRAY, function(contact, i) {
                userIdArray.push(contact.id);
            });
            var uniqueUserIdArray = userIdArray.filter(function(item, pos) {
                return userIdArray.indexOf(item) === pos;
            });
            uniqueUserIdArray.sort();
            $scope.searchProps.loadingIconStatus = 'n-vis';
            if (uniqueUserIdArray.length > 0) {
                angular.forEach(uniqueUserIdArray, function(userId, i) {
                    var contact = apzContactUtils.fetchContact('' + userId);
                    contactsArray.push(contact);
                    searchArray.push(apzContactLayout.getSearchContactElement(contact));
                });
            } else {
                $scope.searchProps.noContactStatus = 'vis';
            }
            $scope.contactSearchArray = searchArray;
            apzContactLayout.initAutoSuggest({
                'contactsArray': contactsArray,
                '$searchId': $apz_contact_search_input,
                'isContactSearch': true
            });
            $apz_search_box.mckModal();
        };
        $scope.loadGroupsToSearchTab = function() {
            var groupsArray = [],
                groupIdArray = [],
                searchArray = [];
            $scope.searchProps.loadingIconStatus = 'vis';
            $scope.searchProps.noContactStatus = 'n-vis';
            $scope.searchProps.noGroupStatus = 'n-vis';
            if (!$apz_group_search_tab.hasClass('active')) {
                $apz_search_tab_link.removeClass('active');
                $apz_group_search_tab.addClass('active');
            }
            $apz_contact_search_list.removeClass('vis').addClass('n-vis');
            $apz_group_search_list.removeClass('n-vis').addClass('vis');
            $apz_contact_search_input_box.removeClass('vis').addClass('n-vis');
            $apz_group_search_input_box.removeClass('n-vis').addClass('vis');
            $scope.searchProps.loadingIconStatus = 'n-vis';
            if (APZ_GROUP_ARRAY.length > 0) {
                angular.forEach(APZ_GROUP_ARRAY, function(group, i) {
                    groupIdArray.push(group.id);
                });
                var uniqueGroupIdArray = groupIdArray.filter(function(item, pos) {
                    return groupIdArray.indexOf(item) === pos;
                });
                uniqueGroupIdArray.sort();
                angular.forEach(uniqueGroupIdArray, function(groupId, i) {
                    var group = apzGroupUtils.getGroup('' + groupId);
                    groupsArray.push(group);
                    searchArray.push(apzContactLayout.getSearchContactElement(group));
                });
            } else {
                $scope.searchProps.noGroupStatus = 'vis';
            }
            $scope.groupSearchArray = searchArray;
            _this.initAutoSuggest({
                'contactsArray': groupsArray,
                '$searchId': $apz_group_search_input,
                'isContactSearch': true
            });
            $apz_search_box.mckModal();
        };
        _this.getSearchContactElement = function(contact) {
            var isGroupTab = contact.isGroup;
            var displayName = apzContactUtils.getTabDisplayName(contact.id, contact.isGroup);
            var imgsrctag = apzContactUtils.getContactImageLink(contact, displayName);
            var lastSeenStatus = '';
            if (!contact.isGroup && !APZ_BLOCKED_TO_MAP[contact.id]) {
                if (APZ_OL_MAP[contact.contactId]) {
                    lastSeenStatus = 'Online';
                } else if (APZ_LAST_SEEN_AT_MAP[contact.id]) {
                    lastSeenStatus = apzDateUtils.getLastSeenAtStatus(APZ_LAST_SEEN_AT_MAP[contact.id]);
                }
            }
            return {
                idExpr: contact.elementId,
                id: contact.id,
                isGroup: contact.isGroup,
                imgExpr: $sce.trustAsHtml(imgsrctag),
                lastSeenExpr: lastSeenStatus,
                displayName: displayName,
                firstAlphaExpr: displayName.charAt(0).toUpperCase()
            };
        };
        $scope.toggleBlock = function(e) {
            var isBlock = !$scope.tabProps.blockedStatus;
            if ($scope.activeContact.isGroup) {
                tabProps.blockUserMenuStatus = 'n-vis';
                return;
            }
            var blockText = (isBlock) ? 'Are you sure want to block this user!' : 'Are you sure want to unblock this user!';
            if (confirm(blockText)) {
                apzContactLayout.blockUser($scope.activeContact.id, isBlock);
            }
        };
        _this.blockUser = function(userId, isBlock) {
            var reqData = 'userId=' + userId + '&block=' + isBlock;
            var stateList = apzService.blockUser(reqData);
            stateList.then(function(response) {
                var data = response.data;
                if (typeof data === 'object') {
                    if (data.status === 'success') {
                        var userDetail = APZ_USER_DETAIL_MAP[userId];
                        if (typeof userDetail === 'object') {
                            userDetail.blockedByThis = isBlock;
                            APZ_USER_DETAIL_MAP[userId] = userDetail;
                        }
                        APZ_BLOCKED_TO_MAP[userId] = isBlock;
                        apzContactLayout.toggleBlockUser(userId, isBlock);
                    }
                }
            }, function() {});
        };
        _this.toggleBlockUser = function(userId, isBlocked) {
            if (isBlocked) {
                $scope.tabProps.errorText = 'You have blocked this user.';
                $scope.tabProps.errorStatus = 'vis';
                $scope.tabProps.msgFormStatus = 'n-vis';
                $scope.tabProps.titlewsStatus = '';
                $scope.tabProps.titlewtStatus = '';
                $scope.tabProps.subtitleStatus = 'n-vis';
                $scope.tabProps.typingStatus = 'n-vis';
                $scope.tabProps.blockedStatus = true;
                $scope.tabProps.blockedText = 'Unblock User';
            } else {
                $scope.tabProps.errorText = '';
                $scope.tabProps.errorStatus = 'n-vis';
                $scope.tabProps.msgFormStatus = 'vis';
                $scope.tabProps.blockedStatus = false;
                $scope.tabProps.blockedText = 'Block User';
                if (!APZ_BLOCKED_BY_MAP[userId] && (APZ_OL_MAP[userId] || APZ_LAST_SEEN_AT_MAP[userId])) {
                    if (APZ_OL_MAP[userId]) {
                        $scope.tabProps.subtitleText = 'Online';
                    } else if (APZ_LAST_SEEN_AT_MAP[userId]) {
                        $scope.tabProps.subtitleText = apzDateUtils.getLastSeenAtStatus(APZ_LAST_SEEN_AT_MAP[userId]);
                    }
                    $scope.tabProps.titlewsStatus = 'apz-title-ws';
                    $scope.tabProps.subtitleStatus = 'vis';
                }
            }
        };
        _this.toggleBlockByOtherUser = function(userId, isBlocked) {
            if (isBlocked) {
                APZ_BLOCKED_BY_MAP[userId] = true;
                $scope.tabProps.titlewsStatus === '';
                $scope.tabProps.subtitleStatus = 'n-vis';
                $scope.tabProps.typingStatus = 'n-vis';
            } else {
                APZ_BLOCKED_BY_MAP[userId] = false;
                if (!APZ_BLOCKED_TO_MAP[userId]) {
                    if (APZ_OL_MAP[userId]) {
                        $scope.tabProps.subtitleText = 'Online';
                    } else if (APZ_LAST_SEEN_AT_MAP[tabId]) {
                        $scope.tabProps.subtitleText = apzDateUtils.getLastSeenAtStatus(APZ_LAST_SEEN_AT_MAP[tabId]);
                    }
                    $scope.tabProps.titlewsStatus = 'apz-title-ws';
                    $scope.tabProps.subtitleStatus = 'vis';
                }
            }
        }


        $scope.searchContact = function(e) {
            if (appOptions.IS_AUTO_TYPE_SEARCH_ENABLED) {
                var $this = angular.element(e.currentTarget);
                var $inpuId = $this.parent('.apz-search-icon-box').siblings('input')
                var tabId = $inpuId.val();
                if (tabId) {
                    $scope.loadTab({
                        'tabId': tabId,
                        'isGroup': false,
                        'isSearch': true
                    });
                }
                $inpuId.val('');
                $apz_search_box.mckModal('hide');
            }
        };

        $scope.searchContactKeyPress = function(e) {
            if (appOptions.IS_AUTO_TYPE_SEARCH_ENABLED) {
                var $this = angular.element(e.currentTarget);
                if (e.which === 13) {
                    var tabId = $this.val();
                    if (tabId) {
                        $scope.loadTab({
                            'tabId': tabId,
                            'isGroup': false,
                            'isSearch': true
                        });
                    }
                    $this.val('');
                    $apz_search_box.mckModal('hide');
                    return true;
                }
            }
        };
        $scope.loadTab = function(params, callback) {
            var contact = (params.isGroup) ? apzGroupUtils.getGroup(params.tabId) : apzContactUtils.fetchContact(params.tabId);
            if (typeof params.index === 'undefined') {
                // var contactArray = [];
                // contactArray.push(_this.getConversationElement(contact));
                var activeContact = $scope.contacts.filter(function(obj) {
                    return obj.htmlId == contact.elementId;
                });
                if (activeContact.length === 0) {
                    activeContact = _this.getConversationElement(contact);
                    activeContact.isSearch = true;
                    var activeContactArray = [ activeContact ];
                    $scope.contacts = activeContactArray.concat($scope.contacts);
                    $scope.$apply();
                    $timeout(function() {
                        $scope.prevActiveContact = $scope.activeContact;
                        $scope.activeContact = activeContact;
                        $scope.$apply();
                    }, 'fast');
                } else {
                    $scope.prevActiveContact = $scope.activeContact;
                    activeContact[0].isSearch = true;
                    $scope.activeContact = activeContact[0];
                    $scope.$apply();
                }
            } else {
                $scope.prevActiveContact = $scope.activeContact;
                $scope.contacts[params.index].isSearch = false;
                $scope.activeContact = $scope.contacts[params.index];
            }
        /*
         * $apz_message_inner.data('apz-id', params.tabId); $apz_message_inner.data('apz-conversationid', params.conversationId); $apz_message_inner.data('apz-isgroup', params.isGroup); // var apzContactsArray = $scope.contacts;
         * 
         * if(apzContactsArray) { apzContactsArray.push(contactElem); } // $.tmpl("contactTemplate", contactElem).appendTo('#apz-contact-list-111'); // angular.element('#li-'+ prefix + contact.htmlId).addClass('active'); // var watch = $scope.$watch('convOrder', function (convOrder) { // $scope.contacts = (apzContactsArray) ? contactArray.concat(apzContactsArray) : contactArray; // }, function() { $scope.$evalAsync(function() { if(params.isGroup) { angular.element('#li-group-' + params.tabId).addClass('active'); } else { angular.element('#li-user-' + params.tabId).addClass('active'); } if (params.isSearch) { $apz_contact_inner.scrollTop($(".apz-contact-li.active").offset().top - $apz_contact_inner.offset().top + $apz_contact_inner.scrollTop()); } });}); } else { $scope.activeContact = $scope.contacts[params.index]; } if($convBox.length === 0) { var convBox = apzMessageLayout.getConvForMessageCell(contact, params); $.tmpl("conversationTemplate",
         * convBox).appendTo('#apz-message-cell'); $convBox = angular.element('#cb-' + prefix + contact.htmlId); $convBox.data('apz-conversationId', params.conversationId); } else if(params.conversationId) { $convBox.data('apz-conversationId', params.conversationId); } angular.element(".apz-message-inner").removeClass('active'); $convBox.addClass('active'); // if (params.isSearch) { // $apz_contact_inner.scrollTop($(".apz-contact-li.active").offset().top - $apz_contact_inner.offset().top + $apz_contact_inner.scrollTop()); // }
         * 
         * apzMessageLayout.setMessagePanelStatus(contact, params); var reqData = "startIndex=0&pageSize=30"; reqData += (params.isGroup) ? "&groupId=" + params.tabId : "&userId=" + encodeURIComponent(params.tabId); individual = true; if (params.startTime) { reqData += "&endTime=" + params.startTime; } if (IS_TOPIC_BOX_ENABLED && params.conversationId) { reqData += "&conversationId=" + params.conversationId; if (typeof APZ_TAB_CONVERSATION_MAP[_prefix + params.tabId] === 'undefined') { isConvReq = true; reqData += "&conversationReq=true"; } else { // mckMessageLayout.addConversationMenu(params.tabId, params.isGroup); } } MESSAGE_SYNCING = true; $apz_msg_loading.removeClass('n-vis').addClass('vis'); var stateList = apzAppService.getMessageList(reqData); stateList.then(function(response) { var data = response.data; MESSAGE_SYNCING = false; $apz_msg_loading.removeClass('vis').addClass('n-vis'); if(data.message.length > 0) { if (params.startTime > 0) {
         * apzMessageLayout.processMessageList(data.message, false); } else { apzMessageLayout.processMessageList(data.message, true); $apz_msg_menu_option.removeClass('n-vis').addClass('vis'); } } else { if (params.startTime) { $apz_no_conversation_text.removeClass('n-vis').addClass('vis'); $apz_no_conversation_text.fadeOut(3000, function() { $apz_no_conversation_text.removeClass('vis').addClass('n-vis'); }); $convBox.data('datetime', ""); } else if ($convBox.children("div[name='message']").length === 0) { $apz_msg_menu_option.removeClass('vis').addClass('n-vis'); $convBox.html('<div class="apz-no-data-text apz-text-muted">No messages yet!</div>'); } } if (data.userDetails.length > 0) { angular.forEach(data.userDetails, function(userDetail, i) { APZ_USER_DETAIL_MAP[userDetail.userId] = userDetail; if (!params.isGroup) { apzContactUtils.updateLastSeenStatus(userDetail); if (!IS_USER_DEACTIVATED) { if (!params.isGroup) { if (userDetail.blockedByThis) {
         * APZ_BLOCKED_TO_MAP[userDetail.userId] = true; apzMessageLayout.toggleBlockUser(params.tabId, true); } else if (userDetail.blockedByOther) { APZ_BLOCKED_BY_MAP[userDetail.userId] = true; $apz_msg_panel_title.removeClass('apz-panel-title-w-subtitle'); $apz_msg_panel_subtitle.removeClass('vis').addClass('n-vis'); $apz_msg_typing_status.removeClass('vis').addClass('n-vis'); $apz_btn_block.data('blocked', false); } else { apzMessageLayout.toggleBlockUser(params.tabId, false); } } } } }); } if (data.groupFeeds.length > 0) { angular.forEach(data.groupFeeds, function(groupFeed, i) { apzGroupUtils.addGroup(groupFeed); }); } if (data.conversationPxys.length > 0) { var tabConvArray = new Array(); angular.forEach(data.conversationPxys, function(conversationPxy, i) { if (typeof conversationPxy === 'object') { apzContactUtils.updateConversationMaps(conversationPxy); tabConvArray.push(conversationPxy); } }); if (isConvReq) { APZ_TAB_CONVERSATION_MAP[_prefix + params.tabId] =
         * tabConvArray; // apzMessageLayout.addConversationMenu(params.tabId, params.isGroup); } } if (params.conversationId) { var conversationPxy = APZ_CONVERSATION_MAP[params.conversationId]; if (typeof conversationPxy === 'object' && conversationPxy.closed) { apzMessageLayout.closeConversation('CONVERSATION_CLOSED'); } } if (!params.startTime) { if (params.isGroup) { apzGroupLayout.addGroupStatus(apzGroupUtils.getGroup(params.tabId)); } apzMessageLayout.updateUnreadCount(_prefix + params.tabId, 0, true); if (typeof callback === 'function') { callback(params); } }
         * 
         * });
         */
        };
        _this.updateConvInfoData = function(contact) {
            angular.forEach($scope.contacts, function(cont, i) {
                if (cont.htmlId === contact.elementId) {
                    var imgsrctag = apzContactUtils.getContactImageLink(contact);
                    $scope.contacts[i].displayName = contact.displayName;
                    $scope.contacts[i].imgExpr = $sce.trustAsHtml(imgsrctag);
                }
            })
        };
        _this.clearConvMessageData = function(contact) {
            apzMessageLayout.updateUnreadCount(contact.elementId, 0, true);
            angular.forEach($scope.contacts, function(cont, i) {
                if (cont.htmlId === contact.elementId) {
                    $scope.contacts[i].msgDateExpr = '';
                    $scope.contacts[i].msgExpr = $sce.trustAsHtml('');
                    $scope.contacts[i].unreadCountExpr = 'n-vis';
                    $scope.contacts[i].unreadCount = 0;
                }
            })
        };
        _this.updateConvListOnMessage = function(contact, message) {
            var contactElem = _this.getConversationElement(contact, message);
            var isUpdated = false;
            angular.forEach($scope.contacts, function(cont, i) {
                if (cont.htmlId === contact.elementId) {
                    $scope.contacts[i].msgDateExpr = contactElem.msgDateExpr;
                    $scope.contacts[i].msgTime = contactElem.msgTime;
                    $scope.contacts[i].unreadCount = contactElem.unreadCount;
                    $scope.contacts[i].unreadCountExpr = contactElem.unreadCountExpr;
                    $scope.contacts[i].msgExpr = contactElem.msgExpr;
                    isUpdated = true;
                    return false;
                }
            });
            if (!isUpdated) {
                var contactElemArray = [ contactElem ];
                $scope.contacts = contactElemArray.concat($scope.contacts);
            }
        };
        _this.updateConvListOnStatusChange = function(contact, isOnline) {
            angular.forEach($scope.contacts, function(cont, i) {
                if (cont.htmlId === contact.elementId) {
                    $scope.contacts[i].olExpr = (isOnline) ? 'vis' : 'n-vis';
                }
            });
        };
        _this.updateConvListOnUnreadCountChange = function(contact) {
            angular.forEach($scope.contacts, function(cont, i) {
                if (cont.htmlId === contact.elementId) {
                    var unreadCount = apzMessageLayout.getUnreadCount(contact.elementId);
                    $scope.contacts[i].unreadCountExpr = (unreadCount > 0) ? 'vis' : 'n-vis';
                    $scope.contacts[i].unreadCount = unreadCount;
                    return false;
                }
            });
        };
        _this.updateConvList = function(contact) {
            var tabExpr = (contact.isGroup) ? 'groupId=' + contact.id : 'userId=' + encodeURIComponent(contact.id);
            var reqData = 'startIndex=0&pageSize=1&' + tabExpr;
            var stateList = apzService.getMessageList(reqData);
            stateList.then(function(response) {
                var data = response.data;
                if (data.message.length > 0) {
                    var message = data.message[0];
                    if (typeof message !== 'undefined') {
                        var emoji_template = apzMessageUtils.getMessageTextForContactPreview(message, contact, 100);
                        angular.forEach($scope.contacts, function(cont, i) {
                            if (cont.htmlId === contact.elementId) {
                                $scope.contacts[i].msgExpr = $sce.trustAsHtml(emoji_template);
                                $scope.contacts[i].msgDateExpr = message ? apzDateUtils.getTimeOrDate(message.createdAtTime, true) : "";
                            }
                        })
                    }
                } else {
                    _this.clearConvMessageData(contact);
                }
            }, function() {
                _this.clearConvMessageData(contact);
            });
        };
        _this.addContactsToSearchList = function() {
            if (APZ_CONTACT_ARRAY.length === 0 && APZ_CHAT_CONTACT_ARRAY.length === 0) {
                return;
            }
            var contactsArray = [],
                userIdArray = [],
                groupIdArray = [];
            var uniqueIds = [];
            angular.forEach(APZ_CONTACT_ARRAY, function(contact, i) {
                if (typeof uniqueIds[contact.id] === 'undefined') {
                    uniqueIds[contact.id] = true;
                    contactsArray.push(contact);
                }
            });
            angular.forEach(APZ_CHAT_CONTACT_ARRAY, function(contact, i) {
                (contact.isGroup) ? groupIdArray.push(contact.id) : userIdArray.push(contact.id);
            });
            var uniqueUserIdArray = userIdArray.filter(function(item, pos) {
                return userIdArray.indexOf(item) === pos;
            });
            var uniqueGroupIdArray = groupIdArray.filter(function(item, pos) {
                return groupIdArray.indexOf(item) === pos;
            });
            angular.forEach(uniqueUserIdArray, function(userId, i) {
                contactsArray.push(apzContactUtils.fetchContact('' + userId));
            });
            angular.forEach(uniqueGroupIdArray, function(groupId, i) {
                contactsArray.push(apzGroupUtils.getGroup('' + groupId));
            });
            if (contactsArray.length > 0) {
                _this.initAutoSuggest({
                    'contactsArray': contactsArray,
                    '$searchId': $apz_contact_search,
                    'isContactSearch': true
                });
            }
        };
        _this.initAutoSuggest = function(params) {
            var contactsArray = params.contactsArray;
            var $searchId = params.$searchId;
            var typeaheadArray = [];
            var typeaheadEntry;
            var typeaheadMap = {};
            var contactSuggestionsArray = [];
            for (var j = 0; j < contactsArray.length; j++) {
                var contact = contactsArray[j];
                contact.displayName = apzContactUtils.getTabDisplayName(contact.id, contact.isGroup);
                typeaheadEntry = (contact.displayName) ? $.trim(contact.displayName) : $.trim(contact.id);
                typeaheadMap[typeaheadEntry] = contact;
                typeaheadArray.push(typeaheadEntry);
                contactSuggestionsArray.push(typeaheadEntry);
            }
            var matcher = function(item) {
                var contact = typeaheadMap[item];
                var contactNameArray = contact.displayName.split(' ');
                var contactNameLength = contactNameArray.length;
                var contactFName = contactNameArray[0];
                var contactMName = '';
                var contactLName = '';
                if (contactNameLength === 2) {
                    contactLName = contactNameArray[1];
                } else if (contactNameLength >= 3) {
                    contactLName = contactNameArray[contactNameLength - 1];
                    contactMName = contactNameArray[contactNameLength - 2];
                }
                var matcher = new RegExp(this.query, 'i');
                return matcher.test(contact.displayName) || matcher.test(contact.id) || matcher.test(contactMName) || matcher.test(contactLName) || matcher.test(contact.email) || matcher.test(contactFName + " " + contactLName);
            };
            var highlighter = function(item) {
                var contact = typeaheadMap[item];
                return contact.displayName;
            };
            var updater = function(item) {
                var contact = typeaheadMap[item];
                if (params.isContactSearch) {
                    $scope.loadTab({
                        tabId: contact.id,
                        isGroup: contact.isGroup,
                        isSearch: true
                    });
                } else {
                    $scope.addGroupMemberFromSearch(contact.id);
                }
            };
            if ($searchId.hasClass('apz-typeahead')) {
                $searchId.apztypeahead().data('apztypeahead').source = typeaheadArray;
                $searchId.apztypeahead().data('apztypeahead').matcher = matcher;
                $searchId.apztypeahead().data('apztypeahead').highlighter = highlighter;
                $searchId.apztypeahead().data('apztypeahead').updater = updater;
                return;
            } else {
                $searchId.addClass('apz-typeahead');
            }
            $searchId.apztypeahead({
                source: typeaheadArray,
                matcher: matcher,
                highlighter: highlighter,
                updater: updater
            });
        };

        _this.loadClientContacts = function(data) {
            if (data + '' === 'null' || typeof data === 'undefined' || typeof data.contacts === 'undefined' || data.contacts.length === 0) {
                return;
            }
            APZ_CONTACT_ARRAY.length = 0;
            angular.forEach(data.contacts, function(contact, i) {
                if ( (typeof contact.userId !== 'undefined') ) {
                    var contact = apzContactUtils.getContact('' + data.userId);
                    contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(data) : _this.updateContactDetail(contact, data);
                    APZ_CONTACT_ARRAY.push(contact);
                }
            });
        };
        $scope.loadContacts = function() {
            if (APZ_CONTACT_ARRAY.length > 0) {
                _this.addContactsToSearchList();
            } else if (!appOptions.IS_LOAD_OWN_CONTACTS) {
                var stateList = apzService.getContactList();
                stateList.then(function(response) {
                    var data = response.data;
                    if (typeof data === 'object' && data.users.length > 0) {
                        var apzContactNameArray = [];
                        angular.forEach(data.users, function(user, i) {
                            if (user.userId) {
                                var contact = apzContactUtils.getContact('' + user.userId);
                                contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(user) : apzContactUtils.updateContactDetail(contact, user);
                                APZ_CONTACT_ARRAY.push(contact);
                                apzContactNameArray.push([ user.userId, contact.displayName ]);
                                apzContactUtils.updateLastSeenStatus(user);
                            }
                        });
                    }
                });
                _this.addContactsToSearchList();
            } else {
                _this.addContactsToSearchList();
            }
        };
        _this.loadChatUsersList = function(params) {
            var response = new Object();
            var stateList = apzService.getChatUsersList();
            stateList.then(function(response) {
                var data = response.data;
                if (data.users.length > 0) {
                    angular.forEach(data.users, function(user, i) {
                        if (user.userId) {
                            var contact = apzContactUtils.getContact('' + user.userId);
                            contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(user) : apzContactUtils.updateContactDetail(contact, user);
                            APZ_GROUP_MEMBER_SEARCH_ARRAY.push(contact.id);
                        }
                    });
                }
                response.status = 'success';
                response.data = data;
                if (params.callback) {
                    params.callback(response);
                }
                return;
            }, function() {
                response.status = 'error';
                if (params.callback) {
                    params.callback(response);
                }
            });
        };
        $scope.loadConversations = function(params) {
            $scope.convProps.loadingIconStatus = 'vis';
            $scope.convProps.isSyncing = true;
            var reqData = 'startIndex=0&mainPageSize=10';
            if (params.startTime) {
                reqData += '&endTime=' + params.startTime;
            }
            var stateList = apzService.getMessageList(reqData);
            stateList.then(function(response) {
                $scope.convProps.isSyncing = false;
                if (!params.startTime) {
                    APZ_OL_MAP = [];
                }
                var data = response.data;
                if (data.userDetails.length > 0) {
                    angular.forEach(data.userDetails, function(userDetail, i) {
                        APZ_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                        apzContactUtils.updateLastSeenStatus(userDetail);
                        var contact = apzContactUtils.getContact('' + userDetail.userId);
                        contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(userDetail) : apzContactUtils.updateContactDetail(contact, userDetail);
                        apzMessageLayout.updateUnreadCount(contact.elementId, userDetail.unreadCount, false);
                    });
                }
                if (data.groupFeeds.length > 0) {
                    angular.forEach(data.groupFeeds, function(groupFeed, i) {
                        var group = apzGroupUtils.addGroup(groupFeed);
                        apzMessageLayout.updateUnreadCount(group.elementId, groupFeed.unreadCount, false);

                    });
                }
                if (data.blockedUserPxyList.blockedToUserList.length > 0) {
                    angular.forEach(data.blockedUserPxyList.blockedToUserList, function(blockedToUser, i) {
                        if (blockedToUser.userBlocked) {
                            APZ_BLOCKED_TO_MAP[blockedToUser.blockedTo] = true;
                        }
                    });
                }
                if (data.blockedUserPxyList.blockedByUserList.length > 0) {
                    (data.blockedUserPxyList.blockedByUserList, function(i, blockedByUser) {
                        if (blockedByUser.userBlocked) {
                            APZ_BLOCKED_BY_MAP[blockedByUser.blockedBy] = true;
                        }
                    });
                }
                if (data.conversationPxys.length > 0) {
                    angular.forEach(data.conversationPxys, function(conversationPxy, i) {
                        apzContactUtils.updateConversationMaps(conversationPxy);
                    });
                }
                if (data.message.length > 0) {
                    if (params.startTime) {
                        _this.addConvFromMessageList(data.message, false);
                    // apzStorage.updateApzMessageArray(data.message);
                    } else {
                        _this.addConvFromMessageList(data.message, true);
                        // apzStorage.setApzMessageArray(data.message);
                        $apz_contact_inner.animate({
                            scrollTop: 0
                        }, 'fast');
                    }
                } else {
                    if (params.startTime) {
                        $apz_no_more_conversations.removeClass('n-vis').addClass('vis');
                        $apz_no_more_conversations.fadeOut(5000, function() {
                            $apz_no_more_conversations.removeClass('vis').addClass('n-vis');
                        });
                    } else {
                        $scope.convProps.noConvStatus = 'vis';
                    }
                    $scope.convProps.syncTime = 0;
                }
                $scope.convProps.loadingIconStatus = 'n-vis';
            }, function(e) {
                $scope.convProps.loadingIconStatus = 'n-vis';
            })
        };
        _this.addConvFromMessageList = function(messageList, isLatest) {
            $scope.convProps.loadingIconStatus = 'n-vis';
            var showMoreDateTime;
            if (typeof messageList === 'undefined' && messageList.length === 0) {
                return;
            }
            var contactArray = [];
            angular.forEach(messageList, function(message, i) {
                if (message.groupId) {
                    var groupId = message.groupId;
                    var group = apzGroupUtils.getGroup('' + groupId);
                    if (typeof group === 'undefined') {
                        group = apzGroupUtils.createGroup(groupId);
                        apzGroupLayout.loadGroups();
                    }
                    contactArray.push(_this.getConversationElement(group, message));
                } else {
                    var contact = apzContactUtils.fetchContact('' + message.to);
                    contactArray.push(_this.getConversationElement(contact, message));
                }
                showMoreDateTime = message.createdAtTime;
            })
            $scope.convProps.syncTime = showMoreDateTime;
            if (isLatest) {
                $scope.contacts = contactArray;
            // $scope.convOrder = 'msgTime';
            } else {
                var apzContactsArray = $scope.contacts;
                // $scope.$watch('convOrder', function (convOrder) {
                $scope.contacts = (apzContactsArray) ? apzContactsArray.concat(contactArray) : contactArray;
            // });
            }
            $scope.loadContacts();
        };
        // _this.addContactFromMessage = function(message, update) {
        // var contactIdsArray = apzContactUtils.getUserIdArrayFromMessage(message);
        // if (contactIdsArray.length > 0 && contactIdsArray[0]) {
        // for (var i = 0; i < contactIdsArray.length; i++) {
        // var contact = apzContactUtils.fetchContact('' + contactIdsArray[i]);
        // _this.updateRecentConversationList(contact, message, update);
        // }
        // }
        // };
        // _this.addGroupFromMessage = function(message, update) {
        // var groupId = message.groupId;
        // var group = mckGroupLayout.getGroup('' + groupId);
        // if (typeof group === 'undefined') {
        // group = mckGroupLayout.createGroup(groupId);
        // mckGroupService.loadGroups();
        // }
        // _this.updateRecentConversationList(group, message, update);
        // };
        _this.updateRecentConversationList = function(contact, message, update) {
            var contactHtmlExpr = (contact.isGroup) ? 'group-' + contact.htmlId : 'user-' + contact.htmlId;
            var $apz_msg_part = angular.element('#li-' + contactHtmlExpr + ' .apz-cont-msg-wrapper');
            if (($apz_msg_part.is(':empty') || update) && message !== undefined) {
                _this.updateContactToContactList(contact, message);
            }
        };
        _this.getConversationElement = function(contact, message) {
            var emoji_template = apzMessageUtils.getMessageTextForContactPreview(message, contact, 100);
            var conversationId = "";
            var isGroupTab;
            if (typeof message !== "undefined") {
                if (message.conversationId) {
                    conversationId = message.conversationId;
                }
                isGroupTab = (message.groupId) ? true : false;
            } else {
                isGroupTab = contact.isGroup;
            }
            APZ_CHAT_CONTACT_ARRAY.push(contact);
            var displayName = apzContactUtils.getTabDisplayName(contact.id, isGroupTab);
            var imgsrctag = apzContactUtils.getContactImageLink(contact, displayName);
            var prepend = false;
            var unreadCount = apzMessageLayout.getUnreadCount(contact.elementId);
            var unreadCountExpr = (unreadCount > 0) ? 'vis' : 'n-vis';
            var olStatus = 'n-vis';
            if (!isGroupTab && !APZ_BLOCKED_TO_MAP[contact.id] && !APZ_BLOCKED_BY_MAP[contact.id] && appOptions.IS_OL_STATUS_ENABLED && APZ_OL_MAP[contact.id]) {
                olStatus = 'vis';
                prepend = true;
            }
            return {
                htmlId: contact.elementId,
                id: contact.id,
                isGroup: isGroupTab,
                msgTime: message ? message.createdAtTime : '',
                launcherExpr: APZ_LAUNCHER,
                imgExpr: $sce.trustAsHtml(imgsrctag),
                olExpr: olStatus,
                unreadCountExpr: unreadCountExpr,
                unreadCount: unreadCount,
                displayName: displayName,
                conversationId: conversationId,
                msgDateExpr: message ? apzDateUtils.getTimeOrDate(message.createdAtTime, true) : "",
                msgExpr: $sce.trustAsHtml(emoji_template)
            }
        // (typeof emoji_template === 'object') ? $textMessage.append(emoji_template) : $textMessage.html(emoji_template);
        }
    }
    function ApzGroupLayout() {
        var _this = this;
        var APZ_MAX_GROUP_TITLE_LENGTH = 30;
        var $apz_msg_inner = angular.element('#apz-message-inner');
        var $apz_app_box = angular.element('#apz-app-box');
        var $apz_group_icon_upload = angular.element('#apz-group-icon-upload');
        var $apz_group_icon_change = angular.element('#apz-group-icon-change');
        var $apz_gm_search = angular.element('#apz-gm-search');
        var $apz_gm_search_box = angular.element('#apz-gm-search-box');
        var $apz_btn_group_create = angular.element('#apz-btn-group-create');
        var $apz_gi_title = angular.element('#apz-gi-title');
        var $apz_group_create_title = angular.element('#apz-group-create-title-box .apz-group-title');
        var $apz_group_info_tab = angular.element('#apz-group-info-tab');
        var $apz_group_create_tab = angular.element('#apz-group-create-tab');
        var $apz_panel_right = angular.element('.apz-panel-right');
        var $apz_group_create_type = angular.element('#apz-group-create-type');
        var $apz_group_title_text = angular.element('.apz-group-title-panel div[contenteditable]');
        $scope.loadGroupCreateTab = function(e) {
            $scope.gcProps.iconLoadingStatus = 'n-vis';
            $scope.gcProps.iconUrl = '';
            $apz_group_create_title.html('');
            $scope.gcProps.overlayStatus = '';
            $scope.gcProps.overlayLabel = 'Add Group Icon';
            $scope.gcProps.icon = $sce.trustAsHtml(apzGroupUtils.getGroupDefaultIcon());
            angular.element('body').addClass('apz-panel-3');
            angular.element('.emoji-menu').addClass('apz-panel-3');
            $apz_app_box.addClass('apz-panel-3');
            $apz_group_info_tab.removeClass('vis').addClass('n-vis');
            $apz_group_create_tab.removeClass('n-vis').addClass('vis');
        };
        $scope.editGroupTitle = function(e) {
            $apz_gi_title.attr('contenteditable', true).focus();
            apzUtils.setEndOfContenteditable($apz_gi_title[0]);
            $scope.giProps.saveTitleStatus = 'vis';
            $scope.giProps.editTitleStatus = 'n-vis';
        };
        $scope.saveGroupIcon = function(e) {
            var iconUrl = $scope.giProps.iconUrl;
            if (iconUrl) {
                if ($scope.activeContact.isGroup) {
                    $timeout(function() {
                        $scope.giProps.saveIconStatus = 'n-vis';
                    }, 1000);
                    var params = {
                        groupId: $scope.activeContact.id,
                        imageUrl: iconUrl,
                        apzCallback: apzGroupLayout.onUpdateGroupInfo
                    }
                    $scope.giProps.iconUrl = '';
                    apzGroupLayout.updateGroupInfo(params);
                }
            } else {
                alert('Unable to process your request. Please try again.')
            }
        };
        $scope.saveGroupTitle = function(e) {
            var groupName = $.trim($apz_gi_title.text());
            if (groupName.length > 0) {
                if ($scope.activeContact.isGroup) {
                    $scope.giProps.editTitleStatus = 'vis';
                    $scope.giProps.saveTitleStatus = 'n-vis';
                    $apz_gi_title.attr('contenteditable', false);
                    var params = {
                        groupId: $scope.activeContact.id,
                        name: groupName,
                        apzCallback: apzGroupLayout.onUpdateGroupInfo
                    }
                    apzGroupLayout.updateGroupInfo(params);
                }
            } else {
                $scope.isTextReq.giTitlebox = 'apz-req-border';
            }
        };
        $apz_group_title_text.keypress(function(e) {
            if (e.which === 8 || e.keyCode === 37 || e.keyCode === 38 || e.keyCode === 39 || e.keyCode === 40 || (e.ctrlKey && e.which === 97)) {
                return true;
            } else if (e.keyCode === 13 && !(e.shiftKey || e.ctrlKey)) {
                if (angular.element(e.target).hasClass('apz-group-create-title')) {
                    $scope.createGroupSubmit(e);
                    return false;
                } else {
                    return false;
                }
            } else {
                return APZ_MAX_GROUP_TITLE_LENGTH > this.innerText.length;
            }
        }).on('paste', function(e) {
            var $this = this;
            $timeout(function() {
                var len = $this.innerText.length;
                if (len > APZ_MAX_GROUP_TITLE_LENGTH) {
                    $this.innerHTML = $this.innerText.substring(0, APZ_MAX_GROUP_TITLE_LENGTH);
                    apzUtils.setEndOfContenteditable($this);
                }
                return false;
            }, 'fast');
        }).on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
        $scope.createGroupSubmit = function(e) {
            var groupName = $.trim($apz_group_create_title.text());
            var groupType = $apz_group_create_type.val();
            var icon = $scope.gcProps.iconUrl;
            if (groupName.length > 0) {
                var params = {
                    groupName: groupName
                }
                if (groupType) {
                    groupType = parseInt(groupType);
                    if (APZ_GROUP_TYPE_MAP.indexOf(groupType) !== -1) {
                        params.type = groupType;
                    }
                }
                if ($scope.gcProps.iconUrl) {
                    params.groupIcon = $scope.gcProps.iconUrl;
                    $scope.gcProps.iconUrl = '';
                }
                params.isInternal = true;
                $apz_btn_group_create.attr('disabled', true).html('Creating Group...');
                $scope.createGroup(params);
            } else {
                $scope.isTextReq.gcTitlebox = 'apz-req-border';
            }
        };
        $scope.changeGroupIcon = function($event) {
            $apz_group_icon_change.trigger('click');
        };
        $scope.uploadGroupIcon = function($event) {
            $apz_group_icon_upload.trigger('click');
        };
        angular.element(document).on('mouseenter', '.apz-group-info-icon-panel.apz-hover-on', function() {
            $scope.giProps.overlayStatus = 'vis';
            $scope.$apply();
        }).on('mouseleave', '.apz-group-info-icon-panel.apz-hover-on', function() {
            $scope.giProps.overlayStatus = 'n-vis';
            $scope.$apply();
        });
        angular.element('#apz-group-create-icon-box .apz-overlay').on('click', function(e) {
            $apz_group_icon_upload.trigger('click');
        });
        angular.element(document).on('mouseenter', '.apz-group-create-icon-panel.apz-hover-on', function() {
            $scope.gcProps.overlayStatus = 'vis';
            $scope.$apply();
        }).on('mouseleave', '.apz-group-create-icon-panel.apz-hover-on', function() {
            var $this = angular.element(this);
            if ($this.find('.apz-group-icon-default').length === 0) {
                $scope.gcProps.overlayStatus = 'n-vis';
                $scope.$apply();
            }
        });
        _this.loadGroupTab = function(response) {
            if (response.status === 'error') {
                alert('Unable to process your request. ' + response.errorMessage);
            } else {
                var group = response.data;
                $scope.loadTab({
                    'tabId': group.id,
                    'isGroup': true
                });
            }
        };
        _this.reloadGroupTab = function(group) {
            if ($scope.activeContact.htmlId === group.elementId) {
                var params = {
                    'tabId': group.id,
                    'isGroup': true
                };
                if ($scope.activeContact.conversationId) {
                    params.conversationId = $scope.activeContact.conversationId;
                }
                $scope.loadTab(params);
            }
        };
        _this.updateGroupInfo = function(params) {
            var groupInfo = {};
            var response = new Object();
            if (params.groupId) {
                groupInfo.groupId = params.groupId;
            } else if (params.clientGroupId) {
                groupInfo.clientGroupId = params.clientGroupId;
            } else {
                if (typeof params.callback === 'function') {
                    response.status = 'error';
                    response.errorMessage = 'groupId or client groupId required';
                    params.callback(response);
                }
                return;
            }
            if (params.name) {
                groupInfo.newName = params.name;
            }
            if (params.imageUrl) {
                groupInfo.imageUrl = params.imageUrl;
            }
            var stateCreated = apzService.updateGroup(groupInfo);
            stateCreated.then(function(response) {
                var data = response.data;
                if (data.status === 'success') {
                    if (params.clientGroupId) {
                        var group = apzGroupUtils.getGroupByClientGroupId(params.clientGroupId);
                        if (typeof group === 'object') {
                            params.groupId = group.contactId;
                        }
                    }
                    response.status = 'success';
                    response.data = data.response;
                } else {
                    response.status = 'error';
                    response.errorMessage = data.errorResponse[0].description;
                }
                if (params.callback) {
                    params.callback(response);
                }
                if (params.apzCallback) {
                    params.apzCallback(response, {
                        groupId: params.groupId,
                        groupInfo: groupInfo
                    })
                }
            }, function() {
                console.log('Unable to process your request. Please reload page.');
                response.status = 'error';
                response.errorMessage = 'Unable to process your request. Please reload page.';
                if (params.callback) {
                    params.callback(response);
                }
                if (params.apzCallback) {
                    params.apzCallback(response);
                }
            });
        };
        _this.onUpdateGroupInfo = function(response, params) {
            if (typeof response === 'object') {
                if (response.status === 'error') {
                    alert('Unable to process your request. ' + response.errorMessage);
                    return;
                }
            }
            var groupId = params.groupId;
            var groupInfo = params.groupInfo;
            var group = apzGroupUtils.getGroup(groupId);
            if (typeof group === 'object') {
                if (groupInfo.imageUrl) {
                    group.imageUrl = groupInfo.imageUrl;
                }
                if (groupInfo.newName) {
                    group.displayName = groupInfo.newName;
                }
                if ($apz_group_info_tab.hasClass('vis')) {
                    if (group.imageUrl) {
                        $scope.giProps.icon = $sce.trustAsHtml(apzGroupUtils.getGroupImage(group.imageUrl));
                    }
                    $apz_gi_title.html(group.displayName);
                }
                if ($scope.activeContact.htmlId === group.elementId) {
                    $scope.tabProps.title = group.displayName;
                    if (group.imageUrl) {
                        $scope.tabProps.icon = $sce.trustAsHtml(apzGroupUtils.getGroupImage(group.imageUrl));
                    }
                }
                apzContactLayout.updateConvInfoData(group);
                APZ_GROUP_MAP[group.id] = group;
            }
        };
        $scope.createGroup = function(params) {
            var usersArray = [];
            angular.forEach(params.users, function(user, i) {
                if (typeof user.userId !== 'undefined') {
                    usersArray.push(user);
                }
            });
            var groupInfo = {
                'groupName': $.trim(params.groupName),
                'users': usersArray,
                'type': params.type
            };
            if (params.clientGroupId) {
                groupInfo.clientGroupId = params.clientGroupId;
            }
            if (params.groupIcon) {
                groupInfo.imageUrl = params.groupIcon;
            }
            var response = new Object();
            var stateCreated = apzService.createGroup(groupInfo);
            stateCreated.then(function(response) {
                var data = response.data;
                if (params.isInternal) {
                    $apz_btn_group_create.attr('disabled', false);
                    $apz_btn_group_create.html('Create Group');
                }
                if (typeof data === 'object' && data.status === 'success') {
                    var groupPxy = data.response;
                    if (typeof groupPxy === 'object') {
                        var group = apzGroupUtils.addGroup(groupPxy);
                        if (groupPxy.users.length > 0) {
                            angular.forEach(groupPxy.users, function(userDetail, i) {
                                APZ_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                                apzContactUtils.updateLastSeenStatus(userDetail);
                                var contact = apzContactUtils.getContact('' + userDetail.userId);
                                contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(userDetail) : apzContactUtils.updateContactDetail(contact, userDetail);
                                apzMessageLayout.updateUnreadCount(contact.elementId, userDetail.unreadCount, false);
                            });
                        }
                        params.tabId = group.id;
                        params.isGroup = true;
                        params.prepend = true;
                        if (typeof params.callback === 'function') {
                            response.status = 'success';
                            response.data = group;
                            params.callback(response);
                        }
                        (params.isMessage) ? $scope.loadTab(params, _this.dispatchMessage) : $scope.loadTab(params);
                    }
                } else if (data.status === 'error') {
                    if (typeof params.callback === 'function') {
                        response.status = 'error';
                        response.errorMessage = data.errorResponse[0].description;
                        params.callback(response);
                    }
                }
            }, function() {
                if (typeof params.callback === 'function') {
                    response.status = 'error';
                    response.errorMessage = 'Unable to process request.';
                    params.callback(response);
                }
                if (params.isInternal) {
                    $apz_btn_group_create.attr('disabled', false);
                    $apz_btn_group_create.html('Create Group');
                }
            });
        };
        $scope.searchGroupMemberKeyPress = function(e) {
            if (e.which === 13) {
                var userId = $apz_gm_search.val();
                if (userId) {
                    $scope.addGroupMemberFromSearch(userId);
                }
                return true;
            }
        };
        $scope.searchGroupMemberIconClick = function(e) {
            e.preventDefault();
            var userId = $apz_gm_search.val();
            if (userId) {
                $scope.addGroupMemberFromSearch(userId);
            }
        };
        $scope.loadGroupMemberSearchList = function() {
            if ($scope.activeContact.id) {
                var group = apzGroupUtils.getGroup($scope.activeContact.id);
                if (group && group.adminName === appOptions.USER_ID) {
                    if (APZ_GROUP_MEMBER_SEARCH_ARRAY.length > 0) {
                        apzGroupLayout.addMembersToGroupMemberSearchList();
                    } else {
                        apzContactLayout.loadChatUsersList({
                            'callback': apzGroupLayout.addMembersToGroupMemberSearchList
                        });
                    }
                    $apz_gm_search_box.mckModal();
                } else {
                    $scope.giProps.adminOptnsStatus = 'n-vis';
                    return;
                }
            }
        };
        _this.addMembersToGroupMemberSearchList = function() {
            if ($scope.activeContact.isGroup) {
                var group = apzGroupUtils.getGroup($scope.activeContact.id);
                if (typeof group === 'object') {
                    var contactArray = APZ_GROUP_MEMBER_SEARCH_ARRAY;
                    contactArray = contactArray.filter(function(item, pos) {
                        return contactArray.indexOf(item) === pos;
                    });
                    var searchArray = [];
                    var searchInitArray = [];
                    contactArray.sort();
                    var groupMemberArray = group.members;
                    angular.forEach(contactArray, function(userId, i) {
                        if (userId) {
                            var contact = apzContactUtils.fetchContact('' + userId);
                            if (groupMemberArray.indexOf(contact.id) === -1 || (groupMemberArray.indexOf(contact.id) !== -1 && group.removedMembersId.indexOf(contact.id) !== -1)) {
                                searchArray.push(_this.getGroupSearchMember(contact));
                                searchInitArray.push(contact);
                            }

                        }
                    });
                    if (searchArray.length > 0) {
                        $scope.giProps.emptySearchMemberStatus = 'n-vis';
                        $scope.groupSearchMembers = searchArray;
                    } else {
                        $scope.groupSearchMembers = [];
                        $scope.giProps.emptySearchMemberStatus = 'vis';
                    }
                    apzContactLayout.initAutoSuggest({
                        'contactsArray': searchInitArray,
                        '$searchId': $apz_gm_search,
                        'isContactSearch': false
                    });
                }
            }

        };
        $scope.addGroupMemberFromSearch = function(userId) {
            if ($scope.activeContact.id && typeof userId !== 'undefined') {
                var group = apzGroupUtils.getGroup($scope.activeContact.id);
                if (typeof group === 'object' && appOptions.USER_ID === group.adminName) {
                    var stateCreated = apzService.addGroupMember('groupId=' + group.id + '&userId=' + encodeURIComponent(userId));
                    stateCreated.then(function(response) {
                        var data = response.data;
                        if (data.status === 'success') {
                            apzGroupLayout.onAddedGroupMember(group.id, userId);
                            $apz_gm_search_box.mckModal('hide');
                            $apz_gm_search.val('');
                        } else {
                            alert('Unable to process your request. ' + data.errorResponse[0].description);
                        }

                    }, function() {
                        alert('Unable to process your request.');
                    });
                } else {
                    $scope.giProps.adminOptnsStatus = 'vis';
                }
            }
        };
        $scope.exitGroup = function(e) {
            if (!$scope.activeContact.isGroup) {
                $scope.tabProps.groupMenusStatus = 'n-vis';
                return;
            }
            if (confirm('Are you sure want to exit this group?')) {
                var activeContact = $scope.activeContact;
                var reqData = 'groupId=' + activeContact.id;
                var stateCreated = apzService.exitGroup(reqData);
                stateCreated.then(function(response) {
                    var data = response.data;
                    if (data.status === 'success') {
                        apzGroupLayout.onExitGroup(activeContact);
                    }
                }, function() {});
            }
        };
        _this.loadGroups = function() {
            var stateCreated = apzService.getGroupList();
            stateCreated.then(function(response) {
                var data = response.data;
                if (data.status === 'success') {
                    var groups = data.response;
                    apzGroupUtils.loadGroups(groups);
                }
            }, function() {});
        };
        _this.onExitGroup = function(activeContact) {
            if ($scope.activeContact.htmlId == activeContact.htmlId) {
                if ($apz_group_info_tab.hasClass('vis')) {
                    $scope.closePanelRight();
                }
                $scope.tabProps.groupMenusStatus = 'n-vis';
                _this.disableGroupTab();
            }
        };
        $scope.closePanelRight = function(e) {
            angular.element('body').removeClass('apz-panel-3');
            angular.element('.emoji-menu').removeClass('apz-panel-3');
            $apz_panel_right.removeClass('vis').addClass('n-vis');
            $apz_app_box.removeClass('apz-panel-3');
        }
        $scope.removeGroupMember = function(params) {
            var group = apzGroupUtils.getGroup(params.groupId);
            if (typeof group === 'object' && appOptions.USER_ID === group.adminName) {
                if (confirm('Are you sure want to remove this member?')) {
                    var reqData = 'groupId=' + group.id;
                    reqData += '&userId=' + encodeURIComponent(params.userId);
                    var stateCreated = apzService.removeGroupMember(reqData);
                    stateCreated.then(function(response) {
                        var data = response.data;
                        if (data.status === 'success') {
                            apzGroupLayout.onRemovedGroupMember(group.id, params.userId);
                        }
                    }, function() {});
                }
            } else {
                $scope.giProps.adminOptnsStatus = 'n-vis';
            }
        };
        _this.onRemovedGroupMember = function(groupId, userId) {
            var group = apzGroupUtils.getGroup(groupId);
            if (typeof group === 'object') {
                group = apzGroupUtils.removeMemberFromGroup(group, userId);
                if ($apz_group_info_tab.hasClass('vis')) {
                    if ($scope.activeContact.htmlId === group.elementId) {
                        var contact = apzContactUtils.fetchContact(''
                            + userId);

                        angular.forEach($scope.activeGroupMembers, function(member, i) {
                            if (member.id === contact.id) {
                                $scope.activeGroupMembers.splice(i, 1);
                            }
                        });
                    }
                }
                if ($scope.activeContact.htmlId === group.elementId) {
                    _this.addGroupStatus(group);
                }
            } else {
                apzGroupUtils.getGroupFeed({
                    'groupId': groupId
                });
            }
        };
        _this.onAddedGroupMember = function(groupId, userId) {
            var group = apzGroupUtils.getGroup(groupId);
            if (typeof group === 'object') {
                group = apzGroupUtils.addMemberToGroup(group, userId);
                if ($apz_group_info_tab.hasClass('vis')) {
                    if ($scope.activeContact.htmlId === group.elementId) {
                        var contact = apzContactUtils.fetchContact('' + userId);
                        var groupMemberElement = _this.getGroupMember(group, contact);
                        angular.forEach($scope.activeGroupMembers, function(member, i) {
                            if (member.id === contact.id) {
                                $scope.activeGroupMembers.splice(i, 1);
                            }
                        });
                        $scope.activeGroupMembers.push(groupMemberElement);
                    }
                }
                if ($scope.activeContact.htmlId === group.elementId) {
                    _this.addGroupStatus(group);
                }
            } else {
                apzGroupUtils.getGroupFeed({
                    'groupId': groupId
                });
            }
        };
        $scope.loadGroupInfo = function(e) {
            if (!$scope.activeContact.isGroup) {
                $scope.tabProps.groupMenusStatus = 'n-vis';
                return;
            }
            if ($scope.activeContact.id) {
                $apz_gi_title.attr('contenteditable', false);
                $scope.giProps.saveTitleStatus = 'n-vis';
                $scope.giProps.editTitleStatus = 'vis';
                $scope.giProps.saveIconStatus = 'n-vis';
                $scope.giProps.iconLoadingStatus = 'n-vis';
                $scope.giProps.iconUrl = '';
                $scope.giProps.hoverStatus = 'apz-hover-on';
                $scope.activeGroupMembers = [];
                var group = apzGroupUtils.getGroup($scope.activeContact.id);
                if (typeof group === 'object') {
                    $scope.giProps.icon = $sce.trustAsHtml(apzGroupUtils.getGroupImage(group.imageUrl))
                    $apz_gi_title.html(group.displayName).attr('title', group.displayName);
                    $scope.giProps.addMemberTitleStatus = (group.adminName === appOptions.USER_ID) ? 'vis' : 'n-vis'
                    var groupMemberArray = [];
                    var userIdArray = group.members;
                    userIdArray.sort();
                    angular.forEach(userIdArray, function(userId, i) {
                        if (userId && group.removedMembersId.indexOf(userId) === -1) {
                            var contact = apzContactUtils.fetchContact('' + userId)
                            groupMemberArray.push(_this.getGroupMember(group, contact));
                        }
                    })
                    $scope.activeGroupMembers = groupMemberArray;
                } else {
                    apzGroupUtils.getGroupFeed({
                        'groupId': groupId
                    });
                }
                angular.element('body').addClass('apz-panel-3');
                angular.element('.emoji-menu').addClass('apz-panel-3');
                $apz_app_box.addClass('apz-panel-3');
                $apz_group_info_tab.removeClass('n-vis').addClass('vis');
            }
        };
        _this.getGroupSearchMember = function(contact) {
            var displayName = apzContactUtils.getTabDisplayName(contact.id, false);
            var imgsrctag = apzContactUtils.getContactImageLink(contact, displayName);
            var lastSeenStatus = '';
            if (!APZ_BLOCKED_TO_MAP[contact.id]) {
                if (APZ_OL_MAP[contact.id]) {
                    lastSeenStatus = 'Online';
                } else if (APZ_LAST_SEEN_AT_MAP[contact.id]) {
                    lastSeenStatus = apzDateUtils
                        .getLastSeenAtStatus(APZ_LAST_SEEN_AT_MAP[contact.id]);
                }
            }
            return {
                idExpr: contact.elementId,
                id: contact.id,
                imgExpr: $sce.trustAsHtml(imgsrctag),
                lastSeenExpr: lastSeenStatus,
                displayName: displayName,
                firstAlphaExpr: displayName.charAt(0).toUpperCase()
            };
        };
        _this.getGroupMember = function(group, contact) {
            var isAdminExpr = 'n-vis';
            var adminMenuExpr = (group.adminName === appOptions.USER_ID) ? 'vis' : 'n-vis';
            var displayName = apzContactUtils.getTabDisplayName(
                contact.id, false);
            if (contact.id === appOptions.USER_ID) {
                displayName = 'You';
                adminMenuExpr = 'n-vis';
            }
            var imgsrctag = apzContactUtils.getContactImageLink(contact,
                displayName);
            var lastSeenStatus = '';
            if (!APZ_BLOCKED_TO_MAP[contact.id]) {
                if (APZ_OL_MAP[contact.id]) {
                    lastSeenStatus = 'Online';
                } else if (APZ_LAST_SEEN_AT_MAP[contact.id]) {
                    lastSeenStatus = apzDateUtils
                        .getLastSeenAtStatus(APZ_LAST_SEEN_AT_MAP[contact.id]);
                }
            }
            if (contact.id === group.adminName) {
                isAdminExpr = 'vis';
            }
            return {
                idExpr: contact.elementId,
                id: contact.id,
                imgExpr: $sce.trustAsHtml(imgsrctag),
                lastSeenExpr: lastSeenStatus,
                displayName: displayName,
                firstAlphaExpr: displayName.charAt(0).toUpperCase(),
                isAdminExpr: isAdminExpr,
                adminMenuExpr: adminMenuExpr
            };
        };
        _this.getGroupFeedFromMessage = function(params) {
            var message = params.message;
            if (message) {
                var data = 'groupId=' + message.groupId;
                if (message.conversationId) {
                    var conversationPxy = $scope.APZ_CONVERSATION_MAP[message.conversationId];
                    if ((typeof conversationPxy !== 'object')
                        || (typeof $scope.APZ_TOPIC_DETAIL_MAP[conversationPxy.topicId] !== 'object')) {
                        data += '&conversationId=' + message.conversationId;
                    }
                }
                var stateCreated = apzService.getGroupFeed(data);
                stateCreated.then(function(response) {
                    var data = response.data;
                    if (data.status === 'success') {
                        var groupFeed = data.response;
                        if (groupFeed + '' !== 'null' && typeof groupFeed === 'object') {
                            var conversationPxy = groupFeed.conversationPxy;
                            var group = apzGroupUtils.addGroup(groupFeed);
                            var tabConvArray = new Array();
                            if (typeof conversationPxy === 'object') {
                                apzContactUtils.updateConversationMaps(conversationPxy);
                                tabConvArray.push(conversationPxy);
                                APZ_TAB_CONVERSATION_MAP[group.elementId] = tabConvArray;
                            }
                            apzMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                        }
                    }
                }, function() {});
            }
        };
        _this.disableGroupTab = function() {
            $scope.tabProps.errorText = 'You are no longer part of this group.';
            $scope.tabProps.errorStatus = 'vis';
            $scope.tabProps.msgFormStatus = 'n-vis';
            $scope.tabProps.subtitleStatus = 'n-vis';
            $scope.tabProps.typingStatus = 'n-vis';
            $scope.tabProps.titlewsStatus = '';
            $scope.tabProps.titlewtStatus = '';
        };
        _this.onGroupLeft = function(group) {
            if ($scope.activeContact.htmlId === group.elementId) {
                if ($apz_group_info_tab.hasClass('vis')) {
                    $scope.closePanelRight();
                }
                $scope.tabProps.groupMenusStatus = 'n-vis';
                _this.disableGroupTab();
            }
        };
        _this.addGroupStatus = function(group) {
            var isGroupLeft = apzGroupUtils.isGroupLeft(group);
            if (isGroupLeft) {
                _this.onGroupLeft(group);
                $scope.tabProps.titlewsStatus = '';
                $scope.tabProps.subtitleStatus = 'n-vis';
            } else if (group.members.length > 0) {
                var groupMembers = '';
                angular.forEach(group.members, function(member, i) {
                    if (appOptions.USER_ID !== '' + member && (group.removedMembersId.indexOf(member) === -1)) {
                        var contact = apzContactUtils.fetchContact('' + member);
                        var name = apzContactUtils.getTabDisplayName(contact.id, false);
                        groupMembers += ' ' + name + ',';
                    }
                });
                if (group.type !== 5) {
                    groupMembers += ' You';
                }
                groupMembers = groupMembers.replace(/,\s*$/, '');
                $scope.tabProps.subtitleText = groupMembers;
                $scope.tabProps.subtitleStatus = 'vis';
                $scope.tabProps.titlewsStatus = 'apz-title-ws';
                $scope.tabProps.groupMenusStatus = 'vis';
            } else {
                $scope.tabProps.titlewsStatus = '';
                $scope.tabProps.subtitleStatus = 'n-vis'
            }
        };
        _this.getGroupFeed = function(params) {
            var data = '';
            var isInternal = true;
            if (typeof params.callback === 'function') {
                isInternal = false;
                var response = new Object();
            }
            if (params.groupId) {
                data += 'groupId=' + params.groupId;
            } else if (params.clientGroupId) {
                data += 'clientGroupId=' + params.clientGroupId;
            } else {
                if (!isInternal) {
                    response.status = 'error';
                    response.errorMessage = 'groupId or client groupId required';
                    params.callback(response);
                }
                return;
            }
            if (params.conversationId) {
                data += '&conversationId=' + params.conversationId;
            }
            var stateCreated = apzService.getGroupFeed(data);
            stateCreated.then(function(response) {
                var data = response.data;
                if (data.status === 'success') {
                    var groupFeed = data.response;
                    if (groupFeed + '' === 'null' || typeof groupFeed !== 'object') {
                        if (!isInternal) {
                            response.status = 'error';
                            response.errorMessage = 'groupId not found';
                            params.callback(response);
                        }
                        return;
                    }
                    var conversationPxy = groupFeed.conversationPxy;
                    var group = mckGroupLayout.addGroup(groupFeed);
                    if (typeof conversationPxy === 'object') {
                        apzContactUtils.updateConversationMaps(conversationPxy);
                        var tabConvArray = [ conversationPxy ];
                        APZ_TAB_CONVERSATION_MAP[group.elementId] = tabConvArray;
                    }
                    if (params.isReloadTab) {
                        apzGroupLayout.reloadGroupTab(group);
                    }
                    if (!isInternal) {
                        response.status = 'success';
                        response.data = group;
                        params.callback(response);
                    }
                } else if (data.status === 'error') {
                    if (!isInternal) {
                        response.status = 'error';
                        response.errorMessage = data.errorResponse[0].description;
                        params.callback(response);
                    }
                }
            }, function() {
                console.log('Unable to load group. Please reload page.');
                if (!isInternal) {
                    response.status = 'error';
                    response.errorMessage = 'Unable to load group. Please reload page.';
                    params.callback(response);
                }
            });
        };

    }
    function ApzMapLayout() {
        var _this = this;
        var GEOCODER = '';
        var CURR_LOC_ADDRESS = '';
        var APZ_CURR_LATITIUDE = 40.7324319;
        var APZ_CURR_LONGITUDE = -73.82480777777776;
        var $apz_msg_inner = angular.element("#apz-message-inner");
        var $apz_my_loc = angular.element("#apz-my-loc");
        var $apz_loc_box = angular.element("#apz-loc-box");
        var $apz_loc_lat = angular.element("#apz-loc-lat");
        var $apz_loc_lon = angular.element("#apz-loc-lon");
        var $apz_map_content = angular.element("#apz-map-content");
        var $apz_loc_address = angular.element("#apz-loc-address");
        var $apz_msg_sbmt = angular.element("#apz-msg-sbmt");
        _this.init = function() {
            if (appOptions.IS_LOCSHARE_ENABLED && google && typeof (google.maps) === 'object') {
                GEOCODER = new google.maps.Geocoder;
                _this.getCurrentLocation(_this.onGetCurrLocation, _this.onErrorCurrLocation);
            }
        };
        $scope.openLocBox = function() {
            $apz_loc_box.mckModal();
        };
        $scope.getMyLoc = function() {
            apzMapLayout.getCurrentLocation(_this.onGetMyCurrLocation, _this.onErrorMyCurrLocation);
        };
        $scope.submitLocation = function() {
            var messagePxy = {
                'type': 5,
                'contentType': 2,
                'message': JSON.stringify(apzMapLayout.getSelectedLocation())
            };
            //  var tabId = $apz_msg_inner.data('apz-id');
            //  var conversationId = $apz_msg_inner.data('apz-conversationid');
            var topicId = $apz_msg_inner.data('apz-topicid');
            if ($scope.activeContact.conversationId) {
                messagePxy.conversationId = $scope.activeContact.conversationId;
            } else if (topicId) {
                var conversationPxy = {
                    'topicId': topicId
                };
                var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[topicId];
                if (typeof topicDetail === 'object') {
                    conversationPxy.topicDetail = JSON.stringify(topicDetail);
                }
                messagePxy.conversationPxy = conversationPxy;
            }
            if ($scope.activeContact.isGroup) {
                messagePxy.groupId = $scope.activeContact.id;
            } else {
                messagePxy.to = $scope.activeContact.id;
            }
            $apz_msg_sbmt.attr('disabled', true);
            $scope.tabProps.errorText = '';
            $scope.tabProps.errorStatus = 'n-vis';
            apzMessageLayout.sendMessage(messagePxy);
            $apz_loc_box.mckModal('hide');
        };
        _this.getCurrentLocation = function(succFunc, errFunc) {
            navigator.geolocation.getCurrentPosition(succFunc, errFunc);
        };
        _this.getSelectedLocation = function() {
            return {
                lat: APZ_CURR_LATITIUDE,
                lon: APZ_CURR_LONGITUDE
            };
        };
        _this.onGetCurrLocation = function(loc) {
            APZ_CURR_LATITIUDE = loc.coords.latitude;
            APZ_CURR_LONGITUDE = loc.coords.longitude;
            _this.initMapBox();
        };
        _this.onErrorCurrLocation = function() {
            APZ_CURR_LATITIUDE = 46.15242437752303;
            APZ_CURR_LONGITUDE = 2.7470703125;
            _this.initMapBox();
        };
        _this.onErrorMyCurrLocation = function(err) {
            alert('Unable to retrieve your location. ERROR(' + err.code + '): ' + err.message);
        };
        _this.onGetMyCurrLocation = function(loc) {
            APZ_CURR_LATITIUDE = loc.coords.latitude;
            APZ_CURR_LONGITUDE = loc.coords.longitude;
            $apz_loc_lat.val(APZ_CURR_LATITIUDE);
            $apz_loc_lon.val(APZ_CURR_LONGITUDE);
            $apz_loc_lat.trigger('change');
            $apz_loc_lon.trigger('change');
            if (CURR_LOC_ADDRESS) {
                $apz_loc_address.val(CURR_LOC_ADDRESS);
            } else if (GEOCODER) {
                var latlng = {
                    lat: APZ_CURR_LATITIUDE,
                    lng: APZ_CURR_LONGITUDE
                };
                GEOCODER.geocode({
                    'location': latlng
                }, function(results, status) {
                    if (status === 'OK') {
                        if (results[1]) {
                            CURR_LOC_ADDRESS = results[1].formatted_address;
                        }
                    }
                });
            }
        };
        _this.initMapBox = function() {
            $apz_map_content.locationpicker({
                location: {
                    latitude: APZ_CURR_LATITIUDE,
                    longitude: APZ_CURR_LONGITUDE
                },
                radius: 0,
                scrollwheel: true,
                inputBinding: {
                    latitudeInput: $apz_loc_lat,
                    longitudeInput: $apz_loc_lon,
                    locationNameInput: $apz_loc_address
                },
                enableAutocomplete: true,
                enableReverseGeocode: true,
                onchanged: function(currentLocation) {
                    APZ_CURR_LATITIUDE = currentLocation.latitude;
                    APZ_CURR_LONGITUDE = currentLocation.longitude;
                }
            });
            $apz_loc_box.on('shown.bs.apz-app-box', function() {
                $apz_map_content.locationpicker('autosize');
            });
        };
    }
    function ApzUserUtils() {
        var _this = this;
        _this.updateUserStatus = function(params) {
            if (typeof APZ_USER_DETAIL_MAP[params.userId] === 'object') {
                var userDetail = APZ_USER_DETAIL_MAP[params.userId];
                if (params.status === 0) {
                    userDetail.connected = false;
                    APZ_OL_MAP[userDetail.userId] = false;
                    userDetail.lastSeenAtTime = params.lastSeenAtTime;
                } else if (params.status === 1) {
                    userDetail.connected = true;
                    APZ_OL_MAP[userDetail.userId] = true;
                }
            } else {
                var userIdArray = [ params.userId ];
                apzUserUtils.getUsersDetail({
                    'userIdArray': userIdArray
                });
            }
        };
        _this.updateUserConnectedStatus = function() {
            angular.element('.apz-user-ol-status').each(function() {
                var $this = angular.element(this);
                var tabId = $this.data('apz-id');
                if (tabId) {
                    var userDetail = APZ_USER_DETAIL_MAP[tabId];
                    if (typeof userDetail === 'object' && userDetail.connected) {
                        $this.removeClass('n-vis').addClass('vis');
                        $this.next().html('(Online)');
                    } else {
                        $this.removeClass('vis').addClass('n-vis');
                        $this.next().html('(Offline)');
                    }
                }
            });
        };
        _this.getUsersDetail = function(params) {
            var userIdArray = params.userIdArray
            if (typeof userIdArray === 'undefined' || userIdArray.length < 1) {
                return;
            }
            var data = '';
            var uniqueUserIdArray = userIdArray.filter(function(item, pos) {
                return userIdArray.indexOf(item) === pos;
            });
            angular.forEach(uniqueUserIdArray, function(userId, i) {
                if (typeof APZ_USER_DETAIL_MAP[userId] === 'undefined') {
                    data += 'userIds=' + encodeURIComponent(userId) + '&';
                }
            });
            var stateCreated = apzService.getUserDetail(data);
            stateCreated.then(function(response) {
                var data = response.data;
                angular.forEach(data, function(userDetail, i) {
                    APZ_USER_DETAIL_MAP[userDetail.userId] = userDetail;
                    APZ_OL_MAP[userDetail.userId] = (userDetail.connected);
                    var contact = apzContactUtils.getContact('' + userDetail.userId);
                    contact = (typeof contact === 'undefined') ? apzContactUtils.createContactWithDetail(userDetail) : apzContactUtils.updateContactDetail(contact, userDetail);
                });
                if (params) {
                    if (params.setStatus) {
                        apzUserUtils.updateUserConnectedStatus();
                    } else if (params.message) {
                        apzMessageLayout.populateMessage(params.messageType, params.message, params.notifyUser);
                    }
                }
            }, function() {})
        };
    }
    function ApzNotificationService() {
        var _this = this;
        var $apz_msg_preview,
            $apz_preview_icon,
            $apz_preview_name,
            $apz_msg_preview_link,
            $apz_preview_msg_content,
            $apz_preview_file_content;
        var $apz_msg_inner = angular.element("#apz-message-inner");
        _this.init = function() {
            $apz_msg_preview = angular.element("#apz-msg-preview");
            $apz_msg_preview_link = angular.element("#apz-msg-preview .applozic-launcher");
            $apz_preview_icon = angular.element("#apz-msg-preview .apz-preview-icon");
            $apz_preview_name = angular.element("#apz-msg-preview .apz-preview-cont-name");
            $apz_preview_msg_content = angular.element("#apz-msg-preview .apz-preview-msg-content");
            $apz_preview_file_content = angular.element("#apz-msg-preview .apz-preview-file-content");
        };
        var PERMISSION_DEFAULT = 'default',
            PERMISSION_GRANTED = 'granted',
            PERMISSION_DENIED = 'denied',
            PERMISSION = [ PERMISSION_GRANTED, PERMISSION_DEFAULT, PERMISSION_DENIED ],
            isSupported = (function() {
                var isSupported = false;
                try {
                    isSupported = !!( /* Safari, Chrome */ w.Notification || /* Chrome & ff-html5notifications plugin */ w.webkitNotifications || /* Firefox Mobile */ navigator.mozNotification || /* IE9+ */ (w.external && w.external.msIsSiteMode() !== undefined));
                } catch (e) {}
                return isSupported;
            }()),
            isFunction = function(value) {
                return (value && (value).constructor === Function);
            },
            isString = function(value) {
                return (value && (value).constructor === String);
            },
            isObject = function(value) {
                return (value && (value).constructor === Object);
            },
            ieVerification = Math.floor((Math.random() * 10) + 1),
            noop = function() {};
        _this.permissionLevel = function() {
            var permission;
            if (!isSupported) {
                return;
            }
            if (Notification && Notification.permissionLevel) {
                // Safari 6
                permission = Notification.permissionLevel();
            } else if (webkitNotifications && webkitNotifications.checkPermission) {
                // Chrome & Firefox with html5-notifications plugin installed
                permission = PERMISSION[webkitNotifications.checkPermission()];
            } else if (Notification && Notification.permission) {
                // Firefox 23+
                permission = Notification.permission;
            } else if (navigator.mozNotification) {
                // Firefox Mobile
                permission = PERMISSION_GRANTED;
            } else if (external && (external.msIsSiteMode() !== undefined)) { /* keep last */
                // IE9+
                permission = external.msIsSiteMode() ? PERMISSION_GRANTED : PERMISSION_DEFAULT;
            }
            return permission;
        };
        _this.requestPermission = function(callback) {
            var callbackFunction = isFunction(callback) ? callback : noop;
            if (webkitNotifications && webkitNotifications.checkPermission) {
                webkitNotifications.requestPermission(callbackFunction);
            } else if (Notification && Notification.requestPermission) {
                Notification.requestPermission(callbackFunction);
            }
        };
        _this.isChrome = function() {
            return /chrom(e|ium)/.test(navigator.userAgent.toLowerCase());
        };
        _this.getNotification = function(displayName, iconLink, msg) {
            var notification;
            if (Notification) { /* Safari 6, Chrome (23+) */
                notification = new Notification(displayName, {
                    icon: iconLink,
                    body: msg
                });
                notification.onclick = function() {
                    focus();
                    this.close();
                };
            } else if (webkitNotifications) { /* FF with html5Notifications plugin installed */
                notification = webkitNotifications.createNotification(iconLink, displayName, msg);
                notification.show();
                if (_this.isChrome()) {
                    notification.onclick = function() {
                        focus();
                        this.cancel();
                    };
                }
                notification.show();
                $timeout(function() {
                    notification.cancel();
                }, 30000);
            } else if (navigator.mozNotification) { /* Firefox Mobile */
                notification = navigator.mozNotification.createNotification(displayName, msg, iconLink);
                notification.show();
            } else if (external && external.msIsSiteMode()) { /* IE9+ */
                // Clear any previous notifications
                external.msSiteModeClearIconOverlay();
                external.msSiteModeSetIconOverlay(iconLink, displayName);
                external.msSiteModeActivate();
                notification = {
                    "ieVerification": ieVerification + 1
                };
            }
            return notification;
        };
        _this.sendDesktopNotification = function(displayName, iconLink, msg) {
            if (_this.permissionLevel() !== PERMISSION_GRANTED) {
                Notification.requestPermission();
            }
            if (_this.permissionLevel() === PERMISSION_GRANTED) {
                var notification = _this.getNotification(displayName, iconLink, msg);
                var notificationWrapper = _this.getWrapper(notification);
                if (notification && !notification.ieVerification && notification.addEventListener) {
                    notification.addEventListener('show', function() {
                        var notification = notificationWrapper;
                        $timeout(function() {
                            notification.close();
                        }, 30000);
                    });
                }
            }
        };
        _this.getWrapper = function(notification) {
            return {
                close: function() {
                    if (notification) {
                        if (notification.close) {
                            // http://code.google.com/p/ff-html5notifications/issues/detail?id=58
                            notification.close();
                        } else if (notification.cancel) {
                            notification.cancel();
                        } else if (external && external.msIsSiteMode()) {
                            if (notification.ieVerification === ieVerification) {
                                external.msSiteModeClearIconOverlay();
                            }
                        }
                    }
                }
            };
        };
        _this.unsubscribeToServiceWorker = function() {
            if (MCK_SW_SUBSCRIPTION) {
                navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                    APZ_SW_SUBSCRIPTION.unsubscribe().then(function(successful) {
                        APZ_SW_SUBSCRIPTION = null;
                        console.log('Unsubscribed to notification successfully');
                    })
                });
            }
        };
        _this.sendSubscriptionIdToServer = function() {
            if (APZ_SW_SUBSCRIPTION) {
                var subscriptionId = APZ_SW_SUBSCRIPTION.endpoint.split('/').slice(-1)[0];
                if (subscriptionId) {
                    var stateCreated = apzService.updateServiceWorkerId(subscriptionId);
                    stateCreated.then(function(response) {
                        console.log(response);
                    }, function(e) {
                        console.log('Unable to delete message.');
                    })
                }
            }
        };
        _this.subscribeToServiceWorker = function() {
            if (IS_SW_NOTIFICATION_ENABLED) {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('./service-worker.js', {
                        scope: './'
                    });
                    navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
                        serviceWorkerRegistration.pushManager.subscribe({
                            userVisibleOnly: true
                        }).then(function(pushSubscription) {
                            console.log('The reg ID is :: ', pushSubscription.endpoint.split("/").slice(-1));
                            APZ_SW_SUBSCRIPTION = pushSubscription;
                            _this.sendSubscriptionIdToServer();
                        })
                    });
                }
            }
        };
        _this.notifyUser = function(message) {
            if (message.type === 7) {
                return;
            }
            var contact = (message.groupId) ? apzGroupUtils.getGroup('' + message.groupId) : apzContactUtils.fetchContact('' + message.to.split(",")[0]);
            var displayName = apzContactUtils.getTabDisplayName(contact.id, contact.isGroup);
            _this.showNewMessageNotification(message, contact, displayName);
            if (appOptions.IS_DESKTOP_NOTIFICATION_ENABLED && !IS_TAB_FOCUSED) {
                var iconLink = appOptions.NOTIFICATION_ICON_LINK;
                var msg = apzMessageUtils.getTextForMessagePreview(message, contact);
                if (typeof (appOptions.GETUSERIMAGE) === 'function' && !contact.isGroup) {
                    var imgsrc = appOptions.GETUSERIMAGE(contact.contactId);
                    if (imgsrc && typeof imgsrc !== 'undefined') {
                        iconLink = imgsrc;
                    }
                }
                _this.sendDesktopNotification(displayName, iconLink, msg);
            }
        };
        _this.showNewMessageNotification = function(message, contact, displayName) {
            if (!appOptions.IS_NOTIFICATION_ENABLED) {
                return;
            }
            if ($scope.activeContact.htmlId === contact.elementId) {
                if (message.conversationId && (appOptions.IS_TOPIC_BOX_ENABLED)) {
                    var currConvId = $scope.activeContact.conversationId;
                    currConvId = (currConvId) ? currConvId.toString() : '';
                    if (currConvId === message.conversationId.toString()) {
                        return;
                    }
                } else {
                    return;
                }
            }
            $apz_msg_preview_link.data('apz-isgroup', contact.isGroup);
            var conversationId = (message.conversationId) ? message.conversationId : '';
            $apz_msg_preview_link.data('apz-conversationid', conversationId);
            var imgsrctag = apzContactUtils.getContactImageLink(contact, displayName);
            if (message.message) {
                var msg = apzMessageUtils.getMessageTextForContactPreview(message, contact, 50);
                $apz_preview_msg_content.html('');
                (typeof msg === 'object') ? $apz_preview_msg_content.append(msg) : $apz_preview_msg_content.html(msg);
                $apz_preview_msg_content.removeClass('n-vis').addClass('vis');
            } else {
                $apz_preview_msg_content.html('');
            }
            if (message.fileMetaKey) {
                $apz_preview_file_content.html(apzFileUtils.getFileIcon(message));
                $apz_preview_file_content.removeClass('n-vis').addClass('vis');
                if ($apz_preview_msg_content.html() === '') {
                    $apz_preview_msg_content.removeClass('vis').addClass('n-vis');
                }
            } else {
                $apz_preview_file_content.html('');
                $apz_preview_file_content.removeClass('vis').addClass('n-vis');
            }
            $apz_preview_name.html(displayName);
            $apz_preview_icon.html(imgsrctag);
            $apz_msg_preview_link.data('apz-id', contact.id);
            $apz_msg_preview.show();
            $timeout(function() {
                $apz_msg_preview.fadeOut(3000);
            }, 10000);
        };
    }
    function ApzChannelService() {
        var _this = this;
        var subscriber = null;
        var stompClient = null;
        var TYPING_TAB_ID = '';
        var typingSubscriber = null;
        var checkConnectedIntervalId;
        var sendConnectedStatusIntervalId;
        $stomp.setDebug(function(args) {
            // console.log(args);
        })
        addEventListener('beforeunload', function(e) {
            _this.disconnect();
        });
        _this.init = function() {
            var port = (!apzUtils.startsWith(appOptions.WEBSOCKET_URL, 'https')) ? '15674' : '15675';
            $stomp.connect(appOptions.WEBSOCKET_URL + ':' + port + '/stomp', {
                'login': 'guest',
                'passcode': 'guest'
            }).then(function(frame) {
                _this.onConnect(frame);
            }, function(e) {
                console.log('Error in channel notification. ' + e);
                events.onConnectFailed();
            })
        };
        _this.onConnect = function(frame) {
            if ($stomp.stomp.connected) {
                if (subscriber) {
                    _this.unsubscibeToNotification();
                }
                subscriber = $stomp.subscribe('/topic/' + appOptions.TOKEN, _this.onMessage);
                _this.sendStatus(1);
                _this.checkConnected();
            } else {
                $timeout(function() {
                    if ($stomp.stomp.connected) {
                        subscriber = $stomp.subscribe('/topic/' + appOptions.TOKEN, _this.onMessage);
                        _this.sendStatus(1);
                        _this.checkConnected();
                    }
                }, 5000);
            }
            events.onConnect();
        };
        _this.reconnect = function() {
            _this.unsubscibeToTypingChannel();
            _this.unsubscibeToNotification();
            _this.disconnect();
            _this.init();
        };
        _this.sendStatus = function(status) {
            if ($stomp.stomp.connected) {
                $stomp.send('/topic/status', appOptions.TOKEN + ',' + status, {
                    'content-type': 'text/plain'
                });
            }
        };
        _this.checkConnected = function(isUpdateMessageList) {
            if ($stomp.stomp.connected) {
                if (checkConnectedIntervalId) {
                    clearInterval(checkConnectedIntervalId);
                }
                if (sendConnectedStatusIntervalId) {
                    clearInterval(sendConnectedStatusIntervalId);
                }
                checkConnectedIntervalId = $interval(function() {
                    _this.connectToSocket();
                }, 600000);
                sendConnectedStatusIntervalId = $interval(function() {
                    _this.sendStatus(2);
                }, 1200000);
            } else {
                _this.connectToSocket(isUpdateMessageList);
            }
        };
        _this.connectToSocket = function(isUpdateMessageList) {
            if (!$stomp.stomp.connected) {
                if (isUpdateMessageList) {
                    var activeContact = $scope.activeContact;
                    if (activeContact && activeContact.id) {
                        $scope.loadMessageList({
                            'tabId': activeContact.id,
                            'isGroup': activeContact.isGroup,
                            'conversationId': activeContact.conversationId
                        });
                    }
                }
                _this.init();
            }
        };
        _this.stopConnectedCheck = function() {
            if (checkConnectedIntervalId) {
                clearInterval(checkConnectedIntervalId);
            }
            if (sendConnectedStatusIntervalId) {
                clearInterval(sendConnectedStatusIntervalId);
            }
            checkConnectedIntervalId = '';
            sendConnectedStatusIntervalId = '';
            _this.disconnect();
        };
        _this.disconnect = function() {
            if ($stomp.stomp.connected) {
                _this.sendStatus(0);
                $stomp.stomp.disconnect();
            }
        };
        _this.unsubscibeToTypingChannel = function() {
            if ($stomp.stomp.connected) {
                if (typingSubscriber) {
                    if (APZ_TYPING_STATUS === 1) {
                        _this.sendTypingStatus(0, TYPING_TAB_ID);
                    }
                    typingSubscriber.unsubscribe();
                }
            }
            typingSubscriber = null;
        };
        _this.unsubscibeToNotification = function() {
            if ($stomp.stomp.connected) {
                if (subscriber) {
                    subscriber.unsubscribe();
                }
            }
            subscriber = null;
        };
        _this.subscibeToTypingChannel = function(tabId, isGroup) {
            var subscribeId = (isGroup) ? tabId : appOptions.USER_ID;
            if ($stomp.stomp.connected) {
                typingSubscriber = $stomp.subscribe('/topic/typing-' + appOptions.APP_ID + '-' + subscribeId, _this.onTypingStatus);
            } else {
                _this.reconnect();
            }
        };
        _this.sendTypingStatus = function(status, tabId) {
            if ($stomp.stomp.connected) {
                if (status === 1 && APZ_TYPING_STATUS === 1) {
                    $stomp.send('/topic/typing-' + appOptions.APP_ID + '-' + TYPING_TAB_ID, appOptions.APP_ID + ',' + appOptions.USER_ID + ',' + status, {
                        'content-type': 'text/plain'
                    });
                }
                if (tabId) {
                    if (tabId === TYPING_TAB_ID && status === APZ_TYPING_STATUS && status === 1) {
                        return;
                    }
                    TYPING_TAB_ID = tabId;
                    $stomp.send('/topic/typing-' + appOptions.APP_ID + '-' + tabId, appOptions.APP_ID + ',' + appOptions.USER_ID + ',' + status, {
                        'content-type': 'text/plain'
                    });
                    $timeout(function() {
                        APZ_TYPING_STATUS = 0;
                    }, 60000);
                } else if (status === 0) {
                    $stomp.send('/topic/typing-' + appOptions.APP_ID + '-' + TYPING_TAB_ID, appOptions.APP_ID + ',' + appOptions.USER_ID + ',' + status, {
                        'content-type': 'text/plain'
                    });
                }
                APZ_TYPING_STATUS = status;
            }
        };
        _this.onTypingStatus = function(payload, headers, resp) {
            if (typingSubscriber != null && typingSubscriber.id === headers.subscription) {
                var message = resp.body;
                var publisher = message.split(',')[1];
                var status = Number(message.split(',')[2]);
                var tabId = resp.headers.destination.substring(headers.destination.lastIndexOf('-') + 1, headers.destination.length);
                if (!APZ_BLOCKED_TO_MAP[publisher] && !APZ_BLOCKED_BY_MAP[publisher]) {
                    if (status === 1) {
                        if ((appOptions.USER_ID !== publisher || !$scope.activeContact.isGroup) && ($scope.activeContact.id === publisher || $scope.activeContact.id === tabId)) {
                            if ($scope.activeContact.isGroup) {
                                if (publisher !== appOptions.USER_ID) {
                                    var displayName = apzContactUtils.getTabDisplayName(publisher, false);
                                    displayName = displayName.split(' ')[0];
                                    $scope.tabProps.typingText = displayName + ' is ';
                                }
                            } else {
                                $scope.tabProps.typingText = '';
                            }
                            $scope.tabProps.titlewtStatus = 'apz-title-wt';
                            $scope.tabProps.subtitleStatus = 'n-vis';
                            $scope.tabProps.typingStatus = 'vis';
                            $timeout(function() {
                                $scope.tabProps.titlewtStatus = '';
                                $scope.tabProps.typingStatus = 'n-vis';
                                if ($scope.tabProps.titlewsStatus === 'apz-title-ws') {
                                    $scope.tabProps.subtitleStatus = 'vis';
                                }
                                $scope.tabProps.typingText = '';
                            }, 60000);
                        }
                    } else {
                        $scope.tabProps.titlewtStatus = '';
                        $scope.tabProps.typingStatus = 'n-vis';
                        if ($scope.tabProps.titlewsStatus === 'apz-title-ws') {
                            $scope.tabProps.subtitleStatus = 'vis';
                        }
                        $scope.tabProps.typingText = '';
                    }
                }
            }
        };
        _this.onMessage = function(payload, headers, res) {
            if (subscriber != null && subscriber.id === headers.subscription) {
                try {
                    var resp = JSON.parse(payload);
                } catch (ex) {
                    return;
                }
                var messageType = resp.type;
                if (messageType === 'APPLOZIC_04' || messageType === 'MESSAGE_DELIVERED') {
                    angular.element('.' + resp.message.split(',')[0] + ' .apz-message-status').removeClass('apz-icon-time').removeClass('apz-icon-sent').addClass('apz-icon-delivered');
                    var userId = resp.message.split(',')[1];
                    var contact;
                    if (typeof userId === 'undefined') {
                        var message = APZ_MESSAGE_KEY_MAP[resp.message.split(',')[0]];
                        if (typeof message === 'object') {
                            contact = (message.groupId) ? apzGroupUtils.getGroup(message.groupId) : apzContactUtils.getContact(message.to);
                            apzMessageLayout.updateMessageStatus(contact, resp.message.split(',')[0], 'apz-icon-delivered');
                        }
                    } else {
                        contact = apzContactUtils.fetchContact(userId);
                    }
                    apzMessageLayout.updateMessageStatus(contact, resp.message.split(',')[0], 'apz-icon-delivered');
                    events.onMessageDelivered({
                        'messageKey': resp.message.split(',')[0]
                    });
                } else if (messageType === 'APPLOZIC_08' || messageType === 'MT_MESSAGE_DELIVERED_READ') {
                    angular.element('.' + resp.message.split(',')[0] + ' .apz-message-status').removeClass('apz-icon-time').removeClass('apz-icon-sent').removeClass('apz-icon-delivered').addClass('apz-icon-read');
                    var userId = resp.message.split(',')[1];
                    var contact;
                    if (typeof userId === 'undefined') {
                        var message = APZ_MESSAGE_KEY_MAP[resp.message.split(',')[0]];
                        if (typeof message === 'object') {
                            contact = (message.groupId) ? apzGroupUtils.getGroup(message.groupId) : apzContactUtils.getContact(message.to);

                        }
                    } else {
                        contact = apzContactUtils.fetchContact(userId);
                    }
                    apzMessageLayout.updateMessageStatus(contact, resp.message.split(',')[0], 'apz-icon-read');
                    events.onMessageRead({
                        'messageKey': resp.message.split(',')[0]
                    });
                } else if (messageType === 'APPLOZIC_05') {
                    var key = resp.message.split(',')[0];
                    var userId = resp.message.split(',')[1];
                    var contact = apzContactUtils.fetchContact(userId);
                    if (typeof contact === 'object') {
                        apzMessageLayout.removeDeletedMessage(contact, key);
                    }
                    events.onMessageDeleted({
                        'messageKey': resp.message.split(',')[0],
                        'userKey': resp.message.split(',')[1]
                    });
                } else if (messageType === 'APPLOZIC_06') {
                    var userId = resp.message;
                    if (userId) {
                        var contact = apzContactUtils.fetchContact(userId);
                        apzMessageLayout.removeConversationThread(contact);
                        events.onConversationDeleted({
                            'userKey': userId
                        });
                    }
                } else if (messageType === 'APPLOZIC_11') {
                    var userId = resp.message;
                    var contact = apzContactUtils.fetchContact(userId);
                    var tabId = $scope.activeContact.id;
                    if (!APZ_BLOCKED_TO_MAP[userId] && !APZ_BLOCKED_BY_MAP[userId] && appOptions.IS_OL_STATUS_ENABLED) {
                        if (contact.elementId === $scope.activeContact.htmlId) {
                            $scope.tabProps.subtitleText = 'Online';
                        }
                        // angular.element("#li-" + contact.elementId + " .apz-ol-status").removeClass('n-vis').addClass('vis');
                        angular.element('.apz-user-ol-status.' + contact.htmlId).removeClass('n-vis').addClass('vis');
                        angular.element('.apz-user-ol-status.' + contact.htmlId).next().html('(Online)');
                        APZ_OL_MAP[userId] = true;
                        apzContactLayout.updateConvListOnStatusChange(contact, true);
                        apzUserUtils.updateUserStatus({
                            'userId': resp.message,
                            'status': 1
                        });
                    }
                    events.onUserConnect({
                        'userId': resp.message
                    });
                } else if (messageType === 'APPLOZIC_12') {
                    var userId = resp.message.split(',')[0];
                    var lastSeenAtTime = resp.message.split(',')[1];
                    var contact = apzContactUtils.fetchContact(userId);
                    APZ_OL_MAP[userId] = false;
                    if (lastSeenAtTime) {
                        APZ_LAST_SEEN_AT_MAP[userId] = lastSeenAtTime;
                    }
                    if (!APZ_BLOCKED_TO_MAP[userId] && !APZ_BLOCKED_BY_MAP[userId]) {
                        angular.element('.apz-user-ol-status.' + contact.htmlId).removeClass('vis').addClass('n-vis');
                        angular.element('.apz-user-ol-status.' + contact.htmlId).next().html('(Offline)');
                        if (contact.elementId === $scope.activeContact.htmlId) {
                            $scope.tabProps.subtitleText = apzDateUtils.getLastSeenAtStatus(lastSeenAtTime);
                        }
                        apzContactLayout.updateConvListOnStatusChange(contact, false);
                        // angular.element("#li-" + contact.elementId + " .apz-ol-status").removeClass('vis').addClass('n-vis');
                        apzUserUtils.updateUserStatus({
                            'userId': resp.message.split(',')[0],
                            'status': 0,
                            'lastSeenAtTime': resp.message.split(",")[1]
                        });
                    }
                    events.onUserDisconnect({
                        'userId': userId,
                        'lastSeenAtTime': lastSeenAtTime
                    });
                } else if (messageType === 'APPLOZIC_09') {
                    var userId = resp.message;
                    var contact = apzContactUtils.fetchContact(userId);
                    apzMessageLayout.updateUnreadCount(contact.elementId, 0, true);
                    // angular.element("#li-" + contact.elementId + " .apz-unread-count-text").html(apzMessageLayout.getUnreadCount(contact.elementId));
                    // angular.element("#li-" + contact.elementId + " .apz-unread-count-box").removeClass("vis").addClass("n-vis");
                    apzContactLayout.updateConvListOnUnreadCountChange(contact);
                    events.onConversationReadFromOtherSource({
                        'userId': userId
                    });
                } else if (messageType === 'APPLOZIC_10') {
                    var userId = resp.message;
                    //     angular.element('.apz-msg-right .apz-message-status').removeClass('apz-icon-time').removeClass('apz-icon-sent').removeClass('apz-icon-delivered').addClass('apz-icon-read');
                    //     angular.element('.apz-msg-right .apz-icon-delivered').attr('title', 'delivered and read');
                    var contact = apzContactUtils.getContact(userId);
                    if (typeof contact === 'undefined') {
                        var params = {};
                        params.userIdArray = [ userId ];
                        apzUserUtils.getUsersDetail(params);
                    } else {
                        apzMessageLayout.updateMessageListStatus(contact);
                    }
                    events.onConversationRead({
                        'userId': userId
                    });
                } else if (messageType === 'APPLOZIC_16') {
                    var status = resp.message.split(':')[0];
                    var userId = resp.message.split(':')[1];
                    var contact = apzContactUtils.fetchContact(userId);;
                    if ($scope.activeContact.htmlId === contact.elementId) {
                        if (status === APZ_BLOCK_STATUS_MAP[0]) {
                            APZ_BLOCKED_TO_MAP[contact.id] = true;
                            apzContactLayout.toggleBlockUser(contact.id, true);
                        } else {
                            apzContactLayout.toggleBlockByOtherUser(contact.id, true);
                        }
                    }
                    apzContactLayout.updateConvListOnStatusChange(contact, false);
                    // angular.element("#li-" + contact.elementId + " .apz-ol-status").removeClass('vis').addClass('n-vis');
                    events.onUserBlocked({
                        'status': status,
                        'userId': userId
                    });
                } else if (messageType === 'APPLOZIC_17') {
                    var status = resp.message.split(':')[0];
                    var userId = resp.message.split(':')[1];
                    var contact = apzContactUtils.fetchContact(userId);
                    if ($scope.activeContact.htmlId === contact.elementId) {
                        if (status === APZ_BLOCK_STATUS_MAP[2]) {
                            APZ_BLOCKED_TO_MAP[contact.id] = false;
                            apzContactLayout.toggleBlockUser(contact.id, false);
                        } else if (APZ_OL_MAP[tabId] || APZ_LAST_SEEN_AT_MAP[tabId]) {
                            apzContactLayout.toggleBlockByOtherUser(contact.id, false);
                        }
                    }
                    if (APZ_OL_MAP[contact.id]) {
                        apzContactLayout.updateConvListOnStatusChange(contact, true);
                    // angular.element("#li-" + contact.elementId + " .apz-ol-status").removeClass('n-vis').addClass('vis');
                    }
                    events.onUserUnblocked({
                        'status': status,
                        'userId': userId
                    });
                } else if (messageType === 'APPLOZIC_18') {
                    appOptions.IS_USER_DEACTIVATED = false;
                    events.onUserActivated();
                } else if (messageType === 'APPLOZIC_19') {
                    appOptions.IS_USER_DEACTIVATED = true;
                    events.onUserDeactivated();
                } else {
                    var message = resp.message;
                    var contact = (message.groupId) ? apzGroupUtils.getGroup(message.groupId) : apzContactUtils.getContact(message.to);
                    // var userIdArray =
                    // mckMessageLayout.getUserIdFromMessage(message);
                    // mckMessageLayout.openConversation();
                    if (message.key) {
                        APZ_MESSAGE_KEY_MAP[message.key] = message;
                    }
                    if (messageType === 'APPLOZIC_03') {
                        if (message.type !== 0 && message.type !== 4) {
                            if (typeof contact === 'object') {
                                apzMessageLayout.updateMessageStatus(contact, message.key, 'apz-icon-sent');
                            }
                        // angular.element("." + message.key + " .apz-message-status").removeClass('apz-icon-time').addClass('apz-icon-sent');
                        // apzMessageUtils.addTooltip(message.key);
                        }
                        events.onMessageSentUpdate({
                            'messageKey': message.key
                        });
                    } else if (messageType === 'APPLOZIC_01' || messageType === 'APPLOZIC_02' || messageType === 'MESSAGE_RECEIVED') {
                        // var messageArray = [];
                        // messageArray.push(message);
                        // mckStorage.updateMckMessageArray(messageArray);

                        if (messageType === 'APPLOZIC_01' || messageType === 'MESSAGE_RECEIVED') {
                            var messageFeed = apzMessageUtils.getMessageFeed(message);
                            events.onMessageReceived({
                                'message': messageFeed
                            });
                        } else if (messageType === 'APPLOZIC_02') {
                            var messageFeed = apzMessageUtils.getMessageFeed(message);
                            events.onMessageSent({
                                'message': messageFeed
                            });
                        }
                        if (typeof contact === 'undefined') {
                            var params = {
                                'message': message,
                                'messageType': messageType,
                                'notifyUser': resp.notifyUser
                            };
                            if (message.groupId) {
                                apzGroupLayout.getGroupFeedFromMessage(params);
                            } else {
                                params.userIdArray = [ message.to ];
                                apzUserUtils.getUsersDetail(params);
                            }
                            return;
                        } else {
                            if (message.conversationId) {
                                var conversationPxy = $scope.APZ_CONVERSATION_MAP[message.conversationId];
                                if (appOptions.IS_TOPIC_BOX_ENABLED && ((typeof conversationPxy !== 'object') || (typeof ($scope.APZ_TOPIC_DETAIL_MAP[conversationPxy.topicId]) !== 'object'))) {
                                    apzContextualLayout.getConversationFeedById({
                                        'conversationId': message.conversationId,
                                        'messageType': messageType,
                                        'message': message,
                                        'notifyUser': resp.notifyUser
                                    });
                                    return;
                                }
                            }
                            apzMessageLayout.populateMessage(messageType, message, resp.notifyUser);
                        }
                    }
                }
            }
        };
    }
} ]);