var stock = {}, logger = [];

var adidasRegions = {
    'United States': {
        'countryCode': 'US',
        'domain': 'adidas.com/us',
        'sslEnabled': false,
        'languageCode': 'en_US',
        'mediaDomain': 'http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/en_US/dwbe678954/zoom/',
        'clientStockUrl': 'https://production-us-adidasgroup.demandware.net/s/adidas-US/dw/shop/v15_6/products/',
        'variantStockUrl': 'http://www.adidas.com/on/demandware.store/Sites-adidas-US-Site/en_US/Product-GetVariants',
        'clientIds': [
            'bb1e6193-3c86-481e-a440-0d818af5f3c8'
        ]
    },
    'Canada': {
        'countryCode': 'CA',
        'domain': 'adidas.ca',
        'sslEnabled': false,
        'languageCode': 'en_CA',
        'mediaDomain': 'http://demandware.edgesuite.net/sits_pod20-adidas/dw/image/v2/aaqx_prd/on/demandware.static/-/Sites-adidas-products/default/dwd2af1885/zoom/',
        'clientStockUrl': 'https://production-us-adidasgroup.demandware.net/s/adidas-CA/dw/shop/v15_6/products/',
        'variantStockUrl': 'http://www.adidas.ca/on/demandware.store/Sites-adidas-CA-Site/en_CA/Product-GetVariants',
        'clientIds': [
            '5e396c6-5589-425b-be03-774c21a74702'
        ]
    },
    'Australia / New Zealand': {
        'countryCode': 'AU',
        'countryDomain': 'adidas.com.au',
        'sslEnabled': false,
        'languageCode': 'en_AU',
        'mediaDomain': 'http://demandware.edgesuite.net/sits_pod14-adidas/dw/image/v2/aagl_prd/on/demandware.static/-/Sites-adidas-products/default/dw9c33f40c/zoom/',
        'clientStockUrl': null,
        'variantStockUrl': 'http://www.adidas.com.au/on/demandware.store/Sites-adidas-AU-Site/en_AU/Product-GetVariants',
        'clientIds': [
            '75e396c6-5589-425b-be03-774c21a74702'
        ]
    },
    'Europe / United Kingdom (UK Sizing)': {
        'countryCode': 'GB',
        'domain': 'adidas.co.uk',
        'sslEnabled': false,
        'languageCode': 'en_GB',
        'mediaDomain': 'http://demandware.edgesuite.net/sits_pod14-adidas/dw/image/v2/aagl_prd/on/demandware.static/-/Sites-adidas-products/default/dw61d1f696/zoom/',
        'clientStockUrl': 'http://production.store.adidasgroup.demandware.net/s/adidas-GB/dw/shop/v16_9/products/',
        'variantStockUrl': 'http://www.adidas.nl/on/demandware.store/Sites-adidas-GB-Site/nl_NL/Product-GetVariants',
        'clientIds': [
            '2904a24b-e4b4-4ef7-89a4-2ebd2d175dde'
        ]
    },
    'Europe / United Kingdom (EU Sizing)': {
        'countryCode': 'DE',
        'domain': 'adidas.de',
        'sslEnabled': false,
        'languageCode': 'de_DE',
        'mediaDomain': 'http://demandware.edgesuite.net/sits_pod14-adidas/dw/image/v2/aagl_prd/on/demandware.static/-/Sites-adidas-products/default/dw61d1f696/zoom/',
        'clientStockUrl': 'http://production.store.adidasgroup.demandware.net/s/adidas-DE/dw/shop/v16_9/products/',
        'variantStockUrl': 'http://www.adidas.nl/on/demandware.store/Sites-adidas-DE-Site/de_DE/Product-GetVariants',
        'clientIds': [
            '2904a24b-e4b4-4ef7-89a4-2ebd2d175dde'
        ]
    }
};

function loadRegions() {
    var first = true;
    for (var region in adidasRegions) {
        if (first) {
            $('#clientId').val(adidasRegions[region]['clientIds'][0]);
            first = false;
        }
        $('#stockRegion').append('<option value="' + region + '">' + region + '</>');
    }
}

