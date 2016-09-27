import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { DateRange } from 'react-date-range';
import { HorizontalBar } from 'react-chartjs-2';

const VotingChart = React.createClass({
    propTypes: {
        barData: PropTypes.array.isRequired,
        selectedId: PropTypes.number
    },

    render() {
        const { barData, selectedId } = this.props;

        const data = {
            labels: barData.map(d => d.x),
            datasets: [{
                label: 'Votes',
                backgroundColor: barData.map(d => d.id === selectedId ?  'tomato' : 'goldenrod'),
                borderColor: 'goldenrod',
                borderWidth: barData.map(d => d.id === selectedId ? 3 : 0),
                hoverBackgroundColor: '#f1bc20',
                data: barData.map(d => d.y)
            }]
        };

        const options = {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        stepSize: 1,
                        suggestedMax: 10
                    }
                }]
            },
            legend: {
                display: false
            }
        };

        return (
            <HorizontalBar data={data}
                           onElementsClick={this.onBarClicked}
                           width={800}
                           height={55 + barData.length*18.4}
                           options={options} />
        )
    }

});

export default VotingChart
