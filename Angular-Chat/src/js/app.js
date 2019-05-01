var applozic = angular.module('applozic', [ 'ngRoute', 'ngStomp' ]);
applozic.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: '../templates/applozic.html',
        controller: 'apzController'
    }).otherwise({
        redirectTo: '/'
    });
}).directive('contextualbox', function($compile) {
    return {
        restrict: 'E',
        template: '<li id="li-ctx-{{context.id}}" class="apz-ctx-li {{context.id}}">' +
            '<a href="javascript:void(0);" ng-click="loadContextualTab($event,$index)"  data-apz-id="{{context.tabId}}" data-apz-isgroup="{{context.isGroup}}" data-apz-conversationid="{{context.id}}" data-apz-topicid="{{topicId}}">' +
            '<div class="apz-row apz-truncate" title="{{context.title}}">{{context.title}}</div></a></li>',
        link: function($scope, element, attrs) {
            $scope.loadContextualTab = function(e) {
                var $this = angular.element(e.currentTarget);
                e.preventDefault();
                var conversationId = $this.data('apz-conversationid');
                var activeContact = $scope.activeContact;
                if (activeContact) {
                    if (conversationId) {
                        if (conversationId === activeContact.conversationId) {
                            return;
                        }
                        activeContact.conversationId = conversationId;
                    }
                    $scope.activeContact = activeContact;
                    if (conversationId) {
                        var conversationPxy = $scope.APZ_CONVERSATION_MAP[activeContact.conversationId];
                        if (typeof conversationPxy === 'object') {
                            var topicDetail = $scope.APZ_TOPIC_DETAIL_MAP[conversationPxy.topicId];
                            if (typeof topicDetail === 'object') {
                                $scope.setProductProperties(topicDetail, false);
                            }
                        }
                    }
                    $scope.loadMessageList({
                        'tabId': activeContact.id,
                        'isGroup': activeContact.isGroup,
                        'userName': activeContact.displayName,
                        'conversationId': activeContact.conversationId
                    });
                }

            };

        }
    }
}).directive('searchmember', function($compile) {
    return {
        restrict: 'E',
        template: '<li id="li-sc-{{contact.idExpr}}" class="apz-gs-li {{contact.id}}">' +
            '<a href="javascript:void(0);" ng-click="loadSearchTab($event)"  data-apz-id="{{contact.id}}" data-apz-isgroup="{{contact.isGroup}}">' +
            '<div class="apz-row" title="{{contact.displayName}}">' +
            '<div class="blk-lg-3" ng-bind-html="contact.imgExpr"></div>' +
            '<div class="blk-lg-9"><div class="apz-row"><div class="blk-lg-12 apz-contact-title apz-truncate"><strong>{{contact.displayName}}</strong></div></div>' +
            '<div class="apz-row"><div class="blk-lg-12 apz-truncate apz-text-muted apz-last-seen-status" title="{{contact.lastSeenExpr}}">{{contact.lastSeenExpr}}</div>' +
            '</div></div></div></a></li>',
        link: function($scope, element, attrs) {
            var $apz_search_box = angular.element('#apz-search-box');
            var $apz_contact_search_input = angular.element('#apz-contact-search-input');
            var $apz_group_search_input = angular.element('#apz-group-search-input');
            $scope.loadSearchTab = function(e) {
                var $this = angular.element(e.currentTarget);
                var tabId = $this.data('apz-id');
                var isGroup = $this.data('apz-isgroup');
                if (tabId !== '') {
                    $scope.loadTab({
                        'tabId': tabId,
                        'isGroup': isGroup,
                        'isSearch': true
                    });
                }
                $apz_search_box.mckModal('hide');
                $apz_group_search_input.val('');
                $apz_contact_search_input.val('');
            };
            $scope.searchGroupKeyPress = function(e) {
                if (e.which === 13) {
                    return true;
                }
            };
            $scope.searchGroupLinkClick = function(e) {
                e.preventDefault();
                return true;
            };
        }
    }
}).directive('groupsearchmember', function($compile) {
    return {
        restrict: 'E',
        template: '<li id="li-gms-{{member.idExpr}}" class="apz-gs-li {{member.id}}">' +
            '<a href="javascript:void(0);" ng-click="addMemberToGroup($event,$index)"  data-apz-id="{{member.id}}">' +
            '<div class="apz-row" title="{{member.displayName}}">' +
            '<div class="blk-lg-3" ng-bind-html="member.imgExpr"></div>' +
            '<div class="blk-lg-9"><div class="apz-row"><div class="blk-lg-12 apz-contact-title apz-truncate"><strong>{{member.displayName}}</strong></div></div>' +
            '<div class="apz-row"><div class="blk-lg-12 apz-truncate apz-text-muted apz-last-seen-status" title="{{member.lastSeenExpr}}">{{member.lastSeenExpr}}</div>' +
            '</div></div></div></a></li>',
        link: function($scope, element, attrs) {
            $scope.addMemberToGroup = function(e) {
                var $this = angular.element(e.currentTarget);
                e.preventDefault();
                var userId = $this.data('apz-id');
                $scope.addGroupMemberFromSearch(userId);
            };

        }
    }
}).directive('groupmember', function($compile) {
    return {
        restrict: 'E',
        template: '<li id="li-gm-{{member.id}}" class="apz-gm-li {{member.id}}" data-apz-id={{member.id}}>' +
            '<div class="apz-row apz-gm-info" ng-mouseover="groupAdminMenuMouseOver($event)" ng-mouseleave="groupAdminMenuMouseLeave($event)" title="{{member.nameExpr}}">' +
            '<div class="blk-lg-3" ng-bind-html="member.imgExpr"></div>' +
            '<div class="blk-lg-9"><div class="apz-row"><div class="blk-lg-8 apz-contact-title apz-truncate"><strong>{{member.displayName}}</strong></div>' +
            '<div class="blk-lg-4 apz-group-admin-tag {{member.isAdminExpr}}"><span class="apz-contact-right-text">Admin</span></div></div>' +
            '<div class="apz-row"><div class="blk-lg-8 apz-truncate apz-text-muted apz-last-seen-status" title="{{member.lastSeenExpr}}">{{member.lastSeenExpr}}</div>' +
            '<div class="blk-lg-4 {{giProps.adminOptnsStatus}} {{member.adminMenuExpr}}">' +
            '<div class="apz-menu-box n-vis">' +
            '<div class="mck-dropdown-toggle apz-group-admin-menu-toggle apz-text-center" data-toggle="mckdropdown" aria-expanded="false"><span class="apz-caret"></span></div>' +
            '<ul id="apz-group-admin-menu-list" class="apz-dropdown-menu apz-group-admin-menu-list apz-menu-right" role="menu">' +
            '<li data-apz-id={{member.id}}><a href="javascript:void(0);" ng-click="removeMember($event);" class="apz-btn-remove-member menu-item" title="Remove member">Remove member</a></li>' +
            '</ul></div></div></div></div></div></li>',
        link: function($scope, element, attrs) {
            var $apz_msg_inner = angular.element('#apz-message-inner');
            $scope.groupAdminMenuMouseOver = function(e) {
                var $this = angular.element(e.currentTarget);
                $this.find('.apz-menu-box').removeClass('n-vis');
            };
            $scope.groupAdminMenuMouseLeave = function(e) {
                var $this = angular.element(e.currentTarget);
                $this.find('.apz-menu-box').removeClass('open').addClass('n-vis');
            };
            $scope.removeMember = function(e) {
                var $this = angular.element(e.currentTarget);
                e.preventDefault();
                var userId = $this.parent('li').data('apz-id');
                var groupId = $scope.activeContact.id;
                if (typeof groupId !== 'undefined' && typeof userId !== 'undefined') {
                    $scope.removeGroupMember({
                        'groupId': groupId,
                        'userId': userId
                    });
                }
            };

        }
    }
}).directive('filebox', function($compile) {
    return {
        restrict: 'E',
        template: '<div id="apz-filebox-{{file.id}}" class="apz-file-box {{file.id}}">' +
            '<div class="apz-file-content blk-lg-7"><span class="apz-file-lb" ng-bind-html="file.nameExpr"></span>&nbsp;<span class="apz-file-sz">{{file.sizeExpr}}</span></div>' +
            '<div class="apz-progress-bar blk-lg-3" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="apz-bar-icon" style="width: 0%;"></span></div>' +
            '<div class="blk-lg-2 apz-move-right"><button type="button" class="apz-box-close apz-remove-file" ng-click="removeFile($event,$index)">&times;</button></div></div>',
        link: function($scope, element, attrs) {
            var $apz_msg_sbmt = angular.element('#apz-msg-sbmt');
            var $apz_file_container = angular.element('#apz-file-container');
            $scope.removeFile = function(e, index) {
                var $this = angular.element(e.currentTarget);
                var currFile = $scope.files[index];
                $scope.files.splice(index, 1);
                $apz_msg_sbmt.attr('disabled', false);
                if ($apz_file_container.find('.apz-file-box').length === 0) {
                    $apz_file_container.removeClass('vis').addClass('n-vis');
                }
                if (typeof currFile.fileMeta === 'object') {
                    $scope.deleteFileMeta(currFile.fileMeta.blobKey);
                }
            };

        }
    }
}).directive('addcontact', function($compile) {
    return {
        restrict: 'E',
        template: '<li id="li-{{contact.htmlId}}" class="apz-contact-li {{contact.id}}" data-msg-time="{{contact.msgTime}}">' +
            '<a href="javascript:void(0);" ng-click="onTabClick($event,$index)"  class="{{contact.launcherExpr}}" data-apz-conversationid="{{contact.conversationId}}" data-apz-elementid="{{contact.htmlId}}" data-apz-id="{{contact.id}}" data-apz-isgroup="{{contact.isGroup}}">' +
            '<div class="apz-row" title="{{contact.displayName}}">' +
            '<div class="blk-lg-3" ng-bind-html="contact.imgExpr"></div>' +
            '<div class="blk-lg-9"><div class="apz-row"><div class="blk-lg-8 apz-contact-title apz-truncate">' +
            '<div class="apz-ol-status {{contact.olExpr}}"><span class="apz-ol-icon" title="online"></span>&nbsp;</div><strong>{{contact.displayName}}</strong></div>' +
            '<div class="blk-lg-4 apz-text-muted apz-text-right apz-cont-msg-date apz-truncate">{{contact.msgDateExpr}}</div></div>' +
            '<div class="apz-row"> <div class="blk-lg-8 apz-text-muted apz-conv-msg-wrapper apz-truncate" ng-bind-html="contact.msgExpr"></div>' +
            '<div class="apz-unread-count-box apz-move-right apz-truncate {{contact.unreadCountExpr}}">' +
            '<span class="apz-contact-right-text apz-unread-count-text">{{contact.unreadCount}}</span></div></div></div></div></a></li>',
        link: function($scope, element, attrs) {
            var $apz_contact_inner = angular.element('#apz-contact-inner');
            $apz_contact_inner.bind('scroll', function() {
                if ($apz_contact_inner.scrollTop() + $apz_contact_inner.innerHeight() >= $apz_contact_inner[0].scrollHeight) {
                    if ($scope.convProps.syncTime > 0 && !$scope.convProps.isSyncing) {
                        $scope.loadConversations({
                            'tabId': '',
                            'isGroup': false,
                            'startTime': $scope.convProps.syncTime
                        });
                    }
                }
            });

        }
    }
}).directive('contextMenu', [ '$parse', '$q', function($parse, $q) {
    var contextMenus = [];
    var removeContextMenus = function(level) {
        while (contextMenus.length && (!level || contextMenus.length > level)) {
            contextMenus.pop().remove();
        }
        if (contextMenus.length == 0 && $currentContextMenu) {
            $currentContextMenu.remove();
        }
    };
    var $currentContextMenu = null;
    var renderContextMenu = function($scope, event, options, model, level) {
        if (!level) {
            level = 0;
        }
        if (!$) {
            var $ = angular.element;
        }
        angular.element(event.currentTarget).addClass('context');
        var $contextMenu = angular.element('<div>');
        if ($currentContextMenu) {
            $contextMenu = $currentContextMenu;
        } else {
            $currentContextMenu = $contextMenu;
        }
        $contextMenu.addClass('mckdropdown');
        var $ul = $('<ul>');
        $ul.addClass('apz-context-menu');
        $ul.attr({
            'role': 'menu'
        });
        $ul.css({
            display: 'block',
            position: 'absolute',
            left: event.pageX + 'px',
            top: event.pageY + 'px',
            'z-index': 2243600
        });
        angular.forEach(options, function(item, i) {
            var $li = $('<li>');
            if (item === null) {
                $li.addClass('divider');
            } else {
                var $a = $('<a>');
                $a.css('padding-right', '8px');
                $a.attr({
                    tabindex: '-1',
                    href: 'javascript:void(0);'
                });
                var text = typeof item[0] == 'string' ? item[0] : item[0].call($scope, $scope, event, model);
                $q.when(text).then(function(text) {
                    $a.text(text);
                });
                $li.append($a);
                $li.on('click', function($event) {
                    // $event.preventDefault();
                    $scope.$apply(function() {
                        angular.element(event.currentTarget).removeClass('context');
                        removeContextMenus();
                        item[1].call($scope, event);
                    });
                });
                $li.addClass('disabled');
            }
            $ul.append($li);
        });
        $contextMenu.append($ul);
        var height = Math.max(
            document.body.scrollHeight, document.documentElement.scrollHeight,
            document.body.offsetHeight, document.documentElement.offsetHeight,
            document.body.clientHeight, document.documentElement.clientHeight
        );
        $contextMenu.css({
            width: '100%',
            height: height + 'px',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 2243600
        });
        angular.element(document).find('body').append($contextMenu);
        $contextMenu.on('mousedown', function(e) {
            if (angular.element(e.target).hasClass('mckdropdown')) {
                angular.element(event.currentTarget).removeClass('context');
                removeContextMenus();
            }
        }).on('contextmenu', function(event) {
            angular.element(event.currentTarget).removeClass('context');
            event.preventDefault();
            removeContextMenus(level);
        });
        $scope.$on('$destroy', function() {
            removeContextMenus();
        });
        contextMenus.push($ul);
    };
    return function($scope, element, attrs) {
        element.on('contextmenu', function(event) {
            event.stopPropagation();
            $scope.$apply(function() {
                event.preventDefault();
                var options = $scope.$eval(attrs.contextMenu);
                var model = $scope.$eval(attrs.model);
                if (options instanceof Array) {
                    if (options.length === 0) {
                        return;
                    }
                    renderContextMenu($scope, event, options, model);
                }
            });
        });
    };
} ]).directive('messagebox', function($compile) {
    return {
        restrict: 'E',
        template: '<div name="message" class="apz-m-b {{message.key}} {{message.floatExpr}}" data-delivered="{{message.delivered}}" data-sent="{{message.sent}}" data-type="{{message.type}}" data-time="{{message.createdAtTime}}" data-key="{{message.key}}" data-contact="{{message.contactId}}"><div class="apz-clear"><div class="blk-lg-12"><div class="apz-msg-box {{message.contentExpr}}" context-menu="{{message.contextMenuOption}}">' +
            '<div class="{{message.contactNameExpr}} {{message.contactAlphaTextExpr}}">{{message.contactName}}</div>' +
            '<div class="apz-file-text apz-attachment {{message.isFileExpr}}" data-filekey="{{message.fileMetaKey}}" data-filename="{{message.fileName}}" data-filesize="{{message.fileSize}}" ng-bind-html="message.fileExpr"></div>' + '<div class="apz-msg-text apz-msg-content {{message.isContentExpr}}" ng-bind-html="message.content"></div>'
            + '</div></div>' +
            '<div class="blk-lg-12 {{message.floatExpr}}-muted apz-text-light apz-text-muted apz-text-xs">{{message.createdAtTimeExpr}} <span class="{{message.statusIcon}} apz-message-status" title="{{message.statusTitle}}"></span></div></div>',
        link: function($scope, element, attrs) {}
    }
});