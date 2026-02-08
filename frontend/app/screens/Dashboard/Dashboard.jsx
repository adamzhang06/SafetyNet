import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import BACRing from './BACRing';
import MainLayout from '../../MainLayout';
import BottomNavBar from '../../components/BottomNavBar';
import toastStyles from '../../components/ToastStyles';
import { useUser } from '../../context/UserContext';

let NfcManager;
try {
  NfcManager = require('react-native-nfc-manager').default;
} catch (_) {
  NfcManager = null;
}
const GRAMS_PER_DRINK_NFC = 14;

const { width } = Dimensions.get('window');
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// One US standard drink ≈ 14g alcohol
const GRAMS_PER_DRINK = 14;

const Dashboard = () => {
  const router = useRouter();
  const {
    userId,
    weight,
    gender,
    drinkLog,
    addDrink,
    removeLastDrink,
    calculateBAC: contextCalculateBAC,
    reactionLatencies,
    apiBase,
  } = useUser();
  const [bac, setBac] = useState(0);
  const [recommendation, setRecommendation] = useState('');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const showToastRef = useRef(() => {});

  const base = apiBase || API_BASE;
  const totalAlcoholGrams = drinkLog.reduce((s, e) => s + (e.alcohol_grams || 0), 0);
  const firstDrinkTs = drinkLog.length ? Math.min(...drinkLog.map((e) => e.timestamp || 0)) : 0;
  const timeElapsedMinutes = firstDrinkTs ? (Date.now() - firstDrinkTs) / (1000 * 60) : 0;
  const drinkCount = drinkLog.length;

  const hasWeight = weight != null && weight !== '' && !isNaN(parseFloat(weight)) && parseFloat(weight) > 0;
  const hasGender = gender === 'Male' || gender === 'Female';
  const profileIncomplete = !hasWeight || !hasGender;

  const reactionTimeMs = reactionLatencies?.length
    ? reactionLatencies.reduce((a, b) => a + b, 0) / reactionLatencies.length
    : null;

  const calculateBAC = useCallback(async () => {
    const w = parseFloat(weight, 10);
    if (!weight || isNaN(w) || w <= 0) return;
    const sex = gender === 'Male' ? 'male' : gender === 'Female' ? 'female' : 'male';
    const weight_kg = w * 0.453592;
    setLoading(true);
    try {
      const res = await fetch(`${base}/bac/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId || 'anonymous',
          weight_kg,
          sex,
          alcohol_grams: totalAlcoholGrams,
          time_elapsed_minutes: timeElapsedMinutes,
        }),
      });
      if (!res.ok) throw new Error('BAC estimate failed');
      const data = await res.json();
      setBac(data.bac ?? 0);
      const recRes = await fetch(`${base}/sobriety/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bac: data.bac ?? 0,
          reaction_time_ms: reactionTimeMs ?? undefined,
        }),
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendation(recData.recommendation || '');
      } else {
        setRecommendation('');
      }
    } catch (e) {
      setToast({ message: e.message || 'Could not calculate BAC', key: Date.now() });
      setTimeout(() => setToast((t) => (t?.key === Date.now() ? null : t)), 2000);
    } finally {
      setLoading(false);
    }
  }, [userId, weight, gender, totalAlcoholGrams, timeElapsedMinutes, reactionTimeMs, base]);

  useEffect(() => {
    if (weight && gender && (drinkCount > 0 || bac > 0)) {
      calculateBAC();
    } else if (drinkCount === 0) {
      setBac(0);
      setRecommendation('');
    }
  }, [drinkCount, weight, gender]);

  useEffect(() => {
    if (!NfcManager || !addDrink) return;
    let cancelled = false;
    (async () => {
      try {
        const supported = await NfcManager.isSupported();
        if (!supported || cancelled) return;
        await NfcManager.start();
        await NfcManager.registerTagEvent((tag) => {
          if (cancelled) return;
          let grams = GRAMS_PER_DRINK_NFC;
          try {
            const payload = tag?.ndefMessage?.[0]?.payload || tag?.payload;
            if (payload) {
              const str = typeof payload === 'string' ? payload : (payload && Array.isArray(payload) ? String.fromCharCode(...payload) : '');
              const parsed = JSON.parse(str || '{}');
              if (typeof parsed.alcohol_grams === 'number' && parsed.alcohol_grams > 0) grams = parsed.alcohol_grams;
            }
          } catch (_) {}
          addDrink(grams);
          showToastRef.current(`NFC: drink added (${grams}g)`);
        });
      } catch (_) {}
    })();
    return () => {
      cancelled = true;
      NfcManager?.unregisterTagEvent?.().catch(() => {});
    };
  }, [addDrink]);

  const showToast = useCallback((message) => {
    const key = Date.now();
    setToast({ message, key });
    setTimeout(() => setToast((t) => (t && t.key === key ? null : t)), 2000);
  }, []);
  showToastRef.current = showToast;

  const handleNotifyGroup = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/groups/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message: bac.toFixed(2),
        }),
      });
      if (res.ok) {
        showToast(`Group notified. BAC: ${bac.toFixed(2)}`);
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.detail || 'Not in a group');
      }
    } catch (e) {
      showToast(e.message || 'Could not notify group');
    }
  }, [userId, bac]);

  const handleGoHome = useCallback(() => {
    handleNotifyGroup();
    Linking.openURL('uber://?action=setPickup&pickup=my_location').catch(() => {
      Linking.openURL('https://m.uber.com').catch(() => {});
    });
  }, [handleNotifyGroup]);

  const statusText = recommendation || (bac === 0 ? 'You are sober' : `BAC ${bac.toFixed(2)}`);

  if (profileIncomplete) {
    return (
      <MainLayout>
        <View style={styles.container}>
          <Text style={styles.headerLabel}>Profile Incomplete</Text>
          <Text style={styles.statusText}>
            Please set your weight and gender in Profile to calculate BAC.
          </Text>
          <View style={styles.profileCtaWrap}>
            <TouchableOpacity
              style={styles.glassButton}
              onPress={() => router.replace('/profile')}
            >
              <Text style={styles.buttonText}>Go to Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <Text style={styles.headerLabel}>Your Blood Alcohol Content</Text>
        <View style={styles.gaugeContainer}>
          <BACRing value={bac} size={240} />
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
          {/* Standard drinks stepper */}
          <View style={styles.stepperRow}>
            <Text style={styles.stepperLabel}>Standard drinks</Text>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => removeLastDrink()}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{drinkCount}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => addDrink(GRAMS_PER_DRINK)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity style={styles.recalcButton} onPress={calculateBAC}>
            <Text style={styles.recalcButtonText}>Recalculate BAC</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.nfcButton}
            onPress={() => {
              addDrink(GRAMS_PER_DRINK);
              showToast('Drink added (tap or NFC)');
            }}
          >
            <Text style={styles.nfcButtonText}>NFC Tap Drink</Text>
          </TouchableOpacity>
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.nfcButton, { marginTop: 4, opacity: 0.7 }]}
              onPress={() => {
                addDrink(GRAMS_PER_DRINK);
                showToast('Debug: drink added');
              }}
            >
              <Text style={styles.nfcButtonText}>Debug: Add Drink</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.statusText}>{statusText}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.glassButton} onPress={handleNotifyGroup}>
            <Text style={styles.buttonText}>Notify Group</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.glassButton} onPress={handleGoHome}>
            <Text style={styles.buttonText}>Go Home</Text>
          </TouchableOpacity>
        </View>
        {toast && (
          <View style={toastStyles.toastContainer} pointerEvents="none">
            <Text style={toastStyles.toastText}>{toast.message}</Text>
          </View>
        )}
      </View>
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', zIndex: 100 }}>
        <BottomNavBar />
      </View>
    </MainLayout>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  headerLabel: {
    color: 'white',
    fontSize: 24,
    fontFamily: 'Inter',
    fontWeight: '200',
    marginBottom: 40,
    letterSpacing: 0.5,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  loadingWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  stepperLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  stepperBtn: {
    width: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperBtnText: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
  },
  stepperValue: {
    color: 'white',
    fontSize: 18,
    minWidth: 32,
    textAlign: 'center',
  },
  recalcButton: {
    marginTop: 12,
    backgroundColor: '#444',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  recalcButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  nfcButton: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nfcButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  statusText: {
    color: 'white',
    fontSize: 22,
    fontFamily: 'Inter',
    fontWeight: '300',
    marginBottom: 50,
    opacity: 0.9,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  profileCtaWrap: {
    width: '100%',
    paddingHorizontal: 30,
    marginTop: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 30,
    justifyContent: 'space-between',
    gap: 15,
  },
  glassButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Inter',
    fontWeight: '400',
  },
});
