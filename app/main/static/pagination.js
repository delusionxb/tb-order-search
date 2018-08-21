
let populatePaginationContainer = function() {
    log('pagination.populatePaginationContainer()');
    let paginationWrapper = `
        <div class="pagination-wrapper">
            <div class="pagination-left"></div>
            <div class="pagination-right">
                <nav class="pagination is-centered" role="navigation" aria-label="pagination">
                  <a class="pagination-previous" disabled="disabled">Previous</a>
                  <a class="pagination-next" disabled="disabled">Next page</a>
                  <ul class="pagination-list">
                    <!--<li><a class="pagination-link" aria-label="Goto page 1">1</a></li>-->
                    <!--<li><span class="pagination-ellipsis">&hellip;</span></li>-->
                    <!--<li><a class="pagination-link is-current" aria-label="Page 46" aria-current="page">46</a></li>-->
                  </ul>
                </nav>
            </div>
        </div>
    `;
    $('.pagination-container').append($(paginationWrapper));
};

let tunePreNextByPageNo = function(currentPageNo) {
    log(`pagination.tunePreNextByPageNo(currentPageNo=${currentPageNo})`);
    if (currentPageNo === 1) { // disable previous if page number is 1
        $('.pagination-previous').attr('disabled', 'disabled');
        $('.pagination-next').removeAttr('disabled');
    } else if (currentPageNo === pageCount) {
        $('.pagination-next').attr('disabled', 'disabled');
        $('.pagination-previous').removeAttr('disabled');
    } else if (currentPageNo > 1 && currentPageNo < pageCount) { // disable next if page number is pageCount
        $('.pagination-previous').removeAttr('disabled');
        $('.pagination-next').removeAttr('disabled');
    }

    if (pageCount === 1 || pageCount === 0) {
        $('.pagination-previous').attr('disabled', 'disabled');
        $('.pagination-next').attr('disabled', 'disabled');
    }
};

let makePageList = function(currentPageNo=1, getMainOrdersFunc=getMainOrdersByPage, funcArgs='') {
    log(`pagination.makePageList(currentPageNo=${currentPageNo}, getMainOrdersFunc=${getMainOrdersFunc.name}, funcArgs=${funcArgs})`);
    let pageListHtml = '';
    if (currentPageNo < pageGroupCount) { // when page number is [1, 4]
        if (pageCount <= pageGroupCount) {
            for (let i=1; i<pageCount+1; i++) {
                pageListHtml += `<li><a class="pagination-link" aria-label="Goto page ${i}">${i}</a></li>`;
            }
        } else {
            pageListHtml = `
                <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
                <li><a class="pagination-link" aria-label="Goto page 2">2</a></li>
                <li><a class="pagination-link" aria-label="Goto page 3">3</a></li>
                <li><a class="pagination-link" aria-label="Goto page 4">4</a></li>
                <li><a class="pagination-link" aria-label="Goto page 5">5</a></li>
                <li><span class="pagination-ellipsis">&hellip;</span></li>
                <li><a class="pagination-link" aria-label="Goto page ${pageCount}">${pageCount}</a></li>
            `;
        }
    } else if (currentPageNo >= pageGroupCount && currentPageNo <= paginationRightBorder) { // when page number is [5, 82]
        pageListHtml = `
            <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
            <li><span class="pagination-ellipsis">&hellip;</span></li>
            <li><a class="pagination-link" aria-label="Goto page ${currentPageNo-2}">${currentPageNo-2}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${currentPageNo-1}">${currentPageNo-1}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${currentPageNo}">${currentPageNo}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${currentPageNo+1}">${currentPageNo+1}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${currentPageNo+2}">${currentPageNo+2}</a></li>
            <li><span class="pagination-ellipsis">&hellip;</span></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount}">${pageCount}</a></li>
        `;
    } else if (currentPageNo > paginationRightBorder) { // when page number is [83, 86]
        pageListHtml = `
            <li><a class="pagination-link" aria-label="Goto page 1">1</a></li>
            <li><span class="pagination-ellipsis">&hellip;</span></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount-4}">${pageCount-4}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount-3}">${pageCount-3}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount-2}">${pageCount-2}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount-1}">${pageCount-1}</a></li>
            <li><a class="pagination-link" aria-label="Goto page ${pageCount}">${pageCount}</a></li>
        `;
    }

    let pageList = $('.pagination-list');
    pageList.empty(); // refresh pageList innerHtml every time
    pageList.append($(pageListHtml));
    $(`a[aria-label="Goto page ${currentPageNo}"]`).addClass('is-current');

    tunePreNextByPageNo(currentPageNo);
    let searchData = funcArgs.searchData;
    if (searchData !== undefined) {
        searchData.pageNo = currentPageNo;
        searchData.ordersPerPage = ordersPerPage;
        searchData.createDaySort = createDaySort;
    }
    getMainOrdersFunc(currentPageNo, searchData);

    scroll2Top();
};

