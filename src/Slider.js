import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated,Easing} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const indicatorWidth = 15;
const barHeight = 2;
const balloonWidth = 50;

class Slider extends Component {

  state = {
    currentValue: 0,// indicates position of indicator in points
    previousValue: 0,
    moving: false,
    barWidth: undefined,
    barStartX: undefined,
    velocityX: 0,
    balloonOffset: new Animated.Value(0),
  };

  rotateDeg = new Animated.Value(45)
  balloonOffset = new Animated.Value(0)

  swipeHandler = (event) => {
    const xChange = event.nativeEvent.translationX;
    const velocityX = event.nativeEvent.velocityX;
    const {previousValue, barWidth} = this.state;
    // console.log('xChange',xChange)
    // console.log('velocity',velocityX)

    const newValue = previousValue + xChange;
    this.setState({
      currentValue: newValue < 0 ? 0 : newValue > barWidth ? barWidth : newValue,
      velocityX,
    });

    Animated.parallel([
      Animated.timing(
        this.rotateDeg,
        {
          duration:1000,
          toValue:xChange > 0 ? 25 : 65,
          useNativeDriver:true
        }),
      Animated.timing(
        this.balloonOffset,
        {
          duration:1000,
          toValue:xChange > 0 ? 25 : -25,
          useNativeDriver:true
        })
    ]).start()
  };

  handleStateChange = ({nativeEvent}) => {
    if (nativeEvent.state === State.END) {
      this.setState({previousValue: this.state.currentValue});
    }
  };

  measureLayout = (event) => {
    console.log('eve', event.nativeEvent);
    this.setState({
      barWidth: event.nativeEvent.layout.width,
      // barStartX:event.nativeEvent.layout.width,
    });
  };

  get currentValueToPercentage() {

    const {currentValue, barWidth} = this.state;
    return Math.ceil(currentValue / barWidth * 100);
  }

  render() {
    const {currentValue, barWidth} = this.state;

    const rotate = this.rotateDeg.interpolate({
      inputRange:[35,45],
      outputRange:['35deg','45deg']
    })
    // const ballon = this.balloonOffset.setValue(0)
    // const balloonOff =
    // console.log('DEG', rotateDeg);
    console.log('currentValue - this.balloonOffset', currentValue - this.balloonOffset);
    console.log('this.balloonOffset', this.balloonOffset);
    console.log('currentValue', currentValue );
    return (
      <View style={styles.wrapper}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <View style={{width: '70%'}}>
            <Animated.View style={styles.balloon({
              'translateX': Animated.subtract(currentValue,this.balloonOffset),
              'rotate':rotate,
            })}/>
            <View onLayout={this.measureLayout} style={styles.barEmpty}/>
            <View style={[styles.barFill, {
              width: `${this.currentValueToPercentage}%`,
              maxWidth: barWidth,
            },
            ]}/>
            <PanGestureHandler
              onGestureEvent={this.swipeHandler}
              onHandlerStateChange={this.handleStateChange}
            >
              <View style={[styles.indicator(currentValue)]}/>
            </PanGestureHandler>
          </View>
        </View>

        <Text style={{alignSelf: 'center'}}>{`${this.currentValueToPercentage}`}</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  balloon: ({translateX,rotate}) => ({
    width: balloonWidth,
    aspectRatio: 1,
    backgroundColor: '#4A26EC',
    alignSelf: 'flex-start',
    marginBottom: 18,
    marginStart: -balloonWidth / 2,
    borderTopStartRadius: balloonWidth / 2,
    borderTopEndRadius: balloonWidth / 2,
    borderBottomStartRadius: balloonWidth / 2,
    transform:[{translateX},{rotate}]
  }),
  indicator: (translateX) => ({
    width: indicatorWidth,
    top: -indicatorWidth / 2 - barHeight,
    aspectRatio: 1,
    borderRadius: indicatorWidth / 2,
    marginStart: -indicatorWidth / 2,
    backgroundColor: '#4A26EC',
    transform: [{translateX}],
  }),
  barFill: {
    height: barHeight,
    backgroundColor: '#4A26EC',
    top: -barHeight,
  },
  barEmpty: {
    width: '100%',
    height: barHeight,
    backgroundColor: '#dadada',
  },
});
export default Slider;
