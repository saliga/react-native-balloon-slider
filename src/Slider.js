import React, {Component} from 'react';
import {View, Text, StyleSheet, Animated,Easing} from 'react-native';
import {PanGestureHandler, State} from 'react-native-gesture-handler';

const indicatorWidth = 15;
const barHeight = 2;
const balloonWidth = 50;
const Directions = {
  RIGHT:'right',
  LEFT:'left'
}

class Slider extends Component {

  state = {
    currentValue: 0,// indicates position of indicator in points
    previousValue: 0,
    moving: false,
    barWidth: undefined,
    barStartX: undefined,
    velocityX: 0,
    balloonOffset: new Animated.Value(0),
    direction:undefined
  };

  rotateDeg = new Animated.Value(45)
  balloonOffset = new Animated.Value(0)

  swipeHandler = (event) => {
    const {previousValue, barWidth,currentValue,direction,moving} = this.state;

    const deltaX = event.nativeEvent.translationX;
    const velocityX = event.nativeEvent.velocityX;
    const newValue = previousValue + deltaX;
    const newDirection = newValue > currentValue ? Directions.RIGHT : Directions.LEFT


    if( deltaX === 0 )
      return

    this.setState({
      currentValue: newValue < 0 ? 0 : newValue > barWidth ? barWidth : newValue,
      velocityX,
      direction: newDirection
    });

    // console.log('deltaX',deltaX)
    // console.log('currentValue',currentValue)
    // console.log('newValue',newValue)
    // console.log('direction',direction)
    // console.log('newDirection',newDirection)
    console.log('velocity',velocityX)

    if(direction !== newDirection || !moving )
    {
      this.animate(newDirection )
      this.setState({
        moving:true
      })
    }
  };

  resetPosition = () =>{
    Animated.parallel([
      Animated.timing(
        this.rotateDeg,
        {
          duration:100,
          toValue:45,
          useNativeDriver:true
        }),
      Animated.timing(
        this.balloonOffset,
        {
          duration:100,
          toValue:0,
          useNativeDriver:true
        })
    ]).start()
  }

  static calculateMultiplierByVelocity=(velocityX)=>{
    if(velocityX === 0)
      return 1

    let multiplier = 1
    // const multiplier = Math.abs(Math.ceil( 1000 / velocityX )) / 2

      velocityX < 200 ? multiplier = 1 :
        velocityX < 600 ? multiplier = 0.4 :
          velocityX < 900 ? multiplier = 0.2 :
            multiplier = 0.1


    console.log('multiplier',multiplier)
    console.log('velocityX',velocityX)
    return multiplier
  }
  animate = (newDirection)=>{
    // console.log('newDDDDDDDDDDDD',newDirection)
    const { velocityX } = this.state
    const multiplier = Slider.calculateMultiplierByVelocity(Math.abs(velocityX))

    Animated.parallel([
      Animated.timing(
        this.rotateDeg,
        {
          duration:250,
          toValue:newDirection === Directions.RIGHT ? (45 - 30 / multiplier) : (45 + 30 / multiplier),
          useNativeDriver:true
        }),
      Animated.timing(
        this.balloonOffset,
        {
          duration:250,
          toValue:newDirection === Directions.RIGHT ? 35 / multiplier  : -35 / multiplier ,
          useNativeDriver:true
        })
    ]).start()
  }

  handleStateChange = ({nativeEvent}) => {
    if (nativeEvent.state === State.END) {
      this.setState({
        previousValue: this.state.currentValue,
        moving:false
      });
      this.resetPosition()
    }
  };

  measureLayout = (event) => {
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
    transform:[{translateX},{rotate},]
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
});
export default Slider;
