var surface = null;
var query = null;
var currentItem = $();

var offsetLeft = 0;
var offsetTop = 0;
var offsetWidth = 0;
var offsetHeight = 0;

var currentScrollTop = 0;
var ignoreScrollEvent = false;

var keys =
{
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    ctrl: 17,
    alt: 18,
    q: 81
};

var mouseButton =
{
    left: 1,
    middle: 2,
    right: 3
};

var firstTimePositionRefresh = true;
var firstTimeQueryPositionRefresh = true;
var querySpaceEntered = false;
var queryForcedToShow = true;
var ctrlKeyIsPressed = false;
var altKeyIsPressed = false;

jQuery.fn.extend({
    disableSelection: function () {
        this.each(function () {
            this.onselectstart = function () { return false; };
            this.unselectable = "on";
            jQuery(this).css('-moz-user-select', 'none');
        });
    },
    enableSelection: function () {
        this.each(function () {
            this.onselectstart = function () { };
            this.unselectable = "off";
            jQuery(this).css('-moz-user-select', 'auto');
        });
    }
});

function getNextUpItemOnThisOrParentLevel(element) {
    var parent = element.closest("li");
    var prev = parent.prev();
    if (prev.length > 0) {
        var item = prev.find("> .item");
        return item;
    } else if (parent.is(":first-child")) {
        var item = parent.parent().closest("li").find("> .item");
        return item;
    }
}

function getNextUpItem(element) {
    var parent = element.closest("li");
    var prev = parent.prev();
    if (prev.length) {
        var list = prev;
        list = list.find("> ul");
        while (list.length) {
            var items = list.find("> li");
            if (items.length > 0) {
                var lastItem = $(items[items.length - 1]);
                var innerList = lastItem.find("> ul");
                if (innerList.length) {
                    list = innerList;
                } else {
                    return lastItem.find("> .item");
                }
            }
        }
        var item = prev.find("> .item");
        return item;
    } else if (parent.is(":first-child")) {
        var item = parent.parent().closest("li").find("> .item");
        return item;
    }
}

function getNextDownItemOnThisOrParentLevel(element) {
    var item = element.closest("li");
    var next = item.next();
    if (next.length) {
        var item = next.find("> .item");
        return item;
    } else {
        var parentList = item.closest("ul");
        if (!parentList.length) {
            return null;
        }
        var parentItem = parentList.closest("li");
        if (!parentItem.length) {
            return null;
        }
        return parentItem.next().find("> .item");
    }
}

function getNextDownItem(element) {
    var item = element.closest("li");
    var rightItem = item.find("> ul > li:first-child > .item");
    if (rightItem.length) {
        return rightItem;
    }
    var next = item.next();
    if (next.length) {
        var item = next.find("> .item");
        return item;
    } else {
        var parentList = item.closest("ul");
        if (!parentList.length) {
            return null;
        }
        var parentItem = parentList.closest("li");
        if (!parentItem.length) {
            return null;
        }
        return parentItem.next().find("> .item");
    }
}

$(document).ready(function () {
    surface = $("#surface")[0];
    query = $("#query")[0];
    $(".item").click(function (e) {
        if (e.which == mouseButton.left) {
            var item = $(this);
            MoveToItem(item);
        }
    });
    $(".item").disableSelection();
    $(window).keyup(function (e) {
        if (e.which == keys.ctrl)
            ctrlKeyIsPressed = false;
        if (e.which == keys.alt)
            altKeyIsPressed = false;
    });

    window.addEventListener('wheel', function (e) {
        e.preventDefault();
        if (e.deltaY < 0) {
            MoveToItem(getNextUpItem(currentItem));
        } else {
            MoveToItem(getNextDownItem(currentItem));
        }
        return false;
    }, {
        passive: false
    });

    $(window).scroll(function () {
        if (ignoreScrollEvent) {
            return;
        }
        var element = document.elementFromPoint(document.body.clientWidth / 2, document.body.clientHeight / 2);
        if ($(element).is(".item")) {
            var item = $(element);
            MoveToItem(item, true);
        }
    });

    $(window).keydown(function (e) {
        if (e.which == keys.ctrl)
            ctrlKeyIsPressed = true;
        if (e.which == keys.alt)
            altKeyIsPressed = true;
        if (e.which == keys.up) {
            var item = (ctrlKeyIsPressed || altKeyIsPressed) ? getNextUpItem(currentItem) : getNextUpItemOnThisOrParentLevel(currentItem);
            MoveToItem(item);
            return false;
        } else if (e.which == keys.down) {
            var item = (ctrlKeyIsPressed || altKeyIsPressed) ? getNextDownItem(currentItem) : getNextDownItemOnThisOrParentLevel(currentItem);
            MoveToItem(item);
            return false;
        } else if (e.which == keys.left) {
            var parent = currentItem.closest("li").parent().closest("li");
            var item = parent.find("> .item");
            MoveToItem(item);
            return false;
        } else if (e.which == keys.right) {
            var parent = currentItem.closest("li");
            var item = parent.find("> ul > li:first-child > .item");
            MoveToItem(item);
            return false;
        } else if ((ctrlKeyIsPressed || altKeyIsPressed) && e.which == keys.q) {
            if (queryForcedToShow)
                HideQuery();
            else
                ShowQuery();
            queryForcedToShow = !queryForcedToShow;
            return false;
        }
    });

    $("body").mousemove(function (e) {
        if (e.clientY < 90) {
            if (!querySpaceEntered) {
                if (!queryForcedToShow) {
                    ShowQuery();
                }
                querySpaceEntered = true;
            }
        } else {
            if (querySpaceEntered) {
                if (!queryForcedToShow) {
                    HideQuery();
                }
                querySpaceEntered = false;
            }
        }
    });
    MoveToItem(GetFirstItem());
    Refresh();
});

