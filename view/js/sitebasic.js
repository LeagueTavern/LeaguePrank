/*
听好了 不要熬夜写代码 不然写出来的东西跟屎一样
在你阅读下面这坨屎之前最好做好心理准备，我懒得后期维护(雾)
可阅性几乎为0
*/

$(function () {
    var usageCt = document.querySelectorAll("div.container-usage");
    var NavObject = new NavObj();
    var histick = -1;

    //屏蔽鼠标拖动事件
    var clickEvent = $('img[drop="false"],a');
    clickEvent.on('contextmenu', function () { return false; });
    clickEvent.on('dragstart', function () { return false; });

    //监控页面滚动事件
    $('#container-body').scroll(function (e) {
        for (var i in usageCt) {
            //console.log($(e.target).scrollTop(),$(usageCt[i]).offset().top - 94);
            if ($(usageCt[i]).offset().top > 0) {
                if (histick != i) {
                    histick = i;
                    if (i < 0) i++;
                    console.log(i);
                    usageInfo = $(usageCt[i]).attr('usage');
                    NavObject.setNavActive(usageInfo);
                }
                return;
            }
        }
    });

    if (typeof (QCefClient) != 'undefined') {
        QCefClient.addEventListener("LCUsetPathList", onLCUsetPathList);
        QCefClient.addEventListener("LCUreadProfile", onLCUreadProfile);

        QCefClient.invokeMethod("LCUgetPathList");
        QCefClient.invokeMethod("LCUreadProfile");
    };

    //在线模式select选择器
    $("#tag-online-select").change(function (e) {
        onlineState = $(e.target).val();
        requestUrl = "/lol-chat/v1/me";
        $.ajax(lcurequest.request(requestUrl, "GET", null, function (obj) {
            obj.availability = onlineState;
            $.ajax(lcurequest.request(requestUrl, "PUT", JSON.stringify(obj)));
        }));
    });

    //段位select选择器
    $("#tag-tier-select-tier,#tag-tier-select-type,#tag-tier-select-level").change(function (e) {
        tierChanger($("#tag-tier-select-tier").val(), $("#tag-tier-select-type").val(), $("#tag-tier-select-level").val());
    });
    function tierChanger(tier, mode, level) {
        requestUrl = "/lol-chat/v1/me";
        $.ajax(lcurequest.request(requestUrl, "GET", null, function (obj) {
            obj.lol.rankedLeagueTier = tier;
            obj.lol.rankedPrevSeasonTier = tier;
            obj.lol.rankedLeagueDivision = level;
            obj.lol.rankedPrevSeasonDivision = level;
            obj.lol.rankedLeagueQueue = mode;
            $.ajax(lcurequest.request(requestUrl, "PUT", JSON.stringify(obj)));
        }));
    };

    //插画选择器
    $("#tag-background-select-hero").change(function (e) {
        var hname = $(e.target).val();
        requestUrl = "/lol-game-data/assets/v1/champions/" + hname + ".json";
        $.ajax(lcurequest.request(requestUrl, "GET", null, function (rqResult) {
            champLength = Object.keys(rqResult.skins).length;
            SkinContainer = $('#tag-background-select-skin');
            SkinContainer.html('');
            for (var i = 0; i < champLength; i++) {
                SkinContainer.append(
                    $('<option/>', { 'value': rqResult.skins[i].id, text: rqResult.skins[i].name })
                );
            };
            $("#tag-background-select-skin").change();
        }));

    });
    $("#tag-background-select-skin").change(function (e) {
        requestJson = { key: "backgroundSkinId", value: $(e.target).val() };
        requestUrl = "/lol-summoner/v1/current-summoner/summoner-profile";
        $.ajax(lcurequest.request(requestUrl, "POST", JSON.stringify(requestJson)));
    });

    /*$("#head-selector-open").click(function(e){
        requestUrl = "/lol-game-data/assets/v1/profile-icons.json"
        $.ajax(lcurequest.request(requestUrl, "GET", null, function(rqResult){
            headContainer = $("#head-selector-list");
            headContainer.html('');
            headContainer_tag = '';
            for(var i=0; i<Object.keys(rqResult).length; i++){
                headContainer_tag += '<li><img class="head-list-view" headId="' + rqResult[i].id + '" data-src="' + rqResult[i].iconPath + '" /></li>'
            }
            headContainer.html(headContainer_tag);
            headContainer.append(
                $('<li/>').append(
                    $('<img/>', {'class': 'head-list-view', 'headId': rqResult[i].id, 'data-src':rqResult[i].iconPath})
                )
            );
            document.querySelectorAll("img.head-list-view").forEach(mark => {
                observer.observe(mark)
            })
            $("#head-selector").addClass('page-show');
        }));
    });

    $("#head-selector-cancel").click(function(e){
        $("#head-selector").removeClass('page-show');
    });*/

    //头像选择器
    hdselect = "#head-selector"
    $(hdselect + "-up," + hdselect + "-down").click(function (e) {
        $(hdselect + "-count").val(parseInt($(hdselect + "-count").val()) + parseInt($(e.target).val()));
        headChanger(parseInt($(hdselect + "-count").val()));
    });

    $(hdselect + "-count").bind("input propertychange", function () {
        headChanger(parseInt($(hdselect + "-count").val()));
    });

    function headChanger(HeadId) {
        lcurequest.request_getImg($("#head-review-image")[0], "/lol-game-data/assets/v1/profile-icons/" + HeadId + ".jpg");
        requestUrl = "/lol-chat/v1/me";
        requestUrl_profile_icon = "/lol-summoner/v1/current-summoner/icon";
        $.ajax(lcurequest.request(requestUrl, "GET", null, function (obj) {
            obj.icon = HeadId;
            obj_profile = { profileIconId: HeadId };
            $.ajax(lcurequest.request(requestUrl, "PUT", JSON.stringify(obj)));
            $.ajax(lcurequest.request(requestUrl_profile_icon, "PUT", JSON.stringify(obj_profile)));
        }));
    }

    $('#tag-clash-enable:checkbox').click(function (e) {
        //$(e.target).prop("checked") ? state = "block" : state ="none";
        requestUrl_chat = "/lol-chat/v1/me";
        modeContainer = $("#tag-clash-queue-select");
        summonersContainer = $("#tag-clash-summoners");
        summonersContainer.html('');
        if ($(e.target).prop("checked")) {
            state = "block"
            modeContainer.html('');
            for (var i = 0; i < Object.keys(QueueIdlist).length; i++) {
                if (QueueIdlist[i].id >= 400) {
                    modeContainer.append(
                        $('<option/>', { 'value': QueueIdlist[i].id, text: QueueIdlist[i].id + " " + QueueIdlist[i].name + " " + QueueIdlist[i].detailedDescription })
                    )
                };
            };
            $.ajax(lcurequest.request(requestUrl_chat, "GET", null, function (rqResult) {
                if (rqResult.lol.pty) {
                    clashEvent = JSON.parse(rqResult.lol.pty);

                    for (var i = 0; i < Object.keys(clashEvent.summoners).length; i++) {
                        $.ajax(lcurequest.request("/lol-summoner/v1/summoners/" + clashEvent.summoners[i], "GET", null, function (rqResult) {
                            summonerName = rqResult.internalName;
                            summonerId = rqResult.summonerId;
                            summonersContainer.append(
                                $('<tr/>', { 'summonerId': summonerId }).append(
                                    /*$('<td/>').append(
                                        $('<input/>', {'class':'uk-checkbox', 'type': 'checkbox'})
                                    ),*/
                                    $('<td/>', { 'class': 'uk-text-truncate', text: summonerName }),
                                    $('<td/>', { 'class': 'uk-text-truncate', text: summonerId }),
                                    /*$('<td/>', {'class': 'uk-table-icon uk-edit-i'}).append(
                                        $('<span/>', {'uk-icon':'icon: pencil'})
                                    ),*/
                                    $('<td/>', { 'class': 'uk-table-icon uk-delect-i' }).append(
                                        $('<span/>', { 'uk-icon': 'icon: trash' })
                                    )
                                )
                            );
                        }));
                    };
                    modeContainer.val(clashEvent.queueId);
                } else {
                    modeContainer.val(400);
                    clashEvent = { partyId: "", queueId: "400", summoners: [] };
                };
            }));

        } else {
            state = "none";
            updateClashList();
        } $('#tag-clash-container').css("display", state);
    });


    $("#tag-clash-summoners").on("click", "tr td.uk-edit-i", function (e) {
        tagEvent = $(this).parent("tr");
        summonerId = tagEvent.attr('summonerId');

    });

    $("#tag-clash-summoners").on("click", "tr td.uk-delect-i", function (e) {
        tagEvent = $(this).parent("tr");
        if (clashEvent.summoners) {
            clashEvent.summoners.splice($(this).index('tr td.uk-delect-i'), 1);
            tagEvent.remove();
            updateClashList(clashEvent);
        };

    });
    $("#tag-clash-queue-select").change(function (e) {
        clashEvent.queueId = $(e.target).val();
        updateClashList(clashEvent);
    });
    $("#tag-clash-container-review").click(function (e) {
        updateClashList(clashEvent);
    });

    function updateClashList(Json) {
        requestUrl_chat = "/lol-chat/v1/me";
        $.ajax(lcurequest.request(requestUrl_chat, "GET", null, function (rqResult) {
            rqResult.lol.pty ? PreClashEvent = JSON.parse(rqResult.lol.pty) : PreClashEvent = { partyId: "", queueId: "400", summoners: [] };
            if (Json) {
                PreClashEvent.queueId = Json.queueId;
                PreClashEvent.summoners = Json.summoners;

                rqResult.lol.pty = JSON.stringify(PreClashEvent);
                console.log(clashEvent.summoners, JSON.stringify(rqResult), JSON.stringify(PreClashEvent));

            } else {
                rqResult.lol.pty = '';
            };
            $.ajax(lcurequest.request(requestUrl_chat, "PUT", JSON.stringify(rqResult)));
        }));
    };

    $("#tag-clash-container-add").click(function (e) {
        $("#clash-selector").fadeTo(200, 1);
    });
    $('button.uk-button[id="clash-selector-cancel"]').click(function (e) {
        $("#clash-selector").fadeOut(200);
    });
    $('#clash-selector-summonerName-continue').click(function (e) {
        addClashList($('#clash-selector-summonerName').val(), true);
    });
    $('#clash-selector-summonerId-continue').click(function (e) {
        addClashList($('#clash-selector-summonerId').val(), false);
    });
    $('#clash-selector-summonerName, #clash-selector-summonerId').click(function (e) {
        $(e.target).removeClass("uk-form-danger");
    });

    function addClashList(preStr, type) {
        type ? requestUrl = encodeURI("/lol-summoner/v1/summoners?name=" + preStr) : requestUrl = "/lol-summoner/v1/summoners/" + preStr;
        $.ajax(lcurequest.request(requestUrl, "GET", null, function (rqResult) {
            summonerName = rqResult.internalName;
            summonerId = rqResult.summonerId;
            summonersContainer = $("#tag-clash-summoners");
            summonersContainer.append(
                $('<tr/>', { 'summonerId': summonerId }).append(
                    /*$('<td/>').append(
                        $('<input/>', {'class':'uk-checkbox', 'type': 'checkbox'})
                    ),*/
                    $('<td/>', { 'class': 'uk-text-truncate', text: summonerName }),
                    $('<td/>', { 'class': 'uk-text-truncate', text: summonerId }),
                    /*$('<td/>', {'class': 'uk-table-icon uk-edit-i'}).append(
                        $('<span/>', {'uk-icon':'icon: pencil'})
                    ),*/
                    $('<td/>', { 'class': 'uk-table-icon uk-delect-i' }).append(
                        $('<span/>', { 'uk-icon': 'icon: trash' })
                    )
                )
            );
            clashEvent.summoners[clashEvent.summoners.length] = summonerId;
            $("#clash-selector").fadeOut(200);
            updateClashList(clashEvent);

        }, function () {
            type ? tagId = "#clash-selector-summonerName" : tagId = "#clash-selector-summonerId";
            $(tagId).addClass("uk-form-danger");
        }))
    }

});

