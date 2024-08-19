import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

const connectSocket = (urls, query) => {
	for (const url of urls) {
		const socket = io(url, { query });

		// Listen for connection event to see if the socket successfully connects
		socket.on("connect", () => {
			console.log(`Connected to socket server at ${url}`);
			return socket;
		});

		// Listen for connection error and attempt next URL if connection fails
		socket.on("connect_error", (error) => {
			console.error(`Failed to connect to ${url}: ${error.message}`);
			socket.close();
		});
	}

	return null;
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();

	useEffect(() => {
		if (authUser) {
			const urls = [
				"https://twintalks.up.railway.app", // Primary (Production)
				"https://twintalks.onrender.com",  // Secondary (Staging)
			];

			const newSocket = connectSocket(urls, { userId: authUser._id });
			setSocket(newSocket);

			if (newSocket) {
				newSocket.on("getOnlineUsers", (users) => {
					setOnlineUsers(users);
				});
			}

			return () => {
				if (newSocket) {
					newSocket.close();
				}
			};
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser]);

	return (
		<SocketContext.Provider value={{ socket, onlineUsers }}>
			{children}
		</SocketContext.Provider>
	);
};
