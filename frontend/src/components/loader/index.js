import React from 'react';
import {
  fetchEndpoint
} from '../../service/backend'
import LoadingIndicator from '../loading-indicator';

const noopObj = () => ({})

const loader = (urlFunc, defaultFunc = noopObj) => (Component) => React.createClass({
  getInitialState() {
    return {
      loading: false,
      data: {}
    }
  },
  componentWillMount() {
    const urls = urlFunc(this.props)
    const defaults = defaultFunc(this.props)

    const emptyFetchResults = Object.keys(urls).reduce((acc, key) => {
      acc[key] = defaults[key] || {}
      return acc
    }, {})

    this.setState({
      loading: true,
      data: emptyFetchResults
    })

    const promises = Object.keys(urls).map(key =>
      fetchEndpoint(urls[key])
      .then(json => {
        this.setState({
          data: {
            ...this.state.data,
            [key]: json
          }
        })
      }));

    Promise.all(promises)
      .then(() => {
        this.setState({
          loading: false
        })
      })
      .catch(err => {
        console.error(err);
        this.setState({
          loading: false
        })
      })
  },
  update(key, promise) {
    promise.then((resp) => this.setState({
      data: {
        ...this.state.data,
        [key]: resp
      }
    })).catch(err => {
      console.error('Error in loader: ', err);
    });
  },
  render() {
    const { loading, data } = this.state;

    if(loading) {
      return (
        <LoadingIndicator />
      )
    }

    return (
      <Component {...this.props} {...data} loading={loading} update={this.update} />
    )
  }
})


export default loader