var LcuList;
var lcurequest = new LCUrq();
var clashEvent;
var QueueIdlist;
let observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {//图片进入范围时加载
        if (entry.isIntersecting) {
            var img = entry.target;
            var url = $(img).attr('data-src');
            lcurequest.request_getImg(img, url);
            observer.unobserve(img);
        }
    })
})


//从cef读入客户端列表
function onLCUsetPathList(event) {
    var obj = JSON.parse(event["pathList"]);
    LcuList = obj;

    LculistLength = Object.keys(obj.list).length;
    switch (LculistLength) {
        case 0: {
            $("#load-welc-spinner").hide();
            $("#load-welc-error").show();
            break;
        }
        case 1: {
            checkLcuEnable(0);
            break;
        }
        default: {
            checkLcuEnable(0);
        }
    };
}

//检查是否有效，并全局初始化
function checkLcuEnable(id) {
    requestUrl = "/lol-summoner/v1/current-summoner";
    requestUrl_profile = "/lol-summoner/v1/current-summoner/summoner-profile"
    requestUrl_champion = "/lol-game-data/assets/v1/champion-summary.json";
    requestUrl_chat = "/lol-chat/v1/me";
    requestUrl_queue = "/lol-game-queues/v1/queues";

    lcurequest.install(LcuList.list[id].protocol, LcuList.list[id].path, LcuList.list[id].url, LcuList.list[id].token);
    $.ajax(lcurequest.request(requestUrl, "GET", null, function (rqResult) {
        $("#user-name-container").html(rqResult.internalName);
        lcurequest.request_getImg($("#user-head-container")[0], "/lol-game-data/assets/v1/profile-icons/" + rqResult.profileIconId + ".jpg");
    }));
    $.ajax(lcurequest.request(requestUrl_profile, "GET", null, function (rqResult) {
        heroSkinId = "" + rqResult.backgroundSkinId;
        heroId = heroSkinId.substr(0, heroSkinId.length - 3);
        $.ajax(lcurequest.request(requestUrl_champion, "GET", null, function (rqResult) {
            champLength = Object.keys(rqResult).length;
            HeroContainer = $('#tag-background-select-hero');
            HeroContainer.html('');
            for (var i = 1; i < champLength; i++) {
                HeroContainer.append(
                    $('<option/>', { 'value': rqResult[i].id, text: rqResult[i].name })
                );
            };
            HeroContainer.val(heroId);
            $.ajax(lcurequest.request("/lol-game-data/assets/v1/champions/" + heroId + ".json", "GET", null, function (rqResult) {
                champLength = Object.keys(rqResult.skins).length;
                SkinContainer = $('#tag-background-select-skin');
                SkinContainer.html('');
                for (var i = 0; i < champLength; i++) {
                    SkinContainer.append(
                        $('<option/>', { 'value': rqResult.skins[i].id, text: rqResult.skins[i].name })
                    );
                };
                SkinContainer.val(heroSkinId);
            }));
        }));
    }));

    $.ajax(lcurequest.request(requestUrl_chat, "GET", null, function (rqResult) {
        $("#tag-online-select").val(rqResult.availability);
        $("#tag-tier-select-tier").val(rqResult.lol.rankedLeagueTier);
        $("#tag-tier-select-type").val(rqResult.lol.rankedLeagueQueue);
        $("#tag-tier-select-level").val(rqResult.lol.rankedLeagueDivision);
        $("#head-selector-count").val(rqResult.icon);
        lcurequest.request_getImg($("#head-review-image")[0], "/lol-game-data/assets/v1/profile-icons/" + rqResult.icon + ".jpg");
    }));

    $.ajax(lcurequest.request(requestUrl_queue, "GET", null, function (rqResult) {
        QueueIdlist = rqResult;
    }));
    $("#welcome-page-info").fadeOut(300);
}

