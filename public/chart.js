var ChartPlotter = {
    formatter: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }),

    plot: function(chartData, currency) {
        var parsedData = this.prepareDataForPlotting(chartData);
        var currencyName = DIGITAL_CURRENCIES[currency];
        var ctx = document.getElementById('myChart').getContext('2d');

        new Chart(ctx, {
            type: 'line',

            data: {
                labels: parsedData.labels,
                datasets: [{
                    label: "Market value for " + currencyName,
                    borderColor: 'rgb(255, 99, 132)',
                    data: parsedData.data,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: false,
                            callback: function(value) {                              
                                return ChartPlotter.formatter.format(value);
                            }
                        }
                    }]
                }
            }
        });
    },

    prepareDataForPlotting: function(data) {
        var labels = _.keys(data).reverse();
        var datapoints = [], date;

        for(var i=0; i<labels.length; i++) {
            date = labels[i];
            datapoints.push(data[date]['1a. price (EUR)']);
        }

        return { labels: labels, data: datapoints };
    }
}