$(window).resize(function () {
    Refresh();
});

function ShowQuery() {
    query.style.top = "20px";
	/*
	setInterval(function () // Иначе страница прыгает
	{
		$(query).find("input").focus();
	}, 10);*/
}

function HideQuery() {
    query.style.top = (2 - query.offsetHeight) + "px";
	/*
	setInterval(function () // Иначе страница прыгает
	{
		$(query).find("input").blur();
	}, 10); */
}

function Refresh() {
    var firstItem = GetFirstItem();
    var lastItem = GetLastItem();
    $(surface).css('padding-bottom', ((document.body.clientHeight - firstItem[0].offsetHeight) / 2) + "px");
    $(surface).css('padding-top', ((document.body.clientHeight - lastItem[0].offsetHeight) / 2) + "px");
    var newLeft = ((document.body.clientWidth - query.offsetWidth) / 2) + "px";
    query.style.left = newLeft;
    if (firstTimeQueryPositionRefresh) {
        setTimeout(function () // Иначе анимация начинает работать сразу
        {
            query.className = "animated";
            firstTimeQueryPositionRefresh = false;
        }, 10);
    }
    RefreshPosition();
}

function GetFirstItem() {
    return $("#surface > ul > li:first-child > .item");
}

function GetLastItem() {
    var child = $(surface).find("> ul > li:last-child");
    do {
        var childOfChild = child.find("> ul > li:last-child");
        if (childOfChild.length > 0) {
            child = childOfChild;
        } else {
            break;
        }
    } while (true);
    return child.find("> .item");
}

function MoveToItem(item, fromScroll) {
    if (item != null && item[0] != null && (currentItem == null || currentItem[0] != item[0])) {
        if (currentItem != null) {
            currentItem.removeClass("focused");
            currentItem.disableSelection();
        }
        SetPositionOffset(item[0]);
        RefreshPosition(fromScroll);
        item.addClass("focused");
        item.enableSelection();
        currentItem = item;
    }
}

function RefreshPosition(fromScroll) {
    var newLeft = ((document.body.clientWidth - offsetWidth) / 2 - offsetLeft) + "px";
    var newScrollTop = (offsetTop - (document.body.clientHeight - offsetHeight) / 2);
    if (firstTimePositionRefresh) {
        surface.style.left = newLeft;
        if (!fromScroll) {
            $(window).scrollTop(newScrollTop);
        }
        firstTimePositionRefresh = false;
    } else {
        $(surface).stop(true);
        if (fromScroll) {
            $(surface).animate({
                left: newLeft,
                queue: false
            }, 600);
        } else {
            $('html').stop(true);
            ignoreScrollEvent = true;
            $(surface).animate({
                left: newLeft,
                queue: false
            }, 500, function () {
                ignoreScrollEvent = false;
            });
            $('html').animate({
                scrollTop: newScrollTop,
                queue: false
            }, 500, function () {
                currentScrollTop = newScrollTop;
                ignoreScrollEvent = false;
            })
        }
    }
}

function SetPositionOffset(obj) {
    var p = GetPosition(obj, surface);
    offsetLeft = p.left;
    offsetTop = p.top;
    offsetWidth = obj.offsetWidth;
    offsetHeight = obj.offsetHeight;
}

function GetPosition(obj, relativeTo) {
    var left = 0;
    var top = 0;
    if (obj.offsetParent) {
        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj = obj.offsetParent & obj != relativeTo);
    }
    return { 'left': left, 'top': top };
}