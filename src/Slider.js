import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const indicatorWidth = 15;
const barHeight = 2;
const balloonWidth = 50;
const Directions = {
  RIGHT: 'right',
  LEFT: 'left',
};

class Slider extends Component {

  state = {
    currentValue: 0,// indicates position of indicator in points
    previousValue: 0,
    moving: false,
    barWidth: undefined,
    barStartX: undefined,
    velocityX: 0,
    balloonOffset: new Animated.Value(0),
    direction: undefined,
    balloonWidth: balloonWidth,
  };

  rotateDeg = new Animated.Value(45);
  balloonOffset = new Animated.Value(0);

  swipeHandler = (event) => {
    const {previousValue, barWidth, currentValue, direction, moving} = this.state;

    const deltaX = event.nativeEvent.translationX;
    const velocityX = event.nativeEvent.velocityX;
    const newValue = previousValue + deltaX;
    const newDirection = newValue > currentValue ? Directions.RIGHT : Directions.LEFT;


    if (deltaX === 0) {
      return;
    }

    this.setState({
      currentValue: newValue < 0 ? 0 : newValue > barWidth ? barWidth : newValue,
      velocityX,
      direction: newDirection,
      balloonWidth: this.calculateBalloonWidth,
    });

    if (direction !== newDirection || !moving) {
      this.animate(newDirection);
      this.setState({
        moving: true,
      });
    }
  };

  get calculateBalloonWidth() {
    const newBalloonSize = this.currentValueToPercentage / 400 * balloonWidth;
    return newBalloonSize + balloonWidth;
  }

  resetPosition = () => {
    Animated.parallel([
      Animated.timing(
        this.rotateDeg,
        {
          duration: 100,
          toValue: 45,
          useNativeDriver: true,
        }),
      Animated.timing(
        this.balloonOffset,
        {
          duration: 100,
          toValue: 0,
          useNativeDriver: true,
        }),
    ]).start();
  };

  static calculateMultiplierByVelocity = (velocityX) => {
    if (velocityX === 0) {
      return 1;
    }

    let multiplier = 1;

    velocityX < 200 ? multiplier = 1 :
      velocityX < 600 ? multiplier = 0.4 :
        velocityX < 900 ? multiplier = 0.2 :
          multiplier = 0.1;


    return multiplier;
  };

  animate = (newDirection) => {
    const {velocityX} = this.state;
    const multiplier = 1;

    Animated.parallel([
      Animated.timing(
        this.rotateDeg,
        {
          duration: 250,
          toValue: newDirection === Directions.RIGHT ? (45 - 30 / multiplier) : (45 + 30 / multiplier),
          useNativeDriver: true,
        }),
      Animated.timing(
        this.balloonOffset,
        {
          duration: 250,
          toValue: newDirection === Directions.RIGHT ? 35 / multiplier : -35 / multiplier,
          useNativeDriver: true,
        }),
    ]).start();
  };

  handleStateChange = ({nativeEvent}) => {
    if (nativeEvent.state === State.END) {
      this.setState({
        previousValue: this.state.currentValue,
        moving: false,
      });
      this.resetPosition();
    }
  };

  measureLayout = (event) => {
    this.setState({
      barWidth: event.nativeEvent.layout.width,
    });
  };

  get currentValueToPercentage() {
    const {currentValue, barWidth} = this.state;
    return Math.ceil(currentValue / barWidth * 100);
  }

  render() {
    const {currentValue, barWidth, balloonWidth} = this.state;

    const rotate = this.rotateDeg.interpolate({
      inputRange: [35, 45],
      outputRange: ['35deg', '45deg'],
    });

    return (
      <View style={styles.wrapper}>
        <View style={{width: '100%', alignItems: 'center'}}>
          <View style={{width: '70%'}}>
            <View style={{width:'100%',height:100,justifyContent:'flex-end'}}>
              <Animated.View style={styles.balloon({
                'translateX': Animated.subtract(currentValue, this.balloonOffset),
                'rotate': rotate,
                'balloonWidth': balloonWidth,
              })}>
                <Text style={styles.textValue}>{`${this.currentValueToPercentage}`}</Text>
              </Animated.View>
            </View>
            <View onLayout={this.measureLayout} style={styles.barEmpty}/>
            {/*<View style={[styles.barFill, {*/}
              {/*width: `${this.currentValueToPercentage}%`,*/}
              {/*maxWidth: barWidth,*/}
            {/*},*/}
            {/*]}/>*/}
            <PanGestureHandler
              onGestureEvent={this.swipeHandler}
              onHandlerStateChange={this.handleStateChange}
            >
              <View style={[styles.indicator(currentValue)]}/>
            </PanGestureHandler>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: {
    justifyContent: 'center',
    flex: 1,
  },
  balloon: ({translateX, rotate, balloonWidth}) => ({
    width: balloonWidth,
    aspectRatio: 1,
    backgroundColor: '#4A26EC',
    alignSelf: 'flex-start',
    justifyContent: 'center',
    marginBottom: 24,
    marginStart: -balloonWidth / 2,
    borderTopStartRadius: balloonWidth / 2,
    borderTopEndRadius: balloonWidth / 2,
    borderBottomStartRadius: balloonWidth / 2,
    transform: [{translateX}, {rotate}],
  }),
  indicator: (left) => ({
    width: indicatorWidth,
    top: -indicatorWidth / 2 - barHeight,
    aspectRatio: 1,
    borderRadius: indicatorWidth / 2,
    marginStart: -indicatorWidth / 2,
    backgroundColor: '#4A26EC',
    left,
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
  textValue:{
    alignSelf: 'center',
    color: 'white',
    fontSize: 18,
    transform: [{rotate: '-45deg'}],
    fontFamily: 'IRANYekanMobileFaNum',
  }
});
export default Slider;