function setPage(stock, imgSrc) {
    $('#loading').hide();

    $('.stock-levels').html('');

    if (imgSrc != undefined) {
        $('.productImage').attr('src', imgSrc);
    } else {
        $('.productImage').attr('src', '/assets/empy-bg.jpg');
    }

    if (stock.color != null) {
        $('#productColor').html(stock.color);
    } else {
        $('#productColor').html('');
    }

    if (stock.name != undefined) {
        $('#productName').html(stock.name);
    } else {
        $('#productName').html('');
    }

    var s = 0;
    $.each(stock.variants, function (index, value) {
        s += value.stock;

        var klass;
        if (value.stock == 0) {
            klass = 'out-of-stock';
        } else if (value.stock < 4) {
            klass = 'low-stock';
        } else {
            klass = 'in-stock';
        }

        $('.stock-levels').append('<div class="stock-block ' + klass + '">' +
            '<p class="size">' + value.size + '</p>' +
            '<p class="stocking">' + value.stock + '</p>' +
            '<p class="tooltext">stock level</p>' +
            '</div>');
    });

    if (stock.totalStock == 0) {
        $('.totalStock').html('Total stock: ' + s);
    } else {
        $('.totalStock').html('Total stock: ' + stock.totalStock);
    }

    // $('#dump').html(JSON.stringify(stock));
    $('#stock').show();
}

function getJson(url, dataType) {
    var dataType = (dataType == undefined) ? "jsonp" : dataType;
    return $.ajax({
        url: url,
        dataType: dataType,
        timeout: 2000,
        success: function (data) {
            return data;
        },
        error: function () {
            return false;
        }
    })
}

function lookupClient(sku, clientId, adidasRegion) {
    var region = adidasRegions[adidasRegion];
    var url = region.clientStockUrl + '(' + sku + ')?client_id=' + clientId + '&expand=availability,variations,prices';

    $.when(getJson(url)).then(function (gj) {
        if (gj && gj.count > 0) {
            stock = {
                'name': gj.data[0].name,
                'color': gj.data[0].c_color,
                'totalStock': gj.data[0].inventory.ats,
                'variants': {}
            };

            toastr.success('Client stock retrieved');

            $.each(gj.data[0].variants, function (index, value) {
                var productId = value.product_id;
                if (productId.includes("_")) {
                    stock.variants[productId] = {
                        'stock': 0,
                        'size': value.variation_values.size
                    }
                }
            });

            var skus = [];
            for (var sk in stock.variants) {
                skus.push(sk);
            }

            skus = skus.join();
            var variantsUrl = region.clientStockUrl + '(' + skus + ')?client_id=' + clientId + '&expand=availability,variations,prices';

            $.when(getJson(variantsUrl)).then(function (gjv) {
                if (gjv && gjv.count > 0) {
                    $.each(gjv.data, function (index, value) {
                        if (value.id.includes("_")) {
                            stock.variants[value.id] = {
                                'stock': value.inventory.ats
                            }
                        }
                    });

                    toastr.success('Client variants retrieved');

                    $.each(gjv.data[0].variation_attributes[0].values, function (index, value) {
                        var skuId = sku + "_" + value.value;
                        stock.variants[skuId].size = value.name;
                    });

                    var imgSrc = region.mediaDomain + sku + '_01_standard.jpg';
                    setPage(stock, imgSrc);
                } else {
                    toastr.error("Could not retrieve client variants");
                    stock = {};
                }
            });
        } else {
            stock.totalStock = 0;
        }
    });
}

function lookupVariant(sku, clientId, adidasRegion) {
    if (Object.keys(stock).length == 0 || stock.totalStock == 0) {
        var region = adidasRegions[adidasRegion];
        var variantUrl = region.variantStockUrl + '?pid=' + sku;

        toastr.info('Could not retrieve client stock, might be wrong client id.');

        $.when(getJson(variantUrl, "json")).then(function (gj) {
            if (gj) {
                stock = {
                    'name': null,
                    'color': null,
                    'totalStock': 0,
                    'variants': {}
                };

                toastr.success("Retrieved variant stock (Fallback)");

                $.each(gj.variations.variants, function (index, value) {
                    stock.variants[value.id] = {
                        'stock': value.ATS,
                        'size': value.attributes.size
                    }
                });

                var imgSrc = region.mediaDomain + sku + '_01_standard.jpg';
                setPage(stock, imgSrc);
            }
        })
    }
}

