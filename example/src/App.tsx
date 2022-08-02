import { useActionSheet } from '@expo/react-native-action-sheet'
import { Chat, defaultTheme, MessageType } from '@flyerhq/react-native-chat-ui'
import { PreviewData } from '@flyerhq/react-native-link-preview'
import dayjs from 'dayjs'
import React, { useCallback, useState } from 'react'
import { Text, View } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import FileViewer from 'react-native-file-viewer'
import { launchImageLibrary } from 'react-native-image-picker'
import { v4 as uuidv4 } from 'uuid'

import data from './messages.json'

const user = { id: '06c33e8b-e835-4736-80f4-63f44b666664' }
const PURPLE = '#6B53E8'

const renderBubbleAdditionalInfo = ({
  message,
}: {
  message: MessageType.DerivedMessage
}) => {
  // const isAuther= user.id !== message.author.id
  if (message.nextMessageInGroup) {
    return null
  }
  return (
    <Text
      style={{
        fontSize: 10,
        marginHorizontal: 4,
        color: '#bbbbbb',
        // paddingBottom: 4,
      }}
    >
      {dayjs(message.createdAt).format('HH:mm')}
    </Text>
  )
}
const renderBubble = ({
  child,
  message,
  nextMessageInGroup,
}: {
  child: React.ReactNode
  message: MessageType.Any
  nextMessageInGroup: boolean
}) => {
  return (
    <View
      style={{
        backgroundColor: user.id !== message.author.id ? '#ffffff' : PURPLE,
        // borderBottomLeftRadius: !nextMessageInGroup && props.myProfile.id !== message.author.id ? 20 : 0,
        // borderBottomRightRadius: !nextMessageInGroup && props.myProfile.id === message.author.id ? 20 : 0,
        borderRadius: 16,
        borderColor: user.id !== message.author.id ? '#dddddd' : PURPLE,
        borderWidth: 1,
        overflow: 'hidden',
      }}
    >
      {child}
      {user.id !== message.author.id && !nextMessageInGroup ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            paddingLeft: 8,
            paddingBottom: 4,
          }}
        >
          <Text style={{ fontSize: 12, color: '#bbbbbb' }}>
            {message.author.firstName}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const App = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const [messages, setMessages] = useState(data as MessageType.Any[])

  const addMessage = (message: MessageType.Any) => {
    setMessages([message, ...messages])
  }

  const handleAttachmentPress = () => {
    showActionSheetWithOptions(
      {
        options: ['Photo', 'File', 'Cancel'],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            handleImageSelection()
            break
          case 1:
            handleFileSelection()
            break
        }
      }
    )
  }

  const handleFileSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      })
      const fileMessage: MessageType.File = {
        author: user,
        createdAt: Date.now(),
        id: uuidv4(),
        mimeType: response.type ?? undefined,
        name: response.name,
        size: response.size ?? 0,
        type: 'file',
        uri: response.uri,
      }
      addMessage(fileMessage)
    } catch {}
  }

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        includeBase64: true,
        maxWidth: 1440,
        mediaType: 'photo',
        quality: 0.7,
      },
      ({ assets }) => {
        const response = assets?.[0]

        if (response?.base64) {
          const imageMessage: MessageType.Image = {
            author: user,
            createdAt: Date.now(),
            height: response.height,
            id: uuidv4(),
            name: response.fileName ?? response.uri?.split('/').pop() ?? '🖼',
            size: response.fileSize ?? 0,
            type: 'image',
            uri: `data:image/*;base64,${response.base64}`,
            width: response.width,
          }
          addMessage(imageMessage)
        }
      }
    )
  }

  const handleMessagePress = async (message: MessageType.Any) => {
    if (message.type === 'file') {
      try {
        await FileViewer.open(message.uri, { showOpenWithDialog: true })
      } catch {}
    }
  }

  const handlePreviewDataFetched = ({
    message,
    previewData,
  }: {
    message: MessageType.Text
    previewData: PreviewData
  }) => {
    setMessages(
      messages.map<MessageType.Any>((m) =>
        m.id === message.id ? { ...m, previewData } : m
      )
    )
  }

  const handleSendPress = (message: MessageType.PartialText) => {
    const textMessage: MessageType.Text = {
      author: user,
      createdAt: Date.now(),
      id: uuidv4(),
      text: message.text,
      type: 'text',
    }
    addMessage(textMessage)
  }

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          marginTop: 100,
          // borderRadius: 16,
          // overflow: 'hidden',
          backgroundColor: 'blue',
          // marginHorizontal: 4,
        }}
      >
        <Chat
          customDateHeaderText={(dateTime) => {
            return dayjs(dateTime).format('MMM DD, YYYY')
          }}
          messages={messages}
          onAttachmentPress={handleAttachmentPress}
          onMessagePress={handleMessagePress}
          onPreviewDataFetched={handlePreviewDataFetched}
          onSendPress={handleSendPress}
          user={user}
          showUserAvatars={true}
          onPressAvatar={(author) => {
            console.log('adfs')
            console.log(author)
          }}
          renderBubble={renderBubble}
          renderBubbleAdditionalInfo={(message) =>
            renderBubbleAdditionalInfo({ message: message })
          }
          theme={{
            ...defaultTheme,
            insets: {
              ...defaultTheme.insets,
              messageInsetsVertical: 6,
              messageInsetsHorizontal: 8,
            },
            colors: {
              ...defaultTheme.colors,
              primary: '#1d1c21',
              inputText: '#000000',
              userAvatarNameColors: ['#dddddd'],
            },
            fonts: {
              ...defaultTheme.fonts,
              sentMessageBodyTextStyle: {
                ...defaultTheme.fonts.sentMessageBodyTextStyle,
                fontSize: 14,
                fontWeight: 'normal',
              },
              receivedMessageBodyTextStyle: {
                ...defaultTheme.fonts.receivedMessageBodyTextStyle,
                fontSize: 14,
                fontWeight: 'normal',
              },
              dateDividerTextStyle: {
                ...defaultTheme.fonts.dateDividerTextStyle,
                fontSize: 12,
                fontWeight: 'normal',
              },
            },
          }}
          textInputProps={{
            placeholderTextColor: '#bbbbbb',
            placeholder: 'Type a message...',
          }}
          inputStyle={{
            paddingVertical: 8,
            backgroundColor: '#EDF1F7',
            borderRadius: 8,
            borderWidth: 0.5,
            borderColor: '#E4E9F2',
          }}
          keyboardAccessoryViewStyle={{
            backgroundColor: '#EDF1F7',
          }}
        />
      </View>
    </View>
  )
}

export default App
