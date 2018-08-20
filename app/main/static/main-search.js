
let populateMainSearchContainer = function() {
    log('main-search.populateMainSearchContainer()');
    let mainSearchWrapper = `
        <div class="main-search-wrapper">
            <div class="base-search">
                <div class="base-search-form">
                    <input class="input is-info" placeholder="put in item name or order ID to search">
                    <button class="button btn-search is-info">搜索</button>
                    <button class="button btn-reset is-info">重置</button>
                </div>
                <div class="base-search-extension">
                    <span>更多搜索条件</span>
                    <span class="is-off">
                        <i class="fas fa-angle-up"></i>
                    </span>
                    <span>
                        <i class="fas fa-angle-down"></i>
                    </span>
                </div>
                <div class="base-search-all">
                    <span class="return-count">找到 <span></span> 笔订单</span>
                    <button class="button btn-all is-info">所有订单</button>
                </div>
            </div>
            <div class="condition-search-container">
                <div class="condition-search-wrapper">
                    <div class="condition-search-rows">
                        <div class="condition-search-row">
                            <div class="condition-search div totalCost">
                                <span class="condition-search span">总价范围</span>
                                <input class="condition-search input minTotalCost is-info">
                                <input class="condition-search input maxTotalCost is-info">
                            </div>
                            <div class="condition-search div shopName">
                                <span class="condition-search span">店铺名称</span>
                                <input class="condition-search input is-info">
                            </div>
                            <div class="condition-search div orderType">
                                <span class="condition-search span">订单类型</span>
                                <div class="select is-info">
                                  <select>
                                    <option value="">所有</option>
                                    <option value="real">实物</option>
                                    <option value="virtual">虚拟</option>
                                  </select>
                                </div>
                            </div>
                            <div class="condition-search div tradeStatus">
                                <span class="condition-search span">订单状态</span>
                                <div class="select is-info">
                                  <select>
                                    <option value="">所有</option>
                                    <option value="finished">完成</option>
                                    <!-- the 'closed' here actually means 'cancelled', not finished,
                                     the order / trade was closed after it's been placed, but not payed yet -->
                                    <option value="closed">关闭</option>
                                  </select>
                                </div>
                            </div>
                        </div>
                        <div class="condition-search-row">
                            <div class="condition-search div createDay">
                                <div>
                                    <span class="condition-search span">成交时间</span>
                                </div>
                                <div class="createDay-type select is-info">
                                  <select class="createDay-type">
                                    <option value="byMonth">按月</option>
                                    <option value="customize">自选</option>
                                  </select>
                                </div>
                                <div class="createDay-type-byMonth select is-info">
                                  <select class="createDay-type-byMonth">
                                    <option value="0">-- 自然月 --</option>
                                    <option value="1">最近一个月</option>
                                    <option value="3">最近三个月</option>
                                    <option value="6">最近六个月</option>
                                  </select>
                                </div>
                                <div class="createDay-type-byRange is-off">
                                    <input type="date" class="condition-search input minCreateDay is-info"
                                       min="2009-01-01" max="2100-12-31">
                                    <input type="date" class="condition-search input maxCreateDay is-info"
                                       min="2009-01-01" max="2100-12-31">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="condition-search-extension">TBD</div>
                </div>
            </div>
        </div>
    `;

    $('.main-search-container').append($(mainSearchWrapper));
};

let bindAction2SearchExtension = function() {
    log('main-search.bindAction2SearchExtension()');
    $('.base-search-extension').click(function(event) {
        $('.base-search-extension').find('span:nth-child(2), span:nth-child(3)').toggleClass('is-off');
        $('.condition-search-container').toggle(400);
    });
};

