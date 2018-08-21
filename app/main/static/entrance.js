
let
    createDaySort = -1,
    ordersPerPage = 10,
    pageCount = 0,
    pageGroupCount = 5,
    paginationRightBorder = 0,
    imageHost = 'localhost';

populateLoginContainer();
bindEvent2Login();
bindEvent2Logout();
sessionStorage.setItem('config', JSON.stringify({
    createDaySort: createDaySort,
    ordersPerPage: ordersPerPage,
}));

// maybe add ifAutoHide_UnmatchedSubOrders
// https://stackoverflow.com/questions/679915/how-do-i-test-for-an-empty-javascript-object
let searchData = sessionStorage.getItem('searchData');
if (searchData === null || (Object.keys(searchData).length === 0 && searchData.constructor === Object)) {
    makePagination();
} else {
    makePagination4Search(JSON.parse(searchData));
}

let populateContainers = function() {
    populateTopBottomContainer();
    populateConfigContainer();
    populateMainSearchContainer();
    populatePaginationContainer();
};

let bindOnce = function() {
    bindEvent2TopBottom();
    bindEvent2ConfigPanel();
    bindEvent2ConfigOptions();
    bindEvent2SearchExtension();
    bindEvent2SearchFormBtns();
    bindEvent2DateRangeType();
};

let toggleContainers = function(action) {
    log(`entrance.toggleContainers(action=${action})`);
    let loginContainer = $('.login-container');
    if (action === 'afterLogin') {
        if (!loginContainer.attr('class').includes('is-off')) {
            loginContainer.addClass('is-off');
            $('.logout-container').removeClass('is-off');
            $('.super-main-container').removeClass('is-off');

            populateContainers();
            bindOnce();
        }
    } else if (action === 'afterLogout') {
        loginContainer.removeClass('is-off');
        $('.logout-container').addClass('is-off');
        $('.super-main-container').addClass('is-off');

        $('.field.username input').val('');
        $('.field.password input').val('');

        $('.main-orders-list').remove();
        $('.pagination-wrapper').remove();
    }
};
