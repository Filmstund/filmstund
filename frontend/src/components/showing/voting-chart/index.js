import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { DateRange } from 'react-date-range';
import { HorizontalBar } from 'react-chartjs-2';

import format from '../formatter';

const VotingChart = React.createClass({
    propTypes: {
        timeSlots: PropTypes.array.isRequired,
        selectedId: PropTypes.number
    },

    render() {
        const { timeSlots, selectedId } = this.props;

        const barData = timeSlots.filter(ts => ts.users.length > 0).map((ts) => ({
            x: format(ts.start_time, ts.is_3d, ts.is_vip),
            y: ts.users.length,
            id: ts.id
        }));


        const data = {
            labels: barData.map(d => d.x),
            datasets: [{
                label: 'Röster',
                backgroundColor: barData.map(d => d.id === selectedId ? 'goldenrod' : '#712'),
                hoverBackgroundColor: barData.map(d => d.id === selectedId ? '#f0d000' : '#934'),
                data: barData.map(d => d.y)
            }]
        };

        const options = {
            maintainAspectRatio: false,
            responsive: false,
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

        const height = 55 + timeSlots.length*18.4;

        return (
            <HorizontalBar data={data}
                           redraw={true}
                           width={800}
                           height={height}
                           options={options} />
        )
    }

});

export default VotingChart
