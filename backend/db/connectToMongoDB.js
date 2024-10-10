import mongoose from "mongoose";

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI);
		console.log("Server Connected to Database 🚀");
	} catch (error) {
		console.log("Error connecting to Database", error.message);
	}
};

export default connectToMongoDB;
