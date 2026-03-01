import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Hardcode Admin Check for the master account
                if (user.email === 'admin@schoollane.dev') {
                    setUserRole('admin');

                    // Optional: Try to ensure the firestore doc exists so other queries don't break
                    try {
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (!userDoc.exists()) {
                            const { setDoc } = await import('firebase/firestore');
                            await setDoc(doc(db, 'users', user.uid), {
                                uid: user.uid,
                                email: user.email,
                                name: 'System Admin',
                                role: 'admin',
                                createdAt: new Date().toISOString()
                            });
                        }
                    } catch (e) { console.error(e); }
                } else {
                    try {
                        // Fetch user role from Firestore for everyone else
                        const userDoc = await getDoc(doc(db, 'users', user.uid));
                        if (userDoc.exists()) {
                            setUserRole(userDoc.data().role);
                        } else {
                            // Fallback role if doc doesn't exist
                            setUserRole('teacher');
                        }
                    } catch (err) {
                        console.error('Error fetching user role:', err);
                        setUserRole('teacher'); // Fallback
                    }
                }
            } else {
                setUserRole(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userRole
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
