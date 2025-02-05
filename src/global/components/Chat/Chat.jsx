import React, { useState, useEffect } from 'react';
import { Widget, addResponseMessage, addUserMessage, dropMessages } from '@ryaneewx/react-chat-widget';
import { db } from '../../../../firebase.config';
import { collection, addDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import Modal from '../Modal/Modal';
import Logo from '../../assets/LogoOutline.svg';
import './styles.css';

function Chat({ postId, authorId, currentUser, author }) {
	const [messages, setMessages] = useState([]);

	useEffect(() => {
		const unsubscribe = onSnapshot(query(collection(db, 'chats', postId, 'messages'), orderBy('timestamp')), (snapshot) => {
			const newMessages = snapshot.docs.map((doc) => doc.data());
			setMessages(newMessages);
		});

		return () => unsubscribe(); // Cleanup function
	}, [postId, currentUser]);

	const handleNewUserMessage = async (newMessage) => {
		try {
			const messagesRef = collection(db, 'chats', postId, 'messages');
			await addDoc(messagesRef, {
				text: newMessage,
				senderId: currentUser.uid,
				timestamp: serverTimestamp(),
			});
		} catch (error) {
			return <Modal success={false} title='Error' content={error.message} />;
		}
	};

	// Send initial messages to the chat widget when component mounts
	useEffect(() => {
		dropMessages();
		messages.forEach((message) => {
			if (message.senderId === currentUser.uid) {
				addUserMessage(message.text);
			} else {
				addResponseMessage(message.text);
			}
		});
	}, [messages]);

	// Custom launcher for the chat widget
	const getCustomLauncher = (handleToggle) => (
		<button onClick={handleToggle} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
			<i className='bx bx-message bx-sm' style={{ marginTop: '8px', marginRight: '0.5rem' }}></i>
			Chat about this pet
		</button>
	);

	return (
		<Widget
			handleNewUserMessage={handleNewUserMessage}
			profileAvatar={Logo}
			title={`Chat with ${author.firstName} ${author.lastName}`}
			subtitle='Start chatting!'
			showCloseButton={true}
			fullScreenMode={false}
			showTimeStamps={false}
			showBadge={false}
			launcher={getCustomLauncher}
		/>
	);
}

export default Chat;
