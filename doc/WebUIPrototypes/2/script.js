let surface = null;
let query = null;
let currentItem = $();

let offsetLeft = 0;
let offsetTop = 0;
let offsetWidth = 0;
let offsetHeight = 0;

let currentScrollTop = 0;
let ignoreScrollEvent = false;

const keys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    ctrl: 17,
    alt: 18,
    q: 81
};

const mouseButton = {
    left: 1,
    middle: 2,
    right: 3
};

let firstTimePositionRefresh = true;
let firstTimeQueryPositionRefresh = true;
let querySpaceEntered = false;
let queryForcedToShow = true;
let ctrlKeyIsPressed = false;
let altKeyIsPressed = false;

jQuery.fn.extend({
    disableSelection: function () {
        this.each(() => {
            this.onselectstart = () => false;
            this.unselectable = "on";
            jQuery(this).css('-moz-user-select', 'none');
        });
    },
    enableSelection: function () {
        this.each(() => {
            this.onselectstart = () => {};
            this.unselectable = "off";
            jQuery(this).css('-moz-user-select', 'auto');
        });
    }
});

function getNextUpItemOnThisOrParentLevel(element) {
    let parent = element.closest("li");
    let prev = parent.prev();
    let item;
    if (prev.length > 0) {
        item = prev.find("> .item");
        return item;
    } else if (parent.is(":first-child")) {
        item = parent.parent().closest("li").find("> .item");
        return item;
    }
}

function getNextUpItem(element) {
    let parent = element.closest("li");
    let prev = parent.prev();
    if (prev.length) {
        let list = prev;
        list = list.find("> ul");
        while (list.length) {
            let items = list.find("> li");
            if (items.length > 0) {
                let lastItem = $(items[items.length - 1]);
                let innerList = lastItem.find("> ul");
                if (innerList.length)
                    list = innerList;
                else
                    return lastItem.find("> .item");
            }
        }
        return prev.find("> .item");
    }
    if (parent.is(":first-child")) {
        return parent.parent().closest("li").find("> .item");
    }
}

function getNextDownItem(element, thisLevel=false) {
    const item = element.closest("li");

    if (!thisLevel) {
        const rightItem = item.find("> ul > li:first-child > .item");
        if (rightItem.length) return rightItem;
    }

    const next = item.next();
    if (next.length) return next.find("> .item");

    const parentList = item.closest("ul");
    if (!parentList.length) return null;

    const parentItem = parentList.closest("li");
    if (!parentItem.length) return null;

    return parentItem.next().find("> .item");
}

$(document).ready(function () {
    surface = $("#surface")[0];
    query = $("#query")[0];
    $(".item").click(function (e) {
        if (e.which === mouseButton.left) {
            const item = $(this);
            MoveToItem(item);
        }
    });
    $(".item").disableSelection();
    $(window).keyup(function (e) {
        if (e.which === keys.ctrl)
            ctrlKeyIsPressed = false;
        if (e.which === keys.alt)
            altKeyIsPressed = false;
    });

    window.addEventListener('wheel', (e) => {
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
        if (ignoreScrollEvent) return;

        let element = document.elementFromPoint(document.body.clientWidth / 2, document.body.clientHeight / 2);
        if ($(element).is(".item")) {
            const item = $(element);
            MoveToItem(item, true);
        }
    });

    $(window).keydown(function (e) {
        let parent;
        let item;
        if (e.which === keys.ctrl) ctrlKeyIsPressed = true;
        if (e.which === keys.alt) altKeyIsPressed = true;

        if (e.which === keys.up) {
            item = (ctrlKeyIsPressed || altKeyIsPressed) ? getNextUpItem(currentItem) : getNextUpItemOnThisOrParentLevel(currentItem);
            MoveToItem(item);
            return false;
        }
        if (e.which === keys.down) {
            item = (ctrlKeyIsPressed || altKeyIsPressed) ? getNextDownItem(currentItem) : getNextDownItem(currentItem,  true);
            MoveToItem(item);
            return false;
        }
        if (e.which === keys.left) {
            parent = currentItem.closest("li").parent().closest("li");
            item = parent.find("> .item");
            MoveToItem(item);
            return false;
        }
        if (e.which === keys.right) {
            parent = currentItem.closest("li");
            item = parent.find("> ul > li:first-child > .item");
            MoveToItem(item);
            return false;
        }
        if ((ctrlKeyIsPressed || altKeyIsPressed) && e.which === keys.q) {
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
                if (!queryForcedToShow) ShowQuery();
                querySpaceEntered = true;
            }
        } else {
            if (querySpaceEntered) {
                if (!queryForcedToShow) HideQuery();
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
    const firstItem = GetFirstItem();
    const lastItem = GetLastItem();
    $(surface).css('padding-bottom', ((document.body.clientHeight - firstItem[0].offsetHeight) / 2) + "px");
    $(surface).css('padding-top', ((document.body.clientHeight - lastItem[0].offsetHeight) / 2) + "px");
    query.style.left = ((document.body.clientWidth - query.offsetWidth) / 2) + "px";
    if (firstTimeQueryPositionRefresh) {
        setTimeout(() => {
            // Иначе анимация начинает работать сразу
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
    let child = $(surface).find("> ul > li:last-child");
    do {
        const childOfChild = child.find("> ul > li:last-child");
        if (childOfChild.length <= 0) break;

        child = childOfChild;
    } while (true);

    return child.find("> .item");
}

function MoveToItem(item, fromScroll) {
    if (item != null && item[0] != null && (currentItem == null || currentItem[0] !== item[0])) {
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
    const newLeft = ((document.body.clientWidth - offsetWidth) / 2 - offsetLeft) + "px";
    const newScrollTop = (offsetTop - (document.body.clientHeight - offsetHeight) / 2);
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
    const p = GetPosition(obj, surface);
    offsetLeft = p.left;
    offsetTop = p.top;
    offsetWidth = obj.offsetWidth;
    offsetHeight = obj.offsetHeight;
}

function GetPosition(obj, relativeTo) {
    let left = 0;
    let top = 0;
    if (obj.offsetParent) {
        do {
            left += obj.offsetLeft;
            top += obj.offsetTop;
        } while (obj === obj.offsetParent && obj !== relativeTo);
    }
    return { 'left': left, 'top': top };
}
