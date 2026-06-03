import { useState, useEffect } from 'react';
import { db, auth, isFirebaseConfigured, OperationType, handleFirestoreError } from './firebase';
import { 
  collection, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Habit, TimerSession, CaseBrief, HabitCategory, TimerType, PagesReadEntry } from '../types';

// Pre-loaded habits for new users
const DEFAULT_HABITS = (uid: string): Habit[] => [
  {
    id: 'h1',
    userId: uid,
    name: 'Read & Brief Legal Cases',
    category: 'study',
    frequency: 'daily',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'h2',
    userId: uid,
    name: 'Outline Constitutional Law / Torts',
    category: 'study',
    frequency: 'daily',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'h3',
    userId: uid,
    name: 'Structure Practice Essay/MCQs',
    category: 'study',
    frequency: 'weekly',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'h4',
    userId: uid,
    name: 'Power Gym Session (Strength)',
    category: 'workout',
    frequency: 'weekly',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'h5',
    userId: uid,
    name: 'Cardio Core (Run / Spin)',
    category: 'workout',
    frequency: 'daily',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  },
  {
    id: 'h6',
    userId: uid,
    name: 'Mindful Stretching or Yoga',
    category: 'workout',
    frequency: 'daily',
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString()
  }
];

export function useAppState() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'offline' | 'loading' | 'synced' | 'error'>('offline');
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // Core Data
  const [habits, setHabits] = useState<Habit[]>([]);
  const [timerSessions, setTimerSessions] = useState<TimerSession[]>([]);
  const [caseBriefs, setCaseBriefs] = useState<CaseBrief[]>([]);
  const [pagesReadEntries, setPagesReadEntries] = useState<PagesReadEntry[]>([]);

  // 1. Monitor Auth State
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      loadLocalData('local');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        setSyncStatus('loading');
        try {
          // Perform any sync from local storage if existing
          await migrateLocalDataToCloud(user.uid);
          setSyncStatus('synced');
        } catch (error) {
          console.error("Migration to cloud failed:", error);
          setSyncStatus('error');
        }
      } else {
        // Logged out or stays local
        loadLocalData('local');
        setSyncStatus('offline');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Load and listen to Cloud or Local Data
  useEffect(() => {
    if (loading) return;

    if (!currentUser || !isFirebaseConfigured || !db) {
      // Local Mode is already loaded via onAuthStateChanged, updates are saved to local directly
      return;
    }

    const uid = currentUser.uid;
    setSyncStatus('loading');

    // Set up Real-time listener for Habits
    const habitsPath = 'habits';
    const habitsQuery = query(collection(db, habitsPath), where('userId', '==', uid));
    const unsubscribeHabits = onSnapshot(habitsQuery, (snapshot) => {
      const docs: Habit[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as Habit);
      });
      setHabits(docs.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setLastSynced(new Date());
      setSyncStatus('synced');
    }, (error) => {
      setSyncStatus('error');
      handleFirestoreError(error, OperationType.LIST, habitsPath);
    });

    // Set up Real-time listener for TimerSessions
    const sessionsPath = 'timerSessions';
    const sessionsQuery = query(collection(db, sessionsPath), where('userId', '==', uid));
    const unsubscribeSessions = onSnapshot(sessionsQuery, (snapshot) => {
      const docs: TimerSession[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as TimerSession);
      });
      setTimerSessions(docs.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()));
      setLastSynced(new Date());
      setSyncStatus('synced');
    }, (error) => {
      setSyncStatus('error');
      handleFirestoreError(error, OperationType.LIST, sessionsPath);
    });

    // Set up Real-time listener for CaseBriefs
    const briefsPath = 'caseBriefs';
    const briefsQuery = query(collection(db, briefsPath), where('userId', '==', uid));
    const unsubscribeBriefs = onSnapshot(briefsQuery, (snapshot) => {
      const docs: CaseBrief[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as CaseBrief);
      });
      setCaseBriefs(docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLastSynced(new Date());
      setSyncStatus('synced');
    }, (error) => {
      setSyncStatus('error');
      handleFirestoreError(error, OperationType.LIST, briefsPath);
    });

    // Set up Real-time listener for PagesRead
    const pagesReadPath = 'pagesRead';
    const pagesReadQuery = query(collection(db, pagesReadPath), where('userId', '==', uid));
    const unsubscribePagesRead = onSnapshot(pagesReadQuery, (snapshot) => {
      const docs: PagesReadEntry[] = [];
      snapshot.forEach((docSnap) => {
        docs.push(docSnap.data() as PagesReadEntry);
      });
      setPagesReadEntries(docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setLastSynced(new Date());
      setSyncStatus('synced');
    }, (error) => {
      setSyncStatus('error');
      handleFirestoreError(error, OperationType.LIST, pagesReadPath);
    });

    return () => {
      unsubscribeHabits();
      unsubscribeSessions();
      unsubscribeBriefs();
      unsubscribePagesRead();
    };
  }, [currentUser, loading]);

  // Load standard offline/local data
  const loadLocalData = (uid: string) => {
    try {
      const rawHabits = localStorage.getItem(`law_focus_habits_${uid}`) || localStorage.getItem('law_focus_habits_local');
      const rawSessions = localStorage.getItem(`law_focus_timer_sessions_${uid}`) || localStorage.getItem('law_focus_timer_sessions_local');
      const rawBriefs = localStorage.getItem(`law_focus_case_briefs_${uid}`) || localStorage.getItem('law_focus_case_briefs_local');
      const rawPagesRead = localStorage.getItem(`law_focus_pages_read_${uid}`) || localStorage.getItem('law_focus_pages_read_local');

      if (rawHabits) {
        setHabits(JSON.parse(rawHabits));
      } else {
        const presets = DEFAULT_HABITS(uid);
        localStorage.setItem(`law_focus_habits_${uid}`, JSON.stringify(presets));
        setHabits(presets);
      }

      if (rawSessions) {
        setTimerSessions(JSON.parse(rawSessions));
      } else {
        setTimerSessions([]);
      }

      if (rawBriefs) {
        setCaseBriefs(JSON.parse(rawBriefs));
      } else {
        setCaseBriefs([]);
      }

      if (rawPagesRead) {
        setPagesReadEntries(JSON.parse(rawPagesRead));
      } else {
        setPagesReadEntries([]);
      }
    } catch (e) {
      console.error("Local data load triggered exception, setting fallbacks:", e);
      setHabits(DEFAULT_HABITS(uid));
      setTimerSessions([]);
      setCaseBriefs([]);
      setPagesReadEntries([]);
    }
  };

  // Sync / Migrate Local offline work to cloud when authenticating
  const migrateLocalDataToCloud = async (uid: string) => {
    if (!db) return;

    // Load any existing local data before setting up online listeners
    const localHabitsRaw = localStorage.getItem('law_focus_habits_local');
    const localSessionsRaw = localStorage.getItem('law_focus_timer_sessions_local');
    const localBriefsRaw = localStorage.getItem('law_focus_case_briefs_local');
    const localPagesReadRaw = localStorage.getItem('law_focus_pages_read_local');

    const localHabits: Habit[] = localHabitsRaw ? JSON.parse(localHabitsRaw) : [];
    const localSessions: TimerSession[] = localSessionsRaw ? JSON.parse(localSessionsRaw) : [];
    const localBriefs: CaseBrief[] = localBriefsRaw ? JSON.parse(localBriefsRaw) : [];
    const localPagesRead: PagesReadEntry[] = localPagesReadRaw ? JSON.parse(localPagesReadRaw) : [];

    // Check if cloud database already has data. If yes, merge or prefer cloud.
    // If no, push local data to Firestore!
    const queryHabits = await getDocs(query(collection(db, 'habits'), where('userId', '==', uid)));
    
    const batch = writeBatch(db);
    let writesCount = 0;

    // Migrate habits if cloud is empty
    if (queryHabits.empty && localHabits.length > 0) {
      localHabits.forEach((habit) => {
        const docRef = doc(db, 'habits', habit.id);
        const updatedHabit = { 
          ...habit, 
          userId: uid,
          createdAt: habit.createdAt || new Date().toISOString()
        };
        batch.set(docRef, updatedHabit);
        writesCount++;
      });
    }

    if (localSessions.length > 0) {
      const querySessions = await getDocs(query(collection(db, 'timerSessions'), where('userId', '==', uid)));
      if (querySessions.empty) {
        localSessions.forEach((session) => {
          const docRef = doc(db, 'timerSessions', session.id);
          batch.set(docRef, { ...session, userId: uid });
          writesCount++;
        });
      }
    }

    if (localBriefs.length > 0) {
      const queryBriefs = await getDocs(query(collection(db, 'caseBriefs'), where('userId', '==', uid)));
      if (queryBriefs.empty) {
        localBriefs.forEach((brief) => {
          const docRef = doc(db, 'caseBriefs', brief.id);
          batch.set(docRef, { 
            ...brief, 
            userId: uid,
            createdAt: brief.createdAt || new Date().toISOString()
          });
          writesCount++;
        });
      }
    }

    if (localPagesRead.length > 0) {
      const queryPagesRead = await getDocs(query(collection(db, 'pagesRead'), where('userId', '==', uid)));
      if (queryPagesRead.empty) {
        localPagesRead.forEach((e) => {
          const docRef = doc(db, 'pagesRead', e.id);
          batch.set(docRef, { 
            ...e, 
            userId: uid,
            createdAt: e.createdAt || new Date().toISOString()
          });
          writesCount++;
        });
      }
    }

    if (writesCount > 0) {
      await batch.commit();
    }

    // Clear local storage key so we don't migrate continuously
    localStorage.removeItem('law_focus_habits_local');
    localStorage.removeItem('law_focus_timer_sessions_local');
    localStorage.removeItem('law_focus_case_briefs_local');
    localStorage.removeItem('law_focus_pages_read_local');
  };

  // Helper helper to write and propagate local storage state for offline mode
  const saveLocalAndNotify = (uid: string, type: 'habits' | 'sessions' | 'briefs' | 'pages_read', updatedData: any) => {
    localStorage.setItem(`law_focus_${type}_${uid}`, JSON.stringify(updatedData));
    if (uid === 'local') {
      localStorage.setItem(`law_focus_${type}_local`, JSON.stringify(updatedData));
    }
  };

  // ==================== WRITES: 1. HABITS ====================
  const addHabit = async (name: string, category: HabitCategory, frequency: 'daily' | 'weekly') => {
    const uid = currentUser?.uid || 'local';
    const newHabit: Habit = {
      id: 'h_' + Math.random().toString(36).substring(2, 11),
      userId: uid,
      name,
      category,
      frequency,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString()
    };

    if (currentUser && isFirebaseConfigured && db) {
      const path = `habits/${newHabit.id}`;
      try {
        await setDoc(doc(db, 'habits', newHabit.id), {
          ...newHabit,
          createdAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [...habits, newHabit];
      setHabits(updated);
      saveLocalAndNotify(uid, 'habits', updated);
    }
  };

  const toggleHabitCompletion = async (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const uid = currentUser?.uid || 'local';

    const updatedHabits = habits.map((habit) => {
      if (habit.id === habitId) {
        let completed = [...habit.completedDates];
        let newStreak = habit.streak;

        if (completed.includes(today)) {
          // Uncomplete habit
          completed = completed.filter(d => d !== today);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          // Complete habit
          completed.push(today);
          
          // Basic streak calculations
          const yesterdayObj = new Date();
          yesterdayObj.setDate(yesterdayObj.getDate() - 1);
          const yesterdayStr = yesterdayObj.toISOString().split('T')[0];
          
          if (habit.completedDates.includes(yesterdayStr) || habit.streak === 0) {
            newStreak = newStreak + 1;
          } else {
            newStreak = 1; // streak reset to 1
          }
        }

        return {
          ...habit,
          completedDates: completed,
          streak: newStreak,
          updatedAt: new Date().toISOString()
        };
      }
      return habit;
    });

    const targetedHabit = updatedHabits.find(h => h.id === habitId);
    if (!targetedHabit) return;

    if (currentUser && isFirebaseConfigured && db) {
      const path = `habits/${habitId}`;
      try {
        await setDoc(doc(db, 'habits', habitId), {
          ...targetedHabit,
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      setHabits(updatedHabits);
      saveLocalAndNotify(uid, 'habits', updatedHabits);
    }
  };

  const deleteHabit = async (habitId: string) => {
    const uid = currentUser?.uid || 'local';
    if (currentUser && isFirebaseConfigured && db) {
      const path = `habits/${habitId}`;
      try {
        await deleteDoc(doc(db, 'habits', habitId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = habits.filter(h => h.id !== habitId);
      setHabits(updated);
      saveLocalAndNotify(uid, 'habits', updated);
    }
  };

  // ==================== WRITES: 2. SESSIONS ====================
  const logTimerSession = async (duration: number, type: TimerType, subject: string) => {
    const uid = currentUser?.uid || 'local';
    const newSession: TimerSession = {
      id: 's_' + Math.random().toString(36).substring(2, 11),
      userId: uid,
      duration,
      type,
      subject,
      completedAt: new Date().toISOString()
    };

    if (currentUser && isFirebaseConfigured && db) {
      const path = `timerSessions/${newSession.id}`;
      try {
        await setDoc(doc(db, 'timerSessions', newSession.id), {
          ...newSession,
          completedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [newSession, ...timerSessions];
      setTimerSessions(updated);
      saveLocalAndNotify(uid, 'sessions', updated);
    }

    // Also auto-complete any aligned habit if matching studies
    if (type === 'pomodoro' || type === 'custom') {
      const studyHabit = habits.find(h => h.category === 'study' && h.name.toLowerCase().includes('read') || h.name.toLowerCase().includes('outline'));
      if (studyHabit) {
        const today = new Date().toISOString().split('T')[0];
        if (!studyHabit.completedDates.includes(today)) {
          await toggleHabitCompletion(studyHabit.id);
        }
      }
    }
  };

  const deleteTimerSession = async (sessionId: string) => {
    const uid = currentUser?.uid || 'local';
    if (currentUser && isFirebaseConfigured && db) {
      const path = `timerSessions/${sessionId}`;
      try {
        await deleteDoc(doc(db, 'timerSessions', sessionId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = timerSessions.filter(s => s.id !== sessionId);
      setTimerSessions(updated);
      saveLocalAndNotify(uid, 'sessions', updated);
    }
  };

  // ==================== WRITES: 3. CASE BRIEFS ====================
  const saveCaseBrief = async (title: string, citation: string, facts: string, issue: string, holding: string, notes: string, existingId?: string) => {
    const uid = currentUser?.uid || 'local';
    const briefId = existingId || 'b_' + Math.random().toString(36).substring(2, 11);
    
    const newBrief: CaseBrief = {
      id: briefId,
      userId: uid,
      title,
      citation,
      facts,
      issue,
      holding,
      notes,
      createdAt: new Date().toISOString()
    };

    if (currentUser && isFirebaseConfigured && db) {
      const path = `caseBriefs/${briefId}`;
      try {
        await setDoc(doc(db, 'caseBriefs', briefId), {
          ...newBrief,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      let updated: CaseBrief[];
      if (existingId) {
        updated = caseBriefs.map(b => b.id === existingId ? { ...newBrief, createdAt: b.createdAt, updatedAt: new Date().toISOString() } : b);
      } else {
        updated = [newBrief, ...caseBriefs];
      }
      setCaseBriefs(updated);
      saveLocalAndNotify(uid, 'briefs', updated);
    }
  };

  const deleteCaseBrief = async (briefId: string) => {
    const uid = currentUser?.uid || 'local';
    if (currentUser && isFirebaseConfigured && db) {
      const path = `caseBriefs/${briefId}`;
      try {
        await deleteDoc(doc(db, 'caseBriefs', briefId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = caseBriefs.filter(b => b.id !== briefId);
      setCaseBriefs(updated);
      saveLocalAndNotify(uid, 'briefs', updated);
    }
  };

  // ==================== WRITES: 4. PAGES READ ====================
  const logPagesRead = async (count: number, subject: string, notes?: string) => {
    const uid = currentUser?.uid || 'local';
    const entryId = 'p_' + Math.random().toString(36).substring(2, 11);
    
    const newEntry: PagesReadEntry = {
      id: entryId,
      userId: uid,
      count,
      subject,
      notes: notes || '',
      createdAt: new Date().toISOString()
    };

    if (currentUser && isFirebaseConfigured && db) {
      const path = `pagesRead/${entryId}`;
      try {
        await setDoc(doc(db, 'pagesRead', entryId), {
          ...newEntry,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
    } else {
      const updated = [newEntry, ...pagesReadEntries];
      setPagesReadEntries(updated);
      saveLocalAndNotify(uid, 'pages_read', updated);
    }
  };

  const deletePagesRead = async (entryId: string) => {
    const uid = currentUser?.uid || 'local';
    if (currentUser && isFirebaseConfigured && db) {
      const path = `pagesRead/${entryId}`;
      try {
        await deleteDoc(doc(db, 'pagesRead', entryId));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    } else {
      const updated = pagesReadEntries.filter(e => e.id !== entryId);
      setPagesReadEntries(updated);
      saveLocalAndNotify(uid, 'pages_read', updated);
    }
  };

  return {
    currentUser,
    loading,
    syncStatus,
    lastSynced,
    habits,
    timerSessions,
    caseBriefs,
    pagesReadEntries,
    // Operations
    addHabit,
    toggleHabitCompletion,
    deleteHabit,
    logTimerSession,
    deleteTimerSession,
    saveCaseBrief,
    deleteCaseBrief,
    logPagesRead,
    deletePagesRead
  };
}
