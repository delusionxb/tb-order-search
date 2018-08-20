
let
    ordersPerPage = 10,
    createDaySort = -1,
    pageCount = 0,
    pageGroupCount = 5,
    paginationRightBorder = 0,
    imageHost = 'localhost';

populateLoginContainer();
bindAction2Login();
bindAction2Logout();
makePagination();

let populateContainers = function() {
    populateTopBottomContainer();
    populateConfigContainer();
    populateMainSearchContainer();
    populatePaginationContainer();
};

let bindOnce = function() {
    bindAction2TopBottom();
    bindAction2ConfigPanel();
    bindAction2ConfigOptions();
    bindAction2SearchExtension();
    bindAction2SearchFormBtns();
    bindAction2DateRangeType();
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
