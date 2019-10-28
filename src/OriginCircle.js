import {Animated,Dimensions} from 'react-native'
import {PanGestureHandler} from 'react-native-gesture-handler'
import React,{Component} from 'react'
const circleRadius = 25;
const windowWidth = Dimensions.get('window').width

class OriginCircle extends Component {
  _touchX = new Animated.Value(windowWidth / 2 - circleRadius);

  _onPanGestureEvent = Animated.event([{nativeEvent: {x: this._touchX}}], { useNativeDriver: true });
  render() {
    return (
      <PanGestureHandler
        onGestureEvent={this._onPanGestureEvent}>
        <Animated.View style={{
          height: 150,
          justifyContent: 'center',
        }}>
          <Animated.View
            style={[{
              backgroundColor: '#42a5f5', borderRadius: circleRadius, height: circleRadius * 2, width: circleRadius * 2,
            }, {
              transform: [{translateX: Animated.add(this._touchX, new Animated.Value(-circleRadius))}]
            }]}
          />
        </Animated.View>
      </PanGestureHandler>
    );
  }
}

export default OriginCircle