function checkIfStock() {
    if (Object.keys(stock).length == 0) {
        toastr.error("Product ID not loaded into Adidas site");
        $('#loading').fadeOut('slow');
        return false
    }

    return true;
}

function setUrl(pid, region, clientId) {
    var region = adidasRegions[region];
    var parameters = '?pid=' + pid + '&region=' + region.countryCode;

    if (clientId != region.clientIds[0]) {
        parameters += '&clientid=' + clientId;
    }

    window.history.pushState('query', pid, parameters);
}

function loadUrl() {
    function gup(name, url) {
        if (!url) url = location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
    }

    var pid = gup('pid', location.href);
    var region = gup('region', location.href);
    var clientid = gup('clientid', location.href);

    if (pid != null && region != null) {
        var adiRegion;
        for (var r in adidasRegions) {
            if (adidasRegions[r].countryCode == region) {
                adiRegion = r;
                $('#stockRegion').val(r);
                if (clientid == null) {
                    $('#clientId').val(adidasRegions[r].clientIds[0]);
                }
                break;
            }
        }

        $('#productId').val(pid);
    }

    if (clientid != null) {
        $('#clientId').val(clientid);
    }
}

function setLastUpdate() {
    var d = new Date();
    $('#lastupdate').html(d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds());
}

function doAutoUpdate() {
    if ($('#productId').val() != "") {
        $('#loading').html('Updating...');
        $('form.st').submit();
        toastr.info("Auto update started");
    }
}

$(function () {
    var autoUpdate = true;
    var initialLoad = false;

    loadRegions();
    loadUrl();

    $("select").change(function () {
        $('#clientId').val(adidasRegions[$('select').val()]['clientIds'][0]);
    });

    $(".au").click(function () {
        if (autoUpdate) {
            $('.no').addClass('active');
            $('.yes').removeClass('active');
        } else {
            $('.yes').addClass('active');
            $('.no').removeClass('active');
        }

        autoUpdate = !autoUpdate;
    });

    $('form.st').submit(function (e) {
        e.preventDefault();

        setUrl($('#productId').val(), $('#stockRegion').val(), $('#clientId').val());
        ga('send', 'event', {
            'eventCategory': 'Stock',
            'eventAction': 'Searched',
            'eventLabel': $('#productId').val()
        });

        $('#loading').fadeIn('slow');
        $('#stock').hide();

        stock = {};
        logger = [];

        // Client Lookup
        if (adidasRegions[$('#stockRegion').val()].clientStockUrl) {
            lookupClient($('#productId').val(), $('#clientId').val(), $('#stockRegion').val());
        }

        // Variant Lookup Fallback
        var variant = function () {
            lookupVariant($('#productId').val(), $('#clientId').val(), $('#stockRegion').val())
        };
        setTimeout(variant, 2121);

        // Check if there is stock retrieved and set update time
        setLastUpdate();
        initialLoad = true;
        setTimeout(checkIfStock, 3500);
    });

    // Every 2 min
    setInterval(function () {
        if (autoUpdate && initialLoad) {
            doAutoUpdate();
        }
    }, 2 * 60 * 1000);

    $('.donate').click(function () {
        var twitterHandle = $('#twitter').val();
        var show = $('#show').is(':checked');
        var ref = twitterHandle + ' ' + show;

        ref = encodeURIComponent(ref);

        var url = 'https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=paypal%40yzy%2eio&lc=US&item_name=YZYIO%20Donation&item_number=' + ref + '&no_note=0&currency_code=EUR&bn=PP%2dDonationsBF%3abtn_donateCC_LG%2egif%3aNonHostedGuest'
        window.open(url);
    });
});
