
let makeMainOrdersList = function(orderData, funcArgs={}) {
    log(`main-orders.makeMainOrdersList() with orderData.length: ${orderData.length}`);
    let mainOrdersList = $('<div class="main-orders-list"></div>');
    mainOrdersList.empty();
    $.each(orderData, function(index, mainOrderData) {
        let createDay = mainOrderData.orderInfo.createDay;
        let mainOrderId = mainOrderData.id;
        let orderStatus = mainOrderData.statusInfo.text;

        let results = makeSubOrders(mainOrderData, createDay, mainOrderId, mainOrderData.payInfo, orderStatus, funcArgs);
        let subOrders = results[0];
        funcArgs.hasHiddenSubOrder = results[1];
        let orderTopic = makeOrderTopic(mainOrderData, createDay, mainOrderId, mainOrderData.seller, funcArgs);

        // mainOrderId will be auto-changed to mainorderid
        let mainOrder = `
        <div class="main-order" data-mainorderid="${mainOrderId}">
            ${orderTopic}
            ${subOrders.get(0).outerHTML}
        </div>`;
        mainOrdersList.append($(mainOrder));
    });
    return mainOrdersList;
};

let makeOrderTopic = function(mainOrderData, createDay, mainOrderId, seller, funcArgs={}) {
    log(`main-orders.makeOrderTopic() with [orderId: ${mainOrderId}, createDay: ${createDay}]`);
    let orderOperations = mainOrderData.statusInfo.operations;
    let orderTopicRight = $('<div class="order-topic-right"></div>');
    $.each(orderOperations, function(i, operation) {
        if (operation.id === 'viewDetail' || operation.id === 'viewLogistic') {
            let opSpan = `
            <span>
                <a href="${operation.url}" target="_blank" rel="noopener noreferrer">${operation.text}</a>
            </span>`;
            orderTopicRight.append($(opSpan));
        }
    });

    let orderTopicHiddenInner = '';
    if (funcArgs.hasHiddenSubOrder) {
        orderTopicHiddenInner = `
            <span class="order-topic-hidden-ext">展开隐藏</span>
            <span class="order-topic-hidden-ext is-off">收起隐藏</span>
            <span class="order-topic-icon">
                <i class="fas fa-angle-down"></i>
            </span>
            <span class="order-topic-icon is-off">
                <i class="fas fa-angle-up"></i>
            </span>
        `;
    }

    return `
        <div class="order-topic">
            <div class="order-topic-left">
                <span>${createDay}</span>
                <span>(${mainOrderId})</span>
                <span><a href="${seller.shopUrl}" target="_blank">${seller.shopName}</a></span>
            </div>
            <div class="order-topic-hidden">${orderTopicHiddenInner}</div>
            ${orderTopicRight.get(0).outerHTML}
        </div>
    `;
};

let makeSubOrders = function(mainOrderData, createDay, mainOrderId, payInfo, orderStatus, funcArgs={}) {
    log(`main-orders.makeSubOrders() with [orderId: ${mainOrderId}, createDay: ${createDay}]`);
    let subOrders = $('<div class="sub-orders"></div>');

    let subOrdersList = $('<div class="sub-orders-list"></div>');
    subOrders.append(subOrdersList);

    let subOrdersTotal = $('<div class="sub-orders-total"></div>');
    subOrders.append(subOrdersTotal);
    let payInfoObject;
    if ('postType' in payInfo) { // '虚拟物品'
        payInfoObject = $(`<div class="total-price">
            <span>总价: ${payInfo.actualFee}</span><br />
            <span>${payInfo.postType}</span><br />
            <span>${orderStatus}</span>
        </div>`)
    } else if ('postFees' in payInfo) {
        let postFees = mainOrderData.payInfo.postFees[0];
        payInfoObject = $(`<div class="total-price">
            <span>总价: ${payInfo.actualFee}</span><br />
            <span>${postFees.prefix}${postFees.value}${postFees.suffix}</span><br />
            <span>${orderStatus}</span>
        </div>`)
    }
    subOrdersTotal.append(payInfoObject);

    let hasHiddenSubOrder = false;
    $.each(mainOrderData.subOrders, function(index, subOrderData) {
        let subOrderId = subOrderData.id;
        let itemInfo = subOrderData.itemInfo;
        let itemId = itemInfo.id;
        let itemTitle = itemInfo.title;

        let subOrderImg = '';
        let itemPic = itemInfo.pic;
        let imgSrc = `${createDay.split('-')[0]}/${createDay}`;
        if (itemPic !== '') { // if not '增值服务' or '保险服务'
            itemPic = itemPic.substr(0, itemPic.indexOf('_80x80')); // remove thumbnail
            let itemPicExt = itemPic.substr(itemPic.lastIndexOf('\.'), itemPic.length);

            if (mainOrderId === subOrderId) {
                subOrderImg = `<img src="//localhost:4000/item-images/${imgSrc}_${mainOrderId}_${itemId}${itemPicExt}">`;
            } else {
                subOrderImg = `<img src="//localhost:4000/item-images/${imgSrc}_${mainOrderId}_${subOrderId}_${itemId}${itemPicExt}">`;
            }
        }

        let unitPrice = subOrderData.priceInfo.realTotal;
        let quantity = subOrderData.quantity;

        let itemNamePrefix = '<div class="item-name">';
        let itemCostPrefix = '<div class="item-cost">';
        if (itemPic === '') {
            itemNamePrefix = '<div class="item-name shrink">';
            itemCostPrefix = '<div class="item-cost shrink">';
        }

        // subOrderId will auto-changed to suborderid
        // https://www.designcise.com/web/tutorial/how-to-check-if-a-string-contains-another-substring-in-javascript
        let subOrderPrefix = '<div class="sub-order" data-suborderid="${subOrderId}">';
        if (funcArgs.itemName !== undefined) {
            if (itemTitle.search(new RegExp(funcArgs.itemName, 'i')) === -1) {
                hasHiddenSubOrder = true;
                subOrderPrefix = '<div class="sub-order is-off" data-suborderid="${subOrderId}">';
            }
        }

        if (funcArgs.itemName_t !== undefined && hasHiddenSubOrder) {
            if (itemTitle.search(new RegExp(funcArgs.itemName_t, 'i')) !== -1) {
                hasHiddenSubOrder = false;
                subOrderPrefix = '<div class="sub-order" data-suborderid="${subOrderId}">';
            }
        }

        let subOrder = `
        ${subOrderPrefix}
            <div class="sub-order-left">
                <div class="img-content">
                    ${subOrderImg}
                </div>
                <div class="img-modal-container is-off">
                    <div class="img-modal">
                        <div class="img-modal-background"></div>
                        <div class="img-modal-content">
                            ${subOrderImg}
                        </div>
                    </div>
                </div>
            </div>
            <div class="sub-order-right">
                ${itemNamePrefix}
                    <a href="${itemInfo.itemUrl}" target="_blank" rel="noreferrer">
                        <span>${itemTitle}</span>
                    </a>
                </div>
                ${itemCostPrefix}
                    <span>单价: ${unitPrice}</span>
                    <span>数量: ${quantity}</span>
                </div>
            </div>
        </div>`;
        subOrdersList.append($(subOrder));
    });
    return [subOrders, hasHiddenSubOrder];
};

