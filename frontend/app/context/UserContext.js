import React, { createContext, useState, useContext, useCallback } from 'react';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Widmark constants (metric)
const R_MALE = 0.68;
const R_FEMALE = 0.55;
const BETA_PER_HOUR = 0.015;

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFt, setHeightFt] = useState(null);
  const [heightIn, setHeightIn] = useState(null);
  const [tolerance, setTolerance] = useState(5);
  const [phone, setPhone] = useState('');
  const [emergencyContact1, setEmergencyContact1] = useState('');
  const [emergencyContact2, setEmergencyContact2] = useState('');

  const [drinkLog, setDrinkLog] = useState([]);
  const [groupId, setGroupId] = useState(null);
  const [groupCode, setGroupCode] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [reactionLatencies, setReactionLatencies] = useState(null);

  const calculateBAC = useCallback(() => {
    const w = parseFloat(weight, 10);
    if (!weight || isNaN(w) || w <= 0) return 0;
    const sex = gender === 'Female' ? 'female' : 'male';
    const r = sex === 'male' ? R_MALE : R_FEMALE;
    const weightKg = w * 0.453592;
    if (!drinkLog.length) return 0;
    const totalGrams = drinkLog.reduce((sum, e) => sum + (e.alcohol_grams || 0), 0);
    const firstTs = Math.min(...drinkLog.map((e) => e.timestamp || 0));
    const hoursElapsed = (Date.now() - firstTs) / (1000 * 60 * 60);
    const weightGrams = weightKg * 1000;
    const peakBac = (totalGrams / (weightGrams * r)) * 100;
    const elimination = BETA_PER_HOUR * hoursElapsed;
    const bac = Math.max(0, peakBac - elimination);
    return Math.round(bac * 10000) / 10000;
  }, [weight, gender, drinkLog]);

  const createGroup = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create group');
      }
      const data = await res.json();
      setGroupId(String(data.group_id ?? ''));
      setGroupCode(String(data.code ?? ''));
      setGroupMembers([]);
      return { group_id: String(data.group_id), code: data.code };
    } catch (e) {
      throw e;
    }
  }, [userId]);

  const joinGroup = useCallback(async (code) => {
    const cleanCode = String(code).replace(/\D/g, '').slice(0, 6);
    if (cleanCode.length !== 6) throw new Error('Enter a 6-digit code');
    const res = await fetch(`${API_BASE}/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: cleanCode, user_id: userId }),
    });
    if (res.status === 404) throw new Error('Group not found. Check the code.');
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Could not join group');
    }
    const data = await res.json();
    setGroupId(String(data.group_id ?? ''));
    setGroupCode(cleanCode);
    setGroupMembers([]);
    return { group_id: String(data.group_id) };
  }, [userId]);

  const refreshGroupMembers = useCallback(async () => {
    if (!groupId) return;
    try {
      const res = await fetch(`${API_BASE}/groups/${encodeURIComponent(groupId)}/members`);
      if (!res.ok) return;
      const data = await res.json();
      setGroupMembers(Array.isArray(data.members) ? data.members : []);
    } catch (_) {
      setGroupMembers([]);
    }
  }, [groupId]);

  const addDrink = useCallback((alcohol_grams = 14) => {
    setDrinkLog((prev) => [...prev, { alcohol_grams, timestamp: Date.now() }]);
  }, []);

  const removeLastDrink = useCallback(() => {
    setDrinkLog((prev) => (prev.length ? prev.slice(0, -1) : prev));
  }, []);

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        photoUri,
        setPhotoUri,
        age,
        setAge,
        gender,
        setGender,
        weight,
        setWeight,
        heightFt,
        setHeightFt,
        heightIn,
        setHeightIn,
        tolerance,
        setTolerance,
        phone,
        setPhone,
        emergencyContact1,
        setEmergencyContact1,
        emergencyContact2,
        setEmergencyContact2,
        drinkLog,
        setDrinkLog,
        addDrink,
        removeLastDrink,
        calculateBAC,
        groupId,
        setGroupId,
        groupCode,
        setGroupCode,
        groupMembers,
        setGroupMembers,
        createGroup,
        joinGroup,
        refreshGroupMembers,
        reactionLatencies,
        setReactionLatencies,
        apiBase: API_BASE,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
