import React, { Component } from "react";
import { every, map, extend } from "lodash";
import Loader from "../Loader";

const withLoader = mapOfActionsAndIds => {
  return DecoratedComponent =>
    class CheckLoadedDecorator extends Component {
      constructor(props) {
        super(props);
        this.state = {
          loading: true,
          props: {},
          error: false,
          firstTry: true,
          nbrTries: 0
        };
      }

      componentWillMount() {
        this.checkAndUpdateProps({}, this.props);
      }

      componentWillReceiveProps(nextProps) {
        this.checkAndUpdateProps(this.props, nextProps);
      }

      checkAndUpdateProps = (oldProps, props) => {
        const maxTries = Object.keys(mapOfActionsAndIds).length + 10;
        if (this.state.error) {
          return;
        }

        const allDone = every(mapOfActionsAndIds, ([propId, action], prop) => {
          const model = props[prop];
          const modelId = props[propId];

          if (model.error && !this.state.firstTry) {
            this.setState({ error: true });
            return false;
          }

          if (model.data) {
            return true;
          }
          if (model.loading) {
            return false;
          }

          if (modelId) {
            props.dispatch(action(modelId));
          }

          if (
            this.state.loading &&
            this.state.nbrTries >= maxTries &&
            this.state.nbrTries > 0
          ) {
            console.warn(propId + " never getting set");
            this.setState({
              error: true
            });
          }

          return false;
        });

        if (allDone) {
          const objectList = map(mapOfActionsAndIds, ([propId], prop) => ({
            [prop]: props[prop].data
          }));

          const mappedProps = extend({}, ...objectList);

          this.setState({
            props: mappedProps,
            firstTry: false,
            loading: false,
            nbrTries: this.state.nbrTries + 1
          });
        } else {
          this.setState({
            firstTry: false,
            loading: true,
            nbrTries: this.state.nbrTries + 1
          });
        }
      };

      render() {
        if (this.state.error) {
          return <div>Misslyckades att ladda</div>;
        } else if (this.state.loading) {
          return <div><Loader size={70} color="maroon" /></div>;
        } else {
          return <DecoratedComponent {...this.props} {...this.state.props} />;
        }
      }
    };
};

export default withLoader;