let scroll2Top = function() {
    setTimeout(function() {
        // https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollTo
        // https://stackoverflow.com/questions/1144805/scroll-to-the-top-of-the-page-using-javascript-jquery
        log('pagination.scroll2Top()');
        window.scrollTo(0, 0);
    }, 200);
};

let bindEvent2BackAndForth = function(getMainOrdersFunc=getMainOrdersByPage, funcArgs='') {
    log(`pagination.bindEvent2BackAndForth(getMainOrdersFunc=${getMainOrdersFunc.name}, funcArgs=${funcArgs})`);
    let pageList = $('.pagination-list');
    pageList.off('click');
    pageList.click(function(event) { // click pagination-link
        let target = event.target;
        if (target.classList.contains('pagination-link')) {
            if (!target.classList.contains('is-current')) {
                let targetPageNo = parseInt(target.innerText);
                makePageList(targetPageNo, getMainOrdersFunc, funcArgs);
            }
        }
    });

    let paginationPrevious = $('.pagination-previous');
    paginationPrevious.off('click');
    paginationPrevious.click(function() { // click pagination-previous
        let currentPageNo = parseInt($('.pagination-link.is-current').text());
        if (currentPageNo !== 1) {
            makePageList(currentPageNo - 1, getMainOrdersFunc, funcArgs);
        }
    });

    let paginationNext = $('.pagination-next');
    paginationNext.off('click');
    paginationNext.click(function() { // click pagination-next
        let currentPageNo = parseInt($('.pagination-link.is-current').text());
        if (currentPageNo !== pageCount) {
            makePageList(currentPageNo + 1, getMainOrdersFunc, funcArgs);
        }
    });
};

// https://tecadmin.net/get-current-url-web-browser-using-javascript/
let makePagination = function() {
    log('pagination.makePagination(), loading and representation of web page starts');
    $.ajax({
        url: '/order/totalCount',
        method: 'GET',
        success: function(response, status, jqXHR) {
            // log(JSON.stringify(jqXHR));
            if (jqXHR.responseJSON !== undefined && jqXHR.status === 200) {
                log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+');
                log(`${response} results returned in total from makePagination()`);
                if (window.location.pathname !== '/byPage') {
                    window.history.pushState(null, '', '/byPage');
                }
                // log(`makePagination: ${$('.login-container').attr('class')}`);
                toggleContainers('afterLogin');

                $('.return-count>span').text(response);
                pageCount = Math.ceil(response / ordersPerPage);
                paginationRightBorder = pageCount - pageGroupCount + 1;

                makePageList(); // called when page loaded the 1st time, currentPageNo is 1
                bindEvent2BackAndForth();
            }
        },
        error: printAjaxError,
    });
};

let makePagination4Search = function(searchData) {
    log(`pagination.makePagination4Search(searchData=${JSON.stringify(searchData)}), loading and representation of web page starts`);
    $.ajax({
        url: `/order/totalCount_byConditions`,
        method: 'POST',
        data: JSON.stringify(searchData),
        contentType: 'application/json; charset=UTF-8',
        success: function(response, status, jqXHR) {
            log('=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+');
            log(`${response} results returned in total from makePagination4Search()`);
            if (window.location.pathname !== '/byConditions') {
                window.history.pushState(null, '', '/byConditions');
            }
            toggleContainers('afterLogin');

            $('.return-count>span').text(response);
            pageCount = Math.ceil(response / ordersPerPage);
            paginationRightBorder = pageCount - pageGroupCount + 1;

            makePageList(1, getMainOrdersByConditions, {'searchData': searchData});
            bindEvent2BackAndForth(getMainOrdersByConditions, {'searchData': searchData});
        },
        error: printAjaxError,
    });
};
