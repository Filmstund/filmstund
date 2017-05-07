import React, { Component } from "react";
import _ from "lodash";

const withLoader = (mapOfActionsAndIds) => {

  return DecoratedComponent =>
      class CheckLoadedDecorator extends Component {
        constructor(props) {
            super(props);
            this.state = { loading: true, props: {}, error: false, firstTry: true, nbrTries: 0 }
        }

        componentWillMount() {
            this.checkAndUpdateProps({}, this.props)
        }

        componentWillReceiveProps(nextProps) {
            this.checkAndUpdateProps(this.props, nextProps)
        }

        checkAndUpdateProps = (oldProps, props) =>  {
            const maxTries = Object.keys(mapOfActionsAndIds).length
            if (this.state.error || this.state.nbrTries > maxTries) {
                return;
            }
            // console.log(oldProps, props, oldProps === props);
            // debugger;

            const allDone = _.every(mapOfActionsAndIds, ([propId, action], prop) => {
                const model = props[prop]
                const modelId = props[propId]

                if (model.error && !this.state.firstTry) {
                    this.setState({ error: true })
                    return false;
                }

                console.log("model", model);

                if (model.data) {
                    return true;
                }
                if (model.loading) {
                    return false
                }

                if (modelId) {
                    props.dispatch(action(modelId))
                }

                if (this.state.nbrTries >= maxTries) {
                    console.warn(propId + " never getting set");
                    this.setState({
                        error: true
                    })
                }

                return false
            })

            console.log('allDone', allDone);

            if (allDone) {
                const objectList = _.map(mapOfActionsAndIds, ([propId, ], prop) => ({ [prop]: props[prop].data }))

                const mappedProps = _.extend({}, ...objectList)

                this.setState({
                    props: mappedProps,
                    firstTry: false,
                    loading: false,
                    nbrTries: this.state.nbrTries + 1
                })
            } else {
                this.setState({
                    firstTry: false,
                    loading: true,
                    nbrTries: this.state.nbrTries + 1
                })
            }

        }

        render() {
            console.log(this.state.loading);
            if (this.state.error) {
                return <div>Misslyckades att ladda</div>
            } else if (this.state.loading) {
                return <div>Hämtar data...</div>
            } else {
                return <DecoratedComponent {...this.props} {...this.state.props} />
            }
        }
    }
  }

export default withLoader