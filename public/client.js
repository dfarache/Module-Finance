COBI.init('any token');
COBI.devkit.overrideThumbControllerMapping.write(true);

const PHYSICAL_CURRENCY = 'USD';
const MAXIMUM_SELECTED_CURRENCIES = 4;
const FIVE_MINUTES = 5 * 60 * 1000;
const DIGITAL_CURRENCIES = {
    BTC: 'Bitcoin',
    ELIX: 'Elixir',
    ENG: 'Enigma',
    ETH: 'Ethereum',
    GAM: 'Gambit',
    LTC: 'Litecoin',
    MINT: 'Mintcoin',
    MITH: 'Mithril'
}

// init module variables
var mainContainer = $('#main');
var apiData;
var reloadDataInterval;
var currentIndex = 0;
var selectedCurrencies = (localStorage['cobi-finance-currencies'] == null)
      ? ['BTC', 'ETH', 'LTC']
      : localStorage['cobi-finance-currencies'];

function getState() {
    return COBI.parameters.state();
}

function loadExperienceState() {
    mainContainer.load('templates/experience.html', function() {
        getChartData();
        setReloadDataInterval();
        subscribeToHandlebarActions();
    });
}

function loadOverviewState() {
    if(reloadDataInterval != null) {
        clearInterval(reloadDataInterval);
    }

    mainContainer.load('templates/overview.html', function() {
        loadSelectableCurrencies();
    });
}

function getChartData() {
    var qs = '?currencies=' + selectedCurrencies.join(',');

    $.get('api/stock' + qs, function(stockData) {
        apiData = stockData;
        plotLineChart();
    });
}

function setReloadDataInterval() {
    reloadDataInterval = setInterval(function() {
        getChartData();
    }, FIVE_MINUTES)
}

function plotLineChart() {
    var currency = selectedCurrencies[ currentIndex ];
    var chartData = apiData[currency]['Time Series (Digital Currency Intraday)'];

    if(chartData != null) {
        ChartPlotter.plot(chartData, currency);
    } else {
        mainContainer.load('templates/experience_nodata.html');
    }
}

function subscribeToHandlebarActions() {
    COBI.hub.externalInterfaceAction.subscribe(function(action) {
        switch(action) {
            case 'UP':
                currentIndex = (currentIndex < selectedCurrencies.length - 1)
                    ? currentIndex + 1
                    : 0;
                break;
            case 'DOWN':
                currentIndex = (currentIndex === 0)
                    ? selectedCurrencies.length - 1
                    : currentIndex - 1;
                break;
        }

        plotLineChart();
    });
}

function loadSelectableCurrencies() {
   var elem = $('#selectable-currencies-list');
   var currenciesList = Object.keys( DIGITAL_CURRENCIES );
   var currAbrv, curr, html, appendedCheckbox;

   for(var i=0; i<currenciesList.length; i++) {
      currAbrv = currenciesList[i];
      curr = DIGITAL_CURRENCIES[ currenciesList[i] ];

      html = '<li class="table-view-cell">';
      html += curr;
      html += '<label class="toggle">';
      html += '<input type="checkbox" data-cobi-currency="' + currAbrv + '">';
      html += '<div class="slider-circle round"></div></label>';
      html += '</li>';

      elem.append(html);

      if(selectedCurrencies.indexOf(currAbrv) > -1) {
          appendedCheckbox = $("ul").find("[data-cobi-currency='" + currAbrv + "']");
          appendedCheckbox.attr('checked', 'checked');
      }
   }
}

(function onInit() {
    var state = getState();

    switch(state) {
        case COBI.state.overview:
            return loadOverviewState();
        case COBI.state.experience:
            return loadExperienceState();
    }
})()
