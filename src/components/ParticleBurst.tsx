import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface Particle {
  id: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  size: number;
}

interface ParticleBurstProps {
  triggerKey: number;
  color: string;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ triggerKey, color }) => {
  const particles = useRef<Particle[]>(
    Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      size: Math.random() * 6 + 4,
    }))
  ).current;

  useEffect(() => {
    if (triggerKey === 0) return;

    // Trigger burst animation
    const animations = particles.map((p) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.scale.setValue(1);

      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 70 + 30;
      const destX = Math.cos(angle) * distance;
      const destY = Math.sin(angle) * distance - 20;

      return Animated.parallel([
        Animated.timing(p.x, {
          toValue: destX,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(p.y, {
          toValue: destY,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(p.scale, {
            toValue: 1.4,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(p.scale, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(p.opacity, {
          toValue: 0,
          duration: 650,
          useNativeDriver: true,
        }),
      ]);
    });

    Animated.parallel(animations).start();
  }, [triggerKey]);

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((p) => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              width: p.size,
              height: p.size,
              borderRadius: p.size / 2,
              backgroundColor: color,
              transform: [
                { translateX: p.x },
                { translateY: p.y },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99,
  },
  particle: {
    position: 'absolute',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});

