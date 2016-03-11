/**
 * @providesModule Vimeo
 * @flow
 */
import React from 'react-native';
const {
  StyleSheet,
  PropTypes
} = React;
import WebViewBridge from 'react-native-webview-bridge';


function getVimeoPageURL(videoId) {
  return 'https://myagi.github.io/react-native-vimeo/?vid=' + videoId;
}


export default class Vimeo extends React.Component {

  static propTypes = {
    videoId: PropTypes.string.isRequired,
    onReady: PropTypes.func,
    onPlay: PropTypes.func,
    onPlayProgress: PropTypes.func,
    onPause: PropTypes.func,
    onFinish: PropTypes.func
  }

  constructor() {
    super();
    this.handlers = {};
    this.state = {
      ready: false
    };
  }

  componentDidMount() {
    this.registerHandlers();
  }

  componentWillReceiveProps() {
    this.registerHandlers();
  }

  api(method, cb) {
    if (!this.state.ready) {
      throw new Error('You cannot use the `api` method until `onReady` has been called');
    }
    this.refs.webviewBridge.sendToBridge(method);
    this.registerBridgeEventHandler(method, cb);
  }

  registerHandlers() {
    this.registerBridgeEventHandler('ready', this.onReady);
    this.registerBridgeEventHandler('play', this.props.onPlay);
    this.registerBridgeEventHandler('playProgress', this.props.onPlayProgress);
    this.registerBridgeEventHandler('pause', this.props.onPause);
    this.registerBridgeEventHandler('finish', this.props.onFinish);
  }

  registerBridgeEventHandler(eventName, handler) {
    this.handlers[eventName] = handler;
  }

  onBridgeMessage = (message) => {
    let payload;
    try {
      payload = JSON.parse(message);
    } catch (err) {
      return;
    }
    let handler = this.handlers[payload.name];
    if (handler) handler(payload.data);
  }

  onReady = () => {
    this.setState({ready: true});
    if (this.props.onReady) this.props.onReady();
  }

  render() {
    return (
      <WebViewBridge
        ref='webviewBridge'
        style={{
          // Accounts for player border
          margin: -4,
          height: this.props.height
        }}
        source={{uri: getVimeoPageURL(this.props.videoId)}}
        scalesPageToFit={true}
        scrollEnabled={false}
        onBridgeMessage={this.onBridgeMessage}
        onError={(error)=> console.error(error)}
      />
    );
  }

}
