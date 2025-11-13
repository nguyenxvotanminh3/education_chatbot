import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { conversationService } from "../services/conversationService";
import type { Conversation } from "../types";

interface ConversationState {
  conversations: Conversation[];
  selectedConversationId: string | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: ConversationState = {
  conversations: [],
  selectedConversationId: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
};

// Async thunks
export const fetchConversations = createAsyncThunk(
  "conversation/fetchConversations",
  async (_, { rejectWithValue }) => {
    try {
      const conversations = await conversationService.getConversations();
      return conversations;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }
);

export const fetchConversation = createAsyncThunk(
  "conversation/fetchConversation",
  async (id: string, { rejectWithValue }) => {
    try {
      const conversation = await conversationService.getConversation(id);
      return conversation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch conversation"
      );
    }
  }
);

export const createConversation = createAsyncThunk(
  "conversation/createConversation",
  async (conversation: Partial<Conversation>, { rejectWithValue }) => {
    try {
      const newConversation = await conversationService.createConversation(
        conversation
      );
      return newConversation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create conversation"
      );
    }
  }
);

export const updateConversation = createAsyncThunk(
  "conversation/updateConversation",
  async (
    { id, updates }: { id: string; updates: Partial<Conversation> },
    { rejectWithValue }
  ) => {
    try {
      const updatedConversation = await conversationService.updateConversation(
        id,
        updates
      );
      return updatedConversation;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update conversation"
      );
    }
  }
);

export const deleteConversation = createAsyncThunk(
  "conversation/deleteConversation",
  async (id: string, { rejectWithValue }) => {
    try {
      await conversationService.deleteConversation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete conversation"
      );
    }
  }
);

const conversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setSelectedConversationId: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.selectedConversationId = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearConversations: (state) => {
      state.conversations = [];
      state.selectedConversationId = null;
      state.isLoading = false;
      state.isCreating = false;
      state.isUpdating = false;
      state.isDeleting = false;
      state.error = null;
    },
    // Optimistic update for local state (before backend sync)
    addMessageToConversation: (
      state,
      action: PayloadAction<{ conversationId: string; message: any }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.conversationId
      );
      if (conversation) {
        conversation.messages.push(action.payload.message);
        conversation.updatedAt = Date.now();
      }
    },
    updateConversationLocal: (
      state,
      action: PayloadAction<{ id: string; updates: Partial<Conversation> }>
    ) => {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload.id
      );
      if (conversation) {
        Object.assign(conversation, action.payload.updates);
        conversation.updatedAt = Date.now();
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch conversations
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.conversations = action.payload;
        // Sort by updatedAt descending (most recent first)
        state.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single conversation
    builder
      .addCase(fetchConversation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConversation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.conversations.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index >= 0) {
          state.conversations[index] = action.payload;
        } else {
          state.conversations.push(action.payload);
        }
        // Sort by updatedAt descending
        state.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
      })
      .addCase(fetchConversation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create conversation
    builder
      .addCase(createConversation.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.isCreating = false;
        state.conversations.unshift(action.payload); // Add to beginning
        // Sort by updatedAt descending
        state.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
        state.selectedConversationId = action.payload.id;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // Update conversation
    builder
      .addCase(updateConversation.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateConversation.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.conversations.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index >= 0) {
          // Merge updates instead of replacing entire conversation
          // This preserves messages and other fields that backend might not return
          const existingConversation = state.conversations[index];
          state.conversations[index] = {
            ...existingConversation,
            ...action.payload,
            // Preserve messages if backend doesn't return them
            messages: action.payload.messages || existingConversation.messages,
          };
        }
        // Sort by updatedAt descending
        state.conversations.sort((a, b) => b.updatedAt - a.updatedAt);
      })
      .addCase(updateConversation.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });

    // Delete conversation
    builder
      .addCase(deleteConversation.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteConversation.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.conversations = state.conversations.filter(
          (c) => c.id !== action.payload
        );
        // Clear selection if deleted conversation was selected
        if (state.selectedConversationId === action.payload) {
          state.selectedConversationId =
            state.conversations.length > 0 ? state.conversations[0].id : null;
        }
      })
      .addCase(deleteConversation.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedConversationId,
  clearError,
  clearConversations,
  addMessageToConversation,
  updateConversationLocal,
} = conversationSlice.actions;

export default conversationSlice.reducer;

