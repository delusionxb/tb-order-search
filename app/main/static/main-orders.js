
/*
* '"id": 186976731715044074' needs to convert to '"id": "186976731715044074"'
* because 186976731715044074 is beyond max value of float type
*
* try 186976731715044074 + '' in console, will have "186976731715044060"
*
* to wrap id string with double quotes:
* for json in `ls *json`; do
*   gsed -i 's/"id":\ \([0-9]*\)/"id":\ "\1"/' ${json}
*   gsed -i 's/"""/"/' ${json}
* done
*
* if a string is numeric
* https://stackoverflow.com/questions/175739/is-there-a-built-in-way-in-javascript-to-check-if-a-string-is-a-valid-number
*
* */


let mainOrderContainer;
let four04Images;
let makeMainOrdersList = function(orderData, funcArgs={}) {
    log(`main-orders.makeMainOrdersList() with orderData.length: ${orderData.length}`);
    let mainOrdersList = $('<div class="main-orders-list"></div>');

    if (orderData.length === 0) {
        let noResults = `
            <div class="no-results">
                <span>No result found, please try other search conditions.</span>
            </div>
        `;
        mainOrdersList.append($(noResults));
    }

    $.each(orderData, function(index, mainOrderData) {
        let createDay = mainOrderData.orderInfo.createDay;
        let mainOrderId = mainOrderData.id;
        let orderStatus = mainOrderData.statusInfo.text;

        let subOrders = makeSubOrders(mainOrderData, createDay, mainOrderId, mainOrderData.payInfo, orderStatus, funcArgs);
        funcArgs.hasHiddenSubOrder = subOrders.get(0).outerHTML.search(new RegExp('div class="sub-order is-off"')) !== -1;
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
                </span>
            `;
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

let makePayInfo = function(payInfo, orderStatus) {
    let payInfoObject;
    if ('postType' in payInfo) { // '虚拟物品'
        payInfoObject = $(`<div class="total-price">
            <span>总价: ${payInfo.actualFee}</span><br />
            <span>${payInfo.postType}</span><br />
            <span>${orderStatus}</span>
        </div>`)
    } else if ('postFees' in payInfo) {
        let postFees = payInfo.postFees[0];
        payInfoObject = $(`<div class="total-price">
            <span>总价: ${payInfo.actualFee}</span><br />
            <span>${postFees.prefix}${postFees.value}${postFees.suffix}</span><br />
            <span>${orderStatus}</span>
        </div>`)
    }
    return payInfoObject;
};

let makeSubOrderImg = function(mainOrderId, subOrderId, itemId, createDay, itemPic, realTotal) {
    let subOrderImg = '';
    // let itemPic = itemInfo.pic;
    if ((itemPic === '' || itemPic.includes('nopic.gif') && realTotal === '0.00')) { // itemPic is '' when '增值服务' or '保险服务'
        return null;
    } else {
        let itemImgFile;
        if (mainOrderId === subOrderId) {
            itemImgFile = `${createDay}_${mainOrderId}_${itemId}.jpg`;
        } else {
            itemImgFile = `${createDay}_${mainOrderId}_${subOrderId}_${itemId}.jpg`;
        }

        if (four04Images.includes(itemImgFile+'.404')) {
            subOrderImg = `<img src="../static/404-not-found.jpg">`;
        } else {
            subOrderImg = `<img src="//localhost:7776/item-images/${createDay.split('-')[0]}/${itemImgFile}">`;
        }
        return subOrderImg;
    }
};

let makeSubOrderLeft = function(subOrderImg) {
    let subOrderLeft;
    if (!subOrderImg) {
        subOrderLeft = `<div class="sub-order-left"></div>`;
    } else {
        subOrderLeft = `
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
        `;
    }
    return subOrderLeft;
};

let makeSubOrderRight = function(subOrderImg, itemInfo, unitPrice, quantity) {
    let itemExtraInfo = '';
    if (itemInfo.skuText.length !== 0) {
        $.each(itemInfo.skuText, function(index, skuText) {
            itemExtraInfo += `<span>${skuText.name}: ${skuText.value}</span>`;
        });
    }

    let itemExtraHtml = `
        <div class="item-extra">
            ${itemExtraInfo}
        </div>
    `;

    let itemNamePrefix, itemCostPrefix;
    if (subOrderImg) {
        itemNamePrefix = '<div class="item-name">';
        itemCostPrefix = '<div class="item-cost">';
    } else {
        itemNamePrefix = '<div class="item-name shrink">';
        itemCostPrefix = '<div class="item-cost shrink">';
    }

    let itemNameHtml = `
        ${itemNamePrefix}
            <a href="${itemInfo.itemUrl}" target="_blank" rel="noreferrer">
                <span>${itemInfo.title}</span>
            </a>
        </div>
    `;

    let itemCostHtml = `
        ${itemCostPrefix}
            <span>单价: ${unitPrice}</span>
            <span>数量: ${quantity}</span>
        </div>
    `;

    return `
        <div class="sub-order-right">
            ${itemNameHtml}
            ${itemExtraHtml}
            ${itemCostHtml}
        </div>
    `;
};

let makeSubOrders = function(mainOrderData, createDay, mainOrderId, payInfo, orderStatus, funcArgs={}) {
    log(`main-orders.makeSubOrders() with [orderId: ${mainOrderId}, createDay: ${createDay}]`);
    let subOrders = $('<div class="sub-orders"></div>');
    let subOrdersList = $('<div class="sub-orders-list"></div>');
    let subOrdersTotal = $('<div class="sub-orders-total"></div>');

    subOrders.append(subOrdersList);
    subOrders.append(subOrdersTotal);
    subOrdersTotal.append(makePayInfo(payInfo, orderStatus));

    $.each(mainOrderData.subOrders, function(index, subOrderData) {
        let subOrderId = subOrderData.id;
        let itemInfo = subOrderData.itemInfo;
        let itemId = itemInfo.id;
        let itemTitle = itemInfo.title;

        let unitPrice = subOrderData.priceInfo.realTotal;
        let quantity = subOrderData.quantity;
        let subOrderImg = makeSubOrderImg(mainOrderId, subOrderId, itemId, createDay, itemInfo.pic, unitPrice);

        // subOrderId will auto-changed to suborderid
        // https://www.designcise.com/web/tutorial/how-to-check-if-a-string-contains-another-substring-in-javascript
        let subOrder = $(`<div class="sub-order" data-suborderid="${subOrderId}"></div>`);
        if (isNaN(funcArgs.itemName)) { // if not order ID
            if (funcArgs.itemName !== undefined) {
                if (itemTitle.search(new RegExp(funcArgs.itemName, 'i')) === -1) {
                    subOrder = $(`<div class="sub-order is-off" data-suborderid="${subOrderId}"></div>`);
                }
            }

            if (funcArgs.itemName_t !== funcArgs.itemName) {
                if (itemTitle.search(new RegExp(funcArgs.itemName_t, 'i')) !== -1) {
                    subOrder = $(`<div class="sub-order" data-suborderid="${subOrderId}"></div>`);
                }
            }
        }

        let subOrderLeft = makeSubOrderLeft(subOrderImg);
        let subOrderRight = makeSubOrderRight(subOrderImg, itemInfo, unitPrice, quantity);
        subOrder.append($(subOrderLeft));
        subOrder.append($(subOrderRight));
        subOrdersList.append($(subOrder));
    });
    return subOrders;
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
            if (mainOrderContainer === undefined) {
                mainOrderContainer = $('.main-orders-container');
            }
            $('.main-orders-list').remove();
            let responseObj = JSON.parse(response);
            four04Images = responseObj['404_images'];
            let mainOrdersList = makeMainOrdersList(responseObj.mainOrders);
            mainOrderContainer.append(mainOrdersList);
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

                    $('.main-orders-list').remove();
                    let responseObj = JSON.parse(response);
                    four04Images = responseObj['404_images'];
                    let mainOrdersList = makeMainOrdersList(responseObj.mainOrders, funcArgs);
                    mainOrderContainer.append(mainOrdersList);
                    toggleImgModel();
                    toggleHiddenSubOrders();
                },
            });
        },
    });
};
