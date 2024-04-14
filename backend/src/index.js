import connectDB from "./db/index.js";
import { app } from "./app.js";


connectDB()
.then(() => {
    try {
        app.on("error", (error) => {
            console.log(error);
            throw error;
        })

        app.listen(process.env.PORT || 8000, () => {
            console.log("App lisening to port " + process.env.PORT);
        })
    } catch (error) {
        console.log(error);
    }
})
.catch((err) => {
    console.log("Connection to DB Failed");
})