let toggleImgModel = function() {
    log('main-orders.toggleImgModel()');
    let imgContents = $('.img-content');
    let imgModalBackgrounds = $('.img-modal-background');
    let subOrders = imgContents.closest('.sub-order');
    $.each(imgContents, function(index, imgContent) {
        $(imgContent).click(function() {
            subOrders.eq(index).find('.img-modal-container').toggleClass('is-off');
        });
    });

    $.each(imgModalBackgrounds, function(index, imgModalBackground) {
        $(imgModalBackground).click(function() {
            subOrders.eq(index).find('.img-modal-container').toggleClass('is-off');
        });
    });
};

let toggleHiddenSubOrders = function() {
    log('main-orders.toggleHiddenSubOrders()');
    let orderTopicHiddens = $('.order-topic-hidden');
    let mainOrders = orderTopicHiddens.closest('.main-order');
    $.each(orderTopicHiddens, function(index, orderTopicHidden) {
        let subOrdersOff = mainOrders.eq(index).find('.sub-order.is-off');
        let orderTopicHiddenJq = $(orderTopicHidden);
        orderTopicHiddenJq.click(function(event) {
            subOrdersOff.toggleClass('is-off');
            orderTopicHiddenJq.find('.order-topic-hidden-ext').toggleClass('is-off');
            orderTopicHiddenJq.find('.order-topic-icon').toggleClass('is-off');
        });
    });
};

let getMainOrdersByPage = function(pageNo) {
    log(`main-orders.requestMainOrdersJson() with pageNo: ${pageNo}`);
    $.ajax({
        url: `/order/byPage?pageNo=${pageNo}&ordersPerPage=${ordersPerPage}&createDaySort=${createDaySort}`,
        method: 'GET',
        success: function(response) {
            let mainOrdersList = makeMainOrdersList(JSON.parse(response));
            $('.main-orders-container').append(mainOrdersList);
            toggleImgModel();
        },
    });
};

let getMainOrdersByConditions = function(pageNo, searchData) {
    log(`main-orders.getMainOrdersByConditions() with [searchData: ${JSON.stringify(searchData)}, pageNo: ${pageNo}]`);
    let itemName = searchData.itemName;
    $.ajax({
        url: `/toolbox/hanZS2T?hanZ=${itemName}`,
        method: 'GET',
        success: function(response) {
            let itemName_t = response;
            $.ajax({
                url: `/order/byConditions`,
                method: 'POST',
                data: JSON.stringify(searchData),
                contentType: 'application/json; charset=UTF-8',
                success: function(response) {
                    // log(response);
                    let funcArgs = {
                        itemName: itemName,
                        itemName_t: itemName_t,
                    };
                    let mainOrdersList = makeMainOrdersList(JSON.parse(response), funcArgs);
                    $('.main-orders-container').append(mainOrdersList);
                    toggleImgModel();
                    toggleHiddenSubOrders();
                },
            });
        },
    });
};
