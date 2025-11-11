import { configureStore } from '@reduxjs/toolkit'
import { authReducer, clearAuth } from '../../features/auth/store/authSlice'
import { chatReducer } from '../../features/chat/store/chatSlice'
import conversationReducer from '../../features/chat/store/conversationSlice'
import { uiReducer } from '../../features/ui/store/uiSlice'
import { userReducer } from '../../features/user/store/userSlice'
import { registerClearAuthCallback } from '../utils/authHelper'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    chat: chatReducer,
    conversation: conversationReducer,
    ui: uiReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        // Ignore Date objects in subscription fields
        ignoredPaths: ['auth.user.subscription.startDate', 'auth.user.subscription.endDate', 'auth.user.voiceSubscription.startDate', 'auth.user.voiceSubscription.endDate'],
      },
    }),
})

// Register clearAuth callback to avoid circular dependency
registerClearAuthCallback(() => {
  store.dispatch(clearAuth());
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export * from './hooks'


