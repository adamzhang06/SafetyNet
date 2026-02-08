import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import MainLayout from '../../MainLayout';
import BottomNavBar from '../../components/BottomNavBar';
import { useUser } from '../../../lib/context/UserContext';

const { width } = Dimensions.get('window');

export default function ReactionTestScreen() {
  // Game States: 'idle' | 'waiting' | 'ready' | 'finished' | 'early'
  const [gameState, setGameState] = useState('idle');
  const [score, setScore] = useState(0);
  const [reactionTimes, setReactionTimes] = useState([]); // Store 5 times
  const [testIndex, setTestIndex] = useState(0); // 0-4
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);
  const { setReactionLatencies } = useUser?.() || {};

  const handlePress = () => {
    if (gameState === 'idle' || gameState === 'finished' || gameState === 'early') {
      // Start the game
      setGameState('waiting');
      setScore(0);
      // Random delay between 2 and 5 seconds
      const randomDelay = Math.floor(Math.random() * 3000) + 2000;
      timerRef.current = setTimeout(() => {
        setGameState('ready');
        startTimeRef.current = Date.now();
      }, randomDelay);
    } else if (gameState === 'waiting') {
      // User clicked too early
      clearTimeout(timerRef.current);
      setGameState('early');
    } else if (gameState === 'ready') {
      // User clicked on time
      const endTime = Date.now();
      const reactionTime = endTime - startTimeRef.current;
      setScore(reactionTime);
      setReactionTimes((prev) => {
        const updated = [...prev, reactionTime];
        if (updated.length === 5 && setReactionLatencies) {
          setReactionLatencies(updated); // Save to context for BAC
        }
        return updated;
      });
      setTestIndex((idx) => idx + 1);
      // If fewer than 5 tests, auto-start next
      if (reactionTimes.length + 1 < 5) {
        setTimeout(() => {
          setGameState('idle');
          setScore(0);
        }, 600); // brief pause for feedback
      } else {
        setGameState('finished');
      }
    }
  };

  // Reset for next test
  const handleNextTest = () => {
    setGameState('idle');
    setScore(0);
  };

  // Calculate average
  const average = reactionTimes.length === 0 ? 0 : Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);

  // Button text logic
  const getButtonText = () => {
    if (reactionTimes.length === 5) return 'Done';
    switch (gameState) {
      case 'waiting': return 'Wait for Green...';
      case 'ready': return 'CLICK NOW!';
      case 'early': return 'Too Early! Retry';
      case 'finished': return reactionTimes.length < 5 ? 'Next Test' : 'Done';
      default: return reactionTimes.length === 0 ? 'Press to Start' : 'Next Test';
    }
  };

  // Button color logic
  const getButtonColor = () => {
    if (gameState === 'ready') return '#4CAF50'; // Green for go
    if (gameState === 'early') return '#BE5C5C'; // Red
    return '#BE5C5C'; // Default Maroon
  };

  return (
    <MainLayout>
      <View style={styles.container}>
        {/* Title */}
        <View style={styles.headerContainer}>
          <Text style={styles.titleText}>Reaction Time Test</Text>
          <Text style={{ color: 'white', fontSize: 18, marginTop: 8 }}>Test {Math.min(testIndex + 1, 5)} of 5</Text>
        </View>
        {/* Score Display */}
        <View style={styles.scoreWrapper}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreNumber}>{score}</Text>
          </View>
          <Text style={styles.scoreUnit}>ms</Text>
        </View>
        {/* Average Display */}
        {reactionTimes.length > 0 && (
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 22, fontWeight: '600' }}>Average: {average} ms</Text>
          </View>
        )}
        {/* Interaction Area */}
        <View style={styles.buttonContainer}>
          {reactionTimes.length < 5 ? (
            <TouchableOpacity 
              activeOpacity={0.8} 
              onPress={handlePress}
              style={[styles.actionButton, { backgroundColor: getButtonColor() }]}> 
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            </TouchableOpacity>
          ) : (
            <>
              <Text style={{ color: 'white', fontSize: 18, marginTop: 16 }}>All tests complete! Your average reaction time is {average} ms.</Text>
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => {
                  setReactionTimes([]);
                  setTestIndex(0);
                  setScore(0);
                  setGameState('idle');
                }}
                style={[styles.actionButton, { backgroundColor: '#4CAF50', marginTop: 24 }]}
              >
                <Text style={styles.buttonText}>Redo Test</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
      <BottomNavBar />
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    // Distribute space to match the specific layout positions
    justifyContent: 'space-between',
    paddingBottom: 120, // Space for bottom nav
    paddingTop: 40,
  },
  headerContainer: {
    marginTop: 60, // approximate top: 191px relative to screen
    alignItems: 'flex-start',
    paddingLeft: 20,
  },
  titleText: {
    color: 'white',
    fontSize: 36,
    fontFamily: 'Inter',
    fontWeight: '200', // Thin font weight
    lineHeight: 44,
  },
  scoreWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline', // Aligns the 'ms' to the bottom of the number
    marginBottom: 40,
  },
  scoreContainer: {
    // Just a wrapper to hold the big number
  },
  scoreNumber: {
    color: 'white',
    fontSize: 140, // Scaled down slightly from 200px to fit mobile width safely
    fontFamily: 'Inter',
    fontWeight: '200',
    lineHeight: 160,
    textAlign: 'center',
  },
  scoreUnit: {
    color: 'white',
    fontSize: 32,
    fontFamily: 'Inter',
    fontWeight: '400',
    marginLeft: 10,
    marginBottom: 25, // Adjust to align baseline visually
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  actionButton: {
    width: 208,
    height: 82,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    // Solid color fallback for the gradient
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
});
