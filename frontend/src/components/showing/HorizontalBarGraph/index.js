import React from 'react';
import { VictoryChart, VictoryBar, VictoryAxis} from "victory";

//import styles from './style.css'

const HorizontalBarGraph = React.createClass({
  getInitialState() {
    return {
      data: []
    }
  },

  componentDidMount() {
    const labelsWithZeroedData = this.props.data.map((data) => ({

        x: data.x,
        y: 0,
        id: data.id
      })
    );
    this.setState({data: labelsWithZeroedData});
    setTimeout(() => {
      this.setState({ data: this.props.data });
    }, 1000)
  },

  componentWillReceiveProps(props) {
    setTimeout(() => {
      this.setState({ data: props.data });
    }, 1000)
  },

  render() {
    const maxValue = _.maxBy(this.props.data, 'y').y;
    
    return (
      <div style={{
                width: 500,
              }}>
        <VictoryChart width={600}
                      domainPadding={{x: 30, y:30}}
                      padding={{
                              top: 75,
                              bottom: 40,
                              left: 100,
                              right: 40
                            }}>
        <VictoryAxis domain={[0,10]}
                       tickFormat={(x) => parseInt(x,10)} />
          <VictoryAxis dependentAxis/>
          <VictoryBar horizontal
                      height={600}
                      style={{
                            data: {
                              width: 40,
                              margin: 0,
                              padding: 0
                            }
                          }}
                      animate={{
                            duration: 700,
                            onEnter: {
                              duration: 1000,
                              before: (qwe) => {
                                console.log('asd',qwe);

                                return ({y: 0, fill: 'tomato'});
                              },
                              after: (data) => {
                                console.log(data);
                                console.log("wat");
                                return ({fill: data.y === maxValue? 'goldenrod' : 'tomato'})
                              }
                            }
                          }}
                      data={this.state.data} />
        </VictoryChart>
      </div>
    )
  }
});

export default HorizontalBarGraph
