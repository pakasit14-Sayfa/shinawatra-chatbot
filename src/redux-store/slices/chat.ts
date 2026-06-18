// Third-party Imports
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

// Type Imports
import type { StatusType, ChatDataType } from '@/types/apps/chatTypes'

// ฟังก์ชันดึงข้อมูลจาก API ของเราแทน fake-db
export const fetchChatData = createAsyncThunk('chat/fetchData', async () => {
  const response = await fetch('/api/chat')
  const data = await response.json()
  return data as ChatDataType
})

const initialState: ChatDataType = {
  profileUser: {} as any,
  contacts: [],
  chats: []
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    getActiveUserData: (state, action: PayloadAction<number>) => {
      const activeUser = state.contacts.find(user => user.id === action.payload)

      const chat = state.chats.find(chat => chat.userId === action.payload)

      if (chat && chat.unseenMsgs > 0) {
        chat.unseenMsgs = 0
      }

      if (activeUser) {
        state.activeUser = activeUser
      }
    },

    addNewChat: (state, action) => {
      const { id } = action.payload

      state.contacts.find(contact => {
        if (contact.id === id && !state.chats.find(chat => chat.userId === contact.id)) {
          state.chats.unshift({
            id: state.chats.length + 1,
            userId: contact.id,
            unseenMsgs: 0,
            chat: []
          })
        }
      })
    },

    setUserStatus: (state, action: PayloadAction<{ status: StatusType }>) => {
      state.profileUser = {
        ...state.profileUser,
        status: action.payload.status
      }
    },

    sendMsg: (state, action: PayloadAction<{ msg: string }>) => {
      const { msg } = action.payload

      const existingChat = state.chats.find(chat => chat.userId === state.activeUser?.id)

      if (existingChat) {
        existingChat.chat.push({
          message: msg,
          time: new Date(),
          senderId: state.profileUser.id,
          msgStatus: {
            isSent: true,
            isDelivered: false,
            isSeen: false
          }
        })

        // Remove the chat from its current position
        state.chats = state.chats.filter(chat => chat.userId !== state.activeUser?.id)

        // Add the chat back to the beginning of the array
        state.chats.unshift(existingChat)
      }
    }
  },
  extraReducers: builder => {
    builder.addCase(fetchChatData.fulfilled, (state, action) => {
      return action.payload
    })
  }
})

export const { getActiveUserData, addNewChat, setUserStatus, sendMsg } = chatSlice.actions

export default chatSlice.reducer
