// userController.js
const userLogics = require('../logics/userLogics');
const authPkg = require('@clerk/clerk-sdk-node');

const { sessions, users } = authPkg;

const userDetails = async (req, res) => {
    let emailId = null
    if (req.header("session")) {
        const userId = (await sessions.getSession(req.header("session"))).userId;
        emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;
    }
    const identifier = req.header('lenderId') || emailId;

    try {
        if (!identifier) {
            return res.status(400).send({ message: "lender id or email not provided" });
        }

        const docs = await userLogics.Lenders.findById(identifier);

        if (!docs) {
            return res.status(404).send({ message: "User not found" });
        }

        return res.status(200).send({ result: docs });
    } catch (error) {
        console.error('Error in obtaining user details', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateUser = async (req, res) => {
    let emailId = null
    if (req.header("session")) {
        const userId = (await sessions.getSession(req.header("session"))).userId;
        emailId = (await users.getUser(userId)).emailAddresses[0].emailAddress;
    }
    const identifier = req.header('lenderId') || emailId;

    const updatedData = req.body; // Assuming the updated data is sent in the request body

    try {
        if (!identifier) {
            return res.status(400).send({ message: "lender id or email not provided" });
        }

        const updatedUser = await userLogics.Lenders.updateUser(identifier, updatedData);

        if (!updatedUser) {
            return res.status(404).send({ message: "User not found for updating" });
        }

        return res.status(200).send({ result: updatedUser });
    } catch (error) {
        console.error('Error in updating user details', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    userDetails,
    updateUser
};