//读入配置文件
function onLCUreadProfile(event) {
    var prejson = event["profile"];
    var obj = JSON.parse(prejson);

}

//保存配置文件
function LCUsaveProfile(prejson) {
    QCefClient.invokeMethod("LCUwriteProfile", prejson);
}

//打开URL
function LCUopenUrl(url) {
    QCefClient.invokeMethod("LCUopenUrl", url);
}

//nav操作
var NavObj = function () {
    var NavParent = '#side-Navbar';
    var NavClassName = 'uk-nav-tag';
    var NavtagAll = $(NavParent + ' li.' + NavClassName);

    $(NavParent).on('click', 'li.' + NavClassName, function (e) {//nav被点击
        usage = $(this).attr('usage');
        scrollhigh = $('div.container-usage[usage="' + usage + '"]').offset()//获取元素顶部位置
            .top + $('#container-body').scrollTop() - 94;
        $('#container-body').animate({
            scrollTop: scrollhigh
        },
            300);
    });

    this.setNavActive = function (usageName) {
        var Navtag = $(NavParent + ' li.' + NavClassName + '[usage="' + usageName + '"]');
        if (!Navtag.hasClass('active')) {
            Array.from(NavtagAll).forEach(i =>
                $(i).removeClass('active')
            );
            Navtag.addClass('active');
        }
        return true;
    };
}

function openBilibiliSpace(id) {
    LCUopenUrl('https://space.bilibili.com/' + id);
}