let populateSearchFields = function() {
    log('main-search.populateSearchFields()');
    let searchFields = {};
    searchFields.itemName = $('.base-search-form>.input');
    searchFields.minTotalCost = $('.condition-search.totalCost>.input.minTotalCost');
    searchFields.maxTotalCost = $('.condition-search.totalCost>.input.maxTotalCost');
    searchFields.shopName = $('.condition-search.shopName>.input');
    searchFields.orderType = $('.condition-search.orderType select').find('option:selected');
    searchFields.tradeStatus = $('.condition-search.tradeStatus select').find('option:selected');

    let byMonthSelect = $('.createDay-type-byMonth');
    let byRange = $('.createDay-type-byRange');
    if (byMonthSelect.css('display') !== 'none') {
        searchFields.byMonthOption = byMonthSelect.find('option:selected');
    } else {
        searchFields.minCreateDay = $('.createDay-type-byRange>.input.minCreateDay');
        searchFields.maxCreateDay = $('.createDay-type-byRange>.input.maxCreateDay');
    }
    return searchFields;
};

// make 1-9 to '01'-'09'
let plus0 = function(num) {
    return num < 10 ? '0' + num : num;
};

let getSearchData = function() {
    log('main-search.getSearchData()');
    let searchFields = populateSearchFields();
    let searchData = {};
    for (let key in searchFields) {
        if (searchFields.hasOwnProperty(key)) {
            if (key === 'byMonthOption') {
                let byMonthValue = searchFields.byMonthOption.val();
                if (byMonthValue !== '0') {
                    let now = new Date();
                    let thisMonth = plus0(now.getMonth() + 1);
                    let thatMonth = plus0(now.getMonth() + 1 - (byMonthValue - 1));
                    let thisDay = plus0(now.getDate());
                    searchData.minCreateDay = `${now.getFullYear()}-${thatMonth}-01`;
                    searchData.maxCreateDay = `${now.getFullYear()}-${thisMonth}-${thisDay}`;
                }
            } else {
                let conditionValue = searchFields[key].val();
                if (conditionValue !== '') {
                    searchData[key] = conditionValue;
                }
            }
        }
    }
    log('searchData: ', searchData);
    return searchData;
};

let resetSearchData = function() {
    log('main-search.resetSearchData()');
    let searchFields = populateSearchFields();
    for (let key in searchFields) {
        if (searchFields.hasOwnProperty(key) && key !== 'byMonthOption') {
            // log('resetSearchData', key);
            searchFields[key].val('');
        }
    }

    $('.condition-search.orderType select>option:nth-child(1)').prop('selected', 'selected');
    $('.condition-search.tradeStatus select>option:nth-child(1)').prop('selected', 'selected');
    $('select[class="createDay-type"]>option:nth-child(1)').prop('selected', 'selected');
    let byMonthDiv = $('div.createDay-type-byMonth');
    if (byMonthDiv.css('display') === 'none') {
        byMonthDiv.toggle();
        $('.createDay-type-byRange').toggle();
    }
    $('select[class="createDay-type-byMonth"]>option:nth-child(1)').prop('selected', 'selected');
};

let bindAction2SearchFormBtns = function() {
    let searchInputs = $('.base-search-form>.input, .condition-search>.input');
    searchInputs.keypress(function(event) {
        if (event.key === 'Enter') {
            log('main-search.bindAction2SearchFormBtns() by Enter');
            event.target.blur(); // make target lose focus
            event.preventDefault(); // prevent default event
            makePagination4Search(getSearchData());
        }
    });

    // DO NOT use searchInputs.focus(), it will result in dead loop
    $.each(searchInputs, function(index, searchInput) {
        searchInput.focus(function() {
            searchInput.select();
        });
    });

    $('.base-search-form>.button.btn-search').click(function(event) {
        log('main-search.bindAction2SearchFormBtns() by Conditions');
        makePagination4Search(getSearchData());
    });

    $('.base-search-all>.button.btn-all').click(function(event) {
        log('main-search.bindAction2SearchFormBtns() by All');
        resetSearchData();
        makePagination();
    });

    $('.base-search-form>.button.btn-reset').click(function(event) {
        log('main-search.bindAction2SearchFormBtns() by Reset');
        resetSearchData();
    });
};

let bindAction2DateRangeType = function() {
    log('main-search.bindAction2DateRangeType()');
    let dateRangeType = $('select[class="createDay-type"]');
    dateRangeType.change(function(event) {
        $('div.createDay-type-byMonth').toggle(400);
        $('.createDay-type-byRange').toggle(400);
    });
};
